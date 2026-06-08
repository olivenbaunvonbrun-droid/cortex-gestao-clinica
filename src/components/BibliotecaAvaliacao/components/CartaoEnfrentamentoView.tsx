import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  CreditCard, Plus, Trash2, HelpCircle, ArrowRight, ShieldCheck, 
  Sparkles, Award, Scale, HelpCircle as QuestionIcon, AlertTriangle, 
  Check, RefreshCw, Eye, BookOpen, Layers, CheckSquare, Compass, Square, MessageSquare
} from "lucide-react";

export interface CopingCard {
  id: string;
  trigger: string; // Situational trigger (e.g., "Antes de falar em público")
  distortedThought: string; // Paragraph describing the distorted narrative
  restructuredThought: string; // Paragraph describing the healthy, realistic-optimistic logic
  distortionsSelected: string[]; // List of labeled cognitive distortions
  passesScientificCheck: boolean; // Confirms factual evidence check
  passesCircumstanceCheck: boolean; // Circumstance review check
  scientificObservation: string; // Philosophical or scientific study reference that refutes the belief
  ethicalCheck: {
    focusOnValues: boolean; // Does it align actions with personal values/ethics?
    protectsSelfCare: boolean; // Does it protect the client's psychological safety and physical well-being?
    respectsLimits: boolean; // Does it respect personal human boundaries of energy and time?
  };
  convictionRating: number; // Subjective belief conviction in the healthy thought (0 to 100%)
}

export interface CopingCardsState {
  cards: CopingCard[];
}

interface CartaoEnfrentamentoViewProps {
  patient: PatientInfo;
  state: CopingCardsState;
  setState: React.Dispatch<React.SetStateAction<CopingCardsState>>;
}

const DISTORTION_OPTIONS = [
  { id: "catastrofizacao", label: "Catastrofização", desc: "Esperar o pior cenário possível de forma irrealista" },
  { id: "personalizacao", label: "Personalização", desc: "Achar que tudo é uma ofensa contra você ou que tudo é sua culpa" },
  { id: "preto_branco", label: "Pensamento Polarizado (Tudo ou Nada)", desc: "Dividir a vida entre perfeição ou fracasso absoluto" },
  { id: "leitura_mente", label: "Leitura de Mente", desc: "Achar que sabe exatamente o que os outros estão pensando de ruim" },
  { id: "raciocinio_emocional", label: "Raciocínio Emocional", desc: "Achar que seus sentimentos são verdades científicas absolutas" },
  { id: "imperativos", label: "Foco nos 'Devo' e 'Tenho que'", desc: "Criar cobranças rígidas que ignoram limitações humanas normais" },
  { id: "desqualificacao_positivo", label: "Desqualificação do Positivo", desc: "Ignorar sucessos passados alegando que foram 'sorte' ou 'obrigação'" }
];

export default function CartaoEnfrentamentoView({
  patient,
  state,
  setState
}: CartaoEnfrentamentoViewProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    state.cards.length > 0 ? state.cards[0].id : null
  );
  
  // View mode switcher: "editor" vs "reading" (implements clean physical card simulation)
  const [viewMode, setViewMode] = useState<"editor" | "reading">("editor");

  // Presets structured as robust paragraphs rather than simple phrases (as video requests)
  const PRESETS = [
    {
      label: "Medo Crônico de Errar & Perfeccionismo",
      trigger: "Antes de entregar um relatório técnico ou iniciar uma apresentação complexa no trabalho",
      distortedThought: "Se eu cometer qualquer deslize ou hesitar durante a fala, todos vão descobrir que sou uma farsa completa e que não deveria estar aqui. Esse projeto tem que estar rigorosamente impecável, pois um único erro anula todo o meu esforço restante, deixando claro que sou incompetente e que serei demitido sumariamente na primeira avaliação de desempenho.",
      restructuredThought: "Cometer deslizes ou hesitar é um comportamento comum no noviciado profissional e não diminui minha integridade ou competência global comprovada. O perfeccionismo é uma exigência química e existencial irrealista. Erros secundários são oportunidades metodológicas de refino e não determinam demissão automática, pois meu histórico real mostra entregas consistentes, elogiadas e amparadas por suporte mútuo.",
      distortionsSelected: ["catastrofizacao", "preto_branco", "desqualificacao_positivo"],
      passesScientificCheck: true,
      passesCircumstanceCheck: true,
      scientificObservation: "Estudos em Psicologia Organizacional atestam que a tolerância a pequenas falhas e a segurança psicológica aumentam a inovação das equipes. A performance ideal humana segue a curva de Yerkes-Dodson, onde cobranças extremas degradam o foco.",
      ethicalCheck: {
        focusOnValues: true,
        protectsSelfCare: true,
        respectsLimits: true
      },
      convictionRating: 85
    },
    {
      label: "Fobia Social & Necessidade de Aprovação",
      trigger: "Ao entrar em reuniões sociais, confraternizações ou falar com figuras de autoridade",
      distortedThought: "Todos no ambiente estão me observando criticamente e julgando cada gesto ou palavra que eu disser. Eu preciso agradar a absolutamente todo mundo e ser extremamente carismático, simpático e perfeito. Se alguém parecer entediado por um segundo enquanto falo, significa que sou uma pessoa chata, desinteressante e que ficarei totalmente isolado e rejeitado para sempre.",
      restructuredThought: "As pessoas no ambiente estão ocupadas com as suas próprias inseguranças existenciais e raramente dedicam atenção meticulosa para auditar meus gestos espontâneos. Buscar aprovação universal é um ato desgastante e matematicamente impossível. Se um interlocutor parecer distraído, isso reflete a fadiga ou as circunstâncias particulares dele, não o meu valor social, que se sustenta na autenticidade e conexões recíprocas reais.",
      distortionsSelected: ["leitura_mente", "personalizacao", "catastrofizacao"],
      passesScientificCheck: true,
      passesCircumstanceCheck: true,
      scientificObservation: "O Fenômeno do Holofote (Spotlight Effect) é um viés cognitivo demonstrado empiricamente na psicologia social: superestimamos amplamente o nível de atenção que os outros dão aos nossos gestos ou erros.",
      ethicalCheck: {
        focusOnValues: true,
        protectsSelfCare: true,
        respectsLimits: true
      },
      convictionRating: 80
    },
    {
      label: "Ansiedade de Pânico & Hipocondria Corporal",
      trigger: "Sempre que sinto palpitações rápidas, sudorese ou falta de ar em locais fechados ou sob pressão",
      distortedThought: "Este aperto no peito e essa tontura repentina são sinais urgentes de que estou prestes a infartar, perder totalmente a razão ou desmaiar na frente de todo mundo sem socorro. Não consigo suportar essa adrenalina corporal. Esse mal-estar indica que há algo fisicamente quebrado em mim e que se eu não fugir deste local imediatamente, vou sofrer uma parada cardíaca terminal agora mesmo.",
      restructuredThought: "A palpitação e a aceleração cardíaca são apenas respostas neurofisiológicas normais do sistema simpático diante de pensamentos ansiosos de ameaça. O pânico atua como um alarme falso: o mal-estar físico passa em alguns minutos conforme o parassimpático atua e meu coração é anatomicamente saudável, conforme exames clínicos recentes. Eu posso aceitar essa onda de adrenalina passar sem precisar fugir em desespero.",
      distortionsSelected: ["catastrofizacao", "raciocinio_emocional"],
      passesScientificCheck: true,
      passesCircumstanceCheck: true,
      scientificObservation: "Fisiologicamente, o sistema nervoso autônomo é auto-limitado: a liberação de adrenalina se dissipa naturalmente num ciclo de 10 a 20 minutos. Não há relatos na medicina de paradas cardíacas desencadeadas por ataques de pânico puro em indivíduos saudáveis.",
      ethicalCheck: {
        focusOnValues: true,
        protectsSelfCare: true,
        respectsLimits: false
      },
      convictionRating: 75
    }
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (confirm(`Deseja carregar a estrutura narrativa deste cartão clínico? Isso substituirá ou criará um novo cartão em destaque.`)) {
      const newId = "card_" + Date.now();
      const newCard: CopingCard = {
        id: newId,
        trigger: preset.trigger,
        distortedThought: preset.distortedThought,
        restructuredThought: preset.restructuredThought,
        distortionsSelected: [...preset.distortionsSelected],
        passesScientificCheck: preset.passesScientificCheck,
        passesCircumstanceCheck: preset.passesCircumstanceCheck,
        scientificObservation: preset.scientificObservation,
        ethicalCheck: { ...preset.ethicalCheck },
        convictionRating: preset.convictionRating
      };
      setState(prev => ({
        cards: [...prev.cards, newCard]
      }));
      setSelectedCardId(newId);
    }
  };

  const handleCreateNewCard = () => {
    const newId = "card_" + Date.now();
    const newCard: CopingCard = {
      id: newId,
      trigger: "Ex: Diante de prazos curtos ou acusações leves da chefia...",
      distortedThought: "Narrativa da mente sob estresse. Digite em parágrafos os pensamentos e desdobramentos distorcidos...",
      restructuredThought: "Narrativa baseada na raciocínio realístico-altruísta de valores. Digite as refutações com fatos da realidade...",
      distortionsSelected: [],
      passesScientificCheck: false,
      passesCircumstanceCheck: false,
      scientificObservation: "Reflexão teórica, conselho clínico ou sabedoria científica que desconstrói a fobia...",
      ethicalCheck: {
        focusOnValues: false,
        protectsSelfCare: false,
        respectsLimits: false
      },
      convictionRating: 50
    };
    setState(prev => ({
      cards: [...prev.cards, newCard]
    }));
    setSelectedCardId(newId);
    setViewMode("editor");
  };

  const handleDeleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este Cartão de Enfrentamento?")) {
      setState(prev => {
        const filtered = prev.cards.filter(c => c.id !== id);
        return { cards: filtered };
      });
      if (selectedCardId === id) {
        const remaining = state.cards.filter(c => c.id !== id);
        setSelectedCardId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const updateActiveCardField = (field: keyof CopingCard, val: any) => {
    if (!selectedCardId) return;
    setState(prev => ({
      ...prev,
      cards: prev.cards.map(c => 
        c.id === selectedCardId ? { ...c, [field]: val } : c
      )
    }));
  };

  const updateEthicalField = (field: keyof CopingCard["ethicalCheck"], val: boolean) => {
    if (!selectedCardId) return;
    setState(prev => ({
      ...prev,
      cards: prev.cards.map(c => {
        if (c.id === selectedCardId) {
          return {
            ...c,
            ethicalCheck: {
              ...c.ethicalCheck,
              [field]: val
            }
          };
        }
        return c;
      })
    }));
  };

  const handleToggleDistortion = (distortionId: string) => {
    if (!selectedCardId) return;
    setState(prev => ({
      ...prev,
      cards: prev.cards.map(c => {
        if (c.id === selectedCardId) {
          const list = c.distortionsSelected;
          const isSelected = list.includes(distortionId);
          return {
            ...c,
            distortionsSelected: isSelected 
              ? list.filter(id => id !== distortionId)
              : [...list, distortionId]
          };
        }
        return c;
      })
    }));
  };

  // Pull out currently active card
  const activeCard = state.cards.find(c => c.id === selectedCardId);

  // Global calculations for analytics
  const totalCards = state.cards.length;
  
  // Calculate average conviction
  const avgConviction = totalCards > 0 
    ? Math.round(state.cards.reduce((acc, c) => acc + c.convictionRating, 0) / totalCards) 
    : 0;

  // Efficiency index of selected card or global average
  // High efficiency is achieved when cards are thoroughly validated (ethical, scientific evidence, trigger and higher subjective belief)
  const calculateCardEfficiency = (card: CopingCard) => {
    let score = 30; // base score for writing thoughts
    
    // Check distortions mapping
    if (card.distortionsSelected.length > 0) score += 15;
    
    // Check scientific validation
    if (card.passesScientificCheck) score += 15;
    if (card.passesCircumstanceCheck) score += 10;
    if (card.scientificObservation && card.scientificObservation.length > 15) score += 10;

    // Check ethical checkpoints
    const ethicalCount = Object.values(card.ethicalCheck).filter(Boolean).length;
    score += (ethicalCount * 5); // max 15

    // Add conviction scaling modifier
    score += Math.round((card.convictionRating / 100) * 15); // max 15

    return Math.min(100, score);
  };

  const activeCardEfficiency = activeCard ? calculateCardEfficiency(activeCard) : 0;

  return (
    <div className="space-y-6 animate-fadeIn" id="cartao-enfrentamento-vroot">
      
      {/* Clinician Guidance Header block */}
      <div className="bg-[#00A3FF]/10 border border-[#00A3FF]/20 p-4 rounded-xl text-xs text-blue-300 space-y-1 block animate-fadeIn" id="clinical-intro-box">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">🏷️ CARTÃO DE ENFRENTAMENTO (INSTRUMENTO 15)</strong>
        <span className="text-gray-400 font-sans">
          Os cartões de enfrentamento agem como lembretes práticos portáteis lidos ativamente diante de crises ou disparadores situacionais. 
          Seguindo as diretrizes clínicas modernas, evite reescrever apenas frases curtas e vazias. 
          Incentive o paciente a elencar <strong>narrativas ou raciocínios articulados completos em parágrafos</strong>. 
          Nesse módulo, avalie as distorções que permeiam a mentira disfuncional e passe a nova mentalidade reestruturada pelo crivo da <strong>ética e das evidências científicas concretas de realidade</strong>.
        </span>
      </div>

      {/* Basic patient context meta tracker */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="patient-context">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente / Cliente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Selecionado"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Foco de Intervenção</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Regulação Emocional por Auto-instrução Racional</div>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">HP Primária Relacionada</span>
          <div className="text-blue-400 font-sans text-xs font-bold py-1 block flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Raciocínio Realístico-Otimista
          </div>
        </div>
      </div>

      {/* Presets and template triggers selection panel */}
      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 space-y-2" id="autoestima-presets">
        <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          ⚡ Modelos Narrativos Rápidos (Importar Cartões Clínicos de Referência):
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[10.5px] font-sans font-medium px-3.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-950/10 transition-all cursor-pointer block"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global stats review */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="overview-statistics-row">
        
        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-created">
          <div className="space-y-0.5">
            <span className="text-gray-500 font-mono text-[9px] uppercase block">Cartões Criados</span>
            <span className="font-mono text-xl font-bold text-gray-200 block">{totalCards} cartões</span>
          </div>
          <CreditCard className="w-8 h-8 text-gray-700" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-conviction">
          <div className="space-y-0.5">
            <span className="text-blue-400 font-mono text-[9px] uppercase block">Adesão / Convicção Média</span>
            <span className="font-mono text-xl font-bold text-blue-400 block">{avgConviction}% de convicção</span>
          </div>
          <Compass className="w-8 h-8 text-blue-950" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-efficiency">
          <div className="space-y-0.5">
            <span className="text-emerald-400 font-mono text-[9px] uppercase block">Adaptação do Cartão Ativo</span>
            <span className="font-mono text-xl font-bold text-emerald-400 block">
              {activeCard ? `${activeCardEfficiency}%` : "0%"}
            </span>
          </div>
          <Award className="w-8 h-8 text-emerald-950" />
        </div>

      </div>

      {/* Interactive visual controller switcher */}
      <div className="flex justify-between items-center bg-gray-950/60 p-2.5 rounded-xl border border-gray-900" id="controls-top-bar">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode("editor")}
            className={`text-xs px-3 py-1.5 rounded-lg font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "editor" 
                ? "bg-blue-500/10 border border-blue-500/30 text-blue-300"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Editor Clínico Avançado</span>
          </button>
          
          <button
            type="button"
            disabled={!activeCard}
            onClick={() => setViewMode("reading")}
            className={`text-xs px-3 py-1.5 rounded-lg font-sans font-bold transition-all flex items-center gap-1.5 ${
              !activeCard 
                ? "opacity-50 cursor-not-allowed text-gray-650"
                : viewMode === "reading"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "text-gray-400 hover:text-white cursor-pointer"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visualização de Bolso (Simulador de Cartão)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCreateNewCard}
          className="px-3.5 py-1.5 text-xs rounded-xl bg-blue-500 text-black font-extrabold hover:bg-blue-400 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Cartão</span>
        </button>
      </div>

      {/* Main Structural Workplace Body */}
      {viewMode === "editor" ? (
        
        // EDITOR MODE GUI
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="editor-grid">
          
          {/* Left Panel Sidebar: List of available coping cards */}
          <div className="lg:col-span-4 flex flex-col space-y-2" id="sidebar-cards-list">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono font-bold block mb-1">Seus Cartões Ativos ({totalCards}):</span>
            
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1" id="cards-directory">
              {state.cards.length > 0 ? (
                state.cards.map(card => {
                  const isSelected = card.id === selectedCardId;
                  const score = calculateCardEfficiency(card);
                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative group cursor-pointer ${
                        isSelected 
                          ? "bg-[#111217] border-blue-500/40 text-white shadow-md shadow-blue-500/5" 
                          : "bg-gray-950/40 border-gray-900/50 hover:border-gray-850 text-gray-400"
                      }`}
                      id={`card-directory-item-${card.id}`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                      )}
                      
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-1 block flex-1">
                          <span className="text-[8.5px] uppercase font-mono font-extrabold text-blue-400 block tracking-wide">
                            Disparador Situacional:
                          </span>
                          <p className="text-xs font-sans font-bold text-gray-200 line-clamp-1 leading-snug">
                            {card.trigger || "Sem disparador definido"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCard(card.id, e)}
                          className="text-gray-650 hover:text-red-500 transition-colors p-0.5 cursor-pointer opacity-40 group-hover:opacity-100"
                          title="Excluir este cartão de enfrentamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[10px] text-gray-500 font-sans line-clamp-2 mt-2 leading-tight">
                        <strong>Lógica Distorcida:</strong> {card.distortedThought}
                      </p>

                      <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-gray-900/40 text-[9px] font-mono">
                        <span className="text-gray-500">Convicção: {card.convictionRating}%</span>
                        <span className={`px-1.5 py-0.5 rounded ${
                          score >= 75 ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-500"
                        }`}>Adaptabilidade: {score}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-gray-650 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-xl bg-gray-950/10" id="dir-empty">
                  Nenhum cartão cadastrado. Clique em "+ Criar Cartão" ou selecione um de nossos "Modelos Clínicos Rápidos de Referência" acima para começar a testar.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel Workspace: Deep edit selected coping card */}
          <div className="lg:col-span-8 flex flex-col space-y-6" id="editor-active-workspace">
            {activeCard ? (
              <div className="bg-[#111217] border border-gray-900 rounded-2xl p-6 space-y-6 animate-fadeIn" id="editor-inputs-pane">
                
                {/* Visual Header indicating specific focus */}
                <div className="border-b border-gray-900 pb-3" id="editor-pane-header">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    Elaboração de Narrativas de Auto-Instrução
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">Confronte crenças estruturando mentalidades em blocos narrativos amplos e maduros.</p>
                </div>

                {/* Field A: Situational Trigger */}
                <div className="space-y-1" id="trigger-field">
                  <label className="text-gray-400 text-[10.5px] font-bold uppercase tracking-wider block font-mono">
                    🚨 1. Disparador Situacional (Quando praticar a leitura deste cartão?):
                  </label>
                  <input
                    type="text"
                    value={activeCard.trigger}
                    onChange={(e) => updateActiveCardField("trigger", e.target.value)}
                    placeholder="Ex: Antes de reuniões executivas importantes, quando sinto o estômago queimar..."
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-xl text-white text-xs outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                  <span className="text-[9px] text-gray-550 block italic">Associe o cartão a gatilhos corpóreos ou de contexto para treinar a previsibilidade.</span>
                </div>

                {/* DUAL BLOCKS COMPARATIVE TEXT PANELS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="combat-paragraphs-panel">
                  
                  {/* LEFT: Distorted thought narrative block */}
                  <div className="space-y-2 flex flex-col bg-red-500/[0.015] p-4.5 rounded-xl border border-red-500/10" id="panel-distorted">
                    <div className="border-b border-gray-900 pb-2.5">
                      <span className="text-[10.5px] font-mono font-bold text-red-400 block uppercase">❌ CRENÇA DISTORCIDA (Mentalidade Disfuncional)</span>
                      <span className="text-[9px] text-gray-550 block">Descreva a narrativa automática catastrófica, o pior cenário mental ou imposição moral punitiva.</span>
                    </div>

                    <textarea
                      value={activeCard.distortedThought}
                      onChange={(e) => updateActiveCardField("distortedThought", e.target.value)}
                      className="w-full min-h-[160px] p-2.5 bg-gray-950 border border-red-950/20 text-xs rounded-xl text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-red-500 block leading-relaxed"
                      placeholder="Coloque a mentira da mente em parágrafos..."
                    />
                  </div>

                  {/* RIGHT: Restructured thought narrative block */}
                  <div className="space-y-2 flex flex-col bg-emerald-500/[0.015] p-4.5 rounded-xl border border-emerald-500/10" id="panel-restructured">
                    <div className="border-b border-gray-900 pb-2.5">
                      <span className="text-[10.5px] font-mono font-bold text-emerald-400 block uppercase">🛡️ CRENÇA REESTRUTURADA (Raciocínio Adaptativo)</span>
                      <span className="text-[9px] text-gray-550 block">Formule argumentos consolidados com realismo prático de reparação com base em autocuidado e probabilidade científica.</span>
                    </div>

                    <textarea
                      value={activeCard.restructuredThought}
                      onChange={(e) => updateActiveCardField("restructuredThought", e.target.value)}
                      className="w-full min-h-[160px] p-2.5 bg-gray-950 border border-emerald-950/20 text-xs rounded-xl text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 block leading-relaxed"
                      placeholder="Coloque o racívínio realista em parágrafos..."
                    />
                  </div>

                </div>

                {/* Cognitive Distortion Selector */}
                <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-900 space-y-2" id="distortion-picker">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase block">🧬 Mapeamento de Distorções Cognitivas Identificadas na Crença:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {DISTORTION_OPTIONS.map(opt => {
                      const isSelected = activeCard.distortionsSelected.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleToggleDistortion(opt.id)}
                          className={`p-2 rounded-lg border flex items-start gap-2 cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-red-500/[0.025] border-red-500/30 text-gray-200" 
                              : "bg-gray-950 border-gray-870 text-gray-500 hover:border-gray-800"
                          }`}
                        >
                          <div className="mt-0.5 pt-0.5">
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-gray-650 shrink-0" />
                            )}
                          </div>
                          <div>
                            <strong className={`block text-[11px] ${isSelected ? "text-red-400" : "text-gray-400"}`}>{opt.label}</strong>
                            <p className="text-[9px] text-gray-550 leading-tight mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SCIENTIFIC AND ETHICAL VERIFICATIONS CHECKPOINTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="validation-checks-row">
                  
                  {/* Scientific proof filter */}
                  <div className="bg-gray-950/45 p-4 rounded-xl border border-gray-900 space-y-3" id="scientific-box">
                    <div className="border-b border-gray-900 pb-1.5 flex justify-between items-center">
                      <span className="text-[10px] text-blue-400 font-mono font-bold uppercase">🔬 Parâmetros de Ciência e Realidade</span>
                      <QuestionIcon className="w-3.5 h-3.5 text-gray-600 cursor-help" title="Fatos estatísticos e empíricos reais de vida que desmentem as hipóteses catastróficas fóbicas." />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-gray-500 block">Referencial Científico de Apoio:</span>
                      <textarea
                        value={activeCard.scientificObservation}
                        onChange={(e) => updateActiveCardField("scientificObservation", e.target.value)}
                        placeholder="Ex: O que diz a ciência biológica/psicológica ou fatos objetivos sobre isso?"
                        className="w-full bg-gray-950 border border-gray-870 p-2 text-xs rounded-lg text-white font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 block min-h-[60px]"
                      />
                    </div>

                    <div className="flex flex-col space-y-2 pt-1 text-[11px] font-sans">
                      <div 
                        className="flex items-center gap-2 cursor-pointer text-gray-400"
                        onClick={() => updateActiveCardField("passesScientificCheck", !activeCard.passesScientificCheck)}
                      >
                        <input
                          type="checkbox"
                          checked={activeCard.passesScientificCheck}
                          onChange={() => {}}
                          className="accent-blue-500"
                        />
                        <span className={`${activeCard.passesScientificCheck ? "text-blue-400 font-bold" : ""}`}>Passa no Teste de Evidência Factual Real?</span>
                      </div>

                      <div 
                        className="flex items-center gap-2 cursor-pointer text-gray-400"
                        onClick={() => updateActiveCardField("passesCircumstanceCheck", !activeCard.passesCircumstanceCheck)}
                      >
                        <input
                          type="checkbox"
                          checked={activeCard.passesCircumstanceCheck}
                          onChange={() => {}}
                          className="accent-blue-500"
                        />
                        <span className={`${activeCard.passesCircumstanceCheck ? "text-blue-400 font-bold" : ""}`}>Passa pela Verificação de Circunstâncias Clínicas?</span>
                      </div>
                    </div>
                  </div>

                  {/* Ethical verification filter */}
                  <div className="bg-gray-950/45 p-4 rounded-xl border border-gray-900 space-y-3" id="ethics-box">
                    <div className="border-b border-gray-900 pb-1.5 flex justify-between items-center">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">⚖️ Parâmetros de Ética Clínica</span>
                      <QuestionIcon className="w-3.5 h-3.5 text-gray-600 cursor-help" title="Garante que as novas diretrizes mentais do paciente respeitam seus limites biológicos e promovem o bem-estar duradouro." />
                    </div>

                    <p className="text-[9.5px] text-gray-550 leading-snug">Avalie se as novas regras mentais estabelecidas passam nos crivos para proteger o sujeito:</p>

                    <div className="space-y-2 pt-1 block text-xs">
                      
                      <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => updateEthicalField("focusOnValues", !activeCard.ethicalCheck.focusOnValues)}
                      >
                        <input 
                          type="checkbox" 
                          checked={activeCard.ethicalCheck.focusOnValues} 
                          onChange={() => {}} 
                          className="accent-emerald-500" 
                        />
                        <span className={`${activeCard.ethicalCheck.focusOnValues ? "text-emerald-400 font-bold" : "text-gray-400"}`}>Identifica Relação Prática de Valores?</span>
                      </div>

                      <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => updateEthicalField("protectsSelfCare", !activeCard.ethicalCheck.protectsSelfCare)}
                      >
                        <input 
                          type="checkbox" 
                          checked={activeCard.ethicalCheck.protectsSelfCare} 
                          onChange={() => {}} 
                          className="accent-emerald-500" 
                        />
                        <span className={`${activeCard.ethicalCheck.protectsSelfCare ? "text-emerald-400 font-bold" : "text-gray-400"}`}>Protege o Autocuidado do Sujeito?</span>
                      </div>

                      <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => updateEthicalField("respectsLimits", !activeCard.ethicalCheck.respectsLimits)}
                      >
                        <input 
                          type="checkbox" 
                          checked={activeCard.ethicalCheck.respectsLimits} 
                          onChange={() => {}} 
                          className="accent-emerald-500" 
                        />
                        <span className={`${activeCard.ethicalCheck.respectsLimits ? "text-emerald-400 font-bold" : "text-gray-400"}`}>Respeita Limitações Clínicas Normais?</span>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Range Slider subjective belief conviction */}
                <div className="bg-gray-950/20 p-4.5 rounded-xl border border-gray-900 flex justify-between items-center text-xs" id="conviction-panel">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-450 uppercase font-mono font-bold block">🔥 Taxa de Convicção Subjetiva na Nova Crença (0-100%):</span>
                    <span className="text-[9px] text-gray-550 font-sans block max-w-sm">O quanto o cliente acredita intimamente que a nova mentalidade reestruturada de fato é verdadeira?</span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-mono font-extrabold text-[#00A3FF] text-base">{activeCard.convictionRating}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={activeCard.convictionRating}
                      onChange={(e) => updateActiveCardField("convictionRating", parseInt(e.target.value))}
                      className="w-40 bg-gray-950 rounded cursor-pointer accent-[#00A3FF]"
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-gray-600 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-2xl bg-[#111217] flex flex-col items-center justify-center space-y-2" id="workspace-empty">
                <CreditCard className="w-10 h-10 text-gray-800" />
                <span>Nenhum cartão selecionado para edição. Selecione ou crie um cartão à esquerda.</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        
        // PHYSICAL CARDS SIMULATED PREVIEW READ MODE
        <div className="max-w-2xl mx-auto py-4 flex flex-col space-y-6" id="reading-desk animate-fadeIn">
          {activeCard ? (
            <div className="space-y-6">
              
              {/* Guidance advice */}
              <p className="text-[11px] text-center text-gray-500 italic max-w-xl mx-auto font-sans">
                Você está no "Modo de Leitura". Esse layout simula a visualização física condensada do cartão de enfrentamento pronto para impressão ou leitura focada pelo paciente diante de situações de estresse.
              </p>

              {/* Physical Card Container styled precisely like a real clinical card */}
              <div className="bg-white text-gray-950 rounded-2xl p-8 shadow-2xl relative border-4 border-gray-900 select-text" id="printed-coping-card-mockup">
                
                {/* Branding watermark inside borders */}
                <div className="flex justify-between items-center border-b-2 border-gray-900 pb-3" id="card-branding-row">
                  <div className="flex items-center gap-1.5 font-bold font-sans text-xs tracking-wider text-gray-900 uppercase">
                    <CreditCard className="w-4 h-4 text-gray-900" />
                    <span>Cartão de Enfrentamento Clássico</span>
                  </div>
                  <span className="text-[8px] font-mono font-black text-gray-400 tracking-widest uppercase">INTELIGÊNCIA PSICOLÓGICA</span>
                </div>

                {/* Trigger Situational header */}
                <div className="mt-4 bg-gray-100 border-l-4 border-gray-900 p-3 rounded" id="card-trigger-title">
                  <span className="text-[9px] uppercase font-mono font-extrabold text-gray-600 tracking-wider block">🚨 DISPARADOR SITUACIONAL RECOMENDADO:</span>
                  <p className="text-xs font-sans font-extrabold text-gray-950 leading-snug mt-0.5">
                    {activeCard.trigger || "Circunstâncias ansiosas sem especificação prévia."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-5" id="card-narratives">
                  
                  {/* Part 1: Distorted Thought */}
                  <div className="space-y-1 pb-4 border-b border-dashed border-gray-300" id="card-distorted-part">
                    <span className="text-[9px] uppercase font-mono font-black text-red-650 tracking-wider block">❌ CRENÇA DISTORCIDA (O Raciocínio Errado / Parágrafo disfuncional):</span>
                    <p className="text-xs font-serif text-gray-700 leading-relaxed max-w-xl italic whitespace-pre-line pl-1.5 mt-1 border-l-2 border-red-200">
                      "{activeCard.distortedThought}"
                    </p>
                    
                    {activeCard.distortionsSelected.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {activeCard.distortionsSelected.map(id => {
                          const label = DISTORTION_OPTIONS.find(o => o.id === id)?.label || id;
                          return (
                            <span 
                              key={id}
                              className="text-[8px] font-mono uppercase bg-red-100 border border-red-200/50 text-red-700 px-1.5 py-0.5 rounded font-black"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Part 2: Restructured Thought */}
                  <div className="space-y-1 block" id="card-restructured-part">
                    <span className="text-[9px] uppercase font-mono font-black text-emerald-700 tracking-wider block">🛡️ CRENÇA REESTRUTURADA (A Resposta Racional / Parágrafo adaptativo):</span>
                    <p className="text-sm font-sans font-semibold text-gray-950 leading-relaxed max-w-xl whitespace-pre-line block mt-1">
                      {activeCard.restructuredThought}
                    </p>
                  </div>

                </div>

                {/* Sub-footer detailing verification stamps */}
                <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap justify-between items-center text-[8.5px] font-mono text-gray-400" id="card-stamps-row">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeCard.passesScientificCheck ? "bg-emerald-500" : "bg-gray-300"}`} />
                      Científico
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeCard.passesCircumstanceCheck ? "bg-emerald-500" : "bg-gray-300"}`} />
                      Circunstancial
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${Object.values(activeCard.ethicalCheck).every(Boolean) ? "bg-emerald-500" : "bg-yellow-500"}`} />
                      Ético Clínico
                    </span>
                  </div>

                  <span className="font-extrabold text-gray-600">CONVICÇÃO SUBJETIVA DO USO: {activeCard.convictionRating}%</span>
                </div>

              </div>

              {/* Action and verification tips */}
              {activeCard.scientificObservation && (
                <div className="p-4 bg-gray-950 rounded-xl border border-gray-900 text-xs text-gray-400 space-y-1 font-sans" id="reference-info">
                  <strong className="text-gray-200 block uppercase font-mono text-[9px] text-blue-400 tracking-wider">🔬 Evidência Bibliográfica / Raciocínio de Apoio:</strong>
                  <p className="leading-relaxed leading-snug">{activeCard.scientificObservation}</p>
                </div>
              )}

            </div>
          ) : null}
        </div>

      )}

    </div>
  );
}
