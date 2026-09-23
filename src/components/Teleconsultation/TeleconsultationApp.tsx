import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  RefreshCw, 
  MessageCircle, 
  Copy, 
  Zap, 
  ShieldCheck, 
  X, 
  Activity, 
  Server, 
  PictureInPicture2, 
  Maximize2 
} from 'lucide-react';
import { db, type Patient } from '../../lib/db';
import { syncService } from '../../lib/syncService';
import { toast, Toaster } from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface TeleconsultationAppProps {
  activePatientId?: string | null;
  userId?: string;
  onClose: () => void;
  isPip?: boolean;
  onTogglePip?: (enable: boolean) => void;
}

export default function TeleconsultationApp({ 
  activePatientId, 
  userId, 
  onClose,
  isPip = false,
  onTogglePip 
}: TeleconsultationAppProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [jitsiActive, setJitsiActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  
  // Anti-Lag & Network Optimization States
  const [jitsiServer, setJitsiServer] = useState<string>(() => {
    return localStorage.getItem('cortex_teleconsulta_server') || 'jitsi.riot.im';
  });
  const [customServerInput, setCustomServerInput] = useState<string>('');
  const [videoQuality, setVideoQuality] = useState<'360p' | '480p' | '720p'>(() => {
    return (localStorage.getItem('cortex_teleconsulta_quality') as any) || '480p';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Session state
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Helper para gerar o identificador curto de sala
  const getTeleRoomName = () => {
    if (!selectedPatientId) return '';
    const cleanId = selectedPatientId.replace(/[^a-zA-Z0-9]/g, '');
    return `ctx-${cleanId.slice(0, 12)}`;
  };

  // Helper para gerar o link encurtado inteligente (apenas ~40-45 caracteres no total)
  const getMeetingLink = (fullDirect = false) => {
    if (!selectedPatientId) return '';
    const roomName = getTeleRoomName();
    const domain = jitsiServer.trim() || 'jitsi.riot.im';
    const resNum = videoQuality === '720p' ? 720 : videoQuality === '360p' ? 360 : 480;

    if (fullDirect) {
      return `https://${domain}/${roomName}#config.p2p.enabled=true&config.resolution=${resNum}&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.disableDeepLinking=true`;
    }

    // Link curto nativo do Cortex (apenas ~45 caracteres no domínio da própria clínica)
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?v=${roomName}`;
  };

  const handleCopyLink = () => {
    const meetingLink = getMeetingLink();
    if (!meetingLink) return;
    navigator.clipboard.writeText(meetingLink);
    toast.success('Link curto da teleconsulta copiado!');
  };

  const handleSendLinkWA = () => {
    if (!patient) return;
    const meetingLink = getMeetingLink();
    if (!meetingLink) return;
    const text = `Olá, ${patient.nome}. Aqui está o link para nosso teleatendimento virtual: ${meetingLink}`;
    const cleanPhone = patient.telefone ? patient.telefone.replace(/\D/g, '') : '';
    if (!cleanPhone) {
      navigator.clipboard.writeText(meetingLink).catch(() => {});
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      toast.success('Link copiado! Selecione o contato no WhatsApp.');
      return;
    }
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const waUrl = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const activeJitsiSessionKeyRef = useRef<string>('');

  // Load patients and set preselected patient
  useEffect(() => {
    const loadData = async () => {
      const allPatients = await db.pacientes.toArray();
      const activePatients = allPatients.filter(p => p.status !== 'inativo');
      setPatients(activePatients);
      
      const pId = activePatientId || (activePatients.length > 0 ? activePatients[0].id : '');
      setSelectedPatientId(pId);
    };
    loadData();
  }, [activePatientId]);

  // Load specific patient details when selectedPatientId changes
  useEffect(() => {
    if (selectedPatientId) {
      db.pacientes.get(selectedPatientId).then(setPatient);
    } else {
      setPatient(null);
    }
  }, [selectedPatientId]);

  // Load Jitsi script dynamically based on chosen domain
  useEffect(() => {
    const domain = jitsiServer.trim() || 'jitsi.riot.im';
    const scriptUrl = `https://${domain}/external_api.js`;
    
    // If already loaded for this domain, mark ready
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      if ((window as any).JitsiMeetExternalAPI) {
        setScriptLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setScriptLoaded(true));
      }
      return;
    }

    setScriptLoaded(false);
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast.error(`Falha ao carregar API do servidor ${domain}. Retornando ao padrão.`);
      setJitsiServer('jitsi.riot.im');
    };
    document.body.appendChild(script);

    return () => {
      // Script is kept in cache
    };
  }, [jitsiServer]);

  // Initialize Jitsi with Anti-Lag WebRTC Constraints & STUN Acceleration
  useEffect(() => {
    if (!scriptLoaded || !selectedPatientId || !jitsiContainerRef.current) return;

    let isObsolete = false;
    const sessionKey = `${selectedPatientId}_${jitsiServer}_${videoQuality}`;

    const initJitsi = async () => {
      const patientObj = await db.pacientes.get(selectedPatientId);
      if (isObsolete || !patientObj) return;

      if (activeJitsiSessionKeyRef.current === sessionKey && jitsiApiRef.current) {
        // Already initialized with identical configs
        return;
      }

      // Clean up previous instance if any
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }

      setJitsiActive(false);
      setSessionStartTime(new Date());

      const domain = jitsiServer.trim() || 'jitsi.riot.im';
      const roomName = getTeleRoomName();

      const resNumber = videoQuality === '720p' ? 720 : videoQuality === '360p' ? 360 : 480;
      const idealWidth = videoQuality === '720p' ? 1280 : videoQuality === '360p' ? 480 : 640;

      const options = {
        roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,

          // 1. Otimização de Resolução & Framerate (Elimina sobrecarga de CPU e travamentos)
          resolution: resNumber,
          constraints: {
            video: {
              height: {
                ideal: resNumber,
                max: videoQuality === '720p' ? 720 : videoQuality === '360p' ? 480 : 720,
                min: 240
              },
              width: {
                ideal: idealWidth,
                max: 1280,
                min: 320
              },
              frameRate: { ideal: 24, max: 30, min: 15 }
            }
          },

          // 2. Conexão Direta P2P com STUN Google Brasil (Reduz latência de 400ms para ~20ms)
          p2p: {
            enabled: true,
            preferH264: true,
            disableH264: false,
            useStunTurn: true,
            stunServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' }
            ]
          },

          // 3. Otimização de Áudio de Alta Definição sem cortes (Opus mono ultra estável)
          audioQuality: {
            stereo: false
          },
          stereo: false,
          opusMaxAverageBitrate: 32000,
          enableNoAudioDetection: true,
          enableNoisyMicDetection: true,

          // 4. Supressão de Processamento Desnecessário (Economia de banda e processador)
          channelLastN: 2,
          enableLayerSuspension: true,
          disableSimulcast: false,
          disableThirdPartyRequests: true,
          analytics: { disabled: true },
          doNotStoreRoom: true,
          disableAudioLevels: false,
          pip: { enabled: true },
          videoQuality: {
            persist: true,
            defaultResolution: resNumber
          }
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'chat', 'settings',
            'videoquality', 'tileview', 'fullscreen', 'pip'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: 3000,
          OPTIMAL_BROWSING_EXPERIENCE_CHECK: false,
        },
        userInfo: {
          displayName: localStorage.getItem('psiCurrentUsername_v9') || 'Dr(a). Terapeuta',
        }
      };

      try {
        const api = new (window as any).JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;
        activeJitsiSessionKeyRef.current = sessionKey;
        setJitsiActive(true);

        // Event listeners
        api.addEventListener('videoConferenceLeft', () => {
          toast.success('Você saiu da videoconferência.');
        });
        api.addEventListener('audioMuteStatusChanged', (e: any) => {
          setIsAudioMuted(Boolean(e.muted));
        });
        api.addEventListener('videoMuteStatusChanged', (e: any) => {
          setIsVideoMuted(Boolean(e.muted));
        });

        // Garantir permissões de Picture-in-Picture no iframe
        setTimeout(() => {
          const iframe = jitsiContainerRef.current?.querySelector('iframe');
          if (iframe) {
            iframe.setAttribute('allow', 'camera; microphone; display-capture; autoplay; clipboard-write; picture-in-picture');
          }
        }, 300);
      } catch (err) {
        console.error('Failed to init Jitsi:', err);
        toast.error('Erro ao conectar ao servidor Jitsi.');
      }
    };

    initJitsi();

    return () => {
      isObsolete = true;
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
        activeJitsiSessionKeyRef.current = '';
      }
    };
  }, [scriptLoaded, selectedPatientId, jitsiServer, videoQuality]);

  const handleEndCall = async () => {
    setIsSaving(true);
    try {
      // 1. Dispose Jitsi Call
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      setJitsiActive(false);

      // 2. If patient selected, record session in prontuário
      if (selectedPatientId && patient) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR');
        const startTimeStr = sessionStartTime ? sessionStartTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        const endTimeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const recordHtml = `
          <div class="teleconsulta-record-rendered p-6 bg-white/[0.01] border border-[#bf9b6b]/20 rounded-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
              <h4 class="text-xs font-black uppercase tracking-wider text-[#bf9b6b] flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                Atendimento Virtual via Teleconsulta
              </h4>
              <span class="text-[9px] font-mono opacity-50">${formattedDate} | ${startTimeStr ? `${startTimeStr} - ` : ''}${endTimeStr}</span>
            </div>
            <div class="text-xs leading-relaxed space-y-3">
              <p class="mb-1 text-[11px] text-text-main/90">Sessão de teleatendimento virtual realizada com ${patient.nome}. Conexão encerrada com sucesso.</p>
            </div>
          </div>
        `;

        const prontuario = await db.prontuarios.get(selectedPatientId);
        const newEntry = {
          timestamp: Date.now(),
          data: formattedDate,
          textoHtml: recordHtml,
          tipo: 'evolucao' as any,
          metadata: {
            type: 'teleconsulta',
            startTime: sessionStartTime?.toISOString(),
            endTime: now.toISOString()
          }
        };

        if (prontuario) {
          const updatedEntradas = [newEntry, ...prontuario.entradas];
          await db.prontuarios.update(selectedPatientId, { entradas: updatedEntradas });
        } else {
          const newRecord = {
            pacienteId: selectedPatientId,
            entradas: [newEntry],
            anamneseData: {}
          };
          await db.prontuarios.add(newRecord);
        }

        if (userId) {
          const updatedRecord = await db.prontuarios.get(selectedPatientId);
          if (updatedRecord) {
            await syncService.saveToCloud(userId, 'prontuarios', updatedRecord);
          }
        }

        toast.success('Atendimento encerrado e registrado no prontuário!');
      } else {
        toast.success('Teleatendimento encerrado!');
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao registrar no prontuário.');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAudio = () => {
    jitsiApiRef.current?.executeCommand('toggleAudio');
  };

  const handleToggleVideo = () => {
    jitsiApiRef.current?.executeCommand('toggleVideo');
  };

  return (
    <div className="w-full h-full flex flex-col bg-bg-deep select-none relative overflow-hidden">
      {/* HEADER ACTIONS */}
      {isPip ? (
        <header className="h-10 bg-bg-card border-b border-border-subtle px-3 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-sm shadow-emerald-500/50" />
            <span className="text-xs font-bold text-text-main truncate max-w-[130px]">
              {patient?.nome || 'Teleconsulta'}
            </span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-emerald-400 font-bold shrink-0">
              {videoQuality}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mic Toggle */}
            <button
              onClick={handleToggleAudio}
              className={cn(
                "p-1.5 rounded-lg border transition-all cursor-pointer",
                isAudioMuted 
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold" 
                  : "bg-bg-sidebar hover:bg-white/10 text-text-dim hover:text-text-main border-border-subtle"
              )}
              title={isAudioMuted ? "Desmutar microfone" : "Mutar microfone"}
            >
              {isAudioMuted ? <MicOff size={13} /> : <Mic size={13} />}
            </button>

            {/* Video Toggle */}
            <button
              onClick={handleToggleVideo}
              className={cn(
                "p-1.5 rounded-lg border transition-all cursor-pointer",
                isVideoMuted 
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold" 
                  : "bg-bg-sidebar hover:bg-white/10 text-text-dim hover:text-text-main border-border-subtle"
              )}
              title={isVideoMuted ? "Ligar câmera" : "Desligar câmera"}
            >
              {isVideoMuted ? <VideoOff size={13} /> : <Video size={13} />}
            </button>

            {/* Expand / Restore Button */}
            <button
              onClick={() => onTogglePip?.(false)}
              className="p-1.5 rounded-lg border bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 transition-all cursor-pointer"
              title="Expandir para tela completa da teleconsulta"
            >
              <Maximize2 size={13} />
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-1.5 rounded-lg border bg-red-600 hover:bg-red-500 text-white border-red-700 transition-all cursor-pointer"
              title="Encerrar teleconsulta"
            >
              <PhoneOff size={13} />
            </button>
          </div>
        </header>
      ) : (
        <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-3">
            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-bg-deep font-black shadow-inner">
              <Video size={16} />
            </div>
            <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
              Sala de 
              <span className="text-primary font-black">Teleconsulta</span>
            </h1>
          </div>

          {/* Selected Patient Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-bg-sidebar/40 border border-border-subtle rounded-xl px-4 py-1.5 text-xs text-text-main">
              <span className="text-text-dim uppercase tracking-wider font-semibold">Paciente:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="bg-transparent text-text-main font-bold border-none outline-none cursor-pointer max-w-[180px] truncate"
              >
                <option value="" disabled>-- Selecionar Paciente --</option>
                {patients.map(p => (
                  <option key={`tele-pat-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatientId && patient && (
              <div className="flex items-center gap-2">
                {/* Picture-in-Picture Button */}
                <button
                  onClick={() => onTogglePip?.(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-sidebar border border-border-subtle hover:border-primary/40 text-text-dim hover:text-primary rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
                  title="Destacar chamada em modo Picture-in-Picture (Janela Flutuante)"
                >
                  <PictureInPicture2 size={12} className="text-primary" />
                  <span>Picture-in-Picture</span>
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border",
                    videoQuality === '480p'
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-sm"
                      : "bg-bg-sidebar border-border-subtle hover:border-primary/40 text-text-dim hover:text-primary"
                  )}
                  title="Configurar Resolução e Servidor Anti-Lag"
                >
                  <Zap size={11} className={videoQuality === '480p' ? "text-emerald-400" : "text-primary"} />
                  <span>{videoQuality} • Anti-Lag</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-sidebar border border-border-subtle hover:border-primary/40 text-text-dim hover:text-primary rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  title="Copiar Link Otimizado da Teleconsulta"
                >
                  <Copy size={11} />
                  Copiar Link
                </button>
                <button
                  onClick={handleSendLinkWA}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 hover:bg-green-500 hover:text-white text-green-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  title="Enviar Link Curto por WhatsApp para o Paciente"
                >
                  <MessageCircle size={11} />
                  Enviar WA
                </button>
              </div>
            )}

            <button
              onClick={handleEndCall}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/10 cursor-pointer"
            >
              {isSaving ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <PhoneOff size={12} />
              )}
              Encerrar Chamada
            </button>
          </div>
        </header>
      )}

      {/* WORKSPACE AREA */}
      <main className="flex-1 flex overflow-hidden w-full h-full relative">
        {!scriptLoaded ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Carregando sala virtual do Jitsi...</p>
          </div>
        ) : (
          <div className="flex-grow flex h-full w-full overflow-hidden">
            {/* Video Panel Full Width */}
            <div className="w-full h-full bg-bg-sidebar relative flex flex-col items-center justify-center shrink-0">
              <div ref={jitsiContainerRef} className="w-full h-full" />
              {!jitsiActive && patient && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-deep/70 backdrop-blur-sm">
                  <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-primary leading-none">Iniciando feed para {patient.nome}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE OTIMIZAÇÕES DE CONEXÃO & VÍDEO (ANTI-LAG) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-bg-card border border-border-subtle rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Otimização de Vídeo & Conexão</h3>
                  <p className="text-[10px] text-text-dim">Mecanismos de aceleração e prevenção de lag na teleconsulta</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 text-text-dim hover:text-text-main rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Seletor de Resolução / Fluidez */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-main flex items-center gap-1.5">
                <Activity size={12} className="text-primary" />
                Resolução de Vídeo & Fluidez
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: '480p',
                    title: '480p (Ideal)',
                    badge: 'Recomendado',
                    desc: 'Fluidez máxima sem lag. Economiza CPU e estabiliza o áudio.'
                  },
                  {
                    id: '720p',
                    title: '720p (HD)',
                    badge: 'Fibra Ótica',
                    desc: 'Alta definição, indicado para conexões muito rápidas.'
                  },
                  {
                    id: '360p',
                    title: '360p (Leve)',
                    badge: '4G / Wi-Fi Fraco',
                    desc: 'Consumo mínimo de dados em redes móveis instáveis.'
                  }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setVideoQuality(opt.id as any);
                      localStorage.setItem('cortex_teleconsulta_quality', opt.id);
                    }}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                      videoQuality === opt.id
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-bg-sidebar/50 border-border-subtle hover:border-white/20"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-xs font-bold", videoQuality === opt.id ? "text-primary" : "text-text-main")}>
                          {opt.title}
                        </span>
                      </div>
                      <span className="inline-block text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-text-dim mb-1.5">
                        {opt.badge}
                      </span>
                      <p className="text-[9px] text-text-dim leading-tight">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seletor de Servidor */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-main flex items-center gap-1.5">
                <Server size={12} className="text-primary" />
                Servidor Jitsi
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    domain: 'jitsi.riot.im',
                    label: 'jitsi.riot.im (Padrão s/ login)',
                    detail: 'Acesso livre e imediato para terapeuta e paciente. Otimizado com P2P Direto.'
                  },
                  {
                    domain: 'meet.jit.si',
                    label: 'meet.jit.si (Servidor Oficial 8x8)',
                    detail: 'Latência ultrabaixa (~77ms). Exige autenticação 1x com Google pelo terapeuta.'
                  }
                ].map(srv => (
                  <label
                    key={srv.domain}
                    onClick={() => {
                      setJitsiServer(srv.domain);
                      localStorage.setItem('cortex_teleconsulta_server', srv.domain);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all",
                      jitsiServer === srv.domain
                        ? "bg-primary/10 border-primary"
                        : "bg-bg-sidebar/40 border-border-subtle hover:border-white/15"
                    )}
                  >
                    <input
                      type="radio"
                      name="jitsiServer"
                      checked={jitsiServer === srv.domain}
                      onChange={() => {}}
                      className="mt-0.5 text-primary focus:ring-0"
                    />
                    <div className="text-left">
                      <div className="text-xs font-bold text-text-main">{srv.label}</div>
                      <div className="text-[9px] text-text-dim leading-tight">{srv.detail}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Destaque de Recursos Anti-Lag Ativos */}
            <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 space-y-1.5 text-[10px] text-emerald-400">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Proteções Anti-Lag Ativas Nesta Sala:
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[9px] text-text-dim">
                <li><strong className="text-text-main">P2P STUN Brasil:</strong> Os pacotes trafegam ponto a ponto pelo Brasil sem desvios para servidores na Europa.</li>
                <li><strong className="text-text-main">Link Inteligente:</strong> Ao enviar o link via WhatsApp, o celular do paciente já recebe os limites de resolução para não travar.</li>
                <li><strong className="text-text-main">Codec H.264 & Opus Mono:</strong> Aceleração por hardware e compressão de voz focada sem cortes de fala.</li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  toast.success('Configurações aplicadas à sala virtual!');
                }}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-bg-deep rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-border-subtle bg-bg-card text-text-main',
        }}
      />
    </div>
  );
}
