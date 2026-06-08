import React, { useState } from "react";
import { 
  Users, CheckCircle2, AlertTriangle, Plus, Trash2, Search, 
  HelpCircle, Sparkles, AlertCircle, RefreshCw, Bookmark, Layers,
  ChevronRight, Smile, Frown, MessageSquare, Clipboard, Heart, ArrowRight
} from "lucide-react";

export interface CustomReaction {
  id: string;
  name: string;
  type: "positive" | "negative";
  trigger: string;
  alt: string;
}

export interface ContextData {
  checkedReactions: string[];
  customReactions: CustomReaction[];
  intensities: Record<string, "rara" | "moderada" | "frequente">;
  precipitators: Record<string, string>;
  alternatives: Record<string, string>;
}

export interface ExameReacoesSociaisState {
  contexts: Record<string, ContextData>;
  activeContextId: string;
  clinicalNotes: string;
}

export interface SocialReaction {
  id: string;
  name: string;
  type: "positive" | "negative";
  definition?: string;
}

export const LIST_SOCIAL_REACTIONS: SocialReaction[] = [
  { id: "abuso", name: "Abuso", type: "negative", definition: "Comportamentos abusivos, invasivos ou de exploração dos limites." },
  { id: "aconselhamento", name: "Aconselhamento", type: "positive", definition: "Pessoas oferecem conselhos amigáveis e direcionamentos enriquecedores." },
  { id: "adulação", name: "Adulação", type: "negative", definition: "Falsos elogios ou conciliações bajuladoras por conveniência." },
  { id: "agressividade", name: "Agressividade", type: "negative", definition: "Hostilidade e reações defensivas ou agressivas verbais/físicas." },
  { id: "alegria", name: "Alegria", type: "positive", definition: "Clima alegre, sorrisos e prazer genuíno ao compartilhar momentos." },
  { id: "buscar_conversa", name: "Buscar conversa", type: "positive", definition: "Pessoas tomam iniciativa para conversar e interagir espontaneamente." },
  { id: "cobranca", name: "Cobrança", type: "negative", definition: "Exigências constantes, críticas de desempenho ou pressões indiretas." },
  { id: "confrontacao", name: "Confrontação", type: "negative", definition: "Oposição ativa, contestações frontais aos posicionamentos." },
  { id: "desanimo", name: "Desânimo", type: "negative", definition: "Pessoas parecem perder a energia ou motivação próximo ao sujeito." },
  { id: "desprezo", name: "Desprezo", type: "negative", definition: "Indiferença intencional, desdém ou desvalorização de opiniões." },
  { id: "duvida", name: "Dúvida", type: "negative", definition: "Sustentação de desconfiança ou incredulidade quanto à competência." },
  { id: "exploracao", name: "Exploração", type: "negative", definition: "Busca por usufruir de favores ou habilidades sem retorno adequado." },
  { id: "falar_muito", name: "Falar muito", type: "negative", definition: "Pessoas agem com verbosidade excessiva ou monopolizam a fala." },
  { id: "humilhacao", name: "Humelhação", type: "negative", definition: "Tentativas de rebaixamento moral, piadas depreciativas públicas." },
  { id: "impaciencia", name: "Impaciência", type: "negative", definition: "Pressa, interrupções ou sinais de tédio e agitação com o sujeito." },
  { id: "preocupacao", name: "Preocupação", type: "negative", definition: "Preocupação ansiosa das pessoas sobre a integridade ou escolhas." },
  { id: "protecao", name: "Proteção", type: "positive", definition: "Atitude apoiadora de cuidado, defesa e suporte interpessoal mútuo." },
  { id: "sarcasmo", name: "Sarcasmo", type: "negative", definition: "Ironias ácidas ou zombarias discretas travestidas de humor." },
  { id: "seducao", name: "Sedução", type: "negative", definition: "Discursos lisonjeiros manipulativos ou manipulação de charme." },
  { id: "tedio", name: "Tédio", type: "negative", definition: "Expressões de desinteresse ou bocejos na presença do sujeito." },
  { id: "traicao", name: "Traição", type: "negative", definition: "Quebras de acordos de confiança confidencial ou lealdade." },
  { id: "tristeza", name: "Tristeza", type: "negative", definition: "Sentimentos de melancolia ou pesar evocados no ambiente." },
  { id: "zombaria", name: "Zombaria", type: "negative", definition: "Chacotas ou brincadeiras de mau gosto direcionadas ao indivíduo." },
  { id: "impulsividade", name: "Impulsividade", type: "negative", definition: "Reações precipitadas e destemperadas sem reflexão prévia." },
  { id: "atracao", name: "Atração", type: "positive", definition: "Aproximação natural, carisma percebido e preferência por companhia." },
  { id: "diversao", name: "Diversão", type: "positive", definition: "Geração de risos descontraídos, humor leve e atividades lúdicas." },
  { id: "prestatividade", name: "Prestatividade", type: "positive", definition: "Desejo voluntário das pessoas em ajudar ou simplificar tarefas." },
  { id: "justificacao", name: "Justificação", type: "negative", definition: "Pessoas se defendem de antemão ou dão desculpas excessivas." },
  { id: "buscar_conselho", name: "Buscar conselho", type: "positive", definition: "Consideração do sujeito como referência intelectual para orientações." },
  { id: "reprovacao", name: "Reprovação", type: "negative", definition: "Olhares censuradores, recriminação de comportamentos ou falas." },
  { id: "inseguranca", name: "Insegurança", type: "negative", definition: "Outros demonstram hesitação ou medo de errar na sua presença." },
  { id: "gratidao", name: "Gratidão", type: "positive", definition: "Agradecimentos genuínos, reconhecimento do valor entregue aos outros." },
  { id: "superioridade", name: "Superioridade", type: "negative", definition: "Arrogância, tentativas de parecer superior ou ostentação." },
  { id: "encerrar_conversa", name: "Encerrar conversa", type: "negative", definition: "Atitudes esquivas para findar diálogos rapidamente de forma ríspida." },
  { id: "advertencia", name: "Advertência", type: "negative", definition: "Conselhos ou reprimendas estruturadas avisando sobre riscos e posturas." },
  { id: "admiracao", name: "Admiração", type: "positive", definition: "Feedbacks calorosos sobre as forças de caráter e atitudes do sujeito." },
  { id: "inferiorizacao", name: "Inferiorização", type: "negative", definition: "Atitudes paternalistas ou condescendentes que diminuem o paciente." },
  { id: "ficar_calado", name: "Ficar calado", type: "negative", definition: "Distanciamento defensivo de palavras ou tratamento silencioso." },
  { id: "piedade", name: "Piedade", type: "negative", definition: "Comiseração excessiva ou pena infantilizante que retira a agência." },
  { id: "evitacao", name: "Evitação", type: "negative", definition: "Pessoas desviam de caminhos ou evitam convites ativamente." },
  { id: "mentira", name: "Mentira", type: "negative", definition: "Omissão de informações cruciais ou invenção de fatos para esquiva." },
  { id: "autoritario", name: "Autoritário", type: "negative", definition: "Atitudes mandonas e de controle unilateral sobre o indivíduo." },
  { id: "afeicao", name: "Afeição", type: "positive", definition: "Demonstrações explícitas de carinho, apoio emocional e proximidade." },
  { id: "afastamento", name: "Afastamento", type: "negative", definition: "Esfriamento progressivo das interações sem motivos explícitos." },
  { id: "alienacao", name: "Alienação", type: "negative", definition: "Exclusão do indivíduo de círculos sociais ou tomadas de decisão." }
];

export const PRESET_CONTEXTS = [
  { id: "geral", label: "Geral", icon: Layers, desc: "Relações gerais do dia a dia" },
  { id: "profissional", label: "Profissional", icon: Users, desc: "Trabalho, chefes, colegas e clientes" },
  { id: "conjugal", label: "Afetivo / Conjugal", icon: Heart, desc: "Cônjuge, parceiros amorosos" },
  { id: "familiar", label: "Familiar", icon: Users, desc: "Família de origem e parentes" },
  { id: "filhos", label: "Com os Filhos", icon: Smile, desc: "Filhos e dependentes diretos" },
  { id: "amigos", label: "Amigos", icon: MessageSquare, desc: "Círculos de amizade próximos" }
];

const DEFAULT_CONTEXT_DATA: ContextData = {
  checkedReactions: [],
  customReactions: [],
  intensities: {},
  precipitators: {},
  alternatives: {}
};

interface ExameReacoesSociaisProps {
  patient: any;
  state: ExameReacoesSociaisState;
  setState: React.Dispatch<React.SetStateAction<ExameReacoesSociaisState>>;
}

export default function ExameReacoesSociaisView({ patient, state, setState }: ExameReacoesSociaisProps) {
  const [viewMode, setViewMode] = useState<"matrix" | "list" | "charts" | "facsimile">("matrix");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "positive" | "negative">("all");
  
  // Custom reaction input state
  const [newCustomName, setNewCustomName] = useState("");
  const [newCustomType, setNewCustomType] = useState<"positive" | "negative">("negative");

  // Get active context data safely
  const activeCtxId = state.activeContextId || "geral";
  const activeContextData: ContextData = state.contexts?.[activeCtxId] || { ...DEFAULT_CONTEXT_DATA };

  const updateActiveData = (updated: Partial<ContextData>) => {
    setState(prev => {
      const currentContexts = prev.contexts || {};
      const currentActive = currentContexts[activeCtxId] || { ...DEFAULT_CONTEXT_DATA };
      return {
        ...prev,
        contexts: {
          ...currentContexts,
          [activeCtxId]: {
            ...currentActive,
            ...updated
          }
        }
      };
    });
  };

  const toggleReaction = (reactionId: string) => {
    const checked = activeContextData.checkedReactions;
    const isChecked = checked.includes(reactionId);
    const updated = isChecked 
      ? checked.filter(id => id !== reactionId)
      : [...checked, reactionId];
    
    updateActiveData({ checkedReactions: updated });
  };

  const setReactionIntensity = (reactionId: string, intensity: "rara" | "moderada" | "frequente") => {
    updateActiveData({
      intensities: {
        ...activeContextData.intensities,
        [reactionId]: intensity
      }
    });
  };

  const setPrecipitator = (reactionId: string, value: string) => {
    updateActiveData({
      precipitators: {
        ...activeContextData.precipitators,
        [reactionId]: value
      }
    });
  };

  const setAlternative = (reactionId: string, value: string) => {
    updateActiveData({
      alternatives: {
        ...activeContextData.alternatives,
        [reactionId]: value
      }
    });
  };

  const handleAddCustomReaction = () => {
    if (!newCustomName.trim()) return;
    const cleanId = `custom_${Date.now()}`;
    const newReaction: CustomReaction = {
      id: cleanId,
      name: newCustomName.trim(),
      type: newCustomType,
      trigger: "",
      alt: ""
    };
    
    updateActiveData({
      customReactions: [...activeContextData.customReactions, newReaction],
      checkedReactions: [...activeContextData.checkedReactions, cleanId]
    });
    setNewCustomName("");
  };

  const handleRemoveCustomReaction = (customId: string) => {
    updateActiveData({
      customReactions: activeContextData.customReactions.filter(r => r.id !== customId),
      checkedReactions: activeContextData.checkedReactions.filter(id => id !== customId)
    });
  };

  const handleContextChange = (ctxId: string) => {
    setState(prev => {
      const currentContexts = prev.contexts || {};
      if (!currentContexts[ctxId]) {
        currentContexts[ctxId] = { ...DEFAULT_CONTEXT_DATA };
      }
      return {
        ...prev,
        activeContextId: ctxId,
        contexts: currentContexts
      };
    });
  };

  // Calculations for current context
  const selectedReactions = LIST_SOCIAL_REACTIONS.filter(r => activeContextData.checkedReactions.includes(r.id));
  const selectedCustoms = activeContextData.customReactions.filter(r => activeContextData.checkedReactions.includes(r.id));
  
  const totalChecked = selectedReactions.length + selectedCustoms.length;
  const positivesChecked = selectedReactions.filter(r => r.type === "positive").length + selectedCustoms.filter(r => r.type === "positive").length;
  const negativesChecked = selectedReactions.filter(r => r.type === "negative").length + selectedCustoms.filter(r => r.type === "negative").length;
  
  const balancePercentage = totalChecked > 0 ? Math.round((positivesChecked / totalChecked) * 100) : 50;
  
  const getIntensityBadge = (intLevel?: string) => {
    switch (intLevel) {
      case "rara": return "bg-emerald-950/40 text-emerald-400 border border-emerald-900";
      case "moderada": return "bg-indigo-950/40 text-indigo-400 border border-indigo-900";
      case "frequente": return "bg-rose-950/50 text-rose-400 border border-rose-900";
      default: return "bg-gray-900 text-gray-500 border border-gray-800";
    }
  };

  // Build filtered list for the matrix overview
  const filteredReactions = LIST_SOCIAL_REACTIONS.filter(reaction => {
    const matchesSearch = reaction.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (reaction.definition && reaction.definition.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || reaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6" id="exame-reacoes-sociais-wrapper">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/40 p-5 rounded-2xl border border-gray-850">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-900">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase">Ferramenta 26</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            Exame das Reações Sociais aos Meus Comportamentos
          </h2>
          <p className="text-xs text-gray-400 max-w-3xl leading-relaxed">
            Consiste em catalogar a de percepção sobre como as pessoas reagem habitualmente à conduta do paciente. 
            Mapear esses reações ajuda no autoconhecimento, ensina auto-responsabilidade sistemática por seus impactos, e desenha alternativas de comunicação mais assertivas e saudáveis.
          </p>
        </div>
        
        {/* Navigation modes */}
        <div className="flex items-center gap-1.5 bg-gray-950/60 p-1 rounded-xl border border-gray-850">
          <button
            onClick={() => setViewMode("matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${viewMode === "matrix" ? "bg-indigo-900/60 text-white border border-indigo-500" : "text-gray-400 hover:text-gray-200"}`}
          >
            Matriz de Escolha
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${viewMode === "list" ? "bg-indigo-900/60 text-white border border-indigo-500" : "text-gray-400 hover:text-gray-200"}`}
          >
            Análise Avançada
          </button>
          <button
            onClick={() => setViewMode("charts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${viewMode === "charts" ? "bg-indigo-900/60 text-white border border-indigo-500" : "text-gray-400 hover:text-gray-200"}`}
          >
            Estatísticas
          </button>
          <button
            onClick={() => setViewMode("facsimile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${viewMode === "facsimile" ? "bg-indigo-900/60 text-white border border-indigo-500" : "text-gray-400 hover:text-gray-200"}`}
          >
            Original (PDF)
          </button>
        </div>
      </div>

      {/* CONTEXT SELECTOR RAIL */}
      <div className="bg-gray-950/70 p-4 rounded-xl border border-gray-850">
        <div className="flex items-center justify-between mb-3 border-b border-gray-850 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider font-mono">
              Contexto Relacional em Avaliação
            </span>
            <HelpCircle className="w-3.5 h-3.5 text-gray-500 cursor-help" title="Atitudes variam muito pelo contexto. Analise cada um individualmente!" />
          </div>
          <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
            {totalChecked} Reações Registradas no contexto atual
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PRESET_CONTEXTS.map(presetCtx => {
            const P_Icon = presetCtx.icon;
            const isSelected = activeCtxId === presetCtx.id;
            const count = state.contexts?.[presetCtx.id]?.checkedReactions?.length || 0;
            return (
              <button
                key={presetCtx.id}
                onClick={() => handleContextChange(presetCtx.id)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all relative ${
                  isSelected 
                    ? "bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/20" 
                    : "bg-gray-900/50 border-gray-850 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`p-1 rounded-md ${isSelected ? "bg-indigo-950 text-indigo-400 border border-indigo-900" : "bg-gray-950 text-gray-400"}`}>
                    <P_Icon className="w-4 h-4" />
                  </span>
                  {count > 0 && (
                    <span className="bg-indigo-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-bold ${isSelected ? "text-white" : "text-gray-300"}`}>
                  {presetCtx.label}
                </span>
                <span className="text-[9px] text-gray-500 line-clamp-1 mt-0.5">
                  {presetCtx.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: MATRIX (CHOOSE ITEMS & QUICK ADD) */}
      {viewMode === "matrix" && (
        <div id="reacoes-matrix-content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Searing & Filters Side */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-850">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar reações sociais..."
                    className="w-full bg-gray-900/80 text-xs text-white pl-9 pr-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${filterType === "all" ? "bg-indigo-900/40 text-indigo-300 border border-indigo-900" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Ver Tudo
                  </button>
                  <button
                    onClick={() => setFilterType("positive")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${filterType === "positive" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Efeitos Fortalecedores
                  </button>
                  <button
                    onClick={() => setFilterType("negative")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${filterType === "negative" ? "bg-rose-950/40 text-rose-400 border border-rose-900" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Efeitos Desfavoráveis
                  </button>
                </div>
              </div>

              {/* Grid of Choices */}
              <div className="bg-gray-950 border border-gray-850 p-5 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredReactions.map(reaction => {
                    const isChecked = activeContextData.checkedReactions.includes(reaction.id);
                    return (
                      <button
                        key={reaction.id}
                        onClick={() => toggleReaction(reaction.id)}
                        className={`flex items-start text-left p-3 rounded-xl border transition-all ${
                          isChecked 
                            ? reaction.type === "positive"
                              ? "bg-emerald-950/30 border-emerald-500/50 hover:bg-emerald-950/40"
                              : "bg-rose-950/30 border-rose-500/50 hover:bg-rose-950/40"
                            : "bg-gray-900/60 border-gray-850 hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center h-5 mr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // toggling handled on parent action
                            className={`w-4 h-4 rounded transition-all focus:ring-0 ${
                              reaction.type === "positive"
                                ? "text-emerald-500 border-gray-800 bg-gray-900"
                                : "text-rose-500 border-gray-800 bg-gray-900"
                            }`}
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[12px] font-bold block ${isChecked ? "text-white" : "text-gray-300"}`}>
                            {reaction.name}
                          </span>
                          <span className="text-[10px] text-gray-500 leading-tight line-clamp-2" title={reaction.definition}>
                            {reaction.definition}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {filteredReactions.length === 0 && (
                  <div className="text-center py-10">
                    <AlertTriangle className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Nenhuma reação social identificada com estes termos.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & custom additions side */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Add Custom Reactions */}
              <div className="bg-gray-950 border border-gray-850 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">Outras Reações Específicas</h4>
                </div>
                <p className="text-[11px] text-gray-450 leading-relaxed">
                  O paciente identificou alguma outra reação específica de seu ecossistema relacional que não consta no gabarito oficial? Adicione abaixo:
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-1">
                      Nome da Reação Social
                    </label>
                    <input
                      type="text"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      placeholder="Ex: Pessoas pedem aprovação constante..."
                      className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-1">
                      Polaridade da Reação
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCustomType("positive")}
                        className={`py-1.5 rounded text-xs font-semibold cursor-pointer border ${newCustomType === "positive" ? "bg-emerald-900/40 border-emerald-500 text-emerald-400" : "bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300"}`}
                      >
                        Facilitadora / Positiva
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCustomType("negative")}
                        className={`py-1.5 rounded text-xs font-semibold cursor-pointer border ${newCustomType === "negative" ? "bg-rose-900/40 border-rose-500 text-rose-400" : "bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300"}`}
                      >
                        Prejudicial / Negativa
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddCustomReaction}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Adicionar Reação Personalizada
                  </button>
                </div>
                
                {/* Scrollable list of active customs */}
                {activeContextData.customReactions.length > 0 && (
                  <div className="border-t border-gray-850 pt-3 mt-3 space-y-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block mb-1">
                      Personalizadas Neste Contexto
                    </span>
                    {activeContextData.customReactions.map(custom => {
                      const isCh = activeContextData.checkedReactions.includes(custom.id);
                      return (
                        <div key={custom.id} className="flex items-center justify-between bg-gray-900/60 p-2 rounded-lg border border-gray-800">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isCh}
                              onChange={() => toggleReaction(custom.id)}
                              className="w-3.5 h-3.5 text-indigo-500 bg-gray-950 border-gray-800 rounded focus:ring-0"
                            />
                            <span className="text-xs text-white font-medium">{custom.name}</span>
                            <span className={`text-[8px] font-mono uppercase px-1 rounded ${custom.type === "positive" ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"}`}>
                              {custom.type === "positive" ? "Pos" : "Neg"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveCustomReaction(custom.id)}
                            className="p-1 text-gray-505 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status Checklist Card Summary */}
              <div className="bg-gradient-to-br from-indigo-950/20 via-gray-950 to-gray-950 border border-gray-850 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Diretriz da Próxima Etapa</h4>
                <div className="text-xs text-gray-300 leading-relaxed space-y-2">
                  <p>
                    Com as reações mapeadas, clique no botão para ir para a aba <strong>Análise Avançada</strong> e definir:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-450 ml-1">
                    <li>A intensidade da reação na vida do sujeito;</li>
                    <li>O comportamento que a estimula/mobiliza;</li>
                    <li>Uma postura saudável substituta.</li>
                  </ul>
                </div>
                <button
                  onClick={() => setViewMode("list")}
                  className="w-full flex items-center justify-center gap-1 py-2.5 bg-indigo-900/50 hover:bg-indigo-900/80 text-white text-xs font-bold rounded-lg border border-indigo-700 transition-all cursor-pointer"
                >
                  Ir Para Análise Avançada <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* VIEW MODE 2: ADVANCED ANALYSIS TABLE (PRECIPITATORS AND REPLACEMENTS) */}
      {viewMode === "list" && (
        <div id="reacoes-advanced-analysis" className="space-y-6">
          <div className="bg-gray-950 border border-gray-850 p-5 rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-850 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Investigação Comportamental Sistemática
                </h3>
                <p className="text-xs text-gray-450 mt-0.5">
                  Mapeie o nexo causal entre suas atitudes habituais e o feedback recorrente que o ecossistema relacional devolve para você neste contexto.
                </p>
              </div>
              <span className="text-xs text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-lg border border-indigo-900/60 font-medium font-mono">
                {totalChecked} Reações em detalhamento
              </span>
            </div>

            {totalChecked === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-gray-300">Nenhum item selecionado na matriz</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">
                  Volte para a aba &quot;Matriz de Escolha&quot; e marque as reações habituais vividas por você.
                </p>
                <button
                  onClick={() => setViewMode("matrix")}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                >
                  Mapear Itens agora
                </button>
              </div>
            ) : (
              <div className="space-y-6 col-span-1">
                {[...selectedReactions, ...selectedCustoms].map((reaction, index) => {
                  const currentIntensity = activeContextData.intensities[reaction.id] || "rara";
                  const currentPrecipitator = activeContextData.precipitators[reaction.id] || "";
                  const currentAlternative = activeContextData.alternatives[reaction.id] || "";

                  return (
                    <div 
                      key={reaction.id} 
                      className={`p-4 border rounded-xl space-y-4 transition-all ${
                        reaction.type === "positive" 
                          ? "bg-slate-905/30 border-emerald-900/50 hover:border-emerald-800" 
                          : "bg-slate-905/30 border-rose-900/50 hover:border-rose-800"
                      }`}
                    >
                      {/* Sub-header inside item */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-850 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${reaction.type === "positive" ? "bg-emerald-500" : "bg-rose-500"}`} />
                          <span className="text-xs font-mono text-gray-500 font-semibold">#{index + 1}</span>
                          <h4 className="font-bold text-sm text-white">{reaction.name}</h4>
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${reaction.type === "positive" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900" : "bg-rose-950/40 text-rose-400 border border-rose-900"}`}>
                            {reaction.type === "positive" ? "Reação Fortalecedora" : "Reação Desadaptativa / Conflito"}
                          </span>
                        </div>

                        {/* Intensity Level Selection */}
                        <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-850">
                          <span className="text-[10px] text-gray-400 font-mono font-medium px-2">Recorrência:</span>
                          <button
                            onClick={() => setReactionIntensity(reaction.id, "rara")}
                            className={`text-[9px] font-bold px-2 py-1 rounded cursor-pointer transition-all ${currentIntensity === "rara" ? "bg-emerald-900/60 text-white" : "text-gray-400 hover:text-gray-200"}`}
                          >
                            Rara
                          </button>
                          <button
                            onClick={() => setReactionIntensity(reaction.id, "moderada")}
                            className={`text-[9px] font-bold px-2 py-1 rounded cursor-pointer transition-all ${currentIntensity === "moderada" ? "bg-indigo-900/60 text-white" : "text-gray-400 hover:text-gray-200"}`}
                          >
                            Moderada
                          </button>
                          <button
                            onClick={() => setReactionIntensity(reaction.id, "frequente")}
                            className={`text-[9px] font-bold px-2 py-1 rounded cursor-pointer transition-all ${currentIntensity === "frequente" ? "bg-rose-900/60 text-white" : "text-gray-400 hover:text-gray-200"}`}
                          >
                            Frequente
                          </button>
                        </div>
                      </div>

                      {/* Main explanation of current reaction */}
                      {"definition" in reaction && (reaction as any).definition && (
                        <p className="text-[11px] text-gray-400 leading-relaxed italic bg-gray-900 p-2 rounded border border-gray-850">
                          &ldquo;{(reaction as any).definition}&rdquo;
                        </p>
                      )}

                      {/* Input fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Precipitating causes row */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-indigo-400 uppercase font-mono tracking-wider font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Padrão Precipitador: Minha Atitude
                          </label>
                          <textarea
                            value={currentPrecipitator}
                            onChange={(e) => setPrecipitator(reaction.id, e.target.value)}
                            placeholder="O que eu costumo fazer, dizer ou omitir que atrai/desperta essa reação nesta esfera relacional?"
                            rows={3}
                            className="w-full bg-gray-905 text-xs text-white p-3 rounded-lg border border-gray-800 placeholder-gray-600 focus:outline-none focus:border-indigo-500 leading-relaxed focus:ring-0"
                          />
                        </div>

                        {/* Healthy replacement row */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            Modificação de Eixo: Postura Saudável Alternativa
                          </label>
                          <textarea
                            value={currentAlternative}
                            onChange={(e) => setAlternative(reaction.id, e.target.value)}
                            placeholder="Como posso me colocar de forma mais inteligente, coerente ou autogovernada p/ redirecionar este resultado?"
                            rows={3}
                            className="w-full bg-gray-905 text-xs text-white p-3 rounded-lg border border-gray-800 placeholder-gray-600 focus:outline-none focus:border-emerald-500 leading-relaxed focus:ring-0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* CLINICAL SUMMARY AND THERAPEUTIC PARECER */}
            <div className="border-t border-gray-850 pt-5 mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">Parecer Clínico / Conclusões Interpessoais (Global)</h4>
              </div>
              <textarea
                value={state.clinicalNotes || ""}
                onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                placeholder="Insira as conclusões fundamentadas do terapeuta ou as autodescobertas do paciente relacionadas aos efeitos sociais de seus padrões habituais. Analise o peso das polaridades, as fragilidades de assertividade, as defesas e as modificações comportamentais planejadas no PDP..."
                rows={4}
                className="w-full bg-gray-950 text-xs text-white p-3 rounded-xl border border-gray-850 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-0 leading-relaxed"
              />
            </div>

          </div>
        </div>
      )}

      {/* VIEW MODE 3: CHARTS & METRICS (NEXUS ANALYSIS) */}
      {viewMode === "charts" && (() => {
        // RADAR VISUAL DATA PREPARATION
        const radarCX = 160;
        const radarCY = 160;
        const radarRadius = 110;

        // Count for all contexts to draw comparison bar heights
        const contextsCountList = PRESET_CONTEXTS.map(preset => {
          const contextReactions = state.contexts?.[preset.id]?.checkedReactions || [];
          const pos = contextReactions.filter(id => {
            const staticReaction = LIST_SOCIAL_REACTIONS.find(r => r.id === id);
            if (staticReaction) return staticReaction.type === "positive";
            // Check in custom
            const custom = state.contexts?.[preset.id]?.customReactions?.find(r => r.id === id);
            return custom ? custom.type === "positive" : false;
          }).length;

          const neg = contextReactions.length - pos;
          return {
            name: preset.label,
            id: preset.id,
            Total: contextReactions.length,
            Positivas: pos,
            Negativas: neg
          };
        });

        // Current context statistics
        const currentContextName = PRESET_CONTEXTS.find(r => r.id === activeCtxId)?.label || "Ativo";
        const totalRatingPct = balancePercentage;

        return (
          <div className="space-y-6" id="reacoes-charts-layout">
            
            <div className="bg-gray-950 border border-gray-850 p-4 rounded-xl">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                Visão Sociométrica Multicontexto (Equilíbrio de Efeitos)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                As reações sociais que recebemos funcionam como um termômetro que mede a maturidade dos nossos repertórios de conduta. 
                Gráficos com altos índices de reações favoráveis indicam relacionamentos apoiadores de validação e afeto, enquanto altas taxas de reações desadaptativas urgem reformulações de limites e assertividade.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* RADAR-LIKE SVG PIE DE ALINHAMENTO */}
              <div className="bg-gray-950 border border-gray-850 p-5 rounded-xl flex flex-col items-center justify-center">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wide text-gray-300 mb-4 text-center">
                  Balanço Operacional Interpessoal - Contexto: {currentContextName}
                </h4>
                
                <div className="relative w-80 h-80 flex items-center justify-center">
                  {/* Plain SVG donut visualization */}
                  <svg width="240" height="240" className="transform -rotate-90">
                    <circle
                      cx="120"
                      cy="120"
                      r="90"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="20"
                    />
                    
                    {/* Circle representing the favorable/positive percentage weight */}
                    <circle
                      cx="120"
                      cy="120"
                      r="90"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray={`${totalChecked > 0 ? (positivesChecked / totalChecked) * 565.4 : 282.7} 565.4`}
                    />
                    
                    {/* Circle representing unfavorable */}
                    {negativesChecked > 0 && (
                      <circle
                        cx="120"
                        cy="120"
                        r="90"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="20"
                        strokeDasharray={`${(negativesChecked / totalChecked) * 565.4} 565.4`}
                        transform="rotate(180 120 120)" // Rotate opposite
                        className="opacity-90"
                      />
                    )}
                  </svg>
                  
                  {/* Inside Text */}
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold text-white block">
                      {totalChecked > 0 ? balancePercentage : 50}%
                    </span>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 block mt-0.5">
                      Fator de Harmonia
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      {positivesChecked} Pos / {negativesChecked} Neg
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full text-center mt-3 border-t border-gray-850 pt-3">
                  <div className="bg-gray-900/60 p-2 rounded-lg border border-emerald-900/40">
                    <span className="text-emerald-400 font-extrabold text-lg block">{positivesChecked}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-mono">Efeitos Positivos</span>
                  </div>
                  <div className="bg-gray-900/60 p-2 rounded-lg border border-rose-900/40">
                    <span className="text-rose-400 font-extrabold text-lg block">{negativesChecked}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-mono">Efeitos Negativos</span>
                  </div>
                </div>
              </div>

              {/* COMPILER COMPONENT OF MULTIPLE CONTEXT STATISTICS BAR SVG */}
              <div className="bg-gray-950 border border-gray-850 p-5 rounded-xl flex flex-col items-center">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wide text-gray-300 mb-4 text-center">
                  Carga Geral de Reações Sociais Mapeadas por Relacionamento
                </h4>
                
                <div className="w-full space-y-4 py-2">
                  {contextsCountList.map(item => {
                    const maxCount = Math.max(...contextsCountList.map(i => i.Total), 1);
                    const currentTotal = item.Total;
                    
                    const barWidthPct = (currentTotal / maxCount) * 100;
                    const posPct = currentTotal > 0 ? (item.Positivas / currentTotal) * 100 : 0;
                    const negPct = currentTotal > 0 ? (item.Negativas / currentTotal) * 100 : 0;

                    return (
                      <div key={item.id} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${item.id === activeCtxId ? "bg-indigo-400 animate-ping" : "bg-gray-600"}`} />
                            <span className="text-xs font-semibold text-white">{item.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-405">
                            {currentTotal} reações ({item.Positivas} Pos / {item.Negativas} Neg)
                          </span>
                        </div>
                        
                        <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden flex border border-gray-800">
                          {currentTotal === 0 ? (
                            <div className="w-full h-full bg-gray-900/50 flex items-center pl-3">
                              <span className="text-[9px] text-gray-600">Sem dados mapeados</span>
                            </div>
                          ) : (
                            <>
                              <div 
                                style={{ width: `${posPct}%` }}
                                className="h-full bg-emerald-500 transition-all duration-500" 
                                title={`Positivas: ${item.Positivas}`}
                              />
                              <div 
                                style={{ width: `${negPct}%` }}
                                className="h-full bg-rose-500 transition-all duration-500"
                                title={`Negativas: ${item.Negativas}`}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-5 w-full mt-4 text-[10px] text-gray-400 font-mono border-t border-gray-850 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span>Favoráveis/Validação</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                    <span>Desadaptativos/Conflito</span>
                  </div>
                </div>

              </div>

            </div>

            {/* CLINICAL SUMMARY READONLY FOR REFERENCE */}
            <div className="bg-gray-950 border border-[#1e293b] p-5 rounded-xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Consolidação Clínica Ativa:</h4>
              <div className="bg-gray-900/60 p-4 border border-gray-850 rounded text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                {state.clinicalNotes || "Nenhum parecer ou reflexão clínica estruturada ainda. Volte para a aba 'Análise Avançada' para formular suas premissas."}
              </div>
            </div>

          </div>
        );
      })()}

      {/* VIEW MODE 4: FACSIMILE (PDF-STYLE PAPER LOOK) */}
      {viewMode === "facsimile" && (
        <div id="facsimile-reacoes-view" className="bg-slate-900 p-6 rounded-xl flex justify-center">
          <div className="bg-white text-black p-8 rounded shadow-2xl max-w-4xl w-full font-serif border-2 border-slate-700 space-y-6">
            
            {/* Outline Box Frame */}
            <div className="border-4 border-double border-black p-5 space-y-4">
              
              {/* Header Box title */}
              <div className="border-2 border-black p-3 text-center bg-gray-50">
                <h3 className="font-bold text-lg uppercase tracking-wide leading-tight">
                  Exame das Reações Sociais aos Meus Comportamentos
                </h3>
              </div>

              {/* Patient and professional references block */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="border-b border-black pb-1">
                  <strong>PROFISSIONAL:</strong> {patient?.therapistName || "______________________________"}
                </div>
                <div className="border-b border-black pb-1">
                  <strong>CRP:</strong> {patient?.therapistCrp || "________"}
                </div>
                <div className="border-b border-black pb-1 col-span-2">
                  <strong>PACIENTE:</strong> {patient?.name || "______________________________________________________"}
                </div>
              </div>

              {/* Directive Statement */}
              <div className="border border-black bg-gray-100 p-2 text-center text-xs italic font-sans font-semibold">
                Marque as reações que as pessoas costumam ter em relação a você no seu convívio.
              </div>

              {/* Core Checkboxes printed like the PDF in columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs font-sans pt-2">
                {LIST_SOCIAL_REACTIONS.map(reaction => {
                  const isChecked = activeContextData.checkedReactions.includes(reaction.id);
                  return (
                    <div key={reaction.id} className="flex items-center gap-2">
                      <span className="font-semibold w-6 text-center">{isChecked ? " ( X ) " : " (   ) "}</span>
                      <span className="capitalize">{reaction.name.replace("_", " ")}</span>
                    </div>
                  );
                })}
                
                {/* Additional blank row placeholders replicating PDF structure */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold w-6 text-center"> (   ) </span>
                  <span className="text-gray-400 italic">___________________</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold w-6 text-center"> (   ) </span>
                  <span className="text-gray-400 italic">___________________</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold w-6 text-center"> (   ) </span>
                  <span className="text-gray-400 italic">___________________</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold w-6 text-center"> (   ) </span>
                  <span className="text-gray-400 italic">___________________</span>
                </div>
              </div>

              {/* Brand Logo and Credentials placeholder */}
              <div className="flex justify-between items-end border-t border-black pt-4 text-[10px] font-sans text-gray-500">
                <span>CRP / ID: {patient?.id || "N/A"}</span>
                <div className="text-right">
                  <strong className="block text-[11px] font-bold text-black uppercase">Inteligência Psicopedagógica</strong>
                  <span>Por Lincoln Poubel e Pedro Rodrigues</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
