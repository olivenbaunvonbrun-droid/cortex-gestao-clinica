import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Plus, Trash2, Sparkles, Award, Eye, Scale, HelpCircle, 
  CheckCircle2, AlertTriangle, Lightbulb, Clipboard, ArrowRight,
  Calculator, CheckSquare, RefreshCw, Star
} from "lucide-react";

export interface DecisionItem {
  id: string;
  text: string;
  weight: number; // 1 to 5
  isFantasy: boolean; // if true, item can be marked as fantasy and adjusted
  fantasyType: "utopia" | "catastrophism" | null;
  realistAdjustment: string; // adjusted realistically optimistic version
}

export interface ExameDuploVantagensState {
  alternativa1: string;
  alternativa2: string;
  pros1: DecisionItem[];
  contras1: DecisionItem[];
  pros2: DecisionItem[];
  contras2: DecisionItem[];
  clinicalNotes: string;
}

interface ExameDuploVantagensViewProps {
  patient: PatientInfo;
  state: ExameDuploVantagensState;
  setState: React.Dispatch<React.SetStateAction<ExameDuploVantagensState>>;
}

export default function ExameDuploVantagensView({
  patient,
  state,
  setState
}: ExameDuploVantagensViewProps) {
  const [viewMode, setViewMode] = useState<"editor" | "canvas">("editor");
  const [editingItem, setEditingItem] = useState<{
    listName: "pros1" | "contras1" | "pros2" | "contras2";
    itemId: string;
  } | null>(null);

  // Clinical decision-making presets
  const DECISION_PRESETS = [
    {
      label: "Mudar de Carreira vs. Permanecer no Emprego",
      alternativa1: "Mudar para transição de carreira de Tecnologia / Empreendedorismo autonomamente.",
      alternativa2: "Manter cargo no emprego atual corporativo tradicional garantindo estabilidade.",
      pros1: [
        {
          id: "p1_1",
          text: "Sensação profunda de autonomia, flexibilidade de horários extrema.",
          weight: 5,
          isFantasy: true,
          fantasyType: "utopia",
          realistAdjustment: "Maior autonomia e flexibilidade na agenda, embora requeira disciplina militar e autogestão rigorosa."
        },
        {
          id: "p1_2",
          text: "Ganhos financeiros ilimitados escaláveis em médio prazo.",
          weight: 4,
          isFantasy: false,
          fantasyType: null,
          realistAdjustment: ""
        }
      ],
      contras1: [
        {
          id: "c1_1",
          text: "Ficarei completamente sem dinheiro no primeiro mês e passarei fome.",
          weight: 5,
          isFantasy: true,
          fantasyType: "catastrophism",
          realistAdjustment: "Período de instabilidade financeira inicial que exige uma reserva financeira de segurança para no mínimo 6 a 12 meses."
        },
        {
          id: "c1_2",
          text: "Necessidade de arcar sozinho com impostos, contabilidade e captação de clientes.",
          weight: 4,
          isFantasy: false,
          fantasyType: null,
          realistAdjustment: ""
        }
      ],
      pros2: [
        {
          id: "p2_1",
          text: "Estabilidade do salário previsível na conta todo dia 5 de forma inflexível.",
          weight: 5,
          isFantasy: false,
          fantasyType: null,
          realistAdjustment: ""
        },
        {
          id: "p2_2",
          text: "Benefícios corporativos (plano de saúde excelente, FGTS, vale alimentação).",
          weight: 4,
          isFantasy: false,
          fantasyType: null,
          realistAdjustment: ""
        }
      ],
      contras2: [
        {
          id: "c2_1",
          text: "Estagnação existencial absoluta, depressão severa crônica e desperdício total do meu cérebro.",
          weight: 5,
          isFantasy: true,
          fantasyType: "catastrophism",
          realistAdjustment: "Prejuízo na satisfação profissional e limitação de crescimento expressivo, mas posso desenvolver projetos paralelos de lazer."
        },
        {
          id: "c2_2",
          text: "Rotina estressante com liderança disfuncional e tarefas burocráticas monótonas.",
          weight: 4,
          isFantasy: false,
          fantasyType: null,
          realistAdjustment: ""
        }
      ]
    },
    {
      label: "Terminar Relação Instável vs. Continuar e Limitar",
      alternativa1: "Terminar o namoro de 3 anos marcado por ciúmes, discussões constantes e quebras de acordo.",
      alternativa2: "Continuar mantendo o relacionamento, exigindo terapia individual e acordando limites rigorosos.",
      pros1: [
        {
          id: "p1_1",
          text: "Ausência total de brigas desnecessárias, recuperação de tranquilidade emocional e foco existencial.",
          weight: 5,
          isFantasy: false,
          fantasyType: null,
          realistAdjustment: ""
        },
        {
          id: "p1_2",
          text: "Sensação de liberdade e possibilidade de explorar novos relacionamentos mais compatíveis.",
          weight: 4,
          isFantasy: false,
          fantasyType: null,
          realistAdjustment: ""
        }
      ],
      contras1: [
        {
          id: "c1_1",
          text: "Vou sofrer uma solidão eterna e nunca mais encontrarei alguém que se conecte minimamente comigo.",
          weight: 5,
          isFantasy: true,
          fantasyType: "catastrophism",
          realistAdjustment: "Sofrimento e luto agudos no início, mas com tempo e melhora de habilidades sociais, estabelecerei novos vínculos saudáveis."
        }
      ],
      pros2: [
        {
          id: "p2_1",
          text: "Ele(a) mudará da água para o vinho instantaneamente se formos à terapia e seremos perfeitos.",
          weight: 5,
          isFantasy: true,
          fantasyType: "utopia",
          realistAdjustment: "Haverá um espaço estruturado para dialogar e mediar conflitos, reduzindo a hostilidade, embora as mudanças sejam lentas e exijam esforço bilateral."
        },
        {
          id: "p2_2",
          text: "Preservação da história afetiva compartilhada, rede de apoio comum e apego estabelecido.",
          weight: 4,
          isFantasy: false,
          fantasyType: null,
          realistAdjustment: ""
        }
      ],
      contras2: [
        {
          id: "c2_1",
          text: "Desgaste psicológico recorrente se as promessas de reformulação não saírem do papel de forma prática.",
          weight: 5,
          isFantasy: false,
          fantasyType: null,
          realistAdjustment: ""
        }
      ]
    }
  ];

  const handleApplyPreset = (preset: typeof DECISION_PRESETS[0]) => {
    if (confirm("Deseja substituir as alternativas e itens atuais pela simulação clínica selecionada?")) {
      setState({
        alternativa1: preset.alternativa1,
        alternativa2: preset.alternativa2,
        pros1: preset.pros1.map(i => ({ ...i })),
        contras1: preset.contras1.map(i => ({ ...i })),
        pros2: preset.pros2.map(i => ({ ...i })),
        contras2: preset.contras2.map(i => ({ ...i })),
        clinicalNotes: ""
      });
      setEditingItem(null);
    }
  };

  const handleAddItem = (listName: "pros1" | "contras1" | "pros2" | "contras2") => {
    const newItem: DecisionItem = {
      id: "item_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      text: "Novo fator a considerar...",
      weight: 3,
      isFantasy: false,
      fantasyType: null,
      realistAdjustment: ""
    };
    setState(prev => ({
      ...prev,
      [listName]: [...prev[listName], newItem]
    }));
    setEditingItem({ listName, itemId: newItem.id });
  };

  const handleDeleteItem = (listName: "pros1" | "contras1" | "pros2" | "contras2", id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => ({
      ...prev,
      [listName]: prev[listName].filter(item => item.id !== id)
    }));
    if (editingItem?.itemId === id) {
      setEditingItem(null);
    }
  };

  const handleUpdateItemField = (
    listName: "pros1" | "contras1" | "pros2" | "contras2",
    id: string,
    field: keyof DecisionItem,
    value: any
  ) => {
    setState(prev => ({
      ...prev,
      [listName]: prev[listName].map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // If unchecking fantasy, clear fantasy type and adjustment
          if (field === "isFantasy" && !value) {
            updated.fantasyType = null;
            updated.realistAdjustment = "";
          }
          // If selecting fantasy type and realistic adjustment is empty, prefill
          if (field === "fantasyType" && value && !updated.realistAdjustment) {
            updated.realistAdjustment = "Versão equilibrada e provável...";
          }
          return updated;
        }
        return item;
      })
    }));
  };

  // Calculations for Decision Values
  const getListCalculations = (items: DecisionItem[]) => {
    // An item's active weight is: 
    // - If it NOT a fantasy, then use 'weight'
    // - If it IS a fantasy, and has realistic adjustment, we still apply weight but let's calculate based on realism.
    // Standard rule: Sum of active weights.
    let totalNormal = 0;
    let totalDiscounted = 0;

    items.forEach(item => {
      // Fantasy items represent distorted thoughts (utopian or catastrophic).
      // When filtered, we should understand their "adapted" realistic weight.
      // E.g., if catastrophic, its real weight is lower than the initial anxiety-driven weight (e.g. 5 becomes a manageable 2).
      // Let's implement a system where a fantasy item's weight is adjusted or discounted.
      // If fantasy is active, we can count its adapted realistic rating as: (weight - 2) or bounded to minimum 1.
      const adaptedWeight = item.isFantasy ? Math.max(1, item.weight - 2) : item.weight;
      totalNormal += item.weight;
      totalDiscounted += adaptedWeight;
    });

    return {
      rawSum: totalNormal,
      realistSum: totalDiscounted
    };
  };

  const pros1Calcs = getListCalculations(state.pros1);
  const contras1Calcs = getListCalculations(state.contras1);
  const pros2Calcs = getListCalculations(state.pros2);
  const contras2Calcs = getListCalculations(state.contras2);

  // Decisorial Net Score (Saldo Decisório Líquido - SDL)
  // SDL = Pros - Contras
  const rawSDL1 = pros1Calcs.rawSum - contras1Calcs.rawSum;
  const realistSDL1 = pros1Calcs.realistSum - contras1Calcs.realistSum;

  const rawSDL2 = pros2Calcs.rawSum - contras2Calcs.rawSum;
  const realistSDL2 = pros2Calcs.realistSum - contras2Calcs.realistSum;

  const isSelectedObj = (listName: "pros1" | "contras1" | "pros2" | "contras2", id: string) => {
    return editingItem?.listName === listName && editingItem?.itemId === id;
  };

  const getActiveItem = () => {
    if (!editingItem) return null;
    const list = state[editingItem.listName];
    return list.find(item => item.id === editingItem.itemId) || null;
  };

  const activeItem = getActiveItem();

  return (
    <div className="space-y-6 animate-fadeIn" id="exame-duplo-vantagens-root">
      
      {/* Dynamic Header Badge Guidance */}
      <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/20 p-4 rounded-xl text-xs text-cyan-300 space-y-1 block" id="exame-duplo-clinical-info">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">⚖️ INSTRUMENTO 20: EXAME DUPLO DE VANTAGENS E DESVANTAGENS</strong>
        <span className="text-gray-400 font-sans leading-relaxed">
          Este exame auxilia na superação de bloqueios de autoindulgência, ambivalências crônicas ou decisões críticas. Ele ativa a <strong>Habilidade Psicológica (HP) de Raciocínio Realisticamente Otimista</strong> ao instigar o paciente a classificar se as vantagens/desvantagens enumeradas são fidedignas ou compostas de <strong>Utopias Idealizadas</strong> (prós irreais) ou <strong>Catastrofismos Limitantes</strong> (contras superdimensionados). Filtre as ilusões, quantifique pesos (1 a 5) e obtenha uma bússola de escolha fática.
        </span>
      </div>

      {/* Patient and Professional Clinical Metadata Panel */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono text-gray-400" id="metadata-header-exame">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente Corrente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Nenhum Paciente Selecionado"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Habilidade Psicológica Alvo</span>
          <span className="text-cyan-400 font-sans text-xs font-bold py-1 block flex items-center gap-1">
            <Scale className="w-4 h-4 text-cyan-400" />
            Raciocínio Realisticamente Otimista
          </span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Status Analítico</span>
          <span className="text-amber-400 font-sans text-xs font-bold py-1 block flex items-center gap-1">
            <RefreshCw className="w-4.5 h-4.5 animate-spin text-amber-500" />
            Detecção Ativa de Viés Racional
          </span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paradigma Clínico</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">TCC Integrativa e de Processos</div>
        </div>
      </div>

      {/* Preset Case Loader Row */}
      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 space-y-2" id="decision-presets-row">
        <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Carregar Conflitos Decisórios Clínicos de Exemplo:
        </span>
        <div className="flex flex-wrap gap-2">
          {DECISION_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-[10.5px] font-sans font-medium px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500 hover:bg-cyan-950/10 transition-all cursor-pointer block"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Core Dynamic Scoring Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="realist-sdl-scorecards">
        
        {/* ALT 1 SCORECARD */}
        <div className="bg-gray-950/60 p-4.5 rounded-xl border border-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 block">
            <span className="text-rose-400 text-[8.5px] font-mono uppercase tracking-widest block font-bold">Alternativa 1</span>
            <p className="text-xs font-sans text-gray-200 font-bold truncate max-w-sm" title={state.alternativa1}>
              {state.alternativa1 || "Não definida"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[8px] text-gray-500 uppercase font-mono block">Saldo Unfiltered</span>
              <span className={`text-sm font-mono font-bold block ${rawSDL1 >= 0 ? 'text-gray-300' : 'text-red-400'}`}>
                {rawSDL1 > 0 ? `+${rawSDL1}` : rawSDL1}
              </span>
            </div>
            <div className="h-8 w-px bg-gray-850" />
            <div className="text-right">
              <span className="text-[8px] text-cyan-400 uppercase font-mono font-bold block">Saldo Realista (SDL)</span>
              <span className={`text-lg font-mono font-bold block ${realistSDL1 >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {realistSDL1 > 0 ? `+${realistSDL1}` : realistSDL1} pto
              </span>
            </div>
          </div>
        </div>

        {/* ALT 2 SCORECARD */}
        <div className="bg-gray-950/60 p-4.5 rounded-xl border border-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 block">
            <span className="text-emerald-400 text-[8.5px] font-mono uppercase tracking-widest block font-bold">Alternativa 2</span>
            <p className="text-xs font-sans text-gray-200 font-bold truncate max-w-sm" title={state.alternativa2}>
              {state.alternativa2 || "Não definida"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[8px] text-gray-500 uppercase font-mono block">Saldo Unfiltered</span>
              <span className={`text-sm font-mono font-bold block ${rawSDL2 >= 0 ? 'text-gray-300' : 'text-red-400'}`}>
                {rawSDL2 > 0 ? `+${rawSDL2}` : rawSDL2}
              </span>
            </div>
            <div className="h-8 w-px bg-gray-850" />
            <div className="text-right">
              <span className="text-[8px] text-cyan-400 uppercase font-mono font-bold block">Saldo Realista (SDL)</span>
              <span className={`text-lg font-mono font-bold block ${realistSDL2 >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {realistSDL2 > 0 ? `+${realistSDL2}` : realistSDL2} pto
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Decision-Winner Insight Banner */}
      <div className="bg-[#111217] border border-gray-900 p-3 rounded-xl flex items-center justify-between text-xs font-sans text-gray-300" id="decision-comparison-indicator">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500 shrink-0" />
          <span>
            {realistSDL1 === realistSDL2 ? (
              <strong>Conflito Empatado:</strong>
            ) : realistSDL1 > realistSDL2 ? (
              <span><strong>Análise Otimista-Realista sugere:</strong> Alternativa 1 (Saldo {realistSDL1}) é a escolha mais adaptativa.</span>
            ) : (
              <span><strong>Análise Otimista-Realista sugere:</strong> Alternativa 2 (Saldo {realistSDL2}) é a escolha mais adaptativa.</span>
            )}
            {" "} O peso racional descontou distorções subjetivas de medo catastrófico e euforia.
          </span>
        </div>
        <div className="font-mono text-[10px] text-gray-500">
          Δ Relativo: {Math.abs(realistSDL1 - realistSDL2)} pto
        </div>
      </div>

      {/* Primary Tab Navigation & PDF Matrix Switch */}
      <div className="flex justify-between items-center bg-gray-950/60 p-2 rounded-xl border border-gray-900" id="exame-navigation-bar">
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
            <span>Mapear Prós e Contras</span>
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode("canvas")}
            className={`text-xs px-3 py-1.5 rounded-lg font-sans font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "canvas"
                ? "bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-cyan-300"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Matriz de Consultório</span>
          </button>
        </div>
      </div>

      {/* Render Area */}
      {viewMode === "editor" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="exame-editor-mesh">
          
          {/* Main List Editor Columns (9 cols) */}
          <div className="lg:col-span-8 space-y-6 flex flex-col" id="columns-scrolling-workspace">
            
            {/* Alternative Titles Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/40 p-4 border border-gray-900 rounded-2xl" id="alternative-titles-panel">
              <div className="space-y-1 block">
                <label className="text-rose-400 text-[9px] font-mono font-bold uppercase tracking-wide block">Descreva a Alternativa 1 (Ex: sair, recusar, mudar):</label>
                <input
                  type="text"
                  value={state.alternativa1}
                  onChange={(e) => setState(prev => ({ ...prev, alternativa1: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="Ex: Abrir empresa própria de consultoria..."
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wide block">Descreva a Alternativa 2 (Ex: ficar, aceitar, esperar):</label>
                <input
                  type="text"
                  value={state.alternativa2}
                  onChange={(e) => setState(prev => ({ ...prev, alternativa2: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Ex: Seguir trabalhando no setor público..."
                />
              </div>
            </div>

            {/* Alternativa 1 Segment: Prós e Contras */}
            <div className="border border-red-950/20 bg-[#1c1112]/10 rounded-2xl p-5 space-y-5" id="alternative-one-grid-box">
              
              <div className="flex items-center justify-between border-b border-red-950/30 pb-2.5">
                <div className="space-y-px">
                  <span className="text-[10px] text-rose-450 font-mono font-bold block uppercase tracking-wide">Fatores de Pesos e Saldos</span>
                  <h4 className="text-xs font-sans font-black text-red-200">OPÇÃO 1: {state.alternativa1.toUpperCase() || "ALTERNATIVA 1"}</h4>
                </div>
                <span className="text-[10px] font-mono text-rose-300">SDL Parcial: {realistSDL1} pto</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pros Option 1 */}
                <div className="space-y-3 block">
                  <div className="flex justify-between items-center bg-gray-950/40 p-2 rounded-lg">
                    <span className="text-xs font-bold text-gray-300 font-sans flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Prós (Vantagens)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddItem("pros1")}
                      className="text-[9.5px] text-cyan-400 hover:text-white font-mono flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {state.pros1.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setEditingItem({ listName: "pros1", itemId: item.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isSelectedObj("pros1", item.id)
                            ? "bg-[#111217] border-cyan-500 text-white"
                            : "bg-gray-950/40 border-gray-900 text-gray-400 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-[11.5px] font-sans text-gray-200 font-medium leading-normal line-clamp-2">
                            {item.isFantasy && item.realistAdjustment 
                              ? `🔍 ${item.realistAdjustment}`
                              : item.text
                            }
                          </p>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem("pros1", item.id, e)}
                            className="text-gray-650 hover:text-red-500 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-900 text-[9px] font-mono">
                          <span className="text-emerald-500">Relevância: {item.weight}★</span>
                          {item.isFantasy && (
                            <span className="px-1 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-400 uppercase font-bold">
                              Filtrado ({item.fantasyType === 'utopia' ? 'Utopia' : 'Medo'})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {state.pros1.length === 0 && (
                      <p className="text-center py-6 text-gray-650 text-[10px] font-mono italic">Sem prós cadastrados</p>
                    )}
                  </div>
                </div>

                {/* Contras Option 1 */}
                <div className="space-y-3 block">
                  <div className="flex justify-between items-center bg-gray-950/40 p-2 rounded-lg">
                    <span className="text-xs font-bold text-gray-300 font-sans flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Contras (Desvantagens)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddItem("contras1")}
                      className="text-[9.5px] text-cyan-400 hover:text-white font-mono flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {state.contras1.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setEditingItem({ listName: "contras1", itemId: item.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isSelectedObj("contras1", item.id)
                            ? "bg-[#111217] border-cyan-500 text-white"
                            : "bg-gray-950/40 border-gray-900 text-gray-400 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-[11.5px] font-sans text-gray-200 font-medium leading-normal line-clamp-2">
                            {item.isFantasy && item.realistAdjustment 
                              ? `🔍 ${item.realistAdjustment}`
                              : item.text
                            }
                          </p>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem("contras1", item.id, e)}
                            className="text-gray-650 hover:text-red-500 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-900 text-[9px] font-mono">
                          <span className="text-rose-500">Prejuízo: {item.weight}★</span>
                          {item.isFantasy && (
                            <span className="px-1 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-400 uppercase font-bold">
                              Filtrado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {state.contras1.length === 0 && (
                      <p className="text-center py-6 text-gray-650 text-[10px] font-mono italic">Sem contras cadastrados</p>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Alternativa 2 Segment: Prós e Contras */}
            <div className="border border-emerald-950/20 bg-[#111c16]/10 rounded-2xl p-5 space-y-5" id="alternative-two-grid-box">
              
              <div className="flex items-center justify-between border-b border-emerald-950/30 pb-2.5">
                <div className="space-y-px">
                  <span className="text-[10px] text-emerald-450 font-mono font-bold block uppercase tracking-wide">Fatores de Pesos e Saldos</span>
                  <h4 className="text-xs font-sans font-black text-emerald-250">OPÇÃO 2: {state.alternativa2.toUpperCase() || "ALTERNATIVA 2"}</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-300">SDL Parcial: {realistSDL2} pto</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pros Option 2 */}
                <div className="space-y-3 block">
                  <div className="flex justify-between items-center bg-gray-950/40 p-2 rounded-lg">
                    <span className="text-xs font-bold text-gray-300 font-sans flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Prós (Vantagens)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddItem("pros2")}
                      className="text-[9.5px] text-cyan-400 hover:text-white font-mono flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {state.pros2.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setEditingItem({ listName: "pros2", itemId: item.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isSelectedObj("pros2", item.id)
                            ? "bg-[#111217] border-cyan-500 text-white"
                            : "bg-gray-950/40 border-gray-900 text-gray-400 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-[11.5px] font-sans text-gray-200 font-medium leading-normal line-clamp-2">
                            {item.isFantasy && item.realistAdjustment 
                              ? `🔍 ${item.realistAdjustment}`
                              : item.text
                            }
                          </p>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem("pros2", item.id, e)}
                            className="text-gray-650 hover:text-red-500 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-900 text-[9px] font-mono">
                          <span className="text-emerald-500">Relevância: {item.weight}★</span>
                          {item.isFantasy && (
                            <span className="px-1 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-400 uppercase font-bold">
                              Filtrado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {state.pros2.length === 0 && (
                      <p className="text-center py-6 text-gray-650 text-[10px] font-mono italic">Sem prós cadastrados</p>
                    )}
                  </div>
                </div>

                {/* Contras Option 2 */}
                <div className="space-y-3 block">
                  <div className="flex justify-between items-center bg-gray-950/40 p-2 rounded-lg">
                    <span className="text-xs font-bold text-gray-300 font-sans flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Contras (Desvantagens)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddItem("contras2")}
                      className="text-[9.5px] text-cyan-400 hover:text-white font-mono flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {state.contras2.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setEditingItem({ listName: "contras2", itemId: item.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isSelectedObj("contras2", item.id)
                            ? "bg-[#111217] border-cyan-500 text-white"
                            : "bg-gray-950/40 border-gray-900 text-gray-400 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-[11.5px] font-sans text-gray-200 font-medium leading-normal line-clamp-2">
                            {item.isFantasy && item.realistAdjustment 
                              ? `🔍 ${item.realistAdjustment}`
                              : item.text
                            }
                          </p>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem("contras2", item.id, e)}
                            className="text-gray-650 hover:text-red-500 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-900 text-[9px] font-mono">
                          <span className="text-rose-500">Prejuízo: {item.weight}★</span>
                          {item.isFantasy && (
                            <span className="px-1 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-400 uppercase font-bold">
                              Filtrado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {state.contras2.length === 0 && (
                      <p className="text-center py-6 text-gray-650 text-[10px] font-mono italic">Sem contras cadastrados</p>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* SIDEBAR ADVANCED WEIGHT & FANTASY FILTER ANALYZER (4 cols) */}
          <div className="lg:col-span-4" id="item-factor-inspector">
            {activeItem ? (
              <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 space-y-5 sticky top-4 animate-slideInRight" id="inspector-workspace-box">
                
                {/* Header */}
                <div className="border-b border-gray-900 pb-2 flex items-center gap-1.5" id="inspector-title-area">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs uppercase font-mono font-bold text-gray-200">Inspetor de Pensamento e Viés</span>
                </div>

                {/* Text editor */}
                <div className="space-y-1 block">
                  <label className="text-[9.5px] font-mono font-bold text-gray-500 uppercase block">Fator Declarado (Subjetivo):</label>
                  <textarea
                    value={activeItem.text}
                    onChange={(e) => handleUpdateItemField(editingItem!.listName, editingItem!.itemId, "text", e.target.value)}
                    className="w-full h-20 bg-gray-950 border border-gray-900 text-xs text-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Escreva a vantagem ou desvantagem subjetiva descrita pelo paciente..."
                  />
                </div>

                {/* Weight selector */}
                <div className="space-y-1.5 block">
                  <label className="text-[9.5px] font-mono font-bold text-gray-500 uppercase block flex justify-between">
                    <span>Peso Inicial Declarado (Intensidade de Relevância):</span>
                    <span className="text-cyan-400">{activeItem.weight} de 5</span>
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleUpdateItemField(editingItem!.listName, editingItem!.itemId, "weight", w)}
                        className={`flex-1 py-1 px-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                          activeItem.weight === w 
                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                            : "bg-gray-950/40 border-gray-900 text-gray-500 hover:text-white"
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fantasy switch filter */}
                <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-850 space-y-3" id="fantasy-filter-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wide block flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Viés Irrealista/Fantasia?
                    </span>
                    <input
                      type="checkbox"
                      checked={activeItem.isFantasy}
                      onChange={(e) => handleUpdateItemField(editingItem!.listName, editingItem!.itemId, "isFantasy", e.target.checked)}
                      className="rounded border-gray-850 text-cyan-500 focus:ring-cyan-500 cursor-pointer h-4 w-4 bg-gray-950"
                    />
                  </div>

                  <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                    Sinalize se esta declaração corresponde a um pensamento catastrófico de pior cenário imaginável ou a uma idealização utópica/mágica ingênua.
                  </p>

                  {activeItem.isFantasy && (
                    <div className="space-y-3 pt-2.5 border-t border-gray-850">
                      
                      {/* Fantasy Type Switch */}
                      <div className="space-y-1 block">
                        <span className="text-[9px] text-gray-450 uppercase font-mono block">Classificação do Viés Cognitivo:</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemField(editingItem!.listName, editingItem!.itemId, "fantasyType", "utopia")}
                            className={`flex-1 py-1 text-[9.5px] rounded-lg border font-bold transition-all cursor-pointer ${
                              activeItem.fantasyType === 'utopia'
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                : "bg-gray-950/50 border-gray-900 text-gray-600"
                            }`}
                          >
                            🌌 Utopia Idealizada
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemField(editingItem!.listName, editingItem!.itemId, "fantasyType", "catastrophism")}
                            className={`flex-1 py-1 text-[9.5px] rounded-lg border font-bold transition-all cursor-pointer ${
                              activeItem.fantasyType === 'catastrophism'
                                ? "bg-rose-500/10 border-rose-500/40 text-rose-450"
                                : "bg-gray-950/50 border-gray-900 text-gray-600"
                            }`}
                          >
                            🌋 Catastrofismo
                          </button>
                        </div>
                      </div>

                      {/* Realist Adjustment text field */}
                      <div className="space-y-1 block">
                        <label className="text-[#00D1FF] text-[9px] font-mono font-bold uppercase tracking-wider block flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                          Ajuste de Raciocínio Realista:
                        </label>
                        <textarea
                          value={activeItem.realistAdjustment}
                          onChange={(e) => handleUpdateItemField(editingItem!.listName, editingItem!.itemId, "realistAdjustment", e.target.value)}
                          className="w-full h-20 bg-[#0f171c] border border-cyan-950 text-xs text-cyan-200 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
                          placeholder="Reescreva o item expurgando exageros, baseando-se em probabilidades fáticas reais..."
                        />
                      </div>

                    </div>
                  )}

                </div>

                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-full py-1.5 text-center text-[10.5px] font-sans font-bold uppercase rounded-lg border border-gray-900 hover:border-gray-700 hover:bg-gray-950/40 text-gray-400 hover:text-white"
                >
                  Concluir Inspeção
                </button>

              </div>
            ) : (
              <div className="bg-[#111217]/50 border border-dashed border-gray-900 rounded-2xl p-6 text-center text-gray-650 font-mono text-[10.5px] italic py-16 flex flex-col items-center justify-center space-y-3">
                <HelpCircle className="w-8 h-8 text-gray-800" />
                <span>Nenhum fator selecionado para inspeção de viés irrealista. Selecione qualquer item dos quadros para regular sua distorção.</span>
              </div>
            )}
            
            {/* General Clinician notes in sidebar */}
            <div className="bg-[#111217] border border-gray-900 rounded-2xl p-4.5 space-y-2.5 mt-6 block">
              <span className="text-[9.5px] text-gray-500 uppercase tracking-widest font-mono font-bold block">📝 Análise de Conflitos e Diretriz Terapêutica</span>
              <textarea
                value={state.clinicalNotes}
                onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                className="w-full h-32 bg-gray-950 border border-gray-900 text-xs text-gray-350 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Insira conclusões sobre o balanço decisório, nível de ambivalência, forças motivacionais que impulsionam fantasias, e compromissos de enfrentamento comportamental..."
              />
            </div>

          </div>

        </div>
      ) : (
        
        // PHYSICAL MIMICKING CARD SHEET (www.inteligenciapsicologica.com.br design guidelines)
        <div className="w-full max-w-7xl mx-auto py-2 flex flex-col space-y-6" id="exame-matrix-canvas">
          
          <p className="text-[11px] text-center text-gray-500 italic max-w-2xl mx-auto block">
            A visualização abaixo simula o papel clínico diagramado oficial da folha do Exame de Vantagens e Desvantagens, pronto para impressão sistêmica ou apresentação consultória.
          </p>

          <div className="bg-white text-gray-950 rounded-2xl p-8 shadow-2xl border-4 border-gray-900 relative font-sans select-text block overflow-x-auto" id="clean-sheet-decision-canvas">
            <div className="min-w-[1020px] space-y-6">
              
              {/* Main title */}
              <div className="flex justify-between items-center border-b-2 border-gray-900 pb-2" id="canvas-brand-header">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black tracking-tighter text-gray-900 font-sans leading-none uppercase">EXAME DUPLO DE VANTAGENS E DESVANTAGENS</h3>
                  <span className="text-[9px] font-mono font-black text-gray-500 mt-1 uppercase tracking-widest leading-none">TOMADA DE DECISÃO MEDIADA POR RACIOCÍNIO SAUDÁVEL</span>
                </div>
                
                <div className="text-right">
                  <span className="text-[9.5px] font-mono font-black text-gray-800 tracking-wide block uppercase leading-none">INTELIGÊNCIA PSICOLÓGICA</span>
                  <span className="text-[8px] text-gray-450 font-sans block mt-0.5 uppercase mb-1">HP de Raciocínio realisticamente otimista</span>
                </div>
              </div>

              {/* Consultation meta block mimicking header inputs */}
              <div className="grid grid-cols-4 gap-4 p-3 bg-gray-100 border border-gray-300 rounded text-[9.5px] font-mono text-gray-650" id="canvas-physical-inputs">
                <div>
                  <strong>PROFISSIONAL:</strong> <span className="font-sans font-bold text-gray-900 ml-1">Supervisor Clínico TCC</span>
                </div>
                <div>
                  <strong>CRP:</strong> <span className="font-sans text-gray-900 ml-1">06/99999-D</span>
                </div>
                <div>
                  <strong>PACIENTE:</strong> <span className="font-sans font-extrabold text-blue-900 text-[10px] ml-1 uppercase">{patient.name || "NÃO CONSOLIDADO"}</span>
                </div>
                <div className="text-right">
                  <strong>AVALIAÇÃO QUANTITATIVA:</strong> <span className="font-sans text-gray-900 text-[10px] ml-1">Modelo de Score Ponderado</span>
                </div>
              </div>

              {/* 2x2 Layout Grid mirroring the PDF exact quadrant layout */}
              <div className="grid grid-cols-2 gap-6" id="physical-quadrant-layout">
                
                {/* COLUMN 1: ALTERNATIVA 1 */}
                <div className="border-2 border-gray-900 rounded-xl overflow-hidden divide-y divide-gray-900 flex flex-col min-h-[460px]" id="canvas-col-one">
                  
                  {/* ALTERNATIVA 1 TITLE FIELD */}
                  <div className="bg-gray-900 text-white p-3 text-center">
                    <span className="text-[8.5px] font-mono tracking-widest uppercase text-gray-400 block font-bold">Alternativa 1:</span>
                    <p className="text-xs font-sans font-extrabold uppercase mt-0.5">
                      {state.alternativa1 || "Não especificada"}
                    </p>
                  </div>

                  {/* PROS BLOCK FOR OPTION 1 */}
                  <div className="flex-1 p-4 bg-gray-50/50 flex flex-col justify-start">
                    <span className="text-[9px] font-black text-gray-800 border-b border-gray-350 pb-1 uppercase tracking-wide block mb-2.5">✅ PRÓS (Vantagens Reais):</span>
                    <ul className="space-y-4 text-[11px] leading-relaxed text-gray-900 font-sans">
                      {state.pros1.map(item => (
                        <li key={item.id} className="relative pl-4 space-y-0.5">
                          <span className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full bg-emerald-600 block shrink-0" />
                          <div className="font-medium text-gray-950">
                            {item.isFantasy && item.realistAdjustment ? (
                              <span>
                                <span className="text-gray-500 line-through mr-1.5 font-normal">{item.text}</span>
                                <span className="text-emerald-950 font-bold"> Ajuste Realista: "{item.realistAdjustment}"</span>
                              </span>
                            ) : (
                              <span>{item.text}</span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-gray-500 block">
                            Importância: {item.weight} de 5 {item.isFantasy && "(Desfocado por fantasias amortecidas)"}
                          </span>
                        </li>
                      ))}
                      {state.pros1.length === 0 && (
                        <li className="text-gray-400 italic text-[10.5px]">Nenhum fator inserido para este quadrante.</li>
                      )}
                    </ul>
                  </div>

                  {/* CONTRAS BLOCK FOR OPTION 1 */}
                  <div className="p-4 bg-red-50/10 border-t-2 border-gray-900 flex flex-col justify-start flex-1">
                    <span className="text-[9px] font-black text-red-950 border-b border-gray-350 pb-1 uppercase tracking-wide block mb-2.5">❌ CONTRAS (Desvantagens de Custo):</span>
                    <ul className="space-y-4 text-[11px] leading-relaxed text-gray-900 font-sans">
                      {state.contras1.map(item => (
                        <li key={item.id} className="relative pl-4 space-y-0.5">
                          <span className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full bg-red-650 block shrink-0" />
                          <div className="font-medium text-gray-950">
                            {item.isFantasy && item.realistAdjustment ? (
                              <span>
                                <span className="text-gray-500 line-through mr-1.5 font-normal">{item.text}</span>
                                <span className="text-rose-950 font-bold"> Ajuste Realista: "{item.realistAdjustment}"</span>
                              </span>
                            ) : (
                              <span>{item.text}</span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-gray-500 block">
                            Prejuízo: {item.weight} de 5 {item.isFantasy && "(Refinado para reduzir catastrofização)"}
                          </span>
                        </li>
                      ))}
                      {state.contras1.length === 0 && (
                        <li className="text-gray-400 italic text-[10.5px]">Nenhum fator inserido para este quadrante.</li>
                      )}
                    </ul>
                  </div>

                  {/* CALCULATED VALUE FOOTER OPTION 1 */}
                  <div className="bg-gray-100 p-2.5 text-center font-mono text-[10px] text-gray-700 flex justify-between px-4">
                    <span>Soma Prós: {pros1Calcs.realistSum} pt | Soma Contras: {contras1Calcs.realistSum} pt</span>
                    <strong className="text-gray-900 font-sans">Saldo Decisório: {realistSDL1} pt</strong>
                  </div>

                </div>

                {/* COLUMN 2: ALTERNATIVA 2 */}
                <div className="border-2 border-gray-900 rounded-xl overflow-hidden divide-y divide-gray-900 flex flex-col min-h-[460px]" id="canvas-col-two">
                  
                  {/* ALTERNATIVA 2 TITLE FIELD */}
                  <div className="bg-gray-900 text-white p-3 text-center">
                    <span className="text-[8.5px] font-mono tracking-widest uppercase text-gray-400 block font-bold">Alternativa 2:</span>
                    <p className="text-xs font-sans font-extrabold uppercase mt-0.5">
                      {state.alternativa2 || "Não especificada"}
                    </p>
                  </div>

                  {/* PROS BLOCK FOR OPTION 2 */}
                  <div className="flex-1 p-4 bg-gray-50/50 flex flex-col justify-start">
                    <span className="text-[9px] font-black text-gray-800 border-b border-gray-350 pb-1 uppercase tracking-wide block mb-2.5">✅ PRÓS (Vantagens Reais):</span>
                    <ul className="space-y-4 text-[11px] leading-relaxed text-gray-900 font-sans">
                      {state.pros2.map(item => (
                        <li key={item.id} className="relative pl-4 space-y-0.5">
                          <span className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full bg-emerald-600 block shrink-0" />
                          <div className="font-medium text-gray-950">
                            {item.isFantasy && item.realistAdjustment ? (
                              <span>
                                <span className="text-gray-500 line-through mr-1.5 font-normal">{item.text}</span>
                                <span className="text-emerald-950 font-bold"> Ajuste Realista: "{item.realistAdjustment}"</span>
                              </span>
                            ) : (
                              <span>{item.text}</span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-gray-500 block">
                            Importância: {item.weight} de 5 {item.isFantasy && "(Ajustado por realismo de probabilidade)"}
                          </span>
                        </li>
                      ))}
                      {state.pros2.length === 0 && (
                        <li className="text-gray-400 italic text-[10.5px]">Nenhum fator inserido para este quadrante.</li>
                      )}
                    </ul>
                  </div>

                  {/* CONTRAS BLOCK FOR OPTION 2 */}
                  <div className="p-4 bg-red-50/10 border-t-2 border-gray-900 flex flex-col justify-start flex-1">
                    <span className="text-[9px] font-black text-red-950 border-b border-gray-350 pb-1 uppercase tracking-wide block mb-2.5">❌ CONTRAS (Desvantagens de Custo):</span>
                    <ul className="space-y-4 text-[11px] leading-relaxed text-gray-900 font-sans">
                      {state.contras2.map(item => (
                        <li key={item.id} className="relative pl-4 space-y-0.5">
                          <span className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full bg-red-650 block shrink-0" />
                          <div className="font-medium text-gray-950">
                            {item.isFantasy && item.realistAdjustment ? (
                              <span>
                                <span className="text-gray-500 line-through mr-1.5 font-normal">{item.text}</span>
                                <span className="text-rose-950 font-bold"> Ajuste Realista: "{item.realistAdjustment}"</span>
                              </span>
                            ) : (
                              <span>{item.text}</span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-gray-500 block">
                            Prejuízo: {item.weight} de 5 {item.isFantasy && "(Refinado para reduzir idealizações)"}
                          </span>
                        </li>
                      ))}
                      {state.contras2.length === 0 && (
                        <li className="text-gray-400 italic text-[10.5px]">Nenhum fator inserido para este quadrante.</li>
                      )}
                    </ul>
                  </div>

                  {/* CALCULATED VALUE FOOTER OPTION 2 */}
                  <div className="bg-gray-100 p-2.5 text-center font-mono text-[10px] text-gray-700 flex justify-between px-4">
                    <span>Soma Prós: {pros2Calcs.realistSum} pt | Soma Contras: {contras2Calcs.realistSum} pt</span>
                    <strong className="text-gray-900 font-sans">Saldo Decisório: {realistSDL2} pt</strong>
                  </div>

                </div>

              </div>

              {/* General clinician notes on printed sheet if present */}
              {state.clinicalNotes && (
                <div className="p-4 bg-gray-50 border border-gray-300 rounded-xl space-y-1 block mt-4" id="matrix-clinical-notes-canvas">
                  <span className="text-[8px] font-mono font-black text-gray-600 block uppercase tracking-wider">APONTAMENTOS CLÍNICOS E FORMULAÇÃO DE CONDUTA COGNITIVA:</span>
                  <p className="text-[10px] font-sans text-gray-800 font-normal leading-relaxed pr-6">{state.clinicalNotes}</p>
                </div>
              )}

              {/* Small footer copy credit line */}
              <div className="text-center pt-4 border-t border-gray-200 text-[8px] text-gray-500 font-mono" id="print-sheet-credit-decision">
                PRODUTO ORIGINAL INTELIGÊNCIA PSICOLÓGICA • DESENVOLVIDO POR LINCOLN POUBEL E PEDRO RODRIGUES • www.inteligenciapsicologica.com.br
              </div>

            </div>
          </div>

        </div>

      )}

    </div>
  );
}
