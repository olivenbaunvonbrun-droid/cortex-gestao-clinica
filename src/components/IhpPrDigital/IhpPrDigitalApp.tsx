import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  History as HistoryIcon, 
  User, 
  Zap, 
  Users,
  Brain,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IHP_QUESTIONS, PatientData, Assessment, Frequency, FREQUENCY_LABELS, HP_DETAILS } from './types';
import { generateFakeAnswers } from './utils/simulation';
import { calculateAssessment } from './lib/scoring';
import { analyzeIhpAssessment } from '../../services/geminiService';
import { exportToHtml } from './utils/export';
import { cn } from '../../lib/utils';
import { db } from '../../lib/db';
import { dbWrapper } from './lib/ihpDbWrapper';
import { Toaster, toast } from 'react-hot-toast';

// Helper components
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';

interface IhpPrDigitalAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
  onClose?: () => void;
}

export default function IhpPrDigitalApp({ activePatientId, lockPatient = false, userId, onClose }: IhpPrDigitalAppProps) {
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

  // Load settings from Dexie
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

  // Load patients and pre-select activePatientId
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

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente antes de finalizar!');
      return;
    }
    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    if (!patientObj) return;

    if (Object.keys(answers).length < IHP_QUESTIONS.length) {
      toast.error(`Por favor, responda todas as ${IHP_QUESTIONS.length} perguntas.`);
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

      // Calculate subscales and QIP score
      const { subscales, qip } = calculateAssessment(answers);
      const resultsText = Object.entries(subscales)
        .map(([key, res]) => `- ${res.name}: Pontuação ${res.score} / ${res.maxScore} (${res.classification})`)
        .concat(`- ${qip.name}: Pontuação Total ${qip.score} / ${qip.maxScore} (${qip.classification})`)
        .join('\n');

      const answersText = Object.entries(answers)
        .map(([id, freq]) => {
          const question = IHP_QUESTIONS.find(q => q.id === parseInt(id));
          return `Item ${id}: ${freq} - "${question?.text}" (Dimensão: ${HP_DETAILS[question?.categoryKey || '']?.name || ''})`;
        })
        .join('\n');

      let analysis = '';
      try {
        analysis = await analyzeIhpAssessment({ name: pData.name, age: pData.age }, resultsText, answersText);
      } catch (err: any) {
        console.error("Erro ao gerar análise IHP via IA:", err);
        toast.error('Não foi possível gerar a análise da IA, mas a avaliação foi salva localmente.');
        analysis = 'Não foi possível gerar a análise técnica de IA no momento do salvamento.';
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
      toast.success('Avaliação salva no prontuário do paciente!');
    } catch (error) {
      console.error(error);
      toast.error('Erro na análise da IA. Verifique se a chave API está configurada.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!selectedPatientId) return;
    if (window.confirm('Tem certeza que deseja excluir esta avaliação do prontuário permanentemente?')) {
      try {
        const updated = await dbWrapper.deleteEntry(id, selectedPatientId, userId);
        setAssessments(updated);
        toast.success('Avaliação excluída com sucesso.');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao deletar avaliação.');
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
          <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-bg-deep font-black transition-transform hover:scale-105">
            <Brain size={16} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
            IHP-PR
            <span className="text-primary font-black">Digital</span> 
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
              <option key={`ihp-patient-opt-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* SUB-TABS */}
        <div className="flex items-center gap-3">
          {activeTab === 'test' && !currentResult && selectedPatientId && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSimulate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/45 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition-all cursor-pointer"
              >
                <Zap size={11} /> Simular
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing || Object.keys(answers).length < IHP_QUESTIONS.length}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:bg-bg-sidebar disabled:border disabled:border-border-subtle disabled:text-text-dim/40 text-bg-deep rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:pointer-events-none cursor-pointer"
              >
                {isAnalyzing ? (
                  <div className="w-3 h-3 border-2 border-bg-deep/30 border-t-bg-deep rounded-full animate-spin" />
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
            <Brain size={48} className="text-primary mb-4 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
              Por favor, selecione um paciente no topo da janela para começar a responder o questionário ou visualizar o histórico de laudos.
            </p>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col overflow-auto">
            {/* Form Tab Panel */}
            <div className={cn("w-full flex-1 flex flex-col overflow-auto", (activeTab === 'test' && !currentResult) ? "block" : "hidden")}>
              <div className="flex flex-1 overflow-auto w-full relative">
                  {/* Left panel info */}
                  <aside className="w-64 border-r border-border-subtle bg-bg-sidebar/30 p-6 flex flex-col gap-6 overflow-y-auto scroller-hide shrink-0 hidden md:flex">
                    <div>
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Identificação</h3>
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
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Status da Sessão</h3>
                      <div className="flex items-center justify-between text-xs p-4 bg-bg-card rounded-2xl border border-border-subtle shadow-inner">
                        <span className="text-text-dim text-[10px] font-bold uppercase">Respostas</span>
                        <span className="font-black text-primary">
                          {Object.keys(answers).length} / {IHP_QUESTIONS.length}
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-[8px] font-black uppercase text-text-dim/60">
                          <span>Progresso</span>
                          <span>{Math.round((Object.keys(answers).length / IHP_QUESTIONS.length) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-bg-sidebar border border-border-subtle rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${(Object.keys(answers).length / IHP_QUESTIONS.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border-subtle pt-6">
                      <h3 className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] mb-4">Legenda de Frequência</h3>
                      <div className="space-y-2.5">
                        {(Object.keys(FREQUENCY_LABELS) as unknown as Frequency[]).map(val => (
                          <div key={val} className="flex gap-2">
                            <span className="w-5 h-5 rounded-md bg-bg-sidebar border border-border-subtle flex items-center justify-center text-[10px] font-black text-primary shrink-0">{val}</span>
                            <span className="text-[9px] leading-tight text-text-dim uppercase font-bold">{FREQUENCY_LABELS[val]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>

                  {/* Main Questionnaire scrollable area */}
                  <div className="flex-1 overflow-y-auto bg-bg-deep p-6 scroller-hide select-text">
                    <div className="max-w-3xl mx-auto space-y-6 pb-24">
                      {IHP_QUESTIONS.map(q => (
                        <div 
                          key={q.id}
                          className="bg-bg-card p-6 sm:p-8 rounded-[2rem] border border-border-subtle shadow-md hover:border-primary/25 transition-all duration-300 group relative"
                        >
                          <div className="flex items-start gap-4 mb-6">
                            <span className="shrink-0 w-8 h-8 rounded-xl bg-bg-sidebar border border-border-subtle flex items-center justify-center text-[11px] font-black text-text-dim group-hover:bg-primary group-hover:text-bg-deep group-hover:border-primary transition-all duration-300">
                              {q.id}
                            </span>
                            <div className="flex-1">
                              <span className="text-[8px] font-black tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md mb-2 inline-block">
                                {HP_DETAILS[q.categoryKey]?.name}
                              </span>
                              <p className="text-text-main text-sm font-medium pt-1 leading-relaxed">
                                {q.text}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-5 gap-2 sm:gap-3">
                            {([1, 2, 3, 4, 5] as Frequency[]).map((val) => {
                              const isSelected = answers[q.id] === val;
                              return (
                                <button
                                  key={val}
                                  onClick={() => setAnswers({...answers, [q.id]: val})}
                                  className={cn(
                                    "h-12 rounded-xl text-xs font-black border transition-all flex flex-col items-center justify-center relative cursor-pointer",
                                    isSelected 
                                      ? "bg-primary border-primary text-bg-deep shadow-lg shadow-primary/10 font-bold scale-[1.02] z-10" 
                                      : "bg-bg-sidebar border-border-subtle text-text-dim hover:border-primary/30 hover:text-text-main"
                                  )}
                                  title={FREQUENCY_LABELS[val]}
                                >
                                  <span>{val}</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-3 flex justify-between px-1 text-[8px] font-black uppercase tracking-wider text-text-dim/35">
                            <span>Nunca ou quase nunca</span>
                            <span>Sempre ou quase sempre</span>
                          </div>
                        </div>
                      ))}
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
