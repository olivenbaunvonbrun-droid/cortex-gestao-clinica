import React, { useState, useRef, useEffect } from 'react';
import { X, Save, FileUp, Shield, CheckCircle2, AlertCircle, Trash2, FileText, ImageIcon, Globe, Mic, Square, Sparkles, MessageSquare, ListFilter, PlayCircle, Clock, ExternalLink } from 'lucide-react';
import { db, type Appointment, logAction } from '../../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getLocalDateString } from '../../lib/utils';
import RichTextEditor from '../RichTextEditor';
import { processClinicalAudio, clinicalInsight, charcotConsult, analyzeClinicalFiles } from '../../services/geminiService';

interface RegistrationModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ appointment, isOpen, onClose }: RegistrationModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const [notes, setNotes] = useState(appointment?.registroAtendimentoData?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState<{ id?: number, name: string, type: string, size: number, data: string }[]>([]);
  
  // AI States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [selectedApproach, setSelectedApproach] = useState('TCC');
  const [selectedMode, setSelectedMode] = useState<'Primeira Consulta' | 'Evolução'>('Evolução');
  const [abordagens, setAbordagens] = useState<string[]>(['TCC', 'Psicanálise', 'Humanismo', 'Junguiana', 'Focal', 'Fenomenologia']);
  const [audioSource, setAudioSource] = useState<'mic' | 'system'>('mic');
  const [audioDevices, setAudioDevices] = useState<{ id: string, label: string }[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [sessionTargetTime, setSessionTargetTime] = useState(50);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [sessionTimerActive, setSessionTimerActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Charcot States
  const [showCharcot, setShowCharcot] = useState(false);
  const [charcotQuery, setCharcotQuery] = useState('');
  const [charcotChat, setCharcotChat] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isCharcotLoading, setIsCharcotLoading] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAbordagens();
    loadAudioDevices();
    loadSessionDuration();
  }, []);

  const loadSessionDuration = async () => {
    const item = await db.settings.get('sessionDuration');
    if (item) setSessionTargetTime(item.value);
  };

  const loadAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices
        .filter(d => d.kind === 'audioinput')
        .map(d => ({ id: d.deviceId, label: d.label || `Microfone ${d.deviceId.slice(0, 5)}` }));
      setAudioDevices(inputs);
      if (inputs.length > 0 && !selectedDeviceId) setSelectedDeviceId(inputs[0].id);
    } catch (err) {
      console.error("Erro ao carregar dispositivos de áudio:", err);
    }
  };

  const loadAbordagens = async () => {
    const item = await db.settings.get('abordagens');
    if (item && Array.isArray(item.value)) {
      setAbordagens(item.value);
    }
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (sessionTimerActive) {
      t = setInterval(() => {
        setSessionElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [sessionTimerActive]);

  const formatSessionTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!appointment) return null;

  const startRecording = async () => {
    try {
      let stream: MediaStream;

      if (audioSource === 'system') {
        try {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
            audio: true,
            video: { displaySurface: 'browser' }
          });
          const audioTracks = displayStream.getAudioTracks();
          if (audioTracks.length === 0) {
            displayStream.getTracks().forEach(t => t.stop());
            throw new Error("Nenhum áudio de sistema selecionado. Certifique-se de marcar a opção 'Compartilhar áudio do sistema'.");
          }
          stream = new MediaStream(audioTracks);
        } catch (err: any) {
          if (err.name === 'NotAllowedError' || err.message.includes('disallowed by permissions policy')) {
            alert("A captura de áudio interno é restrita em modo de visualização. Clique no ícone 'Abrir em nova aba' no topo do Editor para desbloquear esta função.");
          } else {
            alert(`Erro ao acessar áudio do sistema: ${err.message}`);
          }
          throw err;
        }
      } else {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true 
          });
        } catch (err: any) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            alert("Permissão de microfone negada. Por favor, verique as configurações de privacidade do seu navegador e permita o acesso para continuar.");
          } else {
            alert(`Erro ao acessar microfone: ${err.message}`);
          }
          throw err;
        }
      }

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        processAudio(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessingAi(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await processClinicalAudio(base64, selectedApproach, selectedMode);
        
        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const formattedResult = `
          <hr style="border: 0; border-top: 1px solid #ffffff10; margin: 40px 0;">
          <div style="background: rgba(255,255,255,0.03); border-left: 4px solid #7c3aed; padding: 24px; border-radius: 0 16px 16px 0;">
            <p style="margin: 0 0 16px 0; color: #7c3aed; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">
              Sessão Gerada via IA • ${selectedApproach} • ${timestamp}
            </p>
            <div style="color: #cbd5e1; line-height: 1.8;">
              ${result.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p></p>
        `;
        setNotes(prev => prev + formattedResult);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Erro na transcrição:", err);
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleAnalyzeFiles = async () => {
    if (attachments.length === 0) return;
    setIsProcessingAi(true);
    try {
      const result = await analyzeClinicalFiles(attachments.map(a => ({ data: a.data, mimeType: a.type })));
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleCharcotQuery = async () => {
    if (!charcotQuery.trim()) return;
    setIsCharcotLoading(true);
    const userMsg = charcotQuery;
    setCharcotChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setCharcotQuery('');
    
    try {
      const context = `Paciente com registro de atendimento atual: ${notes}. Análises: ${aiAnalysis}`;
      const response = await charcotConsult(userMsg, context);
      setCharcotChat(prev => [...prev, { role: 'ai', content: response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCharcotLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          size: file.size,
          data: dataUrl
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (markAsCompleted: boolean = true) => {
    setIsSaving(true);
    try {
      const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
      
      await db.agendamentos.update(appointment.id, {
        registroAtendimentoData: { 
          notes,
          hasAttachments: attachments.length > 0,
          aiAnalysis,
          selectedApproach,
          selectedMode
        },
        status: markAsCompleted ? 'completed' : (appointment.status || 'pending')
      });

      for (const att of attachments) {
        await db.anexos.add({
          ownerId: appointment.pacienteId,
          ownerType: 'prontuario',
          nomeArquivo: att.name,
          tipoArquivo: att.type,
          conteudoArquivo: att.data
        });

        const record = await db.prontuarios.get(appointment.pacienteId);
        if (record) {
          const newEntry = {
            timestamp: Date.now(),
            data: getLocalDateString(new Date()),
            textoHtml: `<p><strong>Arquivo Anexado:</strong> ${att.name}</p>`,
            tipo: 'arquivo' as const,
            metadata: { fileName: att.name, fileType: att.type }
          };
          await db.prontuarios.update(appointment.pacienteId, {
            entradas: [newEntry, ...record.entradas]
          });
        }
      }

      if (notes.trim()) {
        const record = await db.prontuarios.get(appointment.pacienteId);
        if (record) {
          const newEntry = {
            timestamp: Date.now(),
            data: appointment.data,
            textoHtml: notes,
            tipo: 'evolucao' as const,
            metadata: { 
              appointmentId: appointment.id,
              approach: selectedApproach,
              mode: selectedMode,
              aiAnalysis
            }
          };
          
          await db.prontuarios.update(appointment.pacienteId, {
            entradas: [newEntry, ...record.entradas]
          });
        }
      }

      logAction(currentUser, `Registrou atendimento (${selectedMode}/${selectedApproach}) para agendamento ${appointment.id}`);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-bg-card border border-border-subtle w-full max-w-6xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none" />
            
            <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-bg-sidebar/50 shrink-0 uppercase">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors border",
                  isRecording ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  {isRecording ? <Mic size={24} className="animate-pulse" /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-text-main tracking-tight uppercase">
                    {isRecording ? "Gravando Atendimento..." : "Registro Inteligente"}
                  </h2>
                  <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                    <Shield size={12} className="text-primary/40" /> Modo: {selectedMode} • {selectedApproach}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-bg-sidebar border border-border-subtle rounded-xl">
                  <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Abordagem:</span>
                  <select 
                    value={selectedApproach} 
                    onChange={(e) => setSelectedApproach(e.target.value)}
                    className="bg-transparent text-[10px] font-black text-primary outline-none cursor-pointer uppercase tracking-widest"
                  >
                    {abordagens.map((a, idx) => <option key={`abordagem-opt-${a}-${idx}-${appointment.id}`} value={a}>{a}</option>)}
                  </select>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-bg-card rounded-2xl transition-all text-text-dim hover:text-red-400 border border-transparent hover:border-border-subtle">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-10 scroller-hide bg-bg-card/30 outline-none" 
              tabIndex={0}
              onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 80)}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('input, textarea, button, select, [contenteditable="true"], .ql-editor')) {
                  e.currentTarget.focus();
                }
              }}
            >
              <AnimatePresence>
                {isScrolled && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="sticky top-0 z-50 py-3.5 px-6 -mx-10 bg-bg-card/95 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between gap-4 shadow-lg transition-all duration-350"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all border shrink-0",
                        sessionTimerActive ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-red-500/10 border-red-500/25 text-red-500"
                      )}>
                        <Clock size={16} className={cn(sessionTimerActive && "animate-pulse")} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-wider text-text-dim">Tempo Acumulado</p>
                        <p className="text-xl font-display font-black tracking-tight tabular-nums text-text-main leading-none mt-0.5">
                          {formatSessionTime(sessionElapsed)} / {sessionTargetTime}min
                        </p>
                      </div>
                    </div>

                    <div className="flex-grow max-w-[200px] hidden sm:block">
                      <div className="w-full h-1 bg-bg-deep rounded-full overflow-hidden border border-border-subtle/50">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            sessionElapsed > (sessionTargetTime * 60) ? "bg-red-500" : "bg-emerald-400"
                          )}
                          style={{ width: `${Math.min((sessionElapsed / (sessionTargetTime * 60)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sessionElapsed === 0 && !sessionTimerActive ? (
                        <button
                          type="button"
                          onClick={() => setSessionTimerActive(true)}
                          className="px-3 py-1.5 bg-emerald-500 text-black hover:bg-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-md"
                        >
                          Iniciar Atendimento
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setSessionTimerActive(!sessionTimerActive)}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border",
                              sessionTimerActive ? "bg-red-500/10 text-red-400 border-red-500/15 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15 hover:bg-emerald-500/20"
                            )}
                          >
                            {sessionTimerActive ? "Pausar" : "Retomar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSessionElapsed(0)}
                            className="px-2.5 py-1.5 bg-bg-card rounded-lg text-[8px] font-black uppercase tracking-widest text-text-dim hover:text-red-400 border border-border-subtle hover:border-red-500/15 transition-all"
                          >
                            Zerar
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {(() => {
                const targetSeconds = sessionTargetTime * 60;
                const isExceeded = sessionElapsed > targetSeconds;
                const isLast10Minutes = !isExceeded && (sessionElapsed >= (sessionTargetTime - 10) * 60);
                const percentProgress = Math.min((sessionElapsed / targetSeconds) * 100, 100);

                let timerColorClass = "text-emerald-400 bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40";
                if (isLast10Minutes) {
                  timerColorClass = "text-red-500 bg-red-500/5 border-red-500/20 shadow-red-500/5 animate-pulse hover:border-red-500/40";
                } else if (isExceeded) {
                  timerColorClass = "text-red-600 bg-red-600/10 border-red-600/30 shadow-red-600/10 hover:border-red-600/50";
                }

                return (
                  <div className={cn(
                    "p-8 mb-10 rounded-[2.5rem] border transition-all flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl",
                    timerColorClass
                  )}>
                    <div className={cn(
                      "absolute -right-20 -top-20 w-56 h-56 rounded-full blur-[80px] pointer-events-none opacity-30",
                      isLast10Minutes || isExceeded ? "bg-red-500/20" : "bg-emerald-500/20"
                    )} />

                    <div className="flex items-center gap-6 relative z-10 select-none">
                      <div className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center border transition-all shrink-0",
                        isLast10Minutes || isExceeded ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      )}>
                        <Clock size={40} className={cn(isExceeded ? "animate-bounce" : "")} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] block opacity-60">Tempo de Sessão Clínico</span>
                        <h3 className="text-6xl md:text-7xl font-display font-black tracking-tighter mt-2 tabular-nums">
                          {formatSessionTime(sessionElapsed)}
                        </h3>
                      </div>
                    </div>

                    <div className="flex-grow max-w-sm w-full relative z-10 px-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                        <span>Início</span>
                        <span>Meta de Tempo: {sessionTargetTime} min</span>
                      </div>
                      <div className="w-full h-3 bg-bg-deep rounded-full overflow-hidden border border-border-subtle p-0.5">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            isLast10Minutes || isExceeded ? "bg-red-500" : "bg-emerald-400"
                          )} 
                          style={{ width: `${percentProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 shrink-0 select-none">
                      <div className="text-right">
                        {isExceeded ? (
                          <div>
                            <span className="inline-block px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                              Tempo Excedido!
                            </span>
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">
                              + {formatSessionTime(sessionElapsed - targetSeconds)} excedido
                            </p>
                          </div>
                        ) : isLast10Minutes ? (
                          <div>
                            <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-500/30">
                              Últimos 10 Minutos!
                            </span>
                            <p className="text-[9px] font-bold text-red-400/80 uppercase tracking-widest mt-1">
                              Restam {Math.ceil((targetSeconds - sessionElapsed) / 60)} min
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                              Sessão Saudável
                            </span>
                            <p className="text-[9px] font-bold text-text-dim uppercase tracking-widest mt-1">
                              Tempo em andamento
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 p-1 bg-bg-sidebar rounded-xl border border-border-subtle">
                        {sessionElapsed === 0 && !sessionTimerActive ? (
                          <button
                            type="button"
                            onClick={() => setSessionTimerActive(true)}
                            className="px-4 py-2 bg-emerald-500 text-black hover:bg-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                          >
                            Iniciar Atendimento
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setSessionTimerActive(!sessionTimerActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                sessionTimerActive ? "bg-red-500/10 text-red-400 border border-red-500/10" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                              )}
                            >
                              {sessionTimerActive ? "Pausar" : "Retomar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSessionElapsed(0)}
                              className="px-3 py-1.5 bg-bg-card rounded-lg text-[9px] font-black uppercase tracking-widest text-text-dim hover:text-red-400 hover:bg-red-500/15 transition-all"
                            >
                              Zerar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3 space-y-8">
                  <div className={cn(
                    "py-3.5 px-6 rounded-3xl border transition-all flex flex-col md:flex-row items-center justify-between gap-4 bg-bg-sidebar/40 border-border-subtle",
                    isRecording ? "bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5 animate-pulse" : "bg-bg-sidebar/50 border-border-subtle"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all border shrink-0",
                        isRecording ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20 animate-pulse" : "bg-bg-card text-text-dim border-border-subtle"
                      )}>
                        <Mic size={16} />
                      </div>
                      <div>
                        {isRecording ? (
                          <>
                            <div className="flex items-center gap-3">
                              <p className="text-lg font-display font-black text-red-500 tabular-nums tracking-tighter">{formatTime(recordingTime)}</p>
                              <div className="h-4 w-[1px] bg-red-500/20" />
                              <div className="flex flex-col">
                                <p className={cn(
                                  "text-[8px] font-black uppercase tracking-[0.15em]",
                                  recordingTime / 60 > sessionTargetTime ? "text-amber-500" : "text-red-500/60"
                                )}>
                                  Meta: {sessionTargetTime}min
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-black text-text-main uppercase tracking-widest">Gravação Ativa</p>
                            <p className="text-[8px] font-black text-text-dim uppercase tracking-[0.2em]">Sessão de {sessionTargetTime}min</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 relative">
                        <select 
                          value={audioSource} 
                          onChange={(e) => setAudioSource(e.target.value as any)}
                          className="bg-bg-sidebar border border-border-subtle rounded-xl px-2.5 py-1.5 text-[8px] font-black text-text-dim outline-none uppercase tracking-widest focus:border-primary/50"
                        >
                          <option value="mic">Microfone PC</option>
                          <option value="system">Áudio Browser ⚠️</option>
                        </select>


                        
                        {audioSource === 'system' && (
                          <div className="absolute top-full left-0 mt-2 p-3 bg-bg-card border border-primary/20 rounded-xl shadow-xl z-20 w-[220px] animate-in fade-in slide-in-from-top-2">
                            <p className="text-[8px] font-bold text-primary uppercase tracking-widest leading-relaxed">
                              ⚠️ Captura de sistema requer abrir o app em uma <span className="underline">nova aba</span> devido a restrições de segurança do iframe.
                            </p>
                          </div>
                        )}

                        {audioSource !== 'system' && audioDevices.length > 0 && (
                          <select 
                            value={selectedDeviceId} 
                            onChange={(e) => setSelectedDeviceId(e.target.value)}
                            className="bg-bg-sidebar border border-border-subtle rounded-xl px-2.5 py-1.5 text-[8px] font-black text-primary outline-none uppercase tracking-widest max-w-[120px] truncate"
                          >
                            {audioDevices.map((d, idx) => <option key={`audio-device-${d.id}-${idx}-${appointment.id}`} value={d.id}>{d.label}</option>)}
                          </select>
                        )}
                      </div>

                      {isProcessingAi && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/25 direct-spin">
                          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-[8px] font-black text-primary uppercase tracking-widest animate-pulse">Processando...</span>
                        </div>
                      )}
                      
                      {!isRecording ? (
                        <button 
                          onClick={startRecording}
                          disabled={isProcessingAi}
                          className="flex items-center gap-2.5 px-4 py-2 bg-red-500 text-white font-black uppercase tracking-[0.15em] text-[8px] rounded-xl shadow-md hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Mic size={12} /> Iniciar Consulta
                        </button>
                      ) : (
                        <button 
                          onClick={stopRecording}
                          className="flex items-center gap-2.5 px-4 py-2 bg-bg-card border border-red-500 text-red-500 font-black uppercase tracking-[0.15em] text-[8px] rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md active:scale-95"
                        >
                          <Square size={12} /> Finalizar & Analisar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Editor Pré-Prontuário</label>
                      <div className="flex items-center gap-2">
                         <select 
                            value={selectedMode} 
                            onChange={(e) => setSelectedMode(e.target.value as any)}
                            className="bg-bg-sidebar border border-border-subtle rounded-xl px-4 py-2 text-[9px] font-black text-primary outline-none uppercase tracking-widest"
                          >
                            <option value="Evolução">Evolução</option>
                            <option value="Primeira Consulta">Primeira Consulta</option>
                          </select>
                         <button 
                           onClick={async () => {
                             setIsProcessingAi(true);
                             try {
                               const result = await clinicalInsight('', notes, selectedApproach);
                               setAiAnalysis(result);
                             } catch (err) { console.error(err); }
                             finally { setIsProcessingAi(false); }
                           }}
                           disabled={!notes || isProcessingAi}
                           className="flex items-center gap-2 px-6 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition-all group"
                         >
                           <Sparkles size={14} className="group-hover:rotate-12 transition-transform" /> Análise Técnica
                         </button>
                      </div>
                    </div>
                    <div className="bg-bg-sidebar rounded-[2.5rem] border border-border-subtle overflow-hidden min-h-[450px] shadow-2xl focus-within:border-primary/30 transition-all">
                      <RichTextEditor
                        value={notes}
                        onChange={setNotes}
                        placeholder="A transcrição aparecerá aqui automaticamente após a gravação..."
                        minHeight="450px"
                      />
                    </div>
                  </div>

                  {aiAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-12 bg-bg-sidebar border border-primary/20 rounded-[3rem] relative overflow-hidden shadow-2xl"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[8rem] pointer-events-none" />
                      <div className="flex items-center justify-between mb-8">
                        <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                          <Sparkles size={16} /> Insight Clínico e Estrutural
                        </h5>
                        <button onClick={() => setAiAnalysis('')} className="p-2 text-text-dim hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none text-text-main/90 leading-relaxed font-medium">
                        {aiAnalysis.split('\n').map((line, i) => (
                          <p key={`reg-ai-analysis-${appointment.id}-${i}-${line.length}`} className="mb-2">{line}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-8 flex flex-col">
                  <div className="p-0.5 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-primary/50 shadow-2xl shadow-indigo-500/10">
                    <div className="bg-bg-card rounded-[2.5rem] p-8 flex flex-col gap-6 h-full">
                       <button 
                         onClick={() => setShowCharcot(!showCharcot)}
                         className="flex items-center justify-between w-full group"
                       >
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                             <MessageSquare size={22} />
                           </div>
                           <div className="text-left">
                             <p className="text-sm font-black text-text-main tracking-widest uppercase">Charcot</p>
                             <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">Consultor PBE</p>
                           </div>
                         </div>
                         <div className={cn("transition-transform duration-500", showCharcot ? "rotate-180" : "")}>
                           <PlayCircle size={20} className="text-text-dim" />
                         </div>
                       </button>

                       <AnimatePresence>
                         {showCharcot && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }} 
                             animate={{ opacity: 1, height: 'auto' }}
                             exit={{ opacity: 0, height: 0 }}
                             className="space-y-4 overflow-hidden"
                           >
                              <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto scroller-hide pr-2">
                                 {charcotChat.length === 0 && (
                                   <div className="text-center py-6 text-[9px] font-bold text-text-dim/30 uppercase tracking-widest italic">
                                     Consultas baseadas em evidências científicas.
                                   </div>
                                 )}
                                 {charcotChat.map((msg, i) => (
                                   <div key={`charcot-chat-msg-${appointment.id}-${msg.role}-${i}`} className={cn(
                                     "p-5 rounded-2xl text-[11px] leading-relaxed shadow-sm",
                                     msg.role === 'user' ? "bg-bg-sidebar border border-border-subtle ml-6" : "bg-indigo-500/5 border border-indigo-500/10 mr-6 text-text-main/90"
                                   )}>
                                     {msg.content}
                                   </div>
                                 ))}
                                 {isCharcotLoading && (
                                   <div className="flex items-center justify-center py-6">
                                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                   </div>
                                 )}
                              </div>
                              <div className="relative mt-4">
                                 <input 
                                   type="text"
                                   value={charcotQuery}
                                   onChange={(e) => setCharcotQuery(e.target.value)}
                                   placeholder="Dúvida diagnóstica..."
                                   onKeyDown={(e) => e.key === 'Enter' && handleCharcotQuery()}
                                   className="w-full bg-bg-sidebar border border-border-subtle rounded-2xl px-5 py-4 text-xs placeholder:text-text-dim/20 outline-none focus:border-indigo-500/50 shadow-inner"
                                 />
                                 <button 
                                   onClick={handleCharcotQuery}
                                   className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover hover:scale-110 transition-all"
                                 >
                                   <PlayCircle size={20} />
                                 </button>
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-1">Processamento de Arquivos</label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.html"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full py-12 border-2 border-dashed border-border-subtle rounded-[2.5rem] flex flex-col items-center justify-center gap-3 bg-bg-sidebar/30 hover:bg-primary/5 transition-all group">
                        <div className="p-5 bg-bg-card border border-border-subtle rounded-2xl text-text-dim group-hover:text-primary transition-all group-hover:-translate-y-1 shadow-lg group-hover:shadow-primary/5">
                          <FileUp size={28} />
                        </div>
                        <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] text-center px-8 leading-relaxed">Arraste Laudos ou Exames<br/><span className="text-primary/40 font-black">Conversão IA Automática</span></p>
                      </div>
                    </div>

                    <div className="space-y-3">
                       {attachments.length > 0 && (
                         <button 
                           onClick={handleAnalyzeFiles}
                           disabled={isProcessingAi}
                           className="w-full py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-500 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/5 flex items-center justify-center gap-3 mb-4"
                         >
                           <ListFilter size={16} /> Analisar em Lote
                         </button>
                       )}
                      {attachments.map((att, idx) => {
                        const isImage = att.type.includes('image');
                        const isPdf = att.type.includes('pdf');
                        return (
                          <div key={`registration-att-${appointment.id}-${att.name}-${idx}-${attachments.length}`} className="flex items-center gap-4 p-4 bg-bg-sidebar border border-border-subtle rounded-2xl group animate-in slide-in-from-bottom-2">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center text-primary/60 transition-colors group-hover:text-primary">
                              {isImage ? <ImageIcon size={18} /> : (isPdf ? <FileText size={18} /> : <Globe size={18} />)}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-[10px] font-bold text-text-main truncate uppercase tracking-widest">{att.name}</p>
                              <p className="text-[8px] text-text-dim font-black uppercase tabular-nums tracking-tighter">{(att.size / 1024).toFixed(1)} KB • {att.type.split('/')[1]}</p>
                            </div>
                            <button onClick={() => removeAttachment(idx)} className="p-2 text-text-dim/20 hover:text-red-500 transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto bg-bg-sidebar border border-border-subtle rounded-[2.5rem] p-8 space-y-6">
                    <div className="space-y-4">
                       <button
                         onClick={() => handleSave(true)}
                         disabled={isSaving || isProcessingAi}
                         className="w-full py-5 bg-primary text-bg-deep font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                       >
                         {isSaving ? <div className="w-4 h-4 border-2 border-bg-deep border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={20} />}
                         Efetivar Prontuário
                       </button>
                       <button
                         onClick={() => handleSave(false)}
                         disabled={isSaving || isProcessingAi}
                         className="w-full py-5 bg-bg-card border border-border-subtle text-text-main font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.5rem] hover:bg-bg-sidebar transition-all flex items-center justify-center gap-3"
                       >
                         <Save size={20} /> Salvar Rascunho
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-10 py-8 bg-bg-sidebar border-t border-border-subtle flex items-center justify-between shrink-0">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">Sincronização Ativa</span>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                   <Shield size={14} className="text-primary" />
                   <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">Auditoria HIPAA/LGPD Compliant</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[10px] font-black text-text-dim uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Descartar Sessão
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
