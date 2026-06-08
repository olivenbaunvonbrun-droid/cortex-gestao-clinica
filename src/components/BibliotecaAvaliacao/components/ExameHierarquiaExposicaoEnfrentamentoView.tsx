import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Plus, Trash2, Sparkles, Award, Eye, Scale, HelpCircle, 
  CheckCircle2, AlertTriangle, Lightbulb, Clipboard, ArrowRight,
  BookOpen, Heart, ShieldCheck, Check, Activity, TrendingUp, X, Printer, Edit2, ListOrdered, Info, Play, BookmarkCheck
} from "lucide-react";

export interface HierarquiaItem {
  id: string;
  circunstancia: string;
  frequencia: number;     // 0 a 10
  incomodo: number;       // 0 a 10
  dificuldade: number;    // 0 a 10
  total: number;          // F + I + D (0 a 30)
  status: "pendente" | "em_progresso" | "enfrentado";
  confrontationPlan?: string;
}

export interface ExameHierarquiaExposicaoState {
  items: HierarquiaItem[];
  clinicalNotes: string;
}

interface ExameHierarquiaViewProps {
  patient: PatientInfo;
  state: ExameHierarquiaExposicaoState;
  setState: React.Dispatch<React.SetStateAction<ExameHierarquiaExposicaoState>>;
}

export default function ExameHierarquiaExposicaoEnfrentamentoView({
  patient,
  state,
  setState
}: ExameHierarquiaViewProps) {
  const [viewMode, setViewMode] = useState<"editor" | "facsimile">("editor");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form values
  const [circunstancia, setCircunstancia] = useState("");
  const [frequencia, setFrequencia] = useState<number>(5);
  const [incomodo, setIncomodo] = useState<number>(5);
  const [dificuldade, setDificuldade] = useState<number>(5);
  const [status, setStatus] = useState<"pendente" | "em_progresso" | "enfrentado">("pendente");
  const [confrontationPlan, setConfrontationPlan] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setCircunstancia("");
    setFrequencia(5);
    setIncomodo(5);
    setDificuldade(5);
    setStatus("pendente");
    setConfrontationPlan("");
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (item: HierarquiaItem) => {
    setEditingId(item.id);
    setCircunstancia(item.circunstancia);
    setFrequencia(item.frequencia);
    setIncomodo(item.incomodo);
    setDificuldade(item.dificuldade);
    setStatus(item.status);
    setConfrontationPlan(item.confrontationPlan || "");
    setIsFormOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circunstancia.trim()) return;

    const total = Number(frequencia) + Number(incomodo) + Number(dificuldade);

    if (editingId) {
      // Editar item existente
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === editingId
            ? { 
                ...item, 
                circunstancia, 
                frequencia: Number(frequencia), 
                incomodo: Number(incomodo), 
                dificuldade: Number(dificuldade), 
                total,
                status,
                confrontationPlan 
              }
            : item
        ),
      }));
    } else {
      // Criar item novo
      const newItem: HierarquiaItem = {
        id: "exp_item_" + Date.now(),
        circunstancia,
        frequencia: Number(frequencia),
        incomodo: Number(incomodo),
        dificuldade: Number(dificuldade),
        total,
        status,
        confrontationPlan
      };
      setState((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
    resetForm();
  };

  const handleDeleteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
    if (editingId === id) {
      resetForm();
    }
  };

  const loadPresetSamples = () => {
    const samples: HierarquiaItem[] = [
      {
        id: "exp_preset_1",
        circunstancia: "Perguntar as horas para um desconhecido na rua.",
        frequencia: 8,
        incomodo: 3,
        dificuldade: 2,
        total: 13,
        status: "enfrentado",
        confrontationPlan: "Parar alguém com postura amigável, respirar calmamente antes e perguntar polidamente. Validar o sentimento de êxito."
      },
      {
        id: "exp_preset_2",
        circunstancia: "Pedir um desconto simples de 5% no caixa de uma loja física.",
        frequencia: 6,
        incomodo: 5,
        dificuldade: 4,
        total: 15,
        status: "em_progresso",
        confrontationPlan: "Perguntar sorrindo se há desconto à vista. Caso neguem, aceitar polidamente sem se desculpar pelo questionamento."
      },
      {
        id: "exp_preset_3",
        circunstancia: "Participar de uma reunião de trabalho e emitir uma opinião contrária à do gestor de equipe.",
        frequencia: 4,
        incomodo: 7,
        dificuldade: 6,
        total: 17,
        status: "pendente",
        confrontationPlan: "Estruturar o argumento em tópicos técnicos. Começar validando o ponto de vista dele e introduzir a alternativa de forma construtiva."
      },
      {
        id: "exp_preset_4",
        circunstancia: "Dar uma palestra presencial sobre meu tema de atuação para uma audiência de 40 pessoas.",
        frequencia: 2,
        incomodo: 9,
        dificuldade: 9,
        total: 20,
        status: "pendente",
        confrontationPlan: "Treinar a apresentação em casa gravando o áudio. Fazer micro-ensaios mentais aplicando a dessensibilização sistemática antes de subir ao palco."
      },
      {
        id: "exp_preset_5",
        circunstancia: "Dizer não firmemente a uma exigência extra-trabalho que desrespeita meu horário de descanso pessoal.",
        frequencia: 7,
        incomodo: 8,
        dificuldade: 8,
        total: 23,
        status: "pendente",
        confrontationPlan: "Usar a técnica de assertividade do 'disco riscado'. Explicar com tom de voz calmo que prezo pela linha saudável de trabalho e vida pessoal."
      }
    ];

    setState({
      items: samples,
      clinicalNotes: "O paciente responde de forma positiva ao modelo de exposição gradual. Foi mapeada uma sensibilidade moderada com tendência à evitação fóbica em contextos relacionais corporativos e de autoafirmação profissional. A hierarquização baseada nas notas de Frequência, Incômodo e Dificuldade (F-I-D) permite direcionar intervenções iniciais e agendamento de micro-metas terapêuticas focadas na base do gráfico (itens de menor pontuação geral, iniciando com o enfrentamento bem-sucedido de interações cotidianas)."
    });
  };

  // Sort items by TOTAL descending for visual sequence and planning prioritization
  const sortedItems = [...state.items].sort((a, b) => b.total - a.total);

  // Statistics and Scores
  const totalItemsCount = state.items.length;
  const facedItemsCount = state.items.filter(i => i.status === "enfrentado").length;
  const inProgressCount = state.items.filter(i => i.status === "em_progresso").length;
  const pendingCount = state.items.filter(i => i.status === "pendente").length;

  const resolutionRate = totalItemsCount > 0 ? Math.round((facedItemsCount / totalItemsCount) * 100) : 0;

  // Average FID Scores
  const avgFreq = totalItemsCount > 0 
    ? Number((state.items.reduce((acc, i) => acc + i.frequencia, 0) / totalItemsCount).toFixed(1)) 
    : 0;
  
  const avgIncomodo = totalItemsCount > 0 
    ? Number((state.items.reduce((acc, i) => acc + i.incomodo, 0) / totalItemsCount).toFixed(1)) 
    : 0;
    
  const avgDificuldade = totalItemsCount > 0 
    ? Number((state.items.reduce((acc, i) => acc + i.dificuldade, 0) / totalItemsCount).toFixed(1)) 
    : 0;

  // Calculando o Índice de Carga de Enfrentamento Ativo (ICEA)
  // Baseia-se no total combinado dos itens pendentes e em progresso.
  const maxPossiblePoints = totalItemsCount * 30;
  const cumulativeActivePoints = state.items.reduce((acc, i) => {
    // Itens enfrentados reduzem a carga no presente, itens pendentes pesam 100%, em progresso pesam 50%
    if (i.status === "pendente") return acc + i.total;
    if (i.status === "em_progresso") return acc + (i.total * 0.5);
    return acc;
  }, 0);

  const activeLoadIndex = maxPossiblePoints > 0 ? Math.round((cumulativeActivePoints / maxPossiblePoints) * 100) : 0;

  let classificationText = "Sem Circunstâncias Registradas";
  let classificationDesc = "Forneça as circunstâncias problemáticas e estressores do paciente para gerar o modelo de exposição.";
  let barColorClass = "bg-gray-700";

  if (totalItemsCount > 0) {
    if (activeLoadIndex >= 70) {
      classificationText = "Carga de Evitação Fóbica Crítica (Sobrecarga de Estressores)";
      classificationDesc = "O paciente possui múltiplos e intensos estressores pendentes que ativam forte esquiva experiencial. Recomendado focar imediatamente em micro-exposições controladas na base do funil.";
      barColorClass = "bg-rose-500 linear-pulse";
    } else if (activeLoadIndex >= 40) {
      classificationText = "Carga de Enfrentamento Moderada (Engajamento em Progresso)";
      classificationDesc = "O paciente depara-se com pendências relevantes, porém demonstra progresso inicial de exposição ativa. O funil está equilibrado.";
      barColorClass = "bg-amber-500 animate-pulse";
    } else {
      classificationText = "Carga Sob Controle (Padrão Resiliente Consolidado)";
      classificationDesc = "Alto índice de resolutividade prática. O paciente enfrenta de forma sistemática as circunstâncias fóbicas com baixas manifestações de recuo.";
      barColorClass = "bg-emerald-500 border border-emerald-400";
    }
  }

  return (
    <div className="space-y-6 text-[#E0E0E0] p-1" id="exame-hierarquia-exposicao-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <ListOrdered className="w-4 h-4 text-indigo-400" />
            <span>Ferramenta Integradora nº 27</span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mt-1">
            Hierarquia de Exposição e Enfrentamento
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Aprofunda as HPs de <span className="text-[#00A3FF] font-semibold">Autorregulação Emocional</span> e{" "}
            <span className="text-emerald-400 font-semibold">Resolutividade de Enfrentamento</span>. 
            Mapeia circunstâncias estressoras, pendências ou fobia comportamental e as ordena de forma métrica para orientar uma dessensibilização progressiva guiada por valores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("editor")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md border flex items-center gap-2 transition ${
              viewMode === "editor"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                : "border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white"
            }`}
            id="btn-hierarquia-mode-editor"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Painel Interativo
          </button>
          
          <button
            onClick={() => setViewMode("facsimile")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md border flex items-center gap-2 transition ${
              viewMode === "facsimile"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                : "border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white"
            }`}
            id="btn-hierarquia-mode-facsimile"
          >
            <Printer className="w-3.5 h-3.5" />
            Folha Oficial (PDF)
          </button>
        </div>
      </div>

      {viewMode === "editor" ? (
        <div className="space-y-6" id="hierarquia-editor-layout">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="hierarquia-stats-grid">
            
            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg hover:border-gray-700 transition">
              <div className="text-2xl font-bold font-mono text-indigo-400">{activeLoadIndex}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Carga de Evitação Ativa</div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full ${barColorClass}`} 
                  style={{ width: `${activeLoadIndex}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg hover:border-gray-700 transition">
              <div className="text-2xl font-bold font-mono text-emerald-400">{resolutionRate}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Taxa de Resolutividade</div>
              <p className="text-[9px] text-gray-500 mt-1">Proporção de circunstâncias com sucesso de exposição</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg hover:border-gray-700 transition">
              <div className="text-2xl font-bold font-mono text-cyan-400">{totalItemsCount}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Circunstâncias</div>
              <div className="flex justify-center gap-1.5 text-[9px] font-mono mt-1.5">
                <span className="text-rose-400">P: {pendingCount}</span>
                <span className="text-amber-400">EP: {inProgressCount}</span>
                <span className="text-emerald-400">E: {facedItemsCount}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg hover:border-gray-700 transition">
              <div className="text-2xl font-bold font-mono text-amber-400">{(avgFreq + avgIncomodo + avgDificuldade).toFixed(1)}/30</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Média F-I-D Geral</div>
              <div className="flex justify-center gap-1.5 text-[9px] font-mono mt-1 border-t border-gray-850 pt-1">
                <span>F: {avgFreq}</span>
                <span>I: {avgIncomodo}</span>
                <span>D: {avgDificuldade}</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC METRIC FEEDBACK */}
          {totalItemsCount > 0 ? (
            <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 mt-0.5">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-gray-200">{classificationText}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 max-w-2xl">{classificationDesc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-mono font-semibold text-emerald-400">Modelo Psicoeducativo F-I-D</span>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-5 flex flex-col items-center text-center">
              <BookmarkCheck className="w-10 h-10 text-indigo-400 mb-2" />
              <h3 className="text-sm font-semibold text-white">Iniciar Diagnóstico de Enfrentamento</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-lg mb-4">
                Você pode preencher individualmente os estressores do paciente ou carregar um caso clínico estruturado para fins acadêmicos e pedagógicos.
              </p>
              <button
                type="button"
                onClick={loadPresetSamples}
                className="px-4 py-1.5 text-xs font-mono uppercase bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/50 hover:border-indigo-500 text-white rounded transition flex items-center gap-1.5"
                id="btn-load-hierarquia-presets"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Carregar Caso Clínico Exemplo
              </button>
            </div>
          )}

          {/* MAIN WORKING PANELS: EDIT FORM & LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="working-panels-hierarquia">
            
            {/* ITEM FORM CONTAINER (4 columns) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-900 pb-2 mb-3">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                    {editingId ? <Edit2 className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-indigo-400" />}
                    {editingId ? "Editar Circunstância" : "Nova Circunstância"}
                  </h2>
                  {editingId && (
                    <button onClick={resetForm} className="text-gray-500 hover:text-white" title="Cancelar Edição">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveItem} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">Circunstância / Estressor / Pendência:</label>
                    <textarea
                      value={circunstancia}
                      onChange={(e) => setCircunstancia(e.target.value)}
                      placeholder="Ex: Fazer perguntas logo após o palestrante terminar, perante dezenas de especialistas do setor..."
                      rows={3}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 focus:outline-none rounded px-2.5 py-1.5 text-white resize-none"
                      required
                      id="input-circunstancia"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold" title="O quanto isso se repete ou manifesta na rotina do paciente">Frequência</label>
                        <span className="font-mono text-indigo-400 font-bold">{frequencia}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={frequencia}
                        onChange={(e) => setFrequencia(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold" title="O nível de incômodo, sofrimento ou ansiedade que essa circunstância gera">Incômodo</label>
                        <span className="font-mono text-emerald-400 font-bold">{incomodo}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={incomodo}
                        onChange={(e) => setIncomodo(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold" title="O nível de dificuldade prática que o paciente sente para enfrentar ativamente">Dificuldade</label>
                        <span className="font-mono text-rose-400 font-bold">{dificuldade}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={dificuldade}
                        onChange={(e) => setDificuldade(Number(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* DISPLAY PREVIEW OF MATHEMATICAL TOTAL */}
                  <div className="bg-gray-900/60 p-2 rounded-lg border border-gray-850 flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold">Nota de Criticidade Total (FID):</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Soma matemática (Máx: 30)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold font-mono text-amber-400">{Number(frequencia) + Number(incomodo) + Number(dificuldade)}</span>
                      <span className="text-[9px] text-gray-500"> /30</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">Status do Enfrentamento:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-white"
                      id="select-status"
                    >
                      <option value="pendente">🔴 Pendente (Evitado ou Não Iniciado)</option>
                      <option value="em_progresso">🟡 Em Progresso (Desenvolvimento)</option>
                      <option value="enfrentado">🟢 Enfrentado com Sucesso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">Planejamento de Enfrentamento / Notas:</label>
                    <textarea
                      value={confrontationPlan}
                      onChange={(e) => setConfrontationPlan(e.target.value)}
                      placeholder="Quais técnicas de autorregulação e microetapas o paciente utilizará para enfrentar?"
                      rows={4}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 focus:outline-none rounded px-2.5 py-1.5 text-white resize-none"
                      id="input-confrontation-plan"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-[11px] uppercase tracking-wide transition flex items-center justify-center gap-1.5 shadow"
                    id="btn-save-hierarquia-item"
                  >
                    {editingId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {editingId ? "Salvar Alterações" : "Adicionar à Hierarquia"}
                  </button>
                </form>
              </div>
            </div>

            {/* LIST OF PRIORITIZED CIRCUMSTANCES (8 columns) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col h-full min-h-[450px]">
                <div className="flex items-center justify-between border-b border-gray-900 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      Circunstâncias Ordenadas por Gravidade (Métrica FID)
                    </h2>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Mais críticos no topo</span>
                </div>

                {state.items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <Info className="w-8 h-8 text-gray-600 mb-1" />
                    <p className="text-xs text-gray-400">Nenhum estressor registrado na hierarquia de exposição.</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Use o painel lateral para registrar ou carregue o caso clínico pré-definido.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {sortedItems.map((item, idx) => {
                      const priorityColor = item.total >= 22 
                        ? "border-l-4 border-l-rose-500" 
                        : item.total >= 15 
                          ? "border-l-4 border-l-amber-500" 
                          : "border-l-4 border-l-emerald-500";

                      const statusBadge = item.status === "enfrentado" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : item.status === "em_progresso"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20";

                      const statusLabel = item.status === "enfrentado" 
                        ? "Enfrentado"
                        : item.status === "em_progresso"
                          ? "Em Progresso"
                          : "Pendente";

                      return (
                        <div 
                          key={item.id} 
                          className={`bg-gray-900 rounded-lg p-3.5 border border-gray-850 hover:border-gray-700 transition flex flex-col md:flex-row md:items-start justify-between gap-3 ${priorityColor}`}
                        >
                          <div className="space-y-2 flex-1">
                            {/* Circumstance and badge */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-mono text-gray-500">#{state.items.length - idx}</span>
                              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full ${statusBadge}`}>
                                {statusLabel}
                              </span>
                              {item.total >= 20 && (
                                <span className="bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                                  Complexidade Alta
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-white leading-relaxed font-medium">
                              {item.circunstancia}
                            </p>

                            {/* Plan or details */}
                            {item.confrontationPlan && (
                              <div className="bg-gray-950 p-2.5 rounded border border-gray-850 mt-1">
                                <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1 font-sans">
                                  <Lightbulb className="w-3 text-indigo-400" />
                                  Planejamento de Enfrentamento Ativo:
                                </div>
                                <p className="text-[11px] text-gray-300 mt-1 italic leading-relaxed">
                                  &ldquo;{item.confrontationPlan}&rdquo;
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Scores & Editing */}
                          <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-3 border-t md:border-t-0 border-gray-850 pt-2.5 md:pt-0 shrink-0">
                            {/* F I D T Grid */}
                            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
                              <div className="bg-gray-950 px-1.5 py-0.5 rounded border border-gray-850">
                                <span className="text-gray-500 block text-[8px] uppercase">F</span>
                                <span className="text-indigo-400 font-bold">{item.frequencia}</span>
                              </div>
                              <div className="bg-gray-950 px-1.5 py-0.5 rounded border border-gray-850">
                                <span className="text-gray-500 block text-[8px] uppercase">I</span>
                                <span className="text-emerald-400 font-bold">{item.incomodo}</span>
                              </div>
                              <div className="bg-gray-950 px-1.5 py-0.5 rounded border border-gray-850">
                                <span className="text-gray-500 block text-[8px] uppercase">D</span>
                                <span className="text-rose-400 font-bold">{item.dificuldade}</span>
                              </div>
                              <div className="bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-700/30">
                                <span className="text-gray-400 block text-[8px] uppercase">T</span>
                                <span className="text-amber-400 font-bold">{item.total}</span>
                              </div>
                            </div>

                            {/* Actions button */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-1 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded transition"
                                title="Editar Circunstância"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded transition"
                                title="Excluir Circunstância"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* CLINICAL NOTES REMARKS PANEL */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 mt-6">
            <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-2 flex items-center gap-1.5">
              <Clipboard className="w-4 h-4 text-indigo-400" />
              Observações Clínicas e Diretrizes de Exposição (Método Poubel &amp; Rodrigues)
            </h2>
            <textarea
              value={state.clinicalNotes}
              onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
              rows={4}
              placeholder="Digite aqui as considerações sobre a tolerância de estresse, evolução das sessões, resposta cardíaca simulada ou resiliência experiencial observada..."
              className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500 focus:outline-none rounded p-3 text-xs text-[#E0E0E0]"
              id="hierarquia-clinical-notes"
            />
            <div className="flex items-start gap-2 text-[10px] text-gray-500 mt-2">
              <Info className="w-3.5 h-3.5 text-[#00A3FF] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Orientações Metodológicas:</strong> Sempre comece as exposições pelas circunstâncias de menor pontuação (Total &lt; 12) na base da tabela. Uma vez tolerado o incômodo com o uso correto de respiração diafragmática lentificada, evolua gradualmente para o próximo degrau fóbico.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* --- FACSIMILE PRINTER PORTRAIT LAYOUT --- */
        <div 
          className="bg-white text-black p-8 rounded-lg max-w-4xl mx-auto shadow-2xl space-y-6 font-sans relative border-2 border-slate-300"
          id="facsimile-portrait-hierarquia"
          style={{ minHeight: "1050px" }}
        >
          
          {/* Top Elegant Bordering */}
          <div className="absolute top-2 left-2 right-2 bottom-2 border border-slate-200 pointer-events-none rounded"></div>

          {/* TITLE SECTION WITH DOUBLE FRAME */}
          <div className="border-2 border-black p-4 text-center mt-2 relative">
            <h2 className="text-xl font-bold font-mono tracking-tight uppercase">
              Hierarquia de Exposição e Enfrentamento
            </h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">
              Método Integrador de Resiliência Ativa &mdash; Ferramenta nᵒ 27
            </p>
          </div>

          {/* PATIENT INFO HEADER */}
          <div className="border border-black divide-y divide-black text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-black">
              <div className="p-2">
                <span className="font-bold font-mono text-[9px] uppercase block text-slate-500">Profissional / Avaliador:</span>
                <span className="font-semibold uppercase text-slate-800">Lincoln Poubel &amp; Pedro Rodrigues (Simulação)</span>
              </div>
              <div className="p-2">
                <span className="font-bold font-mono text-[9px] uppercase block text-slate-500">CRP:</span>
                <span className="font-semibold text-slate-800">05/12345 (Ativo)</span>
              </div>
            </div>
            <div className="p-2">
              <span className="font-bold font-mono text-[9px] uppercase block text-slate-500">Paciente / Avaliado:</span>
              <span className="font-bold text-slate-900 text-sm uppercase">{patient.name || "Paciente Demo"}</span>
            </div>
          </div>

          {/* EXPLANATORY CAPTION */}
          <p className="text-[10px] text-slate-600 leading-relaxed text-justify">
            A tabela abaixo organiza, de forma hierárquica, as circunstâncias problemáticas, pendências e aversões que demandam enfrentamento ativo por parte do avaliado. A graduação baseia-se nos índices de Frequência na rotina (F), Incômodo subjetivo associado (I) e Dificuldade observada de resolução (D). O Total (T) é a soma simples, no qual os itens de menor valor indicam degraus de acesso primário perfeitos para micro-exposições.
          </p>

          {/* TABLE RESEMBLING THE PDF VISUAL AND CODES */}
          <div className="border border-black overflow-hidden">
            <table className="w-full text-xs text-left divide-y divide-black">
              <thead className="bg-slate-50 text-[10px] text-slate-800 font-mono font-bold uppercase divide-x divide-black divide-y divide-black">
                <tr className="divide-x divide-black">
                  <th className="p-2 w-[10px]">#</th>
                  <th className="p-2 w-[350px]">Circunstâncias / Desafios Mapeados</th>
                  <th className="p-2 text-center w-[50px] font-mono">F</th>
                  <th className="p-2 text-center w-[50px] font-mono">I</th>
                  <th className="p-2 text-center w-[50px] font-mono">D</th>
                  <th className="p-2 text-center w-[60px] bg-slate-100 font-mono">T</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {state.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                      Nenhuma circunstância preenchida para visualização em facsimile.
                    </td>
                  </tr>
                ) : (
                  // Display rows. In case of small list, pad up to 10 lines to look like the empty list PDF page
                  Array.from({ length: Math.max(12, state.items.length) }).map((_, index) => {
                    const item = sortedItems[index];
                    return (
                      <tr key={index} className="divide-x divide-black">
                        <td className="p-2.5 text-center font-mono text-[10px] text-slate-500">
                          {index + 1}
                        </td>
                        <td className="p-2.5 text-xs text-slate-900 font-sans">
                          {item ? (
                            <div>
                              <p className="font-semibold leading-normal">{item.circunstancia}</p>
                              {item.confrontationPlan && (
                                <p className="text-[10px] text-slate-500 mt-1 italic">
                                  Plano: {item.confrontationPlan}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="h-5"></div>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                          {item ? item.frequencia : ""}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                          {item ? item.incomodo : ""}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                          {item ? item.dificuldade : ""}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold bg-slate-50 text-slate-950">
                          {item ? item.total : ""}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* CLINICAL NOTE IN THE FACSIMILE */}
          {state.clinicalNotes && (
            <div className="border border-black p-4 bg-slate-50 rounded space-y-1">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-500 block">Observações e Recomendações Clínicas:</span>
              <p className="text-xs leading-relaxed text-slate-800 italic whitespace-pre-wrap">
                &ldquo;{state.clinicalNotes}&rdquo;
              </p>
            </div>
          )}

          {/* EXPLANATORY LEGEND AT THE BOTTOM MATCHING THE IMAGE */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-slate-300 pt-6 gap-6 relative">
            <div className="text-[9px] font-mono text-slate-600 uppercase space-y-1">
              <p className="font-bold text-slate-800 text-[10px] mb-1">Métrica de Pontuação (FID):</p>
              <p>F: Frequência (Escala 0 a 10)</p>
              <p>I: Incômodo (Escala 0 a 10)</p>
              <p>D: Dificuldade (Escala 0 a 10)</p>
              <p>T: Total (Soma F + I + D | Máx: 30)</p>
            </div>

            {/* Simulated QR Code / Seal of Quality */}
            <div className="flex items-center gap-3 self-end md:-mb-1">
              <div className="text-right">
                <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Inteligência</span>
                <span className="text-xs font-mono font-bold tracking-tighter text-slate-800 -mt-1 block">PSICOLÓGICA</span>
                <span className="text-[7.5px] text-slate-400 font-sans block uppercase mt-0.5">MÉTODO POUBEL E RODRIGUES</span>
              </div>
              <div className="w-10 h-10 border border-slate-400 flex items-center justify-center p-1 rounded">
                {/* Simulated minimal vector atom */}
                <div className="w-full h-full relative flex items-center justify-center opacity-30">
                  <div className="absolute w-4 h-8 rounded-full border border-slate-950 rotate-45"></div>
                  <div className="absolute w-4 h-8 rounded-full border border-slate-950 -rotate-45"></div>
                  <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
