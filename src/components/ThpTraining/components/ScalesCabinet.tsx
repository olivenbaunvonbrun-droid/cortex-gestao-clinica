import React, { useState } from "react";
import { Patient } from "../types";
import { 
  ClipboardList, 
  Brain, 
  Zap, 
  Check, 
  ChevronRight, 
  Plus, 
  FileText, 
  Activity, 
  Play, 
  RotateCcw,
  Sparkles,
  Award
} from "lucide-react";

interface ScalesCabinetProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

// BAI Questions List
const baiQuestions = [
  "Formigamento ou dormência corporal",
  "Sensação de calor / Ondas de calor",
  "Tremores nas pernas",
  "Inabilidade para relaxar",
  "Medo de que aconteça o pior",
  "Atordoamento ou tontura",
  "Palpitação ou aceleração do coração",
  "Instabilidade física",
  "Sensação de pânico ou terror",
  "Nervosismo",
  "Sensação de sufocamento",
  "Tremores nas mãos",
  "Sensação de fragilidade ou fraqueza",
  "Medo de perder o controle",
  "Dificuldade para respirar",
  "Medo de morrer",
  "Susto ou sobressalto frequente",
  "Indigestão ou desconforto abdominal",
  "Desmaio ou sensação de desfalecimento",
  "Rubor facial / Pele quente",
  "Suores frios ou quentes não devidos ao clima"
];

// BDI Questions List
const bdiQuestions = [
  {
    title: "Tristeza",
    options: [
      "0: Não me sinto triste.",
      "1: Eu me sinto triste a maior parte do tempo.",
      "2: Estou sempre triste e não consigo sair disso.",
      "3: Estou tão triste ou infeliz que não consigo aguentar."
    ]
  },
  {
    title: "Pessimismo",
    options: [
      "0: Não estou desanimado quanto ao meu futuro.",
      "1: Sinto-me mais desanimado em relação ao futuro do que costumava estar.",
      "2: Não espero que as coisas funcionem para mim.",
      "3: Sinto que o futuro é sem esperança e que as coisas só vão piorar."
    ]
  },
  {
    title: "Sensação de Fracasso",
    options: [
      "0: Não me sinto um fracasso.",
      "1: Sinto que fracassei mais do que uma pessoa comum.",
      "2: Quando olho para trás, vejo muitos fracassos.",
      "3: Sinto que sou um fracasso total como pessoa."
    ]
  },
  {
    title: "Perda de Prazer",
    options: [
      "0: Obtenho tanto prazer quanto antes com as coisas de que gosto.",
      "1: Não gosto tanto das coisas como costumava gostar.",
      "2: Obtenho muito pouco prazer com as coisas de que costumava gostar.",
      "3: Não consigo obter nenhum prazer com as coisas que costumava gostar."
    ]
  },
  {
    title: "Sentimento de Culpa",
    options: [
      "0: Não me sinto especialmente culpado.",
      "1: Sinto-me culpado por muitas coisas que fiz ou deveria ter feito.",
      "2: Sinto-me bastante culpado na maior parte do tempo.",
      "3: Sinto-me culpado o tempo todo."
    ]
  },
  {
    title: "Autocobrança e Autodepreciação",
    options: [
      "0: Não me sinto desiludido comigo mesmo.",
      "1: Perdi a confiança em mim mesmo.",
      "2: Sinto-me desapontado comigo mesmo.",
      "3: Eu me odeio."
    ]
  },
  {
    title: "Ideação Suicida / Pensamentos Autolesivos",
    options: [
      "0: Não tenho pensamentos de me machucar ou me matar.",
      "1: Tenho pensamentos de me machucar, mas não os realizaria.",
      "2: Gostaria de me matar ou acabar com tudo de vez.",
      "3: Eu me mataria se tivesse a oportunidade certa."
    ]
  },
  {
    title: "Choro",
    options: [
      "0: Não choro mais do que o habitual.",
      "1: Choro mais agora do que costumava.",
      "2: Choro por qualquer coisa ou por pequenos motivos.",
      "3: Tenho vontade de chorar, mas não consigo."
    ]
  },
  {
    title: "Perda de Interesse",
    options: [
      "0: Não perdi o interesse pelas outras pessoas ou atividades.",
      "1: Sinto menos interesse pelos outros ou pelas coisas do que antes.",
      "2: Perdi a maior parte do interesse pelas pessoas ou atividades cotidianas.",
      "3: É difícil me interessar por qualquer coisa."
    ]
  },
  {
    title: "Indecisão",
    options: [
      "0: Tomo decisões tão bem como de costume.",
      "1: Acho mais difícil tomar decisões agora do que antes.",
      "2: Tenho muito mais dificuldade de tomar decisões agora do que costumava.",
      "3: Tenho dificuldade para tomar qualquer decisão."
    ]
  }
];

export default function ScalesCabinet({ patient, onUpdatePatient }: ScalesCabinetProps) {
  const [activeForm, setActiveForm] = useState<"NONE" | "BAI" | "BDI" | "COG_EF">("NONE");

  // Live scale submission states
  const [baiAnswers, setBaiAnswers] = useState<number[]>(new Array(21).fill(0));
  const [bdiAnswers, setBdiAnswers] = useState<number[]>(new Array(10).fill(0));

  // Cognitive Go/No-Go test state
  const [cogState, setCogState] = useState<"IDLE" | "PLAYING" | "COMPLETED">("IDLE");
  const [cogTarget, setCogTarget] = useState<"GREEN" | "RED">("GREEN");
  const [cogStimulusColor, setCogStimulusColor] = useState<string>("bg-primary");
  const [cogScoreMetrics, setCogScoreMetrics] = useState({
    totalTrials: 0,
    hits: 0,
    errors: 0,
    reactionTimes: [] as number[],
  });
  const [cogTimer, setCogTimer] = useState<any>(null);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);

  // Initialize scale history if not present
  const getScaleHistory = () => {
    if (patient.scaleHistory && patient.scaleHistory.length > 0) {
      return patient.scaleHistory;
    }
    // Presets ONLY for Pedro Silveira
    if (patient.id === "pedro-30" || patient.name?.toLowerCase().includes("pedro")) {
      return [
        { id: "s-1", date: "2026-05-10", type: "BAI" as const, score: 28, classification: "Ansiedade Grave" },
        { id: "s-2", date: "2026-05-10", type: "BDI" as const, score: 18, classification: "Depressão Leve" },
        { id: "s-3", date: "2026-05-24", type: "BAI" as const, score: 19, classification: "Ansiedade Moderada" }
      ];
    }
    return [];
  };

  const history = getScaleHistory();

  // Save new record
  const saveScaleRecord = (type: "BAI" | "BDI" | "COG_EF", score: number, classification: string, details?: any) => {
    const newRecord = {
      id: `scale-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type,
      score,
      classification,
      details
    };

    const currentHistory = patient.scaleHistory || getScaleHistory();
    const updatedPatient: Patient = {
      ...patient,
      scaleHistory: [newRecord, ...currentHistory],
      xp: patient.xp + 150 // Reward 150 XP for evaluations
    };

    if (updatedPatient.xp >= updatedPatient.level * 500) {
      updatedPatient.xp -= updatedPatient.level * 500;
      updatedPatient.level += 1;
    }

    onUpdatePatient(updatedPatient);
    setActiveForm("NONE");
    alert(`Sucesso! Teste computado sob sigilo clínico. Score: ${score} (${classification}). O paciente adquiriu +150 XP de neuroplasticidade.`);
  };

  // Compute BAI Answers
  const handleBaiValueChange = (index: number, val: number) => {
    const updated = [...baiAnswers];
    updated[index] = val;
    setBaiAnswers(updated);
  };

  const submitBAI = () => {
    const totalScore = baiAnswers.reduce((acc, curr) => acc + curr, 0);
    let classification = "Mínima";
    if (totalScore >= 8 && totalScore <= 15) classification = "Ansiedade Leve";
    else if (totalScore >= 16 && totalScore <= 25) classification = "Ansiedade Moderada";
    else if (totalScore >= 26) classification = "Ansiedade Grave";

    saveScaleRecord("BAI", totalScore, classification, { answers: baiAnswers });
    setBaiAnswers(new Array(21).fill(0));
  };

  // Compute BDI Answers
  const handleBdiValueChange = (index: number, val: number) => {
    const updated = [...bdiAnswers];
    updated[index] = val;
    setBdiAnswers(updated);
  };

  const submitBDI = () => {
    const totalScore = bdiAnswers.reduce((acc, curr) => acc + curr, 0);
    let classification = "Mínima";
    if (totalScore >= 14 && totalScore <= 19) classification = "Depressão Leve";
    else if (totalScore >= 20 && totalScore <= 28) classification = "Depressão Moderada";
    else if (totalScore >= 29) classification = "Depressão Grave";

    saveScaleRecord("BDI", totalScore, classification, { answers: bdiAnswers });
    setBdiAnswers(new Array(10).fill(0));
  };

  // Interactive Cognitive Go/No-Go digital controller
  const startCognitiveTest = () => {
    setCogState("PLAYING");
    setCogScoreMetrics({
      totalTrials: 0,
      hits: 0,
      errors: 0,
      reactionTimes: []
    });
    nextCognitiveStimulus(0);
  };

  const nextCognitiveStimulus = (trialCount: number) => {
    if (trialCount >= 10) {
      // Done with test
      setCogState("COMPLETED");
      return;
    }

    // Green is "GO" (click), Red is "NO-GO" (wait)
    const isGo = Math.random() > 0.35;
    const color = isGo ? "bg-primary" : "bg-red-500";
    setCogTarget(isGo ? "GREEN" : "RED");
    setCogStimulusColor(color);
    setStimulusStartTime(Date.now());

    const delay = 1200 + Math.random() * 800; // randomized interval

    const timer = setTimeout(() => {
      // If timeout finished and it was NO-GO (RED) and no click happened, that's a hit!
      setCogScoreMetrics(prev => {
        let isRedHit = !isGo; // NO CLICK on red is right
        return {
          ...prev,
          totalTrials: prev.totalTrials + 1,
          hits: isRedHit ? prev.hits + 1 : prev.hits,
          errors: isRedHit ? prev.errors : prev.errors + (isGo ? 1 : 0) // missed green is an error
        };
      });

      nextCognitiveStimulus(trialCount + 1);
    }, delay);

    setCogTimer(timer);
  };

  const handleCogUserClick = () => {
    if (cogState !== "PLAYING") return;
    
    // Clear timeout so we move immediately
    if (cogTimer) clearTimeout(cogTimer);

    const isCorrect = cogTarget === "GREEN"; // True click count
    const reaction = Date.now() - stimulusStartTime;

    setCogScoreMetrics(prev => {
      const nextRts = isCorrect ? [...prev.reactionTimes, reaction] : prev.reactionTimes;
      return {
        ...prev,
        totalTrials: prev.totalTrials + 1,
        hits: isCorrect ? prev.hits + 1 : prev.hits,
        errors: isCorrect ? prev.errors : prev.errors + 1,
        reactionTimes: nextRts
      };
    });

    nextCognitiveStimulus(cogScoreMetrics.totalTrials + 1);
  };

  const finalizeCognitiveTest = () => {
    // Score based on Hits and average reaction time
    const avgRt = cogScoreMetrics.reactionTimes.length > 0 
      ? Math.round(cogScoreMetrics.reactionTimes.reduce((a, b) => a + b, 0) / cogScoreMetrics.reactionTimes.length) 
      : 550;
    
    const accuracy = Math.round((cogScoreMetrics.hits / Math.max(1, cogScoreMetrics.totalTrials)) * 100);
    
    let classification = "Excelente";
    if (accuracy < 60) classification = "Controle Inibitório Prejudicado";
    else if (accuracy >= 60 && accuracy < 85) classification = "Controle Atencional Moderado";

    saveScaleRecord(
      "COG_EF", 
      accuracy, 
      classification, 
      { avgReactionTimeMs: avgRt, errorsCount: cogScoreMetrics.errors, hitsCount: cogScoreMetrics.hits }
    );

    setCogState("IDLE");
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction Card */}
      <div className="bg-bg-card rounded-2xl border border-border-subtle p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 md:max-w-2xl">
          <h3 className="text-sm font-black text-text-main flex items-center gap-1.5 uppercase font-mono">
            <ClipboardList className="w-5 h-5 text-primary" />
            Prateleira de Evidências Clínicas Seguras
          </h3>
          <p className="text-xs text-text-dim leading-relaxed">
            Diagnóstico baseado em dados quantitativos e evidências científicas de 4ª Geração. Monitore a ansiedade e depressão de {patient.name} utilizando escalas formais psicométricas validadas e conduza testes neurocognitivos do controle atencional em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveForm("BAI")}
            className="px-3.5 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Aplicar BAI
          </button>
          <button
            onClick={() => setActiveForm("BDI")}
            className="px-3.5 py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Aplicar BDI-II
          </button>
          <button
            onClick={() => setActiveForm("COG_EF")}
            className="px-3.5 py-2 bg-bg-sidebar hover:bg-bg-sidebar/5 border border-border-subtle text-text-main font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-primary" /> Teste Executivo
          </button>
        </div>
      </div>

      {/* RENDER FORMS */}
      {activeForm === "BAI" && (
        <div className="bg-bg-card rounded-2xl border border-border-subtle p-6 space-y-6 shadow-md animate-fade-in">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h4 className="font-extrabold text-text-main text-sm">Inventário de Ansiedade de Beck (BAI)</h4>
              <p className="text-[10px] text-text-dim font-mono uppercase">21 sintomas de ansiedade clínica</p>
            </div>
            <button
              onClick={() => setActiveForm("NONE")}
              className="text-xs font-bold text-text-dim hover:text-text-main cursor-pointer"
            >
              Fechar
            </button>
          </div>

          <p className="text-xs text-text-dim italic bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <strong>Instrução:</strong> Abaixo apresenta-se uma lista de sintomas comuns de ansiedade. Selecione o quanto {patient.name} tem sido incomodado por cada sintoma durante a **última semana**, incluindo o dia de hoje.
          </p>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
            {baiQuestions.map((q, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-bg-sidebar/40 rounded-xl border border-border-subtle gap-3 text-xs">
                <span className="font-medium text-text-main leading-snug">
                  {idx + 1}. {q}
                </span>

                <div className="flex items-center gap-1 text-[10px] font-semibold font-mono">
                  {[0, 1, 2, 3].map((val) => {
                    const label = ["Não incomodou", "Levemente", "Moderadamente", "Gravemente"][val];
                    const belongs = baiAnswers[idx] === val;
                    return (
                      <button
                        key={val}
                        onClick={() => handleBaiValueChange(idx, val)}
                        className={`px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                          belongs 
                            ? "bg-primary border-primary text-bg-deep font-bold shadow-sm" 
                            : "bg-bg-sidebar border-border-subtle hover:border-text-dim/35 text-text-dim"
                        }`}
                        title={label}
                      >
                        {val} - {label.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-border-subtle pt-4">
            <div className="font-mono text-xs">
              SOMA ATUAL: <span className="font-bold text-primary text-sm bg-primary/10 border border-primary/20 rounded px-2 py-1">{baiAnswers.reduce((a,b)=>a+b, 0)}</span>
              <span className="text-[10px] text-text-dim ml-2">
                (mínimo 0, máximo 63)
              </span>
            </div>
            <button
              onClick={submitBAI}
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase text-[10px] tracking-widest rounded-xl transition cursor-pointer shadow-md"
            >
              Registrar Pontuação e Consolidar BAI
            </button>
          </div>
        </div>
      )}

      {activeForm === "BDI" && (
        <div className="bg-bg-card rounded-2xl border border-border-subtle p-6 space-y-6 shadow-md animate-fade-in">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h4 className="font-extrabold text-text-main text-sm">Inventário de Depressão de Beck II (BDI-II)</h4>
              <p className="text-[10px] text-text-dim font-mono uppercase">Avaliação de sintomas cognitivos e afetivos</p>
            </div>
            <button
              onClick={() => setActiveForm("NONE")}
              className="text-xs font-bold text-text-dim hover:text-text-main cursor-pointer"
            >
              Fechar
            </button>
          </div>

          <p className="text-xs text-text-dim italic bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <strong>Instrução:</strong> Avalie as afirmações e o humor de {patient.name} escolhendo qual opção descreve melhor o estado dele na **última semana**.
          </p>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
            {bdiQuestions.map((q, qidx) => (
              <div key={qidx} className="p-4 bg-bg-sidebar/40 rounded-xl border border-border-subtle space-y-2 text-xs">
                <span className="font-bold font-mono text-primary block text-[11px] uppercase tracking-wide">
                  {qidx + 1}. {q.title}
                </span>

                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, oidx) => {
                    const isSelected = bdiAnswers[qidx] === oidx;
                    return (
                      <button
                        key={oidx}
                        onClick={() => handleBdiValueChange(qidx, oidx)}
                        className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer text-xs ${
                          isSelected 
                            ? "bg-amber-500/20 border-amber-500/40 font-semibold text-text-main shadow-sm" 
                            : "bg-bg-sidebar border-border-subtle hover:border-text-dim/35 text-text-dim"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-border-subtle pt-4">
            <div className="font-mono text-xs">
              SOMA ATUAL: <span className="font-bold text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">{bdiAnswers.reduce((a,b)=>a+b, 0)}</span>
              <span className="text-[10px] text-text-dim ml-2">
                (Escopo parcial mapeado para relevância relacional)
              </span>
            </div>
            <button
              onClick={submitBDI}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-bg-deep font-black uppercase text-[10px] tracking-widest rounded-xl transition cursor-pointer shadow-md"
            >
              Registrar Pontuação e Consolidar BDI-II
            </button>
          </div>
        </div>
      )}

      {activeForm === "COG_EF" && (
        <div className="bg-bg-card rounded-2xl border border-border-subtle p-6 space-y-6 shadow-md animate-fade-in">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h4 className="font-extrabold text-text-main text-sm">Teste Digital de Controle Atencional / Função Executiva</h4>
              <p className="text-[10px] text-text-dim font-mono uppercase">Go/No-Go Tópico Cognitivo</p>
            </div>
            <button
              onClick={() => {
                if (cogTimer) clearTimeout(cogTimer);
                setCogState("IDLE");
                setActiveForm("NONE");
              }}
              className="text-xs font-bold text-text-dim hover:text-text-main cursor-pointer"
            >
              Fechar
            </button>
          </div>

          <p className="text-xs text-text-dim leading-relaxed bg-bg-sidebar/40 p-3.5 border border-border-subtle rounded-xl">
            Este teste avalia o <strong>Controle Inibitório Pré-frontal (Inibição de Resposta Impulsiva)</strong> do paciente {patient.name}. É o sistema que inibe os rituais de fuga diante do gatilho social.<br />
            <strong>Instruções do Teste:</strong> Ao clicar em Iniciar, um círculo colorido aparecerá periodicamente.<br />
            - Se o círculo for <span className="font-bold text-primary">VERDE (GO)</span>: Clique imediatamente no botão do círculo ou pressione a tela.<br />
            - Se o círculo for <span className="font-bold text-red-500">VERMELHO (NO-GO)</span>: **NÃO CLIQUE**. Deixe o ciclo rodar.
          </p>

          <div className="p-8 bg-bg-deep rounded-2xl flex flex-col items-center justify-center text-center text-text-main min-h-[300px] gap-6 relative overflow-hidden border border-border-subtle">
            {cogState === "IDLE" && (
              <div className="space-y-4 max-w-sm">
                <Brain className="w-12 h-12 text-primary mx-auto animate-pulse" />
                <h5 className="font-semibold text-sm">Pronto para Testagem Síncrona</h5>
                <p className="text-[10px] text-text-dim font-mono leading-relaxed">
                  Realizaremos 10 ensaios dinâmicos consecutivos. Garanta foco do paciente {patient.name}.
                </p>
                <button
                  onClick={startCognitiveTest}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-bg-deep font-black uppercase text-[10px] tracking-widest rounded-xl transition cursor-pointer shadow-md mx-auto"
                >
                  Iniciar Testagem Executiva
                </button>
              </div>
            )}

            {cogState === "PLAYING" && (
              <div className="space-y-6 flex flex-col items-center w-full">
                <div className="text-[10px] font-mono text-text-dim">
                  Progresso: {cogScoreMetrics.totalTrials + 1} / 10 Ensaios
                </div>

                {/* Stimulus Circle */}
                <button
                  onClick={handleCogUserClick}
                  className={`w-32 h-32 rounded-full cursor-pointer transition-all duration-150 transform hover:scale-105 active:scale-95 flex items-center justify-center text-text-main font-black tracking-widest text-xs border-4 border-white ${cogStimulusColor}`}
                >
                  {cogTarget === "GREEN" ? "CLIQUE!" : "AGUARDE!"}
                </button>

                <p className="text-[10px] text-text-dim font-mono">
                  Clique apenas se Verde!
                </p>

                {/* Live Scores Panel */}
                <div className="flex gap-4 font-mono text-[10px] bg-bg-sidebar px-4 py-2 rounded-lg border border-border-subtle">
                  <div>Acertos: <span className="font-bold text-emerald-400">{cogScoreMetrics.hits}</span></div>
                  <div>Erros: <span className="font-bold text-red-500">{cogScoreMetrics.errors}</span></div>
                </div>
              </div>
            )}

            {cogState === "COMPLETED" && (
              <div className="space-y-5 max-w-md text-center">
                <div className="w-12 h-12 bg-bg-sidebar border border-primary rounded-full flex items-center justify-center mx-auto text-primary">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-primary">Varredura Cognitiva de {patient.name} Concluída!</h5>
                  <p className="text-xs text-text-dim leading-relaxed font-mono max-w-sm mx-auto mt-1">
                    Análise computada: {cogScoreMetrics.hits} acertos de {cogScoreMetrics.totalTrials} ensaios.<br />
                    Média de tempo de reação premotor: {cogScoreMetrics.reactionTimes.length > 0 ? Math.round(cogScoreMetrics.reactionTimes.reduce((a,b)=>a+b,0)/cogScoreMetrics.reactionTimes.length) : 0} ms.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left font-mono text-[10px] bg-bg-sidebar p-4 rounded-xl border border-border-subtle">
                  <div>Taxa de Acerto: <span className="font-bold text-primary">{Math.round((cogScoreMetrics.hits / cogScoreMetrics.totalTrials) * 100)}%</span></div>
                  <div>Erros de Impulso: <span className="font-bold text-red-400">{cogScoreMetrics.errors}</span></div>
                  <div>Inibição da via Red: <span className="text-text-main">Estabilizada</span></div>
                  <div>Variação de Flexibilidade:<span className="font-bold text-emerald-400"> Alta</span></div>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => setCogState("IDLE")}
                    className="px-4 py-1.5 bg-bg-sidebar hover:bg-bg-sidebar/5 border border-border-subtle text-text-main font-mono text-[10px] rounded cursor-pointer"
                  >
                    Reciclar Teste
                  </button>
                  <button
                    onClick={finalizeCognitiveTest}
                    className="px-5 py-1.5 bg-primary hover:bg-primary-hover text-bg-deep font-bold text-[10px] rounded cursor-pointer"
                  >
                    Gravar no Prontuário Clínico
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCALE HISTORY CONTAINER */}
      <div className="bg-bg-card rounded-2xl border border-border-subtle p-5 space-y-4 shadow-md">
        <h4 className="font-bold text-text-main text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-primary" />
          Histórico e Arquivo de Evidências Psicométricas
        </h4>

        {history.length > 0 ? (
          <div className="divide-y divide-border-subtle text-xs">
            {history.map((rec) => {
              const theme = rec.type === "BAI" 
                ? "bg-primary/10 text-primary border-primary/20" 
                : rec.type === "BDI" 
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-bg-sidebar text-text-dim border-border-subtle";

              return (
                <div key={rec.id} className="py-3 flex items-center justify-between gap-4 font-mono">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${theme}`}>
                      {rec.type}
                    </span>
                    <div>
                      <span className="text-[9px] text-text-dim/60">{rec.date}</span>
                      <p className="text-text-main text-[11px] font-sans font-semibold mt-0.5">
                        Resultado: {rec.classification}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-text-main bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-1">
                      {rec.score} {rec.type === "COG_EF" ? "% Acerto" : "Pts"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-border-subtle rounded-xl text-text-dim text-xs">
            Nenhuma avaliação psicométrica realizada para este paciente ainda. Use os botões acima para aplicar.
          </div>
        )}
      </div>

    </div>
  );
}
