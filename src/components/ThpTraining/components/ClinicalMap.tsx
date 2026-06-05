/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Patient, EarlyNeed, SchemaEID, CopingStyle, PsychologicalSkill } from "../types";
import { 
  ArrowRight, 
  Dna, 
  HelpCircle, 
  Brain, 
  Lightbulb, 
  Activity, 
  Zap, 
  Compass,
  CornerDownRight
} from "lucide-react";

interface ClinicalMapProps {
  patient: Patient;
}

export default function ClinicalMap({ patient }: ClinicalMapProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [selectedCircuit, setSelectedCircuit] = useState<"CSTC" | "HPA" | "AUTONOMO">("CSTC");

  // Neuroscience rationale context based on the element
  const getNeuroscienceRationale = (nodeType: string) => {
    switch (nodeType) {
      case "needs":
        return "Neurobiologia do Desenvolvimento: Defasagens precoce na vinculação/segurança afetam o desenvolvimento do eixo HPA (hipotálamo-pituitária-adrenal), regulando a sensibilidade perpétua ao estresse e cortisol basal.";
      case "schemas":
        return "Estruturas Mnemônicas Esquemáticas: Ativação mnemônica estocástica na amígdala basolateral. Memórias traumáticas brutas são armazenadas sem consolidação adequada pelo hipocampo.";
      case "beliefs":
        return "Córtex Pré-frontal Ventromedial (vmPFC): Responsável pelo processamento autorreferencial e atribuição de valor a si. O vmPFC consolida as crenças centrais disfuncionais como filtros cognitivos implacáveis.";
      case "coping":
        return "Respostas de Sobrevivência (Luta/Fuga/Congelamento): A PAG (Substância Cinzenta Periaquedutal) coordena reações imediatas como evitação (fuga ativa) ou rendição (congelamento emocional-comportamental).";
      case "operations":
        return "Modulação de Recompensas: Operações estabelecedoras e contextos alteram transitoriamente o valor reforçador das consequências imediatas (alívio rápido pela dopamina do estriado ventral).";
      case "skills":
        return "Neuroplasticidade Dirigida (Processo PDP): O treino deliberado de HPs (Córtex Pré-frontal Dorso-lateral e Córtex Cingulado Anterior) estabelece novas vias sinápticas inibitórias sobre a amígdala reativa, promovendo reabilitação estrutural duradoura.";
      default:
        return "Toque em um nó do fluxo clínico para ler a correlação neurocientífica correspondente.";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Intro Context Card */}
      <div className="bg-bg-deep text-white rounded-xl p-6 border border-border-subtle shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <Brain className="w-56 h-56 text-sky-400 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-400 font-mono text-[10px] uppercase font-bold rounded-lg border border-sky-500/30">
              Estudo Científico TCC-4
            </span>
            <span className="text-[10px] text-text-dim font-mono">Conectividade e Mapeamento</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">Mapa de Conectividade Psicopatológica Funcional</h3>
          <p className="text-sm text-text-dim max-w-2xl leading-relaxed">
            De acordo com a Terapia Cognitivo-Comportamental de Quarta Geração e a Neurociência Clínica, o sofrimento não é um rótulo estático. 
            Ele é mantido por uma cadeia funcional de eventos: necessidades privadas desregulam a cognição, ativando esquemas profundos e promovendo comportamentos evitativos involuntários.
          </p>
        </div>
      </div>

      {/* Main Connection Flow */}
      <div className="bg-bg-sidebar rounded-xl border border-border-subtle p-6 shadow-sm overflow-x-auto space-y-6">
        <div className="min-w-[1000px] flex flex-col space-y-8">
          
          <div className="grid grid-cols-5 gap-4 relative">
            
            {/* 1. Necessidades */}
            <div 
              onClick={() => setActiveNode("needs")}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                activeNode === "needs" 
                  ? "bg-red-500/10 border-red-500/40 ring-2 ring-red-500/15 shadow-md scale-[1.02]" 
                  : "bg-bg-card hover:bg-bg-sidebar border-border-subtle"
              }`}
            >
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
                <Dna className="w-4 h-4 text-red-400" />
                Childhood Deficits
              </div>
              <h5 className="text-xs font-bold text-text-main mb-1.5">Necessidades Negligenciadas</h5>
              <div className="space-y-1">
                {patient.neglectedNeeds.map(need => (
                  <div key={need} className="text-[11px] bg-red-950/45 text-red-200 px-2.5 py-1 rounded-lg font-bold border border-red-800/40 tracking-wide">
                    · {need}
                  </div>
                ))}
                {patient.neglectedNeeds.length === 0 && <span className="text-xs text-text-dim">Nenhum</span>}
              </div>
              <p className="text-[10px] text-text-dim mt-2 italic leading-tight">Privação crônica ou violações na primeira infância.</p>
            </div>

            {/* Connecting arrows container */}
            <div className="absolute left-[19%] top-1/2 -translate-y-1/2 z-10 pointer-events-none hidden md:block">
              <div className="w-6 h-6 rounded-full bg-bg-sidebar border border-border-subtle flex items-center justify-center shadow-sm">
                <ArrowRight className="w-3.5 h-3.5 text-text-dim" />
              </div>
            </div>

            {/* 2. Esquemas EIDs */}
            <div 
              onClick={() => setActiveNode("schemas")}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                activeNode === "schemas" 
                  ? "bg-primary/10 border-primary/45 ring-2 ring-primary/20 shadow-md scale-[1.02]" 
                  : "bg-bg-card hover:bg-bg-sidebar border-border-subtle"
              }`}
            >
              <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider mb-2 font-mono">
                <Zap className="w-4 h-4 text-primary" />
                Maladaptive Schemas
              </div>
              <h5 className="text-xs font-bold text-text-main mb-1.5">Esquemas Iniciais (EIDs)</h5>
              <div className="space-y-1">
                {patient.activeSchemas.map(schema => (
                  <div key={schema} className="text-[11px] bg-primary/15 text-[#e1f0ff] px-2.5 py-1 rounded-lg font-bold border border-primary/40 tracking-wide">
                    {schema}
                  </div>
                ))}
                {patient.activeSchemas.length === 0 && <span className="text-xs text-text-dim">Nenhum</span>}
              </div>
              <p className="text-[10px] text-text-dim mt-2 italic leading-tight">Lentes emocionais rústicas de autoavaliação involuntária.</p>
            </div>

            {/* Connecting arrows container */}
            <div className="absolute left-[39%] top-1/2 -translate-y-1/2 z-10 pointer-events-none hidden md:block">
              <div className="w-6 h-6 rounded-full bg-bg-sidebar border border-border-subtle flex items-center justify-center shadow-sm">
                <ArrowRight className="w-3.5 h-3.5 text-text-dim" />
              </div>
            </div>

            {/* 3. Crenças */}
            <div 
              onClick={() => setActiveNode("beliefs")}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                activeNode === "beliefs" 
                  ? "bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/10 shadow-md scale-[1.02]" 
                  : "bg-bg-card hover:bg-bg-sidebar border-border-subtle"
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
                <Activity className="w-4 h-4 text-amber-500" />
                Cognitive Matrix
              </div>
              <h5 className="text-xs font-bold text-text-main mb-1.5">Crenças & Regras</h5>
              <div className="space-y-1.5">
                <div className="text-[10px] text-text-dim font-bold uppercase tracking-wider font-mono">Centrais</div>
                {patient.beliefs.coreBeliefs.map((cb, i) => (
                  <div key={i} className="text-[11px] text-text-main font-mono italic leading-tight">
                    "{cb}"
                  </div>
                ))}
                <div className="text-[10px] text-text-dim font-bold uppercase tracking-wider font-mono mt-1">Intermediárias</div>
                {patient.beliefs.intermediateBeliefs.map((ib, i) => (
                  <div key={i} className="text-[10px] text-text-dim leading-tight">
                    {ib}
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting arrows container */}
            <div className="absolute left-[59%] top-1/2 -translate-y-1/2 z-10 pointer-events-none hidden md:block">
              <div className="w-6 h-6 rounded-full bg-bg-sidebar border border-border-subtle flex items-center justify-center shadow-sm">
                <ArrowRight className="w-3.5 h-3.5 text-text-dim" />
              </div>
            </div>

            {/* 4. Respostas - Coping desadaptativo */}
            <div 
              onClick={() => setActiveNode("coping")}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                activeNode === "coping" 
                  ? "bg-rose-500/10 border-rose-500/40 ring-2 ring-rose-500/10 shadow-md scale-[1.02]" 
                  : "bg-bg-card hover:bg-bg-sidebar border-border-subtle"
              }`}
            >
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
                <HelpCircle className="w-4 h-4 text-rose-500" />
                Coping Behaviours
              </div>
              <h5 className="text-xs font-bold text-text-main mb-1">Reações de Sobrevivência</h5>
              <div className="text-[10px] bg-rose-950/50 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-800/30 mb-2 w-max max-w-full truncate">
                {patient.copingStyleSelected}
              </div>
              <div className="space-y-1">
                {patient.copingBehaviors.map((cb, idx) => (
                  <div key={idx} className="text-[10px] text-text-dim leading-tight pl-2 border-l border-rose-500/30">
                    {cb}
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting arrows container */}
            <div className="absolute left-[79%] top-1/2 -translate-y-1/2 z-10 pointer-events-none hidden md:block">
              <div className="w-6 h-6 rounded-full bg-bg-sidebar border border-border-subtle flex items-center justify-center shadow-sm">
                <ArrowRight className="w-3.5 h-3.5 text-text-dim" />
              </div>
            </div>

            {/* 5. Competência Desejada HP */}
            <div 
              onClick={() => setActiveNode("skills")}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                activeNode === "skills" 
                  ? "bg-sky-500/10 border-sky-500/40 ring-2 ring-sky-500/10 shadow-md scale-[1.02]" 
                  : "bg-bg-card hover:bg-bg-sidebar border-border-subtle"
              }`}
            >
              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
                <Compass className="w-4 h-4 text-sky-400 fill-sky-400/10" />
                Therapeutic Targets
              </div>
              <h5 className="text-xs font-bold text-text-main mb-1.5">Habilidades (HPs) Seculares</h5>
              <div className="space-y-1">
                {patient.periodization.map(period => (
                  <div key={period.id} className="text-[11px] bg-sky-950/40 text-sky-200 border border-sky-800/40 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span className="truncate">{period.skill}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-text-dim mt-2 italic leading-tight">Treinamento síncrono e comportamental para enfraquecer os esquemas.</p>
            </div>
            
          </div>
        </div>
      </div>

      {/* 🧬 Interactive Neural Circuits Panel */}
      <div className="bg-bg-deep text-white rounded-xl border border-border-subtle p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-3">
          <div className="space-y-1">
            <h4 className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-sky-400 font-mono">
              <Brain className="w-4 h-4 text-sky-400" />
              Mapeador de Circuitos Neurobiológicos Clínicos
            </h4>
            <p className="text-[10px] text-text-dim">
              Visualize em tempo real os sistemas neurofuncionais associados aos esquemas de {patient.name}.
            </p>
          </div>

          {/* Circuit selection toggles */}
          <div className="flex items-center bg-bg-deep p-1 rounded-lg border border-border-subtle text-[10px] font-mono leading-none">
            <button
              onClick={() => setSelectedCircuit("CSTC")}
              className={`px-3 py-2 rounded font-bold transition cursor-pointer ${
                selectedCircuit === "CSTC" ? "bg-primary text-bg-deep font-bold text-white" : "text-text-dim hover:text-white"
              }`}
            >
              Circuito CSTC (Preocupação)
            </button>
            <button
              onClick={() => setSelectedCircuit("HPA")}
              className={`px-3 py-2 rounded font-bold transition cursor-pointer ${
                selectedCircuit === "HPA" ? "bg-red-600/90 text-white" : "text-text-dim hover:text-white"
              }`}
            >
              Eixo HPA (Estresse)
            </button>
            <button
              onClick={() => setSelectedCircuit("AUTONOMO")}
              className={`px-3 py-2 rounded font-bold transition cursor-pointer ${
                selectedCircuit === "AUTONOMO" ? "bg-primary text-white" : "text-text-dim hover:text-white"
              }`}
            >
              Sist. Autônomo e HRV
            </button>
          </div>
        </div>

        {/* Diagnostic Visual Render with Glowing Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Schematic representation */}
          <div className="md:col-span-2 bg-bg-deep p-5 rounded-xl border border-border-subtle/80 min-h-[160px] flex flex-col items-center justify-center relative">
            
            {/* 1. Circuit CSTC Render */}
            {selectedCircuit === "CSTC" && (
              <div className="w-full space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
                  <div className="px-3 py-2 rounded-lg bg-emerald-950 border border-primary/30 text-emerald-300 text-[10px] font-bold text-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    Córtex Prf. (dlPFC)<br/>
                    <span className="text-[8px] text-text-dim text-text-dim">Interpretação e Lógica</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-dim" />
                  <div className="px-3 py-2 rounded-lg bg-red-950 border border-red-500/30 text-red-300 text-[10px] font-bold text-center shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    Estriado (Núcleo Caudado)<br/>
                    <span className="text-[8px] text-text-dim">Filtro de Atenção Falho</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-dim" />
                  <div className="px-3 py-2 rounded-lg bg-indigo-950 border border-primary/30 text-indigo-300 text-[10px] font-bold text-center shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    Tálamo<br/>
                    <span className="text-[8px] text-text-dim">Reassinalamento Obsessivo</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-dim" />
                  <div className="px-3 py-2 rounded-lg bg-purple-950 border border-purple-500/30 text-purple-300 text-[10px] font-bold text-center shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse">
                    Córtex Cingulado (ACC)<br/>
                    <span className="text-[8px] text-text-dim text-text-dim">Erro / Ansiedade Social</span>
                  </div>
                </div>
                <div className="text-center font-serif italic text-text-dim text-[11px] leading-relaxed max-w-lg mx-auto">
                  `O circuito CSTC de ${patient.name} encontra-se hiperativo. O filtro inibitório do Núcleo Caudado falha diante de gatilhos clínicos, fazendo com que o Tálamo bombardeie o Córtex de ruminações (${patient.beliefs?.automaticThoughts?.[0] || "pensamentos disfuncionais"}).`
                </div>
              </div>
            )}

            {/* 2. Circuit HPA Render */}
            {selectedCircuit === "HPA" && (
              <div className="w-full space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
                  <div className="px-3 py-2 rounded-lg bg-red-950 border border-red-500/30 text-red-300 text-[10px] font-semibold text-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    Amígdala<br/>
                    <span className="text-[8px] text-text-dim uppercase">Detetor de Ameaça</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-dim" />
                  <div className="px-3 py-2 rounded-lg bg-pink-950 border border-pink-500/30 text-pink-300 text-[10px] font-semibold text-center shadow-[0_0_15px_rgba(236,72,153,0.15)] text-text-main">
                    Hipotálamo (CRH)<br/>
                    <span className="text-[8px] text-text-dim">Ativação Endócrina</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-dim" />
                  <div className="px-3 py-2 rounded-lg bg-orange-950 border border-orange-500/30 text-orange-300 text-[10px] font-semibold text-center shadow-[0_0_15px_rgba(249,115,22,0.15)] text-text-main">
                    Pituitária (ACTH)<br/>
                    <span className="text-[8px] text-text-dim">Mensageiro da Glândula</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-dim" />
                  <div className="px-3 py-2 rounded-lg bg-red-900 border border-red-400 text-text-main text-[10px] font-extrabold text-center shadow-[0_0_20px_rgba(239,68,68,0.35)] animate-pulse">
                    Suprarrenais (Cortisol)<br/>
                    <span className="text-[8px] text-text-main font-bold uppercase">Descarga de Tensão</span>
                  </div>
                </div>
                <div className="text-center font-serif italic text-text-dim text-[11px] leading-relaxed max-w-lg mx-auto">
                  `A ativação do Esquema de ${patient.activeSchemas?.[0] || "Inadequação"} em ${patient.name} ativa imediatamente a amígdala límbica, que recruta o Hipotálamo. Este dispara a cascata hormonal do Eixo HPA, gerando cortisol crônico, insônia e hiper-resposta corporal.`
                </div>
              </div>
            )}

            {/* 3. Circuit AUTONOMO Render */}
            {selectedCircuit === "AUTONOMO" && (
              <div className="w-full space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
                  <div className="px-3 py-2 rounded-lg bg-sky-950 border border-sky-500/30 text-sky-300 text-[10px] font-bold text-center shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                    Tronco Cerebral<br/>
                    <span className="text-[8px] text-text-dim">Centro Autônomo Basal</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold">
                      <ArrowRight className="w-3.5 h-3.5" /> Nervo Vago (X Par) (+)
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-red-400 font-bold">
                      <ArrowRight className="w-3.5 h-3.5" /> Cadeia Simpática (-)
                    </div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-emerald-950 border border-primary text-emerald-300 text-[10px] font-extrabold text-center shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
                    Nó Sinoatrial do Coração<br/>
                    <span className="text-[8px] text-emerald-400 uppercase">Ajuste de HRV / VFC</span>
                  </div>
                </div>
                <div className="text-center font-serif italic text-text-dim text-[11px] leading-relaxed max-w-lg mx-auto">
                  `O tônus vagal de ${patient.name} é deficitário (baixa VFC/HRV), diminuindo sua resiliência cardiovascular sob avaliação. O treino diário recontrata as fibras vagais respiratórias.`
                </div>
              </div>
            )}

          </div>

          {/* Theoretical commentary */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase font-mono text-text-dim block">Diagnóstico de Conectividade</span>
            
            {selectedCircuit === "CSTC" && (
              <p className="text-xs text-text-main leading-relaxed font-mono">
                <strong>Análise:</strong> A ruminação ansiosa sobre o futuro é mantida por hipermobilidade do loop CSTC. Treinar a <u>Resolutividade de Enfrentamento</u> exercita a interrupção cortical deliberada desse ciclo vicioso.
              </p>
            )}

            {selectedCircuit === "HPA" && (
              <p className="text-xs text-text-main leading-relaxed font-mono">
                <strong>Análise:</strong> A fadiga física, tensão muscular e cefaleia descritas em ${patient.name} decorrem do estresse oxidativo sustentado pelo cortisol das suprarrenais. <u>Autoconhecimento</u> e mindfulness ajudam a desligar este gatilho.
              </p>
            )}

            {selectedCircuit === "AUTONOMO" && (
              <p className="text-xs text-text-main leading-relaxed font-mono">
                <strong>Análise:</strong> A taquicardia e o bolo na garganta são manifestações viscerais imediatas do descompasso autônomo. O <u>Biofeedback Cardio-Respiratório</u> age re-sintonizando o freio parassimpático vagal.
              </p>
            )}

            <div className="p-3 bg-bg-deep rounded-lg border border-border-subtle text-[10px] text-text-dim font-mono">
              <strong>Abordagem de 4ª Gen:</strong> Interrompemos esses circuitos operando em paralelo no nível cognitivo, somático e motor ao mesmo tempo.
            </div>
          </div>

        </div>
      </div>

      {/* Environmental Operations Input Box */}
      <div className="bg-bg-card rounded-xl border border-border-subtle p-5 space-y-3">
        <h4 className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-text-dim font-mono">
          <Zap className="w-4 h-4 text-amber-500" />
          Operações Estabelecedoras Ambientais Ativas
        </h4>
        <p className="text-xs text-text-dim leading-relaxed max-w-3xl">
          <span className="font-mono bg-bg-sidebar inline-block px-1.5 py-0.5 rounded text-text-main font-bold mr-1">Contexto Recorrente:</span>
          {patient.establishingOperations || "Operações contextuais não mapeadas ainda por observação funcional."}
        </p>
      </div>

      {/* Interactive Neuroscience Dashboard Panel */}
      <div className="bg-sky-950 border border-sky-800 text-sky-100 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
        <div className="md:w-2/3 space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-sky-400" />
            <h4 className="font-bold text-sm uppercase tracking-wider text-sky-300 font-mono">Trilhas de Neuroplasticidade & TCC 4ª Geração</h4>
          </div>
          <p className="text-xs text-sky-200/90 leading-relaxed">
            Abordar transtornos psíquicos sob a ótica das HPs significa que déficits expressivos de comportamentos adaptativos (como a inabilidade assertiva de falar sob avaliação) 
            são vistos como vias de reforçamento negativo consolidadas no circuito subcortical. O treinamento repetido e sistemático (PME/PDP) renegocia a regulação de descargas adrenérgicas de estresse.
          </p>
          <div className="h-px bg-sky-800" />
          <div className="p-3.5 bg-sky-900/40 rounded-lg text-xs leading-relaxed border border-sky-800/40">
            <span className="font-bold block text-sky-400 font-mono text-[10px] uppercase tracking-wider mb-1">Mecanismo do Cérebro Ativo:</span>
            {getNeuroscienceRationale(activeNode || "")}
          </div>
        </div>
        <div className="md:w-1/3 flex flex-col justify-center items-center bg-sky-900/30 p-4 rounded-xl border border-sky-800/20 text-center gap-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-sky-800/50 flex items-center justify-center animate-pulse">
              <Dna className="w-8 h-8 text-sky-300" />
            </div>
            <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-primary animate-ping" />
          </div>
          <div className="font-mono text-xs font-bold text-sky-300 uppercase tracking-widest mt-1">Status Sináptico</div>
          <div className="text-[10px] text-sky-200 mt-0.5 leading-snug">
            {activeNode ? `Nó "${activeNode.toUpperCase()}" selecionado em simulação funcional` : "Toque nos nós do mapa para mapear caminhos neuronais."}
          </div>
        </div>
      </div>
    </div>
  );
}
