import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  FileText, 
  ChevronRight, 
  Shield, 
  Activity, 
  Brain, 
  BookOpen, 
  Clock, 
  Award, 
  Check, 
  Copy, 
  AlertTriangle, 
  User, 
  ArrowRight, 
  ListFilter,
  Flame,
  X,
  Zap,
  TrendingDown,
  Layers,
  MessageSquare,
  Compass,
  HelpCircle,
  CheckCircle,
  Target,
  ShieldAlert,
  Volume2,
  Eye,
  Smile,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db, Paciente } from '../../lib/db';
import { HP_TOOLS_CONFIG, HpConfigItem, RolePlayScenario, ExposureStep } from './hpToolsConfig';
import { generateHpTrainingFeedback } from '../../services/geminiService';

interface HpIndividualToolProps {
  hpId: string;
  activePatientId?: string;
  userId?: string;
  onClose?: () => void;
}

interface PracticeLogItem {
  id: string;
  date: string;
  exerciseTitle: string;
  notes: string;
  difficulty: number; // 1-5
  aiFeedback?: string;
}

export default function HpIndividualTool({ hpId, activePatientId, userId, onClose }: HpIndividualToolProps) {
  const config: HpConfigItem = HP_TOOLS_CONFIG[hpId] || HP_TOOLS_CONFIG['hp-autoconhecimento'];
  const IconComponent = config.icon;

  // Active Patient State
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(activePatientId || '');
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'psychoed' | 'baseline' | 'lab' | 'coach' | 'history'>('psychoed');

  // Baseline Scale State
  const [baselineAnswers, setBaselineAnswers] = useState<Record<string, number>>({});
  const [baselineSavedAt, setBaselineSavedAt] = useState<string | null>(null);

  // Lab Sub-Tabs
  const [labSubTab, setLabSubTab] = useState<'roleplay' | 'cognitive' | 'exposure' | 'interactive'>('roleplay');
  const [selectedRolePlayTier, setSelectedRolePlayTier] = useState<1 | 2>(1);
  const [rolePlayFeedbackNotes, setRolePlayFeedbackNotes] = useState<string>('');
  const [rolePlayDifficulty, setRolePlayDifficulty] = useState<number>(3);
  const [exposureStatus, setExposureStatus] = useState<Record<number, 'nao_iniciado' | 'em_treino' | 'conquistado'>>({
    1: 'em_treino',
    2: 'nao_iniciado',
    3: 'nao_iniciado',
    4: 'nao_iniciado',
  });

  // Practice Logs
  const [logs, setLogs] = useState<PracticeLogItem[]>([]);
  const [newLogExercise, setNewLogExercise] = useState<string>(config.deliberateExercises[0]?.title || '');
  const [newLogNotes, setNewLogNotes] = useState<string>('');
  const [newLogDifficulty, setNewLogDifficulty] = useState<number>(3);

  // AI Coach State
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiMode, setAiMode] = useState<'feedback' | 'simulation' | 'coping_card'>('feedback');

  // Interactive Widgets State
  // 1. HP2: Breathing Guide State
  const [breathActive, setBreathActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState<number>(4);
  const [subjectiveDistress, setSubjectiveDistress] = useState<number>(5);

  // 2. HP6: Urge Surfing Timer
  const [urgeActive, setUrgeActive] = useState<boolean>(false);
  const [urgeTimeLeft, setUrgeTimeLeft] = useState<number>(180); // 3 minutes

  // 3. HP3: Evidence Matrix
  const [thoughtInput, setThoughtInput] = useState<string>('');
  const [evFor, setEvFor] = useState<string>('');
  const [evAgainst, setEvAgainst] = useState<string>('');
  const [altThought, setAltThought] = useState<string>('');

  // 4. HP8: Assertive Shield (NO Generator)
  const [refusalReason, setRefusalReason] = useState<string>('');
  const [generatedRefusal, setGeneratedRefusal] = useState<string>('');

  // 5. HP10: Savoring
  const [savoringActivity, setSavoringActivity] = useState<string>('');
  const [savoringSenses, setSavoringSenses] = useState<string>('');

  // Load Patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const list = await db.pacientes.toArray();
        setPatients(list);
        if (activePatientId) {
          setSelectedPatientId(activePatientId);
        } else if (list.length > 0 && !selectedPatientId) {
          setSelectedPatientId(list[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
      }
    };
    loadPatients();
  }, [activePatientId]);

  // Update selected patient object
  useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(it => it.id === selectedPatientId) || null;
      setSelectedPatient(p);
      loadPatientHpData(selectedPatientId);
    }
  }, [selectedPatientId, patients]);

  // Storage key
  const getStorageKey = (patientId: string) => `cortex_hp_${config.id}_${patientId}`;

  const loadPatientHpData = (patientId: string) => {
    try {
      const raw = localStorage.getItem(getStorageKey(patientId));
      if (raw) {
        const data = JSON.parse(raw);
        setBaselineAnswers(data.baselineAnswers || {});
        setBaselineSavedAt(data.baselineSavedAt || null);
        setLogs(data.logs || []);
        if (data.exposureStatus) setExposureStatus(data.exposureStatus);
      } else {
        setBaselineAnswers({});
        setBaselineSavedAt(null);
        setLogs([]);
      }
    } catch (err) {
      console.error('Erro ao ler dados de HP do localStorage:', err);
    }
  };

  const persistPatientHpData = (
    updatedAnswers: Record<string, number>,
    updatedLogs: PracticeLogItem[],
    savedTimestamp: string | null,
    updatedExposure?: Record<number, 'nao_iniciado' | 'em_treino' | 'conquistado'>
  ) => {
    if (!selectedPatientId) return;
    try {
      const payload = {
        hpId: config.id,
        hpName: config.name,
        patientId: selectedPatientId,
        baselineAnswers: updatedAnswers,
        baselineSavedAt: savedTimestamp,
        logs: updatedLogs,
        exposureStatus: updatedExposure || exposureStatus,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(getStorageKey(selectedPatientId), JSON.stringify(payload));
    } catch (err) {
      console.error('Erro ao persistir dados de HP:', err);
    }
  };

  // Score Calculations
  const calculateBaselineScore = () => {
    const questionKeys = config.baselineQuestions.map(q => q.id);
    let total = 0;
    questionKeys.forEach(key => {
      total += baselineAnswers[key] || 1;
    });
    const maxScore = questionKeys.length * 5;
    const percentage = Math.round((total / maxScore) * 100);
    return { total, maxScore, percentage };
  };

  const { total: totalScore, maxScore: maxPossible, percentage } = calculateBaselineScore();

  const getBaselineClassification = (pct: number) => {
    if (pct < 45) return { label: 'Déficit Significativo (Alvo Prioritário)', color: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/30 text-rose-300' };
    if (pct <= 70) return { label: 'Repertório Moderado (Necessita Treino)', color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30 text-amber-300' };
    return { label: 'Habilidade Consolidada (Maestria)', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' };
  };

  const classification = getBaselineClassification(percentage);

  // Simulation handler (Simular Preenchimento IA)
  const handleSimulate = () => {
    // 1. Realistic baseline answers showing clinical deficit (realistic starting point)
    const simulatedBaseline: Record<string, number> = {
      q1: 2,
      q2: 2,
      q3: 3,
      q4: 2,
    };
    setBaselineAnswers(simulatedBaseline);
    const nowStr = new Date().toLocaleString('pt-BR');
    setBaselineSavedAt(nowStr);

    // 2. Interactive tool fields simulation
    if (config.interactiveToolType === 'evidence_matrix') {
      setThoughtInput(config.cognitiveHierarchy.automaticThought);
      setEvFor('O coordenador fez uma expressão séria na última reunião e meu relatório teve 1 erro de digitação.');
      setEvAgainst('Tenho 3 anos de casa com 95% de avaliações excelentes e nunca recebi nenhuma advertência formal.');
      setAltThought(config.cognitiveHierarchy.healthyAdultReframing);
    } else if (config.interactiveToolType === 'assertive_shield') {
      setRefusalReason('Colega pediu para eu cobrir o plantão dele no domingo sem aviso prévio');
      setGeneratedRefusal('Compreendo que você precise de folga, mas já tenho compromissos pessoais inadiáveis e não poderei assumir. Sugiro que alinhe com a coordenação.');
    } else if (config.interactiveToolType === 'savoring_scheduler') {
      setSavoringActivity('Tomar uma xícara de café especial na varanda ao nascer do sol por 10 minutos');
      setSavoringSenses('Aroma cítrico dos grãos moídos, calor da caneca de cerâmica nas mãos, brisa fresca matinal e silêncio relaxante.');
    }

    // 3. Role-play in-session reflection simulation
    setRolePlayFeedbackNotes(
      `Ensaio Comportamental (Tier 1): Paciente treinou postura ereta e contato visual. Inicialmente titubeou no final da frase ("...se não for atrapalhar"), mas na 2ª tentativa sustentou a Tríade Assertiva com voz audível, justificativa racional sucinta e encaminhamento prático sem pedir desculpas desnecessárias. Reforçado o princípio libertador do "Direito de Ser Falível".`
    );
    setRolePlayDifficulty(3);

    // 4. Exposure status simulation
    const simExposure: Record<number, 'nao_iniciado' | 'em_treino' | 'conquistado'> = {
      1: 'conquistado',
      2: 'em_treino',
      3: 'nao_iniciado',
      4: 'nao_iniciado',
    };
    setExposureStatus(simExposure);

    // 5. Add simulated practice logs
    const simLog1: PracticeLogItem = {
      id: `log-sim-1-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      exerciseTitle: `Ensaio Role-Play em Consultório: ${config.rolePlayScenarios[0]?.title || 'Ensaio Comportamental'}`,
      difficulty: 3,
      notes: `Treino de role-play de 4ª geração realizado em sessão. Treinada postura não-verbal (ombros alinhados, contato visual) e estrutura verbal tripla. Paciente relatou alívio ao perceber que o "não" pode ser elegante e calmo.`,
    };
    const simLog2: PracticeLogItem = {
      id: `log-sim-2-${Date.now()}`,
      date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('pt-BR'),
      exerciseTitle: `Exposição Nível 1: ${config.exposureHierarchy[0]?.title || 'Exposição Comportamental Graduada'}`,
      difficulty: 2,
      notes: `Executada tarefa de exposição na vida real (SUDS inicial 5, decaindo para 2 após a ação). Paciente relatou vitória ao sustentar o comportamento-alvo sem autocrítica.`,
    };

    const updatedLogs = [simLog1, simLog2, ...logs];
    setLogs(updatedLogs);
    if (selectedPatientId) {
      persistPatientHpData(simulatedBaseline, updatedLogs, nowStr, simExposure);
    }

    // 6. Switch to lab tab and show toast
    setActiveTab('lab');
    setLabSubTab('roleplay');
    toast.success(`Simulação clínica concluída! Laboratório e dados de ${config.name} preenchidos.`);
  };

  // Save Baseline
  const handleSaveBaseline = () => {
    const nowStr = new Date().toLocaleString('pt-BR');
    setBaselineSavedAt(nowStr);
    persistPatientHpData(baselineAnswers, logs, nowStr);
    toast.success('Avaliação de Linha de Base salva com sucesso!');
  };

  // Add Practice Log
  const handleAddLog = () => {
    if (!newLogNotes.trim()) {
      toast.error('Preencha as reflexões da prática antes de salvar.');
      return;
    }
    const item: PracticeLogItem = {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      exerciseTitle: newLogExercise,
      notes: newLogNotes,
      difficulty: newLogDifficulty
    };
    const updated = [item, ...logs];
    setLogs(updated);
    setNewLogNotes('');
    persistPatientHpData(baselineAnswers, updated, baselineSavedAt);
    toast.success('Treino prático registrado com sucesso!');
  };

  // Save In-Session Role-play to Log
  const handleSaveRolePlayRehearsal = () => {
    if (!rolePlayFeedbackNotes.trim()) {
      toast.error('Digite as anotações do ensaio de role-play antes de salvar.');
      return;
    }
    const currentScenario = config.rolePlayScenarios.find(s => s.tier === selectedRolePlayTier) || config.rolePlayScenarios[0];
    const item: PracticeLogItem = {
      id: `roleplay_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      exerciseTitle: `Ensaio Comportamental (Tier ${selectedRolePlayTier}): ${currentScenario.title}`,
      notes: rolePlayFeedbackNotes,
      difficulty: rolePlayDifficulty
    };
    const updated = [item, ...logs];
    setLogs(updated);
    persistPatientHpData(baselineAnswers, updated, baselineSavedAt);
    toast.success('Ensaio de Role-Play registrado com sucesso no histórico!');
  };

  // Save to Medical Record (Prontuário)
  const handleSaveToProntuario = async () => {
    if (!selectedPatientId || !selectedPatient) {
      toast.error('Selecione um paciente para registrar no prontuário.');
      return;
    }

    try {
      const activePatient = await db.pacientes.get(selectedPatientId);
      if (!activePatient) {
        toast.error('Paciente não encontrado no banco.');
        return;
      }

      const evolucaoTexto = `
[TREINAMENTO DE HABILIDADES PSICOLÓGICAS (THP - TCC 4ª GERAÇÃO)]
Habilidade Foco: ${config.shortTitle} (HP #${config.number})
Data do Treino: ${new Date().toLocaleDateString('pt-BR')}

LINHA DE BASE (BASELINE):
Pontuação: ${percentage}% (${totalScore}/${maxPossible} pts) - ${classification.label}

PREMISSA LIBERTADORA:
"${config.corePremise}"

ENSAIO COMPORTAMENTAL / ROLE-PLAY REALIZADO:
Cenário Ativo: Tier ${selectedRolePlayTier} (${config.rolePlayScenarios.find(s => s.tier === selectedRolePlayTier)?.title || 'Ensaio Clínico'})
Observações do Treinamento: ${rolePlayFeedbackNotes || 'Ensaio da Tríade Assertiva executado em sessão.'}
Dificuldade Percebida: ${rolePlayDifficulty}/5

PROGRESSO NA HIERARQUIA DE EXPOSIÇÃO:
${config.exposureHierarchy.map(e => `- Nível ${e.level} (SUDS ${e.suds}): ${e.title} -> Status: ${exposureStatus[e.level] || 'nao_iniciado'}`).join('\n')}

REGISTROS DE TREINO INTERSESSÃO / CONSULTÓRIO:
${logs.length > 0 ? logs.slice(0, 3).map(l => `- [${l.date}] ${l.exerciseTitle} (Dificuldade ${l.difficulty}/5): ${l.notes}`).join('\n') : 'Treino inaugural realizado em sessão.'}
      `.trim();

      const novaEvolucao = {
        id: `evolucao_hp_${Date.now()}`,
        data: new Date().toISOString(),
        tipo: 'evolucao' as const,
        conteudo: evolucaoTexto,
        titulo: `THP: ${config.shortTitle}`,
        tags: ['THP', 'Treinamento de Habilidades', config.shortTitle]
      };

      const evolucoesAtuais = activePatient.evolucoes || [];
      await db.pacientes.update(selectedPatientId, {
        evolucoes: [novaEvolucao, ...evolucoesAtuais],
        updatedAt: new Date().toISOString()
      });

      toast.success('Evolução do Treino de HP registrada com sucesso no Prontuário!');
    } catch (e: any) {
      console.error('Erro ao salvar no prontuário:', e);
      toast.error('Falha ao salvar no prontuário: ' + (e.message || e));
    }
  };

  // AI Coach trigger
  const handleTriggerAiCoach = async (mode: 'feedback' | 'simulation' | 'coping_card') => {
    setAiMode(mode);
    setAiLoading(true);
    try {
      const exerciseTitle = newLogExercise || config.deliberateExercises[0].title;
      const context = `
Paciente: ${selectedPatient?.nome || 'Paciente'}
Baseline da HP: ${percentage}% (${classification.label})
Últimas anotações do paciente: "${newLogNotes || (logs[0]?.notes ?? 'Treino inicial da habilidade')}"
Ferramenta interativa: ${config.name}
      `;

      const res = await generateHpTrainingFeedback({
        hpId: config.id,
        hpName: config.name,
        patientName: selectedPatient?.nome,
        exerciseTitle,
        userContext: context,
        mode
      });

      setAiResponse(res);
      toast.success('Supervisão clínica gerada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar supervisão de HP:', err);
      toast.error('Erro na IA: ' + (err.message || err));
    } finally {
      setAiLoading(false);
    }
  };

  // Breathing Guide Loop (HP2)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathActive) {
      if (breathPhase === 'inhale') {
        if (breathSeconds > 1) {
          timer = setTimeout(() => setBreathSeconds(s => s - 1), 1000);
        } else {
          setBreathPhase('hold');
          setBreathSeconds(7);
        }
      } else if (breathPhase === 'hold') {
        if (breathSeconds > 1) {
          timer = setTimeout(() => setBreathSeconds(s => s - 1), 1000);
        } else {
          setBreathPhase('exhale');
          setBreathSeconds(8);
        }
      } else if (breathPhase === 'exhale') {
        if (breathSeconds > 1) {
          timer = setTimeout(() => setBreathSeconds(s => s - 1), 1000);
        } else {
          setBreathPhase('inhale');
          setBreathSeconds(4);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [breathActive, breathPhase, breathSeconds]);

  // Urge Surfing Timer (HP6)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (urgeActive && urgeTimeLeft > 0) {
      timer = setTimeout(() => setUrgeTimeLeft(t => t - 1), 1000);
    } else if (urgeActive && urgeTimeLeft === 0) {
      setUrgeActive(false);
      toast.success('🎉 Onda do impulso superada com sucesso! Parabéns pelo autocontrole.');
    }
    return () => clearTimeout(timer);
  }, [urgeActive, urgeTimeLeft]);

  // Current active roleplay scenario
  const currentScenario = config.rolePlayScenarios.find(s => s.tier === selectedRolePlayTier) || config.rolePlayScenarios[0];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-text-main font-sans select-none overflow-hidden border border-white/[0.08] rounded-xl shadow-2xl">
      {/* Top Bar with HP Identity, Patient Selector and Action Buttons */}
      <div className={`p-4 bg-gradient-to-r ${config.gradient} border-b ${config.borderColor} flex flex-wrap items-center justify-between gap-3 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-lg ${config.badgeColor}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                HP #${config.number}
              </span>
              <h2 className="text-base font-bold text-white tracking-wide">{config.name}</h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5 max-w-xl truncate">{config.definition}</p>
          </div>
        </div>

        {/* Patient Selection & Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5">
            <User className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="" disabled className="bg-surface-dark">Selecione o paciente...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id} className="bg-surface-dark">
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          {/* SIMULATE BUTTON */}
          <button
            onClick={handleSimulate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Preenche simulação de treinamento e laboratório com dados clínicos de teste"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simular Treino</span>
          </button>

          <button
            onClick={handleSaveToProntuario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Salva os dados do treino como evolução clínica no prontuário"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar no Prontuário</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar janela"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center border-b border-white/[0.06] bg-black/20 px-4 shrink-0 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('psychoed')}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'psychoed'
              ? 'border-white text-white'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1. Psicoeducação</span>
        </button>

        <button
          onClick={() => setActiveTab('baseline')}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'baseline'
              ? 'border-white text-white'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>2. Autoavaliação (Baseline)</span>
          {percentage > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full border ${classification.badge}`}>
              {percentage}%
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'lab'
              ? 'border-white text-white'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>3. Laboratório Prático (Enriquecido)</span>
        </button>

        <button
          onClick={() => setActiveTab('coach')}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'coach'
              ? 'border-white text-white'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>4. Supervisor IA</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-white text-white'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>5. Histórico ({logs.length})</span>
        </button>
      </div>

      {/* Main Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: PSICOEDUCAÇÃO */}
        {activeTab === 'psychoed' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Core Card with 4th Gen Premise */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Definição Clínica e Objetivo</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                  TCC 4ª Geração • THP
                </span>
              </div>
              <p className="text-sm leading-relaxed text-text-main font-medium">{config.definition}</p>
              
              <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] text-xs space-y-1">
                <strong className="text-white">Alvo Terapêutico:</strong> {config.objective}
              </div>

              {/* Liberating Premise Highlight */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-lg border border-amber-500/30 flex items-start gap-3">
                <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Princípio Filosófico Libertador (4ª Geração)</div>
                  <div className="text-xs text-text-main font-medium">"{config.corePremise}"</div>
                </div>
              </div>
            </div>

            {/* Schemas Combated & Neurobiology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Esquemas Iniciais Desadaptativos (EIDs) Combatidos</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {config.eidsCombated.map((eid, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                      {eid}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Substrato Neurobiológico & Processos</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed pt-1">{config.neurobiology}</p>
              </div>
            </div>

            {/* Signs of Deficit vs Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-rose-500/[0.02] border border-rose-500/20 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Sinais Clínicos de Déficit no Cotidiano</span>
                </h4>
                <ul className="space-y-2">
                  {config.deficitSigns.map((sign, idx) => (
                    <li key={idx} className="text-xs text-text-muted flex items-start gap-2">
                      <span className="text-rose-400 font-bold shrink-0">•</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/20 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Benefícios da Maestria Comportamental</span>
                </h4>
                <ul className="space-y-2">
                  {config.masteryBenefits.map((benefit, idx) => (
                    <li key={idx} className="text-xs text-text-muted flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Power Phrases Preview */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Frases de Ancoragem e Cartões de Enfrentamento</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {config.powerPhrases.map((phrase, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-black/30 border border-white/10 text-xs text-text-muted flex flex-col justify-between">
                    <span className="italic leading-relaxed">"{phrase}"</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(phrase);
                        toast.success('Frase copiada!');
                      }}
                      className="mt-2 text-[10px] text-cyan-400 self-end hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Advance to Baseline Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('baseline')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all"
              >
                <span>Avançar para Autoavaliação (Baseline)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BASELINE SCALE */}
        {activeTab === 'baseline' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header with Score Overview */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Escala Diagnóstica de Linha de Base (Baseline)</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Responda conforme a frequência com que esses comportamentos ocorrem na vida cotidiana (1 = Nunca a 5 = Sempre).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xl font-black text-white font-mono">{percentage}%</div>
                  <div className="text-[10px] text-text-muted">{totalScore} de {maxPossible} pts</div>
                </div>
                <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${classification.badge}`}>
                  {classification.label}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 ${
                  percentage < 45 ? 'bg-rose-500' : percentage <= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {config.baselineQuestions.map((q, idx) => {
                const currentVal = baselineAnswers[q.id] || 1;
                return (
                  <div key={q.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs text-text-main font-medium leading-relaxed">
                        <strong className="text-cyan-400 mr-1.5">{idx + 1}.</strong>
                        {q.statement}
                      </span>
                      <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                        {currentVal} / 5
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isSelected = currentVal === val;
                        const labels = ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'];
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              const updated = { ...baselineAnswers, [q.id]: val };
                              setBaselineAnswers(updated);
                            }}
                            className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
                                : 'bg-white/[0.02] border-white/5 text-text-muted hover:bg-white/[0.05] hover:text-white'
                            }`}
                          >
                            <span className="font-mono text-sm leading-none">{val}</span>
                            <span className="text-[9px] opacity-70 leading-none">{labels[val - 1]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save & Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-text-muted">
                {baselineSavedAt ? `Última atualização: ${baselineSavedAt}` : 'Não salvo nesta sessão'}
              </span>

              <button
                onClick={handleSaveBaseline}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Avaliação Baseline</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: LABORATÓRIO PRÁTICO ENRIQUECIDO (4ª GERAÇÃO) */}
        {activeTab === 'lab' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Sub-Laboratory Navigation Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setLabSubTab('roleplay')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    labSubTab === 'roleplay'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-white/[0.02] text-text-muted border border-white/[0.05] hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ensaio & Role-Play (Tiers 1 e 2)</span>
                </button>

                <button
                  onClick={() => setLabSubTab('cognitive')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    labSubTab === 'cognitive'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'bg-white/[0.02] text-text-muted border border-white/[0.05] hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Matriz Cognitiva (Seta Descendente)</span>
                </button>

                <button
                  onClick={() => setLabSubTab('exposure')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    labSubTab === 'exposure'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-white/[0.02] text-text-muted border border-white/[0.05] hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Hierarquia de Exposição (Vida Real)</span>
                </button>

                <button
                  onClick={() => setLabSubTab('interactive')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    labSubTab === 'interactive'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-white/[0.02] text-text-muted border border-white/[0.05] hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Instrumento Específico</span>
                </button>
              </div>

              <span className="text-[10px] uppercase font-bold text-text-muted hidden md:inline">
                Laboratório THP • 4ª Geração
              </span>
            </div>

            {/* SUB-SECTION 1: ROLE-PLAY GRADUADO (TIER 1 VS TIER 2) */}
            {labSubTab === 'roleplay' && (
              <div className="space-y-6">
                {/* Tier Switcher Header */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      <span>Ensaio Comportamental & Role-Play Graduado</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Treinamento deliberado em consultório para substituir automatismos passivos/agressivos pela Tríade Assertiva.
                    </p>
                  </div>

                  {/* Tier Selector Buttons */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => setSelectedRolePlayTier(1)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        selectedRolePlayTier === 1
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'text-text-muted hover:text-white'
                      }`}
                    >
                      Tier 1: Cotidiano / Pares
                    </button>
                    <button
                      onClick={() => setSelectedRolePlayTier(2)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        selectedRolePlayTier === 2
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'text-text-muted hover:text-white'
                      }`}
                    >
                      Tier 2: Alta Pressão / Autoridade
                    </button>
                  </div>
                </div>

                {/* Scenario Details & Context */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      {currentScenario.tierLabel}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-mono text-text-muted">
                      Cenário #{currentScenario.tier}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{currentScenario.title}</h4>
                  <p className="text-xs text-text-muted leading-relaxed">{currentScenario.context}</p>
                </div>

                {/* Comparison Grid: Antes (Disfuncional) vs Depois (Comportamento Alvo 4ª Geração) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Dysfunctional Response */}
                  <div className="p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                        Resposta Disfuncional Típica
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                        Padrão: {currentScenario.dysfunctionalType}
                      </span>
                    </div>

                    <div className="p-3 bg-black/40 rounded-lg border border-rose-500/30 text-xs italic text-rose-200/90 leading-relaxed font-serif">
                      "{currentScenario.dysfunctionalExample}"
                    </div>

                    <div className="text-[11px] text-text-muted leading-relaxed">
                      <strong className="text-rose-400">Custo Clínico:</strong> Gera ressentimento contido, sensação de submissão, reforça o esquema de defectividade e retroalimenta a sobrecarga.
                    </div>
                  </div>

                  {/* Right: Target Response (4th Generation Trained Behavior) */}
                  <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Comportamento-Alvo Treinado (4ª Geração)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Adulto Saudável
                      </span>
                    </div>

                    <div className="p-3 bg-black/40 rounded-lg border border-emerald-500/30 text-xs font-semibold text-emerald-200 leading-relaxed font-sans">
                      "{currentScenario.targetResponse}"
                    </div>

                    <div className="text-[11px] text-text-muted leading-relaxed">
                      <strong className="text-emerald-400">Impacto Clínico:</strong> Estabelece o limite com elegância e serenidade, sem agressividade nem pedidos de desculpas desnecessários.
                    </div>
                  </div>
                </div>

                {/* The Three Core Pillars of Lincoln Poubel's Methodology */}
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>A Tríade do Comportamento-Alvo (Metodologia Poubel)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Pillar 1: Non-Verbal Posture */}
                    <div className="p-3.5 rounded-lg bg-black/30 border border-white/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>1. Postura Não-Verbal</span>
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-text-muted">
                        {currentScenario.nonVerbalTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pillar 2: Verbal Triple Structure */}
                    <div className="p-3.5 rounded-lg bg-black/30 border border-white/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>2. Estrutura Verbal Tripla</span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <span className="font-bold text-text-muted">Posição: </span>
                          <span className="text-text-main">{currentScenario.verbalStructure.statement}</span>
                        </div>
                        <div>
                          <span className="font-bold text-text-muted">Justificativa: </span>
                          <span className="text-text-main">{currentScenario.verbalStructure.justification}</span>
                        </div>
                        <div>
                          <span className="font-bold text-text-muted">Encaminhamento: </span>
                          <span className="text-text-main">{currentScenario.verbalStructure.actionOrRequest}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pillar 3: Liberating Principle */}
                    <div className="p-3.5 rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Shield className="w-3.5 h-3.5" />
                        <span>3. Princípio Libertador</span>
                      </div>
                      <p className="text-xs text-text-main italic leading-relaxed pt-1">
                        "{currentScenario.liberatingPrinciple}"
                      </p>
                      <div className="text-[10px] text-amber-400 font-mono pt-1">
                        Direito incondicional de ser falível
                      </div>
                    </div>
                  </div>
                </div>

                {/* In-Session Simulation Record Form */}
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Registro do Ensaio / Role-Play Feito em Sessão</span>
                    </h4>
                    <span className="text-[11px] text-text-muted">
                      Avaliação do Desempenho e Feedback Clínico
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-3">
                      <label className="text-xs font-semibold text-text-muted">
                        Anotações do Terapeuta sobre o Ensaio (Postura, Tom de Voz e Conteúdo Verbal):
                      </label>
                      <textarea
                        value={rolePlayFeedbackNotes}
                        onChange={(e) => setRolePlayFeedbackNotes(e.target.value)}
                        placeholder="Ex: Paciente inicialmente titubeou no final da frase, mas na segunda repetição sustentou contato visual e aplicou a Tríade com segurança..."
                        rows={3}
                        className="w-full mt-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-muted">
                        Dificuldade Percebida:
                      </label>
                      <select
                        value={rolePlayDifficulty}
                        onChange={(e) => setRolePlayDifficulty(Number(e.target.value))}
                        className="w-full mt-1 p-2 bg-surface-dark border border-white/10 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value={1}>1 - Muito Fácil / Fluido</option>
                        <option value={2}>2 - Fácil</option>
                        <option value={3}>3 - Moderado / Desafiador</option>
                        <option value={4}>4 - Difícil / Tensão Elevada</option>
                        <option value={5}>5 - Muito Difícil / Travamento</option>
                      </select>

                      <button
                        onClick={handleSaveRolePlayRehearsal}
                        className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar Ensaio</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION 2: MATRIZ COGNITIVA (SETA DESCENDENTE / DOWNWARD ARROW) */}
            {labSubTab === 'cognitive' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    <span>Matriz Cognitiva de Seta Descendente (TCC 4ª Geração)</span>
                  </h3>
                  <p className="text-xs text-text-muted">
                    Desvendando as camadas desde o Pensamento Automático até a Crença Central, culminando no Reenquadre do Adulto Saudável.
                  </p>
                </div>

                {/* Downward Arrow Visual Flow */}
                <div className="space-y-3">
                  {/* Step 1: Automatic Thought */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                        1. Pensamento Automático Disfuncional (Gatilho Imediato)
                      </span>
                      <span className="text-[10px] text-text-muted">Camada Superficial / Reação Rápida</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-rose-500/20 text-xs font-medium text-rose-200">
                      "{config.cognitiveHierarchy.automaticThought}"
                    </div>
                  </div>

                  <div className="flex justify-center text-text-muted">
                    <TrendingDown className="w-5 h-5 text-rose-400 animate-bounce" />
                  </div>

                  {/* Step 2: Intermediate Rule */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        2. Regra / Crença Intermediária Condicional ("Se... então devo...")
                      </span>
                      <span className="text-[10px] text-text-muted">Estratégia Compensatória</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-amber-500/20 text-xs font-medium text-amber-200">
                      "{config.cognitiveHierarchy.intermediateRule}"
                    </div>
                  </div>

                  <div className="flex justify-center text-text-muted">
                    <TrendingDown className="w-5 h-5 text-amber-400 animate-bounce" />
                  </div>

                  {/* Step 3: Core Belief */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                        3. Crença Central / Esquema Desadaptativo Latente
                      </span>
                      <span className="text-[10px] text-text-muted">Raiz Esquemática Vulnerável</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-purple-500/20 text-xs font-medium text-purple-200">
                      "{config.cognitiveHierarchy.coreBelief}"
                    </div>
                  </div>

                  <div className="flex justify-center text-text-muted">
                    <ArrowRight className="w-5 h-5 text-emerald-400 rotate-90" />
                  </div>

                  {/* Step 4: Healthy Adult Reframing (4th Gen Target) */}
                  <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 relative shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>4. Reenquadre do Adulto Saudável (Posicionamento de 4ª Geração)</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        Modo Alvo
                      </span>
                    </div>
                    <div className="p-3.5 bg-black/40 rounded-lg border border-emerald-500/30 text-xs font-bold text-emerald-200 leading-relaxed">
                      "{config.cognitiveHierarchy.healthyAdultReframing}"
                    </div>
                  </div>
                </div>

                {/* Power Phrases / Coping Cards */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cartões de Enfrentamento Rápidos (Coping Cards)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {config.powerPhrases.map((phrase, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-black/30 border border-white/10 text-xs text-text-muted flex flex-col justify-between">
                        <span className="italic leading-relaxed">"{phrase}"</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(phrase);
                            toast.success('Frase copiada!');
                          }}
                          className="mt-2 text-[10px] text-cyan-400 self-end hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copiar Cartão
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: HIERARQUIA DE EXPOSIÇÃO GRADUAL (VIDA REAL) */}
            {labSubTab === 'exposure' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Hierarquia de Exposição Gradual (Lição de Casa & Vida Real)</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Escada de 4 degraus para transferência da habilidade do consultório para o mundo concreto com controle de SUDS.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-400 font-mono">
                      {Object.values(exposureStatus).filter(s => s === 'conquistado').length} de {config.exposureHierarchy.length} Degraus Conquistados
                    </span>
                  </div>
                </div>

                {/* Exposure Steps List */}
                <div className="space-y-3">
                  {config.exposureHierarchy.map((step) => {
                    const status = exposureStatus[step.level] || 'nao_iniciado';
                    return (
                      <div
                        key={step.level}
                        className={`p-4 rounded-xl border transition-all ${
                          status === 'conquistado'
                            ? 'bg-emerald-500/[0.03] border-emerald-500/30'
                            : status === 'em_treino'
                            ? 'bg-amber-500/[0.03] border-amber-500/30'
                            : 'bg-white/[0.02] border-white/[0.06]'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                                Nível {step.level}
                              </span>
                              <span className="text-xs font-bold text-white">{step.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-rose-500/20 text-rose-300 font-bold">
                                SUDS: {step.suds}/10
                              </span>
                            </div>
                            <p className="text-xs text-text-muted leading-relaxed max-w-2xl">{step.description}</p>
                            <div className="text-[11px] text-cyan-400/90 font-medium">
                              <strong>Alvo:</strong> {step.targetSkill}
                            </div>
                          </div>

                          {/* Status Action Buttons */}
                          <div className="flex items-center gap-1.5 self-center">
                            <button
                              onClick={() => {
                                const updated = { ...exposureStatus, [step.level]: 'nao_iniciado' as const };
                                setExposureStatus(updated);
                                persistPatientHpData(baselineAnswers, logs, baselineSavedAt, updated);
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                                status === 'nao_iniciado'
                                  ? 'bg-white/10 text-white border-white/20'
                                  : 'text-text-muted border-transparent hover:text-white'
                              }`}
                            >
                              Não iniciado
                            </button>

                            <button
                              onClick={() => {
                                const updated = { ...exposureStatus, [step.level]: 'em_treino' as const };
                                setExposureStatus(updated);
                                persistPatientHpData(baselineAnswers, logs, baselineSavedAt, updated);
                                toast.success(`Nível ${step.level} colocado em treino ativo!`);
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                                status === 'em_treino'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'text-text-muted border-transparent hover:text-white'
                              }`}
                            >
                              Em treino
                            </button>

                            <button
                              onClick={() => {
                                const updated = { ...exposureStatus, [step.level]: 'conquistado' as const };
                                setExposureStatus(updated);
                                persistPatientHpData(baselineAnswers, logs, baselineSavedAt, updated);
                                toast.success(`🏆 Parabéns! Nível ${step.level} marcado como conquistado!`);
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                                status === 'conquistado'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                                  : 'text-text-muted border-transparent hover:text-white'
                              }`}
                            >
                              Conquistado 🏆
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-SECTION 4: INSTRUMENTO ESPECÍFICO DA HABILIDADE */}
            {labSubTab === 'interactive' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Instrumento Interativo da Habilidade ({config.name})</span>
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-text-muted">Prática Deliberada Guiada</span>
                  </div>

                  {/* HP2: Guia de Respiração 4-7-8 */}
                  {config.interactiveToolType === 'breathing_protocol' && (
                    <div className="flex flex-col items-center py-6 space-y-6">
                      <div className="relative flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: breathPhase === 'inhale' ? 1.4 : breathPhase === 'hold' ? 1.4 : 1.0,
                            opacity: breathPhase === 'inhale' ? 0.9 : breathPhase === 'hold' ? 0.7 : 0.4
                          }}
                          transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 0 : 8, ease: 'easeInOut' }}
                          className="w-44 h-44 rounded-full bg-gradient-to-tr from-rose-600/30 to-purple-600/30 border-2 border-rose-500/40 flex items-center justify-center shadow-2xl"
                        >
                          <div className="text-center">
                            <div className="text-2xl font-black font-mono text-white">{breathSeconds}s</div>
                            <div className="text-xs font-bold uppercase tracking-wider text-rose-300 mt-1">
                              {breathPhase === 'inhale' ? 'Inspire (Nariz)' : breathPhase === 'hold' ? 'Segure o Ar' : 'Expire (Boca)'}
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setBreathActive(!breathActive);
                            if (!breathActive) {
                              setBreathPhase('inhale');
                              setBreathSeconds(4);
                            }
                          }}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                            breathActive
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {breathActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{breathActive ? 'Pausar Respiração' : 'Iniciar Ciclo 4-7-8'}</span>
                        </button>
                      </div>

                      <div className="w-full max-w-md p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] space-y-2">
                        <div className="flex justify-between text-xs text-text-muted">
                          <span>Termômetro de Desconforto/Ansiedade:</span>
                          <strong className="text-rose-400 font-mono">{subjectiveDistress} / 10</strong>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={subjectiveDistress}
                          onChange={(e) => setSubjectiveDistress(Number(e.target.value))}
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* HP6: Urge Surfing */}
                  {config.interactiveToolType === 'urge_surfing' && (
                    <div className="flex flex-col items-center py-6 space-y-5">
                      <div className="text-center space-y-1">
                        <div className="text-3xl font-black font-mono text-indigo-400 tracking-wider">
                          {Math.floor(urgeTimeLeft / 60)}:{(urgeTimeLeft % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-text-muted">Observe o impulso sem lutar e sem ceder. Ele atingirá o pico e murchará.</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setUrgeActive(!urgeActive)}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                            urgeActive
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {urgeActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{urgeActive ? 'Pausar Cronômetro' : 'Iniciar Onda de 3 Minutos'}</span>
                        </button>
                        <button
                          onClick={() => { setUrgeActive(false); setUrgeTimeLeft(180); }}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-text-muted hover:text-white transition-all"
                          title="Reiniciar"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HP3: Matriz de Evidências */}
                  {config.interactiveToolType === 'evidence_matrix' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Pensamento Catastrófico a Testar:</label>
                        <input
                          type="text"
                          value={thoughtInput}
                          onChange={(e) => setThoughtInput(e.target.value)}
                          placeholder='Ex: "Se eu falhar na reunião, serei demitido e ninguém mais me contratará"'
                          className="w-full mt-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-rose-400">Evidências Fatuais A Favor:</label>
                          <textarea
                            value={evFor}
                            onChange={(e) => setEvFor(e.target.value)}
                            placeholder="Fatos concretos reais (não sentimentos) que apoiam o pensamento..."
                            rows={3}
                            className="w-full mt-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-emerald-400">Evidências Fatuais Contra:</label>
                          <textarea
                            value={evAgainst}
                            onChange={(e) => setEvAgainst(e.target.value)}
                            placeholder="Fatos concretos que contradizem ou enfraquecem a catástrofe..."
                            rows={3}
                            className="w-full mt-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-amber-400">Interpretação Alternativa Realista Balanceada:</label>
                        <input
                          type="text"
                          value={altThought}
                          onChange={(e) => setAltThought(e.target.value)}
                          placeholder='Ex: "Mesmo se eu cometer um deslize, posso corrigir no dia seguinte; errar faz parte do aprendizado profissional."'
                          className="w-full mt-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* HP8: Construtor do NÃO Assertivo */}
                  {config.interactiveToolType === 'assertive_shield' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-emerald-300">Situação ou Pedido Abusivo/Indesejado:</label>
                        <input
                          type="text"
                          value={refusalReason}
                          onChange={(e) => setRefusalReason(e.target.value)}
                          placeholder='Ex: "Colega pediu para eu fazer o relatório dele no final de semana"'
                          className="w-full mt-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.06] space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Fórmula do NÃO Elegante sem Pedir Desculpas:</span>
                        <div className="text-xs text-emerald-300 font-mono bg-black/40 p-2.5 rounded border border-emerald-500/20">
                          {generatedRefusal || '"Agradeço que tenha pensado em mim para isso, mas no momento minha agenda e prioridades não me permitem assumir. Não poderei ajudar desta vez."'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HP10: Savoring */}
                  {config.interactiveToolType === 'savoring_scheduler' && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-amber-300">Atividade Prazerosa a Saborear:</label>
                        <input
                          type="text"
                          value={savoringActivity}
                          onChange={(e) => setSavoringActivity(e.target.value)}
                          placeholder='Ex: "Tomar uma xícara de café quente na varanda por 5 minutos sem celular"'
                          className="w-full mt-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Sensações Físicas Registradas (Aroma, Temperatura, Som, Visão):</label>
                        <textarea
                          value={savoringSenses}
                          onChange={(e) => setSavoringSenses(e.target.value)}
                          placeholder="Descreva o que sentiu ao saborear com presença plena..."
                          rows={2}
                          className="w-full mt-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Exercises Checklist for Others */}
                  {['trigger_tracker', 'self_compassion', 'problem_solver', 'cnv_builder', 'active_listener'].includes(config.interactiveToolType) && (
                    <div className="p-4 bg-white/[0.01] rounded-lg border border-white/[0.06] space-y-3">
                      <span className="text-xs font-bold text-white">Exercício Guiado Recomendado:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {config.deliberateExercises.map((ex, idx) => (
                          <div
                            key={idx}
                            onClick={() => setNewLogExercise(ex.title)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              newLogExercise === ex.title
                                ? 'bg-white/10 border-white text-white shadow-sm'
                                : 'bg-white/[0.02] border-white/5 text-text-muted hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="text-xs font-bold">{ex.title}</div>
                            <div className="text-[10px] mt-1 opacity-70">{ex.description}</div>
                            <div className="text-[9px] font-mono text-cyan-400 mt-2">Duração: {ex.suggestedDuration}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Practice Logging Form (Always accessible at bottom of Lab) */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Registrar Treino Prático na Sessão / Lição de Casa</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-text-muted">Exercício Realizado:</label>
                  <input
                    type="text"
                    value={newLogExercise}
                    onChange={(e) => setNewLogExercise(e.target.value)}
                    className="w-full mt-1 p-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-muted">Dificuldade Subjetiva (1 a 5):</label>
                  <select
                    value={newLogDifficulty}
                    onChange={(e) => setNewLogDifficulty(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-surface-dark border border-white/10 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value={1}>1 - Muito Fácil / Fluido</option>
                    <option value={2}>2 - Fácil</option>
                    <option value={3}>3 - Moderado / Desafiador</option>
                    <option value={4}>4 - Difícil / Forte Desconforto</option>
                    <option value={5}>5 - Muito Difícil / Alta Reatividade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted">Reflexão Clínica / Comportamento Observado:</label>
                <textarea
                  value={newLogNotes}
                  onChange={(e) => setNewLogNotes(e.target.value)}
                  placeholder="Descreva o que o paciente observou, pensou ou sentiu durante o treino..."
                  rows={3}
                  className="w-full mt-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAddLog}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Registro de Treino</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COACH IA ESPECIALISTA */}
        {activeTab === 'coach' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Supervisor Clínico IA em {config.name}</span>
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Orientação técnica e simulações experienciais baseadas na TCC de 4ª Geração e modelo Poubel & Rodrigues.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerAiCoach('feedback')}
                    disabled={aiLoading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      aiMode === 'feedback'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-white/[0.02] text-text-muted border-white/[0.06] hover:bg-white/[0.05]'
                    }`}
                  >
                    💬 Feedback Clínico
                  </button>

                  <button
                    onClick={() => handleTriggerAiCoach('simulation')}
                    disabled={aiLoading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      aiMode === 'simulation'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-white/[0.02] text-text-muted border-white/[0.06] hover:bg-white/[0.05]'
                    }`}
                  >
                    🎭 Simulação de Role-Play
                  </button>

                  <button
                    onClick={() => handleTriggerAiCoach('coping_card')}
                    disabled={aiLoading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      aiMode === 'coping_card'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-white/[0.02] text-text-muted border-white/[0.06] hover:bg-white/[0.05]'
                    }`}
                  >
                    🏷️ Cartão de Enfrentamento
                  </button>
                </div>
              </div>

              {/* AI Output Area */}
              <div className="min-h-[220px] p-4 rounded-xl bg-black/40 border border-white/[0.08] relative">
                {aiLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-black/60 rounded-xl backdrop-blur-xs">
                    <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-cyan-300 font-medium">Supervisor de IA formulando orientações clínicas...</span>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                        Parecer do Treinador de HPs
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiResponse.replace(/<[^>]*>/g, ' '));
                          toast.success('Texto copiado para a área de transferência!');
                        }}
                        className="flex items-center gap-1 text-[11px] text-text-muted hover:text-white transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </button>
                    </div>
                    <div
                      className="text-xs text-text-main leading-relaxed space-y-2"
                      dangerouslySetInnerHTML={{ __html: aiResponse }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted space-y-2">
                    <Sparkles className="w-8 h-8 text-white/20" />
                    <p className="text-xs max-w-sm">
                      Clique em um dos modos acima para solicitar feedback clínico, gerar um desafio de role-play ou elaborar um cartão de enfrentamento rápido para {config.name}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HISTÓRICO & EVOLUÇÃO */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Histórico de Treinos e Evoluções</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Registros de práticas intersessão de {selectedPatient?.nome || 'paciente selecionado'}.
                </p>
              </div>

              <button
                onClick={handleSaveToProntuario}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/40 text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Tudo no Prontuário</span>
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-white/[0.01] border border-white/[0.06] text-text-muted space-y-2">
                <FileText className="w-8 h-8 mx-auto text-white/20" />
                <p className="text-xs">Nenhum registro de treino adicionado ainda para este paciente.</p>
                <button
                  onClick={() => setActiveTab('lab')}
                  className="text-xs text-cyan-400 font-semibold hover:underline mt-1"
                >
                  Registrar o primeiro treino no Laboratório Prático →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{log.exerciseTitle}</span>
                      <span className="text-[10px] font-mono text-text-muted">{log.date}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{log.notes}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-text-dim">
                      <span>Dificuldade percebida: <strong>{log.difficulty} / 5</strong></span>
                      <button
                        onClick={() => {
                          const updated = logs.filter(l => l.id !== log.id);
                          setLogs(updated);
                          persistPatientHpData(baselineAnswers, updated, baselineSavedAt);
                          toast.success('Registro removido.');
                        }}
                        className="text-rose-400/80 hover:text-rose-400"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
