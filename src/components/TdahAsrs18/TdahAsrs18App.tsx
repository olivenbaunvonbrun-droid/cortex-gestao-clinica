import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  History as HistoryIcon, 
  Users, 
  ClipboardCheck, 
  Trash2, 
  Brain, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ASRS_QUESTIONS, PatientData, Assessment, Frequency, FREQUENCY_LABELS, FREQUENCY_TEXTS } from './types';
import { calculateTdahAssessment } from './lib/scoring';
import { generateFakeAnswers } from './utils/simulation';
import { analyzeTdahAssessment } from '../../services/geminiService';
import { exportToHtml } from './utils/export';
import { cn } from '../../lib/utils';
import { db } from '../../lib/db';
import { dbWrapper } from './lib/tdahDbWrapper';
import { toast } from 'react-hot-toast';

// Helper components
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';

interface TdahAsrs18AppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
  onClose?: () => void;
}

export default function TdahAsrs18App({ activePatientId, lockPatient = false, userId, onClose }: TdahAsrs18AppProps) {
  const [activeTab, setActiveTab] = useState<'test' | 'history'>('test');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, Frequency>>({});
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<Assessment | null>(null);

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
        console.error("Failed to load settings in TDAH App:", err);
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
    setAnswers(generateFakeAnswers());
    toast.success('Respostas simuladas geradas com sucesso!');
  };

  const handleClearAnswers = () => {
    if (Object.keys(answers).length > 0 && window.confirm('Deseja realmente limpar todas as respostas preenchidas?')) {
      setAnswers({});
      toast.success('Questionário reiniciado.');
    }
  };

  const handleSelectAnswer = (questionId: number, freq: Frequency) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: freq
    }));
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente antes de finalizar!');
      return;
    }
    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    if (!patientObj) return;

    if (Object.keys(answers).length < ASRS_QUESTIONS.length) {
      toast.error(`Por favor, responda todas as ${ASRS_QUESTIONS.length} perguntas (${Object.keys(answers).length}/${ASRS_QUESTIONS.length} preenchidas).`);
      return;
    }

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

      const results = calculateTdahAssessment(answers);

      const answersText = ASRS_QUESTIONS.map(q => {
        const val = answers[q.id] ?? 0;
        return `Item ${q.id} (${q.partCategory}): ${FREQUENCY_LABELS[val as Frequency]} - "${q.text}"`;
      }).join('\n');

      let analysis = '';
      try {
        analysis = await analyzeTdahAssessment(
          { name: pData.name, age: pData.age },
          {
            classification: results.classification,
            riskLevel: results.riskLevel,
            totalScore: results.totalScore,
            partAScore: results.partA.rawScore,
            partASignificant: results.partA.significantSymptoms,
            thresholdMetA: results.partA.thresholdMet,
            partBScore: results.partB.rawScore,
            partBSignificant: results.partB.significantSymptoms,
            thresholdMetB: results.partB.thresholdMet,
            summaryText: results.summaryText
          },
          answersText
        );
      } catch (err: any) {
        console.error("Erro ao gerar laudo de TDAH via IA:", err);
        toast.error('Não foi possível conectar à IA no momento, mas a avaliação quantitativa foi salva.');
        analysis = 'Não foi possível gerar a análise técnica de IA no momento do salvamento. Você pode clicar em "Refazer Análise com IA" posteriormente.';
      }
      
      const newAssessment: Assessment = {
        id: Date.now().toString(),
        patient: pData,
        answers: { ...answers },
        aiAnalysis: analysis,
        createdAt: new Date().toISOString()
      };
      
      const updated = await dbWrapper.saveEntry(newAssessment, selectedPatientId, userId);
      setAssessments(updated);
      setCurrentResult(newAssessment);
      toast.success('Avaliação de TDAH salva no prontuário do paciente!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar a avaliação.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateAnalysis = async (newAnalysis: string) => {
    if (!currentResult || !selectedPatientId) return;
    const updated: Assessment = {
      ...currentResult,
      aiAnalysis: newAnalysis
    };
    const updatedList = await dbWrapper.saveEntry(updated, selectedPatientId, userId);
    setAssessments(updatedList);
    setCurrentResult(updated);
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!selectedPatientId) return;
    if (window.confirm('Tem certeza que deseja excluir esta avaliação de TDAH do prontuário permanentemente?')) {
      try {
        const updated = await dbWrapper.deleteEntry(id, selectedPatientId, userId);
        setAssessments(updated);
        if (currentResult?.id === id) {
          setCurrentResult(null);
        }
        toast.success('Avaliação excluída com sucesso.');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao deletar avaliação.');
      }
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / ASRS_QUESTIONS.length) * 100);

  const partAQuestions = ASRS_QUESTIONS.filter(q => q.part === 'A');
  const partBQuestions = ASRS_QUESTIONS.filter(q => q.part === 'B');

  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-bg-deep text-text-main font-sans overflow-hidden select-none relative">
      {/* HEADER COMPONENT */}
      <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 h-8 w-8 rounded-lg flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 transition-transform hover:scale-105">
            <Zap size={16} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-1.5">
            TDAH
            <span className="text-amber-400 font-black">ASRS-18</span> 
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
              "bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none focus:border-amber-400 transition-all max-w-[200px] truncate",
              lockPatient && "opacity-75 cursor-not-allowed border-transparent"
            )}
          >
            <option value="" className="bg-bg-card text-text-dim">-- Selecionar Paciente --</option>
            {(patients || []).map(p => (
              <option key={`tdah-patient-opt-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* SUB-TABS AND ACTIONS */}
        <div className="flex items-center gap-3">
          {activeTab === 'test' && !currentResult && selectedPatientId && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSimulate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-400 transition-all cursor-pointer"
                title="Preencher com dados simulados para teste"
              >
                <Zap size={11} /> Simular
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing || answeredCount < ASRS_QUESTIONS.length}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-bg-sidebar disabled:border disabled:border-border-subtle disabled:text-text-dim/40 text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:pointer-events-none cursor-pointer shadow-sm shadow-amber-500/10"
              >
                {isAnalyzing ? (
                  <div className="w-3 h-3 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <ClipboardCheck size={11} />
                )}
                Gerar Laudo
              </button>
            </div>
          )}

          <div className="flex gap-1 bg-bg-sidebar p-1 rounded-xl border border-border-subtle/50">
            {[
              { id: 'test', label: 'Avaliação' },
              { id: 'history', label: `Histórico (${assessments.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'test' && !currentResult) {
                    // Stay in questionnaire
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeTab === tab.id 
                    ? "bg-amber-500 text-slate-950 shadow-sm" 
                    : "text-text-dim hover:text-text-main"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 scroller-subtle">
        <AnimatePresence mode="wait">
          {activeTab === 'history' ? (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <HistoryView
                assessments={assessments}
                onSelect={(a) => {
                  setCurrentResult(a);
                  setActiveTab('test');
                }}
                onDelete={handleDeleteAssessment}
                onExport={(a) => exportToHtml(a)}
              />
            </motion.div>
          ) : currentResult ? (
            <motion.div
              key="result-view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ResultView
                assessment={currentResult}
                onBack={() => setCurrentResult(null)}
                onExport={() => exportToHtml(currentResult)}
                onUpdateAnalysis={handleUpdateAnalysis}
              />
            </motion.div>
          ) : (
            <motion.div
              key="test-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Patient Selection Banner or Warning */}
              {!selectedPatientId ? (
                <div className="p-6 bg-bg-card border border-amber-500/20 rounded-3xl flex items-center gap-4 text-center justify-center flex-col shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Users size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-text-main">Selecione um Paciente</h3>
                    <p className="text-xs text-text-dim max-w-md">
                      Para iniciar a Escala de TDAH em Adultos (ASRS-18), selecione o paciente no topo da tela para vincular os resultados ao prontuário clínico.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Test Instructions & Progress Card */}
                  <div className="bg-bg-card border border-border-subtle rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                            OMS / DSM-5
                          </span>
                          <h2 className="text-xs font-black uppercase tracking-wider text-text-main">
                            Adult Self-Report Scale (ASRS-18 v1.1)
                          </h2>
                        </div>
                        <p className="text-[11px] text-text-dim mt-1 leading-relaxed">
                          Avalie a frequência de cada comportamento nos <strong>últimos 6 meses</strong>. Responda a todos os 18 itens para habilitar a geração do laudo e parecer técnico via IA.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          {answeredCount} / {ASRS_QUESTIONS.length}
                        </span>
                        <span className="text-[10px] text-text-dim">({progressPercent}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-border-subtle/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* PARTE A: DESATENÇÃO */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-text-main">
                          Parte A — Sintomas de Desatenção (Itens 1 a 9)
                        </h3>
                      </div>
                      <span className="text-[10px] text-text-dim">
                        Limiar positivo: 4 ou mais itens com pontuação ≥ 2
                      </span>
                    </div>

                    <div className="space-y-3">
                      {partAQuestions.map((q) => {
                        const currentAnswer = answers[q.id];
                        const isAnswered = currentAnswer !== undefined;

                        return (
                          <div 
                            key={`question-${q.id}`}
                            className={cn(
                              "p-4 rounded-2xl border transition-all duration-200 bg-bg-card",
                              isAnswered 
                                ? "border-border-subtle shadow-sm" 
                                : "border-border-subtle/50 hover:border-amber-400/30"
                            )}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <span className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors",
                                isAnswered ? "bg-amber-400 text-slate-950" : "bg-bg-sidebar text-text-dim border border-border-subtle"
                              )}>
                                {q.id}
                              </span>
                              <p className="text-xs font-medium text-text-main leading-relaxed pt-0.5">
                                {q.text}
                              </p>
                            </div>

                            {/* Options Button Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pl-9">
                              {[
                                { val: Frequency.NONE, label: 'Nem um pouco (0)' },
                                { val: Frequency.SLIGHTLY, label: 'Só um pouco (1)' },
                                { val: Frequency.OFTEN, label: 'Bastante (2)' },
                                { val: Frequency.VERY_OFTEN, label: 'Demais (3)' }
                              ].map((opt) => {
                                const isSelected = currentAnswer === opt.val;
                                return (
                                  <button
                                    key={`q-${q.id}-opt-${opt.val}`}
                                    type="button"
                                    onClick={() => handleSelectAnswer(q.id, opt.val)}
                                    className={cn(
                                      "py-2 px-2.5 rounded-xl text-[10.5px] font-bold transition-all text-center cursor-pointer border",
                                      isSelected
                                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm shadow-amber-500/20 font-black scale-[1.02]"
                                        : "bg-bg-sidebar hover:bg-bg-card text-text-dim hover:text-text-main border-border-subtle/70"
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PARTE B: HIPERATIVIDADE / IMPULSIVIDADE */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-text-main">
                          Parte B — Sintomas de Hiperatividade / Impulsividade (Itens 10 a 18)
                        </h3>
                      </div>
                      <span className="text-[10px] text-text-dim">
                        Limiar positivo: 4 ou mais itens com pontuação ≥ 2
                      </span>
                    </div>

                    <div className="space-y-3">
                      {partBQuestions.map((q) => {
                        const currentAnswer = answers[q.id];
                        const isAnswered = currentAnswer !== undefined;

                        return (
                          <div 
                            key={`question-${q.id}`}
                            className={cn(
                              "p-4 rounded-2xl border transition-all duration-200 bg-bg-card",
                              isAnswered 
                                ? "border-border-subtle shadow-sm" 
                                : "border-border-subtle/50 hover:border-amber-400/30"
                            )}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <span className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors",
                                isAnswered ? "bg-amber-400 text-slate-950" : "bg-bg-sidebar text-text-dim border border-border-subtle"
                              )}>
                                {q.id}
                              </span>
                              <p className="text-xs font-medium text-text-main leading-relaxed pt-0.5">
                                {q.text}
                              </p>
                            </div>

                            {/* Options Button Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pl-9">
                              {[
                                { val: Frequency.NONE, label: 'Nem um pouco (0)' },
                                { val: Frequency.SLIGHTLY, label: 'Só um pouco (1)' },
                                { val: Frequency.OFTEN, label: 'Bastante (2)' },
                                { val: Frequency.VERY_OFTEN, label: 'Demais (3)' }
                              ].map((opt) => {
                                const isSelected = currentAnswer === opt.val;
                                return (
                                  <button
                                    key={`q-${q.id}-opt-${opt.val}`}
                                    type="button"
                                    onClick={() => handleSelectAnswer(q.id, opt.val)}
                                    className={cn(
                                      "py-2 px-2.5 rounded-xl text-[10.5px] font-bold transition-all text-center cursor-pointer border",
                                      isSelected
                                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm shadow-amber-500/20 font-black scale-[1.02]"
                                        : "bg-bg-sidebar hover:bg-bg-card text-text-dim hover:text-text-main border-border-subtle/70"
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="pt-4 pb-12 flex items-center justify-between border-t border-border-subtle px-2">
                    <button
                      type="button"
                      onClick={handleClearAnswers}
                      disabled={answeredCount === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-text-dim hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      <RotateCcw size={12} /> Limpar Respostas
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-text-dim">
                        {answeredCount < ASRS_QUESTIONS.length ? (
                          <>Faltam <strong>{ASRS_QUESTIONS.length - answeredCount}</strong> respostas</>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} /> Todas as 18 respondidas
                          </span>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isAnalyzing || answeredCount < ASRS_QUESTIONS.length}
                        className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-bg-sidebar disabled:border disabled:border-border-subtle disabled:text-text-dim/40 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:pointer-events-none cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                            Gerando Laudo...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} /> Gerar Laudo Clínico
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
