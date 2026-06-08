import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Plus, Trash2, Sparkles, Award, Eye, Scale, HelpCircle, 
  CheckCircle2, AlertTriangle, Lightbulb, Clipboard, ArrowRight,
  BookOpen, Heart, ShieldCheck, Check, Activity, TrendingUp, X, Printer, Edit2, Fingerprint, Info
} from "lucide-react";

export interface SingularSharedAttribute {
  id: string;
  text: string;
  nature: "singular" | "compartilhada";
  howItBuildsSelfEsteem: string; // Explica como esse traço eleva a autoestima ou se traduz na prática
}

export interface ExameSingularesCompartilhadasState {
  attributes: SingularSharedAttribute[];
  clinicalNotes: string;
}

interface ExameSingularesCompartilhadasViewProps {
  patient: PatientInfo;
  state: ExameSingularesCompartilhadasState;
  setState: React.Dispatch<React.SetStateAction<ExameSingularesCompartilhadasState>>;
}

export default function ExameSingularesCompartilhadasView({
  patient,
  state,
  setState
}: ExameSingularesCompartilhadasViewProps) {
  const [viewMode, setViewMode] = useState<"editor" | "facsimile">("editor");
  const [activeFormType, setActiveFormType] = useState<"singular" | "compartilhada" | null>(null);
  
  // Input fields
  const [newText, setNewText] = useState("");
  const [newHowItBuilds, setNewHowItBuilds] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setNewText("");
    setNewHowItBuilds("");
    setEditingId(null);
    setActiveFormType(null);
  };

  const handleOpenAddForm = (type: "singular" | "compartilhada") => {
    resetForm();
    setActiveFormType(type);
  };

  const handleStartEdit = (item: SingularSharedAttribute) => {
    setActiveFormType(item.nature);
    setEditingId(item.id);
    setNewText(item.text);
    setNewHowItBuilds(item.howItBuildsSelfEsteem);
  };

  const handleSaveAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFormType || !newText.trim()) return;

    if (editingId) {
      // Edit mode
      setState((prev) => ({
        ...prev,
        attributes: prev.attributes.map((item) =>
          item.id === editingId
            ? { ...item, text: newText, howItBuildsSelfEsteem: newHowItBuilds }
            : item
        ),
      }));
    } else {
      // Create mode
      const newItem: SingularSharedAttribute = {
        id: "attr_sc_" + Date.now(),
        text: newText,
        nature: activeFormType,
        howItBuildsSelfEsteem: newHowItBuilds || "Promove o respeito próprio e o alinhamento com a identidade pessoal."
      };
      setState((prev) => ({
        ...prev,
        attributes: [...prev.attributes, newItem],
      }));
    }
    resetForm();
  };

  const handleDeleteAttribute = (id: string) => {
    setState((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((item) => item.id !== id),
    }));
    if (editingId === id) {
      resetForm();
    }
  };

  const loadPresetSamples = () => {
    const samples: SingularSharedAttribute[] = [
      {
        id: "sc_s1",
        text: "Perspectiva analítica hiperfocada para isolar variáveis e achar soluções de software atípicas.",
        nature: "singular",
        howItBuildsSelfEsteem: "Permite sentir orgulho da inteligência lógica singular e da capacidade de criar algo único sem copiar."
      },
      {
        id: "sc_s2",
        text: "Gosto e domínio estético por ilustrações realistas no estilo gravura do século XIX.",
        nature: "singular",
        howItBuildsSelfEsteem: "Expressa a raridade do repertório artístico que serve como ativo diferencial em projetos visuais."
      },
      {
        id: "sc_s3",
        text: "Habilidade de traduzir em palavras simples sentimentos complexos que outras pessoas travam ao relatar.",
        nature: "singular",
        howItBuildsSelfEsteem: "Facilita conexões autênticas e autocompassão verbal nos diálogos construtivos."
      },
      {
        id: "sc_c1",
        text: "Compromisso irrepreensível com a transparência ética, honestidade e devolução de valores alheios.",
        nature: "compartilhada",
        howItBuildsSelfEsteem: "Gera sentimento de retidão moral e dignidade pessoal de ser alguém confiável e bem quisto na comunidade."
      },
      {
        id: "sc_c2",
        text: "Empatia e paciência ativa para orientar novos membros em ferramentas técnicas na empresa.",
        nature: "compartilhada",
        howItBuildsSelfEsteem: "Demonstra o espírito coletivo de contribuição, consolidando a sensação de utilidade social e coleguismo."
      },
      {
        id: "sc_c3",
        text: "Busca contínua por estilo de vida saudável, incluindo caminhadas ecológicas semanais.",
        nature: "compartilhada",
        howItBuildsSelfEsteem: "Alinha as ações cotidianas com valores universais de autopreservação e respeito ao corpo."
      }
    ];

    setState({
      attributes: samples,
      clinicalNotes: "O teste clínico demonstra uma harmonia primorosa entre a autoafirmação da individualidade técnica do sujeito (singularidades de alto valor) e a validação de seus preceitos morais e compassivos (valores compartilhados). Isso mitiga a armadilha do individualismo arrogante e afasta a fobia de inadequação social, elevando os sentimentos de valor de si de forma integrativa."
    });
  };

  // Calculations
  const singulars = state.attributes.filter(a => a.nature === "singular");
  const shareds = state.attributes.filter(a => a.nature === "compartilhada");

  const sCount = singulars.length;
  const cCount = shareds.length;
  const totalCount = state.attributes.length;

  // Let's design scoring:
  // 1. Índice de Exclusividade Identitária (IEI) - based on having singular properties
  const ieiScore = Math.min(100, sCount * 25 + (singulars.filter(a => a.howItBuildsSelfEsteem.length > 15).length * 8));
  
  // 2. Índice de Pertencimento Compartilhado (IPC) - based on having shared properties
  const ipcScore = Math.min(100, cCount * 25 + (shareds.filter(a => a.howItBuildsSelfEsteem.length > 15).length * 8));

  // 3. Sinergia da Autoestima Singular (SAS) - optimal balance is having BOTH categories well represented
  // If one side has nothing, synergy drops. Optimal is close to 1:1 ratio.
  const balanceFactor = totalCount > 0 ? 1 - Math.abs(sCount - cCount) / totalCount : 0;
  const rawSas = totalCount > 0 ? ((ieiScore + ipcScore) / 2) * (0.6 + 0.4 * balanceFactor) : 0;
  const sasScore = Math.min(100, Math.round(rawSas));

  let classificationText = "Sem Registros de Autoimagem";
  let classificationDesc = "Insira as características singulares e compartilhadas do paciente para iniciar o exame de autoestima do self.";

  if (totalCount > 0) {
    if (sasScore >= 80) {
      classificationText = "Perfeita Sinergia Identitária (Identidade Singular e Pertencimento Pleno)";
      classificationDesc = "O paciente consegue integrar sem dificuldades a herança de virtudes comuns humanas com o apreço por sua identidade única e talentos raros. Desenvolve autoestima inabalável.";
    } else if (sasScore >= 50) {
      classificationText = "Integração Moderada de Autoimagem com Pequena Dissociação";
      classificationDesc = "Reconhece o próprio valor, mas pode supervalorizar apenas um dos lados (ou se sente isolado e diferente demais, ou sente que é comum demais e sem diferenciação expressiva).";
    } else {
      classificationText = "Ancoragem Frágil ou Fracionada de Autoestima";
      classificationDesc = "Demonstra escassas categorias registradas. Necessita expandir o mapeamento assistido de características de personalidade para afastar sentimentos agudos de insuficiência.";
    }
  }

  return (
    <div className="space-y-6 text-[#E0E0E0] p-1" id="exame-singulares-compartilhadas-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <Fingerprint className="w-4 h-4 text-indigo-400" />
            <span>Ferramenta Integradora nº 23</span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mt-1">
            Exame de Características Singulares e Compartilhadas
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Aprofunda a HP de <span className="text-[#00A3FF] font-semibold">Autoestima</span>. 
            Mapeia o autoconceito do paciente de forma integrativa. A autoestima saudável reside na 
            <span className="text-emerald-400 hover:underline"> reunião única</span> entre aspectos de extrema singularidade e aspectos de pertencimento comunitário compartilhado.
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
            id="btn-sc-mode-editor"
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
            id="btn-sc-mode-facsimile"
          >
            <Printer className="w-3.5 h-3.5" />
            Folha Oficial (PDF)
          </button>
        </div>
      </div>

      {viewMode === "editor" ? (
        <div className="space-y-6" id="sc-editor-layout">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="sc-stats-grid">
            
            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg">
              <div className="text-2xl font-bold font-mono text-indigo-400">{ieiScore}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Exclusividade Identitária (IEI)</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Mapeamento de características singulares e diferenciais</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg">
              <div className="text-2xl font-bold font-mono text-emerald-400">{ipcScore}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Pertencimento Compartilhado (IPC)</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Sintonia e validação de traços e valores comuns</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg">
              <div className="text-2xl font-bold font-mono text-cyan-400">{sasScore}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-1">Sinergia da Autoestima (SAS)</div>
              <p className="text-[9px] text-gray-500 mt-0.5">Integração do self singular com a humanidade comum</p>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-4 text-center shadow-lg flex flex-col justify-center items-center">
              <button
                type="button"
                onClick={loadPresetSamples}
                className="w-full h-full py-2 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 hover:text-white border border-indigo-950 rounded-lg text-[10px] transition font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1.5"
                id="btn-sc-load-presets"
              >
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Carregar Amostras THP
              </button>
            </div>

          </div>

          {/* ADVISORY CARD */}
          <div className="bg-gray-950/60 border border-gray-850 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase font-mono">
              <Award className="w-5 h-5 text-[#00A3FF]" />
              <span>Avaliação de Equilíbrio Interno: {classificationText}</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-4xl">
              {classificationDesc}
              <br />
              <span className="text-indigo-300 mt-1.5 inline-block">
                💡 <b>Nexo Psicológico:</b> A pessoa que tenta basear sua autoestima exclusivamente nas características compartihadas acaba sentindo-se sem importância, substituível ou &ldquo;apenas mais um na multidão&rdquo;. Já a pessoa que tenta se fixar somente nas singularidades torna-se vulnerável ao isolamento social ou à empáfia egóica. A autoestima madura consolida-se sabendo que você possui as virtudes coletivas morais comuns, operadas de uma maneira inteiramente única e inestimável.
              </span>
            </p>
          </div>

          {/* TWO COLUMNS LAYOUT INTERACTIVE PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="sc-panels-grid">
            
            {/* COLUMN 1: CARACTERÍSTICAS SINGULARES */}
            <div className="bg-gray-950 border border-gray-850 rounded-xl p-5 space-y-4 shadow-xl hover:border-indigo-900/30 transition duration-200">
              <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-indigo-300">
                    CARACTERÍSTICAS SINGULARES
                  </h3>
                  <span className="bg-indigo-950/80 text-indigo-400 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {sCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddForm("singular")}
                  className="p-1.5 bg-indigo-950/50 hover:bg-indigo-900 text-indigo-400 hover:text-white rounded-lg transition"
                  title="Adicionar singularidade"
                  id="btn-add-singular"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-gray-500 italic leading-relaxed">
                Traços de personalidade, talentos, gostos estéticos ou habilidades que são de alta raridade no convívio e diferenciam o paciente.
              </p>

              {sCount === 0 ? (
                <p className="text-[11px] text-gray-600 italic py-6 text-center">Nenhuma singularidade cadastrada.</p>
              ) : (
                <div className="space-y-3">
                  {singulars.map((item) => (
                    <div key={item.id} className="bg-indigo-950/5 border border-indigo-900/10 p-3 rounded-lg text-xs space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-gray-200 leading-normal">{item.text}</span>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-gray-400 hover:text-white rounded"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttribute(item.id)}
                            className="p-1 text-gray-400 hover:text-rose-400 rounded"
                            title="Deletar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] bg-slate-900/60 border border-indigo-950 p-2 rounded text-indigo-300">
                        <div className="font-mono text-[8px] uppercase text-indigo-400 mb-0.5"><b>Como eleva a Autoestima?</b></div>
                        {item.howItBuildsSelfEsteem}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMN 2: CARACTERÍSTICAS COMPARTILHADAS */}
            <div className="bg-gray-950 border border-gray-850 rounded-xl p-5 space-y-4 shadow-xl hover:border-emerald-900/30 transition duration-200">
              <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-450" />
                  <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-400">
                    CARACTERÍSTICAS COMPARTILHADAS
                  </h3>
                  <span className="bg-emerald-950/80 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {cCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddForm("compartilhada")}
                  className="p-1.5 bg-emerald-950/50 hover:bg-emerald-900 text-emerald-400 hover:text-white rounded-lg transition"
                  title="Adicionar compartilhada"
                  id="btn-add-compartilhada"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-gray-500 italic leading-relaxed">
                Repertórios morais, habilidades coletivas, virtudes cívicas e gostos comuns partilhados com a humanidade e grupos de convívio saudável.
              </p>

              {cCount === 0 ? (
                <p className="text-[11px] text-gray-600 italic py-6 text-center">Nenhuma característica compartilhada cadastrada.</p>
              ) : (
                <div className="space-y-3">
                  {shareds.map((item) => (
                    <div key={item.id} className="bg-emerald-950/5 border border-emerald-900/10 p-3 rounded-lg text-xs space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-gray-200 leading-normal">{item.text}</span>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-gray-400 hover:text-white rounded"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAttribute(item.id)}
                            className="p-1 text-gray-400 hover:text-rose-400 rounded"
                            title="Deletar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] bg-slate-900/60 border border-emerald-950 p-2 rounded text-emerald-300">
                        <div className="font-mono text-[8px] uppercase text-emerald-400 mb-0.5"><b>Como ajuda na Conexão/Autoestima?</b></div>
                        {item.howItBuildsSelfEsteem}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* DYNAMIC FORM ROW */}
          {activeFormType && (
            <div className="bg-gray-950 border-2 border-indigo-500 rounded-xl p-5 space-y-4 shadow-2xl relative animate-fade-in" id="sc-form-panel">
              <button
                type="button"
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                id="btn-close-sc-form"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-xs font-mono uppercase tracking-widest text-[#00A3FF] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>
                  {editingId ? "Editar Característica no Quadrante:" : "Cadastrar Nova Característica:"}{" "}
                  {activeFormType === "singular" ? "SINGULAR (Rara/Única)" : "COMPARTILHADA (Coletiva/Comum)"}
                </span>
              </h4>

              <form onSubmit={handleSaveAttribute} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold mb-1">
                      Característica de Personalidade / Virtude / Gosto:
                    </label>
                    <input
                      type="text"
                      required
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder={
                        activeFormType === "singular"
                          ? "Ex: Perspectiva técnica refinada de ilustração estilo xilogravura..."
                          : "Ex: Respeito intransigente aos limites éticos e de honestidade nas transações..."
                      }
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-850 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
                      id="input-sc-text"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between space-y-3">
                  <div>
                    <label className="block text-gray-400 font-mono text-[10px] uppercase font-bold mb-1">
                      Significado Prático / Como constrói a sua Autoestima e Senso de Valor?
                    </label>
                    <textarea
                      rows={3}
                      value={newHowItBuilds}
                      onChange={(e) => setNewHowItBuilds(e.target.value)}
                      placeholder={
                        activeFormType === "singular"
                          ? "Esclareça como sentir orgulho desse traço impede que você tente se moldar servilmente aos outros..."
                          : "Explique como demonstrar essa virtude conecta você a propósitos humanos dignos de ser compartilhado..."
                      }
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-850 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                      id="input-sc-builds"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-900 border border-gray-850 rounded-lg hover:bg-gray-850 text-gray-400 transition font-mono uppercase tracking-wider text-[10px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-650 rounded-lg hover:bg-indigo-600 text-white transition font-mono uppercase tracking-wider text-[10px] shadow-lg shadow-indigo-600/15"
                      id="btn-submit-sc"
                    >
                      {editingId ? "Salvar Traço" : "Adicionar à Tabela"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* CLINICAL SUMMARY TEXTAREA */}
          <div className="bg-gray-950 border border-gray-850 p-4 rounded-xl space-y-2">
            <label className="block text-xs text-[#00A3FF] font-mono uppercase tracking-widest font-bold">
              Síntese da Integração de Autoimagem e Pertencimento:
            </label>
            <textarea
              rows={3}
              value={state.clinicalNotes}
              onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
              placeholder="Descreva a visão estrutural do terapeuta sobre a sinergia dos traços do paciente..."
              className="w-full px-3 py-2 bg-gray-900/60 border border-gray-800 rounded-lg text-xs text-[#d1d5db] focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              id="sc-clinical-notes"
            />
          </div>

        </div>
      ) : (
        /* FACSIMILE GRAPHIC LAYOUT */
        <div id="facsimile-sc-view" className="bg-slate-900 p-6 rounded-xl flex justify-center">
          
          <div className="bg-white text-black p-8 shadow-2xl rounded-sm w-full max-w-[850px] border border-gray-300 relative min-h-[1050px] font-sans flex flex-col justify-between">
            <div>
              {/* EXTERNAL DOUBLE BORDER */}
              <div className="absolute inset-2 border-2 border-double border-black pointer-events-none" />

              {/* SHEET HEAD */}
              <div className="text-center py-6 border-b border-black mb-6">
                <h2 className="text-xl font-bold tracking-widest uppercase leading-none font-sans" style={{ letterSpacing: "0.15em" }}>
                  Exame de Características Singulares e Compartilhadas
                </h2>
              </div>

              {/* HEADER DATA GRID */}
              <div className="grid grid-cols-3 gap-y-2 text-xs border border-black p-4 mb-5">
                <div className="col-span-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Paciente:</span>
                  <div className="border-b border-black w-[95%] font-mono py-0.5 uppercase tracking-wide">
                    {patient.name || "NÃO INDICADO"}
                  </div>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Data de Aplicação:</span>
                  <div className="border-b border-black w-[90%] font-mono py-0.5">07/06/2026</div>
                </div>
                <div className="col-span-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Profissional Conducente:</span>
                  <div className="border-b border-black w-[95%] font-mono py-0.5">Dr(a). Lincoln Poubel</div>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] block">CRP:</span>
                  <div className="border-b border-black w-[90%] font-mono py-0.5">05 / 48392-RJ</div>
                </div>
              </div>

              {/* METRIC BANNER FOR PRINT OUT */}
              <div className="border border-black bg-gray-50 p-2 mb-4 flex justify-around text-center text-[10px] font-mono uppercase tracking-wider divide-x divide-gray-300">
                <div className="flex-1">
                  <b>Exclusividade (IEI):</b> {ieiScore}%
                </div>
                <div className="flex-1">
                  <b>Pertencimento (IPC):</b> {ipcScore}%
                </div>
                <div className="flex-1">
                  <b>Sinergia Global (SAS):</b> {sasScore}%
                </div>
              </div>

              {/* TWO COLUMN GRID LAYOUT STRICT ACCORDING TO PDF IMAGES */}
              <div className="border border-black min-h-[580px] bg-white text-[11.5px]">
                
                {/* SECTION HEADER TABLE */}
                <div className="bg-black/5 text-center font-bold uppercase tracking-widest py-2 border-b border-black text-[12px]">
                  CARACTERÍSTICAS DE PERSONALIDADE
                </div>

                {/* THE COLUMNS SPLITTER */}
                <div className="grid grid-cols-2 divide-x divide-black border-black min-h-[540px]">
                  
                  {/* SINGULARES */}
                  <div className="flex flex-col">
                    <div className="border-b border-black bg-black/[0.02] text-center font-bold py-2 uppercase tracking-wide">
                      Singulares
                    </div>
                    <div className="p-3 space-y-3.5 bg-white">
                      {singulars.length === 0 ? (
                        <em className="text-gray-400 block text-[10.5px] text-center pt-10">
                          Nenhum traço singular cadastrado
                        </em>
                      ) : (
                        singulars.map((item, idx) => (
                          <div key={item.id} className="space-y-0.5 text-xs text-black">
                            <p className="font-bold leading-snug">
                              {idx + 1}. {item.text}
                            </p>
                            <p className="text-[10px] font-sans text-gray-600 pl-3 border-l-2 border-gray-400">
                              <em><b>Efeito:</b> {item.howItBuildsSelfEsteem}</em>
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* COMPARTILHADAS */}
                  <div className="flex flex-col">
                    <div className="border-b border-black bg-black/[0.02] text-center font-bold py-2 uppercase tracking-wide">
                      Compartilhadas
                    </div>
                    <div className="p-3 space-y-3.5 bg-white">
                      {shareds.length === 0 ? (
                        <em className="text-gray-400 block text-[10.5px] text-center pt-10">
                          Nenhum traço compartilhado cadastrado
                        </em>
                      ) : (
                        shareds.map((item, idx) => (
                          <div key={item.id} className="space-y-0.5 text-xs text-black">
                            <p className="font-bold leading-snug">
                              {idx + 1}. {item.text}
                            </p>
                            <p className="text-[10px] font-sans text-gray-600 pl-3 border-l-2 border-gray-450">
                              <em><b>Efeito:</b> {item.howItBuildsSelfEsteem}</em>
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* FOOT CLINICAL TEXT AREA */}
              {state.clinicalNotes && (
                <div className="mt-5 border border-black p-4 bg-gray-50/40 text-xs text-black leading-relaxed">
                  <span className="font-bold uppercase tracking-wider block text-[10px] mb-1">Anotações Clínicas & Parecer de Autoestima:</span>
                  <p className="font-sans text-[11.5px] whitespace-pre-wrap">{state.clinicalNotes}</p>
                </div>
              )}

            </div>

            {/* LOWER LABELS CARD BOARD */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Protocolo de Habilidades Psicológicas (THP) • Autoestima Ativa</span>
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
