import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  History as HistoryIcon, 
  User, 
  Users, 
  Zap, 
  Plus, 
  Trash2, 
  Edit2, 
  Brain, 
  X,
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LifeEvent, PatientData, Assessment } from './types';
import { generateFakeEvents } from './utils/simulation';
import { analyzeLinhaVidaAssessment } from '../../services/geminiService';
import { exportToHtml } from './utils/export';
import { cn } from '../../lib/utils';
import { db } from '../../lib/db';
import { dbWrapper } from './lib/linhaVidaDbWrapper';
import { Toaster, toast } from 'react-hot-toast';

// Helper components
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';

interface LinhaVidaAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
  onClose?: () => void;
}

export default function LinhaVidaApp({ activePatientId, lockPatient = false, userId, onClose }: LinhaVidaAppProps) {
  const [activeTab, setActiveTab] = useState<'test' | 'history'>('test');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<Assessment | null>(null);

  // Form states for adding/editing event
  const [ageInput, setAgeInput] = useState<string>('');
  const [titleInput, setTitleInput] = useState<string>('');
  const [descInput, setDescInput] = useState<string>('');
  const [typeInput, setTypeInput] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  const [intensityInput, setIntensityInput] = useState<number>(3);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

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
        setAssessments(loadedHistory);
      } else {
        setAssessments([]);
      }
    };
    loadHistory();
  }, [selectedPatientId]);

  const handleSimulate = () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente para simular os dados!');
      return;
    }
    setEvents(generateFakeEvents());
    toast.success('Linha da Vida simulada gerada com sucesso!');
  };

  const handleAddOrUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error('Selecione um paciente antes de criar eventos!');
      return;
    }
    if (!ageInput || !titleInput || !descInput) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const ageVal = parseInt(ageInput);
    if (isNaN(ageVal) || ageVal < 0) {
      toast.error('Idade inválida.');
      return;
    }

    if (editingEventId) {
      // Edit existing event
      setEvents(events.map(ev => 
        ev.id === editingEventId 
          ? { ...ev, age: ageVal, title: titleInput, description: descInput, type: typeInput, intensity: intensityInput }
          : ev
      ));
      setEditingEventId(null);
      toast.success('Evento atualizado!');
    } else {
      // Add new event
      const newEvent: LifeEvent = {
        id: Date.now().toString(),
        age: ageVal,
        title: titleInput,
        description: descInput,
        type: typeInput,
        intensity: intensityInput
      };
      setEvents([...events, newEvent]);
      toast.success('Evento adicionado!');
    }

    // Reset inputs
    setAgeInput('');
    setTitleInput('');
    setDescInput('');
    setTypeInput('neutral');
    setIntensityInput(3);
  };

  const handleEditClick = (ev: LifeEvent) => {
    setEditingEventId(ev.id);
    setAgeInput(String(ev.age));
    setTitleInput(ev.title);
    setDescInput(ev.description);
    setTypeInput(ev.type);
    setIntensityInput(ev.intensity);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(ev => ev.id !== id));
    if (editingEventId === id) {
      setEditingEventId(null);
      setAgeInput('');
      setTitleInput('');
      setDescInput('');
      setTypeInput('neutral');
      setIntensityInput(3);
    }
    toast.success('Evento excluído.');
  };

  const handleClearAll = () => {
    if (window.confirm('Deseja realmente limpar todos os eventos cadastrados?')) {
      setEvents([]);
      setEditingEventId(null);
      setAgeInput('');
      setTitleInput('');
      setDescInput('');
      setTypeInput('neutral');
      setIntensityInput(3);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente antes de analisar!');
      return;
    }
    if (events.length < 3) {
      toast.error('Cadastre pelo menos 3 eventos marcantes para gerar o laudo clínico.');
      return;
    }

    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    if (!patientObj) return;

    setIsAnalyzing(true);
    try {
      const pData: PatientData = {
        name: patientObj.nome,
        age: patientObj.nascimento ? String(new Date().getFullYear() - new Date(patientObj.nascimento).getFullYear()) : 'N/D',
        psychologistName: settings.professionalName,
        crp: settings.professionalCRP,
        logoUrl: settings.professionalLogo,
        signatureUrl: settings.professionalSignature
      };

      // Sort events chronologically for analysis
      const sortedEvents = [...events].sort((a, b) => a.age - b.age);
      const eventsText = sortedEvents
        .map(e => `Idade: ${e.age} anos | Evento: ${e.title} | Valência: ${e.type === 'positive' ? 'Positivo' : e.type === 'negative' ? 'Negativo' : 'Neutro'} (Intensidade: ${e.intensity}/5) | Relato: ${e.description}`)
        .join('\n');

      let analysis = '';
      try {
        analysis = await analyzeLinhaVidaAssessment({ name: pData.name, age: pData.age }, eventsText);
      } catch (err: any) {
        console.error("Erro ao gerar análise Linha da Vida via IA:", err);
        toast.error('Não foi possível gerar a análise da IA, mas o mapeamento foi salvo localmente.');
        analysis = 'Não foi possível gerar a análise técnica de IA no momento do salvamento.';
      }
      
      const newAssessment: Assessment = {
        id: Date.now().toString(),
        patient: pData,
        events: [...events],
        aiAnalysis: analysis,
        createdAt: new Date().toISOString()
      };
      
      const updated = await dbWrapper.saveEntry(newAssessment, selectedPatientId, userId);
      setAssessments(updated);
      setCurrentResult(newAssessment);
      toast.success('Laudo salvo no prontuário do paciente!');
    } catch (error) {
      console.error(error);
      toast.error('Erro na análise da IA. Verifique se a chave API está configurada.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!selectedPatientId) return;
    if (window.confirm('Tem certeza que deseja excluir este registro de Linha da Vida do prontuário permanentemente?')) {
      try {
        const updated = await dbWrapper.deleteEntry(id, selectedPatientId, userId);
        setAssessments(updated);
        toast.success('Mapeamento excluído com sucesso.');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao deletar registro.');
      }
    }
  };

  const handleExport = (assessment: Assessment) => {
    exportToHtml(assessment);
  };

  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-bg-deep text-text-main font-sans overflow-hidden select-none relative">
      {/* HEADER COMPONENT */}
      <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#10b981] h-8 w-8 rounded-lg flex items-center justify-center text-bg-deep font-black transition-transform hover:scale-105">
            <TrendingUp size={16} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
            Linha da Vida
            <span className="text-[#10b981] font-black">Digital</span> 
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
              setEvents([]);
              setEditingEventId(null);
            }}
            disabled={lockPatient}
            className={cn(
              "bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none focus:border-[#10b981] transition-all max-w-[200px] truncate",
              lockPatient && "opacity-75 cursor-not-allowed border-transparent"
            )}
          >
            <option value="" className="bg-bg-card text-text-dim">-- Selecionar Paciente --</option>
            {(patients || []).map(p => (
              <option key={`lv-patient-opt-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* TOP BUTTONS & SUB-TABS */}
        <div className="flex items-center gap-3">
          {activeTab === 'test' && !currentResult && selectedPatientId && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSimulate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981]/5 hover:bg-[#10b981]/10 border border-[#10b981]/20 hover:border-[#10b981]/45 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#10b981] transition-all cursor-pointer"
              >
                <Zap size={11} /> Simular
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing || events.length < 3}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981] hover:bg-[#10b981]/90 disabled:bg-bg-sidebar disabled:border disabled:border-border-subtle disabled:text-text-dim/40 text-bg-deep rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:pointer-events-none cursor-pointer"
              >
                {isAnalyzing ? (
                  <div className="w-3 h-3 border-2 border-bg-deep/30 border-t-bg-deep rounded-full animate-spin" />
                ) : (
                  <Brain size={11} />
                )}
                Gerar Laudo Clínico
              </button>
            </div>
          )}
          <div className="flex gap-1 bg-bg-sidebar p-1 rounded-xl border border-border-subtle/50">
            {[
              { id: 'test', label: 'Mapeamento' },
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
                    ? "bg-bg-card text-[#10b981] border border-border-subtle shadow-sm" 
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
            <TrendingUp size={48} className="text-[#10b981] mb-4 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
              Por favor, selecione um paciente no topo da janela para começar a preencher a linha da vida ou visualizar registros arquivados.
            </p>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col overflow-auto">
            {/* Form Tab Panel */}
            <div className={cn("w-full flex-1 flex flex-col overflow-auto", (activeTab === 'test' && !currentResult) ? "block" : "hidden")}>
              <div className="flex flex-1 overflow-auto w-full relative">
                  {/* Left panel info & stats */}
                  <aside className="w-64 border-r border-border-subtle bg-bg-sidebar/30 p-6 flex flex-col gap-6 overflow-y-auto scroller-hide shrink-0 hidden md:flex">
                    <div>
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Paciente</h3>
                      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl space-y-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-dim/60 uppercase">Nome</span>
                          <span className="font-bold text-xs truncate">{patients.find(p => String(p.id) === String(selectedPatientId))?.nome || 'N/D'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-dim/60 uppercase">Idade</span>
                          <span className="font-bold text-xs">
                            {(() => {
                              const p = patients.find(p => String(p.id) === String(selectedPatientId));
                              return p?.nascimento ? `${new Date().getFullYear() - new Date(p.nascimento).getFullYear()} anos` : 'N/D';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border-subtle pt-6">
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Eventos Cadastrados</h3>
                      <div className="flex items-center justify-between text-xs p-4 bg-bg-card rounded-2xl border border-border-subtle shadow-inner">
                        <span className="text-text-dim text-[10px] font-bold uppercase">Cadastrados</span>
                        <span className="font-black text-[#10b981]">
                          {events.length} / mín. 3
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-2 text-[10px] text-text-dim font-bold uppercase tracking-wider">
                        <div className="flex justify-between">
                          <span>Positivos:</span>
                          <span className="text-emerald-400 font-black">{events.filter(e => e.type === 'positive').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Negativos:</span>
                          <span className="text-rose-400 font-black">{events.filter(e => e.type === 'negative').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Neutros:</span>
                          <span className="text-slate-400 font-black">{events.filter(e => e.type === 'neutral').length}</span>
                        </div>
                      </div>
                    </div>

                    {events.length > 0 && (
                      <button 
                        onClick={handleClearAll}
                        className="mt-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-rose-400 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} /> Limpar Todos
                      </button>
                    )}
                  </aside>

                  {/* Right main workspace split into Form + Interactive List */}
                  <div className="flex-1 flex flex-col lg:flex-row overflow-auto bg-bg-deep">
                    {/* Add Event Form Panel */}
                    <div className="w-full lg:w-[380px] lg:border-r border-border-subtle p-6 overflow-y-auto scroller-hide shrink-0 bg-bg-sidebar/10">
                      <h2 className="text-sm font-bold tracking-tight text-text-main mb-4 flex items-center gap-2">
                        {editingEventId ? (
                          <>
                            <Edit2 size={16} className="text-[#10b981]" /> Editar Evento
                          </>
                        ) : (
                          <>
                            <Plus size={16} className="text-[#10b981]" /> Registrar Evento
                          </>
                        )}
                      </h2>
                      <form onSubmit={handleAddOrUpdateEvent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Age Input */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider">Idade do Paciente *</label>
                            <input 
                              type="number"
                              min="0"
                              max="120"
                              required
                              value={ageInput}
                              onChange={(e) => setAgeInput(e.target.value)}
                              placeholder="Ex: 8"
                              className="bg-bg-card border border-border-subtle text-text-main text-xs font-bold rounded-xl px-4 h-10 outline-none focus:border-[#10b981] transition-all"
                            />
                          </div>

                          {/* Valence / Type Select */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider">Valência Emocional</label>
                            <select
                              value={typeInput}
                              onChange={(e) => setTypeInput(e.target.value as any)}
                              className="bg-bg-card border border-border-subtle text-text-main text-xs font-bold rounded-xl px-3 h-10 outline-none focus:border-[#10b981] transition-all"
                            >
                              <option value="positive">Positivo</option>
                              <option value="negative">Negativo</option>
                              <option value="neutral">Neutro</option>
                            </select>
                          </div>
                        </div>

                        {/* Intensity Slider */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider">
                              Intensidade / Impacto (1 a 5)
                            </label>
                            <span className="text-xs font-black text-[#10b981]">{intensityInput}/5</span>
                          </div>
                          <input 
                            type="range"
                            min="1"
                            max="5"
                            value={intensityInput}
                            onChange={(e) => setIntensityInput(parseInt(e.target.value))}
                            className="w-full accent-[#10b981] cursor-pointer"
                          />
                        </div>

                        {/* Title Input */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider">Título do Marco/Evento *</label>
                          <input 
                            type="text"
                            required
                            maxLength={100}
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            placeholder="Ex: Nascimento do irmão caçula"
                            className="bg-bg-card border border-border-subtle text-text-main text-xs font-bold rounded-xl px-4 h-10 outline-none focus:border-[#10b981] transition-all"
                          />
                        </div>

                        {/* Description textarea */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider">
                            Descrição / Sentimentos associados *
                          </label>
                          <textarea
                            required
                            rows={4}
                            maxLength={500}
                            value={descInput}
                            onChange={(e) => setDescInput(e.target.value)}
                            placeholder="Descreva o que aconteceu, como o paciente se sentiu e as consequências emocionais percebidas..."
                            className="bg-bg-card border border-border-subtle text-text-main text-xs font-medium rounded-xl p-4 outline-none focus:border-[#10b981] transition-all resize-none leading-relaxed"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 h-10 bg-[#10b981] hover:bg-[#10b981]/90 text-bg-deep rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {editingEventId ? (
                              <>
                                <ClipboardCheck size={14} /> Salvar Alterações
                              </>
                            ) : (
                              <>
                                <Plus size={14} /> Adicionar Evento
                              </>
                            )}
                          </button>
                          
                          {editingEventId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEventId(null);
                                setAgeInput('');
                                setTitleInput('');
                                setDescInput('');
                                setTypeInput('neutral');
                                setIntensityInput(3);
                              }}
                              className="h-10 px-3 bg-bg-sidebar border border-border-subtle hover:border-rose-500 hover:text-rose-500 rounded-xl text-text-dim transition-all cursor-pointer"
                              title="Cancelar Edição"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Events List Workspace */}
                    <div className="flex-1 p-6 overflow-y-auto scroller-hide select-text">
                      <h2 className="text-xs font-black text-text-dim uppercase tracking-widest mb-4">
                        Marcos Clínicos ({events.length})
                      </h2>
                      {events.length === 0 ? (
                        <div className="text-center py-16 bg-bg-card/40 rounded-[2rem] border border-border-subtle border-dashed">
                          <TrendingUp size={24} className="mx-auto text-text-dim mb-3" />
                          <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nenhum evento registrado ainda</p>
                          <p className="text-[8px] text-text-dim/60 uppercase tracking-widest mt-1 max-w-[240px] mx-auto leading-relaxed">
                            Use o formulário à esquerda para adicionar eventos ou clique no botão de "Simular" para preenchimento rápido.
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {[...events]
                            .sort((a, b) => a.age - b.age)
                            .map((ev) => {
                              const isPos = ev.type === 'positive';
                              const isNeg = ev.type === 'negative';
                              return (
                                <div 
                                  key={ev.id}
                                  className={cn(
                                    "p-5 bg-bg-card border border-border-subtle rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-[#10b981]/25 transition-all duration-200 shadow-sm relative",
                                    editingEventId === ev.id && "border-[#10b981] bg-[#10b981]/5"
                                  )}
                                >
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-bg-sidebar border border-border-subtle text-[#10b981]">
                                        {ev.age} Anos
                                      </span>
                                      <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                        isPos 
                                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                                          : isNeg 
                                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" 
                                            : "bg-slate-500/10 text-slate-400 border border-slate-500/25"
                                      )}>
                                        {ev.type === 'positive' ? `Positivo (+${ev.intensity})` : ev.type === 'negative' ? `Negativo (-${ev.intensity})` : 'Neutro'}
                                      </span>
                                    </div>
                                    <h4 className="font-bold text-xs text-text-main truncate">{ev.title}</h4>
                                    <p className="text-[11px] text-text-dim/95 font-medium leading-relaxed line-clamp-2 pr-4">
                                      {ev.description}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 self-end md:self-center">
                                    <button
                                      onClick={() => handleEditClick(ev)}
                                      disabled={editingEventId === ev.id}
                                      className="p-2 text-text-dim/50 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                                      title="Editar Evento"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEvent(ev.id)}
                                      className="p-2 text-text-dim/50 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
                                      title="Deletar Evento"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
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
                assessments={assessments} 
                onView={setCurrentResult} 
                onDelete={handleDeleteAssessment}
              />
            </div>

            {/* Result View Container */}
            {currentResult && (
              <div className="flex-grow overflow-y-auto p-6 bg-bg-deep w-full scroller-hide select-text">
                <ResultView 
                  key="result"
                  assessment={currentResult} 
                  onBack={() => setCurrentResult(null)} 
                  onExport={() => handleExport(currentResult)}
                  onUpdateAnalysis={async (newAnalysis) => {
                    if (!selectedPatientId) return;
                    const updatedRecord = { ...currentResult, aiAnalysis: newAnalysis };
                    const updated = await dbWrapper.saveEntry(updatedRecord, selectedPatientId, userId);
                    setAssessments(updated);
                    setCurrentResult(updatedRecord);
                  }}
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
