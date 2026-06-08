import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Clipboard, Plus, Trash2, Sparkles, Award, Eye, RefreshCw, 
  HelpCircle, Activity, Heart, Scale, Lightbulb, CheckSquare, ShieldCheck
} from "lucide-react";

export interface TransitionMechanism {
  id: string;
  disfunctionalSchema: string; 
  disfunctionalThought: string; 
  disfunctionalBehavior: string; 
  disfunctionalResults: string; 
  disfunctionalDisadvantages: string; 

  functionalSchema: string; 
  functionalThought: string; 
  functionalBehavior: string; 
  functionalResultsKey: string; 
  functionalAdvantages: string; 
}

export interface TransicaoMecanismoState {
  transitions: TransitionMechanism[];
  clinicalNotes: string;
}

interface TransicaoMecanismoViewProps {
  patient: PatientInfo;
  state: TransicaoMecanismoState;
  setState: React.Dispatch<React.SetStateAction<TransicaoMecanismoState>>;
}

export default function TransicaoMecanismoView({
  patient,
  state,
  setState
}: TransicaoMecanismoViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    state.transitions.length > 0 ? state.transitions[0].id : null
  );

  const [viewMode, setViewMode] = useState<"editor" | "canvas">("editor");

  // Premium Clínicos Presets of Inteligência Psicológica
  const PRESETS = [
    {
      label: "Abandono vs. Autodesenvolvimento Seguro",
      disfunctionalSchema: "Esquema de Abandono / Instabilidade (Necessidade de Conexão Segura desregulada).",
      disfunctionalThought: "Se eu me distanciar ou se ela demorar para responder por 2 horas, significa que serei abandonada de forma inevitável e ficarei completamente sozinha para sempre.",
      disfunctionalBehavior: "Cobranças agressivas instantâneas por redes sociais, vigilância insistente de conexões de status (fuga-esquiva ativa).",
      disfunctionalResults: "Brigas desnecessárias de ciúmes, fadiga crônica de vigilância e indução do distanciamento reativo do parceiro (mecanismo que se autoconfirma).",
      disfunctionalDisadvantages: "Desgaste total do afeto do parceiro, ansiedade diária insuportável e estagnação de projetos pessoais e profissionais.",
      
      functionalSchema: "Autonomia Funcional e Vínculos Seguros (Necessidade de Conexão Segura autorregulada).",
      functionalThought: "O silêncio do outro reflete sua própria rotina diária atarefada e fustigada de trabalho, não insolvência afetiva. Eu sou autoeficaz e completa em meu próprio espaço de vida.",
      functionalBehavior: "Trilhar o próprio cronograma com dedicação integral a metas, respeitar o tempo alheio e responder aos chats de forma serena quando oportuno.",
      functionalResultsKey: "Atração autêntica mútua, relações tranquilas baseadas na liberdade responsável e crescimento progressivo da autoconfiança de subsistência.",
      functionalAdvantages: "Paz existencial indestrutível, aproveitamento máximo do tempo operacional diário e preservação de relacionamentos prósperos e duradouros."
    },
    {
      label: "Subjugação vs. Escolha Assertiva",
      disfunctionalSchema: "Esquema de Subjugação (Necessidade de Expressão de Sentimentos desregulada).",
      disfunctionalThought: "Se eu pontuar que aquela imposição em grupo foi nociva, eles ficarão intensamente chateados e me rotularão como um elemento perturbador e passível de exclusão.",
      disfunctionalBehavior: "Engolir o incômodo ríspido fingindo anuência integral, acumulando mágoas secretas ocultadas deliberadamente.",
      disfunctionalResults: "Sobrecarga estressante crônica de afazeres indesejáveis alheios, amargura interna acumulada e ressentimento velado contra os líderes.",
      disfunctionalDisadvantages: "Anulação da própria identidade, somatizações físicas intestinais frequentes e manutenção da passividade crônica.",
      
      functionalSchema: "Assertividade e Direcionamento do Self (Necessidade de Autoexpressão autorregulada).",
      functionalThought: "Eu tenho o direito legítimo e o dever ético de expressar meus reais limites com presteza e gentileza. A cooperação amadurecida exige respeito bilateral.",
      functionalBehavior: "Solicitar reunião transparente de alinhamento com escuta pacífica e elencar as ressalvas operacionais de forma profissional baseada em métricas.",
      functionalResultsKey: "Construção de limites corporativos invioláveis, reconhecimento sincero da equipe por transparência e alívio do peso emocional.",
      functionalAdvantages: "Prevenção direta do Burnout corporativo, preservação da integridade moral interna e liberdade decisória de vida."
    },
    {
      label: "Padrões Inflexíveis vs. Realismo Compassivo",
      disfunctionalSchema: "Esquema de Padrões Inflexíveis / Postura Crítica (Necessidade de Hedonismo/Sensibilidade desregulada).",
      disfunctionalThought: "Qualquer produtividade e desempenho menor do que 100% de dedicação com autoafirmação impecável diária equivale a um fracasso deplorável e preguiçoso.",
      disfunctionalBehavior: "Ignorar intencionalmente sinais graves de estafa e privação básica de saúde mental para manter-se trabalhando sob efeito de cafeína pura.",
      disfunctionalResults: "Altos picos de ansiedade desestimuladora com episódios de exaustão depressiva profunda e incapacidade real de relaxamento familiar.",
      disfunctionalDisadvantages: "Apatia emocional disseminada, prejuízo das conexões lúdicas infantis familiares e desenvolvimento de quadros cardiológicos subclínicos.",
      
      functionalSchema: "Autoaceitação Progressiva e Autocuidado (Necessidade de Lazer e Autoestima autorregulada).",
      functionalThought: "O descanso biológico planejado constitui um componente imperioso e científico da própria excelência funcional de longo prazo. Eu mereço acolhimento gentil.",
      functionalBehavior: "Inserir blocos intocáveis de repouso no final de semana, desfrutar de passatempos leves sem celular e delegar demandas acessórias em grupo.",
      functionalResultsKey: "Recuperação consolidada do entusiasmo laboral, presença afetiva lúcida junto à família e estabilização de hormônios do metabolismo.",
      functionalAdvantages: "Longevidade física vigorosa, criatividade expandida pelo silêncio cerebral e amadurecimento sustentável de conquistas de carreira."
    }
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (confirm("Gostaria de carregar este preset de transição de mecanismo? Isso inserirá um novo formulário clínico interativo.")) {
      const newId = "transition_" + Date.now();
      const newTransition: TransitionMechanism = {
        id: newId,
        disfunctionalSchema: preset.disfunctionalSchema,
        disfunctionalThought: preset.disfunctionalThought,
        disfunctionalBehavior: preset.disfunctionalBehavior,
        disfunctionalResults: preset.disfunctionalResults,
        disfunctionalDisadvantages: preset.disfunctionalDisadvantages,
        functionalSchema: preset.functionalSchema,
        functionalThought: preset.functionalThought,
        functionalBehavior: preset.functionalBehavior,
        functionalResultsKey: preset.functionalResultsKey,
        functionalAdvantages: preset.functionalAdvantages
      };
      setState(prev => ({
        ...prev,
        transitions: [...prev.transitions, newTransition]
      }));
      setSelectedId(newId);
    }
  };

  const handleCreateNew = () => {
    const newId = "transition_" + Date.now();
    const newTransition: TransitionMechanism = {
      id: newId,
      disfunctionalSchema: "Esquema desregulado ou Necessidade desregulada...",
      disfunctionalThought: "Pensamento automático disfuncional ou crença polarizada...",
      disfunctionalBehavior: "Comportamento disfuncional (padrões de fuga, esquiva ou reativos)...",
      disfunctionalResults: "Resultados indesejáveis/colaterais nocivos decorrentes...",
      disfunctionalDisadvantages: "Desvantagens de perpetuar este mecanismo no curto/médio/longo prazo...",
      functionalSchema: "Esquema saudável ou Necessidade autorregulada...",
      functionalThought: "Pensamento alternativo funcional realista baseado em fatos...",
      functionalBehavior: "Comportamento saudável e adaptativo (habilidades psicológicas)...",
      functionalResultsKey: "Resultados desejáveis e reforçadores naturais estáveis...",
      functionalAdvantages: "Vantagens sustentadas de incorporar esta conduta regulada..."
    };
    setState(prev => ({
      ...prev,
      transitions: [...prev.transitions, newTransition]
    }));
    setSelectedId(newId);
    setViewMode("editor");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Gostaria de excluir definitivamente esta Transição de Mecanismo?")) {
      setState(prev => {
        const filtered = prev.transitions.filter(t => t.id !== id);
        return { ...prev, transitions: filtered };
      });
      if (selectedId === id) {
        const remaining = state.transitions.filter(t => t.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const updateField = (field: keyof TransitionMechanism, val: string) => {
    if (!selectedId) return;
    setState(prev => ({
      ...prev,
      transitions: prev.transitions.map(item => 
        item.id === selectedId ? { ...item, [field]: val } : item
      )
    }));
  };

  const activeTransition = state.transitions.find(t => t.id === selectedId);

  // Calculates Transition Success Index (Índice de Eficácia Transicional - IET)
  const calculateIET = (item: TransitionMechanism) => {
    // Basic weight starts at 15
    let score = 15;
    const disfunctionalFields: (keyof TransitionMechanism)[] = [
      "disfunctionalSchema", "disfunctionalThought", "disfunctionalBehavior", "disfunctionalResults", "disfunctionalDisadvantages"
    ];
    const functionalFields: (keyof TransitionMechanism)[] = [
      "functionalSchema", "functionalThought", "functionalBehavior", "functionalResultsKey", "functionalAdvantages"
    ];

    let filledDisf = 0;
    disfunctionalFields.forEach(f => {
      const val = item[f] as string;
      if (val && val.length > 15 && !val.includes("Esquema desregulado") && !val.includes("...") && !val.startsWith("Pensamento automático")) filledDisf++;
    });

    let filledFunc = 0;
    functionalFields.forEach(f => {
      const val = item[f] as string;
      if (val && val.length > 15 && !val.includes("Esquema saudável") && !val.includes("...") && !val.startsWith("Pensamento alternativo")) filledFunc++;
    });

    // Score is heavily weighted by the functional (constructive) resolution side
    score += (filledDisf * 6); // max 30
    score += (filledFunc * 11); // max 55
    // Max is 15 + 30 + 55 = 100
    return Math.min(100, score);
  };

  const activeIET = activeTransition ? calculateIET(activeTransition) : 0;
  const totalCount = state.transitions.length;
  const avgIET = totalCount > 0
    ? Math.round(state.transitions.reduce((acc, t) => acc + calculateIET(t), 0) / totalCount)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn" id="transicao-view-container">

      {/* Brand Instruction Header */}
      <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/20 p-4 rounded-xl text-xs text-cyan-300 space-y-1 block animate-fadeIn" id="transicao-mecanismo-header">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">🔬 INSTRUMENTO 19: TRANSIÇÃO PARA MECANISMO FUNCIONAL</strong>
        <span className="text-gray-400 font-sans">
          Esta ferramenta estrutural auxilia na transição dinâmica do diagnóstico de psicopatologia (<strong>Mecanismo Disfuncional</strong>, baseado em esquemas e necessidades psíquicas desreguladas) para o tratamento proeminente e emancipação comportamental (<strong>Mecanismo Funcional</strong>, baseado no treino ativo de novas Habilidades Clínicas de 4ª Geração). Utilize os painéis comparativos ou carregue presets abaixo para projetar um ciclo de mudanças factíveis com o seu paciente.
        </span>
      </div>

      {/* Patient Profile Card Header */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="patient-card-transicao">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente Corrente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Nenhum Paciente Cadastrado"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Nível de Transição</span>
          <span className="text-cyan-400 font-sans text-xs font-bold py-1 block flex items-center gap-1">
            <RefreshCw className="w-4 h-4 text-cyan-400 rotate-180" />
            Amadurecimento e Delineamento Adaptativo
          </span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paradigma Clínico</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Terapia de Esquema Orientada a HabilidadesPsic</div>
        </div>
      </div>

      {/* Clinical Presets Selection Panel */}
      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 space-y-2" id="presets-container-trans">
        <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          ⚡ Carregar Casos Clínicos Estruturados para Análise & Treino:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-[10.5px] font-sans font-medium px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500 hover:bg-cyan-950/10 transition-all cursor-pointer block"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numeric calculations metadata columns / stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="stats-row-trans">
        
        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-trans-count">
          <div className="space-y-0.5">
            <span className="text-gray-500 font-mono text-[9px] uppercase block">Esquemas Mapeados</span>
            <span className="font-mono text-xl font-bold text-gray-200 block">{totalCount} Mecanismos</span>
          </div>
          <Activity className="w-8 h-8 text-gray-750" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-trans-avg">
          <div className="space-y-0.5">
            <span className="text-cyan-400 font-mono text-[9px] uppercase block">Índice Eficácia Transicional (IET) Médio</span>
            <span className="font-mono text-xl font-bold text-cyan-400 block">{avgIET}% de Integração</span>
          </div>
          <Heart className="w-8 h-8 text-cyan-950/30" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-trans-current-factor">
          <div className="space-y-0.5">
            <span className="text-emerald-400 font-mono text-[9px] uppercase block">Eficácia Estrutural Escolhida</span>
            <span className="font-mono text-xl font-bold text-emerald-400 block">
              {activeTransition ? `${activeIET}%` : "0%"}
            </span>
          </div>
          <Award className="w-8 h-8 text-emerald-950/30" />
        </div>

      </div>

      {/* Upper Navigation and Action Bar */}
      <div className="flex justify-between items-center bg-gray-950/60 p-2.5 rounded-xl border border-gray-900" id="transicao-navigation-bar">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode("editor")}
            className={`text-xs px-3 py-1.5 rounded-lg font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "editor" 
                ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Mapeamento de Transições</span>
          </button>
          
          <button
            type="button"
            disabled={!activeTransition}
            onClick={() => setViewMode("canvas")}
            className={`text-xs px-3 py-1.5 rounded-lg font-sans font-bold transition-all flex items-center gap-1.5 ${
              !activeTransition 
                ? "opacity-55 cursor-not-allowed text-gray-750"
                : viewMode === "canvas"
                  ? "bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-cyan-300"
                  : "text-gray-400 hover:text-white cursor-pointer"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Matriz Ilustrada de Transição</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="px-3.5 py-1.5 text-xs rounded-xl bg-cyan-400 text-black font-extrabold hover:bg-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Transição</span>
        </button>
      </div>

      {/* Body Area */}
      {viewMode === "editor" ? (
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="editor-grid-container-trans">
          
          {/* Left panel sidebar listing items */}
          <div className="lg:col-span-3 flex flex-col space-y-2" id="trans-sidebar-list">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono font-bold block mb-1">Mecanismos Sincronizados ({totalCount}):</span>
            
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {state.transitions.length > 0 ? (
                state.transitions.map(item => {
                  const isSelected = item.id === selectedId;
                  const itemIET = calculateIET(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative group cursor-pointer ${
                        isSelected 
                          ? "bg-[#111217] border-cyan-500/40 text-white shadow-md" 
                          : "bg-gray-950/40 border-gray-900/50 hover:border-gray-850 text-gray-400"
                      }`}
                      id={`trans-sidebar-item-${item.id}`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-l-xl" />
                      )}
                      
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-0.5 block flex-1">
                          <span className="text-[8px] uppercase font-mono font-extrabold text-cyan-400 block tracking-wide">
                            Transição Atual:
                          </span>
                          <p className="text-xs font-sans font-bold text-gray-200 line-clamp-2 leading-tight">
                            {item.functionalSchema.replace("Esquema saudável ou ", "").split("(")[0] || "Esquema sem identificação"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="text-gray-650 hover:text-red-500 transition-colors p-0.5 cursor-pointer opacity-30 group-hover:opacity-100 shrink-0"
                          title="Excluir este mapeamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-gray-900/40 text-[8.5px] font-mono">
                        <span className="text-gray-500 truncate max-w-[130px]" title={item.disfunctionalSchema}>Disf: {item.disfunctionalSchema.split("(")[0]}</span>
                        <span className={`px-1 rounded-sm text-[8px] ${
                          itemIET >= 75 ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                        }`}>IET: {itemIET}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-gray-650 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-xl bg-gray-950/10">
                  Nenhuma transição criada. Escolha um dos presets estruturados acima ou elabore um do zero para este paciente.
                </div>
              )}
            </div>
          </div>

          {/* Comparing Editor Workspace Block */}
          <div className="lg:col-span-9 flex flex-col space-y-6" id="edit-pane-trans">
            {activeTransition ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dual-comparison-columns">
                
                {/* COLUMN 1: MECANISMO DISFUNCIONAL (RED CANVAS ACCENT) */}
                <div className="bg-[#1c1112]/40 rounded-2xl border border-red-950/30 p-5 space-y-5 animate-slideInLeft" id="left-disfunctional-card">
                  
                  <div className="border-b border-red-950/35 pb-2.5 flex items-center justify-between" id="disf-col-header">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-black text-rose-450 uppercase block tracking-wider">PADRÃO PATOLÓGICO</span>
                      <h4 className="text-xs font-sans font-extrabold text-red-200">MECANISMO DISFUNCIONAL</h4>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </div>

                  {/* 1. Schema desregulado */}
                  <div className="space-y-1 block">
                    <label className="text-red-300 text-[10px] font-extrabold uppercase tracking-wide font-mono block">Esquema ou Necessidade Psicológica Desregulada:</label>
                    <textarea
                      value={activeTransition.disfunctionalSchema}
                      onChange={(e) => updateField("disfunctionalSchema", e.target.value)}
                      className="w-full h-20 p-2.5 bg-gray-950/90 border border-red-950/10 rounded-xl text-xs text-red-150 font-sans focus:outline-none focus:ring-1 focus:ring-red-500 resize-none leading-relaxed"
                      placeholder="Identifique o esquema inicial ou necessidade em privação não atendida de forma saudável..."
                    />
                  </div>

                  {/* 2. Pensamento disfuncional */}
                  <div className="space-y-1 block">
                    <label className="text-red-300 text-[10px] font-extrabold uppercase tracking-wide font-mono block">Pensamento Disfuncional / Crença Polarizada:</label>
                    <textarea
                      value={activeTransition.disfunctionalThought}
                      onChange={(e) => updateField("disfunctionalThought", e.target.value)}
                      className="w-full h-24 p-2.5 bg-gray-950/90 border border-red-950/10 rounded-xl text-xs text-red-150 font-sans focus:outline-none focus:ring-1 focus:ring-red-500 resize-none leading-relaxed"
                      placeholder="Distorção cognitiva inconsciente que se ativa perante o contexto gatilho..."
                    />
                  </div>

                  {/* 3. Comportamento disfuncional */}
                  <div className="space-y-1 block">
                    <label className="text-red-300 text-[10px] font-extrabold uppercase tracking-wide font-mono block">Comportamento Disfuncional (Excessos / Fugas):</label>
                    <textarea
                      value={activeTransition.disfunctionalBehavior}
                      onChange={(e) => updateField("disfunctionalBehavior", e.target.value)}
                      className="w-full h-24 p-2.5 bg-gray-950/90 border border-red-950/10 rounded-xl text-xs text-red-150 font-sans focus:outline-none focus:ring-1 focus:ring-red-500 resize-none leading-relaxed"
                      placeholder="Atos operantes autodestrutivos de fuga-esquiva ativa, passiva ou compensação do esquema..."
                    />
                  </div>

                  {/* 4. Resultados colaterais */}
                  <div className="space-y-1 block">
                    <label className="text-red-300 text-[10px] font-extrabold uppercase tracking-wide font-mono block">Resultados Colaterais Obtidos:</label>
                    <textarea
                      value={activeTransition.disfunctionalResults}
                      onChange={(e) => updateField("disfunctionalResults", e.target.value)}
                      className="w-full h-20 p-2.5 bg-gray-950/90 border border-red-950/10 rounded-xl text-xs text-red-150 font-sans focus:outline-none focus:ring-1 focus:ring-red-500 resize-none leading-relaxed"
                      placeholder="Retornos imediatos do ambiente que reforçam ou punem o comportamento a curto prazo..."
                    />
                  </div>

                  {/* 5. Desvantagens do Mecanismo */}
                  <div className="space-y-1 block pt-2.5 border-t border-red-950/30">
                    <label className="text-rose-400 text-[10px] font-black uppercase tracking-widest font-mono block flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-rose-500" />
                      DESVANTAGENS DO MECANISMO DISFUNCIONAL:
                    </label>
                    <textarea
                      value={activeTransition.disfunctionalDisadvantages}
                      onChange={(e) => updateField("disfunctionalDisadvantages", e.target.value)}
                      className="w-full h-28 p-2.5 bg-[#150a0a] border border-red-950/20 rounded-xl text-xs text-red-100 font-sans focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
                      placeholder="Qual é o custo destrutivo acumulativo de permanecer aplicando este padrão desajustado no longo prazo..."
                    />
                  </div>

                </div>

                {/* COLUMN 2: MECANISMO FUNCIONAL (EMERALD CANVAS ACCENT) */}
                <div className="bg-[#111c16]/40 rounded-2xl border border-emerald-950/30 p-5 space-y-5 animate-slideInRight" id="right-functional-card">
                  
                  <div className="border-b border-emerald-950/35 pb-2.5 flex items-center justify-between" id="func-col-header">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-black text-emerald-450 uppercase block tracking-wider">REPERTÓRIO ADAPTATIVO</span>
                      <h4 className="text-xs font-sans font-extrabold text-emerald-250">MECANISMO FUNCIONAL / SAUDÁVEL</h4>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* 1. Schema regulado */}
                  <div className="space-y-1 block">
                    <label className="text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide font-mono block">Esquema Saudável ou Necessidade Autorregulada:</label>
                    <textarea
                      value={activeTransition.functionalSchema}
                      onChange={(e) => updateField("functionalSchema", e.target.value)}
                      className="w-full h-20 p-2.5 bg-gray-950/90 border border-emerald-950/10 rounded-xl text-xs text-emerald-150 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                      placeholder="Como fica essa necessidade sob as rédeas do Adulto Saudável ou modo compassivo..."
                    />
                  </div>

                  {/* 2. Pensamento funcional */}
                  <div className="space-y-1 block">
                    <label className="text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide font-mono block">Pensamento Alternativo Funcional / Realista:</label>
                    <textarea
                      value={activeTransition.functionalThought}
                      onChange={(e) => updateField("functionalThought", e.target.value)}
                      className="w-full h-24 p-2.5 bg-gray-950/90 border border-emerald-950/10 rounded-xl text-xs text-emerald-150 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                      placeholder="Qual é a resposta cognitiva realista, objetiva, ética e baseada em fatos alternativos..."
                    />
                  </div>

                  {/* 3. Comportamento funcional */}
                  <div className="space-y-1 block">
                    <label className="text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide font-mono block">Comportamento Funcional (Habilidades Clínicas):</label>
                    <textarea
                      value={activeTransition.functionalBehavior}
                      onChange={(e) => updateField("functionalBehavior", e.target.value)}
                      className="w-full h-24 p-2.5 bg-gray-950/90 border border-emerald-950/10 rounded-xl text-xs text-emerald-150 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                      placeholder="Atos operantes adaptativos, assertivos, de autoproteção e engajamento orientados por valores..."
                    />
                  </div>

                  {/* 4. Resultados desejados */}
                  <div className="space-y-1 block">
                    <label className="text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide font-mono block">Resultados Desejados no Longo Prazo:</label>
                    <textarea
                      value={activeTransition.functionalResultsKey}
                      onChange={(e) => updateField("functionalResultsKey", e.target.value)}
                      className="w-full h-20 p-2.5 bg-gray-950/90 border border-emerald-950/10 rounded-xl text-xs text-emerald-150 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                      placeholder="Ganhos significativos do ambiente decorrentes de agir sob autorregulação sustentável de valores..."
                    />
                  </div>

                  {/* 5. Vantagens do Mecanismo Funcional */}
                  <div className="space-y-1 block pt-2.5 border-t border-emerald-950/30">
                    <label className="text-[#00D1FF] text-[10px] font-black uppercase tracking-widest font-mono block flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                      VANTAGENS DO MECANISMO FUNCIONAL:
                    </label>
                    <textarea
                      value={activeTransition.functionalAdvantages}
                      onChange={(e) => updateField("functionalAdvantages", e.target.value)}
                      className="w-full h-28 p-2.5 bg-[#0a1511] border border-emerald-950/20 rounded-xl text-xs text-emerald-100 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
                      placeholder="Por que vale extraordinariamente a pena investir energia para estruturar e adotar este novo repertório..."
                    />
                  </div>

                </div>

              </div>
            ) : (
              <div className="text-center py-24 text-gray-650 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-2xl bg-[#111217] flex flex-col items-center justify-center space-y-2 animate-pulse">
                <RefreshCw className="w-10 h-10 text-gray-800" />
                <span>Nenhuma transição selecionada. Clique em um dos registros na barra lateral ou gere um novo formulário clínico interativo.</span>
              </div>
            )}

            {/* General clinician notes */}
            {activeTransition && (
              <div className="bg-[#111217] p-5 rounded-2xl border border-gray-900 space-y-2 block" id="clinical-notes-trans-footer">
                <label className="text-gray-400 text-[10px] font-mono font-bold uppercase tracking-wider block">📝 COMENTÁRIOS GERAIS DE PLANO DE AÇÃO E DIRETRIZES DE MANEJO:</label>
                <textarea
                  value={state.clinicalNotes}
                  onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                  className="w-full min-h-[70px] bg-gray-950 border border-gray-900 text-xs text-gray-350 font-sans p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Elabore observações técnicas, cronograma de imersões do paciente de treino comportamental, ou estratégias complementares de relaxamento..."
                />
              </div>
            )}

          </div>

        </div>
      ) : (
        
        // MATRIZ DO LIVRO DE MESA LANDSCAPE-MIMICKING CANVAS
        <div className="w-full max-w-7xl mx-auto py-2 flex flex-col space-y-6" id="trans-matrix-canvas">
          {activeTransition ? (
            <div className="space-y-4">
              
              <p className="text-[11px] text-center text-gray-500 italic max-w-2xl mx-auto">
                A visualização sob Matriz Ilustrada imita o desenho padrão e estrutural da folha de consultório Inteligência Psicológica, facilitando o auto-alinhamento reflexivo do paciente na transição de mecanismos.
              </p>

              {/* Physical Mimicking Canvas Board */}
              <div className="bg-white text-gray-950 rounded-2xl p-7 shadow-2xl border-4 border-gray-900 relative font-sans select-text block overflow-x-auto" id="clean-sheet-canvas-panel">
                <div className="min-w-[1020px] space-y-6">
                  
                  {/* Title and brands info */}
                  <div className="flex justify-between items-center border-b-2 border-gray-900 pb-2.5" id="p-header-trans flex">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-black tracking-tighter text-gray-900 font-sans leading-none">TRANSIÇÃO PARA MECANISMO FUNCIONAL</h3>
                      <span className="text-[9px] font-mono font-black text-gray-500 mt-1 uppercase tracking-widest leading-none">SÍNTESE ATIVA DE MUDANÇA COGNITIVO-COMPORTAMENTAL</span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[9px] font-mono font-black text-gray-800 tracking-wide block uppercase leading-none">INTELIGÊNCIA PSICOLÓGICA</span>
                      <span className="text-[7.5px] text-gray-450 font-sans block mt-0.5 uppercase">MÉTODO POUBEL E RODRIGUES</span>
                    </div>
                  </div>

                  {/* Top clinical meta block */}
                  <div className="grid grid-cols-4 gap-4 p-3 bg-gray-100 border border-gray-300 rounded text-[9px] font-mono text-gray-600" id="matrix-meta-head">
                    <div>
                      <strong>PACIENTE:</strong> <span className="font-sans font-bold text-gray-950 text-[10px] ml-1">{patient.name || "NÃO CONSOLIDADO"}</span>
                    </div>
                    <div>
                      <strong>PROFISSIONAL:</strong> <span className="font-sans text-gray-900 text-[10px] ml-1">Supervisor Clínico TCC</span>
                    </div>
                    <div>
                      <strong>DATA:</strong> <span className="font-sans text-gray-900 text-[10px] ml-1">Junho, 2026</span>
                    </div>
                    <div className="text-right">
                      <strong>EFICÁCIA TRANSICIONAL (IET):</strong> <span className="font-sans font-bold text-cyan-800 text-[10.5px]">{activeIET}%</span>
                    </div>
                  </div>

                  {/* Dual Grid Comparison exactly mirroring PDF Columns */}
                  <div className="grid grid-cols-2 gap-8 text-xs font-sans leading-relaxed" id="trans-dual-grid-mesh">
                    
                    {/* LEFT RED COLUMN: MECANISMO DISFUNCIONAL */}
                    <div className="border border-red-300 rounded-xl overflow-hidden divide-y divide-gray-300 bg-red-50/5 flex flex-col" id="print-left-disf">
                      
                      {/* Section header */}
                      <div className="bg-red-100 p-2 text-center font-extrabold uppercase text-[9.5px] text-red-900 tracking-wider">
                        MECANISMO DISFUNCIONAL
                      </div>

                      {/* 1. Eq desregulado */}
                      <div className="p-4 flex flex-col min-h-[90px] justify-between">
                        <span className="text-[8px] font-black text-red-800 uppercase tracking-wider block">A. ESQUEMA OU NP DESREGULADA:</span>
                        <p className="text-[10.5px] text-gray-900 font-medium font-serif mt-1 italic leading-relaxed">
                          {activeTransition.disfunctionalSchema || "Não especificado."}
                        </p>
                      </div>

                      {/* 2. Pensamento disf */}
                      <div className="p-4 flex flex-col min-h-[105px] justify-between">
                        <span className="text-[8px] font-black text-red-800 uppercase tracking-wider block">B. PENSAMENTO DISFUNCIONAL:</span>
                        <p className="text-[10.5px] text-red-950 font-semibold mt-1 leading-relaxed">
                          {activeTransition.disfunctionalThought || "Não especificado."}
                        </p>
                      </div>

                      {/* 3. Comp disf */}
                      <div className="p-4 flex flex-col min-h-[115px] justify-between">
                        <span className="text-[8px] font-black text-red-800 uppercase tracking-wider block">C. COMPORTAMENTO DISFUNCIONAL (Excessos/Fugas):</span>
                        <p className="text-[10.5px] text-red-950 leading-relaxed mt-1">
                          {activeTransition.disfunctionalBehavior || "Não especificado."}
                        </p>
                      </div>

                      {/* 4. Resultados colat */}
                      <div className="p-4 flex flex-col min-h-[85px] justify-between">
                        <span className="text-[8px] font-black text-red-800 uppercase tracking-wider block">D. RESULTADOS ADVERSOS / MANUTENÇÃO:</span>
                        <p className="text-[10.5px] text-gray-800 leading-normal mt-1">
                          {activeTransition.disfunctionalResults || "Não especificado."}
                        </p>
                      </div>

                      {/* LOWER COMP: DESVANTAGENS DETALHADAS */}
                      <div className="p-4.5 bg-red-50/20 border-t-2 border-red-300 mt-auto flex flex-col min-h-[180px] justify-between rounded-b-xl">
                        <span className="text-[8.5px] font-black text-red-950 uppercase tracking-widest block border-b border-red-200 pb-1.5 mb-2">Desvantagens do Mecanismo Disfuncional (Custo de Vida)</span>
                        <p className="text-[10.5px] text-red-900 uppercase font-sans font-bold leading-normal italic">
                          "{activeTransition.disfunctionalDisadvantages || "Não mapeado."}"
                        </p>
                      </div>

                    </div>

                    {/* RIGHT GREEN COLUMN: MECANISMO FUNCIONAL */}
                    <div className="border border-emerald-300 rounded-xl overflow-hidden divide-y divide-gray-300 bg-emerald-51/5 flex flex-col" id="print-right-func">
                      
                      {/* Section header */}
                      <div className="bg-emerald-100 p-2 text-center font-extrabold uppercase text-[9.5px] text-emerald-900 tracking-wider">
                        MECANISMO FUNCIONAL / SAUDÁVEL
                      </div>

                      {/* 1. Eq regulado */}
                      <div className="p-4 flex flex-col min-h-[90px] justify-between">
                        <span className="text-[8px] font-black text-emerald-800 uppercase tracking-wider block">A. ESQUEMA OU NP REGULADA (Adulto Saudável):</span>
                        <p className="text-[10.5px] text-gray-900 font-bold font-sans mt-1 leading-relaxed">
                          {activeTransition.functionalSchema || "Não especificado."}
                        </p>
                      </div>

                      {/* 2. Pensamento func */}
                      <div className="p-4 flex flex-col min-h-[105px] justify-between">
                        <span className="text-[8px] font-black text-emerald-800 uppercase tracking-wider block">B. PENSAMENTO FUNCIONAL / RACIOCÍNIO SAUDÁVEL:</span>
                        <p className="text-[10.5px] text-emerald-950 font-bold mt-1 leading-relaxed pr-2">
                          {activeTransition.functionalThought || "Não especificado."}
                        </p>
                      </div>

                      {/* 3. Comp func */}
                      <div className="p-4 flex flex-col min-h-[115px] justify-between">
                        <span className="text-[8px] font-black text-emerald-800 uppercase tracking-wider block">C. COMPORTAMENTO FUNCIONAL (HabilidadesPsic):</span>
                        <p className="text-[10.5px] text-emerald-950 font-semibold leading-relaxed mt-1">
                          {activeTransition.functionalBehavior || "Não especificado."}
                        </p>
                      </div>

                      {/* 4. Metas colat */}
                      <div className="p-4 flex flex-col min-h-[85px] justify-between">
                        <span className="text-[8px] font-black text-emerald-800 uppercase tracking-wider block">D. RESULTADOS DESEJADOS / REFORÇO SADIO:</span>
                        <p className="text-[10.5px] text-gray-800 leading-normal mt-1">
                          {activeTransition.functionalResultsKey || "Não especificado."}
                        </p>
                      </div>

                      {/* LOWER COMP: VANTAGENS DETALHADAS */}
                      <div className="p-4.5 bg-cyan-50/20 border-t-2 border-emerald-300 mt-auto flex flex-col min-h-[180px] justify-between rounded-b-xl">
                        <span className="text-[8.5px] font-black text-cyan-900 uppercase tracking-widest block border-b border-cyan-200 pb-1.5 mb-2">Vantagens do Mecanismo Funcional (Ganhos de Vida)</span>
                        <p className="text-[10.5px] text-cyan-850 uppercase font-sans font-bold leading-normal italic">
                          "{activeTransition.functionalAdvantages || "Não mapeado."}"
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* General therapeutic comments footer */}
                  {state.clinicalNotes && (
                    <div className="p-4.5 bg-gray-50 border border-gray-300 rounded-xl space-y-1 block mt-4" id="matrix-trans-clinical-footer">
                      <span className="text-[8px] font-mono font-black text-gray-650 block uppercase tracking-wider">APONTAMENTOS CLÍNICOS ADICIONAIS E AGENDA DE IMERSÕES:</span>
                      <p className="text-[10px] font-sans text-gray-850 font-normal leading-relaxed pr-4">{state.clinicalNotes}</p>
                    </div>
                  )}

                  {/* Small footer copy credit line */}
                  <div className="text-center pt-4 border-t border-gray-200 text-[8px] text-gray-500 font-mono" id="print-sheet-credit">
                    PRODUTO ORIGINAL INTELIGÊNCIA PSICOLÓGICA • CONCEPÇÃO INTEGRATIVA POR LINCOLN POUBEL E PEDRO RODRIGUES • www.inteligenciapsicologica.com.br
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-gray-600 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-2xl bg-[#111217]">
              Sem dados clínicos disponíveis na matriz ilustrada no momento.
            </div>
          )}
        </div>

      )}

    </div>
  );
}
