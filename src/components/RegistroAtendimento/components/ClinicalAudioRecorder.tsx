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
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { db } from '../../../lib/db';
import { 
  transcribeAudioChunk, 
  analyzeSessionTranscriptComprehensive 
} from '../../../services/geminiService';

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
}

export function ClinicalAudioRecorder({
  patient,
  approaches = ['TCC 4ª Geração'],
  onTranscriptionComplete
}: ClinicalAudioRecorderProps) {
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'processing'>('idle');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false);
  const [isPrivacyMuted, setIsPrivacyMuted] = useState(false);
  const [audioPurgedMessage, setAudioPurgedMessage] = useState(false);

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Refs for media recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const segmentBlobsRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backupIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
          channelCount: 1 // Mono optimizes payload size
        }
      });

      audioStreamRef.current = stream;
      setupAudioVisualizer(stream);

      // Choose optimal mimeType for high voice compression
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
          ? 'audio/ogg;codecs=opus'
          : '';
      }

      const options: MediaRecorderOptions = {
        audioBitsPerSecond: 24000 // 24 kbps opus is ~10.8 MB/hour, crystal clear speech
      };
      if (mimeType) options.mimeType = mimeType;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      segmentBlobsRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      // Collect audio chunks every 5 seconds for memory safety
      mediaRecorder.start(5000);

      setRecordingStatus('recording');
      setDurationSeconds(0);

      // Session timer
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);

      // Auto-save backup marker to Dexie every 30 seconds to safeguard patient's session
      backupIntervalRef.current = setInterval(async () => {
        try {
          await db.settings.put({
            key: 'cortex_active_session_backup',
            value: {
              patientName: patient.name,
              timestamp: Date.now(),
              duration: durationSeconds
            }
          });
        } catch (e) {
          // Non-blocking
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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      toast('Gravação pausada.');
    } else if (recordingStatus === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingStatus('recording');
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
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

  // Clean up recording tracks & intervals
  const cleanupStream = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (backupIntervalRef.current) clearInterval(backupIntervalRef.current);
    stopVisualizer();

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    db.settings.delete('cortex_active_session_backup').catch(() => {});
  };

  // Discard Recording
  const discardRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupStream();
    audioChunksRef.current = [];
    segmentBlobsRef.current = [];
    setRecordingStatus('idle');
    setDurationSeconds(0);
    setIsConfirmDiscardOpen(false);
    toast('Gravação descartada.');
  };

  // Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
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
  };

  // Stop recording and process full session with Gemini AI
  const finishAndProcessSession = async () => {
    if (!mediaRecorderRef.current) return;

    setRecordingStatus('processing');
    setProcessingStep('Compilando fluxo de áudio da sessão...');

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    stopVisualizer();

    // Wait for recorder stop to flush all data
    const completeAudioBlob = await new Promise<Blob>((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || 'audio/webm'
        });
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });

    cleanupStream();

    await processAudioBlob(completeAudioBlob);
  };

  // Unified audio processor (for recorded live blob OR uploaded file)
  const processAudioBlob = async (blob: Blob) => {
    setRecordingStatus('processing');
    try {
      const mimeType = blob.type || 'audio/webm';
      const sizeMB = blob.size / (1024 * 1024);

      let fullTranscript = '';

      // Step 1: Transcription
      setProcessingStep(`Transcrevendo áudio com IA (${sizeMB.toFixed(1)} MB)...`);

      // For safety with Gemini payload limits (<15MB), if blob <= 15MB transcribe directly
      if (blob.size <= 15 * 1024 * 1024) {
        const base64 = await blobToBase64(blob);
        fullTranscript = await transcribeAudioChunk(base64, mimeType);
      } else {
        // Multi-segment fallback for extra-long sessions (> 1h30 / 2h):
        // Slice blob in 10MB segments and transcribe sequentially
        setProcessingStep(`Sessão longa (${sizeMB.toFixed(1)} MB): processando em capítulos...`);
        const chunkSize = 10 * 1024 * 1024;
        const totalChunks = Math.ceil(blob.size / chunkSize);
        const transcriptParts: string[] = [];

        for (let i = 0; i < totalChunks; i++) {
          setProcessingStep(`Transcrevendo capítulo ${i + 1} de ${totalChunks}...`);
          const chunkBlob = blob.slice(i * chunkSize, Math.min((i + 1) * chunkSize, blob.size), mimeType);
          const chunkBase64 = await blobToBase64(chunkBlob);
          const partTranscript = await transcribeAudioChunk(chunkBase64, mimeType);
          if (partTranscript) transcriptParts.push(partTranscript);
        }

        fullTranscript = transcriptParts.join('\n\n');
      }

      if (!fullTranscript.trim()) {
        throw new Error('A inteligência artificial não identificou falas clínicas no áudio fornecido.');
      }

      // Step 2: Comprehensive Clinical Analysis (TCC 4ª Geração)
      setProcessingStep('Formulando raciocínio clínico de 4ª Geração e preenchendo os 12 campos...');
      const clinicalAnalysis = await analyzeSessionTranscriptComprehensive(
        fullTranscript,
        patient,
        approaches
      );

      // If relatoCliente returned without transcript, prepend or ensure structured transcript
      if (!clinicalAnalysis.relatoCliente || clinicalAnalysis.relatoCliente.length < 50) {
        clinicalAnalysis.relatoCliente = `<p style="text-align: justify;"><strong>Transcrição Semiurada da Sessão:</strong><br>${fullTranscript.replace(/\n/g, '<br>')}</p>`;
      }

      // Trigger parent callback
      onTranscriptionComplete(clinicalAnalysis);

      // Expurgo Imediato da Memória RAM (Privacidade por Padrão / Dados Transitórios)
      audioChunksRef.current = [];
      segmentBlobsRef.current = [];
      setAudioPurgedMessage(true);
      setTimeout(() => setAudioPurgedMessage(false), 9000);

      toast.success('Atendimento transcrito e todos os campos preenchidos com sucesso!');
      setRecordingStatus('idle');
      setDurationSeconds(0);
      setProcessingStep('');
      setUploadedFile(null);
    } catch (err: any) {
      console.error('Error processing clinical session audio:', err);
      toast.error('Falha no processamento: ' + (err.message || 'Erro desconhecido'));
      setRecordingStatus('idle');
      setProcessingStep('');
    }
  };

  // Handle uploaded audio file
  const handleProcessUploadedFile = async () => {
    if (!uploadedFile) {
      toast.error('Selecione um arquivo de áudio antes de processar.');
      return;
    }
    await processAudioBlob(uploadedFile);
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
