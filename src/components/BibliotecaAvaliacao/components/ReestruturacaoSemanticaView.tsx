import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  BookOpen, Plus, Trash2, HelpCircle, ArrowRight, ShieldCheck, 
  Sparkles, Award, Scale, HelpCircle as QuestionIcon, AlertTriangle, Check, RefreshCw
} from "lucide-react";

export interface SemanticItem {
  id: string;
  text: string;
  isDesadaptative: boolean; // whether this is a dysfunctional association/prejudice
  explanation?: string; // therapeutic rebuttal / socratic challenge
}

export interface SemanticRestructuringState {
  term: string;
  synonyms: SemanticItem[];
  antonyms: SemanticItem[];
  socraticQuestions: {
    question: string;
    answer: string;
  }[];
  healthyDefinition: string;
}

interface ReestruturacaoSemanticaViewProps {
  patient: PatientInfo;
  state: SemanticRestructuringState;
  setState: React.Dispatch<React.SetStateAction<SemanticRestructuringState>>;
}

export default function ReestruturacaoSemanticaView({
  patient,
  state,
  setState
}: ReestruturacaoSemanticaViewProps) {
  const [newSynonym, setNewSynonym] = useState("");
  const [newSynonymIsDes, setNewSynonymIsDes] = useState(false);
  const [newAntonym, setNewAntonym] = useState("");
  const [newAntonymIsDes, setNewAntonymIsDes] = useState(false);
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempExplanation, setTempExplanation] = useState("");

  // Seeds templates
  const PRESETS = [
    {
      label: "Ser Racional (Pensamento Rígido)",
      term: "Ser Racional",
      synonyms: [
        { id: "syn_1", text: "Ser frio e insensível", isDesadaptative: true, explanation: "Fusão de racionalidade com alexitimia ou apatia. Ser racional de fato envolve aceitar e regular as emoções, não fingir que elas não existem." },
        { id: "syn_2", text: "Ser calculista e obsessivo", isDesadaptative: true, explanation: "Análise fria manipuladora. A racionalidade clínica visa o bem-estar mútuo e a otimização de escolhas de vida baseadas em valores." },
        { id: "syn_3", text: "Ser inflexível / Não mudar de ideia", isDesadaptative: true, explanation: "Teimosia cognitiva. Na verdade, a verdadeira racionalidade exige acompanhar as evidências e circunstâncias, sendo altamente adaptável." },
        { id: "syn_4", text: "Agir matematicamente sob dados frios", isDesadaptative: false, explanation: "" }
      ],
      antonyms: [
        { id: "ant_1", text: "Ser emocional / Dramático", isDesadaptative: true, explanation: "Dicotomização inadequada. Emoções são dados biológicos e informativos, perfeitamente integráveis com a razão." },
        { id: "ant_2", text: "Ser fraco e vulnerável", isDesadaptative: true, explanation: "Regra rígida de autoproteção. Expressar vulnerabilidade é racional para intimidade." },
        { id: "ant_3", text: "Pessoa espontânea e leve", isDesadaptative: false, explanation: "" }
      ],
      healthyDefinition: "Racionalidade salutar significa possuir a capacidade de observar pensamentos e sentimentos à luz das circunstâncias práticas e fatos históricos reais, optando por comportamentos flexíveis que aproximem o indivíduo de seus valores vitais.",
      questions: [
        { question: "Onde começou a regra de que 'Racional' equivale a 'Frio ou Sem Emoção'?", answer: "Surgiu na infância, observando cuidadores altamente punitivos que ridicularizavam manifestações sentimentais." },
        { question: "Como essa distorção prejudica minhas decisões presentes?", answer: "Me impede de expressar afeto e pedir ajuda, me sobrecarregando com uma armadura rígida de autossuficiência sintomática." }
      ]
    },
    {
      label: "Felicidade (Expectativas Irrealistas)",
      term: "Felicidade",
      synonyms: [
        { id: "syn_h1", text: "Euforia constante 24 horas por dia", isDesadaptative: true, explanation: "Predição química impossível do ponto de vista neurobiológico. Felicidade envolve serenidade e engajamento, não mania perpétua." },
        { id: "syn_h2", text: "Ter zero problemas de vida", isDesadaptative: true, explanation: "Negação existencial fóbica. Problemas sempre existirão; felicidade é a habilidade de enfrentá-los com dignidade." },
        { id: "syn_h3", text: "Ser aprovado por todo mundo", isDesadaptative: true, explanation: "Subjugação interpessoal tóxica. O preço do agrado universal é a autoaniquilação de valores." }
      ],
      antonyms: [
        { id: "ant_h1", text: "Sentir Tristeza ou Desânimo", isDesadaptative: true, explanation: "Patologização de afetos normais. Tristeza é uma resposta natural a perdas e faz parte da riqueza existencial humana." },
        { id: "ant_h2", text: "Cometer falhas ou fracassar", isDesadaptative: true, explanation: "Medo crônico. O fracasso temporário é o laboratório essencial do aprendizado humano." }
      ],
      healthyDefinition: "Felicidade é o bem-estar psicológico que emerge de uma vida orientada por propósitos e valores genuínos, desenvolvendo resiliência ativa para aceitar o espectro natural e flutuante de experiências emocionais humanas.",
      questions: [
        { question: "Qual o maior perigo de equiparar felicidade a 'ausência de dor'?", answer: "Me leva a fazer esquiva experiencial constante, fugindo de responsabilidades, conversas francas e tentativas profissionais complexas." },
        { question: "Como redefinir a tristeza na minha rotina?", answer: "A tristeza é apenas um termômetro de itens que me importam. Posso acolhê-la e continuar agindo em prol de meus valores diários." }
      ]
    },
    {
      label: "Prosperidade (Adesão a Regras de Acúmulo)",
      term: "Prosperidade",
      synonyms: [
        { id: "syn_p1", text: "Ter luxo extremo e ostentar status", isDesadaptative: true, explanation: "Dependência de validação narcísica extrínseca. A prosperidade real reside na flexibilidade financeira e paz com recursos." },
        { id: "syn_p2", text: "Nunca ter dívida ou preocupação material", isDesadaptative: true, explanation: "Perfeccionismo econômico intolerante. Crises de fluxo de caixa ocorrem e exigem resolutividade de problemas ativa." },
        { id: "syn_p3", text: "Ser amplamente superior financeiramente aos outros", isDesadaptative: true, explanation: "Comparação social nociva que gera eterna frustração de déficit relativo." }
      ],
      antonyms: [
        { id: "ant_p1", text: "Viver com simplicidade ou moderação", isDesadaptative: true, explanation: "Regra rígida de que menos equivale a insignificância ou fracasso absoluto." },
        { id: "ant_p2", text: "Pedir ajuda ou orientação profissional na escassez", isDesadaptative: true, explanation: "Orgulho e vergonha gerando isolamento financeiro terminal." }
      ],
      healthyDefinition: "Prosperidade adaptativa é a tranquilidade existencial e material para suprir as próprias necessidades e apoiar causas importantes, sem aprisionar a autoimagem a marcas de superioridade ou acúmulo desproporcional.",
      questions: [
        { question: "Como se desvincular do medo inconsciente de escassez absoluta?", answer: "Reconhecendo minhas capacidades laborais duradouras de reconstrução, rede de apoio e autodisciplina ativa." },
        { question: "O que constitui a riqueza não-financeira que mereço desfrutar hoje?", answer: "Tempo livre com a família, saúde mental auto-regulada, e poder apreciar a sesta cotidiana sem culpa ou ruminação laborativa." }
      ]
    }
  ];

  const applyPreset = (preset: typeof PRESETS[0]) => {
    if (confirm(`Deseja carregar as configurações do modelo clínico de "${preset.label}"? Os dados editados atualmente serão sobrescritos.`)) {
      setState({
        term: preset.term,
        synonyms: [...preset.synonyms],
        antonyms: [...preset.antonyms],
        socraticQuestions: [...preset.questions],
        healthyDefinition: preset.healthyDefinition
      });
      setNewSynonym("");
      setNewAntonym("");
      setEditingItemId(null);
    }
  };

  const handleAddSynonym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSynonym.trim()) return;
    const newItem: SemanticItem = {
      id: "syn_" + Date.now(),
      text: newSynonym.trim(),
      isDesadaptative: newSynonymIsDes,
      explanation: ""
    };
    setState(prev => ({
      ...prev,
      synonyms: [...prev.synonyms, newItem]
    }));
    setNewSynonym("");
    setNewSynonymIsDes(false);
  };

  const handleRemoveSynonym = (id: string) => {
    setState(prev => ({
      ...prev,
      synonyms: prev.synonyms.filter(item => item.id !== id)
    }));
    if (editingItemId === id) setEditingItemId(null);
  };

  const handleAddAntonym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAntonym.trim()) return;
    const newItem: SemanticItem = {
      id: "ant_" + Date.now(),
      text: newAntonym.trim(),
      isDesadaptative: newAntonymIsDes,
      explanation: ""
    };
    setState(prev => ({
      ...prev,
      antonyms: [...prev.antonyms, newItem]
    }));
    setNewAntonym("");
    setNewAntonymIsDes(false);
  };

  const handleRemoveAntonym = (id: string) => {
    setState(prev => ({
      ...prev,
      antonyms: prev.antonyms.filter(item => item.id !== id)
    }));
    if (editingItemId === id) setEditingItemId(null);
  };

  const startEditExplanation = (item: SemanticItem) => {
    setEditingItemId(item.id);
    setTempExplanation(item.explanation || "");
  };

  const saveExplanation = (id: string, isSynonym: boolean) => {
    if (isSynonym) {
      setState(prev => ({
        ...prev,
        synonyms: prev.synonyms.map(item => 
          item.id === id ? { ...item, explanation: tempExplanation.trim() } : item
        )
      }));
    } else {
      setState(prev => ({
        ...prev,
        antonyms: prev.antonyms.map(item => 
          item.id === id ? { ...item, explanation: tempExplanation.trim() } : item
        )
      }));
    }
    setEditingItemId(null);
  };

  const handleAddSocratic = () => {
    setState(prev => ({
      ...prev,
      socraticQuestions: [
        ...prev.socraticQuestions,
        { question: "Nova Pergunta Socrática do Terapeuta", answer: "" }
      ]
    }));
  };

  const handleUpdateSocratic = (index: number, field: "question" | "answer", val: string) => {
    setState(prev => {
      const copy = [...prev.socraticQuestions];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, socraticQuestions: copy };
    });
  };

  const handleRemoveSocratic = (index: number) => {
    setState(prev => ({
      ...prev,
      socraticQuestions: prev.socraticQuestions.filter((_, i) => i !== index)
    }));
  };

  // Calculations for cognitive re-framing
  const totalSynonyms = state.synonyms.length;
  const desadaptativeSynonyms = state.synonyms.filter(s => s.isDesadaptative).length;
  const totalAntonyms = state.antonyms.length;
  const desadaptativeAntonyms = state.antonyms.filter(a => a.isDesadaptative).length;
  const totalItems = totalSynonyms + totalAntonyms || 1;
  const totalDesadaptative = desadaptativeSynonyms + desadaptativeAntonyms;

  // Let's compute a Semantic Restructuring Index (SRI) / IDS (Índice de Dissociação Semântica)
  // Higher index comes from having dismantled dysfunctional assumptions (by adding explanations) 
  // and having a healthy reformulated definition.
  const explainedItems = [
    ...state.synonyms.filter(s => s.isDesadaptative && s.explanation && s.explanation.length > 5),
    ...state.antonyms.filter(a => a.isDesadaptative && a.explanation && a.explanation.length > 5)
  ].length;

  const semanticDissociationIndex = Math.min(100, Math.round(
    (totalDesadaptative > 0 ? (explainedItems / totalDesadaptative) * 50 : 30) + 
    (Math.min(3, state.socraticQuestions.filter(q => q.answer.length > 10).length) * 10) +
    (state.healthyDefinition.length > 20 ? 20 : 0)
  ));

  return (
    <div className="space-y-6 animate-fadeIn" id="reestruturacao-semantica-root">
      
      {/* Informative Header Banner */}
      <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl text-xs text-purple-300 space-y-1 block" id="header-clinical-banner">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">📖 REESTRUTURAÇÃO SEMÂNTICA</strong>
        <span className="text-gray-400">
          A linguagem molda as nossas crenças fundamentais. Através da história de vida, colecionamos ideias rígidas associadas a palavras de grande impacto (ex: "Ser Racional", "Felicidade", "Prosperidade"). 
          Esta intervenção permite mapear as teias conceituais do paciente, isolar os preconceitos ou <strong>rótulos errôneos</strong> disfuncionais e aplicar o debate socrático para separar as regras neurotizantes das definições saudáveis.
        </span>
      </div>

      {/* Patient Meta Context Header */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="metadata-patient-bar">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Anônimo"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">HP Desenvolvida</span>
          <div className="text-emerald-400 font-sans text-xs font-bold py-1 block flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Raciocínio Realístico-Otimista
          </div>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Enfoque Psicopedagógico</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Diferenciação Linguística & Flexibilização Conceitual</div>
        </div>
      </div>

      {/* Direct Presets Quick Load */}
      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 space-y-2" id="presets-panel">
        <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-wider block flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          ⚡ Modelos Clínicos de Diagnóstico Comum (Selecione um para testar e preencher automaticamente):
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-[10.5px] font-sans font-medium px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-purple-500 hover:bg-purple-950/10 transition-all cursor-pointer block"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Central Target Term Definition */}
      <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 space-y-4" id="central-term-config">
        <div>
          <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-purple-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-400" />
            Definição do Termo Alvo da Investigação Conceitual
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Qual palavra ou ideal de vida gera sentimentos ambivalentes, autocobranças impiedosas ou regras inflexíveis para o paciente?</p>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-gray-400 font-sans text-[11px] font-bold uppercase tracking-wider block">TERMO INVESTIGADO:</label>
          <input
            type="text"
            value={state.term}
            onChange={(e) => setState(prev => ({ ...prev, term: e.target.value }))}
            placeholder="Ex: Ser Racional, Ser Forte, Sucesso, Felicidade, Ser uma Mãe Perfeita..."
            className="w-full max-w-lg px-3 py-2 bg-gray-950 border border-gray-900 rounded-xl text-white text-xs outline-none focus:ring-1 focus:ring-purple-500 font-sans"
            id="term-input-field"
          />
        </div>
      </div>

      {/* Main Dual Columns Panel: Synonyms vs Antonyms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="semantic-columns-grid">
        
        {/* Column A: Synonyms & Associates */}
        <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col space-y-4" id="synonyms-card">
          <div className="border-b border-gray-900 pb-2.5">
            <h4 className="text-xs font-bold uppercase font-mono text-purple-400 tracking-wider flex items-center gap-1">
              🧬 Sinônimos e Termos Associados
            </h4>
            <p className="text-[10px] text-gray-500">O que o paciente associa inconsciente ou conscientemente com "{state.term || "este termo"}"?</p>
          </div>

          {/* Synonym input form */}
          <form onSubmit={handleAddSynonym} className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs" id="syn-adder-form">
            <div className="md:col-span-8">
              <input
                type="text"
                value={newSynonym}
                onChange={(e) => setNewSynonym(e.target.value)}
                placeholder="Ex. Ser frio, calculista, insensível..."
                className="w-full px-3 py-1.5 bg-gray-950 border border-gray-900 rounded-xl text-white outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
            </div>
            
            <div className="md:col-span-3 flex items-center gap-1 text-[10px] cursor-pointer" onClick={() => setNewSynonymIsDes(!newSynonymIsDes)}>
              <input
                type="checkbox"
                checked={newSynonymIsDes}
                onChange={() => {}} // handled by click of container
                className="rounded text-red-500 bg-gray-950 border-gray-900 accent-red-500"
              />
              <span className={`${newSynonymIsDes ? "text-red-400 font-bold" : "text-gray-500"}`}>Distorção?</span>
            </div>

            <button
              type="submit"
              className="md:col-span-1 px-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all font-bold text-center block py-1.5"
            >
              +
            </button>
          </form>

          {/* List of items */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1" id="synonyms-scroller">
            {state.synonyms.length > 0 ? (
              state.synonyms.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-xl border flex flex-col space-y-2 transition-all ${
                    item.isDesadaptative 
                      ? "bg-red-500/[0.015] border-red-500/20 hover:border-red-500/30" 
                      : "bg-gray-950/45 border-gray-870 hover:border-purple-500/30"
                  }`}
                  id={`synonym-item-${item.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isDesadaptative ? "bg-red-500" : "bg-emerald-400"}`} />
                      <span className="text-xs text-gray-200 font-semibold font-sans">{item.text}</span>
                      {item.isDesadaptative && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold uppercase tracking-wider border border-red-500/10">
                          Distorção Semântica
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.isDesadaptative && (
                        <button
                          type="button"
                          onClick={() => startEditExplanation(item)}
                          className="text-[10px] text-purple-400 font-semibold hover:underline block"
                        >
                          {item.explanation ? "Editar contestação" : "💡 Debater socrático..."}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveSynonym(item.id)}
                        className="text-gray-650 hover:text-red-500 ml-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingItemId === item.id ? (
                    <div className="p-2.5 bg-gray-950 border border-gray-900 rounded-lg space-y-2 text-xs">
                      <label className="text-purple-400 font-bold text-[10px] block uppercase">Contestação Racional / Significado Real:</label>
                      <textarea
                        value={tempExplanation}
                        onChange={(e) => setTempExplanation(e.target.value)}
                        placeholder="Ex: Como desvincular esse rótulo limitante do termo investigado?"
                        className="w-full p-2 bg-gray-900 text-xs rounded border border-gray-800 text-white focus:outline-none min-h-[60px]"
                      />
                      <div className="flex justify-end gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="px-2 py-1 rounded bg-gray-900 text-gray-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => saveExplanation(item.id, true)}
                          className="px-2.5 py-1 rounded bg-purple-500 text-black font-semibold"
                        >
                          Gravar
                        </button>
                      </div>
                    </div>
                  ) : item.explanation ? (
                    <div className="mt-1 p-2 bg-purple-500/5 rounded-lg border border-purple-500/10 text-[10px] text-purple-300 leading-snug">
                      <strong className="text-purple-400 block uppercase text-[8px] tracking-wider mb-0.5">🛡️ Contestação Clínica / Significado Reconstruído:</strong>
                      {item.explanation}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-600 font-mono text-[9px] italic border border-dashed border-gray-900 rounded-xl" id="syn-empty">
                Nenhum sinônimo listado. Digite regras ou associações recorrentes no formulário acima.
              </div>
            )}
          </div>
        </div>

        {/* Column B: Antonyms & Associates */}
        <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col space-y-4" id="antonyms-card">
          <div className="border-b border-gray-900 pb-2.5">
            <h4 className="text-xs font-bold uppercase font-mono text-emerald-400 tracking-wider flex items-center gap-1">
              🛡️ Antônimos e Opostos Associados
            </h4>
            <p className="text-[10px] text-gray-500">O que o paciente mapeia como oposto ou incompatível com "{state.term || "este termo"}"?</p>
          </div>

          {/* Antonym input form */}
          <form onSubmit={handleAddAntonym} className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs" id="ant-adder-form">
            <div className="md:col-span-8">
              <input
                type="text"
                value={newAntonym}
                onChange={(e) => setNewAntonym(e.target.value)}
                placeholder="Ex. Ser emocional, vulnerável, frouxo..."
                className="w-full px-3 py-1.5 bg-gray-950 border border-gray-900 rounded-xl text-white outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>
            
            <div className="md:col-span-3 flex items-center gap-1 text-[10px] cursor-pointer" onClick={() => setNewAntonymIsDes(!newAntonymIsDes)}>
              <input
                type="checkbox"
                checked={newAntonymIsDes}
                onChange={() => {}} // handled by click
                className="rounded text-red-500 bg-gray-950 border-gray-900 accent-red-500"
              />
              <span className={`${newAntonymIsDes ? "text-red-400 font-bold" : "text-gray-500"}`}>Distorção?</span>
            </div>

            <button
              type="submit"
              className="md:col-span-1 px-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all font-bold text-center block py-1.5"
            >
              +
            </button>
          </form>

          {/* List of antonyms */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1" id="antonyms-scroller">
            {state.antonyms.length > 0 ? (
              state.antonyms.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-xl border flex flex-col space-y-2 transition-all ${
                    item.isDesadaptative 
                      ? "bg-red-500/[0.015] border-red-500/20 hover:border-red-500/30" 
                      : "bg-gray-950/45 border-gray-870 hover:border-emerald-500/30"
                  }`}
                  id={`antonym-item-${item.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isDesadaptative ? "bg-red-500" : "bg-teal-400"}`} />
                      <span className="text-xs text-gray-200 font-semibold font-sans">{item.text}</span>
                      {item.isDesadaptative && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold uppercase tracking-wider border border-red-500/10">
                          Distorção Oposta
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.isDesadaptative && (
                        <button
                          type="button"
                          onClick={() => startEditExplanation(item)}
                          className="text-[10px] text-emerald-400 font-semibold hover:underline block"
                        >
                          {item.explanation ? "Editar contestação" : "💡 Debater socrático..."}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveAntonym(item.id)}
                        className="text-gray-650 hover:text-red-500 ml-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingItemId === item.id ? (
                    <div className="p-2.5 bg-gray-950 border border-gray-900 rounded-lg space-y-2 text-xs">
                      <label className="text-emerald-400 font-bold text-[10px] block uppercase">Contestação Racional / Significado Real:</label>
                      <textarea
                        value={tempExplanation}
                        onChange={(e) => setTempExplanation(e.target.value)}
                        placeholder="Ex: Como desvincular esse rótulo limitante oponente/antagônico?"
                        className="w-full p-2 bg-gray-900 text-xs rounded border border-gray-800 text-white focus:outline-none min-h-[60px]"
                      />
                      <div className="flex justify-end gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="px-2 py-1 rounded bg-gray-900 text-gray-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => saveExplanation(item.id, false)}
                          className="px-2.5 py-1 rounded bg-emerald-500 text-black font-semibold"
                        >
                          Gravar
                        </button>
                      </div>
                    </div>
                  ) : item.explanation ? (
                    <div className="mt-1 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-[10px] text-emerald-300 leading-snug">
                      <strong className="text-emerald-400 block uppercase text-[8px] tracking-wider mb-0.5">🛡️ Contestação Clínica / Significado Reconstruído:</strong>
                      {item.explanation}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-600 font-mono text-[9px] italic border border-dashed border-gray-900 rounded-xl" id="ant-empty">
                Nenhum oposto cadastrado. Insira palavras ou rotulações consideradas incompatíveis para verificação.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Socratic Investigation Desk (Debate Clínico) */}
      <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 space-y-4" id="socratic-deck-panel">
        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
          <div>
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-purple-400 flex items-center gap-1.5">
              <QuestionIcon className="w-4 h-4 text-purple-400" />
              Sessão de Questionamento Socrático (Desfusão Cognitiva)
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Investigue ativamente as crenças geradas pela fusão semântica errada. Estimule o paciente a formular fatos reconciliadores.</p>
          </div>

          <button
            type="button"
            onClick={handleAddSocratic}
            className="px-3 py-1 text-[10px] rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/25 transition-all font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Pergunta</span>
          </button>
        </div>

        <div className="space-y-4" id="socratic-list-container">
          {state.socraticQuestions.length > 0 ? (
            state.socraticQuestions.map((q, idx) => (
              <div key={idx} className="p-4 bg-gray-950/60 rounded-xl border border-gray-900 space-y-3 relative font-sans text-xs">
                <button
                  type="button"
                  onClick={() => handleRemoveSocratic(idx)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-red-500 cursor-pointer pt-0.5 transition-colors"
                  title="Excluir pergunta socrática"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1 pr-6">
                  <span className="text-[9px] uppercase font-mono font-bold text-purple-400 block">Pergunta Clínica #{idx + 1}:</span>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleUpdateSocratic(idx, "question", e.target.value)}
                    className="w-full bg-transparent border-b border-gray-900 py-1 font-semibold text-gray-200 outline-none focus:border-purple-500 text-xs text-ellipsis block"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono font-bold text-gray-500 block">Resposta Analítica do Paciente:</span>
                  <textarea
                    value={q.answer}
                    onChange={(e) => handleUpdateSocratic(idx, "answer", e.target.value)}
                    placeholder="Digite a resposta ou transcrição da sessão clínica..."
                    className="w-full bg-gray-950 border border-gray-870 p-2 text-xs rounded-lg text-white font-sans focus:outline-none focus:ring-1 focus:ring-purple-500 block min-h-[60px]"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-600 font-mono text-[9px] italic border border-dashed border-gray-900 rounded-xl" id="soc-empty">
              Nenhuma pergunta de debate socrático cadastrada para este termo. Use as opções acima.
            </div>
          )}
        </div>
      </div>

      {/* Reconstructed Adaptive Semantic Definition */}
      <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 space-y-4 shadow-purple" id="healthy-synthesis-card">
        <div className="border-b border-gray-900 pb-2">
          <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            Nova Definição Semântica Saudável (O Veredito Flexibilizado)
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Após a quebra de fusão, qual a nova concepção pragmática e realista que o paciente decide adotar no seu vocabulário diário?</p>
        </div>

        <div className="space-y-4">
          <textarea
            value={state.healthyDefinition}
            onChange={(e) => setState(prev => ({ ...prev, healthyDefinition: e.target.value }))}
            placeholder="Ex: Racionalidade de verdade significa ajustar expectativas e agir de acordo com valores, mantendo flexibilidade para acolher as flutuações das opiniões e sentimentos..."
            className="w-full min-h-[100px] p-2.5 bg-gray-950 border border-gray-900 text-xs rounded-xl text-white outline-none focus:ring-1 focus:ring-emerald-500 font-sans block"
          />

          {/* Core Analytics Card */}
          <div className="bg-gray-950/60 rounded-xl border border-gray-900 p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center" id="score-summary-bar">
            
            {/* Split and explain metrics */}
            <div className="md:col-span-8 grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-950 border border-gray-900 p-2.5 rounded-lg space-y-0.5">
                <span className="text-gray-500 font-mono text-[9px] uppercase block">Distorções Identificadas:</span>
                <span className="font-mono text-sm font-bold text-red-400 block">{totalDesadaptative} termos</span>
                <span className="text-[8.5px] text-gray-650 font-sans block">Associações desadaptadas fóbicas</span>
              </div>
              <div className="bg-gray-950 border border-gray-900 p-2.5 rounded-lg space-y-0.5">
                <span className="text-gray-500 font-mono text-[9px] uppercase block">Rótulos Resignificados:</span>
                <span className="font-mono text-sm font-bold text-emerald-400 block">{explainedItems} elaborações</span>
                <span className="text-[8.5px] text-gray-650 font-sans block">Contestações sólidas arquivadas</span>
              </div>
            </div>

            <div className="md:col-span-4 bg-gray-950/90 border border-gray-870 p-3 rounded-lg flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-purple-400 font-mono text-[9px] font-bold uppercase block">Índice de Dissociação (IDS):</span>
                <span className="text-[10px] text-gray-300 leading-tight block">Nível de quebra de fusão linguística</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold text-purple-400 block">{semanticDissociationIndex}%</span>
                {semanticDissociationIndex >= 75 ? (
                  <span className="text-[8px] text-emerald-400 uppercase font-bold px-1 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono">Alta Dissociação</span>
                ) : semanticDissociationIndex >= 45 ? (
                  <span className="text-[8px] text-yellow-500 uppercase font-bold px-1 rounded bg-yellow-500/10 border border-yellow-500/20 font-mono">Dissociação Moderada</span>
                ) : (
                  <span className="text-[8px] text-red-400 uppercase font-bold px-1 rounded bg-red-500/10 border border-red-500/20 font-mono">Fusão Rígida</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
