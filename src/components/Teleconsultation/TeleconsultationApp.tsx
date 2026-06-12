import React, { useState, useEffect, useRef } from 'react';
import { Video, PhoneOff, Clipboard, Sparkles, FileText, CheckCircle, Brain, RefreshCw } from 'lucide-react';
import { db, type Patient } from '../../lib/db';
import { syncService } from '../../lib/syncService';
import { toast, Toaster } from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface TeleconsultationAppProps {
  activePatientId?: string | null;
  userId?: string;
  onClose: () => void;
}

export default function TeleconsultationApp({ activePatientId, userId, onClose }: TeleconsultationAppProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [jitsiActive, setJitsiActive] = useState(false);
  
  // Notes & Session state
  const [notes, setNotes] = useState('');
  const [observations, setObservations] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const activeJitsiPatientIdRef = useRef<string>('');
 
  // Load patients and set preselected patient
  useEffect(() => {
    const loadData = async () => {
      const allPatients = await db.pacientes.toArray();
      setPatients(allPatients);
      
      const pId = activePatientId || (allPatients.length > 0 ? allPatients[0].id : '');
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
 
  // Load Jitsi script dynamically
  useEffect(() => {
    const scriptUrl = 'https://meet.ffmuc.net/external_api.js';
    
    if ((window as any).JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }
 
    // Check if script is already present in document
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      return;
    }
 
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
 
    return () => {
      // We don't remove script to allow caching, but we clean up references
    };
  }, []);
 
  // Initialize Jitsi when container and script are ready
  useEffect(() => {
    if (!scriptLoaded || !selectedPatientId || !jitsiContainerRef.current) return;
 
    let isObsolete = false;
 
    const initJitsi = async () => {
      const patientObj = await db.pacientes.get(selectedPatientId);
      if (isObsolete || !patientObj) return;
 
      if (activeJitsiPatientIdRef.current === selectedPatientId && jitsiApiRef.current) {
        // Already initialized for this patient, do not recreate!
        return;
      }
 
      // Clean up previous instance if any
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
 
      setJitsiActive(false);
      setSessionStartTime(new Date());
 
      const domain = 'meet.ffmuc.net';
      const roomName = `cortex-teleconsulta-${selectedPatientId.replace(/[^a-zA-Z0-9]/g, '')}`;
 
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
          p2p: { enabled: true },
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'chat', 'settings',
            'videoquality', 'tileview', 'videobackgroundblur', 'help'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
        userInfo: {
          displayName: localStorage.getItem('psiCurrentUsername_v9') || 'Dr(a). Terapeuta',
        }
      };
 
      try {
        const api = new (window as any).JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;
        activeJitsiPatientIdRef.current = selectedPatientId;
        setJitsiActive(true);
 
        // Event listeners
        api.addEventListener('videoConferenceLeft', () => {
          toast.success('Você saiu da videoconferência.');
        });
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
        activeJitsiPatientIdRef.current = '';
      }
    };
  }, [scriptLoaded, selectedPatientId]);

  const handleEndAndSave = async () => {
    if (!selectedPatientId || !patient) {
      toast.error('Paciente não selecionado.');
      return;
    }

    if (!notes.trim()) {
      toast.error('Por favor, insira alguma nota clínica da sessão antes de salvar!');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Dispose Jitsi Call
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      setJitsiActive(false);

      // 2. Prepare Prontuário Entry HTML
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
            <span class="text-[9px] font-mono opacity-50">${formattedDate} | ${startTimeStr} - ${endTimeStr}</span>
          </div>
          <div class="text-xs leading-relaxed space-y-3">
            <p class="mb-1 text-[11px] text-text-main/90 whitespace-pre-wrap"><strong>Notas Clínicas da Sessão:</strong><br/>${notes}</p>
            ${observations.trim() ? `<p class="mb-1 text-[11px] text-text-main/90 whitespace-pre-wrap"><strong>Observações / Deveres de Casa:</strong><br/>${observations}</p>` : ''}
          </div>
        </div>
      `;

      // 3. Save to Dexie db.prontuarios
      const prontuario = await db.prontuarios.get(selectedPatientId);
      const newEntry = {
        timestamp: Date.now(),
        data: formattedDate,
        textoHtml: recordHtml,
        tipo: 'evolucao' as any,
        metadata: {
          type: 'teleconsulta',
          notes,
          observations,
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

      // 4. Sync immediately to Cloud
      if (userId) {
        const updatedRecord = await db.prontuarios.get(selectedPatientId);
        if (updatedRecord) {
          await syncService.saveToCloud(userId, 'prontuarios', updatedRecord);
        }
      }

      toast.success('Atendimento encerrado e evolução registrada no prontuário!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar prontuário.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-bg-deep select-none relative overflow-hidden">
      {/* HEADER ACTIONS */}
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
        <div className="flex items-center gap-4">
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

          <button
            onClick={handleEndAndSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/10 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <PhoneOff size={12} />
            )}
            Encerrar e Evoluir
          </button>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <main className="flex-1 flex overflow-hidden w-full h-full relative">
        {!scriptLoaded ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Carregando sala virtual do Jitsi...</p>
          </div>
        ) : (
          <div className="flex-grow flex h-full w-full overflow-hidden">
            {/* Split Screen Video Panel (Col 8/12 equivalent) */}
            <div className="w-[65%] h-full bg-bg-sidebar border-r border-border-subtle relative flex flex-col items-center justify-center shrink-0">
              <div ref={jitsiContainerRef} className="w-full h-full" />
              {!jitsiActive && patient && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-deep/70 backdrop-blur-sm">
                  <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-primary leading-none">Iniciando feed para {patient.nome}</p>
                </div>
              )}
            </div>

            {/* Split Screen Notes Panel (Col 4/12 equivalent) */}
            <div className="flex-1 h-full flex flex-col bg-bg-card overflow-hidden">
              <div className="p-4 border-b border-border-subtle bg-bg-sidebar/40 flex items-center justify-between shrink-0">
                <h3 className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clipboard size={12} className="text-primary" /> Anotações Rápidas de Sessão
                </h3>
              </div>

              <div className="flex-grow p-6 overflow-y-auto space-y-6 scroller-hide select-text">
                {/* Evolution Notes */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-main flex items-center justify-between">
                    <span>Evolução Clínica / Notas da Sessão</span>
                    <span className="text-[8px] opacity-40 font-mono tracking-normal text-right font-normal">campo obrigatório para salvar</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Digite aqui os relatos do paciente, reações observadas, pensamentos disfuncionais identificados ou o progresso geral..."
                    className="w-full min-h-[180px] bg-bg-sidebar border border-border-subtle text-text-main text-xs font-semibold rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all leading-relaxed resize-none"
                  />
                </div>

                {/* Homework / Directives */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-main">
                    Deveres de Casa / Observações Futuras
                  </label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Exercícios de THP recomendados, combinados para a próxima sessão, ou alertas para supervisão..."
                    className="w-full min-h-[100px] bg-bg-sidebar border border-border-subtle text-text-main text-xs font-semibold rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all leading-relaxed resize-none"
                  />
                </div>

                {/* Guidance note */}
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 select-none">
                  <Sparkles size={16} className="text-primary shrink-0" />
                  <div>
                    <h5 className="text-[9px] font-black text-primary uppercase tracking-wider mb-0.5">Evolução Automática</h5>
                    <p className="text-[9px] text-text-dim/80 leading-normal font-semibold">
                      Ao clicar em "Encerrar e Evoluir" no cabeçalho, as notas digitadas serão salvas automaticamente na linha do tempo do paciente como uma evolução clínica.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-border-subtle bg-bg-card text-text-main',
        }}
      />
    </div>
  );
}
