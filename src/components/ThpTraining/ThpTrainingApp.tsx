import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  Download, 
  Upload, 
  Check, 
  AlertCircle, 
  Save, 
  Sparkles, 
  Users, 
  X,
  Star,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Activity,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/db';
import { dbWrapper } from './lib/thpDbWrapper';
import { PSYCHOLOGICAL_SKILLS } from './constants';
import { ThpRecord, ThpExercise, ThpSession, PatientData } from './types';
import { analyzeThpAssessment } from '../../services/geminiService';
import { exportThpToHtml } from './utils/export';
import { Toaster, toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface ThpTrainingAppProps {
  activePatientId?: string | null;
  lockPatient?: boolean;
  userId?: string;
}

export default function ThpTrainingApp({ activePatientId, lockPatient = false, userId }: ThpTrainingAppProps) {
  const [activeTab, setActiveTab] = useState<'training' | 'history'>('training');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // Active Record State
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(30);
  const [targetLevel, setTargetLevel] = useState<number>(80);
  const [exercises, setExercises] = useState<ThpExercise[]>([]);
  const [sessions, setSessions] = useState<ThpSession[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>('');

  // History list
  const [history, setHistory] = useState<ThpRecord[]>([]);
  const [historySearch, setHistorySearch] = useState('');

  // New Exercise Form State
  const [newExerciseText, setNewExerciseText] = useState('');
  
  // New Session Log Form State
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionDuration, setSessionDuration] = useState<number>(45);
  const [sessionDesc, setSessionDesc] = useState('');
  const [sessionDifficulty, setSessionDifficulty] = useState<number>(3);
  const [sessionAchievements, setSessionAchievements] = useState('');
  const [sessionObstacles, setSessionObstacles] = useState('');
  const [sessionStrategy, setSessionStrategy] = useState('');

  // System settings for CRP/Psychologist details
  const [settings, setSettings] = useState({
    professionalName: 'Psicólogo(a)',
    professionalCRP: '',
    professionalLogo: '',
    professionalSignature: ''
  });

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load patients list
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

  // Load history list
  const loadHistoryList = async () => {
    if (selectedPatientId) {
      const loaded = await dbWrapper.getHistory(selectedPatientId);
      setHistory(loaded);
    } else {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistoryList();
    // Reset active record on patient swap
    handleResetForm();
  }, [selectedPatientId]);

  // Handle skill change - pre-populate default exercises
  useEffect(() => {
    if (!activeRecordId) {
      const selectedSkill = PSYCHOLOGICAL_SKILLS[selectedSkillIndex];
      if (selectedSkill) {
        const defaultExercises: ThpExercise[] = selectedSkill.defaultExercises.map((text, idx) => ({
          id: `default-${idx}-${Date.now()}`,
          text,
          completed: false,
          notes: ''
        }));
        setExercises(defaultExercises);
      }
    }
  }, [selectedSkillIndex, activeRecordId]);

  const handleResetForm = () => {
    setActiveRecordId(null);
    setSelectedSkillIndex(0);
    setCurrentLevel(30);
    setTargetLevel(80);
    setExercises([]);
    setSessions([]);
    setAiAnalysis('');
    setCreatedAt('');
    
    // Reset session log inputs
    setSessionDate(new Date().toISOString().split('T')[0]);
    setSessionDuration(45);
    setSessionDesc('');
    setSessionDifficulty(3);
    setSessionAchievements('');
    setSessionObstacles('');
    setSessionStrategy('');
  };

  // Add customized exercise
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseText.trim()) return;
    const newEx: ThpExercise = {
      id: `custom-${Date.now()}`,
      text: newExerciseText.trim(),
      completed: false,
      notes: ''
    };
    setExercises([...exercises, newEx]);
    setNewExerciseText('');
    toast.success('Exercício adicionado ao plano!');
  };

  // Toggle exercise completion
  const handleToggleExercise = (id: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
  };

  // Update exercise notes
  const handleUpdateExerciseNote = (id: string, notes: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, notes } : ex));
  };

  // Delete exercise from list
  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    toast.success('Exercício removido.');
  };

  // Add training session log
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error('Selecione um paciente antes de registrar treinos!');
      return;
    }
    if (!sessionDesc.trim()) {
      toast.error('Descreva o que foi treinado nesta sessão.');
      return;
    }

    const newSess: ThpSession = {
      id: `sess-${Date.now()}`,
      date: sessionDate,
      duration: sessionDuration,
      description: sessionDesc.trim(),
      difficulty: sessionDifficulty,
      achievements: sessionAchievements.trim(),
      obstacles: sessionObstacles.trim(),
      strategy: sessionStrategy.trim()
    };

    setSessions([newSess, ...sessions]);
    
    // Clear session inputs
    setSessionDesc('');
    setSessionAchievements('');
    setSessionObstacles('');
    setSessionStrategy('');
    toast.success('Sessão de treino registrada!');
  };

  // Delete session log
  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    toast.success('Registro de treino excluído.');
  };

  // Run AI progress report and supervision
  const handleGenerateReport = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor, selecione um paciente antes de analisar!');
      return;
    }
    if (sessions.length === 0) {
      toast.error('Cadastre pelo menos 1 sessão de treino no diário para gerar o relatório clínico.');
      return;
    }

    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    if (!patientObj) return;

    setIsAnalyzing(true);
    try {
      const patientDataSummary = {
        name: patientObj.nome,
        age: patientObj.nascimento ? String(new Date().getFullYear() - new Date(patientObj.nascimento).getFullYear()) : 'N/D'
      };

      const progressText = `Nível Atual da Habilidade: ${currentLevel}%\nNível Alvo Desejado: ${targetLevel}%`;
      const exercisesText = exercises.map(e => `- [${e.completed ? 'X' : ' '}] ${e.text} ${e.notes ? `(Obs: ${e.notes})` : ''}`).join('\n');
      const sessionLogsText = sessions.map(s => `Data: ${s.date} | Duração: ${s.duration} min | Dificuldade: ${s.difficulty}/5\nO que foi treinado: ${s.description}\nConquistas: ${s.achievements}\nObstáculos: ${s.obstacles}\nEstratégia de superação: ${s.strategy}`).join('\n\n');

      const analysis = await analyzeThpAssessment(
        patientDataSummary,
        PSYCHOLOGICAL_SKILLS[selectedSkillIndex]?.name || 'Habilidade Psicológica',
        progressText,
        sessionLogsText,
        exercisesText
      );

      setAiAnalysis(analysis);
      toast.success('Relatório clínico de IA gerado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao chamar IA de supervisão. Verifique sua chave API.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save current record to patient chart
  const handleSaveToRecord = async () => {
    if (!selectedPatientId) {
      toast.error('Selecione um paciente para salvar.');
      return;
    }
    
    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    if (!patientObj) return;

    try {
      const pData: PatientData = {
        name: patientObj.nome,
        age: patientObj.nascimento ? String(new Date().getFullYear() - new Date(patientObj.nascimento).getFullYear()) : 'N/D',
        psychologistName: settings.professionalName,
        crp: settings.professionalCRP,
        logoUrl: settings.professionalLogo,
        signatureUrl: settings.professionalSignature
      };

      const currentSkill = PSYCHOLOGICAL_SKILLS[selectedSkillIndex];

      const recordToSave: ThpRecord = {
        id: activeRecordId || Date.now().toString(),
        patient: pData,
        skillName: currentSkill.name,
        skillDescription: currentSkill.desc,
        currentLevel,
        targetLevel,
        exercises,
        sessions,
        aiAnalysis: aiAnalysis || undefined,
        createdAt: createdAt || new Date().toISOString()
      };

      const updated = await dbWrapper.saveEntry(recordToSave, selectedPatientId, userId);
      setHistory(updated);
      toast.success('Treinamento THP salvo com sucesso no prontuário do paciente!');
      
      // Load this record as active if it was new
      if (!activeRecordId) {
        setActiveRecordId(recordToSave.id);
        setCreatedAt(recordToSave.createdAt);
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar treinamento.');
    }
  };

  // Load a record from history for viewing/editing
  const handleLoadRecord = (record: ThpRecord) => {
    setActiveRecordId(record.id);
    const skillIndex = PSYCHOLOGICAL_SKILLS.findIndex(s => s.name === record.skillName);
    if (skillIndex !== -1) {
      setSelectedSkillIndex(skillIndex);
    }
    setCurrentLevel(record.currentLevel);
    setTargetLevel(record.targetLevel);
    setExercises(record.exercises || []);
    setSessions(record.sessions || []);
    setAiAnalysis(record.aiAnalysis || '');
    setCreatedAt(record.createdAt);
    
    setActiveTab('training');
    toast.success(`Habilidade ${record.skillName} carregada para edição!`);
  };

  // Delete a record from patient history
  const handleDeleteRecord = async (id: string) => {
    if (!selectedPatientId) return;
    if (window.confirm('Tem certeza que deseja remover este programa THP permanentemente do prontuário?')) {
      try {
        const updated = await dbWrapper.deleteEntry(id, selectedPatientId, userId);
        setHistory(updated);
        toast.success('Treinamento THP excluído.');
        if (activeRecordId === id) {
          handleResetForm();
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro ao excluir registro.');
      }
    }
  };

  // Export current active state to HTML/PDF
  const handleExportHtml = () => {
    const currentSkill = PSYCHOLOGICAL_SKILLS[selectedSkillIndex];
    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    
    if (!patientObj) {
      toast.error('Selecione um paciente para exportar.');
      return;
    }

    const pData: PatientData = {
      name: patientObj.nome,
      age: patientObj.nascimento ? String(new Date().getFullYear() - new Date(patientObj.nascimento).getFullYear()) : 'N/D',
      psychologistName: settings.professionalName,
      crp: settings.professionalCRP,
      logoUrl: settings.professionalLogo,
      signatureUrl: settings.professionalSignature
    };

    const tempRecord: ThpRecord = {
      id: activeRecordId || 'temp',
      patient: pData,
      skillName: currentSkill.name,
      skillDescription: currentSkill.desc,
      currentLevel,
      targetLevel,
      exercises,
      sessions,
      aiAnalysis: aiAnalysis || undefined,
      createdAt: createdAt || new Date().toISOString()
    };

    exportThpToHtml(tempRecord);
    toast.success('Exportação HTML concluída!');
  };

  // Export state to JSON file
  const handleExportJson = () => {
    const currentSkill = PSYCHOLOGICAL_SKILLS[selectedSkillIndex];
    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId));
    
    const recordJson: Partial<ThpRecord> = {
      id: activeRecordId || Date.now().toString(),
      skillName: currentSkill.name,
      skillDescription: currentSkill.desc,
      currentLevel,
      targetLevel,
      exercises,
      sessions,
      aiAnalysis: aiAnalysis || undefined,
      createdAt: createdAt || new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(recordJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `THP_${patientObj ? patientObj.nome.replace(/\s+/g, '_') : 'Paciente'}_${currentSkill.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON exportado com sucesso!');
  };

  // Import state from JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ThpRecord;
        if (!data.skillName || !data.exercises) {
          throw new Error('Formato THP inválido.');
        }

        const skillIdx = PSYCHOLOGICAL_SKILLS.findIndex(s => s.name === data.skillName);
        if (skillIdx !== -1) {
          setSelectedSkillIndex(skillIdx);
        }
        setCurrentLevel(data.currentLevel || 0);
        setTargetLevel(data.targetLevel || 100);
        setExercises(data.exercises || []);
        setSessions(data.sessions || []);
        setAiAnalysis(data.aiAnalysis || '');
        if (data.createdAt) setCreatedAt(data.createdAt);
        
        toast.success('Dados THP importados com sucesso!');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao importar arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear input selection
  };

  // Filtering history
  const filteredHistory = history.filter(item => 
    item.skillName.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="h-full w-full flex flex-col bg-bg-deep text-text-main font-sans overflow-hidden select-none relative">
      {/* HEADER COMPONENT */}
      <header className="h-14 bg-bg-card border-b border-border-subtle px-6 flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#10b981] h-8 w-8 rounded-lg flex items-center justify-center text-bg-deep font-black transition-transform hover:scale-105">
            <Activity size={16} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-text-main flex items-center gap-2">
            Treinamento de Habilidades Psicológicas
            <span className="text-[#10b981] font-black">THP</span> 
          </h1>
        </div>
        
        {/* PATIENT SELECTOR */}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-text-dim" />
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
            }}
            disabled={lockPatient}
            className={cn(
              "bg-bg-sidebar border border-border-subtle text-text-main text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none focus:border-[#10b981] transition-all max-w-[200px] truncate",
              lockPatient && "opacity-75 cursor-not-allowed border-transparent"
            )}
          >
            <option value="" className="bg-bg-card text-text-dim">-- Selecionar Paciente --</option>
            {(patients || []).map(p => (
              <option key={`thp-patient-opt-${p.id}`} value={p.id} className="bg-bg-card text-text-main">
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-bg-sidebar p-1 rounded-xl border border-border-subtle/50">
            {[
              { id: 'training', label: 'Treinamento' },
              { id: 'history', label: 'Histórico' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer",
                  activeTab === tab.id
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

      {/* MAIN LAYOUT */}
      <main className="flex-1 flex overflow-hidden relative">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-12 bg-bg-deep">
            <Activity size={48} className="text-[#10b981] mb-4 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Nenhum Paciente Selecionado</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-2 max-w-sm leading-relaxed">
              Selecione um paciente para iniciar o treinamento de habilidades, gerenciar exercícios clínicos e consultar históricos.
            </p>
          </div>
        ) : activeTab === 'training' ? (
          <div className="flex-1 flex flex-col xl:flex-row overflow-hidden w-full bg-bg-deep">
            
            {/* WORKSPACE LEFT: SKILL & EXERCISES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 border-b xl:border-b-0 xl:border-r border-border-subtle scroller-hide select-text">
              
              {/* SKILL SELECTION */}
              <section className="bg-bg-card border border-border-subtle p-5 rounded-[2rem] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/50 pb-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-text-dim">Habilidade Alvo</label>
                    <select
                      value={selectedSkillIndex}
                      onChange={(e) => {
                        if (activeRecordId) {
                          if (window.confirm('Mudar de habilidade descartará as modificações não salvas do treinamento ativo. Confirmar?')) {
                            handleResetForm();
                            setSelectedSkillIndex(parseInt(e.target.value));
                          }
                        } else {
                          setSelectedSkillIndex(parseInt(e.target.value));
                        }
                      }}
                      className="bg-bg-sidebar border border-border-subtle text-text-main text-xs font-black uppercase tracking-wider rounded-xl px-4 py-2 outline-none focus:border-[#10b981] transition-all cursor-pointer"
                    >
                      {PSYCHOLOGICAL_SKILLS.map((skill, index) => (
                        <option key={index} value={index}>{skill.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* LEVEL METRICS */}
                  <div className="flex items-center gap-6 bg-bg-sidebar/40 px-4 py-2.5 rounded-2xl border border-border-subtle/30">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-text-dim uppercase tracking-wider block">Nível Inicial/Atual</span>
                      <span className="text-xs font-black text-emerald-400 block">{currentLevel}%</span>
                    </div>
                    <ArrowRight size={14} className="text-text-dim/60" />
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-text-dim uppercase tracking-wider block">Nível Alvo (Meta)</span>
                      <span className="text-xs font-black text-primary block">{targetLevel}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-text-dim/90 leading-relaxed italic">
                    "{PSYCHOLOGICAL_SKILLS[selectedSkillIndex]?.desc}"
                  </p>
                </div>

                {/* SLIDERS FOR LEVEL ADJUSTMENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1 bg-bg-sidebar/20 p-3 rounded-xl border border-border-subtle/40">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-text-dim">
                      <span>Nível Clínico Atual</span>
                      <span>{currentLevel}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={currentLevel}
                      onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
                      className="w-full h-1 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                  <div className="space-y-1 bg-bg-sidebar/20 p-3 rounded-xl border border-border-subtle/40">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-text-dim">
                      <span>Meta Alvo</span>
                      <span>{targetLevel}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(parseInt(e.target.value))}
                      className="w-full h-1 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                    />
                  </div>
                </div>
              </section>

              {/* CLINICAL EXERCISES CHECKLIST */}
              <section className="bg-bg-card border border-border-subtle p-5 rounded-[2rem] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                    <BookOpen size={14} className="text-[#10b981]" /> Plano de Exercícios Recomendados
                  </h3>
                  <span className="text-[10px] font-black text-[#10b981] bg-[#10b981]/15 px-2.5 py-0.5 rounded-lg">
                    {exercises.filter(e => e.completed).length} de {exercises.length} Concluídos
                  </span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {exercises.map((ex, idx) => (
                    <div 
                      key={ex.id}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col gap-2 transition-all",
                        ex.completed 
                          ? "bg-[#10b981]/5 border-[#10b981]/20" 
                          : "bg-bg-sidebar/20 border-border-subtle/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleExercise(ex.id)}
                            className={cn(
                              "mt-0.5 h-4 w-4 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0",
                              ex.completed 
                                ? "bg-[#10b981] border-[#10b981] text-bg-deep" 
                                : "border-border-subtle hover:border-[#10b981]/60"
                            )}
                          >
                            {ex.completed && <Check size={11} className="stroke-[3]" />}
                          </button>
                          <span className={cn(
                            "text-[11px] font-semibold leading-relaxed text-text-main",
                            ex.completed && "line-through text-text-dim/70 font-medium"
                          )}>
                            {ex.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="text-text-dim hover:text-rose-500 p-0.5 transition-colors cursor-pointer shrink-0"
                          title="Remover exercício"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Notes input */}
                      <input 
                        type="text"
                        placeholder="Adicionar nota clínica ou observação..."
                        value={ex.notes || ''}
                        onChange={(e) => handleUpdateExerciseNote(ex.id, e.target.value)}
                        className="w-full bg-bg-deep/50 border border-border-subtle/30 text-[10px] rounded-lg px-2.5 py-1 text-text-main placeholder:text-text-dim/40 outline-none focus:border-[#10b981]/40 transition-all font-medium"
                      />
                    </div>
                  ))}
                  
                  {exercises.length === 0 && (
                    <p className="text-[10px] text-text-dim uppercase tracking-wider text-center py-6">
                      Nenhum exercício no plano. Adicione abaixo.
                    </p>
                  )}
                </div>

                {/* ADD CUSTOM EXERCISE */}
                <form onSubmit={handleAddExercise} className="flex gap-2 pt-2">
                  <input 
                    type="text"
                    placeholder="Adicionar exercício personalizado ao plano..."
                    value={newExerciseText}
                    onChange={(e) => setNewExerciseText(e.target.value)}
                    className="flex-1 bg-bg-sidebar border border-border-subtle text-xs font-semibold rounded-xl px-4 h-10 outline-none focus:border-[#10b981] transition-all"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#10b981] hover:bg-[#10b981]/90 text-bg-deep font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center"
                  >
                    <Plus size={14} />
                  </button>
                </form>
              </section>

              {/* SAVE / EXPORT ACTION BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-bg-deep">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleExportHtml}
                    className="flex items-center gap-1.5 px-4 h-10 bg-bg-card border border-border-subtle hover:border-[#10b981]/30 hover:text-[#10b981] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <FileText size={14} /> Laudo PDF/Html
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    title="Exportar backup JSON"
                    className="flex items-center gap-1.5 px-3 h-10 bg-bg-card border border-border-subtle hover:border-text-main rounded-xl text-[10px] transition-all cursor-pointer text-text-dim hover:text-text-main"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Importar backup JSON"
                    className="flex items-center gap-1.5 px-3 h-10 bg-bg-card border border-border-subtle hover:border-text-main rounded-xl text-[10px] transition-all cursor-pointer text-text-dim hover:text-text-main"
                  >
                    <Upload size={14} />
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportJson}
                    accept=".json"
                    className="hidden"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 h-10 bg-bg-sidebar border border-border-subtle hover:border-rose-500 hover:text-rose-500 text-text-dim rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToRecord}
                    className="flex items-center gap-1.5 px-5 h-10 bg-[#10b981] hover:bg-[#10b981]/90 text-bg-deep rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <Save size={14} /> Salvar no Prontuário
                  </button>
                </div>
              </div>
            </div>

            {/* WORKSPACE RIGHT: DIÁRIO DE TREINO & AI REPORT */}
            <div className="w-full xl:w-[480px] overflow-y-auto p-6 space-y-6 scroller-hide select-text bg-bg-sidebar/5">
              
              {/* SESSION DIARY FORM */}
              <section className="bg-bg-card border border-border-subtle p-5 rounded-[2rem] shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-main flex items-center gap-2 border-b border-border-subtle/50 pb-3">
                  <Calendar size={14} className="text-[#10b981]" /> Diário de Treino / Registro
                </h3>

                <form onSubmit={handleAddSession} className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[8px] font-bold text-text-dim uppercase tracking-wider">Data do Treino</label>
                      <input 
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="bg-bg-sidebar border border-border-subtle text-text-main text-[11px] font-semibold rounded-lg px-2.5 h-9 outline-none focus:border-[#10b981] transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-bold text-text-dim uppercase tracking-wider">Duração (Min)</label>
                      <input 
                        type="number"
                        min="1"
                        max="300"
                        value={sessionDuration}
                        onChange={(e) => setSessionDuration(parseInt(e.target.value) || 0)}
                        className="bg-bg-sidebar border border-border-subtle text-text-main text-[11px] font-semibold rounded-lg px-2.5 h-9 outline-none focus:border-[#10b981] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8px] font-bold text-text-dim uppercase tracking-wider">
                      <span>Dificuldade Percebida</span>
                      <span className="text-[#10b981] font-black">{sessionDifficulty}/5</span>
                    </div>
                    <div className="flex gap-1.5 pt-0.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSessionDifficulty(lvl)}
                          className="cursor-pointer"
                        >
                          <Star 
                            size={16} 
                            className={cn(
                              lvl <= sessionDifficulty 
                                ? "text-[#10b981] fill-[#10b981]" 
                                : "text-text-dim/35 hover:text-text-dim/60"
                            )} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-text-dim uppercase tracking-wider">O que foi praticado *</label>
                    <textarea 
                      rows={2}
                      maxLength={300}
                      value={sessionDesc}
                      onChange={(e) => setSessionDesc(e.target.value)}
                      placeholder="Descreva as técnicas, diálogos ou condutas exercitadas no treino..."
                      className="bg-bg-sidebar border border-border-subtle text-text-main text-[11px] font-semibold rounded-xl p-3 outline-none focus:border-[#10b981] transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-text-dim uppercase tracking-wider">Conquistas / Sucesso</label>
                    <input 
                      type="text"
                      maxLength={150}
                      value={sessionAchievements}
                      onChange={(e) => setSessionAchievements(e.target.value)}
                      placeholder="Ganhos percebidos, facilidades, respostas positivas..."
                      className="bg-bg-sidebar border border-border-subtle text-text-main text-[11px] font-semibold rounded-lg px-3 h-9 outline-none focus:border-[#10b981] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-bold text-text-dim uppercase tracking-wider">Obstáculo/Bloqueio</label>
                      <input 
                        type="text"
                        maxLength={150}
                        value={sessionObstacles}
                        onChange={(e) => setSessionObstacles(e.target.value)}
                        placeholder="Dificuldade, gatilho, evitação..."
                        className="bg-bg-sidebar border border-border-subtle text-text-main text-[11px] font-semibold rounded-lg px-3 h-9 outline-none focus:border-[#10b981] transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-bold text-text-dim uppercase tracking-wider">Estratégia</label>
                      <input 
                        type="text"
                        maxLength={150}
                        value={sessionStrategy}
                        onChange={(e) => setSessionStrategy(e.target.value)}
                        placeholder="Resolução, rebatimento..."
                        className="bg-bg-sidebar border border-border-subtle text-text-main text-[11px] font-semibold rounded-lg px-3 h-9 outline-none focus:border-[#10b981] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-9 bg-bg-sidebar hover:bg-[#10b981]/10 border border-border-subtle hover:border-[#10b981]/35 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#10b981] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={12} /> Adicionar Sessão de Treino
                  </button>
                </form>
              </section>

              {/* REGISTERED SESSIONS LOG HISTORY LIST */}
              {sessions.length > 0 && (
                <section className="bg-bg-card border border-border-subtle p-5 rounded-[2rem] shadow-sm space-y-3">
                  <h4 className="text-[9px] font-black text-text-dim uppercase tracking-widest">Treinos Realizados ({sessions.length})</h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {sessions.map((sess) => (
                      <div key={sess.id} className="p-3 bg-bg-sidebar/30 border border-border-subtle/50 rounded-xl space-y-1.5 relative group">
                        <div className="flex items-center justify-between text-[8px] text-text-dim font-bold uppercase">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(sess.date).toLocaleDateString('pt-BR')}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {sess.duration} min</span>
                          <span className="flex items-center gap-0.5 text-emerald-400">Dif: {sess.difficulty}/5</span>
                        </div>
                        <p className="text-[10px] text-text-main font-semibold leading-normal">
                          {sess.description}
                        </p>
                        {(sess.achievements || sess.obstacles) && (
                          <div className="text-[9px] text-text-dim/80 leading-normal border-t border-border-subtle/30 pt-1.5 mt-1 space-y-0.5 font-medium">
                            {sess.achievements && <div><strong>Conquista:</strong> {sess.achievements}</div>}
                            {sess.obstacles && <div><strong>Barreira:</strong> {sess.obstacles} {sess.strategy && `&rarr; Estratégia: ${sess.strategy}`}</div>}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(sess.id)}
                          className="absolute top-2 right-2 p-1 text-text-dim/40 hover:text-rose-500 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remover treino"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* AI REPORT LAUDO */}
              <section className="bg-bg-card border border-border-subtle p-5 rounded-[2rem] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                    <Sparkles size={14} className="text-[#10b981]" /> Análise e Laudo THP por IA
                  </h3>
                  <button
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={isAnalyzing || sessions.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981]/10 hover:bg-[#10b981]/25 border border-[#10b981]/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#10b981] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <RefreshCw size={11} className="animate-spin" />
                    ) : (
                      <Sparkles size={11} />
                    )}
                    Gerar Análise
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={aiAnalysis}
                  onChange={(e) => setAiAnalysis(e.target.value)}
                  placeholder="A análise interpretativa gerada pela IA clínica aparecerá aqui após preencher os diários de treino e acionar o botão de 'Gerar Análise'. Você pode ajustar livremente este laudo..."
                  className="w-full bg-bg-sidebar border border-border-subtle text-[11px] font-medium rounded-xl p-4 outline-none focus:border-[#10b981] transition-all resize-none leading-relaxed text-text-main/90 whitespace-pre-wrap select-text"
                />
              </section>
            </div>
          </div>
        ) : (
          /* HISTORY TAB */
          <div className="flex-1 p-6 overflow-y-auto scroller-hide select-text bg-bg-deep">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle/60 pb-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-text-main">
                  Histórico de Programas THP
                </h2>
                {/* Search Bar */}
                <input 
                  type="text"
                  placeholder="Pesquisar por habilidade..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="bg-bg-card border border-border-subtle text-xs font-semibold rounded-xl px-4 h-9 outline-none focus:border-[#10b981] transition-all w-60"
                />
              </div>

              {filteredHistory.length === 0 ? (
                <div className="text-center py-16 bg-bg-card rounded-[2rem] border border-border-subtle/50">
                  <Activity size={32} className="mx-auto text-text-dim mb-3 opacity-60" />
                  <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Nenhum programa arquivado</p>
                  <p className="text-[8px] text-text-dim/60 uppercase tracking-widest mt-1">
                    Não existem registros do Treinamento de Habilidades Psicológicas cadastrados para o paciente selecionado.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredHistory.map((rec) => {
                    const complCount = rec.exercises.filter(e => e.completed).length;
                    const totCount = rec.exercises.length;
                    return (
                      <div 
                        key={rec.id}
                        className="p-5 bg-bg-card border border-border-subtle rounded-3xl hover:border-primary/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-bg-sidebar border border-border-subtle text-[#10b981]">
                              {new Date(rec.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-[9px] font-black text-emerald-400">
                              Progresso: {rec.currentLevel}% &rarr; {rec.targetLevel}%
                            </span>
                            <span className="text-[9px] text-text-dim font-bold uppercase">
                              {complCount}/{totCount} Exercícios
                            </span>
                          </div>
                          <h4 className="font-black text-xs text-text-main uppercase tracking-wider">{rec.skillName}</h4>
                          <p className="text-[11px] text-text-dim/80 line-clamp-2 leading-relaxed">
                            {rec.skillDescription}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => handleLoadRecord(rec)}
                            className="px-3 py-2 bg-bg-sidebar border border-border-subtle hover:border-[#10b981] hover:text-[#10b981] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => exportThpToHtml(rec)}
                            className="px-3 py-2 bg-bg-sidebar border border-border-subtle hover:border-text-main rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer text-text-dim hover:text-text-main"
                          >
                            Laudo
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-2 bg-bg-sidebar/50 hover:bg-rose-500/10 border border-border-subtle hover:border-rose-500/30 text-text-dim hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                            title="Excluir programa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
