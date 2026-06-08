import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Layers, Sparkles, Scale, Info, Check, Printer, Edit2, 
  Trash2, AlertCircle, Plus, ChevronRight, CheckCircle2, Bookmark, 
  Flame, Heart, Building, Wallet, Smile, Compass, User, RefreshCw
} from "lucide-react";

export interface DimensionRow {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const dimensionsList: DimensionRow[] = [
  { 
    id: "pessoal", 
    name: "Pessoal", 
    description: "Saúde, autoconsciência, autocuidado, autoconceito e equilíbrio interno.",
    icon: <User className="w-4 h-4" />,
    iconName: "User",
    color: "from-blue-600 to-cyan-500",
    bgColor: "bg-blue-950/20",
    borderColor: "border-blue-900/30"
  },
  { 
    id: "interpessoal", 
    name: "Interpessoal", 
    description: "Relações amorosas, familiares, amizades, redes de apoio e interações sociais.",
    icon: <Heart className="w-4 h-4" />,
    iconName: "Heart",
    color: "from-rose-600 to-pink-500",
    bgColor: "bg-rose-950/20",
    borderColor: "border-rose-900/30"
  },
  { 
    id: "ocupacional", 
    name: "Ocupacional", 
    description: "Trabalho, estudos, carreira, projetos e produtividade.",
    icon: <Building className="w-4 h-4" />,
    iconName: "Building",
    color: "from-amber-600 to-yellow-500",
    bgColor: "bg-amber-950/20",
    borderColor: "border-amber-900/30"
  },
  { 
    id: "material", 
    name: "Material", 
    description: "Finanças, bens, recursos materiais, moradia e segurança de subsistência.",
    icon: <Wallet className="w-4 h-4" />,
    iconName: "Wallet",
    color: "from-emerald-600 to-teal-500",
    bgColor: "bg-emerald-950/20",
    borderColor: "border-emerald-900/30"
  },
  { 
    id: "recreativa", 
    name: "Recreativa", 
    description: "Lazer, hobbies, divertimento, descanso e passatempos reparadores.",
    icon: <Smile className="w-4 h-4" />,
    iconName: "Smile",
    color: "from-purple-600 to-violet-500",
    bgColor: "bg-purple-950/20",
    borderColor: "border-purple-900/30"
  },
  { 
    id: "existencial", 
    name: "Existencial", 
    description: "Valores fundamentais, propósito de vida, legado e espiritualidade.",
    icon: <Compass className="w-4 h-4" />,
    iconName: "Compass",
    color: "from-indigo-600 to-blue-500",
    bgColor: "bg-indigo-950/20",
    borderColor: "border-indigo-900/30"
  }
];

export interface ExameAtitudesDimensoesState {
  // Cells for each of the 6 dimensions
  // Record<dimension_id, Record<"sou" | "faco" | "tenho", string>>
  cells: Record<string, {
    sou: string;
    faco: string;
    tenho: string;
  }>;
  // Ratings for satisfaction/coherence per dimension (1 to 10 scale)
  satisfaction: Record<string, number>;
  clinicalNotes: string;
}

interface ExameAtitudesDimensoesViewProps {
  patient: PatientInfo;
  state: ExameAtitudesDimensoesState;
  setState: React.Dispatch<React.SetStateAction<ExameAtitudesDimensoesState>>;
}

export default function ExameAtitudesDimensoesView({
  patient,
  state,
  setState
}: ExameAtitudesDimensoesViewProps) {
  const [viewMode, setViewMode] = useState<"editor" | "charts" | "facsimile">("editor");

  const handleCellChange = (dimensionId: string, cellType: "sou" | "faco" | "tenho", value: string) => {
    setState((prev) => {
      const exitingDimension = prev.cells[dimensionId] || { sou: "", faco: "", tenho: "" };
      return {
        ...prev,
        cells: {
          ...prev.cells,
          [dimensionId]: {
            ...exitingDimension,
            [cellType]: value
          }
        }
      };
    });
  };

  const handleSatisfactionChange = (dimensionId: string, val: number) => {
    setState((prev) => ({
      ...prev,
      satisfaction: {
        ...prev.satisfaction,
        [dimensionId]: val
      }
    }));
  };

  const loadPresetSample = (type: "workaholic" | "blocked") => {
    if (type === "workaholic") {
      const sampleCells: Record<string, { sou: string; faco: string; tenho: string }> = {
        pessoal: {
          sou: "Alguém cansado, negligente com a própria saúde, mas orgulhoso da resiliência.",
          faco: "Durmo 5 horas por noite, pulo refeições, tomo cafeína em excesso e raramente me exercito.",
          tenho: "Dores de cabeça constantes, estresse severo, exames alterados e pouca disposição física."
        },
        interpessoal: {
          sou: "Um parceiro e pai ausente que se sente culpado, mas justifica por 'prover para o futuro'.",
          faco: "Falo pouco com a esposa, não brinco com os filhos e sempre respondo e-mails de trabalho no jantar.",
          tenho: "Casamento frio, distanciamento emocional dos filhos e sensação de isolamento."
        },
        ocupacional: {
          sou: "Um profissional de alta performance, perfeccionista, indispensável e bem-sucedido.",
          faco: "Trabalho 12 horas por dia, aceito múltiplos projetos urgentes e lidero grandes equipes.",
          tenho: "Cargos de destaque, reconhecimento na empresa, mas esgotamento mental crônico."
        },
        material: {
          sou: "Provedor bem-sucedido e zeloso pelo patrimônio financeiro.",
          faco: "Invisto regularmente em fundos, pago excelentes escolas pros filhos e controlo a planilha.",
          tenho: "Uma bela casa, bom saldo bancário e segurança financeira sustentável."
        },
        recreativa: {
          sou: "Alguém que não sabe relaxar e acha que lazer é desperdício de tempo produtivo.",
          faco: "Não tenho hobbies ativos; quando tento assistir a um filme, fico checando o smartphone de trabalho.",
          tenho: "Ansiedade generalizada quando estou ocioso; sentimentos de agitação e culpa de descanso."
        },
        existencial: {
          sou: "Alguém que perdeu a conexão com o real propósito de estar vivo, focado em metas utilitárias.",
          faco: "Submedito minhas aspirações internas em favor das metas corporativas bimestrais do departamento.",
          tenho: "Sensação sutil de vazio existencial, questionamentos tardios se o sacrifício todo realmente compensa."
        }
      };

      const sampleSats: Record<string, number> = {
        pessoal: 3,
        interpessoal: 2,
        ocupacional: 9,
        material: 9,
        recreativa: 1,
        existencial: 4
      };

      setState({
        cells: sampleCells,
        satisfaction: sampleSats,
        clinicalNotes: "O exame revela um desbalanceamento multidimensional clássico de workaholism / hiperfoco ocupacional (satisfação = 9/10) e material (satisfação = 9/10), com grave colapso das dimensões pessoal, interpessoal e recreativa (satisfações entre 1 e 3/10). A identidade ('Sou de alta performance') é incongruente com as necessidades fisiológicas fundamentais do sujeito, gerando burnout e sintomas psicossomáticos na dimensão Pessoal. O plano terapêutico exigirá a inserção deliberada de atitudes reparadoras lúdicas (ativar Habilidade Recreativa) e reorganização de limites de trabalho."
      });
    } else {
      const sampleCells: Record<string, { sou: string; faco: string; tenho: string }> = {
        pessoal: {
          sou: "Alguém inseguro, que se acha inadequado e frágil emocionalmente.",
          faco: "Fico remoendo críticas, evito novos desafios e me saboto antes de tentar.",
          tenho: "Ansiedade social alta, baixa autoestima e sentimento de incapacidade permanente."
        },
        interpessoal: {
          sou: "Um amigo leal mas submisso, com pânico de ser abandonado.",
          faco: "Aceito abusos, agrado a todos o tempo topo e anulo minhas próprias vontades nas relações.",
          tenho: "Relacionamentos exaustivos, sensação de que as pessoas só me usam."
        },
        ocupacional: {
          sou: "Um profissional com potencial, mas aprisionado na síndrome do impostor.",
          faco: "Evito pedir aumentos, fujo de promoções e procrastino tarefas cruciais por medo de falhar.",
          tenho: "Trabalho aquém da minha capacidade real, insatisfação profissional geral."
        },
        material: {
          sou: "Uma pessoa desorganizada financeiramente por ansiedade compensatória.",
          faco: "Compro por impulso quando estou estressado para obter conforto rápido.",
          tenho: "Dívidas recorrentes, desespero ao abrir a conta bancária e falta de reserva."
        },
        recreativa: {
          sou: "Alguém que se sente culpado ao tentar descansar ou se divertir.",
          faco: "Sempre adio o descanso achando que preciso terminar tudo antes, o que nunca acontece.",
          tenho: "Lazer escasso ou vivenciado com extrema tensão interna e culpa."
        },
        existencial: {
          sou: "Alguém sem rumo claro, desconectado das suas potências individuais.",
          faco: "Apenas sigo o ritmo da rotina, sem planejar o futuro ou honrar meus valores.",
          tenho: "Sensação crônica de estagnação e falta de sentido existencial."
        }
      };

      const sampleSats: Record<string, number> = {
        pessoal: 2,
        interpessoal: 3,
        ocupacional: 4,
        material: 3,
        recreativa: 2,
        existencial: 2
      };

      setState({
        cells: sampleCells,
        satisfaction: sampleSats,
        clinicalNotes: "Quadro de inibição comportamental difusa, alimentado por Esquemas de Defeituosidade, Fracasso e Subjugação. O paciente apresenta baixa satisfação generalizada (médias abaixo de 4/10) em todas as esferas. A percepção identitária ('Sou frágil/impostor') bloqueia comportamentos ativos ('Evito novos desafios'), impossibilitando resultados sadios ('Infiltração de fracasso'). A abordagem terapêutica inicia-se com a modificação de atitudes na dimensão Pessoal e materialização de pequenos hábitos de autoconsciência para reverter a desmoralização psicoterapêutica."
      });
    }
  };

  const handleClearMatrix = () => {
    setState({
      cells: {},
      satisfaction: {},
      clinicalNotes: ""
    });
  };

  // Calculations
  const fields = ["sou" as const, "faco" as const, "tenho" as const];
  let fieldsFilled = 0;
  dimensionsList.forEach((dim) => {
    fields.forEach((f) => {
      if (state.cells[dim.id]?.[f]?.trim()) {
        fieldsFilled++;
      }
    });
  });

  const completionPct = Math.round((fieldsFilled / 18) * 100);

  // Coherence average
  const validSats = dimensionsList.map(dim => state.satisfaction[dim.id] || 0);
  const satsCount = dimensionsList.filter(dim => state.satisfaction[dim.id] !== undefined).length;
  const averageSatisfaction = satsCount > 0 ? (validSats.reduce((acc, s) => acc + s, 0) / satsCount).toFixed(1) : "0.0";

  // Data for Charts
  const chartData = dimensionsList.map((dim) => ({
    subject: dim.name,
    Satisfacao: state.satisfaction[dim.id] || 0,
    fullMark: 10
  }));

  const textCountData = dimensionsList.map((dim) => {
    const dCells = state.cells[dim.id] || { sou: "", faco: "", tenho: "" };
    const filledCount = (dCells.sou.trim() ? 1 : 0) + (dCells.faco.trim() ? 1 : 0) + (dCells.tenho.trim() ? 1 : 0);
    return {
      name: dim.name,
      Preenchimento: filledCount,
      Satisfacao: state.satisfaction[dim.id] || 0
    };
  });

  return (
    <div className="space-y-6 text-[#E0E0E0] p-1" id="exame-atitudes-dimensoes-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Ferramenta Integradora nº 25</span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mt-1">
            Exame das Atitudes e Efeitos nas Dimensões
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-3xl">
            Estrutura de autoconhecimento multidimensional. Confronta a identidade intrínseca (<span className="text-cyan-400 font-semibold">O que sou</span>) 
            com os comportamentos diários (<span className="text-emerald-400 font-semibold">O que faço</span>) e colheitas tangíveis (<span className="text-indigo-400 font-semibold">O que tenho</span>) 
            em 6 eixos vitais.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setViewMode("editor")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border flex items-center gap-1.5 transition ${
              viewMode === "editor"
                ? "bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/10"
                : "border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white"
            }`}
            id="btn-ad-mode-editor"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Matriz
          </button>

          <button
            onClick={() => setViewMode("charts")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border flex items-center gap-1.5 transition ${
              viewMode === "charts"
                ? "bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/10"
                : "border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white"
            }`}
            id="btn-ad-mode-charts"
          >
            <Scale className="w-3.5 h-3.5" />
            Gráficos
          </button>
          
          <button
            onClick={() => setViewMode("facsimile")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border flex items-center gap-1.5 transition ${
              viewMode === "facsimile"
                ? "bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/10"
                : "border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white"
            }`}
            id="btn-ad-mode-facsimile"
          >
            <Printer className="w-3.5 h-3.5" />
            Folha Oficial
          </button>
        </div>
      </div>

      {viewMode === "editor" && (
        <div className="space-y-6" id="ad-editor-layout">
          
          {/* STATS AND SAMPLING PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="ad-quick-stats">
            
            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow">
              <div className="text-2xl font-bold font-mono text-cyan-400">{completionPct}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-0.5">Preenchimento Geral</div>
              <div className="text-[9px] text-gray-500 mt-0.5">{fieldsFilled} de 18 campos mapeados</div>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow">
              <div className="text-2xl font-bold font-mono text-emerald-400">{averageSatisfaction} / 10</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-0.5">Média de Satisfação/Coerência</div>
              <div className="text-[9px] text-gray-500 mt-0.5">Soma dividida por {satsCount || 6} esferas</div>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-805 rounded-xl p-3 flex flex-col justify-center gap-1">
              <button
                type="button"
                onClick={() => loadPresetSample("workaholic")}
                className="py-1 bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 hover:text-white border border-indigo-900/30 rounded text-[9px] transition font-mono uppercase tracking-wide flex items-center justify-center gap-1"
                id="btn-ad-preset-workaholic"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Caso Hiperfoco Ocupacional
              </button>
              <button
                type="button"
                onClick={() => loadPresetSample("blocked")}
                className="py-1 bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 hover:text-white border border-indigo-900/30 rounded text-[9px] transition font-mono uppercase tracking-wide flex items-center justify-center gap-1"
                id="btn-ad-preset-blocks"
              >
                <Sparkles className="w-3 h-3 text-rose-450" />
                Caso Inibição Geral (EIDs)
              </button>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-3 flex items-center justify-center">
              <button
                type="button"
                onClick={handleClearMatrix}
                className="w-full py-2 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 border border-rose-950 rounded-lg text-[10px] transition font-mono uppercase tracking-wider flex items-center justify-center gap-1.5"
                id="btn-ad-clear-all"
              >
                <RefreshCw className="w-4 h-4" />
                Limpar Matriz
              </button>
            </div>

          </div>

          {/* MAIN MATRIX FORM */}
          <div className="bg-gray-950 border border-gray-850 rounded-xl overflow-hidden shadow-xl" id="ad-main-matrix-box">
            
            <div className="bg-gray-900 p-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Matriz Clínico-Existencial das Dimensões
                </h3>
              </div>
              <span className="text-[10px] text-gray-500 font-sans italic">
                Sugerimos preencher linha por linha, explorando conexões de causalidade.
              </span>
            </div>

            <div className="divide-y divide-gray-900/60 font-sans">
              
              {dimensionsList.map((dim) => {
                const rowCells = state.cells[dim.id] || { sou: "", faco: "", tenho: "" };
                const satVal = state.satisfaction[dim.id] !== undefined ? state.satisfaction[dim.id] : 0;
                
                return (
                  <div key={dim.id} className="p-4 lg:p-6 space-y-4 hover:bg-gray-900/10 transition">
                    
                    {/* DIMENSION HEADER AND ROW SLIDER SATISFACTION */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-900">
                      
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded bg-gradient-to-br ${dim.color} text-white shadow shrink-0`}>
                          {dim.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
                            {dim.name}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-normal max-w-xl">
                            {dim.description}
                          </p>
                        </div>
                      </div>

                      {/* SLIDER SPECIFIC FOR SATISFACTION LEVEL */}
                      <div className="bg-gray-900/40 p-2.5 border border-gray-850 rounded-lg flex items-center gap-3 shrink-0 self-start md:self-auto min-w-[240px]">
                        <div className="text-right">
                          <span className="text-[8px] uppercase tracking-wider text-indigo-400 font-mono block">Satisfação / Coerência</span>
                          <span className="text-xs font-bold text-white font-mono">{satVal} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={satVal}
                          onChange={(e) => handleSatisfactionChange(dim.id, parseInt(e.target.value))}
                          className="flex-1 accent-indigo-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
                        />
                      </div>

                    </div>

                    {/* THREE COLUMNS OF MATRIX FOR TEXT INPUTS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      
                      {/* O QUE SOU */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-cyan-950/5 border border-cyan-900/10">
                        <label className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider font-bold block flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          O QUE SOU (Identidade / Crenças)
                        </label>
                        <textarea
                          rows={3}
                          value={rowCells.sou}
                          onChange={(e) => handleCellChange(dim.id, "sou", e.target.value)}
                          placeholder="Autopercepção, rótulos identitários que carrega, como se define nesta área da vida..."
                          className="w-full px-2.5 py-2 bg-gray-900 border border-gray-850 rounded text-xs text-[#E0E0E0] placeholder-gray-600 focus:outline-none focus:border-cyan-500 leading-normal resize-none"
                        />
                      </div>

                      {/* O QUE FAÇO */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-emerald-950/5 border border-emerald-900/10">
                        <label className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-bold block flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          O QUE FAÇO (Ações / Hábitos)
                        </label>
                        <textarea
                          rows={3}
                          value={rowCells.faco}
                          onChange={(e) => handleCellChange(dim.id, "faco", e.target.value)}
                          placeholder="Hábitos diários, condutas correntes, omissões, comportamentos predominantes reais..."
                          className="w-full px-2.5 py-2 bg-gray-900 border border-gray-850 rounded text-xs text-[#E0E0E0] placeholder-gray-600 focus:outline-none focus:border-emerald-500 leading-normal resize-none"
                        />
                      </div>

                      {/* O QUE TENHO */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-indigo-950/5 border border-indigo-900/10">
                        <label className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider font-bold block flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          O QUE TENHO (Efeitos / Conseqs)
                        </label>
                        <textarea
                          rows={3}
                          value={rowCells.tenho}
                          onChange={(e) => handleCellChange(dim.id, "tenho", e.target.value)}
                          placeholder="Resultados atuais recolhidos, colheitas, sintomas, sentimentos que sobram, conquistas..."
                          className="w-full px-2.5 py-2 bg-gray-900 border border-gray-850 rounded text-xs text-[#E0E0E0] placeholder-gray-600 focus:outline-none focus:border-indigo-500 leading-normal resize-none"
                        />
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* CLINICAL PARECER EXAME NOTES */}
          <div className="bg-gray-950 border border-gray-850 p-5 rounded-xl space-y-3">
            <label className="block text-xs text-indigo-400 font-mono uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Discussão Diagnóstica Multidimensional, Congruência e Conclusão Clínica:</span>
            </label>
            <p className="text-[10px] text-gray-400 leading-relaxed italic">
              Conecte os dados mapeados nesta matriz (congruência entre quem se julga ser, o que se faz e o que tem colhido nas seis dimensões da vida) com as regras identitárias cegas do paciente e atitudes de reparação comportamental ética.
            </p>
            <textarea
              rows={4}
              value={state.clinicalNotes}
              onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
              placeholder="Digite a análise e síntese de formulação multidimensional do caso..."
              className="w-full px-3 py-3 bg-gray-900 border border-gray-800 rounded-lg text-xs text-[#d1d5db] focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              id="ad-clinical-notes"
            />
          </div>

        </div>
      )}

      {viewMode === "charts" && (() => {
        // RADAR CALCULATIONS
        const radarCX = 160;
        const radarCY = 160;
        const radarRadius = 110;
        const ringsArray = [2, 4, 6, 8, 10];

        const radarPoints = dimensionsList.map((dim, idx) => {
          const satisfactionValue = state.satisfaction[dim.id] || 0;
          const currentAngle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
          const px = radarCX + (satisfactionValue / 10) * radarRadius * Math.cos(currentAngle);
          const py = radarCY + (satisfactionValue / 10) * radarRadius * Math.sin(currentAngle);
          return { px, py, angle: currentAngle, name: dim.name, value: satisfactionValue };
        });

        const polygonCoordinates = radarPoints.map(pt => `${pt.px},${pt.py}`).join(" ");

        // BAR CHART CALCULATIONS
        const barHeightMax = 180;
        return (
          <div className="space-y-6" id="ad-charts-layout">
            
            <div className="bg-gray-950 border border-gray-850 p-4 rounded-xl">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                Visualização de Harmonia Existencial (Dimensões Globais)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                O gráfico abaixo ilustra a dispersão e o equilíbrio dos níveis de satisfação relatados para cada uma das dimensões. 
                Áreas pontiagudas indicam polarizações e hiperfoco desadaptativo, enquanto um polígono regular expressa a harmonia no desenvolvimento global do paciente.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* RADAR CHART SATISFACTION */}
              <div className="bg-gray-950 border border-gray-850 p-5 rounded-xl flex flex-col items-center">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wide text-gray-300 mb-4 text-center">
                  Radar de Equilíbrio Existencial (0-10)
                </h4>
                <div className="w-full flex justify-center py-4 bg-gray-905/10 rounded-lg overflow-x-auto">
                  <svg width="340" height="340" className="overflow-visible">
                    {/* Concentric rings */}
                    {ringsArray.map(r => {
                      const ringPts = dimensionsList.map((_, i) => {
                        const ang = (i * 2 * Math.PI) / 6 - Math.PI / 2;
                        const rx = radarCX + (r / 10) * radarRadius * Math.cos(ang);
                        const ry = radarCY + (r / 10) * radarRadius * Math.sin(ang);
                        return `${rx},${ry}`;
                      }).join(" ");
                      return (
                        <g key={r}>
                          <polygon
                            points={ringPts}
                            fill="none"
                            stroke="#334155"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={radarCX + 4}
                            y={radarCY - (r / 10) * radarRadius + 4}
                            fill="#475569"
                            fontSize="8"
                            className="font-mono"
                          >
                            {r}
                          </text>
                        </g>
                      );
                    })}

                    {/* Radiating axes & labels */}
                    {dimensionsList.map((dim, i) => {
                      const ang = (i * 2 * Math.PI) / 6 - Math.PI / 2;
                      const axisX = radarCX + radarRadius * Math.cos(ang);
                      const axisY = radarCY + radarRadius * Math.sin(ang);
                      // Offset labels
                      const labelDistance = radarRadius + 22;
                      const lblX = radarCX + labelDistance * Math.cos(ang);
                      const lblY = radarCY + labelDistance * Math.sin(ang);
                      
                      let textAnchor = "middle";
                      if (Math.cos(ang) > 0.1) textAnchor = "start";
                      else if (Math.cos(ang) < -0.1) textAnchor = "end";

                      return (
                        <g key={dim.id}>
                          <line
                            x1={radarCX}
                            y1={radarCY}
                            x2={axisX}
                            y2={axisY}
                            stroke="#1e293b"
                            strokeWidth="1.5"
                          />
                          <text
                            x={lblX}
                            y={lblY}
                            fill="#94a3b8"
                            fontSize="10"
                            fontWeight="500"
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                            className="font-sans"
                          >
                            {dim.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* Filled value polygon */}
                    {state.satisfaction && (
                      <polygon
                        points={polygonCoordinates}
                        fill="rgba(99, 102, 241, 0.22)"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Interactive points */}
                    {radarPoints.map((pt, i) => (
                      <g key={i} className="group cursor-pointer">
                        <circle
                          cx={pt.px}
                          cy={pt.py}
                          r="5.5"
                          fill="#c7d2fe"
                          stroke="#4f46e5"
                          strokeWidth="2"
                        />
                        <title>{pt.name}: {pt.value} / 10</title>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* BAR CHART WITH TEXT COMPLEXITY VS SATISFACTION */}
              <div className="bg-gray-950 border border-gray-850 p-5 rounded-xl flex flex-col items-center">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wide text-gray-300 mb-4 text-center">
                  Quantidade de Informações x Nível de Satisfação
                </h4>
                <div className="w-full flex justify-center py-4 bg-gray-905/10 rounded-lg overflow-x-auto">
                  <svg width="340" height="340" className="overflow-visible">
                    {/* Grid Lines */}
                    {[2, 4, 6, 8, 10].map(val => {
                      const y = 260 - (val / 10) * barHeightMax;
                      return (
                        <g key={val}>
                          <line
                            x1="35"
                            y1={y}
                            x2="320"
                            y2={y}
                            stroke="#1e293b"
                            strokeWidth="1"
                          />
                          <text x="12" y={y + 3} fill="#475569" fontSize="8" className="font-mono text-right">
                            {val}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Baseline */}
                    <line x1="35" y1="260" x2="320" y2="260" stroke="#334155" strokeWidth="1.5" />

                    {/* Double Bars */}
                    {textCountData.map((dataItem, index) => {
                      const stepX = 35 + index * 47;
                      const fillPctMaxHeight = (dataItem.Preenchimento / 3) * barHeightMax;
                      const satPctMaxHeight = (dataItem.Satisfacao / 10) * barHeightMax;

                      const fillY = 260 - fillPctMaxHeight;
                      const satY = 260 - satPctMaxHeight;

                      return (
                        <g key={dataItem.name} className="group cursor-pointer">
                          {/* Preenchimento Bar (Massa de Autoconhecimento) */}
                          <rect
                            x={stepX + 6}
                            y={fillY}
                            width="14"
                            height={fillPctMaxHeight}
                            fill="#06b6d4"
                            rx="2"
                            className="transition-all hover:opacity-80"
                          >
                            <title>Campos Mapeados: {dataItem.Preenchimento}/3</title>
                          </rect>

                          {/* Satisfação Bar */}
                          <rect
                            x={stepX + 22}
                            y={satY}
                            width="14"
                            height={satPctMaxHeight}
                            fill="#8b5cf6"
                            rx="2"
                            className="transition-all hover:opacity-80"
                          >
                            <title>Satisfação Coerência: {dataItem.Satisfacao}/10</title>
                          </rect>

                          {/* X-Axis labels */}
                          <text
                            x={stepX + 21}
                            y="278"
                            fill="#94a3b8"
                            fontSize="9"
                            textAnchor="middle"
                            className="font-sans"
                          >
                            {dataItem.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* Chart Legends */}
                    <g transform="translate(45, 310)">
                      <rect x="0" y="0" width="10" height="10" fill="#06b6d4" rx="1.5" />
                      <text x="15" y="9" fill="#94a3b8" fontSize="9">Informações (Massa de Autoconhecimento 1-3)</text>
                    </g>
                    <g transform="translate(45, 325)">
                      <rect x="0" y="0" width="10" height="10" fill="#8b5cf6" rx="1.5" />
                      <text x="15" y="9" fill="#94a3b8" fontSize="9">Satisfação e Coerência Existencial (0-10)</text>
                    </g>
                  </svg>
                </div>
              </div>

            </div>

            {/* CLINICAL SUMMARY READONLY FOR REFERENCE */}
            <div className="bg-gray-950 border border-[#1e293b] p-5 rounded-xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Reflexões Clínicas Mapeadas:</h4>
              <div className="bg-gray-900/60 p-4 border border-gray-850 rounded text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                {state.clinicalNotes || "Sem parecer clínico preenchido até o momento. Volte para a aba 'Matriz' para formular suas conclusões."}
              </div>
            </div>

          </div>
        );
      })()}

      {viewMode === "facsimile" && (
        <div id="facsimile-ad-view" className="bg-slate-900 p-6 rounded-xl flex justify-center">
          
          <div className="bg-white text-black p-8 shadow-2xl rounded-sm w-full max-w-[850px] border border-gray-300 relative min-h-[1100px] font-sans flex flex-col justify-between">
            <div>
              {/* DOUBLE BORDER */}
              <div className="absolute inset-2 border-2 border-double border-black pointer-events-none" />

              {/* SHEET TITLE */}
              <div className="text-center py-6 border-b border-black mb-5">
                <h2 className="text-xl font-bold tracking-widest uppercase leading-none font-sans" style={{ letterSpacing: "0.15em" }}>
                  Exame das Atitudes e Efeitos nas Dimensões
                </h2>
              </div>

              {/* USER META */}
              <div className="grid grid-cols-3 gap-y-2 text-xs border border-black p-4 mb-5">
                <div className="col-span-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Paciente:</span>
                  <div className="border-b border-black w-[95%] font-mono py-0.5 uppercase tracking-wide text-black">
                    {patient.name || "NÃO INDICADO"}
                  </div>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Data:</span>
                  <div className="border-b border-black w-[90%] font-mono py-0.5">07/06/2026</div>
                </div>
                <div className="col-span-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Profissional:</span>
                  <div className="border-b border-black w-[95%] font-mono py-0.5">Dr(a). Lincoln Poubel</div>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] block">CRP:</span>
                  <div className="border-b border-black w-[90%] font-mono py-0.5">05 / 48392-RJ</div>
                </div>
              </div>

              {/* SHEET DESCRIPTION BANNER */}
              <p className="text-[11px] font-sans text-gray-700 italic border border-black bg-gray-50 px-4 py-3 text-center mb-5 leading-normal">
                Preencha esta grade analisando com honestidade as crenças de identidade (&quot;O Que Sou&quot;), os hábitos funcionais ou esquivos (&quot;O Que Faço&quot;) e as colheitas colaterais (&quot;O Que Tenho&quot;) para as seis principais esferas vitais do ser.
              </p>

              {/* TABLE CORRESPONDING TO SCREENSHOT */}
              <table className="w-full border border-black text-xs leading-normal font-sans">
                <thead>
                  <tr className="bg-black/5 font-bold uppercase tracking-wider text-[10px] border-b border-black">
                    <th className="py-2.5 px-3 text-center w-28 border-r border-black">Dimensões</th>
                    <th className="py-2.5 px-3 text-center w-48 border-r border-black">O que sou</th>
                    <th className="py-2.5 px-3 text-center w-48 border-r border-black">O que faço</th>
                    <th className="py-2.5 px-3 text-center w-48">O que tenho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {dimensionsList.map((dim) => {
                    const rowCells = state.cells[dim.id] || { sou: "", faco: "", tenho: "" };
                    const rangeVal = state.satisfaction[dim.id] !== undefined ? `${state.satisfaction[dim.id]}/10` : "—";
                    return (
                      <tr key={dim.id} className="min-h-[110px] align-top">
                        
                        {/* DIMENSION BRAND COLUMN */}
                        <td className="py-3 px-2 border-r border-black font-bold uppercase text-[10.5px] tracking-wide bg-gray-50/50 flex flex-col justify-between h-full min-h-[140px] text-center">
                          <div className="pt-2">
                            <span>{dim.name}</span>
                            <p className="text-[8px] font-normal text-gray-500 lowercase pr-1 text-center mt-1 leading-tight block">
                              {dim.name === "Ocupacional" ? "carreira/trabalho" : dim.name === "Recreativa" ? "lazer/descanso" : dim.name === "Existencial" ? "valores/legado" : "esfera vital"}
                            </p>
                          </div>
                          <div className="pb-2 border-t border-dashed border-gray-300 mt-5 pt-2">
                            <span className="text-[8px] text-gray-400 block font-mono font-normal">SATISFAÇÃO:</span>
                            <span className="font-mono text-xs text-black font-bold">{rangeVal}</span>
                          </div>
                        </td>

                        {/* CELL O QUE SOU */}
                        <td className="py-3 px-3 border-r border-black font-sans text-[11px] text-[#222222] whitespace-pre-wrap bg-white leading-relaxed">
                          {rowCells.sou || <div className="text-gray-300 italic font-mono text-[9px]">Não especificado</div>}
                        </td>

                        {/* CELL O QUE FAÇO */}
                        <td className="py-3 px-3 border-r border-black font-sans text-[11px] text-[#222222] whitespace-pre-wrap bg-white leading-relaxed">
                          {rowCells.faco || <div className="text-gray-300 italic font-mono text-[9px]">Não especificado</div>}
                        </td>

                        {/* CELL O QUE TENHO */}
                        <td className="py-3 px-3 font-sans text-[11px] text-[#222222] whitespace-pre-wrap bg-white leading-relaxed">
                          {rowCells.tenho || <div className="text-gray-300 italic font-mono text-[9px]">Não especificado</div>}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* FOOT CLINICAL PARADE PARECER */}
              {state.clinicalNotes && (
                <div className="mt-5 border border-black p-4 bg-white text-xs leading-relaxed font-sans">
                  <span className="font-bold uppercase tracking-wider block text-[10px] mb-1">Discussão e Parecer Clínico Unificado de Harmonia Multidimensional:</span>
                  <p className="text-[11px] text-black whitespace-pre-wrap leading-relaxed">{state.clinicalNotes}</p>
                </div>
              )}

            </div>

            {/* BRANDING OF PLATFORM */}
            <div className="mt-5 pt-3 border-t border-gray-300 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>Protocolo Clínico das Atitudes e Colheitas Multidimensionais • THP v4</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-700">Inteligência Psicológica</span>
                <span>•</span>
                <span>CRM-CBT</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
