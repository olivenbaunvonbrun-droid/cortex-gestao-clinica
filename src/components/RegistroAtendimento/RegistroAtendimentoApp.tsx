import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  History as HistoryIcon, 
  User, 
  FileText, 
  Zap, 
  Trash2,
  Users,
  Brain,
  ChevronRight,
  Sparkles,
  Save,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientData, AttendanceRecord, AttendanceTemplateType } from './types';
import { ATTENDANCE_TEMPLATES } from './utils/templates';
import { analyzeAttendanceRecord } from '../../services/geminiService';
import { exportToHtml } from './utils/export';
import { cn } from '../../lib/utils';
import { db } from '../../lib/db';
import { dbWrapper } from './lib/registroDbWrapper';
import { Toaster, toast } from 'react-hot-toast';

// Helper components
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';

interface RegistroAtendimentoAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
  openTool?: (toolId: string, patientId?: string | null) => void;
}

export default function RegistroAtendimentoApp({ activePatientId, lockPatient = false, userId, openTool }: RegistroAtendimentoAppProps) {
  const [activeTab, setActiveTab] = useState<'test' | 'history'>('test');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<AttendanceTemplateType>('soap');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AttendanceRecord | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');

  const [settings, setSettings] = useState({
    professionalName: 'Psicólogo(a)',
    professionalCRP: '',
    professionalLogo: '',
    professionalSignature: ''
  });

  // Load from Dexie settings
  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        const items = await db.settings.toArray();
        const s: any = {};
        items.forEach(item => {
          s[item.key] = item.value;
        });
        setSettings({
          professionalName: (!s.appTitle || s.appTitle === 'Sistema de Gestão para Psicólogos') ? 'Psicólogo(a)' : s.appTitle,
          professionalCRP: s.psychCrp || '',
          professionalLogo: s.appLogo || '',
          professionalSignature: s.psychSignature || ''
        });
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSystemSettings();
  }, []);

  // Load patients and pre-select
  useEffect(() => {
    const loadPatients = async () => {
      const all = await db.pacientes.toArray();
      setPatients(all);
      if (activePatientId) {
        setSelectedPatientId(String(activePatientId));
      }
    };
    loadPatients();
  }, [activePatientId]);

  // Load history when selectedPatientId changes
  useEffect(() => {
    const loadHistory = async () => {
      if (selectedPatientId) {
        const loadedHistory = await dbWrapper.getHistory(selectedPatientId);
        setRecords(loadedHistory);
      } else {
        setRecords([]);
      }
    };
    loadHistory();
  }, [selectedPatientId]);

  // Reset fields when template changes
  useEffect(() => {
    setFields({});
    setAiSummary('');
  }, [selectedTemplateId]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleGenerateAiSummary = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente primeiro!');
      return;
    }
    
    const activeTemplate = ATTENDANCE_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!activeTemplate) return;

    // Check if at least one field is filled
    const hasValues = activeTemplate.fields.some(f => (fields[f.id] || '').trim().length > 0);
    if (!hasValues) {
      toast.error('Por favor, preencha pelo menos um campo para gerar o resumo com IA!');
      return;
    }

    setIsAnalyzing(true);
    try {
      const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
      const age = patientObj?.nascimento ? String(new Date().getFullYear() - new Date(patientObj.nascimento).getFullYear()) : 'N/D';
      
      const recordText = activeTemplate.fields
        .map(f => `${f.label}:\n${fields[f.id] || 'Não preenchido'}`)
        .join('\n\n');

      const summary = await analyzeAttendanceRecord(
        { name: patientObj?.nome || 'Paciente', age },
        recordText
      );
      setAiSummary(summary);

      // Auto-save instantly after generating
      const pData: PatientData = {
        name: patientObj?.nome || 'Paciente',
        age,
        psychologistName: settings.professionalName,
        crp: settings.professionalCRP,
        logoUrl: settings.professionalLogo,
        signatureUrl: settings.professionalSignature
      };

      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        patient: pData,
        template: selectedTemplateId,
        fields: { ...fields },
        aiAnalysis: summary,
        createdAt: new Date().toISOString()
      };

      const updated = await dbWrapper.saveEntry(newRecord, selectedPatientId, userId);
      setRecords(updated);
      toast.success('Resumo clínico elaborado e salvo no prontuário!');
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      toast.error('Erro na análise da IA. Verifique se a chave API está configurada.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente antes de salvar!');
      return;
    }

    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    if (!patientObj) return;

    const activeTemplate = ATTENDANCE_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!activeTemplate) return;

    // Validate if any field is filled
    const hasValues = activeTemplate.fields.some(f => (fields[f.id] || '').trim().length > 0);
    if (!hasValues) {
      toast.error('Por favor, preencha pelo menos um campo do modelo para poder salvar!');
      return;
    }

    try {
      const pData: PatientData = {
        name: patientObj.nome,
        age: patientObj.nascimento ? String(new Date().getFullYear() - new Date(patientObj.nascimento).getFullYear()) : 'N/D',
        psychologistName: settings.professionalName,
        crp: settings.professionalCRP,
        logoUrl: settings.professionalLogo,
        signatureUrl: settings.professionalSignature
      };

      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        patient: pData,
        template: selectedTemplateId,
        fields: { ...fields },
        aiAnalysis: aiSummary || undefined,
        createdAt: new Date().toISOString()
      };

      const updated = await dbWrapper.saveEntry(newRecord, selectedPatientId, userId);
      setRecords(updated);
      setFields({});
      setAiSummary('');
      toast.success('Registro de atendimento salvo no prontuário do paciente!');
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar registro de atendimento.');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!selectedPatientId) return;
    if (window.confirm('Tem certeza que deseja excluir esta anotação permanente do prontuário?')) {
      try {
        const updated = await dbWrapper.deleteEntry(id, selectedPatientId, userId);
        setRecords(updated);
        toast.success('Registro excluído com sucesso.');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao deletar registro.');
      }
    }
  };

  const handleExport = (recordsToExport: AttendanceRecord | AttendanceRecord[]) => {
    exportToHtml(recordsToExport);
  };

  const currentTemplate = ATTENDANCE_TEMPLATES.find(t => t.id === selectedTemplateId);

  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-bg-deep text-text-main font-sans overflow-hidden select-none relative">
      {/* HEADER COMPONENT */}
      <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-bg-deep font-black transition-transform hover:scale-105">
            <ClipboardList size={16} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
            Registro de
            <span className="text-primary font-black">Atendimento</span> 
          </h1>
        </div>
        
        {/* PATIENT SELECTOR DROPDOWN */}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-text-dim" />
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setCurrentResult(null);
            }}
            disabled={lockPatient}
            className={cn(
              "bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none focus:border-primary transition-all max-w-[200px] truncate",
              lockPatient && "opacity-75 cursor-not-allowed border-transparent"
            )}
          >
            <option value="" className="bg-bg-card text-text-dim">-- Selecionar Paciente --</option>
            {(patients || []).map(p => (
              <option key={`att-patient-opt-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
                {p.nome}
              </option>
            ))}
          </select>
          {selectedPatientId && openTool && (
            <button
              onClick={() => openTool('teleconsulta', selectedPatientId)}
              className="p-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-bg-deep rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Iniciar Teleconsulta"
            >
              <Video size={14} />
              <span className="text-[9px] font-black uppercase tracking-wider hidden sm:inline">Teleconsulta</span>
            </button>
          )}
        </div>

        {/* SUB-TABS */}
        <div className="flex items-center gap-3">
          {activeTab === 'test' && !currentResult && selectedPatientId && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleGenerateAiSummary}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/45 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Sparkles size={11} />
                )}
                Síntese por IA
              </button>
              
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-bg-deep rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Save size={11} />
                Salvar Registro
              </button>
            </div>
          )}
          <div className="flex gap-1 bg-bg-sidebar p-1 rounded-xl border border-border-subtle/50">
            {[
              { id: 'test', label: 'Novo Registro' },
              { id: 'history', label: 'Histórico' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentResult(null);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer",
                  activeTab === tab.id && !currentResult
                    ? "bg-bg-card text-primary border border-border-subtle shadow-sm" 
                    : "text-text-dim hover:text-text-main"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {/* MAIN CONTAINER */}
      <main className="flex-1 flex overflow-auto relative">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-12 bg-bg-deep">
            <ClipboardList size={48} className="text-primary mb-4 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
              Por favor, selecione um paciente no topo da janela para começar a preencher as anotações do atendimento ou visualizar o histórico.
            </p>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col overflow-auto">
            {/* Form Tab Panel */}
            <div className={cn("w-full flex-1 flex flex-col overflow-auto", (activeTab === 'test' && !currentResult) ? "block" : "hidden")}>
              <div className="flex flex-1 overflow-auto w-full relative">
                  {/* Left panel template selector */}
                  <aside className="w-64 border-r border-border-subtle bg-bg-sidebar/30 p-6 flex flex-col gap-6 overflow-y-auto scroller-hide shrink-0 hidden md:flex">
                    <div>
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Modelos de Registro</h3>
                      <div className="flex flex-col gap-2">
                        {ATTENDANCE_TEMPLATES.map(t => {
                          const isSelected = selectedTemplateId === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => setSelectedTemplateId(t.id)}
                              className={cn(
                                "p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5",
                                isSelected
                                  ? "bg-primary/10 border-primary/40 text-primary font-bold shadow-md shadow-primary/5"
                                  : "bg-bg-card border-border-subtle text-text-dim hover:text-text-main hover:border-primary/20"
                              )}
                            >
                              <span className="text-xs uppercase font-black tracking-wide">{t.name}</span>
                              <span className="text-[9px] leading-relaxed opacity-75 font-semibold">{t.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </aside>

                  {/* Main form scrollable area */}
                  <div className="flex-1 overflow-y-auto bg-bg-deep p-6 scroller-hide select-text">
                    <div className="max-w-3xl mx-auto space-y-6 pb-24">
                      {/* Mobile template selector */}
                      <div className="md:hidden bg-bg-card p-4 rounded-2xl border border-border-subtle space-y-2 border-dashed">
                        <label className="text-[9px] font-black uppercase text-text-dim tracking-wider">Modelo Clínico</label>
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => setSelectedTemplateId(e.target.value as any)}
                          className="w-full bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase rounded-xl px-3 py-2 outline-none"
                        >
                          {ATTENDANCE_TEMPLATES.map(t => (
                            <option key={`m-opt-${t.id}`} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Fields */}
                      {currentTemplate?.fields.map(f => (
                        <div 
                          key={f.id}
                          className="bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-border-subtle shadow-md focus-within:border-primary/30 transition-all duration-300 space-y-3"
                        >
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-main">{f.label}</label>
                          {f.type === 'select' ? (
                            <select
                              value={fields[f.id] || ''}
                              onChange={(e) => handleFieldChange(f.id, e.target.value)}
                              className="w-full bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all cursor-pointer"
                            >
                              <option value="">-- Selecione uma opção --</option>
                              {f.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <textarea
                              value={fields[f.id] || ''}
                              onChange={(e) => handleFieldChange(f.id, e.target.value)}
                              placeholder={f.placeholder}
                              className="w-full min-h-[120px] bg-bg-sidebar border border-border-subtle text-text-main text-xs font-semibold rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all resize-y leading-relaxed"
                            />
                          )}
                        </div>
                      ))}

                      {/* AI Summary result box inside editor */}
                      {aiSummary && (
                        <div className="bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-emerald-500/20 shadow-md space-y-4">
                          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                              <Sparkles size={12} /> Resumo Clínico Integrativo Gerado
                            </h4>
                            <button
                              onClick={() => setAiSummary('')}
                              className="text-[9px] font-black text-text-dim hover:text-rose-400 uppercase tracking-widest cursor-pointer"
                            >
                              Descartar
                            </button>
                          </div>
                          <div className="text-xs text-text-main/90 font-serif text-justify leading-relaxed whitespace-pre-wrap select-text">
                            {aiSummary}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            {/* History Tab Panel */}
            <div className={cn("flex-grow overflow-y-auto p-6 bg-bg-deep scroller-hide select-text", (activeTab === 'history' && !currentResult) ? "block" : "hidden")}>
              <HistoryView 
                key="history"
                records={records} 
                onView={setCurrentResult} 
                onDelete={handleDeleteRecord}
                onExport={handleExport}
              />
            </div>

            {/* Result View Container */}
            {currentResult && (
              <div className="flex-grow overflow-y-auto p-6 bg-bg-deep w-full scroller-hide select-text">
                <ResultView 
                  key="result"
                  record={currentResult} 
                  onBack={() => setCurrentResult(null)} 
                  onExport={() => handleExport(currentResult)}
                />
              </div>
            )}
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
