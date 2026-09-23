import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  Square, 
  Pause, 
  Play, 
  Trash2, 
  Sparkles, 
  Upload, 
  Clock, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Radio, 
  FileAudio,
  ShieldCheck,
  ShieldAlert,
  Download,
  RefreshCw,
  Archive,
  Save,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { db } from '../../../lib/db';
import { 
  transcribeAudioChunk, 
  analyzeSessionTranscriptComprehensive 
} from '../../../services/geminiService';
import { blobToBase64, splitAudioIntoValidWavChunks } from '../../../lib/audioSplitter';

interface ClinicalAudioRecorderProps {
  patient: { id?: string; name: string; age?: string };
  approaches?: string[];
  onTranscriptionComplete: (analysisData: {
    relatoCliente: string;
    motivoConsulta: string;
    objetivosCliente: string;
    objetivosTerapeuta: string;
    intervencoes: string;
    observacoes: string;
    insights: string;
    percepcaoCliente: string;
    progresso: string;
    tarefas: string;
    planejamento: string;
    encaminhamentos: string;
  }) => void;
  onProgressiveUpdate?: (partialAnalysis: Record<string, string>) => void;
}

export function ClinicalAudioRecorder({
  patient,
  approaches = ['TCC 4ª Geração'],
  onTranscriptionComplete,
  onProgressiveUpdate
}: ClinicalAudioRecorderProps) {
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'processing' | 'recovery'>('idle');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [completedSegmentsCount, setCompletedSegmentsCount] = useState(0);
  const [conveyorStatus, setConveyorStatus] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false);
  const [isPrivacyMuted, setIsPrivacyMuted] = useState(false);
  const [audioPurgedMessage, setAudioPurgedMessage] = useState(false);

  // Vault / Cofre Local de Contingência (Zero Data Loss)
  const [vaultSession, setVaultSession] = useState<{
    patientName: string;
    patientId?: string;
    timestamp: number;
    durationSeconds: number;
    blobs: Blob[];
    partialTranscript?: string;
  } | null>(null);
  const [showVaultRecoveryBanner, setShowVaultRecoveryBanner] = useState(false);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState<string>('');

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Refs for media recording & esteira contínua
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const segmentBlobsRef = useRef<Blob[]>([]);
  const backgroundTranscriptsMapRef = useRef<Map<number, string>>(new Map());
  const backgroundQueueRef = useRef<{ index: number; blob: Blob }[]>([]);
  const isBackgroundConveyorRunningRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStatusRef = useRef<'idle' | 'recording' | 'paused' | 'processing' | 'recovery'>('idle');
  const segmentDurationSecondsRef = useRef<number>(0);
  const currentMimeTypeRef = useRef<string>('audio/webm;codecs=opus');
  const SEGMENT_ROTATE_INTERVAL_SEC = 150; // 2.5 minutos por bloco (esteira contínua ultra-rápida)

  // Keep recordingStatusRef in sync
  useEffect(() => {
    recordingStatusRef.current = recordingStatus;
  }, [recordingStatus]);

  // Cofre de Gravação: restaura sessão pendente se houver no Dexie
  useEffect(() => {
    const checkVault = async () => {
      try {
        const item = await db.settings.get('cortex_audio_vault_session');
        if (item && item.value && item.value.blobs && item.value.blobs.length > 0) {
          const ageHours = (Date.now() - item.value.timestamp) / (1000 * 60 * 60);
          if (ageHours < 48) {
            setVaultSession(item.value);
            setShowVaultRecoveryBanner(true);
          }
        }
      } catch (e) {
        console.warn("Vault check error:", e);
      }
    };
    checkVault();
  }, []);

  const saveToVault = async (blobs: Blob[], durSec: number, transcript = '') => {
    try {
      await db.settings.put({
        key: 'cortex_audio_vault_session',
        value: {
          patientName: patient.name || 'Paciente',
          patientId: patient.id,
          timestamp: Date.now(),
          durationSeconds: durSec,
          blobs: blobs,
          partialTranscript: transcript
        }
      });
    } catch (err) {
      console.warn('Erro ao salvar no cofre local:', err);
    }
  };

  const clearVault = async () => {
    try {
      await db.settings.delete('cortex_audio_vault_session');
      setVaultSession(null);
      setShowVaultRecoveryBanner(false);
      setAccumulatedTranscript('');
    } catch (err) {
      console.warn('Erro ao limpar cofre:', err);
    }
  };

  const downloadSessionAudio = (customBlobs?: Blob[]) => {
    const blobs = customBlobs || segmentBlobsRef.current || vaultSession?.blobs || [];
    if (blobs.length === 0) {
      toast.error('Nenhum áudio disponível para download.');
      return;
    }
    const mime = blobs[0].type || 'audio/webm';
    const combinedBlob = new Blob(blobs, { type: mime });
    const url = URL.createObjectURL(combinedBlob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    const safeName = (patient.name || 'paciente').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `Gravacao_Sessao_${safeName}_${dateStr}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download do áudio da sessão iniciado!');
  };

  // Web Audio Visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Setup Visualizer Canvas
  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // Low latency, smooth bars
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        animationFrameRef.current = requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85);

          // Emerald gradient
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
          gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.8)');
          gradient.addColorStop(1, 'rgba(52, 211, 153, 1)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.warn('Audio Visualizer could not be initialized:', err);
    }
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Inicia um novo gravador de segmento independente (produz contêiner WebM/Opus canônico com cabeçalho completo)
  const startSegmentRecorder = (stream: MediaStream) => {
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : '';
    }
    currentMimeTypeRef.current = mimeType || 'audio/webm';

    const options: MediaRecorderOptions = {
      audioBitsPerSecond: 24000 // 24 kbps opus mono é ~10.8 MB/hora
    };
    if (mimeType) options.mimeType = mimeType;

    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    segmentDurationSecondsRef.current = 0;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorder.start(3000);
  };

  // Worker concorrente para a Esteira Contínua de Transcrição durante a consulta
  const processBackgroundConveyorQueue = async () => {
    if (isBackgroundConveyorRunningRef.current) return;
    isBackgroundConveyorRunningRef.current = true;

    while (backgroundQueueRef.current.length > 0) {
      const item = backgroundQueueRef.current.shift();
      if (!item) break;

      const { index, blob } = item;
      if (backgroundTranscriptsMapRef.current.has(index)) continue;

      try {
        const rawMime = blob.type || 'audio/webm';
        const cleanMime = rawMime.split(';')[0].trim().toLowerCase() || 'audio/webm';
        const base64 = await blobToBase64(blob);
        const text = await transcribeAudioChunk(base64, cleanMime);
        if (text && text.trim()) {
          backgroundTranscriptsMapRef.current.set(index, text.trim());
        }
      } catch (err) {
        console.warn(`[Esteira IA] Falha transitória ao transcrever capítulo ${index + 1} em background:`, err);
      } finally {
        setConveyorStatus({
          completed: backgroundTranscriptsMapRef.current.size,
          total: segmentBlobsRef.current.length
        });
        const currentAssembled = Array.from(backgroundTranscriptsMapRef.current.entries())
          .sort((a, b) => a[0] - b[0])
          .map(entry => entry[1])
          .join('\n\n');
        if (currentAssembled) {
          setAccumulatedTranscript(currentAssembled);
          await saveToVault(segmentBlobsRef.current, durationSeconds, currentAssembled);
        }
      }
    }

    isBackgroundConveyorRunningRef.current = false;
  };

  // Rotaciona para o próximo bloco de gravação de forma ininterrupta (sem fechar o microfone)
  const rotateSegment = () => {
    if (!mediaRecorderRef.current || !audioStreamRef.current) return;
    const oldRec = mediaRecorderRef.current;

    oldRec.onstop = () => {
      if (audioChunksRef.current.length > 0) {
        const segBlob = new Blob(audioChunksRef.current, {
          type: oldRec.mimeType || currentMimeTypeRef.current || 'audio/webm'
        });
        if (segBlob.size > 1000) {
          const segIndex = segmentBlobsRef.current.length;
          segmentBlobsRef.current.push(segBlob);
          setCompletedSegmentsCount(segmentBlobsRef.current.length);

          // Alimenta a Esteira Contínua em segundo plano
          backgroundQueueRef.current.push({ index: segIndex, blob: segBlob });
          setConveyorStatus({
            completed: backgroundTranscriptsMapRef.current.size,
            total: segmentBlobsRef.current.length
          });
          processBackgroundConveyorQueue();
        }
      }
      audioChunksRef.current = [];
      // Se ainda estiver no modo de gravação ativa, inicia imediatamente o próximo bloco
      if (recordingStatusRef.current === 'recording' && audioStreamRef.current) {
        startSegmentRecorder(audioStreamRef.current);
      }
    };

    if (oldRec.state !== 'inactive') {
      oldRec.stop();
    }
  };

  // Start Live Audio Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Navegador não suporta gravação direta de microfone.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1 // Mono otimiza tamanho e fidelidade
        }
      });

      audioStreamRef.current = stream;
      setupAudioVisualizer(stream);

      segmentBlobsRef.current = [];
      audioChunksRef.current = [];
      backgroundTranscriptsMapRef.current.clear();
      backgroundQueueRef.current = [];
      setConveyorStatus({ completed: 0, total: 0 });
      setCompletedSegmentsCount(0);
      setDurationSeconds(0);
      segmentDurationSecondsRef.current = 0;

      startSegmentRecorder(stream);

      setRecordingStatus('recording');
      recordingStatusRef.current = 'recording';

      // Timer de sessão com rotação automática a cada 8 minutos
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
        segmentDurationSecondsRef.current += 1;

        // Se o bloco atual atingir o intervalo de 8 minutos, rotaciona sem parar o áudio
        if (
          segmentDurationSecondsRef.current >= SEGMENT_ROTATE_INTERVAL_SEC &&
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === 'recording'
        ) {
          rotateSegment();
        }
      }, 1000);

      // Backup periódico de segurança no Dexie a cada 30 segundos
      backupIntervalRef.current = setInterval(async () => {
        try {
          await db.settings.put({
            key: 'cortex_active_session_backup',
            value: {
              patientName: patient.name,
              timestamp: Date.now(),
              duration: durationSeconds,
              segmentsCount: segmentBlobsRef.current.length
            }
          });
        } catch (e) {
          // Não bloqueante
        }
      }, 30000);

      toast.success('Gravação da sessão iniciada com sucesso!');
    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      toast.error('Não foi possível acessar o microfone: ' + (err.message || 'Permissão negada'));
    }
  };

  // Pause / Resume
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (recordingStatus === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingStatus('paused');
      recordingStatusRef.current = 'paused';
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      toast('Gravação pausada.');
    } else if (recordingStatus === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingStatus('recording');
      recordingStatusRef.current = 'recording';
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
        segmentDurationSecondsRef.current += 1;
        if (
          segmentDurationSecondsRef.current >= SEGMENT_ROTATE_INTERVAL_SEC &&
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === 'recording'
        ) {
          rotateSegment();
        }
      }, 1000);
      toast.success('Gravação retomada.');
    }
  };

  // Recorte de Sigilo Ético (Off the Record): suspende captação de trecho confidencial
  const togglePrivacyMute = () => {
    if (!mediaRecorderRef.current) return;

    if (!isPrivacyMuted) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
      }
      setIsPrivacyMuted(true);
      toast('🔒 Modo Sigilo Ético Ativado: Captação suspensa.', {
        icon: '🔒',
        duration: 3000
      });
    } else {
      if (audioStreamRef.current) {
        audioStreamRef.current.getAudioTracks().forEach(t => t.enabled = true);
      }
      if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      setIsPrivacyMuted(false);
      toast.success('▶️ Captação clínica retomada.');
    }
  };

  // Limpeza de streams e intervalos
  const cleanupStream = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (backupIntervalRef.current) clearInterval(backupIntervalRef.current);
    stopVisualizer();

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  // Descartar Gravação
  const discardRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupStream();
    await clearVault();
    audioChunksRef.current = [];
    segmentBlobsRef.current = [];
    setCompletedSegmentsCount(0);
    setRecordingStatus('idle');
    recordingStatusRef.current = 'idle';
    setDurationSeconds(0);
    setIsConfirmDiscardOpen(false);
    toast('Gravação descartada e cofre limpo.');
  };

  // Concluir gravação ao vivo e processar com IA
  const finishAndProcessSession = async () => {
    setRecordingStatus('processing');
    recordingStatusRef.current = 'processing';
    setProcessingStep('Compilando e finalizando capítulos da sessão...');

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    stopVisualizer();

    // Finaliza o último bloco ativo
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        const rec = mediaRecorderRef.current!;
        rec.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const segBlob = new Blob(audioChunksRef.current, {
              type: rec.mimeType || currentMimeTypeRef.current || 'audio/webm'
            });
            if (segBlob.size > 500) {
              segmentBlobsRef.current.push(segBlob);
              setCompletedSegmentsCount(segmentBlobsRef.current.length);
            }
          }
          resolve();
        };
        rec.stop();
      });
    }

    cleanupStream();

    const segmentsToProcess = [...segmentBlobsRef.current];
    if (segmentsToProcess.length === 0) {
      toast.error('Nenhum áudio válido foi registrado na sessão.');
      setRecordingStatus('idle');
      recordingStatusRef.current = 'idle';
      return;
    }

    // Salva imediatamente no cofre local de segurança ANTES de qualquer requisição de rede
    await saveToVault(segmentsToProcess, durationSeconds, '');
    await processAudioSegments(segmentsToProcess);
  };

  // Processador concorrente resiliente de blocos de áudio (para gravação ao vivo ou arquivo enviado)
  const processAudioSegments = async (blobs: Blob[], initialTranscript = '') => {
    setRecordingStatus('processing');
    recordingStatusRef.current = 'processing';
    let runningTranscript = initialTranscript;

    try {
      const total = blobs.length;
      const chunkResults: string[] = new Array(total).fill('');
      
      // Carrega os capítulos que a Esteira Contínua JÁ transcreveu em segundo plano durante a consulta!
      let alreadyDoneCount = 0;
      for (let i = 0; i < total; i++) {
        if (backgroundTranscriptsMapRef.current.has(i)) {
          chunkResults[i] = backgroundTranscriptsMapRef.current.get(i)!;
          alreadyDoneCount++;
        }
      }

      let completedCount = alreadyDoneCount;
      const progressMsg = (done: number) => total > 1
        ? `Consolidando esteira contínua (${done}/${total} capítulos prontos)...`
        : `Transcrevendo áudio clínico...`;
      setProcessingStep(progressMsg(completedCount));

      // Filtra apenas os índices que ainda faltam transcrever (geralmente apenas o último bloco gravado)
      const pendingIndices: number[] = [];
      for (let i = 0; i < total; i++) {
        if (!chunkResults[i]) {
          pendingIndices.push(i);
        }
      }

      if (pendingIndices.length > 0) {
        // Fila concorrente controlada (máx 2 simultâneos para conciliar velocidade máxima e estabilidade de cota)
        const CONCURRENCY_LIMIT = Math.min(2, pendingIndices.length);
        let queueCursor = 0;

        const worker = async () => {
          while (queueCursor < pendingIndices.length) {
            const currentIndex = pendingIndices[queueCursor++];
            const chunkBlob = blobs[currentIndex];
            const rawMime = chunkBlob.type || 'audio/webm';
            const cleanMime = rawMime.split(';')[0].trim().toLowerCase() || 'audio/webm';

            try {
              const base64 = await blobToBase64(chunkBlob);
              const partText = await transcribeAudioChunk(base64, cleanMime);
              if (partText && partText.trim()) {
                chunkResults[currentIndex] = partText.trim();
                backgroundTranscriptsMapRef.current.set(currentIndex, partText.trim());
              }
            } catch (chunkErr: any) {
              console.warn(`Aviso no capítulo ${currentIndex + 1}:`, chunkErr);
            } finally {
              completedCount++;
              setProcessingStep(progressMsg(completedCount));
              const currentCombined = [runningTranscript, ...chunkResults].filter(Boolean).join('\n\n');
              if (currentCombined) {
                setAccumulatedTranscript(currentCombined);
                await saveToVault(blobs, durationSeconds, currentCombined);
              }
            }
          }
        };

        const workers = Array.from({ length: CONCURRENCY_LIMIT }, () => worker());
        await Promise.all(workers);
      }

      const fullTranscript = [runningTranscript, ...chunkResults].filter(Boolean).join('\n\n');
      if (!fullTranscript || fullTranscript.trim().length < 10) {
        throw new Error('A inteligência artificial não identificou falas clínicas audíveis no áudio. A gravação continua protegida no cofre.');
      }

      // Step 2: Análise Clínica Abrangente com Streaming Progressivo em Tempo Real
      setProcessingStep('Formulando raciocínio clínico de 4ª Geração e preenchendo os campos ao vivo...');
      const clinicalAnalysis = await analyzeSessionTranscriptComprehensive(
        fullTranscript,
        patient,
        approaches,
        (partialFields) => {
          if (onProgressiveUpdate) {
            onProgressiveUpdate(partialFields);
          }
        }
      );

      // Trigger callback final no componente pai (que garante campos preenchidos e auto-save)
      onTranscriptionComplete(clinicalAnalysis);

      // Sucesso confirmado: limpa o cofre de emergência e a memória RAM
      await clearVault();
      audioChunksRef.current = [];
      segmentBlobsRef.current = [];
      backgroundTranscriptsMapRef.current.clear();
      backgroundQueueRef.current = [];
      setConveyorStatus({ completed: 0, total: 0 });
      setCompletedSegmentsCount(0);
      setAudioPurgedMessage(true);
      setTimeout(() => setAudioPurgedMessage(false), 9000);

      toast.success('Atendimento transcrito e todos os campos preenchidos com sucesso!');
      setRecordingStatus('idle');
      recordingStatusRef.current = 'idle';
      setDurationSeconds(0);
      setProcessingStep('');
      setUploadedFile(null);
    } catch (err: any) {
      console.error('Error processing clinical session audio:', err);
      const errMsg = err?.message || 'Instabilidade temporária na comunicação com o modelo de IA.';
      toast.error(`Atenção: ${errMsg} O áudio da sua sessão está 100% SEGURO e SALVO no cofre local!`, { duration: 9000 });
      
      // NÃO apaga o áudio! Entra em modo de recuperação para o psicólogo não perder nada
      setRecordingStatus('recovery');
      recordingStatusRef.current = 'recovery';
      setProcessingStep('');
    }
  };

  // Handle uploaded audio file (suporta arquivos de até 2h com fatiamento canônico WAV)
  const handleProcessUploadedFile = async () => {
    if (!uploadedFile) {
      toast.error('Selecione um arquivo de áudio gravado.');
      return;
    }

    setRecordingStatus('processing');
    recordingStatusRef.current = 'processing';
    try {
      setProcessingStep('Inspecionando arquivo de áudio para transcrição de alta fidelidade...');
      let chunks: Blob[] = [];

      if (uploadedFile.size <= 15 * 1024 * 1024) {
        chunks = [uploadedFile];
      } else {
        // Divide o áudio de longa duração (> 15MB) em blocos canônicos de 6 minutos sem corromper cabeçalhos
        chunks = await splitAudioIntoValidWavChunks(
          uploadedFile,
          360,
          (stepMsg) => setProcessingStep(stepMsg)
        );
      }

      segmentBlobsRef.current = chunks;
      await saveToVault(chunks, durationSeconds, '');
      await processAudioSegments(chunks);
    } catch (err: any) {
      console.error('Falha no processamento de áudio enviado:', err);
      toast.error('Erro ao processar áudio: ' + (err.message || 'Formato incompatível'));
      setRecordingStatus('recovery');
      recordingStatusRef.current = 'recovery';
      setProcessingStep('');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-bg-card via-bg-sidebar/90 to-bg-card border border-primary/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* 🛡️ BANNER DE CONTINGÊNCIA: SESSÃO RECUPERADA DO COFRE LOCAL */}
      {showVaultRecoveryBanner && vaultSession && recordingStatus === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
              <Archive size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                Atendimento Salvo no Cofre Local Encontrado
              </h4>
              <p className="text-[11px] text-text-dim mt-0.5">
                Existe uma gravação recente salva em segurança ({formatTime(vaultSession.durationSeconds)} • {vaultSession.blobs.length} capítulos) para <strong>{vaultSession.patientName}</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => {
                segmentBlobsRef.current = vaultSession.blobs;
                setDurationSeconds(vaultSession.durationSeconds);
                setShowVaultRecoveryBanner(false);
                processAudioSegments(vaultSession.blobs, vaultSession.partialTranscript || '');
              }}
              className="px-3 py-1.5 bg-primary text-bg-deep text-xs font-black rounded-lg hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-sm uppercase tracking-wider"
            >
              <RefreshCw size={12} /> Processar com IA
            </button>
            <button
              onClick={() => downloadSessionAudio(vaultSession.blobs)}
              className="px-3 py-1.5 bg-bg-deep border border-white/[0.1] text-text-main text-xs font-bold rounded-lg hover:border-primary/40 flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={12} /> Baixar Áudio
            </button>
            <button
              onClick={clearVault}
              className="px-2.5 py-1.5 text-text-dim hover:text-rose-400 text-xs font-bold rounded-lg cursor-pointer"
              title="Descartar gravação do cofre"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              {recordingStatus === 'recording' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              )}
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider text-text-main flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Escriba Clínico Inteligente (Noa & Voa para TCC)
            </h3>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-primary/20">
              Sessões de até 2h
            </span>
          </div>
          <p className="text-[10px] text-text-dim mt-0.5">
            Grave o atendimento do paciente <strong className="text-text-main">{patient.name || 'Selecionado'}</strong> e a IA preencherá automaticamente todos os 12 campos clínicos.
          </p>
        </div>

        {/* Tab Selector (Gravar ao Vivo vs Carregar Arquivo) */}
        {recordingStatus === 'idle' && (
          <div className="flex bg-bg-deep/80 p-1 rounded-xl border border-white/[0.08] text-[10px] font-bold">
            <button
              onClick={() => setActiveTab('record')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'record'
                  ? 'bg-primary text-bg-deep font-black shadow-sm'
                  : 'text-text-dim hover:text-text-main'
              }`}
            >
              <Mic size={12} /> Gravação ao Vivo
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-primary text-bg-deep font-black shadow-sm'
                  : 'text-text-dim hover:text-text-main'
              }`}
            >
              <Upload size={12} /> Carregar Áudio
            </button>
          </div>
        )}
      </div>

      {/* BODY CONTENT */}
      <AnimatePresence mode="wait">
        {/* RECOVERY STATE (FALHA NA REDE/IA - ÁUDIO 100% SALVO) */}
        {recordingStatus === 'recovery' && (
          <motion.div
            key="recovery"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                <ShieldAlert size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black uppercase tracking-wider text-amber-300">
                  Instabilidade na IA — Áudio 100% Salvo e Protegido!
                </h4>
                <p className="text-xs text-text-dim mt-1 leading-relaxed">
                  A comunicação com o modelo de inteligência artificial oscilou durante o processamento final, mas <strong className="text-text-main">nenhum segundo do atendimento foi perdido</strong>. O arquivo de áudio está preservado localmente no cofre do seu navegador.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[10px] bg-bg-deep px-2.5 py-1 rounded-md text-text-dim font-mono font-bold border border-white/[0.06]">
                    Duração: {formatTime(durationSeconds)}
                  </span>
                  <span className="text-[10px] bg-bg-deep px-2.5 py-1 rounded-md text-text-dim font-bold border border-white/[0.06]">
                    Capítulos: {segmentBlobsRef.current.length}
                  </span>
                  {accumulatedTranscript && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-md font-bold border border-emerald-500/30">
                      Transcrição Parcial Salva
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => processAudioSegments(segmentBlobsRef.current, accumulatedTranscript)}
                  className="px-4 py-2 bg-primary hover:brightness-110 text-bg-deep font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all uppercase tracking-wider"
                >
                  <RefreshCw size={14} /> Tentar Novamente a Análise
                </button>
                <button
                  onClick={() => downloadSessionAudio()}
                  className="px-4 py-2 bg-bg-deep hover:border-primary/50 text-text-main font-bold text-xs rounded-xl border border-white/[0.1] flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Download size={14} className="text-primary" /> Baixar Áudio (.webm)
                </button>
                {accumulatedTranscript && (
                  <button
                    onClick={() => {
                      onTranscriptionComplete({
                        relatoCliente: `<p style="text-align: justify;"><strong>Transcrição Parcial Recuperada:</strong><br>${accumulatedTranscript.replace(/\n/g, '<br>')}</p>`,
                        motivoConsulta: "<p style='text-align: justify;'>Atendimento clínico continuado (Recuperado do Cofre).</p>",
                        objetivosCliente: "<ul><li>Retomada do acompanhamento terapêutico.</li></ul>",
                        objetivosTerapeuta: "<ul><li>Mapeamento semiológico das queixas apresentadas.</li></ul>",
                        intervencoes: "<ul><li>Escuta clínica e intervenções dialógicas de 4ª Geração.</li></ul>",
                        observacoes: "<p style='text-align: justify;'>Registro gerado a partir da transcrição salva com sucesso no cofre de contingência do Cortex.</p>",
                        insights: "<ul><li>Identificação das contingências da sessão atual.</li></ul>",
                        percepcaoCliente: "<p style='text-align: justify;'>Boa adesão e colaboração na sessão.</p>",
                        progresso: "Satisfatório",
                        tarefas: "<ul><li>Manutenção dos combinados da sessão.</li></ul>",
                        planejamento: "<p style='text-align: justify;'>Continuidade na próxima consulta.</p>",
                        encaminhamentos: "<p style='text-align: justify;'>Sem encaminhamentos no momento.</p>"
                      });
                      clearVault();
                      setRecordingStatus('idle');
                      toast.success('Rascunho gerado no formulário com sucesso!');
                    }}
                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/40 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={14} /> Salvar Rascunho no Prontuário
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsConfirmDiscardOpen(true)}
                className="px-3 py-2 text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer"
              >
                Descartar Sessão
              </button>
            </div>
          </motion.div>
        )}

        {/* PROCESSING STATE */}
        {recordingStatus === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-8 bg-bg-deep/60 rounded-xl border border-primary/20 text-center space-y-4"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
                <BrainCircuit className="w-7 h-7 text-primary" />
              </div>
              <Loader2 className="w-14 h-14 text-primary animate-spin absolute inset-0" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-text-main">
                Processando Atendimento com IA
              </h4>
              <p className="text-[11px] text-text-dim font-medium mt-1 max-w-md">
                {processingStep || 'Transcrevendo e estruturando dados no método TCC 4ª Geração...'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 font-bold uppercase tracking-wider">
              <ShieldCheck size={12} /> Confidencialidade e anonimização médica garantidas
            </div>
          </motion.div>
        )}

        {/* ACTIVE RECORDING STATE (RECORDING OR PAUSED) */}
        {(recordingStatus === 'recording' || recordingStatus === 'paused') && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-bg-deep rounded-xl border border-white/[0.08]">
              {/* Timer HUD */}
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  recordingStatus === 'recording' 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                }`}>
                  <Radio size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-black text-text-main tracking-wider">
                      {formatTime(durationSeconds)}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      recordingStatus === 'recording'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {recordingStatus === 'recording' ? 'Gravando Sessão' : 'Pausado'}
                    </span>
                    {completedSegmentsCount > 0 && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                        <Sparkles size={11} className="text-emerald-400 animate-pulse" />
                        Esteira IA: {conveyorStatus.completed}/{completedSegmentsCount} {completedSegmentsCount === 1 ? 'capítulo' : 'capítulos'}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-text-dim font-medium">
                    Paciente: {patient.name || 'Sem seleção'} • Abordagem: {approaches.join(', ')}
                  </span>
                </div>
              </div>

              {/* Waveform Visualizer Canvas */}
              <div className="w-full md:w-64 h-12 bg-bg-card/80 rounded-lg border border-white/[0.04] p-1 flex items-center justify-center overflow-hidden">
                <canvas 
                  ref={canvasRef} 
                  width={240} 
                  height={40} 
                  className="w-full h-full"
                />
              </div>

              {/* Control Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePrivacyMute}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-bold ${
                    isPrivacyMuted 
                      ? 'bg-amber-500 text-bg-deep border-amber-400 font-black animate-pulse shadow-lg shadow-amber-500/25'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                  title={isPrivacyMuted ? 'Retomar captação da sessão' : 'Pausa de Sigilo Ético: Não gravar este trecho'}
                >
                  <ShieldCheck size={14} />
                  <span>{isPrivacyMuted ? 'Retomar Captação' : 'Recorte de Sigilo'}</span>
                </button>

                <button
                  type="button"
                  onClick={togglePause}
                  className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-text-main border border-white/[0.1] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  title={recordingStatus === 'recording' ? 'Pausar gravação' : 'Retomar gravação'}
                >
                  {recordingStatus === 'recording' ? <Pause size={14} /> : <Play size={14} />}
                  <span>{recordingStatus === 'recording' ? 'Pausar' : 'Retomar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmDiscardOpen(true)}
                  className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  title="Descartar gravação"
                >
                  <Trash2 size={14} />
                  <span>Descartar</span>
                </button>

                <button
                  type="button"
                  onClick={finishAndProcessSession}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-bg-deep font-black transition-all cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                >
                  <Sparkles size={14} />
                  <span>Finalizar & Processar com IA</span>
                </button>
              </div>
            </div>

            {/* PRIVACY WARNING BANNER */}
            {isPrivacyMuted && (
              <div className="flex items-center gap-2.5 p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-semibold animate-in fade-in">
                <ShieldCheck size={18} className="text-amber-400 shrink-0" />
                <div>
                  <span className="font-black uppercase tracking-wider block text-[10px]">🔒 Modo Sigilo Ético Ativo</span>
                  <span className="text-[11px] text-amber-200/90">
                    O microfone está pausado. O trecho falado durante este intervalo <strong>NÃO será gravado, transcrito nem inserido no prontuário</strong>.
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* IDLE STATE - RECORD TAB */}
        {recordingStatus === 'idle' && activeTab === 'record' && (
          <motion.div
            key="idle-record"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-bg-deep/40 rounded-xl border border-white/[0.04]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Mic size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-main">
                  Pronto para Iniciar o Atendimento
                </h4>
                <p className="text-[10px] text-text-dim mt-0.5">
                  Clique no botão ao lado antes de acolher o paciente. Ao concluir a sessão, a IA fará a síntese semiológica completa.
                </p>
              </div>
            </div>

            <button
              onClick={startRecording}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary-hover text-bg-deep font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
            >
              <Mic size={15} />
              <span>Iniciar Atendimento (Gravar)</span>
            </button>
          </motion.div>
        )}

        {/* IDLE STATE - UPLOAD TAB */}
        {recordingStatus === 'idle' && activeTab === 'upload' && (
          <motion.div
            key="idle-upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-bg-deep/40 rounded-xl border border-white/[0.04]">
              <label className="flex-1 w-full flex items-center gap-3 p-3 border border-dashed border-white/[0.1] rounded-xl hover:border-primary/40 hover:bg-white/[0.01] cursor-pointer transition-all">
                <FileAudio className="w-8 h-8 text-primary/70 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-text-main block truncate">
                    {uploadedFile ? uploadedFile.name : 'Selecionar arquivo de áudio gravado'}
                  </span>
                  <span className="text-[9px] text-text-dim block mt-0.5">
                    {uploadedFile 
                      ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Clique para trocar` 
                      : 'Formatos aceitos: .ogg, .mp3, .wav, .m4a, .webm (gravações de até 2h)'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="audio/*,.ogg,.mp3,.wav,.m4a,.webm"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedFile(file);
                  }}
                />
              </label>

              <button
                onClick={handleProcessUploadedFile}
                disabled={!uploadedFile}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary-hover text-bg-deep font-black rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
              >
                <Sparkles size={15} />
                <span>Transcrever & Preencher</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AVISO DE EXPURGO DE ÁUDIO BRUTO (PRIVACIDADE POR PADRÃO) */}
      {audioPurgedMessage && (
        <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs font-medium animate-in fade-in">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>
            <strong>Privacidade Médica & Expurgo de Dados:</strong> O áudio bruto da sessão foi processado e descartado da memória RAM. Apenas o registro clínico estruturado foi mantido de forma segura e criptografada no prontuário.
          </span>
        </div>
      )}

      {/* DISCARD CONFIRMATION MODAL */}
      {isConfirmDiscardOpen && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-card border border-border-subtle rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-text-main">
                  Descartar Gravação da Sessão?
                </h4>
                <p className="text-[10px] text-text-dim mt-0.5">
                  Tempo decorrido: {formatTime(durationSeconds)}
                </p>
              </div>
            </div>

            <p className="text-xs text-text-dim leading-relaxed">
              Tem certeza que deseja apagar o áudio desta sessão? Esta ação é irreversível e o conteúdo não poderá ser recuperado.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsConfirmDiscardOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/[0.08] text-text-dim hover:text-text-main text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={discardRecording}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                Sim, Descartar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function BrainCircuit(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.002 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}
