import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Users, UserCheck, Sparkles, Trash2, Plus, Info, Check, 
  HelpCircle, MessageCircle, AlertCircle, Copy, CheckCircle2,
  ListPlus, ChevronRight, UserMinus, ShieldAlert, Award, FileText
} from "lucide-react";

export interface ModelEntry {
  id: string;
  name: string;
  forces: string;
  weaknesses: string;
  impact: string;
}

export interface ExameModelosPessoaisState {
  currentModels: ModelEntry[];
  idealModels: ModelEntry[];
  clinicalNotes: string;
}

interface ExameModelosPessoaisViewProps {
  patient: PatientInfo;
  state: ExameModelosPessoaisState;
  setState: React.Dispatch<React.SetStateAction<ExameModelosPessoaisState>>;
}

const DEFAULT_CURRENT_MODELS: ModelEntry[] = [
  {
    id: "cur-1",
    name: "Pai",
    forces: "Foco no trabalho, integridade, senso de responsabilidade e disciplina diária.",
    weaknesses: "Dificuldade de expressar afeto verbalmente, pavio curto sob estresse e ansiedade velada.",
    impact: "Adotei o forte senso de dever e ética profissional, mas herdei a tendência a me cobrar excessivamente e silenciar sentimentos."
  },
  {
    id: "cur-2",
    name: "Mãe",
    forces: "Empatia profunda, sensibilidade interpessoal marcante e resiliência diante de perdas.",
    weaknesses: "Superproteção crônica, tendência a assumir a dor dos outros e esquecer das próprias necessidades.",
    impact: "Desenvolvi facilidade de acolhimento e sintonia com o sofrimento alheio, mas costumo esgotar minhas forças cuidando dos outros."
  }
];

const DEFAULT_IDEAL_MODELS: ModelEntry[] = [
  {
    id: "idl-1",
    name: "Mentor Profissional / Líder da Equipe de Projetos",
    forces: "Comunicação assertiva sob pressão, escuta inteligente e facilidade de calibrar limites saudáveis com clientes.",
    weaknesses: "Às vezes centraliza decisões por perfeccionismo técnico.",
    impact: "Me inspira a defender minhas ideias sem agressividade e a dizer 'não' de maneira diplomática na rotina de trabalho."
  },
  {
    id: "idl-2",
    name: "Amigo de Faculdade (Referência de Autorregulação)",
    forces: "Postura imperturbável diante de imprevistos, humor refinado para desarmar conflitos e rotina estável de exercícios físicos.",
    weaknesses: "Evita diálogos de teor muito profundo ou emocional complexo.",
    impact: "Gostaria de emular sua capacidade de desacelerar as preocupações e reagir de forma descontraída e madura a crises menores."
  }
];

export default function ExameModelosPessoaisView({
  patient,
  state,
  setState
}: ExameModelosPessoaisViewProps) {
  const [viewMode, setViewMode] = useState<"editor" | "interview" | "facsimile">("editor");
  const [activeTab, setActiveTab] = useState<"current" | "ideal">("current");
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // Initialize with values if completely empty
  const ensureRowsAndGet = (): ExameModelosPessoaisState => {
    let updated = false;
    const nextState = { ...state };
    if (!nextState.currentModels) {
      nextState.currentModels = [];
      updated = true;
    }
    if (!nextState.idealModels) {
      nextState.idealModels = [];
      updated = true;
    }
    if (updated) {
      // Don't trigger rerender loop in render, return local
    }
    return nextState;
  };

  const currentState = ensureRowsAndGet();
  const currentModels = currentState.currentModels || [];
  const idealModels = currentState.idealModels || [];

  const handleAddModel = (type: "current" | "ideal") => {
    const newModel: ModelEntry = {
      id: `${type}-${Date.now()}`,
      name: "",
      forces: "",
      weaknesses: "",
      impact: ""
    };

    setState(prev => ({
      ...prev,
      [type === "current" ? "currentModels" : "idealModels"]: [
        ...(prev[type === "current" ? "currentModels" : "idealModels"] || []),
        newModel
      ]
    }));
  };

  const handleUpdateModel = (type: "current" | "ideal", id: string, field: keyof ModelEntry, value: string) => {
    setState(prev => {
      const listKey = type === "current" ? "currentModels" : "idealModels";
      const list = prev[listKey] || [];
      return {
        ...prev,
        [listKey]: list.map(item => item.id === id ? { ...item, [field]: value } : item)
      };
    });
  };

  const handleRemoveModel = (type: "current" | "ideal", id: string) => {
    setState(prev => {
      const listKey = type === "current" ? "currentModels" : "idealModels";
      const list = prev[listKey] || [];
      return {
        ...prev,
        [listKey]: list.filter(item => item.id !== id)
      };
    });
  };

  const loadDemoData = () => {
    setState({
      currentModels: [...DEFAULT_CURRENT_MODELS],
      idealModels: [...DEFAULT_IDEAL_MODELS],
      clinicalNotes: "O paciente demonstra alto nível de autodisciplina que herda do seu pai, mas há um esgotamento recorrente herdado da postura hiper-protetora da mãe. Sob o ponto de vista prospectivo, delineamos a imersão em dois modelos ideais focados em limites saudáveis e autorregulação pacífica."
    });
  };

  const clearAllData = () => {
    if (window.confirm("Deseja realmente limpar todos os modelos pessoais desta ferramenta?")) {
      setState({
        currentModels: [],
        idealModels: [],
        clinicalNotes: ""
      });
    }
  };

  // Helper calculation for completion indicators
  const currentFilledCount = currentModels.filter(m => m.name.trim() && m.forces.trim() && m.impact.trim()).length;
  const idealFilledCount = idealModels.filter(m => m.name.trim() && m.forces.trim() && m.impact.trim()).length;
  const totalModelsCount = currentModels.length + idealModels.length;
  const filledModelsCount = currentFilledCount + idealFilledCount;
  
  const completionPercent = totalModelsCount > 0 
    ? Math.round((filledModelsCount / totalModelsCount) * 100) 
    : 0;

  // Render direct copying of auto-generated interview guidelines (Action learning)
  const copyScriptToClipboard = (modelName: string, forces: string, id: string) => {
    const formattedModel = modelName || "Modelo Ideal";
    const formattedForces = forces ? `a virtude de "${forces}"` : "sua competência e postura de excelência";
    const script = `--- GUIÃO DE ENTREVISTA CLÍNICA / PSICOEDUCATIVA ---
Olá, ${formattedModel}!
Gosto muito de conversar com você e admiro imensamente a maneira como você lida com as coisas. Tenho estudado as minhas próprias habilidades de desenvolvimento emocional e percebo em você ${formattedForces} muito desenvolvida.

Gostaria de saber um pouco mais sobre como você conquistou isso:
1. Essa habilidade sempre fez parte do seu jeito ou foi algo que você precisou aprender por conta de algum desafio ou necessidade?
2. Quais foram os maiores erros ou dificuldades pelas quais você passou antes de consolidar essa virtude?
3. Se você pudesse indicar práticas diárias comuns ou mentalidades-chave para alguém que quer desenvolver essa mesma atitude de liderança e controle emocional, quais seriam?
4. Que livro, conselho ou hábito foi um agente definitivo nessa sua transformação?

Muito obrigado por compartilhar sua vivência!`;

    navigator.clipboard.writeText(script).then(() => {
      setCopiedScriptId(id);
      setTimeout(() => setCopiedScriptId(null), 3000);
    });
  };

  return (
    <div id="exame_modelos_pessoais_root" className="space-y-6">
      {/* HEADER DETALHADO */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-900/40 rounded-full">
                Ferramenta nº 28
              </span>
              <span className="text-slate-500 text-xs">• Habilidade de Modelagem</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-400" />
              Análise dos Modelos Pessoais
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Identifique as influências inconscientes recebidas de pessoas da sua história (Modelos Atuais) e elabore um mapeamento prospectivo de referências inspiradoras (Modelos Ideais) para modelagem ativa de novas condutas e virtudes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadDemoData}
              className="px-3.5 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-900/60 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Preenche o teste com exemplo clínico adaptado"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Preencher Demo
            </button>
            <button
              onClick={clearAllData}
              className="px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-950/20 hover:bg-rose-950/50 border border-rose-900/30 rounded-lg transition-colors flex items-center gap-1"
              title="Limpar todos os campos"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar
            </button>
          </div>
        </div>

        {/* BARRA DE PROGRESSO & INDICADORES */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
              <span className="text-sm font-mono font-bold text-emerald-400">{completionPercent}%</span>
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-400 font-medium">Consolidação do Formulário</div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(3, completionPercent)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 md:justify-center">
            <span className="px-2 py-1 bg-slate-800 border border-slate-750 rounded text-slate-300 font-mono">
              {currentModels.length} Atuais
            </span>
            <span className="text-slate-600">|</span>
            <span className="px-2 py-1 bg-slate-800 border border-slate-750 rounded text-slate-300 font-mono">
              {idealModels.length} Ideais
            </span>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 md:justify-end">
            <span className="text-slate-500">Paciente:</span>
            <span className="text-emerald-300 font-medium max-w-[150px] truncate" title={patient.name}>
              {patient.name || "Não informado"}
            </span>
            <span className="text-slate-600">•</span>
            <span>{patient.age ? `${patient.age} anos` : ""}</span>
          </div>
        </div>
      </div>

      {/* SELETOR DE MODO DE VISUALIZAÇÃO */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setViewMode("editor")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            viewMode === "editor"
              ? "border-emerald-500 text-emerald-400 bg-slate-900/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          Painel de Análise (Editor)
        </button>

        <button
          onClick={() => setViewMode("interview")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 -mb-px relative ${
            viewMode === "interview"
              ? "border-emerald-500 text-emerald-400 bg-slate-900/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Plano de Imersão e Entrevistas
          {idealModels.length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setViewMode("facsimile")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            viewMode === "facsimile"
              ? "border-emerald-500 text-emerald-400 bg-slate-900/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          Visualização Impressa (PDF)
        </button>
      </div>

      {/* MODO EDITOR */}
      {viewMode === "editor" && (
        <div className="space-y-6">
          {/* DICA PSICOEDUCATIVA */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex gap-3 text-sm text-slate-300">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-slate-200">Por que analisar modelos pessoais?</strong>
              <p className="text-slate-400 leading-relaxed">
                Grande parte de nossa conduta diária é moldada por imitação de referências precoces da infância (Modelos Atuais), muitas vezes internalizando fraquezas ou cobranças nocivas. A reestruturação de repertório ocorre quando selecionamos meticulosamente <span className="text-emerald-400 font-medium">Modelos Ideais</span> e aprendemos ativamente suas virtudes reais e estratégias de conduta.
              </p>
            </div>
          </div>

          {/* ABAS DO EDITOR DE MODELOS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6">
            <div className="flex gap-2 p-1 bg-slate-950 rounded-lg w-full max-w-md mb-6 border border-slate-800">
              <button
                onClick={() => setActiveTab("current")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                  activeTab === "current"
                    ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Modelos Atuais ({currentModels.length})
              </button>
              <button
                onClick={() => setActiveTab("ideal")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                  activeTab === "ideal"
                    ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Modelos Ideais ({idealModels.length})
              </button>
            </div>

            {/* TAB CORRENTE (ATUAIS) */}
            {activeTab === "current" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                       <ShieldAlert className="w-4 h-4 text-rose-400" />
                       Modelos Atuais (Históricos / De Convivência)
                    </h3>
                    <p className="text-xs text-slate-400">Pessoas que estiveram ou estão muito próximas na sua história e influenciaram seus hábitos.</p>
                  </div>
                  <button
                    onClick={() => handleAddModel("current")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Modelo
                  </button>
                </div>

                {currentModels.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500">
                    <Users className="w-12 h-12 text-slate-650 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Nenhum modelo atual mapeado.</p>
                    <p className="text-xs text-slate-600 mt-1">Insira os seus principais espelhos afetivos (pãis, responsáveis, familiares ou cônjuges) para compreender que hábitos herdou deles.</p>
                    <button
                      onClick={() => handleAddModel("current")}
                      className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Começar Agora
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {currentModels.map((model, idx) => (
                      <div 
                        key={model.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 relative space-y-4 hover:border-slate-700 transition-all shadow-sm group"
                      >
                        <div className="absolute top-4 right-4 opacity-30 hover:opacity-100 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleRemoveModel("current", model.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                            title="Remover este modelo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Identificação do Modelo atual */}
                        <div className="space-y-1 pr-6">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Nome / Dependência do Modelo (Quem é?)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Pai, Mãe, Irmão mais velho, Ex-professor..."
                            value={model.name}
                            onChange={(e) => handleUpdateModel("current", model.id, "name", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* Forças */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-emerald-400/90 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Quais são suas Forças / Virtudes?
                            </label>
                            <textarea
                              rows={3}
                              placeholder="O que essa pessoa tinha de melhor? Qual era o ponto forte de temperamento ou competência?"
                              value={model.forces}
                              onChange={(e) => handleUpdateModel("current", model.id, "forces", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all resize-none placeholder:text-slate-650"
                            />
                          </div>

                          {/* Fraquezas */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-rose-400/90 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              Quais são suas Fraquezas / Limitações?
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Quais eram as fraquezas, inconsistências, desorganização emocional ou padrões nocivos nela?"
                              value={model.weaknesses}
                              onChange={(e) => handleUpdateModel("current", model.id, "weaknesses", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all resize-none placeholder:text-slate-650"
                            />
                          </div>
                        </div>

                        {/* Como te afetam */}
                        <div className="space-y-1 border-t border-slate-900 pt-3">
                          <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                            Como te afeta ou afetou? (Qual o impacto no seu comportamento?)
                          </label>
                          <textarea
                            rows={2.5}
                            placeholder="Que hábitos ou reatividades você imitou por simular essa pessoa? Como o jeito dela se reflete nas suas atuações de hoje?"
                            value={model.impact}
                            onChange={(e) => handleUpdateModel("current", model.id, "impact", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-250 outline-none transition-all resize-none placeholder:text-slate-655"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB IDEAL */}
            {activeTab === "ideal" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                       <Award className="w-4 h-4 text-amber-400" />
                       Modelos Ideais (Modelagem Planejada / Acessos de Virtudes)
                    </h3>
                    <p className="text-xs text-slate-400">Personalidades reais ou virtuais que possuem virtudes específicas que o paciente deseja ativamente internalizar.</p>
                  </div>
                  <button
                    onClick={() => handleAddModel("ideal")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Modelo
                  </button>
                </div>

                {idealModels.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500">
                    <Award className="w-12 h-12 text-slate-650 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Nenhum modelo ideal mapeado.</p>
                    <p className="text-xs text-slate-600 mt-1">Mapeie figuras que inspirem competências de resolutividade, de autogestão ou limites saudáveis para orientar seu crescimento.</p>
                    <button
                      onClick={() => handleAddModel("ideal")}
                      className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Começar Agora
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {idealModels.map((model, idx) => (
                      <div 
                        key={model.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 relative space-y-4 hover:border-slate-700 transition-all shadow-sm group"
                      >
                        <div className="absolute top-4 right-4 opacity-30 hover:opacity-100 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleRemoveModel("ideal", model.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                            title="Remover este modelo ideal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Identificação do Modelo Ideal */}
                        <div className="space-y-1 pr-6">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Quem é esta Referência? (Nome / Ligação, e.g. Mentor Y, Personalidade Z)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Terapeuta X, Monge Y, Figura histórica, Amigo de alto controle..."
                            value={model.name}
                            onChange={(e) => handleUpdateModel("ideal", model.id, "name", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* Forças do Modelo Ideal */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-amber-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Virtudes e Diferenciais (As Forças dele)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="O que exatamente nessa pessoa é brilhante? Que virtudes práticas ou comportamentais ela domina e exibe com facilidade?"
                              value={model.forces}
                              onChange={(e) => handleUpdateModel("ideal", model.id, "forces", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all resize-none placeholder:text-slate-650"
                            />
                          </div>

                          {/* Como me afeta ou afetaria se adotassem */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Como te afeta ou afetaria? (Impacto Prospectivo)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Que reações suas mudariam se você estivesse sob a ótica dessa virtude? Como impactaria seus objetivos?"
                              value={model.impact}
                              onChange={(e) => handleUpdateModel("ideal", model.id, "impact", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all resize-none placeholder:text-slate-650"
                            />
                          </div>
                        </div>

                        {/* Como emular ou entrevistar */}
                        <div className="space-y-1 border-t border-slate-900 pt-3">
                          <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                            Como pretendo emular ou me aproximar se possível?
                          </label>
                          <textarea
                            rows={2.5}
                            placeholder="Como posso interagir com este modelo ou consumir seus conteúdos de forma atenta? (Ex: Ler suas obras, observar conduta diária no trabalho, entrevistá-lo informalmente sobre seus desafios...)"
                            value={model.weaknesses}
                            onChange={(e) => handleUpdateModel("ideal", model.id, "weaknesses", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-slate-250 outline-none transition-all resize-none placeholder:text-slate-655"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OBSERVATIVAS OBSERVADAS CLÍNICAS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
                Parcerias e Apontamentos Clínicos (Terapeuta)
              </h3>
            </div>
            <textarea
              rows={4}
              placeholder="Digite insights clínicos sobre o cruzamento de herança (Modelos Atuais) e novas condutas (Modelos Ideais) delineados na sessão..."
              value={state.clinicalNotes || ""}
              onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg p-3 text-xs text-slate-200 outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* MODO PLANO DE INTERAÇÃO / ENTREVISTAS */}
      {viewMode === "interview" && (
        <div className="space-y-6 animate-fade-in">
          {/* INTRODUÇÃO INTERVIEW METODOLOGY */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                Doutrina de Aprendizagem Ativa por Modelagem
              </div>
              <h3 className="text-lg font-bold text-slate-100">Como absorver as forças dos Modelos Ideais?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Admirar passivamente não altera o nosso comportamento. O psicólogo Albert Bandura comprovou que a aprendizagem social é consolidada quando o indivíduo analisa ativamente <span className="text-amber-400">COMO</span> tais virtudes foram sedimentadas. A melhor maneira é converter as virtudes em um plano de imersão de conduta ou realizar uma minientrevista informal com esses modelos.
              </p>
            </div>
            <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-lg text-xs text-amber-300 max-w-xs flex gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Gere guiões de conversa automáticos para entrevistar mentores reais ou fictícios com base nos dados preenchidos no formulário das abas!</span>
            </div>
          </div>

          {/* RENDERIZADOR DE ROTEIROS DE CADA MODELO IDEAL */}
          {idealModels.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-sm font-semibold">Nenhum modelo ideal cadastrado ainda.</p>
              <p className="text-xs text-slate-600 mt-1">Primeiro acrescente modelos e virtudes na aba de <span className="text-emerald-400 hover:underline cursor-pointer font-medium" onClick={() => { setViewMode("editor"); setActiveTab("ideal"); }}>Modelos Ideais</span> para poder ver as perguntas guiadas criadas sob medida.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-950 rounded">Mecanismo Integrador</span>
                <span className="text-xs text-slate-400">Roteiro Personalizado de Consolidação de Virtude</span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {idealModels.map((item, idx) => {
                  const hasForcesFilled = item.forces && item.forces.trim().length > 0;
                  const candidateForces = hasForcesFilled ? item.forces.split(",")[0].trim() : "competência singular";

                  return (
                    <div 
                      key={item.id} 
                      className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700/80 transition-all shadow-md flex flex-col md:flex-row"
                    >
                      {/* Lado Esquerdo - O perfil do Modelo */}
                      <div className="md:w-1/3 bg-slate-950 p-5 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                              0{idx + 1}
                            </div>
                            <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">Perfil Ideal</span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-base font-bold text-slate-100">{item.name || "Referência Sem Nome"}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {item.forces ? `Foco em: ${item.forces}` : "Nenhuma força cadastrada no cadastro desta pessoa para gerar roteiro específico."}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-900/80 space-y-2">
                          <div className="text-xs text-slate-500 italic">
                            {item.weaknesses ? `Sugestão de Aproximação: ${item.weaknesses}` : "Proporcione perguntas de emulação na sessão."}
                          </div>

                          <button
                            onClick={() => copyScriptToClipboard(item.name, candidateForces, item.id)}
                            className="w-full mt-2 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-650 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {copiedScriptId === item.id ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                Roteiro Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                Copiar Guia Completo
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Lado Direito - O roteiro gerado */}
                      <div className="md:w-2/3 p-5 md:p-6 space-y-4">
                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                          Sugestão de Roteiro de Conversa / Entrevista de Conduta:
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-sans text-xs text-slate-300 leading-relaxed space-y-3 max-h-72 overflow-y-auto">
                          <p className="text-slate-400 font-medium"><em>Roteiro Proposto de Abordagem Amigável:</em></p>
                          <p className="border-l-2 border-emerald-500 pl-3 italic text-slate-200">
                            "Olá, {item.name || "[Nome]"}! Gosto muito de conversar com você e admiro imensamente a maneira como você lida com as coisas. Tenho estudado as minhas próprias habilidades de desenvolvimento e percebo em você a virtude de <strong className="text-emerald-400 font-semibold">"{candidateForces}"</strong> muito madura e consolidada..."
                          </p>
                          <div className="space-y-2 pl-3 pt-1">
                            <div className="flex gap-2">
                              <span className="text-amber-400 font-mono">1.</span>
                              <span>Poderia me contar se essa habilidade sempre foi natural em seu comportamento ou se foi desenvolvida diante de alguma necessidade ou desafio prático?</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-amber-400 font-mono">2.</span>
                              <span>Quais foram os maiores erros ou retrocessos pelos quais você passou antes de estabilizar essa excelência?</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-amber-400 font-mono">3.</span>
                              <span>Quais micro-hábitos ou posturas diárias cruciais você recomendaria para mim se eu quiser me desenvolver na mesma direção?</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 text-[11px] text-slate-400 bg-slate-950/20 border border-slate-800/40 px-3 py-2 rounded-md">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>Se o modelo ideal for uma liderança distante ou figura histórica morta que você não pode entrevistar mentalmente ou presencialmente, use essa lista para guiar um estudo de sua biografia, vídeos ou livros, respondendo as perguntas por observação externa!</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODO FACSIMILE / PDF PREVIEW */}
      {viewMode === "facsimile" && (
        <div id="exame_modelos_facsimile_preview" className="bg-white border-2 border-slate-300 rounded-xl p-8 max-w-4xl mx-auto shadow-2xl text-slate-900 font-sans leading-relaxed">
          {/* Folha de Orçamento / Linhas decorativas do cabeçalho físico */}
          <div className="border border-slate-900 p-6 space-y-6">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
              <div>
                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-slate-900 font-mono">
                  Análise dos Modelos Pessoais
                </h1>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Intervenção de Modelagem Psicológica e Autoterapia Assistida</p>
              </div>
              <div className="text-right font-mono text-[9px] text-slate-500">
                <div>F28 - HP</div>
                <div>Intel. Psicológica</div>
              </div>
            </div>

            {/* Cabeçalho de Dados preenchidos à mão no modelo real */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-slate-400 pb-4">
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold">PACIENTE:</span>
                  <span className="border-b border-dotted border-slate-900 flex-1 px-1">
                    {patient.name || "____________________________________________"}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold">IDADE / GÊNERO:</span>
                  <span className="border-b border-dotted border-slate-900 flex-1 px-1">
                    {patient.age ? `${patient.age} / ${patient.gender || "Não informado"}` : "_________________"}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 1: MODELOS ATUAIS */}
            <div className="space-y-2">
              <div className="bg-slate-100 border border-slate-900 p-2 grid grid-cols-12 gap-2">
                <div className="col-span-3 text-xs font-bold font-mono tracking-wider uppercase flex items-center">
                  Modelos Atuais
                </div>
                <div className="col-span-9 text-xs font-bold font-mono text-slate-800 italic uppercase">
                  Quais são suas forças e fraquezas? Como te afetam?
                </div>
              </div>

              {/* Rows para Modelos Atuais */}
              <div className="border border-slate-900 divide-y divide-slate-800">
                {currentModels.length > 0 ? (
                  currentModels.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 divide-x divide-slate-800 p-2.5 text-xs">
                      <div className="col-span-3 font-bold text-slate-900 pr-2 flex items-center min-h-[50px]">
                        {item.name || `Modelo Atual ${idx + 1}`}
                      </div>
                      <div className="col-span-9 pl-3 space-y-1.5 leading-relaxed">
                        <div>
                          <strong className="text-[10px] text-slate-500 uppercase font-mono tracking-tight block">Forças e Virtudes:</strong>
                          <p className="text-slate-800">{item.forces || "Não preenchido"}</p>
                        </div>
                        <div>
                          <strong className="text-[10px] text-slate-500 uppercase font-mono tracking-tight block">Fraquezas e Limitações:</strong>
                          <p className="text-rose-850 font-medium">{item.weaknesses || "Não preenchido"}</p>
                        </div>
                        <div>
                          <strong className="text-[10px] text-slate-500 uppercase font-mono tracking-tight block">Impacto Prático no Paciente:</strong>
                          <p className="text-slate-700 italic">{item.impact || "Não preenchido"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-12 divide-x divide-slate-800 min-h-[70px]">
                      <div className="col-span-3 p-2 text-slate-300 font-mono text-[9px]"></div>
                      <div className="col-span-9 p-2"></div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 2: MODELOS IDEAIS */}
            <div className="space-y-2 pt-4">
              <div className="bg-slate-100 border border-slate-900 p-2 grid grid-cols-12 gap-2">
                <div className="col-span-3 text-xs font-bold font-mono tracking-wider uppercase flex items-center">
                  Modelos Ideais
                </div>
                <div className="col-span-9 text-xs font-bold font-mono text-slate-800 italic uppercase">
                  Quais são suas forças e fraquezas? Como te afetam?
                </div>
              </div>

              {/* Rows para Modelos Ideais */}
              <div className="border border-slate-900 divide-y divide-slate-800">
                {idealModels.length > 0 ? (
                  idealModels.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 divide-x divide-slate-800 p-2.5 text-xs">
                      <div className="col-span-3 font-bold text-slate-900 pr-2 flex items-center min-h-[50px]">
                        {item.name || `Modelo Ideal ${idx + 1}`}
                      </div>
                      <div className="col-span-9 pl-3 space-y-1.5 leading-relaxed">
                        <div>
                          <strong className="text-[10px] text-slate-500 uppercase font-mono tracking-tight block">Virtudes e Forças:</strong>
                          <p className="text-slate-800">{item.forces || "Não preenchido"}</p>
                        </div>
                        <div>
                          <strong className="text-[10px] text-slate-500 uppercase font-mono tracking-tight block">Abordagem para Emular / Ler:</strong>
                          <p className="text-slate-700 italic">{item.weaknesses || "Não preenchido"}</p>
                        </div>
                        <div>
                          <strong className="text-[10px] text-slate-500 uppercase font-mono tracking-tight block">Efeito Transformador se emulado:</strong>
                          <p className="text-emerald-850 font-medium">{item.impact || "Não preenchido"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-12 divide-x divide-slate-800 min-h-[70px]">
                      <div className="col-span-3 p-2 text-slate-300 font-mono text-[9px]"></div>
                      <div className="col-span-9 p-2"></div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ASSINATURA E RODAPÉ DO SINE */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px] font-mono font-bold uppercase mt-6 border-t border-slate-300">
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-2">
                  {state.clinicalNotes ? "Apontado em Sessão" : "_________________________________________________"}
                </div>
                <div>PROFISSIONAL RESPONSÁVEL</div>
              </div>
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-2">
                  {patient.name || "_________________________________________________"}
                </div>
                <div>RUBRICA DO PACIENTE</div>
              </div>
            </div>

            {/* MARCA DE INTELIGÊNCIA PSICOLÓGICA */}
            <div className="flex items-center justify-center pt-4">
              <div className="text-center">
                <div className="text-[11px] font-bold font-mono tracking-widest text-slate-800">
                  INTELIGÊNCIA PSICOLÓGICA
                </div>
                <div className="text-[7px] text-slate-500 font-mono">
                  CONSTRUÇÃO DE HABILIDADES PSICOLÓGICAS DESENVOLVIDAS POR LINCOLN POUBEL E PEDRO RODRIGUES
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
