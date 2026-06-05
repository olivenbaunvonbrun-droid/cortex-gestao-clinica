import React, { useState, useEffect } from 'react';
import { 
  Layers, 
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
import { DfcSituation, PatientData, DfcRecord } from './types';
import { analyzeDfcAssessment } from '../../services/geminiService';
import { exportToHtml } from './utils/export';
import { cn } from '../../lib/utils';
import { db } from '../../lib/db';
import { dbWrapper } from './lib/dfcDbWrapper';
import { Toaster, toast } from 'react-hot-toast';

// Helper components
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';

interface DfcAssistidoAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
}

export default function DfcAssistidoApp({ activePatientId, lockPatient = false, userId }: DfcAssistidoAppProps) {
  const [activeTab, setActiveTab] = useState<'test' | 'history'>('test');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // DFC Main inputs
  const [childhoodInput, setChildhoodInput] = useState<string>('');
  const [beliefsInput, setBeliefsInput] = useState<string>('');
  const [rulesInput, setRulesInput] = useState<string>('');
  const [strategiesInput, setStrategiesInput] = useState<string>('');
  
  // Situation inputs
  const [situations, setSituations] = useState<DfcSituation[]>([]);
  const [sitDescription, setSitDescription] = useState<string>('');
  const [sitThought, setSitThought] = useState<string>('');
  const [sitMeaning, setSitMeaning] = useState<string>('');
  const [sitEmotion, setSitEmotion] = useState<string>('');
  const [sitBehavior, setSitBehavior] = useState<string>('');
  const [editingSitIdx, setEditingSitIdx] = useState<number | null>(null);

  const [assessments, setAssessments] = useState<DfcRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<DfcRecord | null>(null);

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
      toast.error('Por favor, selecione um paciente para simular!');
      return;
    }
    
    setChildhoodInput('Histórico de pais muito exigentes e perfeccionistas. Críticas constantes quando tirava notas abaixo da média. Isolamento social frequente na infância por medo de ser rejeitado ou considerado estranho.');
    setBeliefsInput('Sou inadequado, defeituoso e incapaz de ser amado como sou.');
    setRulesInput('Se eu me esforçar ao extremo e nunca cometer erros, então posso evitar a rejeição; se as pessoas conhecerem meu verdadeiro eu, então irão me abandonar.');
    setStrategiesInput('Perfeccionismo, autoexigência elevada, evitação de desafios, hipervigilância social, evitação de intimidade emocional.');
    
    setSituations([
      {
        situation: 'Apresentar relatório trimestral na empresa',
        automaticThought: 'Vou cometer algum erro e todos perceberão que sou uma fraude',
        meaning: 'Isso provará que sou incompetente e inadequado',
        emotion: 'Ansiedade (90%), Medo (80%)',
        behavior: 'Falar de forma extremamente acelerada, evitar olhar nos olhos dos diretores, revisar o slide 15 vezes antes'
      },
      {
        situation: 'Convidado para almoçar com novos colegas de equipe',
        automaticThought: 'Não vou ter nada interessante para falar e o almoço será constrangedor',
        meaning: 'Sou socialmente incapaz e serei rejeitado',
        emotion: 'Ansiedade (70%), Insegurança (85%)',
        behavior: 'Inventar desculpa de acúmulo de trabalho para recusar o convite e almoçar sozinho na mesa'
      }
    ]);
    toast.success('Diagrama de conceituação cognitiva simulado com sucesso!');
  };

  const handleAddSituation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sitDescription || !sitThought || !sitMeaning || !sitEmotion || !sitBehavior) {
      toast.error('Preencha todos os campos da situação.');
      return;
    }

    const newSit: DfcSituation = {
      situation: sitDescription,
      automaticThought: sitThought,
      meaning: sitMeaning,
      emotion: sitEmotion,
      behavior: sitBehavior
    };

    if (editingSitIdx !== null) {
      setSituations(situations.map((s, idx) => idx === editingSitIdx ? newSit : s));
      setEditingSitIdx(null);
      toast.success('Situação atualizada!');
    } else {
      if (situations.length >= 3) {
        toast.error('O diagrama suporta no máximo 3 situações típicas mapeadas.');
        return;
      }
      setSituations([...situations, newSit]);
      toast.success('Situação adicionada!');
    }

    // Reset inputs
    setSitDescription('');
    setSitThought('');
    setSitMeaning('');
    setSitEmotion('');
    setSitBehavior('');
  };

  const handleEditSituation = (idx: number) => {
    const s = situations[idx];
    setEditingSitIdx(idx);
    setSitDescription(s.situation);
    setSitThought(s.automaticThought);
    setSitMeaning(s.meaning);
    setSitEmotion(s.emotion);
    setSitBehavior(s.behavior);
  };

  const handleDeleteSituation = (idx: number) => {
    setSituations(situations.filter((_, i) => i !== idx));
    if (editingSitIdx === idx) {
      setEditingSitIdx(null);
      setSitDescription('');
      setSitThought('');
      setSitMeaning('');
      setSitEmotion('');
      setSitBehavior('');
    }
    toast.success('Situação removida.');
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente!');
      return;
    }
    if (!childhoodInput || !beliefsInput || !rulesInput || !strategiesInput) {
      toast.error('Por favor, preencha todos os blocos estruturais do DFC.');
      return;
    }
    if (situations.length === 0) {
      toast.error('Mapeie pelo menos 1 situação típica para gerar a análise clínica.');
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

      const dfcText = `
Dados de Infância: ${childhoodInput}
Crenças Centrais: ${beliefsInput}
Regras/Suposições: ${rulesInput}
Estratégias Compensatórias: ${strategiesInput}

SITUAÇÕES MAPEADAS:
${situations.map((s, idx) => `
Situação ${idx + 1}: ${s.situation}
- Pensamento Automático: "${s.automaticThought}"
- Significado: ${s.meaning}
- Emoção: ${s.emotion}
- Comportamento: ${s.behavior}
`).join('\n')}
      `.trim();

      const analysis = await analyzeDfcAssessment({ name: pData.name, age: pData.age }, dfcText);

      const newRecord: DfcRecord = {
        id: Date.now().toString(),
        patient: pData,
        relevantChildhoodData: childhoodInput,
        coreBeliefs: beliefsInput,
        conditionalRules: rulesInput,
        compensatoryStrategies: strategiesInput,
        situations: [...situations],
        aiAnalysis: analysis,
        createdAt: new Date().toISOString()
      };

      const updated = await dbWrapper.saveEntry(newRecord, selectedPatientId, userId);
      setAssessments(updated);
      setCurrentResult(newRecord);
      toast.success('Diagrama salvo no prontuário!');
    } catch (error) {
      console.error(error);
      toast.error('Erro na análise da IA. Verifique se a chave API está configurada.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!selectedPatientId) return;
    if (window.confirm('Deseja excluir permanentemente este diagrama DFC do prontuário?')) {
      try {
        const updated = await dbWrapper.deleteEntry(id, selectedPatientId, userId);
        setAssessments(updated);
        toast.success('Diagrama excluído.');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao deletar.');
      }
    }
  };

  const handleExport = (assessment: DfcRecord) => {
    exportToHtml(assessment);
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg-deep text-text-main font-sans overflow-hidden select-none relative">
      {/* HEADER COMPONENT */}
      <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#6366f1] h-8 w-8 rounded-lg flex items-center justify-center text-white font-black transition-transform hover:scale-105">
            <Layers size={16} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
            DFC
            <span className="text-[#6366f1] font-black">Assistido</span> 
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
              setChildhoodInput('');
              setBeliefsInput('');
              setRulesInput('');
              setStrategiesInput('');
              setSituations([]);
            }}
            disabled={lockPatient}
            className={cn(
              "bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none focus:border-[#6366f1] transition-all max-w-[200px] truncate",
              lockPatient && "opacity-75 cursor-not-allowed border-transparent"
            )}
          >
            <option value="" className="bg-bg-card text-text-dim">-- Selecionar Paciente --</option>
            {(patients || []).map(p => (
              <option key={`dfc-patient-opt-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1]/5 hover:bg-[#6366f1]/10 border border-[#6366f1]/20 hover:border-[#6366f1]/45 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#6366f1] transition-all cursor-pointer"
              >
                <Zap size={11} /> Simular
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
              >
                {isAnalyzing ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Brain size={11} />
                )}
                Gerar Conceituação
              </button>
            </div>
          )}
          <div className="flex gap-1 bg-bg-sidebar p-1 rounded-xl border border-border-subtle/50">
            {[
              { id: 'test', label: 'Diagrama' },
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
                    ? "bg-bg-card text-[#6366f1] border border-border-subtle shadow-sm" 
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
      <main className="flex-1 flex overflow-hidden relative">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-12 bg-bg-deep">
            <Layers size={48} className="text-[#6366f1] mb-4 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
              Por favor, selecione um paciente no topo da janela para começar a modelar o diagrama cognitivo ou visualizar conceituações arquivadas.
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {currentResult ? (
                <div className="flex-1 overflow-y-auto p-6 bg-bg-deep w-full scroller-hide select-text">
                  <ResultView 
                    key="result"
                    assessment={currentResult} 
                    onBack={() => setCurrentResult(null)} 
                    onExport={() => handleExport(currentResult)}
                  />
                </div>
              ) : activeTab === 'test' ? (
                <div className="flex flex-1 overflow-hidden w-full relative">
                  {/* Left panel info & stats */}
                  <aside className="w-64 border-r border-border-subtle bg-bg-sidebar/30 p-6 flex flex-col gap-6 overflow-y-auto scroller-hide shrink-0 hidden md:flex">
                    <div>
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Avaliando</h3>
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
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">DFC Mapeamento</h3>
                      <div className="space-y-3 text-[10px] text-text-dim font-bold uppercase tracking-wider">
                        <div className="flex justify-between items-center">
                          <span>Situações:</span>
                          <span className={cn("px-2 py-0.5 rounded font-black", situations.length > 0 ? "text-[#6366f1] bg-[#6366f1]/10" : "text-text-dim/40 bg-bg-sidebar")}>
                            {situations.length} / 3
                          </span>
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* Right main workspace split into Form + Interactive List */}
                  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-bg-deep">
                    {/* DFC Main Formulation Inputs */}
                    <div className="w-full lg:w-[420px] lg:border-r border-border-subtle p-6 overflow-y-auto scroller-hide shrink-0 bg-bg-sidebar/10 space-y-5">
                      <h2 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
                        <Layers size={16} className="text-[#6366f1]" /> Conceituação de Caso
                      </h2>

                      {/* Childhood Data */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider">Dados Relevantes da Infância</label>
                        <textarea
                          rows={2}
                          value={childhoodInput}
                          onChange={(e) => setChildhoodInput(e.target.value)}
                          placeholder="Fatos históricos de infância, dinâmicas parentais ou traumas marcantes..."
                          className="bg-bg-card border border-border-subtle text-text-main text-xs font-medium rounded-xl p-3 outline-none focus:border-[#6366f1] transition-all resize-none leading-relaxed"
                        />
                      </div>

                      {/* Core Beliefs */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Crenças Centrais / Nucleares</label>
                        <textarea
                          rows={2}
                          value={beliefsInput}
                          onChange={(e) => setBeliefsInput(e.target.value)}
                          placeholder="Ex: 'Sou inadequado', 'As pessoas vão me rejeitar'..."
                          className="bg-bg-card border border-red-500/35 text-text-main text-xs font-bold rounded-xl p-3 outline-none focus:border-red-500 transition-all resize-none leading-relaxed"
                        />
                      </div>

                      {/* Conditional Rules */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Regras e Suposições Condicionais</label>
                        <textarea
                          rows={2}
                          value={rulesInput}
                          onChange={(e) => setRulesInput(e.target.value)}
                          placeholder="Ex: 'Se eu for perfeito, então me aceitarão'..."
                          className="bg-bg-card border border-amber-500/35 text-text-main text-xs font-medium rounded-xl p-3 outline-none focus:border-amber-500 transition-all resize-none leading-relaxed"
                        />
                      </div>

                      {/* Compensatory Strategies */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Estratégias Compensatórias</label>
                        <textarea
                          rows={2}
                          value={strategiesInput}
                          onChange={(e) => setStrategiesInput(e.target.value)}
                          placeholder="Comportamentos que reduzem a ansiedade das crenças nucleares (evitação, autoexigência)..."
                          className="bg-bg-card border border-emerald-500/35 text-text-main text-xs font-medium rounded-xl p-3 outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Mapped Situations Form and List */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-bg-deep">
                      {/* Situation Form Container */}
                      <div className="p-6 border-b border-border-subtle bg-bg-sidebar/5 shrink-0">
                        <h3 className="text-xs font-black text-text-dim uppercase tracking-widest mb-3 flex items-center gap-2">
                          {editingSitIdx !== null ? (
                            <>
                              <Edit2 size={14} className="text-[#6366f1]" /> Editar Situação Típica
                            </>
                          ) : (
                            <>
                              <Plus size={14} className="text-[#6366f1]" /> Mapear Situação Típica
                            </>
                          )}
                        </h3>
                        
                        <form onSubmit={handleAddSituation} className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input 
                              type="text"
                              required
                              value={sitDescription}
                              onChange={(e) => setSitDescription(e.target.value)}
                              placeholder="Situação típica (Ex: Apresentar slide)"
                              className="bg-bg-card border border-border-subtle text-text-main text-xs font-bold rounded-xl px-4 h-10 outline-none focus:border-[#6366f1] transition-all"
                            />
                            <input 
                              type="text"
                              required
                              value={sitThought}
                              onChange={(e) => setSitThought(e.target.value)}
                              placeholder="Pensamento Automático"
                              className="bg-bg-card border border-border-subtle text-text-main text-xs font-bold rounded-xl px-4 h-10 outline-none focus:border-[#6366f1] transition-all"
                            />
                            <input 
                              type="text"
                              required
                              value={sitMeaning}
                              onChange={(e) => setSitMeaning(e.target.value)}
                              placeholder="Significado Clínico"
                              className="bg-bg-card border border-border-subtle text-text-main text-xs font-bold rounded-xl px-4 h-10 outline-none focus:border-[#6366f1] transition-all"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input 
                              type="text"
                              required
                              value={sitEmotion}
                              onChange={(e) => setSitEmotion(e.target.value)}
                              placeholder="Emoção (Ex: Ansiedade 80%)"
                              className="bg-bg-card border border-red-500/20 text-text-main text-xs font-bold rounded-xl px-4 h-10 outline-none focus:border-[#6366f1] transition-all"
                            />
                            <input 
                              type="text"
                              required
                              value={sitBehavior}
                              onChange={(e) => setSitBehavior(e.target.value)}
                              placeholder="Comportamento resultante"
                              className="bg-bg-card border border-emerald-500/20 text-text-main text-xs font-bold rounded-xl px-4 h-10 outline-none focus:border-[#6366f1] transition-all"
                            />
                            
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="flex-1 h-10 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                {editingSitIdx !== null ? (
                                  <>
                                    <ClipboardCheck size={12} /> Salvar
                                  </>
                                ) : (
                                  <>
                                    <Plus size={12} /> Adicionar
                                  </>
                                )}
                              </button>
                              
                              {editingSitIdx !== null && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSitIdx(null);
                                    setSitDescription('');
                                    setSitThought('');
                                    setSitMeaning('');
                                    setSitEmotion('');
                                    setSitBehavior('');
                                  }}
                                  className="h-10 px-3 bg-bg-sidebar border border-border-subtle hover:border-rose-500 hover:text-rose-500 rounded-xl text-text-dim transition-all cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* Situations List workspace */}
                      <div className="flex-grow p-6 overflow-y-auto scroller-hide select-text">
                        <h3 className="text-xs font-black text-text-dim uppercase tracking-widest mb-4">
                          Fluxos de Funcionamento Ativos ({situations.length}/3)
                        </h3>
                        
                        {situations.length === 0 ? (
                          <div className="text-center py-16 bg-bg-card/40 rounded-[2rem] border border-border-subtle border-dashed">
                            <Layers size={24} className="mx-auto text-text-dim mb-3" />
                            <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nenhuma situação típica registrada</p>
                            <p className="text-[8px] text-text-dim/60 uppercase tracking-widest mt-1 max-w-[240px] mx-auto leading-relaxed">
                              Registre pensamentos automáticos e comportamentos associados às situações gatilho mais comuns do paciente.
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {situations.map((sit, idx) => (
                              <div 
                                key={`sit-list-item-${idx}`}
                                className={cn(
                                  "p-5 bg-bg-card border border-border-subtle rounded-2xl flex flex-col gap-4 justify-between hover:border-[#6366f1]/25 transition-all duration-200 shadow-sm relative",
                                  editingSitIdx === idx && "border-[#6366f1] bg-[#6366f1]/5"
                                )}
                              >
                                <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-bg-sidebar border border-border-subtle text-[#6366f1]">
                                    SITUAÇÃO {idx + 1}
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditSituation(idx)}
                                      disabled={editingSitIdx === idx}
                                      className="p-1.5 text-text-dim/50 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent rounded-lg transition-all cursor-pointer disabled:opacity-40"
                                      title="Editar"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSituation(idx)}
                                      className="p-1.5 text-text-dim/50 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent rounded-lg transition-all cursor-pointer"
                                      title="Remover"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] leading-relaxed">
                                  <div>
                                    <span className="text-[7.5px] font-black uppercase text-text-dim block">Situação</span>
                                    <p className="font-bold text-text-main truncate">{sit.situation}</p>
                                  </div>
                                  <div>
                                    <span className="text-[7.5px] font-black uppercase text-text-dim block">Pensamento Automático</span>
                                    <p className="italic font-bold text-text-main truncate">"{sit.automaticThought}"</p>
                                  </div>
                                  <div>
                                    <span className="text-[7.5px] font-black uppercase text-red-400 block">Emoções</span>
                                    <p className="text-red-400 font-bold truncate">{sit.emotion}</p>
                                  </div>
                                  <div>
                                    <span className="text-[7.5px] font-black uppercase text-emerald-400 block">Comportamento</span>
                                    <p className="text-emerald-400 font-medium truncate">{sit.behavior}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 bg-bg-deep scroller-hide select-text">
                  <HistoryView 
                    key="history"
                    assessments={assessments} 
                    onView={setCurrentResult} 
                    onDelete={handleDeleteAssessment}
                  />
                </div>
              )}
            </AnimatePresence>
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
