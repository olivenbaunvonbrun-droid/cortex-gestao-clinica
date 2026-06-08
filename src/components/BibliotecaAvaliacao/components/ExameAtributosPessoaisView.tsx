import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Plus, Trash2, Sparkles, Award, Eye, Scale, HelpCircle, 
  CheckCircle2, AlertTriangle, Lightbulb, Clipboard, ArrowRight,
  BookOpen, Heart, ShieldCheck, Check, Activity, TrendingUp, X, Printer, Edit2, Fingerprint, Info
} from "lucide-react";

export interface PersonalAttribute {
  id: string;
  text: string;
  hpAssociated: string;     // E.g. "Sociabilidade", "Assertividade", "Autocontrole", "Alinhamento de Valores"
  contextOrNotes?: string;   // Contexts of occurrence or Developmental goals/Project steps
}

export interface ExameAtributosPessoaisState {
  souGosto: PersonalAttribute[];
  souNaoGosto: PersonalAttribute[];
  naoSouGostaria: PersonalAttribute[];
  naoSouGostoNao: PersonalAttribute[];
  clinicalNotes: string;
}

interface ExameAtributosPessoaisViewProps {
  patient: PatientInfo;
  state: ExameAtributosPessoaisState;
  setState: React.Dispatch<React.SetStateAction<ExameAtributosPessoaisState>>;
}

export default function ExameAtributosPessoaisView({
  patient,
  state,
  setState
}: ExameAtributosPessoaisViewProps) {
  const [viewMode, setViewMode] = useState<"editor" | "facsimile">("editor");
  const [activeFormQuadrant, setActiveFormQuadrant] = useState<"souGosto" | "souNaoGosto" | "naoSouGostaria" | "naoSouGostoNao" | null>(null);
  
  // Local state for inputs
  const [newText, setNewText] = useState("");
  const [newHp, setNewHp] = useState("Autoestima");
  const [newContext, setNewContext] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setNewText("");
    setNewHp("Autoestima");
    setNewContext("");
    setEditingId(null);
    setActiveFormQuadrant(null);
  };

  const handleOpenAddForm = (quadrant: "souGosto" | "souNaoGosto" | "naoSouGostaria" | "naoSouGostoNao") => {
    resetForm();
    setActiveFormQuadrant(quadrant);
  };

  const handleStartEdit = (quadrant: "souGosto" | "souNaoGosto" | "naoSouGostaria" | "naoSouGostoNao", item: PersonalAttribute) => {
    setActiveFormQuadrant(quadrant);
    setEditingId(item.id);
    setNewText(item.text);
    setNewHp(item.hpAssociated);
    setNewContext(item.contextOrNotes || "");
  };

  const handleSaveAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFormQuadrant || !newText.trim()) return;

    if (editingId) {
      // Edit
      setState((prev) => ({
        ...prev,
        [activeFormQuadrant]: prev[activeFormQuadrant].map((item) =>
          item.id === editingId
            ? { ...item, text: newText, hpAssociated: newHp, contextOrNotes: newContext }
            : item
        ),
      }));
    } else {
      // Add
      const newItem: PersonalAttribute = {
        id: "attr_" + Date.now(),
        text: newText,
        hpAssociated: newHp,
        contextOrNotes: newContext || undefined,
      };
      setState((prev) => ({
        ...prev,
        [activeFormQuadrant]: [...prev[activeFormQuadrant], newItem],
      }));
    }
    resetForm();
  };

  const handleDeleteAttribute = (quadrant: "souGosto" | "souNaoGosto" | "naoSouGostaria" | "naoSouGostoNao", id: string) => {
    setState((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].filter((item) => item.id !== id),
    }));
    if (editingId === id) {
      resetForm();
    }
  };

  const loadPresetSamples = () => {
    const defaultSouGosto: PersonalAttribute[] = [
      {
        id: "sg_1",
        text: "Altamente empático e com boa escuta genuína nas relações íntimas.",
        hpAssociated: "Sociabilidade e Empatia",
        contextOrNotes: "Sempre elogiado por apoiar amigos em momentos críticos sem julgamento imediato."
      },
      {
        id: "sg_2",
        text: "Visão lógica apurada e resolução racional de desafios técnicos complexos.",
        hpAssociated: "Raciocínio Realístico",
        contextOrNotes: "Consigo isolar minhas emoções e focar nas variáveis estruturais do problema."
      }
    ];

    const defaultSouNaoGosto: PersonalAttribute[] = [
      {
        id: "sng_1",
        text: "Procrastinação defensiva antes de entregas cruciais de projetos.",
        hpAssociated: "Autocontrole e Autogestão",
        contextOrNotes: "Ocorre quando sinto receio de que o resultado não saia perfeito, travando na tela em branco."
      },
      {
        id: "sng_2",
        text: "Extrema passividade em conflitos interpessoais, concordando contra a própria vontade.",
        hpAssociated: "Assertividade e Imunidade Social",
        contextOrNotes: "Em discussões familiares ou profissionais rápidas, pelo medo de gerar desconforto ou rejeição."
      }
    ];

    const defaultNaoSouGostaria: PersonalAttribute[] = [
      {
        id: "nsg_1",
        text: "Segurança para defender minhas opiniões estruturadas em reuniões executivas.",
        hpAssociated: "Assertividade",
        contextOrNotes: "Projeto de Desenvolvimento: treinar auto-revelação assertiva inicial em pequenos comitês e feedbacks estruturados."
      },
      {
        id: "nsg_2",
        text: "Habilidade de autorregulação e relaxamento somático nas noites sob alta demanda fiscal.",
        hpAssociated: "Autocontrole Emocional",
        contextOrNotes: "Projeto de Desenvolvimento: adotar rotina de higiene de sono e práticas consistentes de mindfulness de 12 min à noite."
      }
    ];

    const defaultNaoSouGostoNao: PersonalAttribute[] = [
      {
        id: "nsgn_1",
        text: "Manipulador ou egocêntrico nas dinâmicas corporativas para obter vantagens escusas.",
        hpAssociated: "Integridade Ética",
        contextOrNotes: "Valorizo a transparência extrema e sinto apreço pessoal por agir de forma correta e honesta."
      },
      {
        id: "nsgn_2",
        text: "Agressivo e grosseiro com subordinados na empresa ao lidar com erros involuntários.",
        hpAssociated: "Respeito e Coexistência",
        contextOrNotes: "Fico feliz em não usar do poder de forma abusiva, mantendo cooperação humanizada e pedagógica."
      }
    ];

    setState({
      souGosto: defaultSouGosto,
      souNaoGosto: defaultSouNaoGosto,
      naoSouGostaria: defaultNaoSouGostaria,
      naoSouGostoNao: defaultNaoSouGostoNao,
      clinicalNotes: "O mapeamento evidencia que o paciente possui uma excelente base de ética e inteligência analítica ('Sou e Gosto de Ser' / 'Não Sou e Gosto de Não Ser'). Constatamos que suas principais vulnerabilidades comportamentais referem-se à assertividade e autocomplacência, expressas no perfeccionismo procrastinatório. Os planos terapêuticos foram desenhados na terceira coluna para desenvolver HPs de controle."
    });
  };

  // Calculations
  const sgCount = state.souGosto.length;
  const sngCount = state.souNaoGosto.length;
  const nsgCount = state.naoSouGostaria.length;
  const nsgnCount = state.naoSouGostoNao.length;
  const totalCount = sgCount + sngCount + nsgCount + nsgnCount;

  // 1. Índice de Satisfação Consciencial (ISC) - Quantifica o equilíbrio positivo / construtivo do self
  // ISC = (SG + NSGN) / Total * 100
  const iscScore = totalCount > 0
    ? Math.round(((sgCount + nsgnCount) / totalCount) * 100)
    : 0;

  // 2. Potencial de Desenvolvimento de HPs (PDH) - Se os 'Não Sou e Gostaria' têm notas/projetos estruturados
  const structuralProjects = state.naoSouGostaria.filter(item => item.contextOrNotes && item.contextOrNotes.length > 15).length;
  const pdhScore = nsgCount > 0
    ? Math.round((structuralProjects / nsgCount) * 100)
    : 100; // default 100 if none desired to indicate clean slate

  // 3. Índice de Consciência de Vulnerabilidade (ICV) - Se os 'Sou e Não Gosto' possuem o contexto mapeado (importante para comportamentos)
  const mappedVulnerabilities = state.souNaoGosto.filter(item => item.contextOrNotes && item.contextOrNotes.length > 15).length;
  const icvScore = sngCount > 0
    ? Math.round((mappedVulnerabilities / sngCount) * 100)
    : 100;

  // Global aggregate score for the tool indicator
  const aggregateScore = totalCount > 0
    ? Math.round((iscScore * 0.4) + (pdhScore * 0.3) + (icvScore * 0.3))
    : 0;

  let classificationText = "Nenhum Atributo Registrado";
  let classificationDesc = "Preencha os quatro quadrantes do exame clínico para mapear e examinar as dimensões de valor e os projetos de crescimento pessoal.";

  if (totalCount > 0) {
    if (aggregateScore >= 80) {
      classificationText = "Excelente Nível de Autoconsciência Dinâmica e Projetos de HP Alinhados";
      classificationDesc = "O paciente exibe excelente capacidade de autocrítica pragmática e plano claro de transição de novos repertórios, livre de autonegligência.";
    } else if (aggregateScore >= 50) {
      classificationText = "Autoconsciência em Consolidação com Desafios de Enfrentamento";
      classificationDesc = "Identifica corretamente seus déficits e virtudes, porém necessita detalhar e praticar com maior rigor a substituição de atitudes nos contextos disparadores.";
    } else {
      classificationText = "Mapeamento Primário de Autoimagem com Ambivalência Crítica";
      classificationDesc = "Esboça as primeiras categorias de autoimagem. Há tendência de fusão com traços negativos ou dificuldade persistente para traçar caminhos realistas de evolução de HPs.";
    }
  }

  return (
    <div className="space-y-6 text-[#E0E0E0] p-1" id="exame-atributos-pessoais-root">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <Fingerprint className="w-4 h-4 text-indigo-400" />
            <span>Ferramenta Integradora nº 22</span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mt-1">
            Exame da Qualidade dos Atributos Pessoais
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Aprofunda as HPs de <span className="text-[#00A3FF] font-semibold">Autoconhecimento</span> e <span className="text-emerald-400 font-semibold">Autoestima</span>. 
            Permite reestruturar atitudes inadequadas registrando os contextos disparadores e gerando projetos ativos de evolução pessoal de novos comportamentos baseados em valores.
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
        <div className="space-y-6" id="editor-layout">
          
          {/* STATS AND GLOBAL ADVISORY BANNER */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="stats-grid-4cols">
            
            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg">
              <div className="text-2xl font-bold font-mono text-indigo-400">{iscScore}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Satisfação Consciencial (ISC)</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Grau de autoapreciação positiva integrada</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg">
              <div className="text-2xl font-bold font-mono text-emerald-400">{pdhScore}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Desenvolvimento de HPs</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Clareza no planejamento de novas HPs</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg">
              <div className="text-2xl font-bold font-mono text-amber-500">{icvScore}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Consciência de Vulnerabilidade</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Mapeamento de comportamentos e gatilhos</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg flex flex-col justify-center items-center">
              <button
                type="button"
                onClick={loadPresetSamples}
                className="w-full h-full py-2 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 hover:text-white border border-indigo-950 rounded-lg text-[10px] transition font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1.5"
              >
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Carregar Amostras Clínicas
              </button>
            </div>

          </div>

          <div className="bg-gray-950/60 border border-gray-850 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase font-mono">
              <Award className="w-5 h-5 text-[#00A3FF]" />
              <span>Resultados Estruturais do Autoconceito: {classificationText}</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-4xl">
              {classificationDesc} 
              <br />
              <span className="text-indigo-300 mt-1.5 inline-block">
                💡 <b>Regra do Terapeuta:</b> Use as duas colunas centrais (&ldquo;Sou e Não Gosto de Ser&rdquo; e &ldquo;Não Sou e Gostaria de Ser&rdquo;) para extrair as metas de intervenção clínica. Cada comportamento disfuncional deve ter o contexto disparador delimitado, e cada virtude de desenvolvimento deve constituir um mini-projeto de vida para o paciente.
              </span>
            </p>
          </div>

          {/* MAIN 4 QUADRANTS INTERACTIVE BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="bento-4-quadrants">
            
            {/* QUADRANT 1: SOU E GOSTO DE SER */}
            <div className="bg-gray-950 border border-emerald-950 rounded-xl p-5 space-y-4 shadow-xl hover:border-emerald-900/60 transition duration-200">
              <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-400">
                    SOU E GOSTO DE SER
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddForm("souGosto")}
                  className="p-1.5 bg-emerald-950/50 hover:bg-emerald-900 text-emerald-400 hover:text-white rounded-lg transition"
                  title="Novo atributo nesta categoria"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {sgCount === 0 ? (
                <p className="text-[11px] text-gray-600 italic py-4 text-center">Nenhum atributo positivo registrado.</p>
              ) : (
                <div className="space-y-3">
                  {state.souGosto.map(item => (
                    <div key={item.id} className="bg-emerald-950/10 border border-emerald-900/20 p-3 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-200">{item.text}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit("souGosto", item)}
                            className="p-1 text-gray-500 hover:text-white rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttribute("souGosto", item.id)}
                            className="p-1 text-gray-500 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono uppercase bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded">
                          {item.hpAssociated}
                        </span>
                        {item.contextOrNotes && (
                          <span className="text-[10px] text-gray-400 line-clamp-1">{item.contextOrNotes}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUADRANT 2: SOU E NÃO GOSTO DE SER */}
            <div className="bg-gray-950 border border-amber-950 rounded-xl p-5 space-y-4 shadow-xl hover:border-amber-900/60 transition duration-200">
              <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-amber-400">
                    SOU E NÃO GOSTO DE SER
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddForm("souNaoGosto")}
                  className="p-1.5 bg-amber-950/50 hover:bg-amber-900 text-amber-400 hover:text-white rounded-lg transition"
                  title="Novo item nesta categoria"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {sngCount === 0 ? (
                <p className="text-[11px] text-gray-600 italic py-4 text-center">Nenhum comportamento / traço a substituir registrado.</p>
              ) : (
                <div className="space-y-3">
                  {state.souNaoGosto.map(item => (
                    <div key={item.id} className="bg-amber-950/10 border border-amber-900/20 p-3 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-200">{item.text}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit("souNaoGosto", item)}
                            className="p-1 text-gray-400 hover:text-white rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttribute("souNaoGosto", item.id)}
                            className="p-1 text-gray-400 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] bg-amber-950/20 p-2 border border-amber-900/30 rounded text-amber-300">
                        <div className="font-mono text-[8px] uppercase text-amber-400 mb-0.5"><b>Disparador e Contexto de Ocorrência:</b></div>
                        {item.contextOrNotes || <em className="text-gray-500">Pendente de mapeamento de contexto disparador de HP.</em>}
                      </div>
                      <div className="mt-1">
                        <span className="text-[9px] font-mono uppercase bg-amber-900/30 text-amber-400 px-1.5 py-0.5 rounded">
                          MetaHP: {item.hpAssociated}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUADRANT 3: NÃO SOU E GOSTARIA DE SER */}
            <div className="bg-gray-950 border border-indigo-950 rounded-xl p-5 space-y-4 shadow-xl hover:border-indigo-900/60 transition duration-200">
              <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-indigo-400">
                    NÃO SOU E GOSTARIA DE SER
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddForm("naoSouGostaria")}
                  className="p-1.5 bg-indigo-950/50 hover:bg-indigo-900 text-indigo-400 hover:text-white rounded-lg transition"
                  title="Novo projeto de HP nesta categoria"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {nsgCount === 0 ? (
                <p className="text-[11px] text-gray-600 italic py-4 text-center">Nenhum projeto de desenvolvimento ativo.</p>
              ) : (
                <div className="space-y-3">
                  {state.naoSouGostaria.map(item => (
                    <div key={item.id} className="bg-indigo-950/10 border border-indigo-900/20 p-3 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-200">{item.text}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit("naoSouGostaria", item)}
                            className="p-1 text-gray-400 hover:text-white rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttribute("naoSouGostaria", item.id)}
                            className="p-1 text-gray-400 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] bg-indigo-950/20 p-2 border border-indigo-900/30 rounded text-indigo-300">
                        <div className="font-mono text-[8px] uppercase text-indigo-400 mb-0.5"><b>Projeto Terapêutico de Desenvolvimento:</b></div>
                        {item.contextOrNotes || <em className="text-gray-500">Pendente de ações práticas para treinar esta habilidade.</em>}
                      </div>
                      <div className="mt-1">
                        <span className="text-[9px] font-mono uppercase bg-indigo-900/35 text-indigo-400 px-1.5 py-0.5 rounded">
                          HP Alvo: {item.hpAssociated}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUADRANT 4: NÃO SOU E GOSTO DE NÃO SER */}
            <div className="bg-gray-950 border border-cyan-950 rounded-xl p-5 space-y-4 shadow-xl hover:border-cyan-900/60 transition duration-200">
              <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-cyan-400">
                    NÃO SOU E GOSTO DE NÃO SER
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddForm("naoSouGostoNao")}
                  className="p-1.5 bg-cyan-950/50 hover:bg-cyan-950 text-cyan-400 hover:text-white rounded-lg transition"
                  title="Novo item nesta categoria"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {nsgnCount === 0 ? (
                <p className="text-[11px] text-gray-600 italic py-4 text-center">Nenhum traço rejeitado saudável.</p>
              ) : (
                <div className="space-y-3">
                  {state.naoSouGostoNao.map(item => (
                    <div key={item.id} className="bg-cyan-950/10 border border-cyan-900/20 p-3 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-200">{item.text}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit("naoSouGostoNao", item)}
                            className="p-1 text-gray-500 hover:text-white rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttribute("naoSouGostoNao", item.id)}
                            className="p-1 text-gray-500 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono uppercase bg-cyan-900/30 text-cyan-400 px-1.5 py-0.5 rounded">
                          Apreço por: {item.hpAssociated}
                        </span>
                        {item.contextOrNotes && (
                          <span className="text-[10px] text-gray-400 line-clamp-1">{item.contextOrNotes}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* DYNAMIC FORM MODAL REPLACEMENT / COLLAPSIBLE ELEMENT */}
          {activeFormQuadrant && (
            <div className="bg-gray-950 border-2 border-indigo-500/80 rounded-xl p-5 space-y-4 shadow-2xl relative animate-fade-in">
              <button
                type="button"
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-xs font-mono uppercase tracking-widest text-[#00A3FF] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>
                  {editingId ? "Editar Registro em:" : "Criar Novo Atributo Pessoal no Quadrante:"}{" "}
                  {activeFormQuadrant === "souGosto" && "Sou e Gosto de Ser"}
                  {activeFormQuadrant === "souNaoGosto" && "Sou e não Gosto de Ser"}
                  {activeFormQuadrant === "naoSouGostaria" && "Não sou e gostaria de Ser"}
                  {activeFormQuadrant === "naoSouGostoNao" && "Não sou e Gosto de não Ser"}
                </span>
              </h4>

              <form onSubmit={handleSaveAttribute} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold mb-1">
                      Descrição / Atributo Comportamental:
                    </label>
                    <input
                      type="text"
                      required
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Ex: Altamente perfeccionista, Dificuldade de impor limites..."
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold mb-1">
                      Habilidade Psicológica (HP) ou Virtude Correlacionada:
                    </label>
                    <input
                      type="text"
                      required
                      value={newHp}
                      onChange={(e) => setNewHp(e.target.value)}
                      placeholder="Ex: Autoestima, Assertividade, Imunidade Social..."
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between space-y-3">
                  <div>
                    <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold mb-1">
                      {activeFormQuadrant === "souNaoGosto" 
                        ? "Contextos e Desencadeadores de Ocorrência (Fundamental):"
                        : activeFormQuadrant === "naoSouGostaria"
                          ? "Projeto Terapêutico / Plano de Treinamento de HP (Terapêutico):"
                          : "Anotações Clínicas Complementares (Opcional):"
                      }
                    </label>
                    <textarea
                      rows={3}
                      value={newContext}
                      onChange={(e) => setNewContext(e.target.value)}
                      placeholder={
                        activeFormQuadrant === "souNaoGosto"
                          ? "Mapeie detalhadamente onde, quando e com quem este traço ocorre..."
                          : activeFormQuadrant === "naoSouGostaria"
                            ? "Como o paciente treinará este novo valor na vida prática no próximo mês?..."
                            : "Anotações históricas relevantes adicionais..."
                      }
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 text-gray-450 transition font-mono uppercase tracking-wider text-[11px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 text-white transition font-mono uppercase tracking-wider text-[11px] shadow-lg shadow-indigo-600/10"
                    >
                      {editingId ? "Salvar Alterações" : "Inserir Atributo"}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* GLOBAL NOTES EVOLUTION */}
          <div className="bg-gray-950 border border-gray-850 p-4 rounded-xl space-y-2">
            <label className="block text-xs text-[#00A3FF] font-mono uppercase tracking-widest font-bold">
              Orientação do Plano Psicoterapêutico Global:
            </label>
            <textarea
              rows={3}
              value={state.clinicalNotes}
              onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
              placeholder="Descreva a visão estrutural do terapeuta sobre o conjunto de traços e projetos..."
              className="w-full px-3 py-2 bg-gray-900/60 border border-gray-800 rounded-lg text-xs text-[#d1d5db] focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

        </div>
      ) : (
        /* FACSIMILE PRINTABLE SHEET BLOCK */
        <div id="facsimile-pdf-view" className="bg-slate-900 p-6 rounded-xl flex justify-center">
          
          <div className="bg-white text-black p-8 shadow-2xl rounded-sm w-full max-w-[850px] border border-gray-300 relative min-h-[1050px] font-sans flex flex-col justify-between">
            <div>
              {/* PRINT DOUBLE REINFORCED BORDER */}
              <div className="absolute inset-2 border-2 border-double border-black pointer-events-none" />

              {/* SHEET TITLE */}
              <div className="text-center py-6 border-b border-black mb-6">
                <h2 className="text-xl font-bold tracking-widest uppercase tracking-widest leading-none font-sans" style={{ letterSpacing: "0.15em" }}>
                  Exame da Qualidade dos Atributos Pessoais
                </h2>
              </div>

              {/* SHEET HEADER SPECIFICATIONS */}
              <div className="grid grid-cols-3 gap-y-2 text-xs border border-black p-4 mb-5">
                <div className="col-span-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Paciente:</span>
                  <div className="border-b border-black w-[95%] font-mono py-0.5 uppercase tracking-wide">
                    {patient.name || "NÃO CONFIGURADO"}
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

              {/* 4 COLUMNS FULL WIDTH HORIZONTAL GRID TABLE */}
              <div className="border border-black grid grid-cols-4 divide-x divide-black text-[11px] leading-relaxed select-text min-h-[550px] bg-white">
                
                {/* COLUMN 1 */}
                <div className="divide-y divide-gray-250 flex flex-col">
                  <div className="bg-black/5 text-center font-bold font-sans uppercase p-2 border-b border-black flex flex-col items-center justify-center min-h-[44px]">
                    <span className="tracking-tight line-clamp-2">Sou e gosto de ser</span>
                  </div>
                  <div className="p-2 space-y-2.5 flex-1 bg-white">
                    {state.souGosto.length === 0 ? (
                      <em className="text-gray-400 block text-[10px] text-center pt-8">Nenhum atributo positivo registrado</em>
                    ) : (
                      state.souGosto.map((item, idx) => (
                        <div key={item.id} className="text-xs">
                          <p className="font-sans font-bold leading-normal text-black text-[11px]">
                            {idx + 1}. {item.text}
                          </p>
                          <span className="text-[9px] font-mono text-gray-500 uppercase">HP: {item.hpAssociated}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 2 */}
                <div className="divide-y divide-gray-250 flex flex-col">
                  <div className="bg-black/5 text-center font-bold font-sans uppercase p-2 border-b border-black flex flex-col items-center justify-center min-h-[44px]">
                    <span className="tracking-tight line-clamp-2">Sou e não gosto de ser</span>
                  </div>
                  <div className="p-2 space-y-2.5 flex-1 bg-white">
                    {state.souNaoGosto.length === 0 ? (
                      <em className="text-gray-400 block text-[10px] text-center pt-8">Nenhum traço fóbico ou deletério registrado</em>
                    ) : (
                      state.souNaoGosto.map((item, idx) => (
                        <div key={item.id} className="text-xs space-y-0.5">
                          <p className="font-sans font-bold text-black text-[11px]">
                            {idx + 1}. {item.text}
                          </p>
                          <p className="text-[9.5px] italic text-gray-700 bg-gray-50 p-1 border border-gray-100 rounded leading-tight">
                            <b>Gatilho:</b> {item.contextOrNotes || "Não definido"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 3 */}
                <div className="divide-y divide-gray-250 flex flex-col">
                  <div className="bg-black/5 text-center font-bold font-sans uppercase p-2 border-b border-black flex flex-col items-center justify-center min-h-[44px]">
                    <span className="tracking-tight line-clamp-2">Não sou e gostaria de ser</span>
                  </div>
                  <div className="p-2 space-y-2.5 flex-1 bg-white">
                    {state.naoSouGostaria.length === 0 ? (
                      <em className="text-gray-400 block text-[10px] text-center pt-8">Nenhum alvo de projeto ativo</em>
                    ) : (
                      state.naoSouGostaria.map((item, idx) => (
                        <div key={item.id} className="text-xs space-y-0.5">
                          <p className="font-sans font-bold text-black text-[11px]">
                            {idx + 1}. {item.text}
                          </p>
                          <p className="text-[9.5px] italic text-indigo-900 bg-indigo-50/50 p-1 border border-indigo-100/50 rounded leading-tight">
                            <b>Plano:</b> {item.contextOrNotes || "Não definido"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 4 */}
                <div className="divide-y divide-gray-250 flex flex-col">
                  <div className="bg-black/5 text-center font-bold font-sans uppercase p-2 border-b border-black flex flex-col items-center justify-center min-h-[44px]">
                    <span className="tracking-tight line-clamp-2">Não sou e gosto de não ser</span>
                  </div>
                  <div className="p-2 space-y-2.5 flex-1 bg-white">
                    {state.naoSouGostoNao.length === 0 ? (
                      <em className="text-gray-400 block text-[10px] text-center pt-8">Nenhum traço rejeitado saudável</em>
                    ) : (
                      state.naoSouGostoNao.map((item, idx) => (
                        <div key={item.id} className="text-xs text-[11px]">
                          <p className="font-sans font-bold text-black">
                            {idx + 1}. {item.text}
                          </p>
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Apreço: {item.hpAssociated}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* BOTTOM EVOLUTION TEXT */}
              {state.clinicalNotes && (
                <div className="mt-5 border border-black p-4 bg-gray-50/40 text-xs">
                  <span className="font-bold uppercase block tracking-wider mb-1 text-[10px]">Anotações de Evolução Clínica:</span>
                  <p className="text-gray-900 leading-relaxed font-sans text-[11.5px] whitespace-pre-wrap">
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
                <span className="uppercase font-bold text-gray-700 text-[10px]">Inteligência Psicológica</span>
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
