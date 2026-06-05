/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Patient, PsychologicalSkill } from "../types";
import { skillData } from "../data/skillData";

// Interactive skill submodules
import RealismoOtimistaExercise from "./RealismoOtimistaExercise";
import AutocontroleExercise from "./AutocontroleExercise";
import SociabilidadeExercise from "./SociabilidadeExercise";
import HedonismoResponsavelExercise from "./HedonismoResponsavelExercise";
import SensibilidadeSocialExercise from "./SensibilidadeSocialExercise";
import AutoesteemExercise from "./AutoesteemExercise";
import { 
  Sparkles, 
  HelpCircle, 
  ThumbsUp, 
  Flame, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Volume2, 
  Check, 
  Award,
  Video,
  FileText,
  User,
  MessagesSquare,
  Bookmark,
  Activity,
  Brain,
  Timer,
  Heart,
  Wind,
  RefreshCw,
  Sliders
} from "lucide-react";

interface TrainingModuleProps {
  patient: Patient;
  onAwardXp: (xpAmount: number) => void;
  onAddLog: (evolutionSummary: string, adherence: number, verbal: number, nonVerbal: number) => void;
}

export default function TrainingModule({ patient, onAwardXp, onAddLog }: TrainingModuleProps) {
  // Helper to replace "Pedro" with patient name dynamically
  const formatText = React.useCallback((text: string) => {
    if (!text || !patient?.name) return text;
    return text
      .replace(/Pedro Henrique Silveira/g, patient.name)
      .replace(/Pedro Silveira/g, patient.name)
      .replace(/Pedro/g, patient.name);
  }, [patient?.name]);

  const patientSkillData = React.useMemo(() => {
    const formatted: any = {};
    for (const key of Object.keys(skillData)) {
      const skill = skillData[key as PsychologicalSkill];
      formatted[key] = {
        description: formatText(skill.description),
        gains: skill.gains.map(formatText),
        losses: skill.losses.map(formatText),
        distortions: skill.distortions.map(d => ({
          distortion: formatText(d.distortion),
          correction: formatText(d.correction)
        })),
        affirmations: skill.affirmations.map(a => ({
          title: formatText(a.title),
          content: formatText(a.content)
        })),
        immersions: skill.immersions.map(i => ({
          type: i.type,
          title: formatText(i.title),
          desc: formatText(i.desc)
        }))
      };
    }
    return formatted;
  }, [patient?.name, formatText]);

  const [selectedHp, setSelectedHp] = useState<PsychologicalSkill>(PsychologicalSkill.ResolutividadeEnfrentamento);
  const [currentPhaseTab, setCurrentPhaseTab] = useState<number>(1); // Phases 1 to 5

  // Simulation State
  const [activeScenarioLevel, setActiveScenarioLevel] = useState<number | null>(null); // null, 1 (Collega), 2 (Superior)
  const [simulationStep, setSimulationStep] = useState<"intro" | "posture" | "speech" | "feedback">("intro");

  // Posture selections (non-verbal)
  const [postureAprumar, setPostureAprumar] = useState(false);
  const [postureOmbros, setPostureOmbros] = useState(false);
  const [postureQueixo, setPostureQueixo] = useState(false);
  const [postureOlhar, setPostureOlhar] = useState(false);
  const [postureVoz, setPostureVoz] = useState(false);

  // Verbal options selection or custom typing
  const [verbalStyle, setVerbalStyle] = useState<"passive" | "aggressive" | "assertive" | "custom">("passive");
  const [customText, setCustomText] = useState("");
  const [simulationCompleted, setSimulationCompleted] = useState(false);

  // Phase 2 checklist of thoughts mapping
  const [thoughtChecked1, setThoughtChecked1] = useState(false);
  const [thoughtChecked2, setThoughtChecked2] = useState(false);
  const [thoughtChecked3, setThoughtChecked3] = useState(false);

  // --- NEW NEUROSCIENCE CLINICAL STATES ---
  
  // 1. Autorregulação Emocional: Diaphragmatic Breathing Biofeedback Simulator State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "retain" | "exhale" | "completed">("inhale");
  const [breathingTime, setBreathingTime] = useState(0); // 0 to 15s cyclic timer (5s inhale, 5s retain, 5s exhale)
  const [breathingCyclesCompleted, setBreathingCyclesCompleted] = useState(0); // Targets 3 cycles completion
  const [biofeedbackHeartRate, setBiofeedbackHeartRate] = useState(95);
  const [biofeedbackPNS, setBiofeedbackPNS] = useState(15);
  const [biofeedbackSNS, setBiofeedbackSNS] = useState(85);
  const [biofeedbackHRV, setBiofeedbackHRV] = useState(35);
  const [biofeedbackBeta, setBiofeedbackBeta] = useState(28);
  const [biofeedbackAlfa, setBiofeedbackAlfa] = useState(7);
  const [biofeedbackTheta, setBiofeedbackTheta] = useState(5.2);

  // Reset breathing state helper
  const resetBreathingSim = () => {
    setBreathingActive(false);
    setBreathingPhase("inhale");
    setBreathingTime(0);
    setBreathingCyclesCompleted(0);
    setBiofeedbackHeartRate(95);
    setBiofeedbackPNS(15);
    setBiofeedbackSNS(85);
    setBiofeedbackHRV(35);
    setBiofeedbackBeta(28);
    setBiofeedbackAlfa(7);
    setBiofeedbackTheta(5.2);
  };

  // 2. Autoconhecimento: Socratic Restructuring Board State
  const [socraticThought, setSocraticThought] = useState("");
  const [socraticSelectedDistortion, setSocraticSelectedDistortion] = useState("Catastrofização");
  const [socraticRestructuredText, setSocraticRestructuredText] = useState("");
  const [socraticSubmitted, setSocraticSubmitted] = useState(false);
  const [socraticInhibitionProgress, setSocraticInhibitionProgress] = useState(30); // 30% initial vmPFC vs Amygdala coupling

  // Reset socratic state helper
  const resetSocraticSim = () => {
    setSocraticThought("");
    setSocraticSelectedDistortion("Catastrofização");
    setSocraticRestructuredText("");
    setSocraticSubmitted(false);
    setSocraticInhibitionProgress(30);
  };

  // 3. Imunidade Social: Controlled Exposure & Systematic Desensitization State
  const [selectedExposureIndex, setSelectedExposureIndex] = useState<number | null>(null);
  const [exposureTimer, setExposureTimer] = useState(0);
  const [exposureActive, setExposureActive] = useState(false);
  const [exposureCurrentSud, setExposureCurrentSud] = useState(75);
  const [exposureList, setExposureList] = useState([
    { id: "e1", situation: "Dizer não a uma demanda adicional indevida fora do escopo de trabalho", initialSud: 50, currentSud: 50, practicedCount: 0 },
    { id: "e2", situation: "Perguntar dúvidas básicas no canal público do Slack corporativo", initialSud: 65, currentSud: 65, practicedCount: 0 },
    { id: "e3", situation: "Dizer diretamente ao superior imediato que um prazo é fisicamente irrealizável", initialSud: 80, currentSud: 80, practicedCount: 0 },
    { id: "e4", situation: "Apresentar slides técnicos sob olhar sarcástico e impaciente do chefe", initialSud: 95, currentSud: 95, practicedCount: 0 }
  ]);

  // Reset exposure state helper
  const resetExposureSim = () => {
    setSelectedExposureIndex(null);
    setExposureTimer(0);
    setExposureActive(false);
    setExposureCurrentSud(75);
  };

  // Breathing simulation clock trigger
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingTime(prevTime => {
          const nextTime = (prevTime + 1) % 15;
          
          if (nextTime < 5) {
            setBreathingPhase("inhale");
            setBiofeedbackHeartRate(prev => Math.min(94, prev + 1));
            setBiofeedbackPNS(prev => Math.max(10, prev - 2));
            setBiofeedbackSNS(prev => Math.min(90, prev + 2));
          } else if (nextTime < 10) {
            setBreathingPhase("retain");
            setBiofeedbackBeta(prev => Math.max(12, prev - 0.5));
          } else {
            setBreathingPhase("exhale");
            setBiofeedbackHeartRate(prev => Math.max(68, prev - 2));
            setBiofeedbackPNS(prev => Math.min(90, prev + 4));
            setBiofeedbackSNS(prev => Math.max(10, prev - 4));
            setBiofeedbackHRV(prev => Math.min(95, prev + 3));
            setBiofeedbackAlfa(prev => Math.min(13.5, prev + 0.5));
            setBiofeedbackTheta(prev => Math.min(8.0, prev + 0.2));
            setBiofeedbackBeta(prev => Math.max(12, prev - 1));
          }

          if (nextTime === 0) {
            setBreathingCyclesCompleted(prev => {
              const nextCycles = prev + 1;
              if (nextCycles >= 3) {
                setBreathingActive(false);
                setBreathingPhase("completed");
                onAwardXp(150);
                onAddLog(
                  `Completou Treinamento de Respiração Diafragmática (Nervo Vago e Autossuficiência Emocional). Frequência Cardíaca reduziu para 68 BPM. Ganhou +150 XP de neuroplasticidade.`,
                  98,
                  70,
                  95
                );
              }
              return nextCycles;
            });
          }

          return nextTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breathingActive]);

  // Systematic Desensitization Exposure clock trigger
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (exposureActive && selectedExposureIndex !== null) {
      interval = setInterval(() => {
        setExposureTimer(prev => {
          if (prev <= 1) {
            setExposureActive(false);
            
            // Completion logic:
            setExposureList(oldList => {
              const newList = [...oldList];
              const item = newList[selectedExposureIndex];
              const finalSud = Math.max(15, Math.round(item.currentSud - 15));
              newList[selectedExposureIndex] = {
                ...item,
                currentSud: finalSud,
                practicedCount: item.practicedCount + 1
              };
              
              onAwardXp(200);
              onAddLog(
                `Praticou Re-exposição Mental Wolpe e Desensibilização Sistemática: '${item.situation}'. Reduziu a Escala de Desconforto (SUD) para ${finalSud}%. Inibição da via amigdalar ativada. Ganhou +200 XP.`,
                100,
                80,
                90
              );
              
              return newList;
            });

            return 0;
          }

          setExposureCurrentSud(curr => {
            const nextSud = Math.max(15, curr - 3.5);
            setExposureList(oldList => {
              const newList = [...oldList];
              newList[selectedExposureIndex] = {
                ...newList[selectedExposureIndex],
                currentSud: Math.round(nextSud)
              };
              return newList;
            });
            return nextSud;
          });

          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [exposureActive, selectedExposureIndex]);

  const resetSimulation = () => {
    setSimulationStep("intro");
    setPostureAprumar(false);
    setPostureOmbros(false);
    setPostureQueixo(false);
    setPostureOlhar(false);
    setPostureVoz(false);
    setVerbalStyle("passive");
    setCustomText("");
  };

  const startScenario = (level: number) => {
    setActiveScenarioLevel(level);
    setSimulationStep("intro");
  };

  const evaluatePostureScore = () => {
    let checked = 0;
    if (postureAprumar) checked++;
    if (postureOmbros) checked++;
    if (postureQueixo) checked++;
    if (postureOlhar) checked++;
    if (postureVoz) checked++;
    return (checked / 5) * 100;
  };

  const getVerbalFeedbackScore = () => {
    if (verbalStyle === "assertive") return 100;
    if (verbalStyle === "passive") return 30;
    if (verbalStyle === "aggressive") return 40;
    // Evaluate custom typed text against elements
    let score = 30;
    const lText = customText.toLowerCase();
    if (activeScenarioLevel === 1) {
      if (lText.includes("lincoln") || lText.includes("atenc") || lText.includes("atenç")) score += 25;
      if (lText.includes("prioridade") || lText.includes("reuni") || lText.includes("reunid")) score += 25;
      if (lText.includes("favor") || lText.includes("guard") || lText.includes("celular")) score += 20;
    } else {
      // Level 2 evaluations
      if (lText.includes("percebo") || lText.includes("express") || lText.includes("aparent")) score += 25;
      if (lText.includes("feedback") || lText.includes("gostaria") || lText.includes("ouvir")) score += 25;
      if (lText.includes("ajudar") || lText.includes("aprimor") || lText.includes("critic")) score += 20;
    }
    return Math.min(100, score);
  };

  const submitSpeech = () => {
    setSimulationStep("feedback");
    
    // Calculate clinical scores
    const nonVerbalScore = evaluatePostureScore();
    const verbalScore = getVerbalFeedbackScore();
    const combinedScore = (nonVerbalScore + verbalScore) / 2;

    // Gamification awards
    const levelModifier = activeScenarioLevel === 2 ? 1.5 : 1;
    const baseRewardXp = Math.round(combinedScore * 2.5 * levelModifier);
    onAwardXp(baseRewardXp);

    // Logging evolution in history
    const scenarioName = activeScenarioLevel === 1 ? "O Colega Distraído (Nível 1)" : "O Superior Sarcástico (Nível 2)";
    const evaluationSummary = `Completou treinamento PDP de Assertividade: '${scenarioName}'. Postura: ${nonVerbalScore}%, Verbal: ${verbalScore}%. Ganhou +${baseRewardXp} XP de neuroplasticidade.`;
    
    onAddLog(
      evaluationSummary,
      95, // High adherence because completed simulation
      verbalScore,
      nonVerbalScore
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Skill Selector Tabs */}
      <div className="bg-bg-sidebar p-4 rounded-xl border border-border-subtle shadow-sm flex flex-wrap gap-2">
        {Object.values(PsychologicalSkill).map(skillName => {
          const isSelected = selectedHp === skillName;
          return (
            <button
              key={skillName}
              onClick={() => { setSelectedHp(skillName); setCurrentPhaseTab(1); resetSimulation(); }}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                isSelected 
                  ? "bg-bg-deep text-white shadow-sm border-0" 
                  : "bg-bg-card border border-border-subtle text-text-dim hover:bg-bg-sidebar"
              }`}
            >
              {skillName}
            </button>
          );
        })}
      </div>

      {/* Main Training Sandbox */}
      <div className="bg-bg-sidebar rounded-xl border border-border-subtle overflow-hidden shadow-sm">
        
        {/* Module Header showing HP Context */}
        <div className="bg-bg-deep text-white p-6 border-b border-border-subtle">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold text-primary">Treinamento Clínico PDP Ativo</span>
              <h3 className="text-xl font-bold tracking-tight text-white">{selectedHp}</h3>
              <p className="text-xs text-text-dim mt-1 max-w-xl leading-relaxed">
                {patientSkillData[selectedHp]?.description || "Desenvolvimento de habilidades psicológicas consistentes de acordo com diretrizes de quarta geração."}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-950 px-3 py-2 rounded-lg border border-indigo-800 text-indigo-300 font-mono text-xs font-bold">
              <Sparkles className="w-4 h-4 fill-indigo-500/20" />
              <span>Multiplicador de XP: 1.5x</span>
            </div>
          </div>
        </div>

        {/* PDP 5 Phase Progression Nav */}
        <div className="border-b border-border-subtle bg-bg-card overflow-x-auto flex">
          {[
            { id: 1, name: "Fase 1: Motivação" },
            { id: 2, name: "Fase 2: Correção de Distorções" },
            { id: 3, name: "Fase 3: Mentalidade Saudável" },
            { id: 4, name: "Fase 4: Imersão Literária" },
            { id: 5, name: "Fase 5: Exercícios Práticos" },
          ].map((phase) => {
            const isTabActive = currentPhaseTab === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => setCurrentPhaseTab(phase.id)}
                className={`flex-1 min-w-[130px] text-center px-4 py-3.5 text-xs font-bold transition outline-none border-b-2 font-sans ${
                  isTabActive 
                    ? "border-primary text-primary bg-bg-sidebar" 
                    : "border-transparent text-text-dim hover:text-text-main hover:bg-bg-sidebar/60"
                }`}
              >
                {phase.name}
              </button>
            );
          })}
        </div>

        {/* Dynamic Phase Render */}
        <div className="p-6">
          
          {/* Phase 1: Motivation */}
          {currentPhaseTab === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h4 className="text-base font-bold text-text-main mb-2">Por que treinar {selectedHp}?</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Não adianta aplicar técnicas sem que o seu córtex frontal decifre o valor pessoal dessa mudança. 
                  Pesquisas clínicas provam que treinar essa habilidade reduz de forma significativa o cortisol, trazendo saúde biológica a longo prazo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <h5 className="font-bold text-emerald-800 text-xs uppercase font-mono mb-2">Ganhos de Desenvolvimento (+ HP)</h5>
                  <ul className="space-y-1.5 text-xs text-text-dim">
                    {(patientSkillData[selectedHp]?.gains || [
                      "Autoridade e autonomia técnica no trabalho",
                      "Resolução pacífica e rápida de problemas e atritos",
                      "Descatastrofização de avaliações alheias"
                    ]).map((gain, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle className={`w-4 h-4 text-primary flex-shrink-0 ${i === 2 ? "text-amber-500 animate-pulse" : ""}`} /> {gain}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <h5 className="font-bold text-red-800 text-xs uppercase font-mono mb-2">Perdas Seculares por Déficit (- HP)</h5>
                  <ul className="space-y-1.5 text-xs text-text-dim">
                    {(patientSkillData[selectedHp]?.losses || [
                      "Sobrecarga de tarefas devido a evitação e passividade",
                      "Submissão e subjugação de direitos individuais",
                      "Ansiedade somática perpétua em interações sociais"
                    ]).map((loss, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" /> {loss}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-bg-card border border-border-subtle rounded-xl">
                <span className="text-[10px] font-bold text-text-dim font-mono uppercase">Vínculo com Valores do Paciente Ativo:</span>
                <p className="text-xs font-semibold text-text-main mt-1 pl-2 border-l-2 border-sky-500 font-mono">
                  "{patient.name} valoriza profundamente a 'Realização Técnica' e 'Soberania Profissional'. Cultivar a habilidade de {selectedHp} ajudará {patient.name} no alcance pleno de seus propósitos éticos e clínicos."
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => { setCurrentPhaseTab(2); onAwardXp(50); }}
                  className="px-4 py-2 bg-bg-deep text-white text-xs font-bold rounded-lg hover:bg-white/10 transition"
                >
                  Concluir Phase 1 (+50 XP) e Prosseguir
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: Correction of distortions */}
          {currentPhaseTab === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h4 className="text-base font-bold text-text-main mb-2">Derrubando Ideias Limitantes</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Para que possamos implantar comportamentos saudáveis, precisamos auditar pensamentos distorcidos que bloqueiam sua coragem. Marque abaixo os que você reconhece ter tido e repare na correção científica recomendada:
                </p>
              </div>

              <div className="space-y-3">
                {(() => {
                  const distortions = patientSkillData[selectedHp]?.distortions || [];
                  return (
                    <>
                      {distortions[0] && (
                        <div 
                          onClick={() => setThoughtChecked1(!thoughtChecked1)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                            thoughtChecked1 ? "bg-primary/5 border-primary/40" : "bg-bg-sidebar border-border-subtle hover:bg-bg-card"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input type="checkbox" checked={thoughtChecked1} readOnly className="rounded border-border-subtle mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-text-main block">{distortions[0].distortion}</span>
                              <p className="text-[11px] text-primary mt-1">
                                <span className="font-bold underline uppercase tracking-wide">Restauração Cognitiva:</span> {distortions[0].correction}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {distortions[1] && (
                        <div 
                          onClick={() => setThoughtChecked2(!thoughtChecked2)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                            thoughtChecked2 ? "bg-primary/5 border-primary/40" : "bg-bg-sidebar border-border-subtle hover:bg-bg-card"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input type="checkbox" checked={thoughtChecked2} readOnly className="rounded border-border-subtle mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-text-main block">{distortions[1].distortion}</span>
                              <p className="text-[11px] text-primary mt-1">
                                <span className="font-bold underline uppercase tracking-wide">Restauração Cognitiva:</span> {distortions[1].correction}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {distortions[2] && (
                        <div 
                          onClick={() => setThoughtChecked3(!thoughtChecked3)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                            thoughtChecked3 ? "bg-primary/5 border-primary/40" : "bg-bg-sidebar border-border-subtle hover:bg-bg-card"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input type="checkbox" checked={thoughtChecked3} readOnly className="rounded border-border-subtle mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-text-main block">{distortions[2].distortion}</span>
                              <p className="text-[11px] text-primary mt-1">
                                <span className="font-bold underline uppercase tracking-wide">Restauração Cognitiva:</span> {distortions[2].correction}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="flex justify-between items-center bg-bg-card p-4 rounded-xl">
                <span className="text-xs text-text-dim font-mono">Status: {([thoughtChecked1, thoughtChecked2, thoughtChecked3].filter(Boolean).length)} de 3 processadas</span>
                <button
                  disabled={!thoughtChecked1 && !thoughtChecked2 && !thoughtChecked3}
                  onClick={() => { setCurrentPhaseTab(3); onAwardXp(120); }}
                  className="px-4 py-2 bg-bg-deep text-white text-xs font-bold rounded-lg hover:bg-white/10 transition disabled:opacity-50"
                >
                  Confirmar Correção (+120 XP)
                </button>
              </div>
            </div>
          )}

          {/* Phase 3: Healthy Mindset */}
          {currentPhaseTab === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h4 className="text-base font-bold text-text-main mb-2">Instalação de Afirmações Saudáveis de Poder</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Tratamos as afirmações clínicas não como mantras mágicos, mas como rascunhos verbais conscientes que o Córtex Inibitório utiliza sob extrema pressão ambiental para acalmar a resposta somática e muscular.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const affirmations = patientSkillData[selectedHp]?.affirmations || [];
                  return (
                    <>
                      {affirmations[0] && (
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 border border-border-subtle rounded-xl text-white relative shadow">
                          <div className="absolute right-3 top-3 text-[10px] font-mono opacity-25">Citação Clínica</div>
                          <h5 className="text-primary text-xs uppercase font-mono font-bold mb-3">1. {affirmations[0].title}</h5>
                          <p className="text-xs font-serif italic leading-relaxed text-indigo-100">
                            "{affirmations[0].content}"
                          </p>
                        </div>
                      )}

                      {affirmations[1] && (
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-sky-950 border border-border-subtle rounded-xl text-white relative shadow">
                          <div className="absolute right-3 top-3 text-[10px] font-mono opacity-25">Citação Clínica</div>
                          <h5 className="text-sky-400 text-xs uppercase font-mono font-bold mb-3">2. {affirmations[1].title}</h5>
                          <p className="text-xs font-serif italic leading-relaxed text-sky-100">
                            "{affirmations[1].content}"
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="p-4 bg-amber-500/10 text-amber-800 border border-amber-500/20 rounded-xl text-xs flex items-center gap-3">
                <Bookmark className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span><span className="font-bold">Tarefa Recomendada:</span> Repita e leia essas afirmações em voz alta antes de iniciar suas simulações diárias para reforçar a inibição límbica de reatividade social.</span>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => { setCurrentPhaseTab(4); onAwardXp(80); }}
                  className="px-4 py-2 bg-bg-deep text-white text-xs font-bold rounded-lg hover:bg-white/10 transition"
                >
                  Concluir Phase 3 (+80 XP) e Prosseguir
                </button>
              </div>
            </div>
          )}

          {/* Phase 4: Immersion */}
          {currentPhaseTab === 4 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h4 className="text-base font-bold text-text-main mb-2">Imersão Psicoeducativa de Habilidades</h4>
                <p className="text-xs text-text-dim leading-relaxed">
                  Para treinar o seu cérebro, você precisa 'respirar' essa habilidade durante a semana. Consuma os materiais recomendados por nossa bancada científica para consolidar o conhecimento teórico:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const immersions = patientSkillData[selectedHp]?.immersions || [];
                  return immersions.map((item, idx) => {
                    const isVideo = item.type === "video";
                    const isArticle = item.type === "article" || item.type === "book";
                    return (
                      <div key={idx} className="p-4 bg-bg-sidebar border border-border-subtle rounded-xl hover:shadow-md transition flex flex-col justify-between">
                        <div>
                          <div className={`flex items-center gap-2 font-mono text-[10px] font-bold uppercase mb-2 ${
                            isVideo ? "text-sky-600" : isArticle ? "text-primary" : "text-purple-600"
                          }`}>
                            {isVideo && <Video className="w-4 h-4" />}
                            {isArticle && <FileText className="w-4 h-4" />}
                            {!isVideo && !isArticle && <MessagesSquare className="w-4 h-4" />}
                            {item.type === "video" ? "Vídeo / Simulação" : item.type === "book" ? "Livro Clínico" : item.type === "article" ? "Artigo Científico" : "Podcast de Caso"}
                          </div>
                          <h5 className="font-bold text-text-main text-xs mb-1">{item.title}</h5>
                          <p className="text-[11px] text-text-dim leading-snug">
                            {item.desc}
                          </p>
                        </div>
                        <span className="block mt-3 text-[10px] font-mono text-text-dim bg-bg-card/80 p-1 rounded text-center border">Incluso / Disponível</span>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => { setCurrentPhaseTab(5); onAwardXp(100); }}
                  className="px-4 py-2 bg-bg-deep text-white text-xs font-bold rounded-lg hover:bg-white/10 transition"
                >
                  Concluir Phase 4 (+100 XP) e Prosseguir para Simulação Real!
                </button>
              </div>
            </div>
          )}

          {/* Phase 5: Exercises / Role-play Simulation */}
          {currentPhaseTab === 5 && (
            <div className="space-y-6">
              
              {selectedHp === PsychologicalSkill.ResolutividadeEnfrentamento ? (
                /* Interactive Simulated Role-play of Assertiveness */
                <div className="space-y-6">
                  {activeScenarioLevel === null ? (
                    /* Level Selection Dashboard */
                    <div className="p-6 bg-bg-card rounded-xl border border-border-subtle space-y-4 text-center max-w-2xl mx-auto">
                      <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                        <MessagesSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-text-main">Simulador de Role-play e Assertividade</h4>
                        <p className="text-xs text-text-dim mt-1">
                          Consolide as conexões de neuroplasticidade praticando cenários reais de dificuldades progressivas e receba notas clínicas de competência.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
                        <div className="bg-bg-sidebar p-4 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between">
                          <div>
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[9px] font-bold font-mono rounded uppercase">Dificuldade: Nível 1</span>
                            <h5 className="font-bold text-text-main text-sm mt-1.5">O Colega Distraído</h5>
                            <p className="text-[11px] text-text-dim mt-1 leading-snug">
                              Role-play interpessoal onde um par de equipe mexe consecutivamente no celular durante sua explanação técnica. Menor nível de complexidade hierárquica.
                            </p>
                          </div>
                          <button
                            onClick={() => startScenario(1)}
                            className="mt-4 w-full py-2 bg-bg-deep hover:bg-white/10 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" /> Iniciar Cenário
                          </button>
                        </div>

                        <div className="bg-bg-sidebar p-4 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-between">
                          <div>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[9px] font-bold font-mono rounded uppercase">Dificuldade: Nível 2</span>
                            <h5 className="font-bold text-text-main text-sm mt-1.5">O Superior Sarcástico</h5>
                            <p className="text-[11px] text-text-dim mt-1 leading-snug">
                              Elevado nível de desafio com superior hierárquico esboçando impaciência explícita e micro-agressões corporais de desdém durante sua fala.
                            </p>
                          </div>
                          <button
                            onClick={() => startScenario(2)}
                            className="mt-4 w-full py-2 bg-bg-deep hover:bg-white/10 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" /> Iniciar Cenário
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ACTIVE INTERACTIVE ROLE-PLAY SCENE SCREEN */
                    <div className="bg-bg-deep border border-border-subtle rounded-2xl text-text-main p-6 space-y-6 shadow-xl relative overflow-hidden">
                      
                      {/* Top status bar */}
                      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-red-500 text-text-main font-bold font-mono text-[9px] uppercase rounded animate-pulse">Simulação Ativa</span>
                          <span className="text-xs text-text-dim font-mono">
                            {activeScenarioLevel === 1 ? "Cenário: O Colega Distraído" : "Cenário: O Superior Sarcástico"}
                          </span>
                        </div>
                        <button
                          onClick={resetSimulation}
                          className="text-xs text-text-dim hover:text-text-main font-bold flex items-center gap-1 bg-transparent border-0"
                        >
                          Reiniciar Exercício
                        </button>
                      </div>

                      {/* Scenario script narration box */}
                      {simulationStep === "intro" && (
                        <div className="space-y-5 py-4 max-w-xl mx-auto text-center">
                          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-sky-400 flex items-center justify-center mx-auto text-sky-400 font-bold">
                            HP
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-base font-bold text-white">
                              {activeScenarioLevel === 1 ? "Situação Clínico-Comportamental — Nível 1" : "Situação Clínico-Comportamental — Nível 2"}
                            </h4>
                            <p className="text-xs text-text-main leading-relaxed font-mono">
                              {activeScenarioLevel === 1 
                                ? "Você está fazendo um levantamento de projeto importante em uma sala com outros colegas de equipe. Um deles (Lincoln) começa a balançar e navegar ativamente pelo celular, desviando o foco e não prestando atenção." 
                                : "Você está encarregado de relatar planilhas financeiras ao seu superior imediato. Ele cruza os braços, estala a língua e respira de forma sutilmente impaciente, esboçando deboche."}
                            </p>
                          </div>
                          
                          <div className="p-3.5 bg-bg-deep rounded-xl text-xs text-text-dim border border-border-subtle font-mono text-left">
                            <span className="font-bold text-sky-400 block mb-1">Como começar o treinamento:</span>
                            Nós praticaremos primeiro a sua <span className="font-bold text-white">Postura Física Não-Verbal</span>, depois construiremos a sua <span className="font-bold text-white">Fala Assertiva</span>.
                          </div>

                          <button
                            onClick={() => setSimulationStep("posture")}
                            className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                          >
                            Entrar no Cenário e Configurar Postura
                          </button>
                        </div>
                      )}

                      {/* Step Posture configuration */}
                      {simulationStep === "posture" && (
                        <div className="space-y-6">
                          <div className="bg-bg-deep/60 p-4 rounded-xl border border-border-subtle flex items-center gap-3">
                            <User className="w-10 h-10 text-sky-400 flex-shrink-0" />
                            <div>
                              <h5 className="font-semibold text-xs uppercase font-mono text-text-dim">Componente 1: Regulação Não-Verbal</h5>
                              <p className="text-[11px] text-text-main">
                                Ajuste os parâmetros biológicos do corpo de {patient.name} para restaurar sua regulação corporal (hesitação corporal submissa).
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                            <button
                              onClick={() => setPostureAprumar(!postureAprumar)}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition h-14 ${
                                postureAprumar 
                                  ? "bg-sky-500/10 border-sky-400 text-sky-300 font-semibold" 
                                  : "bg-bg-deep border-border-subtle text-text-dim hover:bg-white/10/40"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                postureAprumar ? "border-sky-400 bg-sky-400 text-text-main" : "border-slate-700 text-transparent"
                              }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-[11px] block">Alinear Espinha (Aprumar-se)</span>
                                <span className="text-[9px] text-text-dim font-mono">Sentar-se ereto na cadeira</span>
                              </div>
                            </button>

                            <button
                              onClick={() => setPostureOmbros(!postureOmbros)}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition h-14 ${
                                postureOmbros 
                                  ? "bg-sky-500/10 border-sky-400 text-sky-300 font-semibold" 
                                  : "bg-bg-deep border-border-subtle text-text-dim hover:bg-white/10/40"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                postureOmbros ? "border-sky-400 bg-sky-400 text-text-main" : "border-slate-700 text-transparent"
                              }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-[11px] block">Ombros para Trás</span>
                                <span className="text-[9px] text-text-dim font-mono">Postura aberta de confiança</span>
                              </div>
                            </button>

                            <button
                              onClick={() => setPostureQueixo(!postureQueixo)}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition h-14 ${
                                postureQueixo 
                                  ? "bg-sky-500/10 border-sky-400 text-sky-300 font-semibold" 
                                  : "bg-bg-deep border-border-subtle text-text-dim hover:bg-white/10/40"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                postureQueixo ? "border-sky-400 bg-sky-400 text-text-main" : "border-slate-700 text-transparent"
                              }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-[11px] block">Queixo Neutro/Erguido</span>
                                <span className="text-[9px] text-text-dim font-mono">Altivo na medida certa, sem arrogância</span>
                              </div>
                            </button>

                            <button
                              onClick={() => setPostureOlhar(!postureOlhar)}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition h-14 ${
                                postureOlhar 
                                  ? "bg-sky-500/10 border-sky-400 text-sky-300 font-semibold" 
                                  : "bg-bg-deep border-border-subtle text-text-dim hover:bg-white/10/40"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                postureOlhar ? "border-sky-400 bg-sky-400 text-text-main" : "border-slate-700 text-transparent"
                              }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-[11px] block">Contato Visual Direto</span>
                                <span className="text-[9px] text-text-dim font-mono">Olhar nos olhos do interlocutor</span>
                              </div>
                            </button>

                            <button
                              onClick={() => setPostureVoz(!postureVoz)}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition h-14 sm:col-span-2 max-w-xs mx-auto w-full ${
                                postureVoz 
                                  ? "bg-sky-500/10 border-sky-400 text-sky-300 font-semibold" 
                                  : "bg-bg-deep border-border-subtle text-text-dim hover:bg-white/10/40"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                postureVoz ? "border-sky-400 bg-sky-400 text-text-main" : "border-slate-700 text-transparent"
                              }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-[11px] block">Tom de Voz Firme & Audível</span>
                                <span className="text-[9px] text-text-dim font-mono">Volume claro, sem gaguejar ou hesitar</span>
                              </div>
                            </button>
                          </div>

                          <div className="flex justify-end pt-4">
                            <button
                              disabled={!postureAprumar && !postureOmbros && !postureQueixo && !postureOlhar && !postureVoz}
                              onClick={() => setSimulationStep("speech")}
                              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-text-main font-bold text-xs rounded-xl transition"
                            >
                              Confirmar Ajuste Físico e Avançar para Fala
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step Speech Selection / Custom writing */}
                      {simulationStep === "speech" && (
                        <div className="space-y-6">
                          <div className="bg-bg-deep/60 p-4 rounded-xl border border-border-subtle flex items-center gap-3">
                            <MessagesSquare className="w-10 h-10 text-violet-400 flex-shrink-0" />
                            <div>
                              <h5 className="font-semibold text-xs uppercase font-mono text-text-dim">Componente 2: Construção do Conteúdo Verbal</h5>
                              <p className="text-[11px] text-text-main">
                                Escolha o roteiro verbal de {patient.name} ou opte pelo <span className="text-violet-400">Espaço de Prática Livre (Customizada)</span> para formulação pessoal baseado em evidências.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Option list */}
                            <div className="space-y-3">
                              <h6 className="text-[10px] font-bold uppercase font-mono text-text-dim">Preset Clinicamente Disponíveis:</h6>
                              
                              <button
                                onClick={() => setVerbalStyle("passive")}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                                  verbalStyle === "passive" ? "bg-slate-800 border-slate-700" : "bg-bg-deep border-border-subtle text-text-dim"
                                }`}
                              >
                                <span className="font-bold block text-amber-500">Roteiro 1 (Passivo/Inseguro):</span>
                                {activeScenarioLevel === 1 
                                  ? '"É... Lincoln... você tá... muito culpado aí no celular?"' 
                                  : '"Ah... me perdoe, eu posso repassar isso outra hora caso você esteja de saco cheio..."'}
                              </button>

                              <button
                                onClick={() => setVerbalStyle("aggressive")}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                                  verbalStyle === "aggressive" ? "bg-slate-800 border-slate-700" : "bg-bg-deep border-border-subtle text-text-dim"
                                }`}
                              >
                                <span className="font-bold block text-red-500">Roteiro 2 (Agressivo/Reativo):</span>
                                {activeScenarioLevel === 1 
                                  ? '"Lincoln, guarda essa bosta de celular e presta atenção, eu passei a noite preparando isso!"' 
                                  : '"Por que você tá balançando a cabeça? Se acha superior por acaso?"'}
                              </button>

                              <button
                                onClick={() => setVerbalStyle("assertive")}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                                  verbalStyle === "assertive" ? "bg-slate-800 border-emerald-700" : "bg-bg-deep border-border-subtle text-text-dim"
                                }`}
                              >
                                <span className="font-bold block text-emerald-400">Roteiro 3 (Assertivo/PDP):</span>
                                {activeScenarioLevel === 1 
                                  ? '"Lincoln, preciso da sua atenção plena nesta reunião. Esta é uma prioridade técnica e sua contribuição é importante para a equipe. Por favor, guarde seu celular."' 
                                  : '"Diretor, percebo pela sua expressão que algo no que estou apresentando não está agradando ou parece incorreto. Gostaria muito de ouvir seu feedback estruturado."'}
                              </button>

                              <button
                                onClick={() => setVerbalStyle("custom")}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                                  verbalStyle === "custom" ? "bg-slate-800 border-purple-700" : "bg-bg-deep border-border-subtle text-text-dim"
                                }`}
                              >
                                <span className="font-bold block text-purple-400">Roteiro Personalizado (Prática Livre):</span>
                                Digite suas próprias frases no editor do painel lateral.
                              </button>
                            </div>

                            {/* Free Speech Typing */}
                            <div className="bg-bg-deep p-4 rounded-xl border border-border-subtle flex flex-col justify-between">
                              <div>
                                <h6 className="text-[10px] font-bold uppercase font-mono text-text-dim mb-2">Editor Clínico Livre</h6>
                                <p className="text-[10px] text-text-dim mb-3">
                                  {activeScenarioLevel === 1 
                                    ? "Combine: Expressão Direta (Nome do colega, requerimento) + Justificativa Racional (Prioridade, equipe) + Pedido Específico (Polidez, guardar celular)."
                                    : "Combine: Observação do implícito (Linguagem corporal do superior) + Chamamento diplomático no campo explícito + Convite ao diálogo."}
                                </p>
                                <textarea
                                  disabled={verbalStyle !== "custom"}
                                  value={customText}
                                  onChange={(e) => setCustomText(e.target.value)}
                                  rows={5}
                                  className="w-full bg-bg-deep border border-border-subtle rounded-lg p-2.5 text-xs text-text-main outline-none focus:border-purple-500 resize-none font-mono placeholder-slate-600 disabled:opacity-40"
                                  placeholder="Digite seu script de voz baseado em evidências aqui..."
                                />
                              </div>
                              
                              <div className="text-[9px] text-text-dim font-mono italic mt-2">
                                Pratiar escrevendo força o córtex pré-frontal dorso-lateral a encontrar novos caminhos de comunicação ativa sob cortisol.
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-4">
                            <button
                              onClick={submitSpeech}
                              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-text-main font-bold text-xs rounded-xl shadow-md transition"
                            >
                              Finalizar Treino & Processar Feedback Clínico
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step FEEDBACK SCREEN WITH AUDITED METRICS */}
                      {simulationStep === "feedback" && (
                        <div className="space-y-6">
                          <div className="text-center max-w-xl mx-auto py-4 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-primary/10 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-400/30">
                              <Award className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-white">Treinamento Clínico Concluído</h4>
                            <p className="text-xs text-text-dim font-mono">
                              As conexões de comportamento passivo foram inibidas funcionalmente com sucesso neste roleplaying!
                            </p>
                          </div>

                          {/* Scores row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-bg-deep p-5 rounded-xl border border-border-subtle space-y-3">
                              <span className="text-[10px] font-bold uppercase font-mono text-text-dim">Fisiologia Não-Verbal</span>
                              <div className="flex items-center justify-between">
                                <span className="text-3xl font-black text-sky-400">{evaluatePostureScore()}%</span>
                                <span className="text-xs text-text-dim font-semibold">{evaluatePostureScore() === 100 ? "Postura Inabalável" : "Necessita Ajuste de Ombros"}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-400" style={{ width: `${evaluatePostureScore()}%` }} />
                              </div>
                              <div className="grid grid-cols-5 text-[9px] font-mono text-center text-text-dim mt-2">
                                <span className={postureAprumar ? "text-sky-400" : ""}>Espina</span>
                                <span className={postureOmbros ? "text-sky-400" : ""}>Ombros</span>
                                <span className={postureQueixo ? "text-sky-400" : ""}>Queixo</span>
                                <span className={postureOlhar ? "text-sky-400" : ""}>Olhar</span>
                                <span className={postureVoz ? "text-sky-400" : ""}>Voz</span>
                              </div>
                            </div>

                            <div className="bg-bg-deep p-5 rounded-xl border border-border-subtle space-y-3">
                              <span className="text-[10px] font-bold uppercase font-mono text-text-dim">Roteiro de Fala Assertiva</span>
                              <div className="flex items-center justify-between">
                                <span className="text-3xl font-black text-violet-400">{getVerbalFeedbackScore()}%</span>
                                <span className="text-xs text-text-dim font-semibold">
                                  {getVerbalFeedbackScore() === 100 ? "Modelo Assertivo Perfeito" : 
                                   getVerbalFeedbackScore() >= 70 ? "Bom Roteiro de Evidência" : "Tom Passivo/Agressivo Alto"}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-400" style={{ width: `${getVerbalFeedbackScore()}%` }} />
                              </div>
                              <p className="text-[10px] text-text-dim leading-snug pt-1">
                                {verbalStyle === "assertive" && "O modelo atóxico de confrontação pacífica de Lincoln funciona reduzindo a ansiedade do interlocutor e garantindo o seu respeito."}
                                {verbalStyle === "passive" && "Roteiros passivos de hesitação tendem a induzir desconsideração no interlocutor, retroalimentando as crenças centrais de inadequação do paciente."}
                                {verbalStyle === "aggressive" && "Padrões agressivos de reatividade de raiva ativam o sistema defensivo imediato do interlocutor, provocando conflitos estéreis e hostis."}
                                {verbalStyle === "custom" && "O editor identificou os delimitadores de priorização técnica e polidez em sua fala. Excelente engajamento frontal!"}
                              </p>
                            </div>
                          </div>

                          <div className="bg-bg-deep p-5 rounded-xl border border-border-subtle">
                            <span className="text-[10px] font-bold uppercase font-mono text-text-dim">Feedback Neurobiológico:</span>
                            <p className="text-xs text-text-main mt-2 leading-relaxed">
                              Ao treinar o posicionamento diplomático no cenário de nível {activeScenarioLevel}, você consolidou a regulação cortical do Cingulado Anterior e ajudou {patient.name} a enfraquecer o seu <span className="font-bold text-sky-400">Esquema de {patient.activeSchemas?.[0] || "Fracasso"}</span> e desarmar o comportamento desadaptativo de evitação. Repetir esse treino reconfigura a resposta límbicas automática a gatilhos.
                            </p>
                          </div>

                          {/* Action footer */}
                          <div className="flex justify-end pt-4 gap-2">
                            <button
                              onClick={() => { resetSimulation(); setActiveScenarioLevel(null); }}
                              className="px-5 py-2 border border-border-subtle text-text-main hover:bg-white/10 text-xs font-bold rounded-lg transition"
                            >
                              Voltar Seleção de Níveis
                            </button>
                            <button
                              onClick={() => { resetSimulation(); }}
                              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-text-main hover:opacity-90 text-xs font-bold rounded-lg transition"
                            >
                              Praticar Novamente
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              ) : (
                /* --- DYNAMIC INTERACTIVE NEUROSCIENCE SUB-MODULES --- */
                <div className="space-y-6">
                  
                  {/* --- MODULE 1: AUTORREGULAÇÃO EMOCIONAL (BREATHING & BIOFEEDBACK) --- */}
                  {selectedHp === PsychologicalSkill.AutorregulacaoEmocional && (
                    <div className="space-y-6">
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3">
                        <Activity className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-primary font-mono">Simulador de Biofeedback Cardio-Respiratório e Ativação do Nervo Vago</h4>
                          <p className="text-[11px] text-text-dim mt-1 leading-relaxed">
                            A respiração diafragmática ativa o sistema respiratório de {patient.name} e estimula diretamente as fibras do <strong>Nervo Vago</strong>. Isso reverte a descarga de adrenalina do estresse agudo, reduzindo a taquicardia basolímbica e elevando a Variabilidade de Frequência Cardíaca (VFC/HRV), promovendo uma sensação física imediata de relaxamento estável (Páginas 158-161 do material).
                          </p>
                        </div>
                      </div>

                      {!breathingActive && breathingPhase !== "completed" && (
                        <div className="p-6 bg-bg-card border border-border-subtle rounded-2xl max-w-xl mx-auto text-center space-y-4 shadow-sm">
                          <Wind className="w-12 h-12 text-primary mx-auto animate-pulse" />
                          <div>
                            <h5 className="font-bold text-text-main text-sm">Exercício Clínico: Respiração Abdominal Síncrona</h5>
                            <p className="text-xs text-text-dim max-w-sm mx-auto mt-1 leading-relaxed">
                              Realizaremos 3 ciclos respiratórios de 15 segundos cada (5s Inspiração, 5s Retenção, 5s Expiração lenta). Monitore a adaptação autônoma abaixo.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              resetBreathingSim();
                              setBreathingActive(true);
                            }}
                            className="px-6 py-2.5 bg-bg-deep hover:bg-white/10 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 mx-auto"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" /> Iniciar Treino de Biofeedback
                          </button>
                        </div>
                      )}

                      {(breathingActive || breathingPhase === "completed") && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Left: Breathing Balloon Animation panel */}
                          <div className="bg-bg-deep border border-border-subtle p-6 rounded-2xl flex flex-col items-center justify-center text-center text-white space-y-6 shadow-lg min-h-[340px]">
                            <span className="text-[10px] font-mono font-bold uppercase text-primary bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                              Fase de Respiração Ativa
                            </span>

                            {breathingActive ? (
                              <div className="space-y-4 flex flex-col items-center">
                                {/* The Balloon element with visual transitions */}
                                <div 
                                  className={`w-28 h-28 rounded-full bg-gradient-to-tr flex items-center justify-center text-xs font-bold font-mono transition-all duration-1000 ${
                                    breathingPhase === "inhale" 
                                      ? "from-sky-500/20 to-sky-500/40 border-2 border-sky-400 text-sky-300 scale-[1.3] shadow-[0_0_40px_rgba(56,189,248,0.4)]" 
                                      : breathingPhase === "retain"
                                      ? "from-purple-500/20 to-purple-500/40 border-2 border-purple-400 text-purple-300 scale-[1.3] shadow-[0_0_50px_rgba(167,139,250,0.5)] animate-pulse"
                                      : "from-blue-500/10 to-blue-500/25 border-2 border-blue-500/70 text-blue-300 scale-[0.8] shadow-none"
                                  }`}
                                >
                                  {breathingPhase === "inhale" && "5s"}
                                  {breathingPhase === "retain" && "5s"}
                                  {breathingPhase === "exhale" && "5s"}
                                </div>

                                <div className="space-y-1">
                                  <h3 className="text-base font-black tracking-widest uppercase">
                                    {breathingPhase === "inhale" && "Inspirar Ar..."}
                                    {breathingPhase === "retain" && "Reter Prateleira..."}
                                    {breathingPhase === "exhale" && "Expirar Lento..."}
                                  </h3>
                                  <p className="text-[10px] text-text-dim font-mono">
                                    Ciclo: {breathingCyclesCompleted + 1}/3 | Cronômetro: {breathingTime}s
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                                  <Check className="w-8 h-8" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-sm text-emerald-400">Cardio-Sincronia Estabelecida!</h5>
                                  <p className="text-[10px] text-text-dim leading-relaxed font-mono max-w-xs mt-1">
                                    O tônus parassimpático inibiu com êxito a reatividade límbica de {patient.name}. As tensões viscerais e amigdalares somatossensoriais de fuga recuaram (+150 XP adicionado ao prontuário!).
                                  </p>
                                </div>
                                <button
                                  onClick={resetBreathingSim}
                                  className="px-4 py-1.5 bg-slate-800 text-text-main hover:text-white rounded border border-slate-700 text-[10px] font-bold transition mx-auto flex items-center gap-1.5"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> Praticar Novamente
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Right side: Autonomous and EEG Biofeedback panels */}
                          <div className="lg:col-span-2 space-y-4">
                            
                            {/* Autonomic Cardiovascular System Monitor */}
                            <div className="bg-bg-deep p-5 rounded-2xl border border-border-subtle space-y-4">
                              <span className="text-[10px] font-mono text-text-dim font-bold uppercase tracking-wider block">
                                Terminal de Biofeedback Somrossensorial (SNA)
                              </span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1 border-r border-border-subtle/80 pr-2">
                                  <span className="text-[10px] text-text-dim block font-mono">Frequência Cardíaca:</span>
                                  <div className="flex items-baseline gap-1">
                                    <Heart className="w-4 h-4 text-rose-500 animate-pulse flex-shrink-0" />
                                    <span className="text-2xl font-black text-rose-400 font-mono">{biofeedbackHeartRate}</span>
                                    <span className="text-[10px] text-text-dim font-mono">BPM</span>
                                  </div>
                                </div>

                                <div className="space-y-1 border-r border-border-subtle/80 pr-2">
                                  <span className="text-[10px] text-text-dim block font-mono">Nível de Cortisol Ativo:</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-orange-400 font-mono">
                                      {breathingPhase === "completed" ? "Mínimo" : breathingPhase === "exhale" ? "Diminuindo" : "Estável"}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[10px] text-text-dim block font-mono">HRV (Variabilidade VFC):</span>
                                  <div className="flex items-baseline gap-1">
                                    <Activity className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span className="text-2xl font-black text-emerald-400 font-mono">{biofeedbackHRV}</span>
                                    <span className="text-[10px] text-text-dim font-mono">ms</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-2">
                                <div>
                                  <div className="flex justify-between text-[11px] font-mono mb-1">
                                    <span className="text-emerald-400">Atividade Parassimpática (Nervo Vago):</span>
                                    <span className="font-bold text-emerald-300">{biofeedbackPNS}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${biofeedbackPNS}%` }} />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between text-[11px] font-mono mb-1">
                                    <span className="text-red-400">Atividade Simpática (Luta/Fuga):</span>
                                    <span className="font-bold text-red-300">{biofeedbackSNS}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-400 transition-all duration-1000" style={{ width: `${biofeedbackSNS}%` }} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* EEG Brainwaves Monitor panel */}
                            <div className="bg-bg-deep p-5 rounded-2xl border border-border-subtle space-y-3">
                              <span className="text-[10px] font-mono text-text-dim font-bold uppercase tracking-wider block">
                                Sinais de EEG e Ondas Cerebrais Clínicas (Biofeedback)
                              </span>

                              <div className="grid grid-cols-3 gap-3 pt-1">
                                <div className="bg-bg-deep border border-border-subtle/60 p-3 rounded-xl">
                                  <span className="text-[10px] text-text-dim block font-mono">Ondas Beta (Estresse):</span>
                                  <span className="text-base font-bold font-mono text-amber-500">{biofeedbackBeta.toFixed(1)} Hz</span>
                                  <p className="text-[9px] text-text-dim mt-1 font-mono leading-tight">Beta alto indica arousal e ansiedade severa.</p>
                                </div>

                                <div className="bg-bg-deep border border-border-subtle/60 p-3 rounded-xl">
                                  <span className="text-[10px] text-text-dim block font-mono">Ondas Alfa (Calma):</span>
                                  <span className="text-base font-bold font-mono text-primary">{biofeedbackAlfa.toFixed(1)} Hz</span>
                                  <p className="text-[9px] text-text-dim mt-1 font-mono leading-tight">Alfa cresce sob calmaria de olhos suspensos.</p>
                                </div>

                                <div className="bg-bg-deep border border-border-subtle/60 p-3 rounded-xl">
                                  <span className="text-[10px] text-text-dim block font-mono">Ondas Theta (Imaginação):</span>
                                  <span className="text-base font-bold font-mono text-violet-400">{biofeedbackTheta.toFixed(1)} Hz</span>
                                  <p className="text-[9px] text-text-dim mt-1 font-mono leading-tight">Theta indica profunda integração de memórias.</p>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- MODULE 2: AUTOCONHECIMENTO (SOCRATIC RESTRUCTURING BOARD) --- */}
                  {selectedHp === PsychologicalSkill.Autoconhecimento && (
                    <div className="space-y-6">
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3">
                        <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-primary font-mono">Mural de Reestruturação Socrática (Circuito Córtico-Límbico)</h4>
                          <p className="text-[11px] text-text-dim mt-1 leading-relaxed">
                            O Córtex Pré-frontal Dorsolateral (dlPFC) e o vmPFC são fundamentais para inibir a Amígdala hiperativa. Desafiar as distorções cognitivas através de questionamentos socráticos recruta estas conexões corticais de modulação consciente (Páginas 162-165 do material).
                          </p>
                        </div>
                      </div>

                      {!socraticSubmitted ? (
                        <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl space-y-4 max-w-2xl mx-auto shadow-sm">
                          <h5 className="font-bold text-text-main text-sm border-b pb-2">Exercício Clínico: Desafiar Pensamentos Automáticos</h5>
                          
                          <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                              <label className="block font-bold text-text-dim font-mono uppercase text-[10px]">1. Escolher Pensamento Automático Disfuncional</label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSocraticThought("Se eu gaguejar ou falhar na reunião técnica de amanhã, todos confirmarão que sou uma fraude e serei vergonhosamente demitido.")}
                                  className="p-2.5 bg-bg-sidebar border border-border-subtle text-text-main hover:border-indigo-400 text-left rounded-lg text-[11px] font-mono leading-snug cursor-pointer flex-1"
                                >
                                  Usar Prontuário de {patient.name}: <span className="text-primary underline">"{patient.beliefs?.automaticThoughts?.[0] || "Se eu gaguejar na reunião, todos confirmarão que sou..."}"</span>
                                </button>
                                <button
                                  onClick={() => setSocraticThought("")}
                                  className="px-3 bg-bg-sidebar/60 hover:bg-bg-sidebar text-text-dim rounded-lg text-[10px] font-bold"
                                >
                                  Limpar
                                </button>
                              </div>
                              <textarea
                                value={socraticThought}
                                onChange={(e) => setSocraticThought(e.target.value)}
                                rows={3}
                                className="w-full p-2.5 bg-bg-sidebar border border-border-subtle rounded-lg font-mono focus:border-primary outline-none text-text-main"
                                placeholder="Se preferir, digite outro pensamento de autoavaliação inadequada aqui..."
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-text-dim font-mono uppercase text-[10px]">2. Identificar a Categoria da Distorção Cognitiva (Mapa do livro - Pág 162)</label>
                              <select
                                value={socraticSelectedDistortion}
                                onChange={(e) => setSocraticSelectedDistortion(e.target.value)}
                                className="w-full bg-bg-sidebar border border-border-subtle rounded-lg p-2.5 outline-none focus:border-primary text-text-main font-mono"
                              >
                                <option value="Catastrofização">Catastrofização (Acreditar no pior cenário impossível)</option>
                                <option value="Leitura de Mente">Leitura de Mente (Presumir desdém ou julgamento dos outros sem provas)</option>
                                <option value="Previsão do Futuro">Previsão do Futuro (Prever resultados negativos de forma imutável)</option>
                                <option value="Rotulação">Rotulação (Atribuir rótulos globais severos a si)</option>
                                <option value="Filtro Negativo">Filtro Negativo (Desqualificar os ganhos positivos e focar só no erro)</option>
                                <option value="Deveria Rigido">"Deveria" Rígido (Padrões inflexíveis de cobrança existencial)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <label className="block font-bold text-text-dim font-mono uppercase text-[10px]">3. Escrever Pensamento Alternativo Reestruturado</label>
                                <span className="text-[9px] text-primary font-mono font-bold uppercase animate-pulse">Use o Direito de Ser Falível!</span>
                              </div>
                              <p className="text-[10px] text-text-dim italic mb-2 leading-tight">
                                Gaguejar não desqualifica minha capacidade. Tenho o direito básico de errar de forma honesta, continuar aprendendo e propor minhas ideias de forma profissional.
                              </p>
                              <textarea
                                value={socraticRestructuredText}
                                onChange={(e) => setSocraticRestructuredText(e.target.value)}
                                rows={3}
                                className="w-full p-2.5 bg-bg-sidebar border border-border-subtle rounded-lg font-mono focus:border-primary outline-none text-text-main"
                                placeholder="Qual a evidência real disso? Escreva a alternativa realista aqui..."
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              disabled={!socraticThought.trim() || !socraticRestructuredText.trim()}
                              onClick={() => {
                                setSocraticSubmitted(true);
                                onAwardXp(120);
                                onAddLog(
                                  `Processou Reestruturação Socrática sobre o Esquema de Fracasso. Classificação: ${socraticSelectedDistortion}. Pensamento saudável inibiu cortisol e reatividade amigdalar. Ganhou +120 XP.`,
                                  95,
                                  90,
                                  80
                                );
                              }}
                              className="px-5 py-2.5 bg-primary text-bg-deep font-bold hover:bg-primary-hover text-bg-deep font-bold disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                            >
                              <Brain className="w-4 h-4" /> Efetuar Reestruturação Córtico-Límbica
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Socratic feedback screen displaying live brain connection status with 4th Gen NLP AI Screening Engine */
                        <div className="bg-bg-deep p-6 border border-border-subtle rounded-2xl text-text-main space-y-6 shadow-xl leading-relaxed">
                          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
                            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                            <div>
                              <h5 className="font-extrabold text-sm text-white">NLP Neocortex v4 • Motor de Triagem de Linguagem e IA Clínica</h5>
                              <p className="text-[10px] text-text-dim font-mono uppercase">
                                Análise Semântica de Linguagem Natural Computacional sínclita
                              </p>
                            </div>
                          </div>

                          <div className="text-center py-2 space-y-1 max-w-sm mx-auto">
                            <div className="w-12 h-12 bg-primary text-bg-deep font-bold/10 border-2 border-primary flex items-center justify-center rounded-full text-primary mx-auto text-sm font-bold font-mono">
                              NLP-4
                            </div>
                            <h6 className="font-bold text-xs text-white">Análise da Inibição Córtico-Límbica Socrática</h6>
                            <p className="text-[10px] text-text-dim font-mono">
                              O córtex de {patient.name} inibiu com firmeza o disparo límbico na fenda sináptica após desafio cognitivo!
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-bg-deep border border-border-subtle/80 p-4 rounded-xl space-y-2">
                              <span className="text-[10px] font-mono text-red-400 font-bold block uppercase tracking-wide">Pensamento Automático Original</span>
                              <p className="font-mono text-text-main italic">"{socraticThought}"</p>
                              <div className="inline-block bg-red-950 text-red-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase font-sans">
                                Distorção Primária: {socraticSelectedDistortion}
                              </div>
                            </div>

                            <div className="bg-bg-deep border border-emerald-950/60 p-4 rounded-xl space-y-2">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase tracking-wide">Discurso Saudável e Flexibilidade Socrática</span>
                              <p className="font-mono text-emerald-100 font-medium">"{socraticRestructuredText}"</p>
                              <div className="inline-block bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase font-sans">
                                Modelo Cognitivo Restaurado
                              </div>
                            </div>
                          </div>

                          {/* 🧠 4TH GEN NLP AI COMPUTATIONAL DISSECTION ENGINE BLOCK */}
                          {(() => {
                            const combinedText = (socraticThought + " " + socraticRestructuredText).toLowerCase();
                            
                            // 1. Relational Schema Marker Detection
                            let detectedSchema = "Esquema Ativo de Fracasso (Desvio por Evitação)";
                            let schemaRationals = `${patient.name} apresenta ativação do esquema de ${patient.activeSchemas?.[0] || "Fracasso"}.`;
                            if (combinedText.includes("defeito") || combinedText.includes("imperfeito") || combinedText.includes("vergonha") || combinedText.includes("farsa") || combinedText.includes("defectividade") || combinedText.includes("inadequado")) {
                              detectedSchema = "Esquema Ativo de Defectividade / Vergonha";
                              schemaRationals = "O discurso revela medo acentuado de humilhação por imperfeições percebidas em ambiente corporativo.";
                            } else if (combinedText.includes("perfeito") || combinedText.includes("deveria") || combinedText.includes("erro") || combinedText.includes("obrigação") || combinedText.includes("cobrar")) {
                              detectedSchema = "Esquema Ativo de Padrões Inflexíveis / Crítica Exagerada";
                              schemaRationals = "Uso denso de imperativos existenciais ('deveria', 'tenho que') demonstrando auto-exigência tóxica rígida.";
                            } else if (combinedText.includes("calar") || combinedText.includes("conter") || combinedText.includes("fingir") || combinedText.includes("fuga") || combinedText.includes("evitar")) {
                              detectedSchema = "Esquema de Inibição Emocional e Evitação";
                              schemaRationals = "O algoritmo NLP detectou tendência latente de suprimir sinais de afeto ou sentimentos na fenda sináptica.";
                            }

                            // 2. Visceral Distress Indicator calculation (keywords match)
                            const visceralKeywords = ["taquicardia", "coração", "tremer", "suor", "sufocado", "sufoco", "boca", "garganta", "tensão", "ombros", "doer", "peso", "aperto", "pânico", "terror", "medo", "nervoso"];
                            let visceralCount = 0;
                            visceralKeywords.forEach(kw => {
                              if (combinedText.includes(kw)) visceralCount++;
                            });

                            let distressLevel = "Mínimo (Excelente Regulação Vagal)";
                            let distressScore = 15;
                            let distressDesc = "A linguagem empregada não revela termos de correspondência somatosensorial aguda de luta ou fuga.";

                            if (visceralCount >= 3) {
                              distressLevel = "Severo (Alerta de Resposta Autônoma Simpática)";
                              distressScore = 85;
                              distressDesc = "PRESENÇA DE MARCADORES SOMÁTICOS AGUDOS. Termos de sufocamento, taquicardia ou tremor indicam que o medo do julgamento recruta reações simpáticas ativas ocultas em {patient.name}.";
                            } else if (visceralCount >= 1) {
                              distressLevel = "Moderado (Ativação de Stress Límbico)";
                              distressScore = 55;
                              distressDesc = "Instabilidade autonômica secundária evidente. {patient.name} descreve somatizações latentes sutilmente controladas.";
                            }

                            return (
                              <div className="p-4 bg-bg-deep rounded-xl border border-indigo-950/60 space-y-4 text-xs font-sans">
                                <span className="text-[10px] font-mono text-primary font-bold block uppercase tracking-wider">
                                  Laudo e Triagem do Motor de NLP e Inteligência Clínica
                                </span>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Relational Schema Marker Card */}
                                  <div className="bg-bg-deep p-3 rounded-lg border border-border-subtle space-y-1">
                                    <span className="text-[9px] uppercase font-bold text-text-dim font-mono">Marcador de Esquema Relacional de 4ª Geração</span>
                                    <div className="font-bold text-[11px] text-sky-400 font-mono">{detectedSchema}</div>
                                    <p className="text-[10px] text-text-dim italic leading-snug">{schemaRationals}</p>
                                  </div>

                                  {/* Visceral Distress Card */}
                                  <div className={`p-3 rounded-lg border space-y-1 ${
                                    distressScore >= 75 
                                      ? "bg-red-950/30 border-red-500/30" 
                                      : distressScore >= 40 
                                      ? "bg-amber-950/20 border-amber-500/20" 
                                      : "bg-bg-deep border-border-subtle"
                                  }`}>
                                    <span className="text-[9px] uppercase font-bold text-text-dim font-mono">Índice de Sofrimento Visceral Silencioso</span>
                                    <div className={`font-bold text-[11px] font-mono ${
                                      distressScore >= 75 ? "text-red-400 animate-pulse" : distressScore >= 40 ? "text-amber-400" : "text-emerald-400"
                                    }`}>{distressLevel} (Pontuação: {distressScore}%)</div>
                                    <p className="text-[10px] text-text-dim leading-snug">{distressDesc}</p>
                                  </div>
                                </div>

                                {/* Clinical Prediction Advice */}
                                <div className="p-3 bg-bg-deep rounded-lg border border-border-subtle space-y-1 text-[11px]">
                                  <span className="text-[9px] uppercase font-bold text-primary font-mono block">Raciocínio Clínico Preditivo do Assistente</span>
                                  <p className="text-text-main leading-relaxed">
                                    <strong>Predição Clínica:</strong> A alteração cognitiva proposta no socrático enfraquece o loop córtico-estriatal (Circuito CSTC de ruminação). Se o treino de inibição for continuado ({distressScore < 50 ? "adequado" : "forte estresse residual"}), {patient.name} tende a diminuir a dependência de atos de evitação ({patient.copingBehaviors?.[0] || "fuga"}) em até 4 semanas, restabelecendo o tônus vagal e reduzindo taquicardia em apresentações corporativas.
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="bg-bg-deep/50 p-4 border border-border-subtle rounded-xl space-y-3 text-xs leading-normal">
                            <span className="font-bold font-mono text-[10px] text-text-dim uppercase tracking-wider block">Acoplamento Sináptico de {patient.name}:</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-[11px] font-mono text-text-main">
                              <div className="p-2 border border-border-subtle rounded bg-bg-deep">
                                <span>Atividade dlPFC (Lógico):</span>
                                <span className="font-bold block text-sky-400 pt-0.5">98% (Excelente)</span>
                              </div>
                              <div className="p-2 border border-border-subtle rounded bg-bg-deep">
                                <span>Conexão GABAérgica:</span>
                                <span className="font-bold block text-pink-400 pt-0.5">Estabilizada (LTP)</span>
                              </div>
                              <div className="p-2 border border-border-subtle rounded bg-bg-deep">
                                <span>Capacidade de Refutar:</span>
                                <span className="font-bold block text-emerald-400 pt-0.5">Ativa</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={resetSocraticSim}
                              className="px-4 py-2 border border-border-subtle text-text-dim hover:text-white text-xs font-bold rounded-lg transition"
                            >
                              Fazer Nova Reestruturação
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- MODULE 3: IMUNIDADE SOCIAL (EXPOSURE & DESENSITIZATION) --- */}
                  {selectedHp === PsychologicalSkill.ImunidadeSocial && (
                    <div className="space-y-6">
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3">
                        <Sliders className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-primary font-mono">Pesquisa de Dessensibilização Sistemática e Exposição Controlada (Grade Wolpe)</h4>
                          <p className="text-[11px] text-text-dim mt-1 leading-relaxed">
                            A dessensibilização baseia-se na teoria do condicionamento clássico de Ivan Pavlov. Ao expor {patient.name} de forma progressiva a triggers sociais sob relaxamento fisiológico simultâneo, o cérebro opera uma "interferência", substituindo o engrama de fobia por uma memória neutra, consolidando LTD sináptico (Páginas 56-57, 166-169).
                          </p>
                        </div>
                      </div>

                      {selectedExposureIndex === null ? (
                        <div className="bg-bg-sidebar rounded-xl border border-border-subtle overflow-hidden shadow-sm">
                          <div className="p-4 bg-bg-card border-b font-mono text-[10px] uppercase font-bold text-text-dim">
                            Hierarquia Progressiva de Dessensibilização Social de {patient.name}
                          </div>
                          
                          <div className="divide-y text-xs select-none">
                            {exposureList.map((item, idx) => (
                              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg-card transition">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-text-main font-mono">Desafio #{idx + 1}</span>
                                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                                      idx >= 2 ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700"
                                    }`}>
                                      SUD Inicial: {item.initialSud}%
                                    </span>
                                  </div>
                                  <p className="text-text-dim font-medium leading-relaxed">{item.situation}</p>
                                </div>

                                <div className="flex items-center gap-4 flex-shrink-0">
                                  <div className="text-right">
                                    <span className="text-[10px] text-text-dim block font-mono">Desconforto Atual (SUD):</span>
                                    <span className={`text-sm font-black font-mono ${
                                      item.currentSud > 70 ? "text-red-500" : item.currentSud > 40 ? "text-orange-500" : "text-primary"
                                    }`}>
                                      {item.currentSud}% {item.currentSud < item.initialSud && "↓"}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setSelectedExposureIndex(idx);
                                      setExposureTimer(15);
                                      setExposureCurrentSud(item.currentSud);
                                      setExposureActive(false);
                                    }}
                                    className="px-4 py-2 bg-bg-deep hover:bg-white/10 text-white text-xs font-bold rounded-lg transition"
                                  >
                                    Treinar Exposição
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Active Controlled Exposure Screen showing visualization timer */
                        <div className="bg-bg-deep border border-border-subtle rounded-2xl p-6 text-text-main space-y-6 shadow-xl text-center">
                          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                            <span className="text-xs text-orange-400 font-mono font-bold uppercase tracking-wider">
                              Visualização Concorrente de Nível {selectedExposureIndex + 1}
                            </span>
                            <button
                              onClick={resetExposureSim}
                              className="text-xs text-text-dim hover:text-text-main outline-none bg-transparent border-0"
                            >
                              Voltar para Hierarquia
                            </button>
                          </div>

                          <div className="max-w-xl mx-auto space-y-4">
                            <h4 className="text-sm font-bold text-white leading-relaxed">
                              "{exposureList[selectedExposureIndex].situation}"
                            </h4>
                            <p className="text-xs text-text-dim leading-relaxed font-mono">
                              Imagine-se mentalmente no cenário acima. Pratique concomitantemente os ciclos lentos de respiração diafragmática para desviar a atividade simpática e cansar o condicionamento amigdalar.
                            </p>
                          </div>

                          {/* Interactive SUD slider */}
                          <div className="p-4 bg-bg-deep rounded-xl border border-border-subtle max-w-md mx-auto space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-text-dim">Escala de Desconforto Somático (SUD):</span>
                              <span className="font-bold text-orange-400">{exposureCurrentSud}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={exposureCurrentSud}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setExposureCurrentSud(val);
                                setExposureList(prev => {
                                  const nl = [...prev];
                                  nl[selectedExposureIndex] = { ...nl[selectedExposureIndex], currentSud: val };
                                  return nl;
                                });
                              }}
                              disabled={exposureActive}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 accent-active:accent-orange-600 disabled:opacity-40"
                            />
                            <div className="flex justify-between text-[9px] font-mono text-text-dim">
                              <span>0% (Calma Inabalada)</span>
                              <span>Pedi a {patient.name} feedback em tempo real</span>
                              <span>100% (Pânico Basal)</span>
                            </div>
                          </div>

                          {!exposureActive && exposureList[selectedExposureIndex].currentSud > 15 ? (
                            <div className="py-4">
                              <button
                                onClick={() => {
                                  setExposureActive(true);
                                }}
                                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2"
                              >
                                <Timer className="w-4 h-4 animate-spin" /> Iniciar Ciclo de Exposição Mental (15s)
                              </button>
                            </div>
                          ) : exposureActive ? (
                            <div className="space-y-3 py-4 max-w-sm mx-auto text-center">
                              <div className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin flex items-center justify-center text-xs font-mono text-orange-400 mx-auto">
                                {exposureTimer}s
                              </div>
                              <span className="text-[10px] text-text-dim font-mono italic block animate-pulse">
                                Re-consolidando memória terapêutica sob resiliência parassimpática (LTD ativo nas sinapses de medo)...
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-4 py-4 max-w-md mx-auto text-center">
                              <div className="w-12 h-12 rounded-full bg-primary/10 text-emerald-400 flex items-center justify-center mx-auto border border-primary/30">
                                <Check className="w-6 h-6" />
                              </div>
                              <div>
                                <h5 className="font-bold text-emerald-400 text-xs uppercase font-mono">Exposição Concluída com Sucesso!</h5>
                                <p className="text-[10px] text-text-dim mt-1 font-mono leading-normal">
                                  {patient.name} desestimulou o engrama de ansiedade correspondente, promovendo habituação fisiológica rápida (SUD atual reduzido de forma definitiva!).
                                </p>
                              </div>
                              <button
                                onClick={resetExposureSim}
                                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-text-main font-bold text-xs rounded-lg hover:opacity-90 transition mx-auto"
                              >
                                Voltar para Hierarquia de Medos
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- NEW MODULE 2: REALISMO OTIMISTA --- */}
                  {selectedHp === PsychologicalSkill.RealismoOtimista && (
                    <RealismoOtimistaExercise patient={patient} onAwardXp={onAwardXp} />
                  )}

                  {/* --- NEW MODULE 3: AUTOCONTROLE --- */}
                  {selectedHp === PsychologicalSkill.Autocontrole && (
                    <AutocontroleExercise patient={patient} onAwardXp={onAwardXp} />
                  )}

                  {/* --- NEW MODULE 4: SOCIABILIDADE --- */}
                  {selectedHp === PsychologicalSkill.Sociabilidade && (
                    <SociabilidadeExercise patient={patient} onAwardXp={onAwardXp} />
                  )}

                  {/* --- NEW MODULE 7: HEDONISMO RESPONSÁVEL --- */}
                  {selectedHp === PsychologicalSkill.HedonismoResponsavel && (
                    <HedonismoResponsavelExercise patient={patient} onAwardXp={onAwardXp} />
                  )}

                  {/* --- NEW MODULE 8: SENSIBILIDADE SOCIAL --- */}
                  {selectedHp === PsychologicalSkill.SensibilidadeSocial && (
                    <SensibilidadeSocialExercise patient={patient} onAwardXp={onAwardXp} />
                  )}

                  {/* --- NEW MODULE 9: AUTOESTIMA --- */}
                  {selectedHp === PsychologicalSkill.Autoestima && (
                    <AutoesteemExercise patient={patient} onAwardXp={onAwardXp} />
                  )}

                  {/* Fallback just in case */}
                  {(selectedHp as any) !== PsychologicalSkill.ResolutividadeEnfrentamento && 
                   (selectedHp as any) !== PsychologicalSkill.AutorregulacaoEmocional && 
                   (selectedHp as any) !== PsychologicalSkill.Autoconhecimento && 
                   (selectedHp as any) !== PsychologicalSkill.ImunidadeSocial && 
                   (selectedHp as any) !== PsychologicalSkill.RealismoOtimista && 
                   (selectedHp as any) !== PsychologicalSkill.Autocontrole && 
                   (selectedHp as any) !== PsychologicalSkill.Sociabilidade && 
                   (selectedHp as any) !== PsychologicalSkill.HedonismoResponsavel && 
                   (selectedHp as any) !== PsychologicalSkill.SensibilidadeSocial && 
                   (selectedHp as any) !== PsychologicalSkill.Autoestima && (
                    <div className="text-center p-8 bg-bg-card border border-dashed border-border-subtle rounded-xl space-y-4 max-w-xl mx-auto">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6 animate-spin text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-main">Ficha Técnica e Exercícios Clínicos</h4>
                        <p className="text-xs text-text-dim mt-1 font-mono">
                          O treino comportamental síncrono deste módulo ({selectedHp}) está em conformidade com as diretivas clínicas.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
