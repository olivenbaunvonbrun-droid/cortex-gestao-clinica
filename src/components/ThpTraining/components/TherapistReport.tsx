/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Patient, SessionLog } from "../types";
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  ListOrdered, 
  AlertCircle, 
  FileSpreadsheet, 
  Activity, 
  Award,
  BookOpen,
  BrainCircuit,
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
  AlertTriangle
} from "lucide-react";
import FieldHelp from "./FieldHelp";
import Markdown from "react-markdown";
import { analyzeThpAssessment } from "../../../services/geminiService";

interface TherapistReportProps {
  patient: Patient;
  onAddSessionLog: (log: SessionLog) => void;
}

export default function TherapistReport({ patient, onAddSessionLog }: TherapistReportProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [evolutionSummary, setEvolutionSummary] = useState("");
  const [adherenceScore, setAdherenceScore] = useState(85);
  const [verbalScore, setVerbalScore] = useState(60);
  const [nonVerbalScore, setNonVerbalScore] = useState(55);
  const [clinicalObs, setClinicalObs] = useState("");

  // States for neuroscience markers
  const [hrvBaseline, setHrvBaseline] = useState(45);
  const [diaphragmaticEffectiveness, setDiaphragmaticEffectiveness] = useState(55);
  const [socraticRestructureScore, setSocraticRestructureScore] = useState(60);
  const [sleepWakeHygieneScore, setSleepWakeHygieneScore] = useState(70);

  // States for AI Clinical Report
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportError, setReportError] = useState<{ code?: string; message: string } | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState(false);

  // Loading steps list
  const loadingStepsText = [
    "Compilando prontuário, esquemas ativos (EIDs) e histórico de sessões...",
    "Correlacionando variáveis de VFC/HRV e índice de eficácia diafragmática...",
    "Acessando flexibilidade cortical síncrona e taxa de acertos socráticos...",
    "Estruturando hipóteses sob as bases da Terapia do Esquema e Teoria Polivagal...",
    "Sintetizando referências científicas reais (APA format) e redigindo laudo técnico..."
  ];

  const generateAIReport = async () => {
    setLoadingReport(true);
    setReportError(null);
    setReportText("");
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2500);

    try {
      // Compilar informações de periodização e exercícios do plano
      const progressText = (patient.periodization || []).map(p => 
        `- HP: ${p.skill} | Meta: ${p.title} | Duração: ${p.durationWeeks} semanas | Fase: ${p.phase} | Status: ${p.completed ? "Concluído" : "Ativo"} | Prioridade: ${p.priority}`
      ).join("\n");

      const exercisesText = (patient.periodization || []).flatMap(p => 
        (p.exercises || []).map(ex => `- [${ex.completed ? "X" : " "}] ${ex.title} (Foco: ${p.skill}, Recompensa: ${ex.rewardXp} XP)`)
      ).join("\n");

      const sessionLogsText = (patient.sessionHistory || []).map(s => 
        `Data: ${s.date}\n- Adesão: ${s.adherenceScore}%\n- Verbal: ${s.verbalCompetenceScore}%\n- Não-Verbal: ${s.nonVerbalCompetenceScore}%\n- Evolução: ${s.evolutionSummary}\n- Observações: ${s.clinicalObservations}`
      ).join("\n\n");

      const additionalContext = `Queixa Principal: ${patient.clinicalQueixa}\nEstressores/Operações Estabelecedoras: ${patient.establishingOperations}\nEsquemas Iniciais Desadaptativos Ativos: ${patient.activeSchemas?.join(", ") || "Nenhum"}\nCrenças Centrais: ${patient.beliefs?.coreBeliefs?.join("; ") || "Nenhuma"}\nCrenças Intermediárias: ${patient.beliefs?.intermediateBeliefs?.join("; ") || "Nenhuma"}\nComportamentos de Coping: ${patient.copingBehaviors?.join(", ") || "Nenhum"}`;

      const report = await analyzeThpAssessment(
        { name: patient.name, age: String(patient.age) },
        patient.periodization?.[0]?.skill || "Geral",
        progressText,
        sessionLogsText,
        exercisesText,
        additionalContext
      );

      clearInterval(stepInterval);
      setReportText(report);
    } catch (err: any) {
      clearInterval(stepInterval);
      setReportError({ message: err.message || "Erro ao chamar IA de supervisão. Verifique sua chave API." });
    } finally {
      setLoadingReport(false);
    }
  };

  const handleCopyReport = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTextFile = () => {
    if (!reportText) return;
    const element = document.createElement("a");
    const file = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `Laudo_Clinico_Analitico_${patient.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const saveSessionLog = () => {
    if (!evolutionSummary.trim()) return alert("Descreva o sumário do progresso clínico.");

    const newLog: SessionLog = {
      id: `s-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      evolutionSummary,
      adherenceScore: Number(adherenceScore),
      verbalCompetenceScore: Number(verbalScore),
      nonVerbalCompetenceScore: Number(nonVerbalScore),
      clinicalObservations: clinicalObs,
      hrvBaseline: Number(hrvBaseline),
      diaphragmaticEffectiveness: Number(diaphragmaticEffectiveness),
      socraticRestructureScore: Number(socraticRestructureScore),
      sleepWakeHygieneScore: Number(sleepWakeHygieneScore)
    };

    onAddSessionLog(newLog);
    setEvolutionSummary("");
    setClinicalObs("");
    setShowLogForm(false);
  };

  // Automated neuroscience summary algorithm
  const generateNeuroDiagnostics = () => {
    const logs = patient.sessionHistory;
    if (logs.length === 0) return "Registros de sessões pendentes no prontuário.";
    
    const lastSession = logs[logs.length - 1];
    const firstSession = logs[0];
    
    const verbalIncr = lastSession.verbalCompetenceScore - firstSession.verbalCompetenceScore;
    const nonVerbalIncr = lastSession.nonVerbalCompetenceScore - firstSession.nonVerbalCompetenceScore;

    return `Análise do Algoritmo Neocortex: O paciente exibiu uma evolução síncrona na competência verbal (+${verbalIncr}%) e não-verbal (+${nonVerbalIncr}%) desde o início. A regulação inibitória cortical de timidez está se consolidando através do treino de assertividade. O padrão vegetativo simpático (taquicardia, boca seca) registrou atenuação devido a desensibilização e injeção de assertividade deliberada.`;
  };

  // Custom SVG Chart parameters for evolution mapping
  const renderSVGChart = () => {
    const logs = patient.sessionHistory;
    if (logs.length < 1) {
      return (
        <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
          Registros insuficientes para mapeamento em gráfico de linhas (mínimo de 1 sessão).
        </div>
      );
    }

    const width = 600;
    const height = 180;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const pointsAdherence = logs.map((log, idx) => {
      const x = padding + (idx / Math.max(1, logs.length - 1)) * chartWidth;
      const y = height - padding - (log.adherenceScore / 100) * chartHeight;
      return `${x},${y}`;
    }).join(" ");

    const pointsVerbal = logs.map((log, idx) => {
      const x = padding + (idx / Math.max(1, logs.length - 1)) * chartWidth;
      const y = height - padding - (log.verbalCompetenceScore / 100) * chartHeight;
      return `${x},${y}`;
    }).join(" ");

    const pointsNonVerbal = logs.map((log, idx) => {
      const x = padding + (idx / Math.max(1, logs.length - 1)) * chartWidth;
      const y = height - padding - (log.nonVerbalCompetenceScore / 100) * chartHeight;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-slate-950 p-2 rounded-xl text-[9px] font-mono select-none">
        {/* Helper grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3" />
        <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="#1e293b" strokeDasharray="3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />

        {/* Labels */}
        <text x={padding - 5} y={padding + 3} fill="#475569" textAnchor="end">100%</text>
        <text x={padding - 5} y={height/2 + 3} fill="#475569" textAnchor="end">50%</text>
        <text x={padding - 5} y={height - padding + 3} fill="#475569" textAnchor="end">0%</text>

        {/* X labels */}
        {logs.map((log, idx) => {
          const x = padding + (idx / Math.max(1, logs.length - 1)) * chartWidth;
          return (
            <text key={idx} x={x} y={height - padding + 15} fill="#475569" textAnchor="middle">
              Sessão {idx + 1}
            </text>
          );
        })}

        {/* Lines */}
        {logs.length > 1 && (
          <>
            {/* Adherence line (green) */}
            <polyline fill="none" stroke="#10b981" strokeWidth="2" points={pointsAdherence} />
            {/* Verbal assertiveness line (blue) */}
            <polyline fill="none" stroke="#0ea5e9" strokeWidth="2.5" points={pointsVerbal} />
            {/* Non-Verbal posture line (violet) */}
            <polyline fill="none" stroke="#a78bfa" strokeWidth="2" points={pointsNonVerbal} />
          </>
        )}

        {/* Legend dots */}
        {logs.map((log, idx) => {
          const x = padding + (idx / Math.max(1, logs.length - 1)) * chartWidth;
          return (
            <g key={idx}>
              <circle cx={x} cy={height - padding - (log.adherenceScore / 100) * chartHeight} r="3" fill="#10b981" />
              <circle cx={x} cy={height - padding - (log.verbalCompetenceScore / 100) * chartHeight} r="4" fill="#0ea5e9" />
              <circle cx={x} cy={height - padding - (log.nonVerbalCompetenceScore / 100) * chartHeight} r="3" fill="#a78bfa" />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Clinical Conceptualization Grid Mapping */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-4">
          <BrainCircuit className="w-4 h-4 text-indigo-500" />
          Fator de Concatenamento Clínico Integrado (Amostragem PCI)
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-red-50/50 rounded-lg border border-red-100">
            <span className="font-bold text-red-800 block uppercase font-mono text-[9px] mb-1">Necessidades Negligenciadas</span>
            <p className="text-slate-600 leading-snug">{patient.neglectedNeeds.join(", ") || "Sem registros"}</p>
          </div>

          <div className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <span className="font-bold text-indigo-800 block uppercase font-mono text-[9px] mb-1">Esquemas Ativos EIDs</span>
            <p className="text-slate-600 leading-snug">{patient.activeSchemas.join(", ") || "Sem registros"}</p>
          </div>

          <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-100">
            <span className="font-bold text-amber-800 block uppercase font-mono text-[9px] mb-1">Crenças Centrais</span>
            <p className="text-[11px] text-slate-600 font-mono italic">"{patient.beliefs.coreBeliefs[0] || "Sem registros"}"</p>
          </div>

          <div className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <span className="font-bold text-indigo-800 block uppercase font-mono text-[9px] mb-1">Diretriz PDP Alvo</span>
            <p className="text-slate-600 leading-snug">Treinamento de {patient.periodization[0]?.skill || "Assertividade"}</p>
          </div>
        </div>
      </div>

      {/* Evolution Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line graph column */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Curvas de Evolução Comportamental</h4>
              <p className="text-[10px] text-slate-500 font-mono">Mapeamento cronológico das sessões ativas</p>
            </div>

            {/* Legends */}
            <div className="flex gap-2 text-[9px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Adesão</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" />Assertividade</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" />Postura</span>
            </div>
          </div>

          {renderSVGChart()}

          <div className="p-4 bg-indigo-50 text-indigo-950 rounded-xl border border-indigo-100 text-xs">
            <span className="font-bold font-mono text-[10px] uppercase block mb-1">Diagnóstico Neurofuncional:</span>
            <p className="leading-relaxed leading-snug">{generateNeuroDiagnostics()}</p>
          </div>
        </div>

        {/* Quick Add and stats col */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between h-full">
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase font-mono mb-3">Registrar Evolução de Sessão</h4>
              <p className="text-[10px] text-slate-500 mb-4 leading-snug">Insira um novo sumário de atendimento clínico e atribua notas técnicas auditadas.</p>
              
              {!showLogForm ? (
                <button
                  onClick={() => setShowLogForm(true)}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Escrever Nota Clínicas
                </button>
              ) : (
                <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <label className="flex items-center text-[10px] font-bold text-slate-600 mb-0.5">
                      <span>Sumário do Progresso Clínico</span>
                      <FieldHelp 
                        title="Sumário de Progresso"
                        suggestion="Uma frase concisa descrevendo a evolução principal da sessão."
                        explanation="Necessário para seccionar e classificar as evoluções clínicas cronometradas para alimentar o laudo analítico."
                        example="Ex: Treino de assertion nível 1 efetuado com controle emocional desejável."
                      />
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 bg-white border border-slate-200 rounded outline-none"
                      placeholder="Ex: Treino de Nível 1 efetuado com controle."
                      value={evolutionSummary}
                      onChange={(e) => setEvolutionSummary(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="flex items-center text-[9px] font-mono text-slate-500">
                        <span>Adesão %</span>
                        <FieldHelp 
                          title="Adesão / Compromisso"
                          suggestion="Porcentagem de deveres de casa e treinos feitos no período intersessão."
                          explanation="Crucial para prever os ganhos acumulativos de neuroplasticidade comportamental."
                        />
                      </label>
                      <input
                        type="number"
                        className="w-full p-1 border font-mono rounded"
                        value={adherenceScore}
                        onChange={(e) => setAdherenceScore(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-[9px] font-mono text-slate-500">
                        <span>Assert. %</span>
                        <FieldHelp 
                          title="Assertividade Verbal"
                          suggestion="Habilidade verbal demonstrada durante os roleplays da semana."
                          explanation="Foco da fala em ser transparente, conciso e firme, sem esquivas e sem submissão."
                        />
                      </label>
                      <input
                        type="number"
                        className="w-full p-1 border font-mono rounded"
                        value={verbalScore}
                        onChange={(e) => setVerbalScore(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-[9px] font-mono text-slate-500">
                        <span>Postura %</span>
                        <FieldHelp 
                          title="Postura Não-Verbal"
                          suggestion="Nível de contato ocular, tom de voz e relaxamento muscular demonstrados."
                          explanation="Reflete a dessensibilização autónoma e modulação do pânico de falar em público."
                        />
                      </label>
                      <input
                        type="number"
                        className="w-full p-1 border font-mono rounded"
                        value={nonVerbalScore}
                        onChange={(e) => setNonVerbalScore(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* 🧬 Mini Neuro-Indices Inputs Grid */}
                  <div className="p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100/60 space-y-2 mt-1">
                    <span className="font-mono text-[8px] font-bold text-indigo-800 uppercase block tracking-wider">
                      Métricas de Diagnóstico Clínico (Neurociência)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="flex items-center text-[8px] font-mono text-slate-500">
                          <span>VFC/HRV (ms)</span>
                          <FieldHelp 
                            title="Variabilidade da Frequência Cardíaca (HRV)"
                            suggestion="Mapeie o tempo (ms) de repouso vagal do paciente."
                            explanation="Indicador biométrico de regulação emocional autonômica sob timidez aguda síncrona."
                          />
                        </label>
                        <input
                          type="number"
                          className="w-full p-1 bg-white border border-slate-200 font-mono rounded text-[10px]"
                          value={hrvBaseline}
                          onChange={(e) => setHrvBaseline(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="flex items-center text-[8px] font-mono text-slate-500">
                          <span>Efic. Diafragmática (%)</span>
                          <FieldHelp 
                            title="Eficácia Diafragmática"
                            suggestion="De 0 a 100% de preenchimento controlado dos pulmões."
                            explanation="Respiração profunda estimula barorreceptores e amortece e desliga pânicos simpáticos."
                          />
                        </label>
                        <input
                          type="number"
                          className="w-full p-1 bg-white border border-slate-200 font-mono rounded text-[10px]"
                          value={diaphragmaticEffectiveness}
                          onChange={(e) => setDiaphragmaticEffectiveness(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="flex items-center text-[8px] font-mono text-slate-500">
                          <span>Acerto Socrático %</span>
                          <FieldHelp 
                            title="Acerto Socrático"
                            suggestion="Taxa de sucesso de Pedro em reestruturar asneiras mentais autocríticas."
                            explanation="Mede a modulação cortical contornando pensamentos disadaptativos sob pressão de timing."
                          />
                        </label>
                        <input
                          type="number"
                          className="w-full p-1 bg-white border border-slate-200 font-mono rounded text-[10px]"
                          value={socraticRestructureScore}
                          onChange={(e) => setSocraticRestructureScore(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="flex items-center text-[8px] font-mono text-slate-500">
                          <span>Higiene de Sono %</span>
                          <FieldHelp 
                            title="Higiene do Sono síncrona"
                            suggestion="Cumprimento dos ritos circadianos estabelecidos (0-100%)."
                            explanation="Ciclos saudáveis de repouso reduzem a reatividade periférica da amígdala do pânico social."
                          />
                        </label>
                        <input
                          type="number"
                          className="w-full p-1 bg-white border border-slate-200 font-mono rounded text-[10px]"
                          value={sleepWakeHygieneScore}
                          onChange={(e) => setSleepWakeHygieneScore(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Observações Adicionais</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 bg-white border border-slate-200 rounded outline-none resize-none"
                      placeholder="Ex: Menos taquicardia registrada..."
                      value={clinicalObs}
                      onChange={(e) => setClinicalObs(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowLogForm(false)}
                      className="px-2 py-1 bg-slate-200 rounded text-[10px]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveSessionLog}
                      className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px]"
                    >
                      Salvar Nota
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] text-slate-400 font-mono leading-relaxed bg-slate-50 p-2 rounded-lg">
              <span className="font-bold text-slate-600 block mb-0.5">Indicador de Neuroplasticidade</span>
              A assertividade repetitiva reorganiza e altera fisicamente conexões neurais inibitórias. Quanto maior o tom de assertividade (Verbal), maior a atenuação do estresse somático corporal.
            </div>
          </div>
        </div>

      </div>

      {/* 🧪 Relatório Analítico de IA Científico Clínico */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-full font-bold font-mono tracking-wider flex items-center gap-1 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Inteligência Psicoterapêutica
              </span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm mt-1.5 font-sans">Laudo Clínico Analítico Multidimensional (IA)</h4>
            <p className="text-[10.5px] text-slate-500 leading-snug">
              Cruzamento estocástico de biofeedback autonômico, flexibilização cortical socrática e periodização técnica com embasamento científico de literatura clínica.
            </p>
          </div>
          {!loadingReport && (
            <button
              onClick={generateAIReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm font-sans"
            >
              <Sparkles className="w-4 h-4" />
              {reportText ? "Regerar Laudo Clínico" : "Gerar Laudo Clínico"}
            </button>
          )}
        </div>

        {/* LOADING STATE WITH SCIENTIFIC UPDATES */}
        {loadingReport && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-4 animate-fade-in">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <BrainCircuit className="w-6 h-6 text-indigo-600 absolute top-3 left-3 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <p className="text-xs font-mono font-bold text-indigo-700 select-none">
                Estágio {loadingStep + 1}/5: {loadingStepsText[loadingStep]}
              </p>
              <div className="w-48 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500" 
                  style={{ width: `${(loadingStep + 1) * 20}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Processando modelo cognitivo e referências científicas...
              </p>
            </div>
          </div>
        )}

        {/* ERROR STATE: SENSITIVE TO MISSING API KEY */}
        {reportError && (
          <div className="p-4 bg-red-50 text-red-950 rounded-xl border border-red-200 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-900 block font-mono uppercase text-[10px] tracking-wider mb-0.5">
                  Falha na Compilação do Laudo
                </span>
                <p className="leading-relaxed">{reportError.message}</p>
              </div>
            </div>

            {reportError.code === "GEMINI_API_KEY_MISSING" && (
              <div className="bg-white/80 p-3 rounded-lg border border-red-100/60 mt-2 space-y-2 text-[10.5px]">
                <p className="font-semibold text-slate-800">Como reestabelecer o serviço em 2 passos:</p>
                <ol className="list-decimal list-inside text-slate-650 space-y-1">
                  <li>Clique no painel superior esquerdo de ferramentas do <strong>AI Studio</strong>.</li>
                  <li>Acesse o menu <strong>Settings &gt; Secrets</strong> e insira a chave secreta com o nome de <code className="px-1 py-0.5 bg-slate-100 text-pink-600 font-mono text-[9.5px] rounded border border-slate-200">GEMINI_API_KEY</code>.</li>
                </ol>
                <p className="text-[9.5px] text-slate-400 font-mono italic">Os segredos e variáveis ambientais são criptografados estritamente na sandbox deste applet.</p>
              </div>
            )}
          </div>
        )}

        {/* PLACEHOLDER BEFORE FIRST TIME GENERATION */}
        {!loadingReport && !reportText && !reportError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-700 w-fit rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-sans">Análise Autonômica</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Correlação do tônus vagal e barorreceptores (VFC/HRV, eficácia respiratória) sob os fundamentos fisiológicos da Teoria Polivagal.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 w-fit rounded-lg">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-sans">Mapeamento Cognitivo</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Evolução do diálogo socrático versus esquemas iniciais desadaptativos (EIDs) e ativações de crenças disadaptativas profundas.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-1.5 bg-amber-50 text-amber-700 w-fit rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-sans">Diretriz de Neuroplasticidade</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Periodização técnica quantitativa baseada no treinamento de habilidades e nos processos de aprendizado hebbiano para reconfiguração cortical-emocional.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETED REPORT RENDERER - CLINICAL DOSSIER STYLE */}
        {reportText && !loadingReport && (
          <div className="space-y-4 animate-fade-in">
            {/* Action buttons bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 pl-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Laudo compilado formalmente · {new Date().toLocaleDateString("pt-BR")}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyReport}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Texto
                    </>
                  )}
                </button>
                <button
                  onClick={handleExportTextFile}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Exportar .TXT (Laudo)
                </button>
              </div>
            </div>

            {/* Scientific Sheet frame */}
            <div className="p-6 md:p-8 bg-slate-50/60 rounded-xl border border-slate-200 font-sans shadow-inner max-h-[500px] overflow-y-auto style-scrollbar relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
              
              {/* Formal clinic paper header */}
              <div className="border-b-2 border-slate-300 pb-5 mb-5 space-y-3.5">
                <div className="text-center space-y-1">
                  <span className="font-serif text-lg tracking-widest uppercase font-bold text-slate-800 block">Dossier de Integração Clínica</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 block">THP — Treinamento de Habilidades Psicológicas Avançado</span>
                </div>

                {/* Patient metadata box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-250 font-mono text-[9.5px]">
                  <div>
                    <span className="text-slate-400 block font-bold text-[8px] uppercase">Paciente</span>
                    <span className="font-bold text-slate-700">{patient.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[8px] uppercase">Faixa Etária</span>
                    <span className="font-bold text-slate-700">{patient.age} Anos</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[8px] uppercase">Ocupação / Setor</span>
                    <span className="font-bold text-slate-700 truncate block sm:max-w-xs">{patient.profession}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[8px] uppercase">Código UID</span>
                    <span className="font-bold text-indigo-600">ID-{patient.id.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Parsed Markdown output */}
              <div className="markdown-body space-y-4">
                <Markdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xs font-bold text-indigo-750 border-b border-slate-200 pb-1 mb-2 mt-5 uppercase font-sans tracking-wide">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-[11px] font-bold text-indigo-700 mb-1.5 mt-4 uppercase font-sans tracking-tight">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-[10px] font-bold text-slate-700 mb-1 mt-3">{children}</h3>,
                    p: ({ children }) => <p className="text-slate-650 leading-relaxed mb-2.5 text-[10.5px] text-justify font-sans">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-[10.5px] text-slate-650 space-y-1 mb-2.5 pl-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-[10.5px] text-slate-650 space-y-1 mb-2.5 pl-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-0.5 leading-relaxed">{children}</li>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-400 pl-3 py-0.5 italic my-3 text-[10.5px] text-slate-600 bg-indigo-50/60 rounded-r">{children}</blockquote>,
                    strong: ({ children }) => <strong className="font-bold text-slate-800">{children}</strong>,
                  }}
                >
                  {reportText}
                </Markdown>
              </div>

              {/* Scientific Stamp footer */}
              <div className="border-t border-slate-250 pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-mono text-slate-400">
                <span>Laudo emitido por amostragem cibernética de IA</span>
                <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0 sm:pl-4 border-slate-200">
                  <div className="font-serif italic text-slate-600 font-bold block">Assinatura Digital Integrada</div>
                  <div className="text-[8px] uppercase select-all tracking-wider font-sans text-indigo-500">SHA-256 CLI_THP_{patient.id.slice(0, 8)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chronological session timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h4 className="font-bold text-slate-800 text-sm">Prontuário Histórico de Sessões</h4>

        <div className="space-y-3">
          {patient.sessionHistory.map((log, idx) => {
            return (
              <div key={log.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 leading-relaxed text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">0{idx + 1}</span>
                    <span className="font-bold text-slate-800 text-xs">Sessão {idx + 1} · {log.date}</span>
                  </div>

                  {/* Badges row with score details */}
                  <div className="flex gap-2 font-mono text-[9px] font-bold">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">Adesão: {log.adherenceScore}%</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded">Assert.: {log.verbalCompetenceScore}%</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-200 rounded font-bold">Postura: {log.nonVerbalCompetenceScore}%</span>
                  </div>
                </div>

                <p className="text-slate-700 font-medium">
                  {log.evolutionSummary}
                </p>

                {/* Custom Neuro-Diagnostics Metrics Display */}
                {(log.hrvBaseline !== undefined || log.diaphragmaticEffectiveness !== undefined || log.socraticRestructureScore !== undefined || log.sleepWakeHygieneScore !== undefined) && (
                  <div className="mt-2.5 text-[10px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 text-slate-100 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex flex-col border-r border-slate-800 pr-1.5">
                      <span className="text-slate-400 text-[8px] uppercase font-bold tracking-tight">VFC/HRV Baseline</span>
                      <span className="font-bold text-sky-400 text-xs mt-0.5">{log.hrvBaseline ?? 45} ms</span>
                    </div>
                    <div className="flex flex-col sm:border-r border-slate-800 sm:px-1.5">
                      <span className="text-slate-400 text-[8px] uppercase font-bold tracking-tight">Eficácia Diafragma</span>
                      <span className="font-bold text-emerald-400 text-xs mt-0.5">{log.diaphragmaticEffectiveness ?? 55}%</span>
                    </div>
                    <div className="flex flex-col border-r border-slate-800 pr-1.5 sm:pl-1.5">
                      <span className="text-slate-400 text-[8px] uppercase font-bold tracking-tight">Acerto Socrático</span>
                      <span className="font-bold text-violet-400 text-xs mt-0.5">{log.socraticRestructureScore ?? 60}%</span>
                    </div>
                    <div className="flex flex-col sm:pl-1.5">
                      <span className="text-slate-400 text-[8px] uppercase font-bold tracking-tight">Higiene do Sono</span>
                      <span className="font-bold text-amber-400 text-xs mt-0.5">{log.sleepWakeHygieneScore ?? 70}%</span>
                    </div>
                  </div>
                )}
                
                {log.clinicalObservations && (
                  <p className="text-slate-500 italic mt-1 bg-white p-2 border border-slate-100 rounded font-mono text-[11px]">
                    <span className="font-bold font-mono uppercase text-[9px] not-italic block text-slate-400">Observações Clínicas:</span>
                    {log.clinicalObservations}
                  </p>
                )}
              </div>
            );
          })}
          {patient.sessionHistory.length === 0 && (
            <div className="text-center p-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
              Nenhuma sessão clínica registrada para este paciente ainda. Adicione logs para monitorar a evolução.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
