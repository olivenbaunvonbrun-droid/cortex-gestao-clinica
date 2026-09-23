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
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db, Paciente } from '../../lib/db';
import { HP_TOOLS_CONFIG, HpConfigItem } from './hpToolsConfig';
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
      } else {
        setBaselineAnswers({});
        setBaselineSavedAt(null);
        setLogs([]);
      }
    } catch (e) {
      console.error('Erro ao carregar dados locais da HP:', e);
    }
  };

  const persistPatientHpData = (updatedAnswers: Record<string, number>, updatedLogs: PracticeLogItem[], savedAt: string | null) => {
    if (!selectedPatientId) return;
    try {
      const payload = {
        baselineAnswers: updatedAnswers,
        baselineSavedAt: savedAt,
        logs: updatedLogs
      };
      localStorage.setItem(getStorageKey(selectedPatientId), JSON.stringify(payload));
    } catch (e) {
      console.error('Erro ao persistir dados da HP:', e);
    }
  };

  // Baseline Score calculation
  const totalScore = Object.values(baselineAnswers).reduce((acc, curr) => acc + curr, 0);
  const maxPossible = config.baselineQuestions.length * 5;
  const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  const getScoreClassification = (pct: number) => {
    if (pct === 0) return { label: 'Não avaliado', color: 'text-text-muted', badge: 'bg-white/5 text-text-muted border-white/10' };
    if (pct < 50) return { label: 'Déficit Significativo', color: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    if (pct <= 75) return { label: 'Em Desenvolvimento / Moderado', color: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { label: 'Maestria / Avançado', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const classification = getScoreClassification(percentage);

  const handleSaveBaseline = () => {
    const isComplete = config.baselineQuestions.every(q => baselineAnswers[q.id] !== undefined);
    if (!isComplete) {
      toast.error('Responda a todas as 4 perguntas para salvar o baseline.');
      return;
    }
    const nowStr = new Date().toLocaleString('pt-BR');
    setBaselineSavedAt(nowStr);
    persistPatientHpData(baselineAnswers, logs, nowStr);
    toast.success('Autoavaliação baseline salva com sucesso!');
  };

  // Add Practice Log
  const handleAddLog = () => {
    if (!newLogNotes.trim()) {
      toast.error('Descreva brevemente como foi a prática antes de salvar.');
      return;
    }
    const newEntry: PracticeLogItem = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      exerciseTitle: newLogExercise,
      notes: newLogNotes.trim(),
      difficulty: newLogDifficulty
    };
    const updated = [newEntry, ...logs];
    setLogs(updated);
    persistPatientHpData(baselineAnswers, updated, baselineSavedAt);
    setNewLogNotes('');
    toast.success('Registro de treino adicionado!');
  };

  // Save as Clinical Evolution in Prontuário
  const handleSaveToProntuario = async () => {
    if (!selectedPatientId) {
      toast.error('Selecione um paciente para registrar no prontuário.');
      return;
    }

    try {
      const record = await db.prontuarios.get(selectedPatientId);
      const textHtml = `
        <div class="hp-training-entry p-4 bg-white/[0.01] border border-white/[0.08] rounded-xl space-y-3">
          <div class="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <h4 class="text-sm font-bold text-[#10b981] flex items-center gap-2">
              <span>🎯</span> Treinamento de Habilidade Psicológica: ${config.name} (${config.shortTitle})
            </h4>
            <span class="text-xs font-mono opacity-60">${new Date().toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
            <div><strong>Score Baseline:</strong> ${percentage > 0 ? `${percentage}% (${totalScore}/${maxPossible})` : 'Não avaliado'}</div>
            <div><strong>Classificação:</strong> ${classification.label}</div>
            <div class="col-span-2"><strong>EIDs Focados:</strong> ${config.eidsCombated.join(', ')}</div>
          </div>
          ${logs.length > 0 ? `
            <div class="space-y-1 text-xs">
              <strong>Últimos Exercícios Praticados:</strong>
              <ul class="list-disc pl-5 space-y-1">
                ${logs.slice(0, 3).map(l => `<li><strong>${l.exerciseTitle}</strong> (${l.date}): ${l.notes}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${aiResponse ? `
            <div class="text-xs border-l-2 border-[#10b981] pl-3 py-1 bg-white/[0.01] rounded">
              <strong>Diretriz do Supervisor IA:</strong>
              <div>${aiResponse}</div>
            </div>
          ` : ''}
        </div>
      `;

      const newEntry = {
        timestamp: Date.now(),
        data: new Date().toLocaleDateString('pt-BR'),
        textoHtml: textHtml,
        tipo: 'evolucao' as any,
        metadata: {
          type: 'hp-training',
          hpId: config.id,
          hpName: config.name,
          scorePct: percentage
        }
      };

      if (record) {
        const updatedEntradas = [newEntry, ...record.entradas];
        await db.prontuarios.update(selectedPatientId, { entradas: updatedEntradas });
      } else {
        await db.prontuarios.add({
          id: selectedPatientId,
          pacienteId: selectedPatientId,
          entradas: [newEntry],
          dadosGerais: { dataAbertura: new Date().toISOString() }
        });
      }

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

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-text-main font-sans select-none overflow-hidden border border-white/[0.08] rounded-xl shadow-2xl">
      {/* Top Bar with HP Identity and Patient Selector */}
      <div className={`p-4 bg-gradient-to-r ${config.gradient} border-b ${config.borderColor} flex flex-wrap items-center justify-between gap-3 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-lg ${config.badgeColor}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                HP #{config.number}
              </span>
              <h2 className="text-base font-bold text-white tracking-wide">{config.name}</h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5 max-w-xl truncate">{config.definition}</p>
          </div>
        </div>

        {/* Patient Selection & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5">
            <User className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="" disabled className="bg-surface-dark">Selecione o paciente...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id} className="bg-surface-dark">
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

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

      {/* Tabs Navigation */}
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
          <span>3. Laboratório Prático</span>
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

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: PSICOEDUCAÇÃO */}
        {activeTab === 'psychoed' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Core Card */}
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

            {/* Call to Action to Next Tab */}
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
                  percentage < 50 ? 'bg-rose-500' : percentage <= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* 4 Standardized Questions */}
            <div className="space-y-4">
              {config.baselineQuestions.map((q, qIndex) => {
                const currentVal = baselineAnswers[q.id] || 0;
                return (
                  <div key={q.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-semibold text-white">
                        <strong className="text-text-muted mr-1.5">Item {qIndex + 1}:</strong>
                        {q.statement}
                      </span>
                      {currentVal > 0 && (
                        <span className="text-xs font-bold font-mono text-cyan-400 shrink-0">
                          {currentVal} / 5
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => setBaselineAnswers(prev => ({ ...prev, [q.id]: val }))}
                          className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all ${
                            currentVal === val
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-md'
                              : 'bg-white/[0.02] text-text-muted border-white/[0.06] hover:bg-white/[0.05]'
                          }`}
                        >
                          <div>{val}</div>
                          <div className="text-[9px] font-normal opacity-60">
                            {val === 1 ? 'Nunca' : val === 3 ? 'Às vezes' : val === 5 ? 'Sempre' : ''}
                          </div>
                        </button>
                      ))}
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

        {/* TAB 3: LABORATÓRIO PRÁTICO INTERATIVO */}
        {activeTab === 'lab' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Dedicated Interactive Widget for each HP */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Instrumento Interativo da Habilidade</span>
                </h3>
                <span className="text-[10px] uppercase font-bold text-text-muted">Prática Deliberada Guiada</span>
              </div>

              {/* SPECIFIC WIDGETS */}
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
                      "Agradeço que tenha pensado em mim para isso, mas no momento minha agenda e prioridades não me permitem assumir. Não poderei ajudar desta vez."
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

              {/* Generic fallback tool for others (HP1, HP4, HP5, HP7, HP9) */}
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

            {/* Practice Logging Form */}
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
