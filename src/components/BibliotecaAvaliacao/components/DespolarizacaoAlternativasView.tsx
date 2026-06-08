import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Scale, Plus, Trash2, HelpCircle, Sparkles, Award, AlertTriangle, 
  Check, Layers, Eye, Compass, ShieldCheck, CheckSquare, Square, ChevronRight, Info
} from "lucide-react";

export interface PolarizationBlock {
  id: string;
  theme: string; // E.g., "Sucesso Profissional", "Casamento", "Amizade e Auto-revelação"
  leftPolar: string; // Narrativa extrema no polo esquerdo
  leftExtremism: number; // 1 to 10
  rightPolar: string; // Narrativa extrema no polo direito
  rightExtremism: number; // 1 to 10
  intermediateAlternative: string; // Raciocínio moderador acomodativo
  intermediateConviction: number; // 0 to 100%
  checkedPoints: {
    factBased: boolean; // Baseado em fatos comprováveis e neutros
    respectsBoundaries: boolean; // Respeita limites corporais e de energia
    actionsDrivenByValues: boolean; // Focado em comportamentos norteados por valores
  };
}

export interface DespolarizacaoState {
  blocks: PolarizationBlock[];
  notes: string;
}

interface DespolarizacaoAlternativasViewProps {
  patient: PatientInfo;
  state: DespolarizacaoState;
  setState: React.Dispatch<React.SetStateAction<DespolarizacaoState>>;
}

export default function DespolarizacaoAlternativasView({
  patient,
  state,
  setState
}: DespolarizacaoAlternativasViewProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    state.blocks.length > 0 ? state.blocks[0].id : null
  );

  const [viewMode, setViewMode] = useState<"editor" | "grid">("editor");

  const PRESETS = [
    {
      label: "Sucesso & Carreira (Trabalho)",
      theme: "Sucesso e Carreira",
      leftPolar: "Eu tenho que trabalhar 16 horas por dia, nunca recusar nenhuma tarefa da chefia e ser o melhor em tudo, senão serei sumariamente despedido e serei considerado um fracasso completo.",
      leftExtremism: 9,
      rightPolar: "Já que a cobrança empresarial é inerentemente tóxica e injusta, eu deveria parar de me esforçar totalmente, fazer apenas o mínimo absoluto para sobreviver ou pedir demissão de forma impulsiva, pois todo trabalho assalariado é exploração pura.",
      rightExtremism: 8,
      intermediateAlternative: "Posso manter uma conduta profissional responsável e engajada dentro do meu horário normal de expediente, separando momentos específicos para descanso e aprendizado. Estabelecer limites claros de sobrecarga me possibilita ter um rendimento sustentável, mantendo minha integridade física e mental sem arriscar meu sustento ou minha reputação.",
      intermediateConviction: 85,
      checkedPoints: {
        factBased: true,
        respectsBoundaries: true,
        actionsDrivenByValues: true
      }
    },
    {
      label: "Confiança & Relacionamento",
      theme: "Confirança Interpessoal",
      leftPolar: "Se eu me abrir verdadeiramente e mostrar qualquer vulnerabilidade para alguém, as pessoas vão fatalmente usar isso contra mim, me humilhar e me rejeitar. Por isso, preciso sempre manter barreiras intransponíveis e ser totalmente autossuficiente.",
      leftExtremism: 10,
      rightPolar: "Para construir conexões íntimas, eu preciso aceitar passivamente tudo o que os outros fazem de errado, anular minhas próprias preferências pessoais e ceder a abusos simbólicos para que nunca pensem em me abandonar.",
      rightExtremism: 9,
      intermediateAlternative: "Construir relações significativas consiste em um ato gradual e bidirecional de partilha de vulnerabilidades leves, avaliando o respeito recíproco ao longo do tempo. Posso comunicar minhas preferências e impor limites polidos e firmes, pois a proximidade saudável pressupõe a convivência voluntária de duas individualidades soberanas.",
      intermediateConviction: 90,
      checkedPoints: {
        factBased: true,
        respectsBoundaries: true,
        actionsDrivenByValues: true
      }
    },
    {
      label: "Organização & Críticas Alheias",
      theme: "Validação Social e Estética",
      leftPolar: "Toda crítica que recebo nas redes sociais ou no convívio diário é um atestado de que sou uma pessoa horrível e defeituosa. Preciso imediatamente me isolar e pedir desculpas universais, mudando tudo em mim para acabar com a oposição do meu público.",
      leftExtremism: 9,
      rightPolar: "As pessoas são todas rudes, incompetentes e invejosas. Se alguém ousar me criticar ou sugerir alguma mudança, eu vou atacar essa pessoa de volta e banir qualquer voz dissidente da minha vida, pois sou infalível e livre.",
      rightExtremism: 8,
      intermediateAlternative: "As críticas externas refletem majoritariamente as projeções subjetivas, valores e fadiga dos próprios emissores. Devo escutar o feedback de forma neutra, extraindo sugestões técnicas que tragam racionalidade ao meu crescimento ético, sem que isso afete minha integridade existencial básica e dignidade humana.",
      intermediateConviction: 75,
      checkedPoints: {
        factBased: true,
        respectsBoundaries: true,
        actionsDrivenByValues: false
      }
    }
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (confirm("Gostaria de carregar o modelo de despolarização clínica selecionado? Isso criará um novo bloco de comparação estruturado.")) {
      const newId = "polar_" + Date.now();
      const newBlock: PolarizationBlock = {
        id: newId,
        theme: preset.theme,
        leftPolar: preset.leftPolar,
        leftExtremism: preset.leftExtremism,
        rightPolar: preset.rightPolar,
        rightExtremism: preset.rightExtremism,
        intermediateAlternative: preset.intermediateAlternative,
        intermediateConviction: preset.intermediateConviction,
        checkedPoints: { ...preset.checkedPoints }
      };
      setState(prev => ({
        ...prev,
        blocks: [...prev.blocks, newBlock]
      }));
      setSelectedBlockId(newId);
    }
  };

  const handleCreateNewBlock = () => {
    const newId = "polar_" + Date.now();
    const newBlock: PolarizationBlock = {
      id: newId,
      theme: "Ex: Tomada de Decisão Financeira",
      leftPolar: "Tudo ou nada esquerdo: Digite o raciocínio polarizado absoluto de um lado...",
      leftExtremism: 5,
      rightPolar: "Tudo ou nada direito: Digite a reação opositora extremista oposta do outro lado...",
      rightExtremism: 5,
      intermediateAlternative: "A síntese intermediária integrada guiada por fatos reais e limites adaptativos...",
      intermediateConviction: 50,
      checkedPoints: {
        factBased: false,
        respectsBoundaries: false,
        actionsDrivenByValues: false
      }
    };
    setState(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
    setSelectedBlockId(newId);
    setViewMode("editor");
  };

  const handleDeleteBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Excluir este bloco de despolarização?")) {
      setState(prev => {
        const filtered = prev.blocks.filter(b => b.id !== id);
        return { ...prev, blocks: filtered };
      });
      if (selectedBlockId === id) {
        const remaining = state.blocks.filter(b => b.id !== id);
        setSelectedBlockId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const updateActiveBlockField = (field: keyof PolarizationBlock, val: any) => {
    if (!selectedBlockId) return;
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => 
        b.id === selectedBlockId ? { ...b, [field]: val } : b
      )
    }));
  };

  const updateCheckedPointsField = (field: keyof PolarizationBlock["checkedPoints"], val: boolean) => {
    if (!selectedBlockId) return;
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => {
        if (b.id === selectedBlockId) {
          return {
            ...b,
            checkedPoints: {
              ...b.checkedPoints,
              [field]: val
            }
          };
        }
        return b;
      })
    }));
  };

  // Pull active block data
  const activeBlock = state.blocks.find(b => b.id === selectedBlockId);

  // Global scores calculation (Índice de Moderação Cognitiva - IMC)
  const totalBlocks = state.blocks.length;

  const calculateIMC = (block: PolarizationBlock) => {
    let score = 30; // base for completing content
    
    // Assess extremes distance (severity)
    const severityDiff = Math.abs(block.leftExtremism - block.rightExtremism);
    // Balanced extremisms recognized is a step, but we want the alternative to contain elements:
    if (block.leftExtremism > 3 && block.rightExtremism > 3) {
      score += 15; // recognized major polarization dynamics
    }

    // Checking evidence constraints
    const checkedCount = Object.values(block.checkedPoints).filter(Boolean).length;
    score += (checkedCount * 12); // max 36

    // Scaled by conviction in intermediate thought
    score += Math.round((block.intermediateConviction / 100) * 19); // max 19

    return Math.min(100, score);
  };

  const activeIMC = activeBlock ? calculateIMC(activeBlock) : 0;

  const globalAvgIMC = totalBlocks > 0
    ? Math.round(state.blocks.reduce((acc, b) => acc + calculateIMC(b), 0) / totalBlocks)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn" id="despolarizacao-vroot">
      
      {/* Information Header Block */}
      <div className="bg-[#00A3FF]/10 border border-[#00A3FF]/20 p-4 rounded-xl text-xs text-blue-300 space-y-1 block" id="info-header-despolarizacao">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">⚖️ GERAÇÃO DE ALTERNATIVAS PARA DESPOLARIZAÇÃO (INSTRUMENTO 14)</strong>
        <span className="text-gray-400 font-sans">
          A polarização cognitiva ("pensamento tudo ou nada") impede a absorção racional de realidades complexas. 
          Usando a <strong>técnica de ponto-contraponto</strong>, o paciente confronta duas posições extremas antagônicas (Polo Esquerdo e Polo Direito) 
          que expressam crenças absolutas. A partir dessa análise, o objetivo é encontrar a <strong>Alternativa Intermediária</strong> de conciliação lógica, 
          assegurando que a resposta construída corresponda a fatos empíricos comprovados e aos parâmetros de autocuidado ético.
        </span>
      </div>

      {/* Basic patient context meta tracker */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="patient-context-despolarizacao">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente / Cliente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Selecionado"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">HP Primária Relacionada</span>
          <span className="text-emerald-400 font-sans text-xs font-bold py-1 block flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Flexibilidade Cognitiva Avançada
          </span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Foco Avaliativo</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Redução de Padrões Rígidos & Autocrítica Extrema</div>
        </div>
      </div>

      {/* Presets and template triggers selection panel */}
      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 space-y-2" id="autoestima-presets">
        <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          ⚡ Preparações Clínicas de Referência (Ponto-Contraponto):
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

      {/* Quick calculations stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="overview-statistics-row-desp">
        
        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-created-desp">
          <div className="space-y-0.5">
            <span className="text-gray-500 font-mono text-[9px] uppercase block">Blocos Analisados</span>
            <span className="font-mono text-xl font-bold text-gray-200 block">{totalBlocks} temas</span>
          </div>
          <Layers className="w-8 h-8 text-gray-700" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-imc-desp">
          <div className="space-y-0.5">
            <span className="text-[#00A3FF] font-mono text-[9px] uppercase block">Índice de Moderação (IMC)</span>
            <span className="font-mono text-xl font-bold text-[#00A3FF] block">{globalAvgIMC}% médio</span>
          </div>
          <Scale className="w-8 h-8 text-blue-950" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-activeimc-desp">
          <div className="space-y-0.5">
            <span className="text-emerald-400 font-mono text-[9px] uppercase block">Acomodação do Bloco Ativo</span>
            <span className="font-mono text-xl font-bold text-emerald-400 block">
              {activeBlock ? `${activeIMC}%` : "0%"}
            </span>
          </div>
          <Award className="w-8 h-8 text-emerald-950" />
        </div>

      </div>

      {/* Switch selectors and actions */}
      <div className="flex justify-between items-center bg-gray-950/60 p-2.5 rounded-xl border border-gray-900" id="controls-top-bar-desp">
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
            <span>Painel Comparativo Integrado</span>
          </button>
          
          <button
            type="button"
            disabled={!activeBlock}
            onClick={() => setViewMode("grid")}
            className={`text-xs px-3 py-1.5 rounded-lg font-sans font-bold transition-all flex items-center gap-1.5 ${
              !activeBlock 
                ? "opacity-50 cursor-not-allowed text-gray-650"
                : viewMode === "grid"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "text-gray-400 hover:text-white cursor-pointer"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ficha Física de Despolarização</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCreateNewBlock}
          className="px-3.5 py-1.5 text-xs rounded-xl bg-blue-500 text-black font-extrabold hover:bg-blue-400 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Bloco Clínico</span>
        </button>
      </div>

      {/* Body View Switcher Output */}
      {viewMode === "editor" ? (
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="editor-grid-desp">
          
          {/* Left panel: list of current themes */}
          <div className="lg:col-span-4 flex flex-col space-y-2" id="sidebar-blocks-list">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono font-bold block mb-1">Temas em Tratamento ({totalBlocks}):</span>
            
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1" id="blocks-directory">
              {state.blocks.length > 0 ? (
                state.blocks.map(block => {
                  const isSelected = block.id === selectedBlockId;
                  const imcVal = calculateIMC(block);
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative group cursor-pointer ${
                        isSelected 
                          ? "bg-[#111217] border-blue-500/40 text-white shadow-md shadow-blue-500/5" 
                          : "bg-gray-950/40 border-gray-900/50 hover:border-gray-850 text-gray-400"
                      }`}
                      id={`block-directory-item-${block.id}`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                      )}
                      
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-1 block flex-1">
                          <span className="text-[8.5px] uppercase font-mono font-extrabold text-blue-400 block tracking-wide">
                            Temática Avaliada:
                          </span>
                          <p className="text-xs font-sans font-bold text-gray-200 line-clamp-1 leading-snug">
                            {block.theme || "Sem tema definido"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteBlock(block.id, e)}
                          className="text-gray-650 hover:text-red-500 transition-colors p-0.5 cursor-pointer opacity-40 group-hover:opacity-100"
                          title="Excluir este bloco de despolarização"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[9.5px] pt-2 text-gray-500 leading-tight">
                        <div className="truncate"><strong>Polo Esq:</strong> Extr. {block.leftExtremism}/10</div>
                        <div className="truncate"><strong>Polo Dir:</strong> Extr. {block.rightExtremism}/10</div>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-gray-900/40 text-[9px] font-mono">
                        <span className="text-gray-500">Adesão Alternativa: {block.intermediateConviction}%</span>
                        <span className={`px-1.5 py-0.5 rounded ${
                          imcVal >= 75 ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-500"
                        }`}>Eficácia Real: {imcVal}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-gray-650 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-xl bg-gray-950/10" id="dir-empty-desp">
                  Nenhuma despolarização cadastrada. Clique em "+ Novo Bloco Clínico" ou selecione um de nossos modelos de referência rápida acima.
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Active block inputs editor */}
          <div className="lg:col-span-8 flex flex-col space-y-6" id="editor-active-workspace-desp">
            {activeBlock ? (
              <div className="bg-[#111217] border border-gray-900 rounded-2xl p-6  space-y-6 animate-fadeIn" id="editor-inputs-pane-desp">
                
                {/* Section title banner */}
                <div className="border-b border-gray-900 pb-3" id="active-pane-header-desp">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    Mapeamento Linear de Extremos Bi-Polarizados
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">Inscreva as visões radicais opostas e determine seus graus de severidade emocional.</p>
                </div>

                {/* Field Header / Context Theme */}
                <div className="space-y-1 block" id="theme-field-box">
                  <label className="text-gray-400 text-[10.5px] font-bold uppercase tracking-wider block font-mono">
                    Temática ou Situação de Tensão Rígida:
                  </label>
                  <input
                    type="text"
                    value={activeBlock.theme}
                    onChange={(e) => updateActiveBlockField("theme", e.target.value)}
                    placeholder="Ex: Cobrança sobre Desempenho no Trabalho de Conclusão de Curso (TCC)..."
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-xl text-white text-xs outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>

                {/* Left Polarized Thought vs Right Polarized Thought Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="polarized-extremes-row">
                  
                  {/* Polo Esquerdo */}
                  <div className="p-4.5 bg-red-500/[0.015] border border-red-550/10 rounded-xl space-y-4" id="left-polar-container">
                    <div className="border-b border-gray-900/40 pb-2">
                      <span className="text-[10.5px] font-mono font-bold text-red-400 block uppercase">⬅️ POLO ESQUERDO (Pensamento Radical Primário)</span>
                      <span className="text-[9px] text-gray-550 block">Descreva a hipótese absolutista, o julgamento impositivo ou a idealização utópica primária.</span>
                    </div>

                    <textarea
                      value={activeBlock.leftPolar}
                      onChange={(e) => updateActiveBlockField("leftPolar", e.target.value)}
                      className="w-full min-h-[120px] p-2.5 bg-gray-950 border border-red-950/20 text-xs rounded-xl text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-red-500 block leading-relaxed"
                      placeholder="Coloque a primeira mentira catastrófica..."
                    />

                    {/* Extremism severity feedback */}
                    <div className="flex justify-between items-center text-xs" id="left-severity-box">
                      <span className="text-[10px] uppercase font-mono text-gray-500">Severidade do Polo Esquerdo:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-400 font-extrabold">{activeBlock.leftExtremism}/10</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={activeBlock.leftExtremism}
                          onChange={(e) => updateActiveBlockField("leftExtremism", parseInt(e.target.value))}
                          className="w-24 bg-gray-950 rounded cursor-pointer accent-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Polo Direito */}
                  <div className="p-4.5 bg-red-500/[0.015] border border-red-550/10 rounded-xl space-y-4" id="right-polar-container">
                    <div className="border-b border-[#111217] pb-2">
                      <span className="text-[10.5px] font-mono font-bold text-red-400 block uppercase font-mono">➡️ POLO DIREITO (Reação Antagônica Oposta)</span>
                      <span className="text-[9px] text-gray-550 block">Descreva o cenário oposto igualmente distorcido, rebelde, de esquiva ou isolamento antagônico.</span>
                    </div>

                    <textarea
                      value={activeBlock.rightPolar}
                      onChange={(e) => updateActiveBlockField("rightPolar", e.target.value)}
                      className="w-full min-h-[120px] p-2.5 bg-gray-950 border border-red-950/20 text-xs rounded-xl text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-red-500 block leading-relaxed"
                      placeholder="Coloque a reação extrema oposta prejudicial..."
                    />

                    {/* Extremism severity feedback */}
                    <div className="flex justify-between items-center text-xs" id="right-severity-box">
                      <span className="text-[10px] uppercase font-mono text-gray-500">Severidade do Polo Direito:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-400 font-extrabold">{activeBlock.rightExtremism}/10</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={activeBlock.rightExtremism}
                          onChange={(e) => updateActiveBlockField("rightExtremism", parseInt(e.target.value))}
                          className="w-24 bg-gray-950 rounded cursor-pointer accent-red-500"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* THE MIDDLE-GROUND (ALTERNATIVA INTERMEDIÁRIA) BLOCKS DESIGN */}
                <div className="bg-emerald-500/[0.015] border border-emerald-550/15 p-5 rounded-2xl space-y-4" id="middle-ground-form-desp">
                  
                  <div className="border-b border-gray-900/60 pb-3" id="middle-form-header">
                    <span className="text-[12px] font-bold text-emerald-400 block uppercase font-sans tracking-wide">⭐ ALTERNATIVA INTERMEDIÁRIA (Pecanismo de Conciliação)</span>
                    <span className="text-[10px] text-gray-450 block mt-0.5">Elabore uma síntese moderada baseada em fatos objetivos e sabedoria que resolva o impasse dos polos acima sem punição.</span>
                  </div>

                  <textarea
                    value={activeBlock.intermediateAlternative}
                    onChange={(e) => updateActiveBlockField("intermediateAlternative", e.target.value)}
                    className="w-full min-h-[140px] p-3 bg-gray-950 border border-emerald-950/25 text-xs rounded-xl text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 block leading-relaxed"
                    placeholder="Escreva em parágrafos estruturados o ponto de contraponto que pondera ambos os lados de forma realista..."
                  />

                  {/* Range slider for conviction */}
                  <div className="flex flex-wrap justify-between items-center text-xs pt-3 mt-1 border-t border-gray-900" id="conviction-panel-desp">
                    <div className="space-y-0.5 block max-w-sm">
                      <span className="text-[10px] text-gray-400 uppercase font-mono font-bold block">🔥 Convicção Intelectual na Alternativa Intermediária:</span>
                      <span className="text-[9px] text-gray-550 block leading-normal">O quanto o paciente realmente se convence e adere a este formato de ponto médio no dia a dia?</span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-mono font-semibold text-[#00A3FF] text-base">{activeBlock.intermediateConviction}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={activeBlock.intermediateConviction}
                        onChange={(e) => updateActiveBlockField("intermediateConviction", parseInt(e.target.value))}
                        className="w-40 bg-gray-950 rounded cursor-pointer accent-[#00A3FF]"
                      />
                    </div>
                  </div>

                </div>

                {/* EVIDENTIAL & ETHICAL VERIFICATION FOR SENSE-MAKING INTERMEDIATE MINDSET */}
                <div className="bg-gray-950/50 p-4.5 rounded-xl border border-gray-900 space-y-3" id="evidences-checkpoints">
                  <span className="text-[10.5px] uppercase font-mono font-bold text-gray-400 tracking-wider block">🔬 Crivos Clínicos de Racionalidade na Conciliação Criada:</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    
                    <div 
                      className="p-3 bg-gray-950 border border-gray-900 rounded-lg flex gap-2.5 items-start cursor-pointer hover:border-blue-500/30 transition-all"
                      onClick={() => updateCheckedPointsField("factBased", !activeBlock.checkedPoints.factBased)}
                    >
                      <div className="mt-0.5 shrink-0">
                        {activeBlock.checkedPoints.factBased ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-650" />
                        )}
                      </div>
                      <div className="space-y-0.5 block">
                        <strong className="text-gray-300 block text-[11px]">Fatos Comprováveis</strong>
                        <p className="text-[9px] text-gray-500 leading-tight">Rejeita rumores sentimentais e foca no histórico de evidências.</p>
                      </div>
                    </div>

                    <div 
                      className="p-3 bg-gray-950 border border-gray-900 rounded-lg flex gap-2.5 items-start cursor-pointer hover:border-blue-500/30 transition-all"
                      onClick={() => updateCheckedPointsField("respectsBoundaries", !activeBlock.checkedPoints.respectsBoundaries)}
                    >
                      <div className="mt-0.5 shrink-0">
                        {activeBlock.checkedPoints.respectsBoundaries ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-650" />
                        )}
                      </div>
                      <div className="space-y-0.5 block">
                        <strong className="text-gray-300 block text-[11px]">Respeito a Limites</strong>
                        <p className="text-[9px] text-gray-500 leading-tight">Protege a dignidade corporal, de energia e tempo humano em saúde.</p>
                      </div>
                    </div>

                    <div 
                      className="p-3 bg-gray-950 border border-gray-900 rounded-lg flex gap-2.5 items-start cursor-pointer hover:border-blue-500/30 transition-all"
                      onClick={() => updateCheckedPointsField("actionsDrivenByValues", !activeBlock.checkedPoints.actionsDrivenByValues)}
                    >
                      <div className="mt-0.5 shrink-0">
                        {activeBlock.checkedPoints.actionsDrivenByValues ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-650" />
                        )}
                      </div>
                      <div className="space-y-0.5 block">
                        <strong className="text-gray-300 block text-[11px]">Orientação por Valores</strong>
                        <p className="text-[9px] text-gray-500 leading-tight">Conecta a conduta a compromissos éticos existenciais.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* CLINICAL NOTEBOOK REMARKS */}
                <div className="space-y-1 block" id="clinical-notes-box">
                  <label className="text-gray-400 text-[10.5px] font-bold uppercase tracking-wider block font-mono">
                    📝 Parecer Geral sobre a Flexibilidade Cognitiva no Tema:
                  </label>
                  <textarea
                    value={state.notes}
                    onChange={(e) => setState(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ex: Paciente apresentou forte reatividade inicial no polo esquerdo, mas conseguiu acomodar uma síntese extremamente madura após questionamento socrático..."
                    className="w-full bg-gray-950 border border-gray-900 p-2.5 text-xs rounded-xl text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 block min-h-[60px]"
                  />
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-gray-600 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-2xl bg-[#111217] flex flex-col items-center justify-center space-y-2" id="block-workspace-empty">
                <Scale className="w-10 h-10 text-gray-800" />
                <span>Nenhum bloco clínico de despolarização cadastrado ou selecionado. Use o menu lateral à esquerda para carregar ou criar.</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        
        // INTERACTIVE PHYSICAL SHEET SIMULATOR FOR DESPOLARIZAÇÃO
        <div className="max-w-3xl mx-auto py-4 flex flex-col space-y-6" id="printed-desk-desp animate-fadeIn">
          {activeBlock ? (
            <div className="space-y-6">
              
              <p className="text-[11px] text-center text-gray-500 italic max-w-xl mx-auto font-sans">
                Esta ficha física simula as matrizes estruturadas do instrumento clássico de Geração de Alternativas para Impressão ou revisão conceitual. Use este formato para fixar a atenção nos polos em oposição à síntese equilibrada.
              </p>

              {/* Physical Sheet Paper Mimic */}
              <div className="bg-white text-gray-950 rounded-2xl p-8 shadow-2xl border-4 border-gray-900 relative block font-sans select-text" id="printed-sheet-document">
                
                {/* Branding row */}
                <div className="flex justify-between items-center border-b-2 border-gray-900 pb-3" id="sheet-branding-top">
                  <div className="flex items-center gap-1.5 font-bold font-sans text-xs tracking-wider text-gray-900 uppercase">
                    <Scale className="w-4 h-4 text-gray-900 animate-pulse" />
                    <span>Matriz de Despolarização Cognitiva (Ponto-Contraponto)</span>
                  </div>
                  <span className="text-[8px] font-mono font-black text-gray-400 tracking-widest uppercase">INTELIGÊNCIA PSICOLÓGICA</span>
                </div>

                {/* Patient / Doctor Metadata banner */}
                <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono text-gray-600" id="sheet-metadata-grid">
                  <div>
                    <strong>PACIENTE:</strong> <span className="font-sans font-bold text-gray-900 text-[11px]">{patient.name || "NÃO INFORMADO"}</span>
                  </div>
                  <div className="text-right">
                    <strong>TEMA:</strong> <span className="font-sans font-bold text-gray-900 text-[11px] uppercase">{activeBlock.theme || "SEM DEFINIÇÃO"}</span>
                  </div>
                </div>

                {/* THE 3-COLUMN LAYOUT MATRIX PRECISELY LIKE THE UPLOADED PDF SCREENSHOT */}
                <div className="mt-6 border-2 border-gray-900 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-900" id="matrix-columns-mesh">
                  
                  {/* Left Polo Column */}
                  <div className="flex flex-col bg-gray-50 p-4 min-h-[300px]" id="column-mesh-left">
                    <div className="border-b border-gray-300 pb-2 mb-3 text-center">
                      <span className="text-[10px] font-black text-red-750 block uppercase tracking-wide font-mono">⬅️ POLO ESQUERDO</span>
                      <div className="inline-block bg-red-100 text-red-750 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded mt-1">
                        EXCESSO / RIGIDEZ: {activeBlock.leftExtremism}/10
                      </div>
                    </div>
                    
                    <p className="text-xs font-serif text-gray-700 leading-relaxed italic block pl-1">
                      "{activeBlock.leftPolar}"
                    </p>
                  </div>

                  {/* Middle Alternate integrated column */}
                  <div className="flex flex-col bg-emerald-50/20 p-4 min-h-[300px]" id="column-mesh-middle">
                    <div className="border-b border-emerald-900/20 pb-2 mb-3 text-center">
                      <span className="text-[11px] font-black text-emerald-800 block uppercase tracking-wide font-sans">⭐ ALTERNATIVA INTERMEDIÁRIA</span>
                      <div className="inline-block bg-emerald-100 text-emerald-800 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded mt-1">
                        PONTO MÉDIO EQUILIBRADO
                      </div>
                    </div>
                    
                    <p className="text-xs font-sans font-extrabold text-gray-950 leading-relaxed block">
                      {activeBlock.intermediateAlternative}
                    </p>

                    {/* Checkpoints tags */}
                    <div className="mt-auto pt-4 space-y-1 block text-[8px] font-mono text-gray-500 uppercase">
                      {Object.entries(activeBlock.checkedPoints).map(([key, value]) => {
                        const labelsMap: Record<string, string> = {
                          factBased: "Fatos comprovados",
                          respectsBoundaries: "Respeito a limites",
                          actionsDrivenByValues: "Conduta por valores"
                        };
                        return (
                          <div key={key} className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${value ? "bg-emerald-600" : "bg-red-500"}`} />
                            <span>{labelsMap[key] || key}: {value ? "Sim" : "Não"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Polo Column */}
                  <div className="flex flex-col bg-gray-50 p-4 min-h-[300px]" id="column-mesh-right">
                    <div className="border-b border-gray-300 pb-2 mb-3 text-center">
                      <span className="text-[10px] font-black text-red-750 block uppercase tracking-wide font-mono">➡️ POLO DIREITO</span>
                      <div className="inline-block bg-red-100 text-red-750 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded mt-1">
                        EXCESSO / REAÇÃO: {activeBlock.rightExtremism}/10
                      </div>
                    </div>
                    
                    <p className="text-xs font-serif text-gray-700 leading-relaxed italic block pl-1">
                      "{activeBlock.rightPolar}"
                    </p>
                  </div>

                </div>

                {/* Footer validation seals */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap justify-between items-center text-[8.5px] font-mono text-gray-400" id="matrix-document-footer">
                  <span>EFICÁCIA EM REFUTAÇÃO DO IMPASSE (IMC): {activeIMC}%</span>
                  <span className="font-extrabold text-gray-700">CONVICÇÃO SUBJETIVA DO USO: {activeBlock.intermediateConviction}%</span>
                </div>

              </div>

              {/* General remarks if filled */}
              {state.notes && (
                <div className="p-4 bg-[#111217] rounded-xl border border-gray-900 text-xs text-gray-400 space-y-1" id="notes-card-output">
                  <strong className="text-gray-200 font-mono text-[9px] uppercase tracking-wide text-blue-400 block">📝 ANOTAÇÃO CLÍNICA DE PROGRESSO:</strong>
                  <p className="font-sans leading-relaxed">{state.notes}</p>
                </div>
              )}

            </div>
          ) : null}
        </div>

      )}

    </div>
  );
}
