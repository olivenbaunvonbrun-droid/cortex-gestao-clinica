import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, User, ChevronRight, Clock, History, Calendar as CalendarIcon, Save, Download, Plus, Sparkles, Trash2, RotateCcw, Folder, Upload, File, MoreHorizontal, Shield, Eye, Edit, X, Maximize2, Wrench, Brain, ClipboardCheck } from 'lucide-react';
import { db, type Patient, type MedicalRecord, type MedicalRecordEntry, logAction, type Attachment } from '../../lib/db';
import { cn, formatDate } from '../../lib/utils';
import { syncService } from '../../lib/syncService';
import { auth } from '../../lib/firebase';
import RichTextEditor from '../RichTextEditor';
import { clinicalInsight } from '../../services/geminiService';
import ConfirmModal from '../ui/ConfirmModal';
import useConfirm from '../../hooks/useConfirm';
import { motion, AnimatePresence } from 'motion/react';

interface RecordsProps {
  preSelectedPatientId?: string | null;
  onClearPreSelection?: () => void;
  onPatientSelected?: (id: string | null) => void;
  openTool?: (toolId: string, patientId?: string | null) => void;
}

export default function Records({ preSelectedPatientId, onClearPreSelection, onPatientSelected, openTool }: RecordsProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [folders, setFolders] = useState<string[]>(['Geral', 'Documentos', 'Exames']);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Geral');
  const [newEntry, setNewEntry] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [settings, setSettings] = useState<any>({});
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [timelineViewMode, setTimelineViewMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [isTimelineFullscreen, setIsTimelineFullscreen] = useState(false);
  const [activeTab, setActiveTab ] = useState<'evolutions' | 'timeline' | 'documents' | 'treatment' | 'longitudinal'>('evolutions');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [longitudinalSummary, setLongitudinalSummary] = useState('');
  const [isGeneratingLongitudinal, setIsGeneratingLongitudinal] = useState(false);
  const [treatmentPlan, setTreatmentPlan] = useState<{ goals: { text: string; completed: boolean }[]; notes: string }>({ goals: [], notes: '' });
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editEventContent, setEditEventContent] = useState('');
  const { confirm, isOpen, options, handleConfirm, close } = useConfirm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const items = await db.settings.toArray();
    const s: any = {};
    items.forEach(item => s[item.key] = item.value);
    setSettings(s);
  };

  const loadTimeline = async (patientId: string) => {
    const appointments = await db.agendamentos
      .where('pacienteId')
      .equals(patientId)
      .toArray();

    const patientRecord = await db.prontuarios.get(patientId);
    const entries = patientRecord?.entradas || [];
    
    // Load Treatment Plan if exists in record
    if (patientRecord?.anamneseData?.treatmentPlan) {
      setTreatmentPlan(patientRecord.anamneseData.treatmentPlan);
    } else {
      setTreatmentPlan({ goals: [], notes: '' });
    }

    const patientAttachments = await db.anexos
      .where('ownerId')
      .equals(patientId)
      .toArray();

    const events: any[] = [];

    // Map entries
    entries.forEach(e => {
      events.push({
        type: 'evolution',
        timestamp: e.timestamp,
        data: e.data,
        title: 'Evolução Clínica',
        content: e.textoHtml,
        icon: 'evolution'
      });
    });

    // Map appointments
    appointments.forEach(a => {
      const apptDate = new Date(`${a.data}T${a.hora}`);
      const now = new Date();
      const isPast = apptDate < now;
      const isCompleted = a.status === 'completed';
      
      const statusLabel = isCompleted ? 'Concluído' : (isPast ? 'NÃO CONCLUÍDO' : 'Futuro');
      const statusClass = isCompleted 
        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
        : (isPast ? 'bg-red-500 text-white border-red-400 font-black animate-pulse' : 'bg-primary/10 text-primary border-primary/20');

      events.push({
        type: 'appointment',
        timestamp: apptDate.getTime(),
        data: a.data,
        hora: a.hora,
        title: `Agendamento ${a.tipo === 'online' ? 'Online' : 'Presencial'}`,
        status: statusLabel,
        statusColor: statusClass,
        content: a.obsAgendamento || '',
        icon: 'appointment',
        isAlert: isPast && !isCompleted
      });
    });

    // Map attachments
    patientAttachments.forEach(att => {
      // Assuming attachments don't have a specific timestamp other than generic creation, 
      // but if they had it would be better. For now we use id or push to bottom.
      events.push({
        type: 'attachment',
        timestamp: att.id || Date.now(), // Fallback if no timestamp
        data: 'Arquivo',
        title: `Upload: ${att.nomeArquivo}`,
        content: `Pasta: ${att.folderName || 'Geral'}`,
        icon: 'attachment',
        file: att
      });
    });

     // Sort by timestamp
    events.sort((a, b) => sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);
    setTimelineEvents(events);
  };

  const renderTimeline = () => {
    return (
      <>
        {timelineViewMode === 'vertical' ? (
          <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-bg-sidebar/50 before:rounded-full">
            {timelineEvents.map((event, idx) => (
              <div key={`timeline-v2-${event.timestamp}-${idx}-${event.type}`} className="relative pl-10 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className={cn(
                  "absolute left-0 top-1 w-6 h-6 rounded-lg flex items-center justify-center border shadow-lg z-10 transition-all group-hover:scale-110",
                  event.type === 'evolution' ? "bg-primary text-bg-deep border-primary" :
                  event.type === 'appointment' ? "bg-amber-500/20 text-amber-500 border-amber-500/30" :
                  "bg-blue-500/20 text-blue-500 border-blue-500/30"
                )}>
                  {event.type === 'evolution' ? <Clock size={12} /> :
                   event.type === 'appointment' ? <CalendarIcon size={12} /> :
                   <File size={12} />}
                </div>

                <div 
                  onClick={() => {
                    if (event.type === 'evolution' || event.type === 'attachment') {
                      setSelectedEvent(event);
                      setEditEventContent(event.content || '');
                      setIsEditingEvent(false);
                    }
                  }}
                  className={cn(
                    "bg-bg-sidebar/30 border border-border-subtle rounded-2xl p-6 hover:bg-bg-sidebar/50 transition-all group/card cursor-pointer",
                    event.isAlert && "border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/5 ring-1 ring-red-500/20"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                          event.type === 'evolution' ? "bg-primary/10 text-primary border-primary/20" :
                          event.type === 'appointment' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          "bg-blue-500/10 text-blue-500 border-blue-500/30",
                          event.isAlert && "bg-red-500 text-white border-red-400"
                        )}>
                          {event.type === 'evolution' ? 'Evolução' :
                           event.type === 'appointment' ? 'Agenda' : 'Arquivo'}
                        </span>
                        <h5 className={cn(
                          "text-[11px] font-bold uppercase tracking-widest",
                          event.isAlert ? "text-red-500" : "text-text-main"
                        )}>{event.title}</h5>
                      </div>
                      <p className="text-[10px] text-text-dim font-medium uppercase tracking-wider flex items-center gap-2">
                        {event.data} {event.hora && `• ${event.hora}`}
                        {event.status && (
                          <span className={cn(
                            "ml-2 px-2 py-0.5 rounded-md text-[7px] font-black uppercase border",
                            event.statusColor
                          )}>
                            {event.status}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(event.type === 'evolution' || event.type === 'attachment') && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-bg-deep transition-all">
                            <Eye size={12} />
                          </button>
                          {event.type === 'evolution' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                                setEditEventContent(event.content || '');
                                setIsEditingEvent(true);
                              }}
                              className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                            >
                              <Edit size={12} />
                            </button>
                          )}
                        </div>
                      )}
                      <span className="text-[10px] text-text-dim/40 font-black tabular-nums whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {event.type === 'evolution' ? (
                    <div className="text-[12px] text-text-main/80 line-clamp-2 record-entry-summary prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: event.content }} />
                  ) : (
                    <p className="text-[11px] text-text-dim leading-relaxed truncate">{event.content}</p>
                  )}

                  {event.type === 'attachment' && event.file && (
                    <div className="mt-4 p-3 bg-bg-card/50 rounded-xl border border-border-subtle flex items-center justify-between group/file">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                          {event.file.tipoArquivo.includes('image') ? <Upload size={14} /> : <File size={14} />}
                        </div>
                        <span className="text-[10px] font-bold text-text-main uppercase tracking-widest truncate max-w-[200px]">
                          {event.file.nomeArquivo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                          className="p-2 text-text-dim hover:text-primary transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <a href={event.file.conteudoArquivo} download={event.file.nomeArquivo} className="p-2 text-text-dim hover:text-primary transition-colors" onClick={e => e.stopPropagation()}>
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {timelineEvents.length === 0 && (
              <div className="py-12 text-center bg-bg-sidebar/20 rounded-[2rem] border border-dashed border-border-subtle">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nenhuma atividade registrada</p>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-bg-sidebar/10 border border-border-subtle rounded-[2rem] p-4 sm:p-8 overflow-hidden">
              {/* Horizontal timeline track wrapper */}
              <div className="relative overflow-x-auto pb-8 pt-12 px-2 sm:px-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-subtle/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/50">
                
                {/* Horizontal connecting line */}
                <div className="absolute top-[162px] left-0 right-0 h-[2px] bg-border-subtle/40 rounded-full" style={{ minWidth: `${Math.max(timelineEvents.length * 280, 800)}px` }} />
                
                {/* Connector dots and event boxes */}
                <div className="relative flex gap-12" style={{ width: `${Math.max(timelineEvents.length * 280, 800)}px` }}>
                  {timelineEvents.map((event, idx) => {
                    const isTop = idx % 2 === 0;
                    return (
                      <div key={`timeline-h-${event.timestamp}-${idx}`} className="flex flex-col items-center w-[250px] shrink-0 relative">
                        {/* Event Card (Positioned Top) */}
                        {isTop && (
                          <div 
                            onClick={() => {
                              if (event.type === 'evolution' || event.type === 'attachment') {
                                setSelectedEvent(event);
                                setEditEventContent(event.content || '');
                                setIsEditingEvent(false);
                              }
                            }}
                            className={cn(
                              "bg-bg-card border border-border-subtle rounded-2xl p-4 w-full h-[120px] flex flex-col justify-between hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer shadow-lg group relative",
                              event.isAlert && "border-red-500/40 bg-red-500/5 shadow-red-500/5"
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border shrink-0",
                                  event.type === 'evolution' ? "bg-primary/10 text-primary border-primary/25" :
                                  event.type === 'appointment' ? "bg-amber-500/10 text-amber-500 border-amber-500/25" :
                                  "bg-blue-500/10 text-blue-500 border-blue-500/25"
                                )}>
                                  {event.type === 'evolution' ? 'Evolução' : event.type === 'appointment' ? 'Agendamento' : 'Documento'}
                                </span>
                                <span className="text-[8px] font-mono text-text-dim">{event.data}</span>
                              </div>
                              <h5 className="text-[11px] font-medium text-text-main truncate group-hover:text-primary transition-colors">{event.title}</h5>
                            </div>
                            <div className="text-[10px] text-text-dim truncate line-clamp-1 prose prose-invert prose-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: event.content }} />
                          </div>
                        )}
                        
                        {/* Empty space filler for vertical alternation */}
                        {!isTop && <div className="h-[120px] w-full" />}
                        
                        {/* Central Node Indicator */}
                        <div className="my-[20px] relative z-20 flex flex-col items-center">
                          <div className={cn(
                            "w-7 h-7 rounded-full border-4 border-bg-deep flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                            event.type === 'evolution' ? "bg-primary text-bg-deep" :
                            event.type === 'appointment' ? "bg-amber-500 text-bg-deep" :
                            "bg-blue-500 text-white"
                          )}>
                            {event.type === 'evolution' ? <Clock size={10} /> :
                             event.type === 'appointment' ? <CalendarIcon size={10} /> :
                             <File size={10} />}
                          </div>
                        </div>
                        
                        {/* Event Card (Positioned Bottom) */}
                        {!isTop && (
                          <div 
                            onClick={() => {
                              if (event.type === 'evolution' || event.type === 'attachment') {
                                setSelectedEvent(event);
                                setEditEventContent(event.content || '');
                                setIsEditingEvent(false);
                              }
                            }}
                            className={cn(
                              "bg-bg-card border border-border-subtle rounded-2xl p-4 w-full h-[120px] flex flex-col justify-between hover:border-primary/40 hover:translate-y-1 transition-all cursor-pointer shadow-lg group relative",
                              event.isAlert && "border-red-500/40 bg-red-500/5 shadow-red-500/5"
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border shrink-0",
                                  event.type === 'evolution' ? "bg-primary/10 text-primary border-primary/25" :
                                  event.type === 'appointment' ? "bg-amber-500/10 text-amber-500 border-amber-500/25" :
                                  "bg-blue-500/10 text-blue-500 border-blue-500/25"
                                )}>
                                  {event.type === 'evolution' ? 'Evolução' : event.type === 'appointment' ? 'Agendamento' : 'Documento'}
                                </span>
                                <span className="text-[8px] font-mono text-text-dim">{event.data}</span>
                              </div>
                              <h5 className="text-[11px] font-medium text-text-main truncate group-hover:text-primary transition-colors">{event.title}</h5>
                            </div>
                            <div className="text-[10px] text-text-dim truncate line-clamp-1 prose prose-invert prose-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: event.content }} />
                          </div>
                        )}
                        
                        {/* Empty space filler for vertical alternation */}
                        {isTop && <div className="h-[120px] w-full" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const generateLongitudinalProfile = async () => {
    if (!selectedPatient || timelineEvents.length === 0) return;
    setIsGeneratingLongitudinal(true);
    try {
      const historyText = timelineEvents
        .map(e => `${e.data} [${e.type}]: ${e.title} - ${e.content}`)
        .join('\n\n');
      
      const aiService = await import('../../services/geminiService');
      const approach = settings.selectedApproach || 'TCC';
      const text = await aiService.generateLongitudinalProfile(historyText, approach);
      setLongitudinalSummary(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingLongitudinal(false);
    }
  };

  const handleSaveLongitudinalSummary = async () => {
    if (!selectedPatient || !longitudinalSummary) return;
    try {
      await db.prontuarios.update(selectedPatient.id, { longitudinalProfile: longitudinalSummary });
      const recordUpdate = await db.prontuarios.get(selectedPatient.id);
      if (recordUpdate) setRecord(recordUpdate);
      
      const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
      logAction(currentUser, `Salvou Perfil Longitudinal: ${selectedPatient.nome}`);
      alert("Perfil Longitudinal salvo com sucesso no prontuário.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLongitudinalSummary = () => {
    confirm({
      title: 'Excluir Perfil Longitudinal',
      message: 'Deseja remover o panorama longitudinal atual? Esta ação limpará a análise gerada pela IA.',
      confirmLabel: 'Limpar Perfil',
      variant: 'danger',
      onConfirm: async () => {
        if (!selectedPatient) return;
        await db.prontuarios.update(selectedPatient.id, { longitudinalProfile: '' });
        setLongitudinalSummary('');
        const recordUpdate = await db.prontuarios.get(selectedPatient.id);
        if (recordUpdate) setRecord(recordUpdate);
        
        const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
        logAction(currentUser, `Removeu Perfil Longitudinal: ${selectedPatient.nome}`);
      }
    });
  };

  useEffect(() => {
    if (selectedPatient) {
      loadTimeline(selectedPatient.id);
    }
  }, [sortOrder]);
  
  useEffect(() => {
    loadPatients();
  }, [searchTerm]);

  const lastAppliedPreSelectedId = useRef<string | null>(null);

  useEffect(() => {
    if (preSelectedPatientId && patients.length > 0 && preSelectedPatientId !== lastAppliedPreSelectedId.current) {
      const p = patients.find(pat => pat.id === preSelectedPatientId);
      if (p) {
        lastAppliedPreSelectedId.current = preSelectedPatientId;
        handleSelectPatient(p);
      }
    }
  }, [preSelectedPatientId, patients]);

  const loadPatients = async () => {
    const all = await db.pacientes.toArray();
    const filtered = all.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    setPatients(filtered);
  };

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    if (onPatientSelected) {
      onPatientSelected(patient.id);
    }
    let r = await db.prontuarios.get(patient.id);
    if (!r) {
      r = { pacienteId: patient.id, entradas: [], anamneseData: {} };
      await db.prontuarios.add(r);
    }
    setRecord(r);
    setAiAnalysis('');
    setAiError('');
    setLongitudinalSummary(r.longitudinalProfile || '');
    
    // Load attachments
    const patientAttachments = await db.anexos
      .where('ownerId')
      .equals(patient.id)
      .and(a => a.ownerType === 'prontuario')
      .toArray();
    setAttachments(patientAttachments);

    // Collect custom folders from attachments
    const customFolders = Array.from(new Set(patientAttachments.map(a => a.folderName).filter(Boolean))) as string[];
    setFolders(prev => Array.from(new Set([...prev, ...customFolders])));

    // Refresh Timeline
    loadTimeline(patient.id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedPatient) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const attachment: Attachment = {
          ownerId: selectedPatient.id,
          ownerType: 'prontuario',
          folderName: selectedFolder,
          nomeArquivo: file.name,
          tipoArquivo: file.type,
          conteudoArquivo: reader.result as string
        };
        await db.anexos.add(attachment);
        
        // Refresh
        const updated = await db.anexos
          .where('ownerId')
          .equals(selectedPatient.id)
          .and(a => a.ownerType === 'prontuario')
          .toArray();
        setAttachments(updated);
        loadTimeline(selectedPatient.id);
      };
      reader.readAsDataURL(file);
    }
    
    const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
    logAction(currentUser, `Upload de ${files.length} arquivo(s) para: ${selectedPatient.nome}`);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders(prev => [...new Set([...prev, newFolderName.trim()])]);
    setSelectedFolder(newFolderName.trim());
    setNewFolderName('');
  };

  const handleDeleteAttachment = async (id: number) => {
    await db.anexos.delete(id);
    const firebaseUid = auth.currentUser?.uid;
    if (firebaseUid) {
      await syncService.removeFromCloud(firebaseUid, 'anexos', String(id));
    }
    setAttachments(prev => prev.filter(a => a.id !== id));
    if (selectedPatient) {
      loadTimeline(selectedPatient.id);
    }
  };

  const handleOpenInNewTab = (file: Attachment) => {
    if (!file || !file.conteudoArquivo) return;
    try {
      const base64Data = file.conteudoArquivo;
      const mimeType = file.tipoArquivo || 'application/octet-stream';
      
      const parts = base64Data.split(';base64,');
      const raw = window.atob(parts[1] || parts[0]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      
      const blob = new Blob([uInt8Array], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (e) {
      console.error("Erro ao abrir arquivo em nova aba:", e);
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<iframe src="${file.conteudoArquivo}" style="border:none; width:100%; height:100%;"></iframe>`);
      }
    }
  };

  const getFolderFiles = (folder: string) => {
    return attachments.filter(a => (a.folderName || 'Geral') === folder);
  };

  const handleAddEntry = async () => {
    if (!newEntry || !selectedPatient || !record) return;

    const entry: MedicalRecordEntry = {
      timestamp: Date.now(),
      data: new Date().toISOString().split('T')[0],
      textoHtml: newEntry
    };

    const updatedEntradas = [entry, ...record.entradas];
    await db.prontuarios.update(selectedPatient.id, { entradas: updatedEntradas });
    setRecord({ ...record, entradas: updatedEntradas });
    setNewEntry('');
    setAiAnalysis('');
    
    loadTimeline(selectedPatient.id);

    const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
    logAction(currentUser, `Nova evolução de prontuário: ${selectedPatient.nome}`);
  };

  const handleUpdateTreatmentPlan = async (newPlan: typeof treatmentPlan) => {
    if (!selectedPatient || !record) return;
    const updatedRecord = {
      ...record,
      anamneseData: {
        ...record.anamneseData,
        treatmentPlan: newPlan
      }
    };
    await db.prontuarios.update(selectedPatient.id, { anamneseData: updatedRecord.anamneseData });
    setRecord(updatedRecord);
    setTreatmentPlan(newPlan);
    
    const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
    logAction(currentUser, `Atualizou plano de tratamento: ${selectedPatient.nome}`);
  };

  const handleDeleteEntry = (timestamp: number) => {
    confirm({
      title: 'Excluir Evolução',
      message: 'Deseja realmente remover esta entrada do histórico? Esta ação é irreversível conforme auditoria clínica.',
      confirmLabel: 'Excluir Registro',
      variant: 'danger',
      onConfirm: async () => {
        if (!selectedPatient || !record) return;
        const updatedEntradas = record.entradas.filter(e => e.timestamp !== timestamp);
        await db.prontuarios.update(selectedPatient.id, { entradas: updatedEntradas });
        setRecord({ ...record, entradas: updatedEntradas });
        
        const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
        logAction(currentUser, `Removeu entrada de histórico: ${selectedPatient.nome}`);
      }
    });
  };

  const handleAnalyzeWithAI = async () => {
    if (!newEntry || !selectedPatient || !record) return;
    
    setIsAiLoading(true);
    setAiError('');
    try {
      const historyText = record.entradas.slice(0, 5).map(e => e.textoHtml).join('\n---\n');
      const analysis = await clinicalInsight(historyText, newEntry);
      setAiAnalysis(analysis);
      
      const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
      logAction(currentUser, `Gerou insight de IA para: ${selectedPatient.nome}`);
    } catch (err: any) {
      setAiError(err.message || 'Erro ao processar análise.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveEditedEvent = async () => {
    if (!selectedPatient || !record || !selectedEvent) return;

    if (selectedEvent.type === 'evolution') {
      const updatedEntradas = record.entradas.map(e => 
        e.timestamp === selectedEvent.timestamp 
          ? { ...e, textoHtml: editEventContent } 
          : e
      );
      await db.prontuarios.update(selectedPatient.id, { entradas: updatedEntradas });
      setRecord({ ...record, entradas: updatedEntradas });
      
      const currentUser = localStorage.getItem('psiCurrentUsername_v9') || 'unknown';
      logAction(currentUser, `Editou evolução clínica (ID: ${selectedEvent.timestamp}): ${selectedPatient.nome}`);
      
      loadTimeline(selectedPatient.id);
      setSelectedEvent(null);
      setIsEditingEvent(false);
    }
  };

  const handleClearForm = () => {
    confirm({
      title: 'Limpar Edição',
      message: 'Deseja resetar o formulário atual? Todo o texto da nova evolução e a análise de IA serão perdidos.',
      confirmLabel: 'Resetar Campos',
      onConfirm: () => {
        setNewEntry('');
        setAiAnalysis('');
        setAiError('');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-bg-card border border-border-subtle rounded-[2rem] p-8 h-full shadow-xl">
          <h3 className="text-xl font-display font-bold text-text-main mb-6 tracking-tight">Evolução Clínica</h3>
          <div className="relative mb-8 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="Buscar prontuário..."
              className="w-full pl-12 pr-4 py-3.5 bg-bg-sidebar border border-border-subtle rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-xs font-bold uppercase tracking-widest placeholder:text-text-dim/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto scroller-hide pr-2">
            {patients.map((p, pIdx) => (
              <button
                key={`side-patient-v2-${p.id || pIdx}-${pIdx}`}
                onClick={() => handleSelectPatient(p)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                  selectedPatient?.id === p.id 
                    ? "bg-primary/5 border-primary/30 text-primary shadow-inner" 
                    : "bg-bg-sidebar/40 border-border-subtle text-text-dim hover:border-primary/20 hover:text-text-main"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-xs transition-colors overflow-hidden shrink-0", selectedPatient?.id === p.id ? "bg-primary text-bg-deep" : "bg-bg-card text-text-dim group-hover:text-primary")}>
                    {p.fotoPerfilDataUrl ? (
                      <img src={p.fotoPerfilDataUrl} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      p.nome[0].toUpperCase()
                    )}
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest truncate">{p.nome}</span>
                </div>
                <ChevronRight size={14} className={cn("transition-transform", selectedPatient?.id === p.id ? "translate-x-1" : "")} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col">
        {selectedPatient && record ? (
          <div className="space-y-8 flex-grow animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-bg-card border border-border-subtle rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[8rem] -mr-32 -mt-32 pointer-events-none" />

                <div className="flex items-center justify-between mb-12 gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-bg-sidebar border border-border-subtle shadow-inner flex items-center justify-center overflow-hidden">
                    {selectedPatient.fotoPerfilDataUrl ? (
                      <img src={selectedPatient.fotoPerfilDataUrl} alt={selectedPatient.nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display font-black text-3xl text-primary uppercase">{selectedPatient.nome[0]}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-bold text-text-main tracking-tight">{selectedPatient.nome}</h2>
                    <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                       <span className="w-4 h-[1px] bg-primary/40" /> Gestão de Prontuário Clínico
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (!printWindow) {
                        alert("Por favor, permita pop-ups para este site para poder visualizar o contrato.");
                        return;
                      }
                      const clinicTitle = settings.appTitle || "Gestão Clínica Psicológica";
                      const psychName = (!settings.appTitle || settings.appTitle === "Sistema de Gestão para Psicólogos") ? "Psicólogo(a)" : settings.appTitle;
                      const psychCrp = settings.psychCrp || "_________________";
                      const dateStr = new Date().toLocaleDateString('pt-BR');

                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Contrato Terapêutico - ${selectedPatient.nome}</title>
                                <style>
                                  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap');
                                  
                                  @page {
                                    size: A4;
                                    margin: 15mm 20mm;
                                  }

                                  body { 
                                    font-family: 'Inter', sans-serif; 
                                    line-height: 1.5; 
                                    color: #0f172a; 
                                    margin: 0;
                                    background: #fff;
                                    font-size: 11px;
                                  }

                                  .header { 
                                    text-align: center; 
                                    margin-bottom: 30px; 
                                    border-bottom: 0.5pt solid #e2e8f0; 
                                    padding-bottom: 15px; 
                                  }

                                  .document-title { 
                                    text-transform: uppercase; 
                                    letter-spacing: 0.25em; 
                                    font-size: 16px; 
                                    font-weight: 800; 
                                    color: #000; 
                                  }

                                  h1, h2, h3 { 
                                    color: #000; 
                                    margin-top: 15px; 
                                    margin-bottom: 8px; 
                                    page-break-after: avoid;
                                  }

                                  h2, h3 { 
                                    font-size: 13px; 
                                    border-left: 2pt solid #000; 
                                    padding-left: 10px; 
                                    text-transform: uppercase; 
                                    letter-spacing: 0.02em; 
                                    font-weight: 700;
                                  }

                                  .content { 
                                    text-align: justify; 
                                  }

                                  .content p { margin-bottom: 10px; }

                                  .date-place { 
                                    margin-top: 30px; 
                                    font-weight: 600; 
                                    color: #000; 
                                    font-size: 11px;
                                  }

                                  .signatures-container { 
                                    display: grid; 
                                    grid-template-columns: 1fr 1fr; 
                                    gap: 40px; 
                                    margin-top: 50px; 
                                    page-break-inside: avoid;
                                  }

                                  .signature-block { 
                                    text-align: center; 
                                  }

                                  .signature-line { 
                                    border-top: 0.5pt solid #000; 
                                    margin-bottom: 6px; 
                                  }

                                  .signature-name { 
                                    font-weight: 700; 
                                    font-size: 11px; 
                                  }

                                  .signature-role { 
                                    font-size: 9px; 
                                    text-transform: uppercase; 
                                    letter-spacing: 0.05em; 
                                    color: #475569; 
                                    font-weight: 600; 
                                  }

                                  .footer { 
                                    position: fixed;
                                    bottom: 0;
                                    left: 0;
                                    right: 0;
                                    text-align: center; 
                                    font-size: 8px; 
                                    color: #94a3b8; 
                                    font-weight: 600; 
                                    text-transform: uppercase; 
                                    letter-spacing: 0.1em; 
                                    padding-top: 10px;
                                    border-top: 0.5pt solid #f1f5f9;
                                  }

                                  @media print { 
                                    body { -webkit-print-color-adjust: exact; }
                                    .header { border-bottom-color: #000; }
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div class="document-title">Contrato de Prestação de Serviços Psicológicos</div>
                                </div>

                                <div class="content">
                                  ${selectedPatient.contratoTerapeuticoHtml}
                                </div>

                                <div class="date-place">
                                  Local e data: ___________________________, ${dateStr}
                                </div>

                                <div class="signatures-container">
                                  <div class="signature-block">
                                    <div class="signature-line"></div>
                                    <div class="signature-name">${selectedPatient.isMenor ? (selectedPatient.responsavelNome || '[Nome do Responsável]') : (selectedPatient.nome || '[Nome do Paciente]')}</div>
                                    <div class="signature-role">${selectedPatient.isMenor ? 'Responsável Legal' : 'Paciente'}</div>
                                    <div class="signature-role">CPF: ${selectedPatient.isMenor ? (selectedPatient.responsavelCpf || '___________') : (selectedPatient.cpf || '___________')}</div>
                                  </div>

                                  <div class="signature-block">
                                    <div class="signature-line"></div>
                                    <div class="signature-name">${psychName}</div>
                                    <div class="signature-role">Psicólogo(a)</div>
                                    <div class="signature-role">CRP nº ${psychCrp}</div>
                                  </div>
                                </div>

                                <div class="footer">Gerado digitalmente via PSI.CORE</div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          printWindow.print();
                      }}
                      className="flex items-center gap-3 px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary transition-all group"
                    >
                      <Shield size={14} className="group-hover:scale-110 transition-transform" /> Ver Contrato
                    </button>
                  <button 
                    onClick={async () => {
                      const { exportDatabase } = await import('../../lib/backupService');
                      await exportDatabase();
                    }}
                    className="flex items-center gap-3 px-6 py-3 bg-bg-sidebar hover:bg-white/5 border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-main transition-all group"
                  >
                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> Backup Total
                  </button>
                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        const content = `
                          <html>
                            <head>
                              <title>Prontuário - ${selectedPatient.nome}</title>
                              <style>
                                body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                                .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
                                .entry { margin-bottom: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
                                .entry-header { display: flex; justify-content: space-between; margin-bottom: 10px; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; }
                                h1 { margin: 0; color: #0f172a; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <h1>Prontuário Clínico</h1>
                                <p>Paciente: ${selectedPatient.nome} | CPF: ${selectedPatient.cpf || 'Não informado'}</p>
                              </div>
                              ${record.entradas.map((e, idx) => `
                                <div class="entry">
                                  <div class="entry-header">
                                    <span>Sessão ${record.entradas.length - idx}</span>
                                    <span>${new Date(e.timestamp).toLocaleString('pt-BR')}</span>
                                  </div>
                                  <div>${e.textoHtml}</div>
                                </div>
                              `).join('')}
                            </body>
                          </html>
                        `;
                        printWindow.document.write(content);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="flex items-center gap-3 px-6 py-3 bg-bg-sidebar hover:bg-white/5 border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-main transition-all group"
                  >
                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> Exportar Prontuário
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mb-10 border-b border-border-subtle pb-4 overflow-x-auto scroller-hide pt-1">
                {[
                  { id: 'evolutions', label: 'Evoluções', icon: FileText },
                  { id: 'timeline', label: 'Linha do Tempo', icon: Clock },
                  { id: 'documents', label: 'Documentos', icon: Folder },
                  { id: 'treatment', label: 'Plano e Metas', icon: Shield },
                  { id: 'longitudinal', label: 'Perfil Longitudinal (IA)', icon: Sparkles },
                ].map((tab: any) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border border-transparent",
                      activeTab === tab.id 
                        ? tab.id === 'longitudinal'
                          ? "bg-indigo-500 text-white border-indigo-400/30 shadow-lg shadow-indigo-500/20"
                          : "bg-primary text-bg-deep border-primary shadow-lg shadow-primary/20" 
                        : "bg-bg-sidebar/20 text-text-dim border-border-subtle hover:text-text-main hover:border-primary/20"
                    )}
                  >
                    <tab.icon size={14} /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-10 relative z-10">
                 {activeTab === 'evolutions' && (
                   <div className="animate-in fade-in duration-500">
                      <div className="flex items-center justify-between mb-6">
                       <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] flex items-center gap-3">
                        <Plus size={14} className="text-primary" /> Registro de Sessão Atual
                      </h4>
                      <div className="flex items-center gap-3">
                        {openTool && (
                          <>
                            <button
                              onClick={() => openTool('rid-inteligente', selectedPatient?.id)}
                              className="flex items-center gap-2 py-1.5 px-3.5 bg-primary/10 border border-primary/25 hover:bg-primary hover:text-bg-deep text-[9px] font-black uppercase tracking-widest text-primary rounded-xl transition-all cursor-pointer shadow-sm"
                              title="Abrir RID Inteligente na tela"
                            >
                              <Brain size={11} />
                              Usar RID
                            </button>
                            <button
                              onClick={() => openTool('ihs-digital', selectedPatient?.id)}
                              className="flex items-center gap-2 py-1.5 px-3.5 bg-primary/10 border border-primary/25 hover:bg-primary hover:text-bg-deep text-[9px] font-black uppercase tracking-widest text-primary rounded-xl transition-all cursor-pointer shadow-sm"
                              title="Abrir IHS Digital na tela"
                            >
                              <ClipboardCheck size={11} />
                              Usar IHS
                            </button>
                          </>
                        )}
                        <button
                          onClick={handleClearForm}
                          className="p-2 text-text-dim hover:text-amber-500 transition-all"
                          title="Limpar formulário"
                        >
                          <RotateCcw size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-bg-sidebar rounded-3xl border border-border-subtle overflow-hidden shadow-inner focus-within:border-primary/30 transition-colors">
                      <RichTextEditor
                        value={newEntry}
                        onChange={setNewEntry}
                        placeholder="Descreva a dinâmica da sessão, intervenções e observações clínicas..."
                        minHeight="180px"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-end mt-6 gap-4">
                       <button
                         onClick={handleAnalyzeWithAI}
                         disabled={!newEntry || isAiLoading}
                         className="w-full md:w-auto px-8 py-4 bg-bg-sidebar hover:bg-white/5 border border-border-subtle text-text-main font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                       >
                         {isAiLoading ? (
                           <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                         ) : (
                           <Sparkles size={16} className="text-primary" />
                         )}
                         Analisar com Insight IA
                       </button>

                       <button
                         onClick={handleAddEntry}
                         disabled={!newEntry}
                         className="w-full md:w-auto px-10 py-4 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                       >
                         <Save size={18} /> Registrar Evolução
                       </button>
                    </div>

                    {aiError && (
                      <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">{aiError}</p>
                      </div>
                    )}

                        {aiAnalysis && (
                          <div className="mt-8 p-10 bg-primary/5 border border-primary/10 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-500">
                            <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                              <Sparkles size={12} /> Insight Clínico (Gemini 1.5 Flash)
                            </h5>
                            <div className="prose prose-invert prose-sm max-w-none text-text-main/80 leading-relaxed font-medium">
                              {aiAnalysis.split('\n').map((line, i) => (
                                <p key={`ai-insight-line-${i}-${selectedPatient.id}`} className="mb-2">{line}</p>
                              ))}
                            </div>
                          </div>
                        )}

                    <hr className="border-border-subtle/50 my-12" />

                    <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                      <History size={14} className="text-primary" /> Histórico Evolutivo Consolidado
                    </h4>
                    <div className="space-y-8">
                       {record && record.entradas && record.entradas.length > 0 ? (
                         [...record.entradas].sort((a, b) => b.timestamp - a.timestamp).map((entry, idx) => (
                           <div key={`hist-entry-v2-${entry.timestamp}-${idx}`} className="relative pl-12 border-l border-border-subtle pb-10 last:pb-0 group/entry">
                             <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-border-subtle group-hover/entry:bg-primary transition-colors" />
                             <div className="bg-bg-sidebar/40 border border-border-subtle rounded-[1.5rem] p-8 group hover:border-primary/20 transition-all hover:bg-bg-card/50 relative">
                               
                               <button 
                                 onClick={() => {
                                   confirm({
                                     title: 'Excluir Evolução',
                                     message: 'Tem certeza que deseja excluir esta evolução? Esta ação não pode ser desfeita.',
                                     confirmLabel: 'Excluir',
                                     variant: 'danger',
                                     onConfirm: () => handleDeleteEntry(entry.timestamp)
                                   });
                                 }}
                                 className="absolute top-8 right-8 p-2 text-text-dim/20 hover:text-red-500 transition-colors opacity-0 group-hover/entry:opacity-100"
                               >
                                 <Trash2 size={16} />
                               </button>

                               <div className="flex items-center justify-between mb-6">
                                 <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary">Sessão {record.entradas.length - idx}</span>
                                    <span className="flex items-center gap-2 text-[10px] text-text-dim font-bold uppercase tracking-widest border-l border-border-subtle pl-4 pr-12">
                                      <CalendarIcon size={12} /> {formatDate(entry.data)}
                                    </span>
                                 </div>
                                 <span className="flex items-center gap-2 text-[10px] text-text-dim/40 font-black tabular-nums">
                                   <Clock size={12} /> {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                               </div>
                               <div className="text-text-main/90 record-entry-content prose prose-invert max-w-none prose-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: entry.textoHtml }} />
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-20 bg-bg-sidebar/30 border border-dashed border-border-subtle rounded-[2rem]">
                            <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nenhuma evolução registrada para este paciente</p>
                         </div>
                       )}
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                      <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] flex items-center gap-3">
                        <Folder size={14} className="text-primary" /> Documentos e Arquivos do Paciente
                      </h4>
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          placeholder="Nova Pasta..." 
                          className="bg-bg-sidebar border border-border-subtle rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/50"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                        />
                        <button onClick={handleAddFolder} className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-bg-deep transition-all">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto scroller-hide pb-4 mb-6">
                      {folders.map((folder, idx) => (
                        <button
                          key={`folder-tab-${folder}-${idx}-${selectedPatient.id}`}
                          onClick={() => setSelectedFolder(folder)}
                          className={cn(
                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                            selectedFolder === folder 
                              ? "bg-primary text-bg-deep border-primary shadow-lg shadow-primary/20" 
                              : "bg-bg-sidebar/40 text-text-dim border-border-subtle hover:border-primary/20"
                          )}
                        >
                          {folder} ({getFolderFiles(folder).length})
                        </button>
                      ))}
                    </div>

                    <div className="bg-bg-sidebar/20 border-2 border-dashed border-border-subtle rounded-[2rem] p-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                          {getFolderFiles(selectedFolder).map((file, fIdx) => (
                           <div key={`file-${file.id || fIdx}`} className="bg-bg-card border border-border-subtle p-4 rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-all">
                               <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-bg-deep transition-colors">
                                  {file.tipoArquivo.includes('image') ? <Upload size={16} /> : <File size={16} />}
                               </div>
                               <div className="flex-grow min-w-0">
                                  <p className="text-[10px] font-bold text-text-main truncate uppercase tracking-widest">{file.nomeArquivo}</p>
                                  <p className="text-[8px] font-black text-text-dim uppercase tracking-tighter mt-0.5">{file.tipoArquivo.split('/')[1]}</p>
                               </div>
                               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => setSelectedEvent({
                                      type: 'attachment',
                                      timestamp: file.id || Date.now(),
                                      data: 'Arquivo',
                                      title: `Arquivo: ${file.nomeArquivo}`,
                                      content: `<iframe src="${file.conteudoArquivo}" class="w-full h-[600px] border-none rounded-2xl" />`,
                                      icon: 'attachment',
                                      file
                                    })} 
                                    className="p-2 text-text-dim hover:text-primary cursor-pointer"
                                    title="Visualizar documento"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <a href={file.conteudoArquivo} download={file.nomeArquivo} className="p-2 text-text-dim hover:text-primary">
                                    <Download size={14} />
                                  </a>
                                  <button onClick={() => handleDeleteAttachment(file.id!)} className="p-2 text-text-dim hover:text-red-500 cursor-pointer">
                                    <Trash2 size={14} />
                                  </button>
                               </div>
                            </div>
                          ))}
                          {getFolderFiles(selectedFolder).length === 0 && (
                            <div className="col-span-full py-10 text-center">
                               <p className="text-[10px] font-black text-text-dim/20 uppercase tracking-[0.2em]">Pasta Vazia</p>
                            </div>
                          )}
                       </div>

                       <label className="flex flex-col items-center justify-center p-8 border border-border-subtle rounded-2xl bg-bg-sidebar/40 hover:bg-white/5 cursor-pointer transition-all group">
                          <Upload className="text-text-dim/20 group-hover:text-primary mb-4 transition-colors" size={24} />
                          <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Clique ou arraste para upload ilimitado</span>
                          <span className="text-[8px] font-bold text-text-dim/40 uppercase tracking-tighter mt-1">HTML, PDF, JPEG, PNG (MÁX 5MB/FILE)</span>
                          <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".html,.pdf,.jpeg,.jpg,.png" />
                       </label>
                    </div>
                 </div>
                 )}

                 {activeTab === 'timeline' && (
                    <div className="animate-in fade-in duration-500">
                       <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                         <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] flex items-center gap-3">
                           <Clock size={14} className="text-primary" /> Linha do Tempo e Histórico Unificado
                         </h4>
                         <div className="flex flex-wrap items-center gap-4">
                           <div className="flex items-center gap-1 bg-bg-sidebar/40 p-1.5 rounded-2xl border border-border-subtle">
                             <button
                               onClick={() => setTimelineViewMode('vertical')}
                               className={cn(
                                 "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                 timelineViewMode === 'vertical' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main"
                               )}
                             >
                               Vertical
                             </button>
                             <button
                               onClick={() => setTimelineViewMode('horizontal')}
                               className={cn(
                                 "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                 timelineViewMode === 'horizontal' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main"
                               )}
                             >
                               Horizontal
                             </button>
                           </div>
                           <button
                             onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                             className="flex items-center gap-2 px-4 py-2 bg-bg-sidebar hover:bg-white/5 border border-border-subtle rounded-xl text-[9px] font-black uppercase tracking-widest text-text-dim transition-all cursor-pointer"
                           >
                             <History size={12} className={cn("transition-transform", sortOrder === 'asc' && "rotate-180")} />
                             {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigos'}
                           </button>
                           <button
                             onClick={() => setIsTimelineFullscreen(true)}
                             className="flex items-center gap-2 px-4 py-2 bg-bg-sidebar hover:bg-white/5 border border-border-subtle rounded-xl text-[9px] font-black uppercase tracking-widest text-text-dim transition-all cursor-pointer"
                             title="Visualizar em Tela Cheia"
                           >
                             <Maximize2 size={12} />
                             Tela Cheia
                           </button>
                         </div>
                       </div>
                       {renderTimeline()}
                    </div>
                  )}

                {activeTab === 'longitudinal' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-12 bg-indigo-500/5 border border-indigo-500/10 rounded-[3rem] mb-12 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-bl-[8rem] pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                       <div className="max-w-2xl relative z-10">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                               <Sparkles size={20} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-text-main tracking-tight">Síntese Clínica Longitudinal</h3>
                         </div>
                         <p className="text-text-dim text-sm font-medium leading-relaxed">
                           Nossa inteligência artificial processa a totalidade do histórico clínico para identificar padrões, evolução sintomática e marcos terapêuticos fundamentais sob a ótica da abordagem <span className="text-indigo-400 font-black">{settings.selectedApproach || 'TCC'}</span>.
                         </p>
                       </div>
                       <button 
                         onClick={generateLongitudinalProfile}
                         disabled={isGeneratingLongitudinal}
                         className="shrink-0 px-8 py-5 bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all flex items-center gap-3 disabled:opacity-50 relative z-10 w-full md:w-auto justify-center"
                       >
                         {isGeneratingLongitudinal ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : longitudinalSummary ? (
                           <RotateCcw size={16} />
                         ) : (
                           <Sparkles size={16} />
                         )}
                         {longitudinalSummary ? 'Atualizar Panorama' : 'Gerar Panorama Sintético'}
                       </button>
                    </div>

                    {longitudinalSummary ? (
                      <div className="space-y-6">
                        <div className="bg-bg-card border border-border-subtle rounded-[3rem] p-8 sm:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative ring-1 ring-primary/5 uppercase">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-border-subtle/30 mb-8">
                              <div>
                                 <h1 className="text-3xl sm:text-4xl font-display font-black text-text-main mb-2 tracking-tighter">Panorama Transversal Digital</h1>
                                 <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em]">Auditoria de Histórico • Sistematização Técnica • {settings.selectedApproach || 'Geral'}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                                 <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl backdrop-blur-md">
                                    <Sparkles size={14} className="text-indigo-500" />
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">IA Clínica • Documento de Supervisão</span>
                                 </div>
                                 <button 
                                   onClick={handleDeleteLongitudinalSummary}
                                   className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                   title="Excluir Perfil"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                              </div>
                            </div>
                            
                            <div className="relative z-0 prose prose-invert prose-indigo max-w-none prose-headings:font-display prose-headings:tracking-tight prose-p:text-text-main/90 prose-p:leading-relaxed prose-li:text-text-main/80">
                              {longitudinalSummary.split('\n').map((line, i) => {
                               const key = `longit-${selectedPatient.id}-${i}`;
                               if (line.startsWith('# ')) return <h1 key={key} className="text-3xl font-display font-black text-text-main mb-6 mt-12">{line.replace('# ', '')}</h1>;
                               if (line.startsWith('## ')) return <h2 key={key} className="text-xl font-display font-bold text-indigo-400 mb-4 mt-10 border-l-4 border-indigo-500/30 pl-6">{line.replace('## ', '')}</h2>;
                               if (line.startsWith('### ')) return <h3 key={key} className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-4 mt-8 bg-indigo-500/10 py-2 px-4 inline-block rounded-xl border border-indigo-500/20">{line.replace('### ', '')}</h3>;
                               if (line.startsWith('- ') || line.startsWith('* ')) return <li key={key} className="ml-4 mb-3 text-text-main/80 pl-2 marker:text-indigo-500">{line.substring(2)}</li>;
                               if (!line.trim()) return <div key={key} className="h-4" />;
                               return <p key={key} className="mb-6 text-text-main/90 leading-relaxed font-medium text-sm text-justify">{line}</p>;
                             })}
                           </div>
                        </div>

                        <div className="flex justify-center">
                           <button 
                             onClick={handleSaveLongitudinalSummary}
                             className="flex items-center gap-4 px-12 py-5 bg-primary text-bg-deep font-black uppercase tracking-[0.2em] text-[11px] rounded-[2rem] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all"
                           >
                             <Save size={18} /> Fixar Perfil no Prontuário
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-32 opacity-20 border-2 border-dashed border-border-subtle rounded-[3rem] bg-bg-sidebar/20">
                         <History size={64} className="mb-6 text-text-dim" />
                         <p className="text-sm font-black uppercase tracking-[0.3em] text-text-dim">Clique no botão acima para sintetizar o perfil técnico</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'treatment' && (
                  <div className="animate-in fade-in duration-500 space-y-10">
                    <div>
                      <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                        <Shield size={14} className="text-primary" /> Plano de Tratamento e Metas Terapêuticas
                      </h4>
                      
                      <div className="bg-bg-sidebar/40 border border-border-subtle rounded-[2rem] p-10 space-y-8">
                         <div>
                           <p className="text-[9px] font-black text-text-dim uppercase tracking-widest mb-4">Progresso das Metas</p>
                           <div className="w-full h-2 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-1000" 
                                style={{ width: `${treatmentPlan.goals.length > 0 ? (treatmentPlan.goals.filter(g => g.completed).length / treatmentPlan.goals.length) * 100 : 0}%` }} 
                              />
                           </div>
                         </div>

                         <div className="space-y-4">
                           <p className="text-[9px] font-black text-text-dim uppercase tracking-widest mb-2">Checklist de Evolução</p>
                           <div className="space-y-3">
                              {treatmentPlan.goals.map((goal, idx) => (
                                <div key={`tp-goal-${idx}-${goal.text.substring(0, 10)}`} className="flex items-center gap-4 bg-bg-card border border-border-subtle p-4 rounded-xl group">
                                   <input 
                                     type="checkbox" 
                                     checked={goal.completed}
                                     onChange={(e) => {
                                       const newGoals = [...treatmentPlan.goals];
                                       newGoals[idx].completed = e.target.checked;
                                       handleUpdateTreatmentPlan({ ...treatmentPlan, goals: newGoals });
                                     }}
                                     className="w-5 h-5 rounded border-2 border-border-subtle bg-bg-sidebar checked:bg-primary checked:border-primary transition-all cursor-pointer appearance-none relative checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-bg-deep checked:after:text-[10px] checked:after:font-black"
                                   />
                                   <input 
                                     type="text" 
                                     value={goal.text}
                                     onChange={(e) => {
                                       const newGoals = [...treatmentPlan.goals];
                                       newGoals[idx].text = e.target.value;
                                       handleUpdateTreatmentPlan({ ...treatmentPlan, goals: newGoals });
                                     }}
                                     className={cn(
                                       "flex-grow bg-transparent border-none outline-none text-xs font-medium transition-all",
                                       goal.completed ? "text-text-dim line-through opacity-50" : "text-text-main"
                                     )}
                                     placeholder="Descreva a meta..."
                                   />
                                   <button 
                                     onClick={() => {
                                       const newGoals = treatmentPlan.goals.filter((_, i) => i !== idx);
                                       handleUpdateTreatmentPlan({ ...treatmentPlan, goals: newGoals });
                                     }}
                                     className="opacity-0 group-hover:opacity-100 p-2 text-text-dim hover:text-red-500 transition-colors"
                                   >
                                     <Trash2 size={14} />
                                   </button>
                                </div>
                              ))}
                              <button 
                                onClick={() => {
                                  handleUpdateTreatmentPlan({ 
                                    ...treatmentPlan, 
                                    goals: [...treatmentPlan.goals, { text: '', completed: false }] 
                                  });
                                }}
                                className="w-full py-4 border-2 border-dashed border-border-subtle rounded-xl text-[10px] font-black text-text-dim uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
                              >
                                <Plus size={14} /> Adicionar Nova Meta
                              </button>
                           </div>
                         </div>

                         <div className="space-y-4">
                           <p className="text-[9px] font-black text-text-dim uppercase tracking-widest mb-2">Estrutura do Plano e Abordagem</p>
                           <div className="bg-bg-sidebar rounded-3xl border border-border-subtle overflow-hidden">
                              <RichTextEditor
                                value={treatmentPlan.notes}
                                onChange={(val) => {
                                  setTreatmentPlan({ ...treatmentPlan, notes: val });
                                }}
                                placeholder="Estrutura do plano terapêutico, objetivos a longo prazo e fundamentação teórica..."
                                minHeight="200px"
                              />
                           </div>
                           <div className="flex justify-end">
                             <button 
                               onClick={() => handleUpdateTreatmentPlan(treatmentPlan)}
                               className="px-8 py-3 bg-primary text-bg-deep rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                             >
                               <Save size={14} /> Salvar Plano
                             </button>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center bg-bg-card/30 border-2 border-dashed border-border-subtle rounded-[3rem] p-16 text-center animate-pulse">
            <div className="w-24 h-24 rounded-[2rem] bg-bg-sidebar shadow-inner flex items-center justify-center mb-8 text-text-dim/10">
               <FileText size={48} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-[0.4em] text-text-dim">Consultar Prontuário</h3>
            <p className="text-text-dim/40 mt-4 text-xs font-medium max-w-xs mx-auto leading-relaxed uppercase tracking-widest">Selecione um paciente na lista lateral para carregar o histórico clínico e documentos.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isOpen}
        title={options?.title || ''}
        message={options?.message || ''}
        confirmLabel={options?.confirmLabel}
        variant={options?.variant}
        onConfirm={handleConfirm}
        onCancel={close}
      />

      {/* Event Details/Edit Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-bg-deep/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-card border border-border-subtle w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border",
                    selectedEvent.type === 'evolution' ? "bg-primary/20 text-primary border-primary/30" : "bg-blue-500/20 text-blue-500 border-blue-500/30"
                  )}>
                    {selectedEvent.type === 'evolution' ? <Clock size={24} /> : <File size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-medium text-text-main tracking-tight">
                      {isEditingEvent ? 'Editar Evolução' : selectedEvent.title}
                    </h3>
                    <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">{selectedEvent.data} • {new Date(selectedEvent.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-3 hover:bg-bg-sidebar rounded-2xl transition-all text-text-dim hover:text-red-400 border border-transparent hover:border-border-subtle">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-10 scroller-hide">
                {selectedEvent.type === 'evolution' ? (
                  isEditingEvent ? (
                    <div className="space-y-6">
                      <RichTextEditor value={editEventContent} onChange={setEditEventContent} />
                    </div>
                  ) : (
                    <div className="record-entry-content-exclusive p-8 bg-bg-sidebar/40 rounded-[2.5rem] border border-border-subtle/50 h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-subtle [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/40 shadow-inner">
                       <div 
                        className="text-text-main prose prose-invert prose-lg max-w-none leading-relaxed tracking-tight selection:bg-primary/30" 
                        dangerouslySetInnerHTML={{ __html: selectedEvent.content }} 
                       />
                    </div>
                  )
                ) : (
                  <div className="w-full">
                     {selectedEvent.file?.conteudoArquivo.includes('data:image') ? (
                       <div className="flex flex-col items-center justify-center min-h-[400px] bg-bg-sidebar/20 rounded-[2rem] border border-dashed border-border-subtle p-8">
                         <img src={selectedEvent.file.conteudoArquivo} alt={selectedEvent.file.nomeArquivo} className="max-w-full max-h-[50vh] rounded-2xl shadow-2xl border border-white/5 mb-6" />
                         <div className="flex items-center gap-4">
                           <a 
                             href={selectedEvent.file?.conteudoArquivo} 
                             download={selectedEvent.file?.nomeArquivo}
                             className="flex items-center gap-3 px-8 py-4 bg-primary text-bg-deep rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                           >
                             <Download size={18} /> Baixar Arquivo
                           </a>
                           <button 
                             onClick={() => handleOpenInNewTab(selectedEvent.file)}
                             className="flex items-center gap-3 px-8 py-4 bg-bg-sidebar text-text-main border border-border-subtle rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/50 transition-all cursor-pointer"
                           >
                             Abrir em Nova Aba
                           </button>
                         </div>
                       </div>
                     ) : selectedEvent.file?.tipoArquivo.includes('pdf') || selectedEvent.file?.nomeArquivo.toLowerCase().endsWith('.pdf') ? (
                       <div className="space-y-6">
                         <div className="w-full h-[55vh] rounded-[2rem] overflow-hidden border border-border-subtle bg-bg-sidebar shadow-2xl">
                           <iframe 
                             src={selectedEvent.file.conteudoArquivo} 
                             title={selectedEvent.file.nomeArquivo} 
                             className="w-full h-full border-none bg-white"
                           />
                         </div>
                         <div className="flex items-center justify-center gap-4">
                           <a 
                             href={selectedEvent.file?.conteudoArquivo} 
                             download={selectedEvent.file?.nomeArquivo}
                             className="flex items-center gap-3 px-8 py-4 bg-primary text-bg-deep rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                           >
                             <Download size={18} /> Baixar PDF
                           </a>
                           <button 
                             onClick={() => handleOpenInNewTab(selectedEvent.file)}
                             className="flex items-center gap-3 px-8 py-4 bg-bg-sidebar text-text-main border border-border-subtle rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/50 transition-all cursor-pointer"
                           >
                             Abrir em Nova Aba
                           </button>
                         </div>
                       </div>
                     ) : selectedEvent.file?.tipoArquivo.includes('html') || selectedEvent.file?.nomeArquivo.toLowerCase().endsWith('.html') ? (
                       <div className="space-y-6">
                         <div className="w-full h-[55vh] rounded-[2rem] overflow-hidden border border-border-subtle bg-white shadow-2xl">
                           <iframe 
                             src={selectedEvent.file.conteudoArquivo} 
                             title={selectedEvent.file.nomeArquivo} 
                             className="w-full h-full border-none"
                           />
                         </div>
                         <div className="flex items-center justify-center gap-4">
                           <a 
                             href={selectedEvent.file?.conteudoArquivo} 
                             download={selectedEvent.file?.nomeArquivo}
                             className="flex items-center gap-3 px-8 py-4 bg-primary text-bg-deep rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                           >
                             <Download size={18} /> Baixar HTML
                           </a>
                           <button 
                             onClick={() => handleOpenInNewTab(selectedEvent.file)}
                             className="flex items-center gap-3 px-8 py-4 bg-bg-sidebar text-text-main border border-border-subtle rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/50 transition-all cursor-pointer"
                           >
                             Abrir em Nova Aba
                           </button>
                         </div>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center justify-center min-h-[400px] bg-bg-sidebar/20 rounded-[2rem] border border-dashed border-border-subtle gap-8 p-8">
                         <div className="flex flex-col items-center gap-4">
                           <div className="w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                             <File size={48} />
                           </div>
                           <div className="text-center">
                             <p className="text-lg font-bold text-text-main">{selectedEvent.file?.nomeArquivo}</p>
                             <p className="text-sm text-text-dim uppercase tracking-widest">{selectedEvent.file?.tipoArquivo}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-4">
                           <a 
                             href={selectedEvent.file?.conteudoArquivo} 
                             download={selectedEvent.file?.nomeArquivo}
                             className="flex items-center gap-3 px-8 py-4 bg-primary text-bg-deep rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                           >
                             <Download size={18} /> Baixar Arquivo
                           </a>
                           <button 
                             onClick={() => handleOpenInNewTab(selectedEvent.file)}
                             className="flex items-center gap-3 px-8 py-4 bg-bg-sidebar text-text-main border border-border-subtle rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/50 transition-all cursor-pointer"
                           >
                             Abrir em Nova Aba
                           </button>
                         </div>
                       </div>
                     )}
                  </div>
                )}
              </div>

              {isEditingEvent ? (
                <div className="p-8 border-t border-border-subtle bg-bg-sidebar/50 flex justify-end gap-4 shrink-0 font-sans">
                  <button onClick={() => setIsEditingEvent(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-text-main">
                    Ver Original
                  </button>
                  <button 
                    onClick={handleSaveEditedEvent}
                    className="flex items-center gap-3 px-10 py-4 bg-primary text-bg-deep rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-hover transition-all shadow-xl shadow-primary/25"
                  >
                    <Save size={18} /> Salvar Alterações
                  </button>
                </div>
              ) : (
                 selectedEvent.type === 'evolution' && (
                   <div className="p-8 border-t border-border-subtle bg-bg-sidebar/50 flex justify-end gap-4 shrink-0 font-sans">
                      <button 
                        onClick={() => setIsEditingEvent(true)}
                        className="flex items-center gap-3 px-10 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/25"
                      >
                        <Edit size={18} /> Editar Evolução
                      </button>
                   </div>
                 )
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Timeline Overlay */}
      <AnimatePresence>
        {isTimelineFullscreen && (
          <div className="fixed inset-0 z-[100] bg-bg-deep flex flex-col p-10 overflow-hidden font-sans">
            <div className="flex items-center justify-between border-b border-border-subtle pb-6 mb-8 uppercase shrink-0">
              <div>
                <h2 className="text-2xl font-display font-black text-text-main tracking-tight flex items-center gap-3">
                  <Clock size={28} className="text-primary" /> Linha do Tempo: {selectedPatient?.nome}
                </h2>
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mt-1">Histórico Clínico Unificado Integrado (Tela Cheia)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-bg-sidebar/40 p-1.5 rounded-2xl border border-border-subtle">
                  <button
                    onClick={() => setTimelineViewMode('vertical')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                      timelineViewMode === 'vertical' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main"
                    )}
                  >
                    Vertical
                  </button>
                  <button
                    onClick={() => setTimelineViewMode('horizontal')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                      timelineViewMode === 'horizontal' ? "bg-primary text-bg-deep shadow-lg shadow-primary/20" : "text-text-dim hover:text-text-main"
                    )}
                  >
                    Horizontal
                  </button>
                </div>
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-2 px-4 py-2 bg-bg-sidebar hover:bg-white/5 border border-border-subtle rounded-xl text-[9px] font-black uppercase tracking-widest text-text-dim transition-all cursor-pointer"
                >
                  <History size={12} className={cn("transition-transform", sortOrder === 'asc' && "rotate-180")} />
                  {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigos'}
                </button>
                <button
                  onClick={() => setIsTimelineFullscreen(false)}
                  className="p-3 bg-bg-sidebar hover:bg-bg-card rounded-2xl transition-all text-text-dim hover:text-red-400 border border-border-subtle cursor-pointer"
                  title="Fechar Tela Cheia"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 scroller-hide">
              {renderTimeline()}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
