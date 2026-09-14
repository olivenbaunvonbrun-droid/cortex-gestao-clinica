/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Divisor e Processador Resiliente de Áudio Clínico (Até 2 Horas)
 * Permite processamento de áudio sem corromper cabeçalhos de contêiner e sem estourar limites de payload da IA.
 */

// Converte Float32Array para Blob WAV mono PCM de 16 bits com cabeçalho RIFF canônico de 44 bytes
export function encodeWav(samples: Float32Array, sampleRate: number = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length (36 + data size)
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');

  // Format chunk identifier ('fmt ')
  writeString(view, 12, 'fmt ');
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // Channel count (1 for mono)
  view.setUint16(22, 1, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sampleRate * channels * bytesPerSample)
  view.setUint32(28, sampleRate * 2, true);
  // Block align (channels * bytesPerSample)
  view.setUint16(32, 2, true);
  // Bits per sample (16 bits)
  view.setUint16(34, 16, true);

  // Data chunk identifier ('data')
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples (Float32 [-1.0, 1.0] -> Int16 [-32768, 32767])
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Converte Blob para Base64 de forma eficiente
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      const base64 = res.split(',')[1] || res;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Divide qualquer arquivo de áudio (MP3, OGG, WAV, M4A, WebM) em blocos canônicos de WAV mono de 16kHz
 * garantindo integridade de cabeçalho, decodificação sem falhas e respeito ao limite de payload de 20MB.
 */
export async function splitAudioIntoValidWavChunks(
  fileOrBlob: Blob,
  maxChunkSeconds: number = 360, // 6 minutos por bloco (~11.5 MB WAV, ~15.3 MB base64)
  onProgress?: (step: string) => void
): Promise<Blob[]> {
  // Se for <= 15MB e for de tipo de áudio conhecido, podemos enviar diretamente
  if (fileOrBlob.size <= 15 * 1024 * 1024) {
    return [fileOrBlob];
  }

  if (onProgress) {
    onProgress('Decodificando áudio de longa duração para fatiamento de precisão...');
  }

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('O navegador não possui suporte ao Web Audio API para fatiamento de áudio.');
  }

  // Decodifica a 16000 Hz para economizar memória e otimizar transcrição com IA
  const audioContext = new AudioCtx({ sampleRate: 16000 });

  try {
    const arrayBuffer = await fileOrBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const sampleRate = audioBuffer.sampleRate;
    const totalSamples = audioBuffer.length;
    const duration = audioBuffer.duration;
    const numChannels = audioBuffer.numberOfChannels;

    // Extrai canais e converte para mono
    let monoData: Float32Array;
    if (numChannels === 1) {
      monoData = audioBuffer.getChannelData(0);
    } else {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      monoData = new Float32Array(totalSamples);
      for (let i = 0; i < totalSamples; i++) {
        monoData[i] = (left[i] + right[i]) / 2;
      }
    }

    const samplesPerChunk = maxChunkSeconds * sampleRate;
    const totalChunks = Math.ceil(totalSamples / samplesPerChunk);
    const wavBlobs: Blob[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * samplesPerChunk;
      const end = Math.min(start + samplesPerChunk, totalSamples);
      const chunkSamples = monoData.subarray(start, end);

      if (onProgress) {
        onProgress(`Gerando bloco de áudio canônico ${i + 1} de ${totalChunks} (${((end - start) / sampleRate / 60).toFixed(1)} min)...`);
      }

      const wavBlob = encodeWav(chunkSamples, sampleRate);
      wavBlobs.push(wavBlob);
    }

    return wavBlobs;
  } finally {
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }
  }
}
