import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Plus, Trash2, Sparkles, Award, Eye, Scale, HelpCircle, 
  CheckCircle2, AlertTriangle, Lightbulb, Clipboard, ArrowRight,
  BookOpen, Heart, ShieldCheck, Check, Activity, TrendingUp, X, Printer, Edit2, MessageSquare
} from "lucide-react";

export interface FeedbackInterviewItem {
  id: string;
  entrevistado: string;             // Name or relationship (e.g., "Esposa/Cônjuge", "Amigo", "Colega")
  feedbackRecebido: string;         // The text of the feedback received
  analiseFeedback: string;          // Joint analysis or conclusion
  correspondenciaRealidade: number; // 1 to 5 (Scientific Filter 1)
  verificabilidade: number;         // 1 to 5 (Scientific Filter 2)
  justicaConceitual: number;        // 1 to 5 (Scientific Filter 3)
  integridadeEtica: number;         // 1 to 5 (Ethical Filter - Respect/Honesty/Utility)
  classificacao: "defice_real" | "reforco_potencial" | "ruido_injusto" | "incoerente";
}

export interface ExameFeedbacksEntrevistaState {
  items: FeedbackInterviewItem[];
  clinicalNotes: string;
}

interface ExameFeedbacksEntrevistaViewProps {
  patient: PatientInfo;
  state: ExameFeedbacksEntrevistaState;
  setState: React.Dispatch<React.SetStateAction<ExameFeedbacksEntrevistaState>>;
}

export default function ExameFeedbacksEntrevistaView({
  patient,
  state,
  setState
}: ExameFeedbacksEntrevistaViewProps) {
  const [viewMode, setViewMode] = useState<"editor" | "facsimile">("editor");
  const [activeTab, setActiveTab] = useState<"todos" | "cientifico" | "etico">("todos");
  
  // Local state for temporary inputs
  const [newEntrevistado, setNewEntrevistado] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
  const [newAnalise, setNewAnalise] = useState("");
  const [newRealidade, setNewRealidade] = useState<number>(3);
  const [newVerificavel, setNewVerificavel] = useState<number>(3);
  const [newJusto, setNewJusto] = useState<number>(3);
  const [newEtico, setNewEtico] = useState<number>(3);
  const [newClassificacao, setNewClassificacao] = useState<FeedbackInterviewItem["classificacao"]>("defice_real");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Helper: Reset new feedback inputs
  const resetForm = () => {
    setNewEntrevistado("");
    setNewFeedback("");
    setNewAnalise("");
    setNewRealidade(3);
    setNewVerificavel(3);
    setNewJusto(3);
    setNewEtico(3);
    setNewClassificacao("defice_real");
    setEditingItemId(null);
  };

  // Add or Edit Feedback Item
  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntrevistado.trim() || !newFeedback.trim()) return;

    if (editingItemId) {
      // Modify existing
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                entrevistado: newEntrevistado,
                feedbackRecebido: newFeedback,
                analiseFeedback: newAnalise,
                correspondenciaRealidade: newRealidade,
                verificabilidade: newVerificavel,
                justicaConceitual: newJusto,
                integridadeEtica: newEtico,
                classificacao: newClassificacao,
              }
            : item
        ),
      }));
    } else {
      // Create new
      const newItem: FeedbackInterviewItem = {
        id: "fb_" + Date.now(),
        entrevistado: newEntrevistado,
        feedbackRecebido: newFeedback,
        analiseFeedback: newAnalise,
        correspondenciaRealidade: newRealidade,
        verificabilidade: newVerificavel,
        justicaConceitual: newJusto,
        integridadeEtica: newEtico,
        classificacao: newClassificacao,
      };
      setState((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
    resetForm();
  };

  // Populate form for editing
  const handleStartEdit = (item: FeedbackInterviewItem) => {
    setEditingItemId(item.id);
    setNewEntrevistado(item.entrevistado);
    setNewFeedback(item.feedbackRecebido);
    setNewAnalise(item.analiseFeedback);
    setNewRealidade(item.correspondenciaRealidade);
    setNewVerificavel(item.verificabilidade);
    setNewJusto(item.justicaConceitual);
    setNewEtico(item.integridadeEtica);
    setNewClassificacao(item.classificacao);
  };

  // Delete an item
  const handleDeleteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
    if (editingItemId === id) {
      resetForm();
    }
  };

  const loadPresetSample = () => {
    const presets: FeedbackInterviewItem[] = [
      {
        id: "preset_1",
        entrevistado: "Esposa/Cônjuge",
        feedbackRecebido: "Você é extremamente dedicado e focado quando assume um projeto, mas às vezes se cobra tanto que fica ansioso, impaciente com a família e demora muito para entregar por medo de errar.",
        analiseFeedback: "Feedback justo que reflete perfeccionismo disfuncional. O filtro de realidade e verificabilidade aponta alta correspondência de fatos. É um déficit real na HP de autogestão emocional e autocontrole, onde a cobrança drena o bem-estar familiar.",
        correspondenciaRealidade: 5,
        verificabilidade: 5,
        justicaConceitual: 5,
        integridadeEtica: 5,
        classificacao: "defice_real"
      },
      {
        id: "preset_2",
        entrevistado: "Colega de Trabalho Corporativo",
        feedbackRecebido: "Se você pedir demissão para abrir seu negócio, você vai fracassar miseravelmente. Estamos no pior momento do país e estabilidade é a única coisa inteligente no momento.",
        analiseFeedback: "Incoerente e injusto metodologicamente. O feedback é guiado pelo medo de projeção dele e pelo excesso de catastrofismo. Não é baseado em dados factuais sobre meu projeto. É ruído social/opinativo sem fundamento ético-científico para minha carreira.",
        correspondenciaRealidade: 1,
        verificabilidade: 1,
        justicaConceitual: 2,
        integridadeEtica: 2,
        classificacao: "ruido_injusto"
      },
      {
        id: "preset_3",
        entrevistado: "Amigo de Infância",
        feedbackRecebido: "Você é um ponto de segurança para todos nós e escuta todo mundo com uma empatia incrível, mas percebo que você quase nunca se abre sobre seus próprios problemas e reluta em pedir apoio quando está sobrecarregado.",
        analiseFeedback: "Excelente percepção construtiva. Corresponde plenamente à realidade histórica. Representa um ponto de reforço potencial que já domino (sociabilidade empática), mas revela um déficit na HP de autoestima e auto-revelação vulnerável.",
        correspondenciaRealidade: 5,
        verificabilidade: 4,
        justicaConceitual: 5,
        integridadeEtica: 5,
        classificacao: "reforco_potencial"
      }
    ];

    setState(prev => ({
      ...prev,
      items: [...prev.items, ...presets.filter(p => !prev.items.some(existing => existing.entrevistado === p.entrevistado))]
    }));
  };

  // Calculations for Scoring / Analytics
  const totalCount = state.items.length;
  const filteredCientifico = state.items.map(item => {
    // Scientific average: realidad + verificavel + justo / 3
    return (item.correspondenciaRealidade + item.verificabilidade + item.justicaConceitual) / 3;
  });
  
  const avgScientific = totalCount > 0 
    ? parseFloat((filteredCientifico.reduce((a, b) => a + b, 0) / totalCount).toFixed(2))
    : 0;

  const avgEthical = totalCount > 0
    ? parseFloat((state.items.reduce((sum, item) => sum + item.integridadeEtica, 0) / totalCount).toFixed(2))
    : 0;

  // Let's compute the overall "Roteiro de Racionalidade de Feedback"
  // Scientific score contributes 50%, Ethical contributes 50%
  // But adjusted: if a feedback is categorized as "ruido_injusto" and has low ratings, it shows the patient properly recognized it!
  // To avoid penalizing high-conflict/ruido feedback, indeed we calculate how well the diagnostic matches:
  // e.g. If correspondencia is low AND the user classified it as "ruido_injusto", it's a correct diagnostic (Filter hit)!
  // If correspondencia is high AND user classified it as "defice_real" or "reforco_potencial", it's also a Filter hit!
  const filterHits = state.items.filter(item => {
    const isFeedbackRacional = (item.correspondenciaRealidade + item.verificabilidade + item.justicaConceitual) / 3 >= 3.5;
    if (isFeedbackRacional && (item.classificacao === "defice_real" || item.classificacao === "reforco_potencial")) {
      return true;
    }
    if (!isFeedbackRacional && (item.classificacao === "ruido_injusto" || item.classificacao === "incoerente")) {
      return true;
    }
    return false;
  }).length;

  const filtroEficaciaScore = totalCount > 0 
    ? Math.round((filterHits / totalCount) * 100) 
    : 0;

  // Global IRF - Índice de Rabilidade de Feedback
  const irfScore = totalCount > 0
    ? Math.min(100, Math.round((avgScientific * 10) + (avgEthical * 10)))
    : 0;

  let classificationText = "Nenhum feedback registrado";
  let classificationDesc = "Insira relatos de pessoas próximas para avaliar correspondências cognitivas e praticar barreiras saudáveis de imunidade social.";
  
  if (totalCount > 0) {
    if (irfScore >= 80 && filtroEficaciaScore >= 80) {
      classificationText = "Excelente Funcionamento de Imunidade Social e Assertividade Perceptiva";
      classificationDesc = "Exibe filtros éticos e científicos altamente maduros. Filtra adequadamente ruídos fóbicos/catastróficos alheios e assimila com clareza vulnerabilidades legítimas no seu autoconhecimento.";
    } else if (irfScore >= 60) {
      classificationText = "Imunidade Social Equilibrada com Assimilação Moderada";
      classificationDesc = "O paciente consegue discernir feedbacks justos dos desadaptativos, mas pode demonstrar certa instabilidade emocional ou ambivalência ao internalizar críticas duras.";
    } else {
      classificationText = "Alta Vulnerabilidade ao Ruído Crítico Interpessoal";
      classificationDesc = "Filtração frágil de comentários externos. Tende a adotar críticas catastróficas desestruturadas do ambiente (falta de filtro científico) ou resistir a feedbacks construtivos legítimos.";
    }
  }

  return (
    <div className="space-y-6 text-[#E0E0E0] p-1" id="exame-feedbacks-entrevista-root">
      
      {/* 1. TOP HEADER BRANDING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Ferramenta Integradora nº 21</span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mt-1">
            Exame de Feedbacks (Entrevista e Filtros)
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Permite documentar relatos interpessoais sinceros colhidos no convívio ativo do paciente. 
            O paciente analisa cada crítica ou elogio junto ao terapeuta sob o crivo da <span className="text-emerald-400 font-semibold">Ciência (Fatos e Verificabilidade)</span> e da{" "}
            <span className="text-indigo-400 font-semibold">Ética (Princípios de Respeito)</span> para delimitar déficits reais de ruídos destrutivos.
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
            id="btn-mode-editor"
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
            id="btn-mode-facsimile"
          >
            <Printer className="w-3.5 h-3.5" />
            Folha Oficial (PDF)
          </button>
        </div>
      </div>

      {viewMode === "editor" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="editor-layout-grid">
          
          {/* LEFT PANEL: INPUT FORM & METRICS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SCORE/ANALYTICS CARD */}
            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#00A3FF] border-b border-gray-800 pb-2 flex items-center justify-between">
                <span>Rastreamento Psicométrico</span>
                <span className="text-[10px] text-gray-500 font-normal">Instrumento 21</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-800 text-center">
                  <div className="text-3xl font-bold font-mono text-emerald-400">{irfScore}%</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Concordância Global (IRF)</div>
                </div>
                <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-800 text-center">
                  <div className="text-3xl font-bold font-mono text-purple-400">{filtroEficaciaScore}%</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Eficácia do Filtro</div>
                </div>
              </div>

              {totalCount > 0 ? (
                <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>{classificationText}</span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">{classificationDesc}</p>
                </div>
              ) : (
                <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg text-xs text-center text-gray-500">
                  Cadastre feedbacks ou use o botão de demonstração abaixo para visualizar as análises de autoconhecimento.
                </div>
              )}

              {/* STATS PROGRESS BARS */}
              <div className="space-y-3 pt-1 text-xs">
                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Lente de Fatos (Filtro Científico)</span>
                    <span className="font-mono text-emerald-400">{(avgScientific * 20).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, avgScientific * 20)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Lente de Valores (Filtro Ético)</span>
                    <span className="font-mono text-indigo-400">{(avgEthical * 20).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, avgEthical * 20)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* DEMO BTN */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={loadPresetSample}
                  className="w-full py-2 bg-gray-900 border border-gray-850 hover:bg-gray-850 text-gray-300 hover:text-white rounded-lg text-xs transition font-mono uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Carregar Casos Clínicos Exemplo
                </button>
              </div>
            </div>

            {/* FEEDBACK INPUT FORM */}
            <form onSubmit={handleSaveFeedback} className="bg-gray-950 border border-gray-800 rounded-xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-mono uppercase tracking-widest text-indigo-400 border-b border-gray-900 pb-2 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>{editingItemId ? "Editar Feedback" : "Novo Registro de Feedback"}</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold mb-1">
                    Entrevistado / Vínculo:
                  </label>
                  <input
                    type="text"
                    required
                    value={newEntrevistado}
                    onChange={(e) => setNewEntrevistado(e.target.value)}
                    placeholder="Ex: Cônjuge, Filho, Amigo de trabalho, Irmão..."
                    className="w-full px-3 py-2 bg-gray-900/90 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold mb-1">
                    Relato Recebido (Feedback Literal):
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    placeholder="Descreva textualmente o que a pessoa alegou no feedback..."
                    className="w-full px-3 py-2 bg-gray-900/90 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition resize-none text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold mb-1">
                    Análise Conjunta do Feedback (Paciente e Terapeuta):
                  </label>
                  <textarea
                    rows={3}
                    value={newAnalise}
                    onChange={(e) => setNewAnalise(e.target.value)}
                    placeholder="Debata se condiz, as emoções disparadas, e a relevância terapêutica..."
                    className="w-full px-3 py-2 bg-gray-900/90 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition resize-none text-xs leading-relaxed"
                  />
                </div>

                <div className="border-t border-gray-900 pt-3 space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1 mb-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Filtros Cognitivos (Métricas Fáticas)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-mono mb-1">Correspondência</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={newRealidade}
                          onChange={(e) => setNewRealidade(parseInt(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                        <span className="font-mono text-emerald-400 font-bold w-4 text-center">{newRealidade}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] text-gray-400 font-mono mb-1">Verificável?</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={newVerificavel}
                          onChange={(e) => setNewVerificavel(parseInt(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                        <span className="font-mono text-emerald-400 font-bold w-4 text-center">{newVerificavel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-mono mb-1">Justiça de Conceito</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={newJusto}
                          onChange={(e) => setNewJusto(parseInt(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                        <span className="font-mono text-emerald-400 font-bold w-4 text-center">{newJusto}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] text-gray-400 font-mono mb-1">Integridade Ética</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={newEtico}
                          onChange={(e) => setNewEtico(parseInt(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                        <span className="font-mono text-indigo-400 font-bold w-4 text-center">{newEtico}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CLASSIFICATION TYPE */}
                <div className="border-t border-gray-900 pt-3">
                  <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold mb-1.5">
                    Classificação Diagnóstica:
                  </label>
                  <select
                    value={newClassificacao}
                    onChange={(e) => setNewClassificacao(e.target.value as FeedbackInterviewItem["classificacao"])}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="defice_real">Déficit Real (Feedback Legítimo focado em melhoria)</option>
                    <option value="reforco_potencial">Reforço Potencial (Forte recurso para consolidar)</option>
                    <option value="ruido_injusto">Ruído Injusto (Crítica irracional / Sem suporte factual)</option>
                    <option value="incoerente">Projeção Incoerente (Utopia / Idealização alheia)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {editingItemId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-white border border-gray-850 rounded-lg text-xs font-mono uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono uppercase tracking-wider transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1"
                >
                  {editingItemId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingItemId ? "Salvar Alterações" : "Adicionar Feedback"}</span>
                </button>
              </div>
            </form>

          </div>

          {/* RIGHT PANEL: REGISTERED FEEDBACK CARDS */}
          <div className="lg:col-span-7 space-y-4" id="feedback-items-container">
            
            {/* TABS FOR CARDS */}
            <div className="flex items-center gap-2 border-b border-gray-900 pb-2">
              <button
                onClick={() => setActiveTab("todos")}
                className={`py-1.5 px-3 text-[10px] font-mono uppercase tracking-wider rounded-md border transition ${
                  activeTab === "todos"
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                Todos ({state.items.length})
              </button>
              
              <button
                onClick={() => setActiveTab("cientifico")}
                className={`py-1.5 px-3 text-[10px] font-mono uppercase tracking-wider rounded-md border transition ${
                  activeTab === "cientifico"
                    ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                Legítimos / Fiáveis
              </button>

              <button
                onClick={() => setActiveTab("etico")}
                className={`py-1.5 px-3 text-[10px] font-mono uppercase tracking-wider rounded-md border transition ${
                  activeTab === "etico"
                    ? "bg-rose-950/40 border-rose-900/60 text-rose-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                Ruídos / Projeções
              </button>
            </div>

            {/* FILTERED LISTING */}
            {(() => {
              const itemsToShow = state.items.filter(item => {
                const scientificAvg = (item.correspondenciaRealidade + item.verificabilidade + item.justicaConceitual) / 3;
                if (activeTab === "cientifico") return scientificAvg >= 3.0;
                if (activeTab === "etico") return scientificAvg < 3.0;
                return true;
              });

              if (itemsToShow.length === 0) {
                return (
                  <div className="border border-dashed border-gray-800 rounded-xl p-10 text-center text-gray-500 text-xs">
                    <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    Nenhum feedback registrado correspondente a este filtro.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {itemsToShow.map((item) => {
                    const scientificAvg = (item.correspondenciaRealidade + item.verificabilidade + item.justicaConceitual) / 3;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-gray-950 border rounded-xl overflow-hidden shadow-lg transition duration-200 border-gray-800 hover:border-gray-700`}
                        id={`card-${item.id}`}
                      >
                        {/* CARD TOP METRIC BLOCK */}
                        <div className="px-4 py-2 bg-gray-900 flex flex-wrap items-center justify-between gap-2 border-b border-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{item.entrevistado}</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                              item.classificacao === "defice_real" 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-900/30"
                                : item.classificacao === "reforco_potencial"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-900/30"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-900/30"
                            }`}>
                              {item.classificacao === "defice_real" && "Déficit Real"}
                              {item.classificacao === "reforco_potencial" && "Reforço Potencial"}
                              {item.classificacao === "ruido_injusto" && "Ruído Injusto"}
                              {item.classificacao === "incoerente" && "Projeção Incoerente"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="text-gray-500 font-mono">Fatos:</span>
                              <span className="font-bold text-emerald-400 font-mono">{scientificAvg.toFixed(1)}/5</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="text-gray-500 font-mono">Ética:</span>
                              <span className="font-bold text-indigo-400 font-mono">{item.integridadeEtica}/5</span>
                            </div>
                            
                            <div className="flex gap-1 pl-2">
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition"
                                title="Editar item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 hover:bg-rose-950 text-gray-400 hover:text-rose-400 rounded transition"
                                title="Excluir item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* CONTENT WRAPPER */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* FEEDBACK COLUMN */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Feedback Recebido</span>
                            <div className="bg-gray-900/40 border border-gray-900 p-3 rounded-lg text-gray-300 italic leading-relaxed">
                              &ldquo;{item.feedbackRecebido}&rdquo;
                            </div>
                          </div>

                          {/* THERAPIST JOINT ANALYSIS COLUMN */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Análise do Feedback</span>
                            <div className="bg-indigo-950/5 border border-indigo-900/10 p-3 rounded-lg text-indigo-200 leading-relaxed font-sans">
                              {item.analiseFeedback || <em className="text-gray-600 block">Nenhuma análise formulada. Preencha ao lado para integrar reflexão profissional.</em>}
                            </div>
                          </div>
                        </div>

                        {/* MINI-HP EVALUTION BANNER */}
                        <div className="px-4 py-2 border-t border-gray-900 bg-gray-950/80 flex items-center gap-2 text-[10px] text-gray-400">
                          {scientificAvg >= 3.5 ? (
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <ShieldCheck className="w-4 h-4" />
                              <span><b>Assertividade Fática Elevada</b>: Crítica realista integrada ao programa de desenvolvimento.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-rose-400">
                              <AlertTriangle className="w-4 h-4" />
                              <span><b>Ruído Identificado</b>: Bloqueio ativo exercitado com clareza (Imunidade Social ativa).</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* CLINICAL SUMMARY NOTES FOR INTEGRATIVE PLAN */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-2">
              <label className="block text-xs text-[#00A3FF] font-mono uppercase tracking-widest font-bold">
                Anotações Clínicas & Próximas Atividades Interpessoais (Terapêutico):
              </label>
              <textarea
                rows={3}
                value={state.clinicalNotes}
                onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                placeholder="Insira as observações que orientarão as próximas sessões. Planeje exercícios de imersão de auto-revelação baseados nos déficits ou de imunidade social contra os ruídos identificados."
                className="w-full px-3 py-2 bg-gray-900/70 border border-gray-850 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-indigo-500 resize-none text-xs leading-relaxed"
              />
            </div>

          </div>

        </div>
      ) : (
        /* 2. DIGITAL FACSIMILE VIEW (TRADITIONAL TWO-COLUMN PDF PREVIEW) */
        <div id="facsimile-pdf-view" className="bg-slate-900 p-6 rounded-xl flex justify-center">
          
          <div className="bg-white text-black p-8 shadow-2xl rounded-sm w-full max-w-[800px] border border-gray-300 relative min-h-[1050px] font-sans flex flex-col justify-between">
            <div>
              {/* DOUBLE REINFORCED BORDER */}
              <div className="absolute inset-2 border-2 border-double border-black pointer-events-none" />

              {/* SHEET TITLE HEADER */}
              <div className="text-center py-6 border-b border-black mb-6">
                <h2 className="text-2xl font-black tracking-widest uppercase tracking-widest leading-none font-sans" style={{ letterSpacing: "0.15em" }}>
                  Exame de Feedbacks
                </h2>
              </div>

              {/* CLINICIAN / PATIENT LABELS BLOCK */}
              <div className="grid grid-cols-2 gap-y-2 text-xs border border-black p-4 mb-4">
                <div>
                  <span className="font-bold uppercase tracking-wider block">Profissional:</span>
                  <div className="border-b border-black w-[90%] font-mono py-0.5">Dr(a). Lincoln Poubel</div>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider block">CRP:</span>
                  <div className="border-b border-black w-[90%] font-mono py-0.5">05 / 48392-RJ</div>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="font-bold uppercase tracking-wider block">Paciente:</span>
                  <div className="border-b border-black w-[95%] font-mono py-0.5 uppercase tracking-wide">
                    {patient.name || "NÃO CONFIGURADO"}
                  </div>
                </div>
              </div>

              {/* METABLOCKS LIST */}
              {state.items.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 p-12 text-center text-gray-400 text-sm my-12 italic">
                  Nenhum feedback colhido ou cadastrado até o momento. Volte para o painel de edição e insira os depoimentos e suas respectivas análises científicas e éticas.
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item, index) => (
                    <div key={item.id} className="border border-black font-sans overflow-hidden">
                      {/* Subtitle */}
                      <div className="bg-black/5 border-b border-black px-4 py-1.5 flex justify-between items-center text-xs">
                        <span className="font-bold uppercase"><b>Entrevistado(a):</b> {item.entrevistado}</span>
                        <span className="font-mono text-[10px]/none tracking-wider">#0{index + 1}</span>
                      </div>

                      {/* Split Grid */}
                      <div className="grid grid-cols-2 divide-x divide-black text-xs min-h-[120px]">
                        <div className="p-3 bg-white space-y-1">
                          <span className="font-bold block tracking-wider uppercase text-[10px] text-gray-700">Feedback Recebido</span>
                          <p className="text-gray-800 italic leading-relaxed font-serif text-[11px]">
                            &ldquo;{item.feedbackRecebido}&rdquo;
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50/50 space-y-1">
                          <span className="font-bold block tracking-wider uppercase text-[10px] text-gray-750">Análise do Feedback</span>
                          <p className="text-gray-900 leading-relaxed font-sans text-[11px] whitespace-pre-wrap">
                            {item.analiseFeedback || "— Pendente de debate analítico na sessão de terapia —"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* GENERAL CLINICAL CONCLUSION */}
              {state.clinicalNotes && (
                <div className="mt-6 border border-black p-4 bg-gray-50/20 text-xs">
                  <span className="font-bold uppercase block tracking-wider mb-1 text-[10px]">Anotações de Evolução Clínica:</span>
                  <p className="text-gray-900 whitespace-pre-wrap font-sans leading-relaxed text-[11px]">
                    {state.clinicalNotes}
                  </p>
                </div>
              )}
            </div>

            {/* LOWER COGNITIVE LOGO */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <span>Protocolo de Habilidades Psicológicas (THP)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="uppercase font-bold text-gray-700 text-[10px]">Inteligência Psicólogica</span>
                <span>•</span>
                <span>CRM-CBT v4</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
