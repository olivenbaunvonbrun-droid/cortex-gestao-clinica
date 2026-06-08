import React, { useState } from "react";
import { PatientInfo } from "../types";
import { ClinicalSuggestionsButton } from "./ClinicalSuggestionsHelper";
import { 
  Scale, BrainCircuit, Heart, Plus, Trash2, Edit3, CheckCircle, 
  HelpCircle, AlertCircle, Info, Sparkles, Award, ArrowRight, ShieldCheck 
} from "lucide-react";

export interface AlternativeThoughtItem {
  id: string;
  text: string;
  beliefPercentage: number; // 0-100%
}

export interface CognitiveEvidenceState {
  belief: string;
  initialBeliefPercentage: number; // 0-100%
  currentBeliefPercentage: number; // 0-100% after process
  evidenceFor: string[];
  evidenceAgainst: string[];
  alternativeThoughts: AlternativeThoughtItem[];
  balancedConclusion: string;
}

interface ExameEvidenciasCognicaoViewProps {
  patient: PatientInfo;
  state: CognitiveEvidenceState;
  setState: React.Dispatch<React.SetStateAction<CognitiveEvidenceState>>;
}

export default function ExameEvidenciasCognicaoView({
  patient,
  state,
  setState
}: ExameEvidenciasCognicaoViewProps) {
  const [newEvidenceFor, setNewEvidenceFor] = useState("");
  const [newEvidenceAgainst, setNewEvidenceAgainst] = useState("");
  const [newAltThought, setNewAltThought] = useState("");
  const [newAltBeliefPercent, setNewAltBeliefPercent] = useState(50);
  
  const [mode, setMode] = useState<"court" | "standard">("court");
  const [isAddingAltThought, setIsAddingAltThought] = useState(false);

  // Helper functions to update state
  const handleUpdateBelief = (val: string) => {
    setState(prev => ({ ...prev, belief: val }));
  };

  const handleUpdateInitialPercent = (val: number) => {
    setState(prev => ({ ...prev, initialBeliefPercentage: val }));
  };

  const handleUpdateCurrentPercent = (val: number) => {
    setState(prev => ({ ...prev, currentBeliefPercentage: val }));
  };

  const handleUpdateConclusion = (val: string) => {
    setState(prev => ({ ...prev, balancedConclusion: val }));
  };

  const handleAddEvidenceFor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceFor.trim()) return;
    setState(prev => ({
      ...prev,
      evidenceFor: [...prev.evidenceFor, newEvidenceFor.trim()]
    }));
    setNewEvidenceFor("");
  };

  const handleRemoveEvidenceFor = (index: number) => {
    setState(prev => ({
      ...prev,
      evidenceFor: prev.evidenceFor.filter((_, i) => i !== index)
    }));
  };

  const handleAddEvidenceAgainst = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceAgainst.trim()) return;
    setState(prev => ({
      ...prev,
      evidenceAgainst: [...prev.evidenceAgainst, newEvidenceAgainst.trim()]
    }));
    setNewEvidenceAgainst("");
  };

  const handleRemoveEvidenceAgainst = (index: number) => {
    setState(prev => ({
      ...prev,
      evidenceAgainst: prev.evidenceAgainst.filter((_, i) => i !== index)
    }));
  };

  const handleAddAltThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAltThought.trim()) return;
    const newItem: AlternativeThoughtItem = {
      id: "alt_" + Date.now(),
      text: newAltThought.trim(),
      beliefPercentage: newAltBeliefPercent
    };
    setState(prev => ({
      ...prev,
      alternativeThoughts: [...prev.alternativeThoughts, newItem]
    }));
    setNewAltThought("");
    setNewAltBeliefPercent(50);
    setIsAddingAltThought(false);
  };

  const handleRemoveAltThought = (id: string) => {
    setState(prev => ({
      ...prev,
      alternativeThoughts: prev.alternativeThoughts.filter(item => item.id !== id)
    }));
  };

  const handleUpdateAltThoughtPercent = (id: string, percent: number) => {
    setState(prev => ({
      ...prev,
      alternativeThoughts: prev.alternativeThoughts.map(item => 
        item.id === id ? { ...item, beliefPercentage: percent } : item
      )
    }));
  };

  // Pre-seed some templates based on common core schemas to facilitate clinician entry
  const SEED_TEMPLATES = [
    {
      label: "Incompetência ('Não darei conta')",
      belief: "Sou incapaz de lidar com novos desafios profissionais sozinho e cometerei erros fatais.",
      evidenceFor: ["Cometi um erro de digitação no relatório final da semana passada", "Gastei mais de 4 horas extras para terminar a última planilha"],
      evidenceAgainst: ["Entreguei o projeto no prazo definido nas últimas 4 semanas", "Tenho graduação completa e fui bem avaliado no processo seletivo", "Meus colegas me procuram com frequência para tirar dúvidas de sistemas de informática"],
      alternative: "Tenho capacidades sólidas para gerenciar novos desafios profissionais, e os erros ocasionais são normais e passíveis de correção técnica."
    },
    {
      label: "Defectividade ('Sou quebrado / Inadequado')",
      belief: "As pessoas vão me achar estranho ou imaturo se eu falar o que realmente sinto nas relações.",
      evidenceFor: ["Fiquei gaguejando por alguns segundos na reunião de ontem", "Meu colega não respondeu minha última mensagem no WhatsApp imediatamente"],
      evidenceAgainst: ["Recebi um convite positivo de aniversário dos amigos na semana passada", "Minha psicóloga e meu melhor amigo ouvem meus sentimentos sem zombar ou me afastar", "Tenho relações duradouras onde as pessoas valorizam minha honestidade"],
      alternative: "Expressar meus sentimentos aproxima relações saudáveis, e as poucas pessoas que rejeitarem isso refletem os próprios limites delas."
    },
    {
      label: "Fracasso ('Vou falhar em tudo')",
      belief: "Estou destinado ao fracasso acadêmico ou profissional total no próximo exame.",
      evidenceFor: ["Tirei nota baixa (6.0) na prova simulada preliminar", "Esqueci o nome de um autor importante no seminário de discussão"],
      evidenceAgainst: ["Já fui aprovado em dezenas de disciplinas difíceis no passado", "Estou estudando de 2 a 3 horas constantes todos os dias com cronograma ativo", "A média de aprovação geral no curso é alcançável para quem realiza as tarefas regulares em dia"],
      alternative: "O desempenho no exame depende do meu preparo atual acumulado, e não de uma profecia de fracasso absoluto preestabelecido."
    }
  ];

  const applyTemplate = (tpl: typeof SEED_TEMPLATES[0]) => {
    if (confirm("Deseja substituir as informações atuais por este modelo de exemplo clínico? (O conteúdo digitado será perdido)")) {
      setState({
        belief: tpl.belief,
        initialBeliefPercentage: 85,
        currentBeliefPercentage: 40,
        evidenceFor: [...tpl.evidenceFor],
        evidenceAgainst: [...tpl.evidenceAgainst],
        alternativeThoughts: [
          { id: "alt_tpl", text: tpl.alternative, beliefPercentage: 70 }
        ],
        balancedConclusion: "A análise de fatos demonstra que minha mente foca desproporcionalmente em falhas pontuais, ignorando dezenas de conquistas e atestações de resiliência e amparo técnico. Posso conduzir os desafios agindo pragmaticamente passo a passo."
      });
    }
  };

  // Calculations for indexes
  // Belief Flexing Index: change from initial belief to current belief percentage
  const cognitiveFlexibilityDelta = state.initialBeliefPercentage - state.currentBeliefPercentage;
  const cognitiveFlexibilityIndex = Math.max(0, Math.min(100, Math.round(
    (cognitiveFlexibilityDelta > 0 ? (cognitiveFlexibilityDelta / state.initialBeliefPercentage) * 100 : 0) + 
    (Math.min(5, state.evidenceAgainst.length) * 10) +
    (state.alternativeThoughts.length * 15)
  )));

  // Balance of evidence
  const totalFor = state.evidenceFor.length;
  const totalAgainst = state.evidenceAgainst.length;
  const totalEv = totalFor + totalAgainst || 1;
  const forPercent = Math.round((totalFor / totalEv) * 100);
  const againstPercent = Math.round((totalAgainst / totalEv) * 100);

  return (
    <div className="space-y-6 animate-fadeIn" id="exame-evidencias-root">
      
      {/* Clinician Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-xs text-blue-300 space-y-1 block" id="exame-evidencias-banner">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">⚖️ EXAME DE EVIDÊNCIAS DA COGNIÇÃO</strong>
        <span className="text-gray-400">
          Esta ferramenta atua como um laboratório ou tribunal cognitivo. Ela ensina o cliente a submeter pensamentos distorcidos ou predições catastróficas ao crivo da realidade empírica. 
          O objetivo é colocar frente a frente o <strong>Acusador</strong> (pensamento distorcido, focado em filtrar e superestimar falhas) e o <strong>Defensor</strong> (racionalidade focada em dados e competências de superação). 
          Foque estritamente em <strong>fatos históricos reais e comprováveis</strong>, e evite interpretações abstratas!
        </span>
      </div>

      {/* Facilitator Bar Client info */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="metadata-bar">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente / Cliente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Anônimo"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Psicólogo Assistente</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Dr. Lincoln Poubel</div>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Objetivo Psicoterapêutico</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Raciocínio Realista-Otimista & Flexibilização de Regras Rígidas</div>
        </div>
      </div>

      {/* Fast Seed Clinical Templates */}
      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 space-y-2" id="templates-section">
        <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider block">⚡ Modelos Rápidos de Exemplos Clínicos:</span>
        <div className="flex flex-wrap gap-2">
          {SEED_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="text-[10px] font-sans px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-[#00A3FF] transition-all"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dual interaction mode selector */}
      <div className="flex items-center justify-between border-b border-gray-900 pb-2" id="interaction-tabs">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("court")}
            className={`px-3.5 py-1.5 text-xs font-sans font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              mode === "court" 
                ? "bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/35 font-bold shadow" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Formato de Tribunal Simulado (Mais recomendável)</span>
          </button>
          <button
            onClick={() => setMode("standard")}
            className={`px-3.5 py-1.5 text-xs font-sans font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              mode === "standard" 
                ? "bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/35 font-bold shadow" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Formato de Tabela Clássica</span>
          </button>
        </div>
      </div>

      {/* Core belief panel */}
      <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 space-y-4" id="belief-setup-panel">
        <div>
          <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-[#00A3FF] flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Definição da Crença ou Pensamento Automático a ser Examinado
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Identifique um pensamento perturbador recorrente (ex: "Não vou conseguir dar conta de nada em meu novo emprego" ou "As pessoas me acham desinteressante").</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 flex flex-col space-y-1">
            <div className="flex justify-between items-center bg-transparent mb-1 flex-wrap gap-2">
              <label className="text-gray-400 font-sans text-[11px] font-bold uppercase block tracking-wider">CRENÇA / PENSAMENTO DISFUNCIONAL:</label>
              <ClinicalSuggestionsButton
                category="crencas_centrais"
                onSelectSuggestion={(val) => handleUpdateBelief(val)}
              />
            </div>
            <input
              type="text"
              value={state.belief}
              onChange={(e) => handleUpdateBelief(e.target.value)}
              placeholder="Digite o pensamento fóbico ou crença limitante aqui..."
              className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-xl text-white text-xs outline-none focus:ring-1 focus:ring-[#00A3FF] font-sans"
              id="inp-belief-text"
            />
          </div>

          <div className="md:col-span-4 flex flex-col justify-end space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span className="font-bold flex items-center gap-1">
                Convicção Inicial:
                <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" title="De 0 a 100%, o quão verdadeiro esse pensamento parece para você hoje emocionalmente?" />
              </span>
              <strong className="text-red-400 font-mono text-sm">{state.initialBeliefPercentage}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={state.initialBeliefPercentage}
              onChange={(e) => handleUpdateInitialPercent(parseInt(e.target.value))}
              className="w-full accent-red-500 cursor-pointer bg-gray-950 h-1.5 rounded"
            />
            <span className="text-[9px] text-gray-600 block text-right font-mono">(Antes da análise factual)</span>
          </div>
        </div>
      </div>

      {mode === "court" && (
        <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed" id="courtroom-roles">
          <div className="space-y-1 border-r border-gray-900 pr-3">
            <span className="text-red-400 font-bold uppercase text-[10px] tracking-wider block">⚖️ O ACUSADOR (Distorção)</span>
            <p className="text-gray-400 text-[10px]">
              Tenta sustentar a acusação a qualquer custo. Ele reúne fatos para provar que a crença de insuficiência é real, mas costuma inflar a gravidade das evidências e ignorar atenuantes.
            </p>
          </div>
          <div className="space-y-1 border-r border-gray-900 px-3">
            <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider block">🛡️ O DEFENSOR (Racionalidade)</span>
            <p className="text-gray-400 text-[10px]">
              Contesta os argumentos do acusador apresentando provas contrárias irrebatíveis da história de superação, realizações, e resiliências do cliente. Baseia-se exclusivamente em fatos observáveis.
            </p>
          </div>
          <div className="space-y-1 pl-3">
            <span className="text-purple-400 font-bold uppercase text-[10px] tracking-wider block">🎓 O JUIZ (Equilíbrio Cognitivo)</span>
            <p className="text-gray-400 text-[10px]">
              O próprio paciente e terapeuta ponderam o peso relativo das evidências coletadas e redigem uma síntese jurídica fundamentada — a visão realista, otimista e flexível.
            </p>
          </div>
        </div>
      )}

      {/* Main Dual Columns Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="exame-columns-body">
        
        {/* Column A Favor (Prosecution / Core Facts For) */}
        <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col space-y-4" id="col-for">
          <div className="border-b border-gray-900 pb-2 flex justify-between items-center bg-red-500/[0.02] p-2.5 rounded-lg border border-red-500/10">
            <div>
              <h4 className="text-xs font-bold uppercase font-mono text-red-400 tracking-wider flex items-center gap-1">
                📥 Evidências A Favor da Crença
              </h4>
              <p className="text-[10px] text-gray-500">Quais fatos concretos dão suporte a esse pensamento automatico?</p>
            </div>
            {mode === "court" && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-black border border-red-500/20 uppercase">
                Acusador
              </span>
            )}
          </div>

          {/* Form to add */}
          <form onSubmit={handleAddEvidenceFor} className="flex gap-2 text-xs" id="form-add-for">
            <input
              type="text"
              value={newEvidenceFor}
              onChange={(e) => setNewEvidenceFor(e.target.value)}
              placeholder="Digite um fato objetivo em favor (ex: Cometi um erro no relatório)"
              className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-900 rounded-xl text-white outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              type="submit"
              className="px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-bold block"
            >
              Add
            </button>
          </form>

          {/* List of items */}
          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1" id="list-evidences-for">
            {state.evidenceFor.length > 0 ? (
              state.evidenceFor.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start justify-between p-2.5 bg-gray-950/45 rounded-xl border border-gray-870 hover:border-red-500/30 transition-all text-xs"
                  id={`ev-for-${index}`}
                >
                  <p className="text-gray-300 flex-1 leading-snug">
                    📌 {item}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidenceFor(index)}
                    className="text-gray-650 hover:text-red-500 ml-2 cursor-pointer pt-0.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600 font-mono text-[9px] italic border border-dashed border-gray-900 rounded-xl" id="empty-for">
                Nenhuma evidência a favor listada. Insira um fato acima para simular a acusação.
              </div>
            )}
          </div>
          <div className="text-[10px] text-gray-500 italic bg-gray-950/20 p-2.5 rounded-lg border border-gray-900">
            <strong>⚠️ Atenção:</strong> Adicione apenas fatos frios. Interpretações generalizadas ("Sou sempre idiota", "Isso prova que as pessoas me odeiam") devem ser desconsideradas pelo terapeuta.
          </div>
        </div>

        {/* Column Contra (Defense / Contra-Facts) */}
        <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 flex flex-col space-y-4" id="col-against">
          <div className="border-b border-gray-900 pb-2 flex justify-between items-center bg-emerald-500/[0.02] p-2.5 rounded-lg border border-emerald-500/10">
            <div>
              <h4 className="text-xs font-bold uppercase font-mono text-emerald-400 tracking-wider flex items-center gap-1">
                📤 Evidências Contra a Crença
              </h4>
              <p className="text-[10px] text-gray-500">Quais fatos contrariam esse pensamento disfuncional?</p>
            </div>
            {mode === "court" && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-black border border-emerald-500/20 uppercase">
                Defensor
              </span>
            )}
          </div>

          {/* Form to add */}
          <form onSubmit={handleAddEvidenceAgainst} className="flex gap-2 text-xs" id="form-add-against">
            <input
              type="text"
              value={newEvidenceAgainst}
              onChange={(e) => setNewEvidenceAgainst(e.target.value)}
              placeholder="Digite um fato objetivo contra (ex: Consegui resolver outros 10 problemas)"
              className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-900 rounded-xl text-white outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all font-bold block"
            >
              Add
            </button>
          </form>

          {/* List of contra items */}
          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1" id="list-evidences-against">
            {state.evidenceAgainst.length > 0 ? (
              state.evidenceAgainst.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start justify-between p-2.5 bg-gray-950/45 rounded-xl border border-gray-870 hover:border-emerald-500/30 transition-all text-xs"
                  id={`ev-against-${index}`}
                >
                  <p className="text-gray-300 flex-1 leading-snug">
                    🛡️ {item}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidenceAgainst(index)}
                    className="text-gray-650 hover:text-red-500 ml-2 cursor-pointer pt-0.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-600 font-mono text-[9px] italic border border-dashed border-gray-900 rounded-xl" id="empty-against">
                Nenhuma evidência contra listada. Use fatos de sua história para minar a crença.
              </div>
            )}
          </div>
          <div className="text-[10px] text-gray-100 italic bg-[#00A3FF]/5 p-2.5 rounded-lg border border-[#00A3FF]/15">
            <strong>💡 Dica do Defensor:</strong> Procure por exceções na rotina ("aconteceu apenas uma vez", "outras pessoas lidaram bem"), competências anteriores ("já resolvi rotinas parecidas no semestre passado") e fatos lógicos.
          </div>
        </div>

      </div>

      {/* Dynamic Weight Analysis */}
      <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 space-y-4" id="evidence-weight-analysis">
        <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-[#00A3FF]">📊 Balanço da Balança Factual</h3>
        <p className="text-[10px] text-gray-500">Representação visual do volume de provas objetivas coletadas por ambas as partes</p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-red-400 font-bold flex items-center gap-1">
                Acusador / A Favor: {totalFor} fatos ({forPercent}%)
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                Defensor / Contra: {totalAgainst} fatos ({againstPercent}%)
              </span>
            </div>

            {/* Split progress bar */}
            <div className="w-full bg-gray-950 h-3.5 rounded-full overflow-hidden flex border border-gray-900">
              {totalFor === 0 && totalAgainst === 0 ? (
                <div className="w-full text-center text-[9px] text-gray-600 font-bold font-mono pt-0.5 uppercase">Balança sem dados para pesagem...</div>
              ) : (
                <>
                  <div 
                    className="bg-red-500/80 h-full rounded-l-full transition-all duration-300" 
                    style={{ width: `${forPercent}%` }}
                  />
                  <div 
                    className="bg-emerald-500/80 h-full rounded-r-full transition-all duration-300" 
                    style={{ width: `${againstPercent}%` }}
                  />
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-4 bg-gray-950/50 border border-gray-900 p-3 rounded-xl flex flex-col justify-center items-center text-center space-y-1">
            <span className="text-[9px] text-gray-500 font-mono block uppercase">Veredito Provável da Balança:</span>
            {totalAgainst > totalFor ? (
              <span className="text-xs font-bold font-sans text-emerald-400 flex items-center gap-1 leading-normal uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Crença Altamente Insolúvel (Refutada)
              </span>
            ) : totalAgainst === totalFor && totalAgainst > 0 ? (
              <span className="text-xs font-bold font-sans text-yellow-500 flex items-center gap-1 leading-normal uppercase">
                Análise com Impasse Factual
              </span>
            ) : totalFor > 0 ? (
              <span className="text-xs font-bold font-sans text-red-400 flex items-center gap-1 leading-normal uppercase">
                Foco Seletivo na Acusação
              </span>
            ) : (
              <span className="text-xs font-bold font-sans text-gray-500 flex items-center gap-1 leading-normal uppercase">
                Aguardando Provas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alternative thoughts form */}
      <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 space-y-4" id="alt-thoughts-panel">
        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
          <div>
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Estágio 2: Formulação de Pensamentos Alternativos Saudáveis
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Baseado nas evidências colhidas contra o pensamento automático, formule reinterpretações realistas e adaptativas.</p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsAddingAltThought(!isAddingAltThought)}
            className="px-3 py-1 text-[10px] rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/25 transition-all font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Alternativa</span>
          </button>
        </div>

        {isAddingAltThought && (
          <form onSubmit={handleAddAltThought} className="p-4 bg-gray-950/60 rounded-xl border border-gray-900 space-y-4" id="form-add-alt-thought">
            <h4 className="text-[11px] font-sans font-bold uppercase text-purple-400">Novo Pensamento Alternativo</h4>
            <div className="space-y-1">
              <label className="text-gray-400 text-xs font-medium block">Como eu posso formular esse cenário de modo realista e equilibrado?</label>
              <input
                type="text"
                value={newAltThought}
                onChange={(e) => setNewAltThought(e.target.value)}
                placeholder="Ex. Embora o início no emprego seja difícil e eu vá errar, tenho apoio e recursos para aprender e crescer no ritmo..."
                className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="font-semibold block">Nível de convicção subjetiva no novo pensamento alternativo:</span>
                <strong className="text-purple-400 font-mono">{newAltBeliefPercent}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={newAltBeliefPercent}
                onChange={(e) => setNewAltBeliefPercent(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer bg-gray-950 h-1.5 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setIsAddingAltThought(false)}
                className="px-3 py-1.5 rounded-lg bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-purple-500 text-black font-semibold hover:bg-purple-400 transition-all font-sans"
              >
                Salvar Pensamento Alternativo
              </button>
            </div>
          </form>
        )}

        {/* List of alternative thoughts */}
        <div className="space-y-2" id="alternative-thoughts-list">
          {state.alternativeThoughts.length > 0 ? (
            state.alternativeThoughts.map((item) => (
              <div 
                key={item.id} 
                className="p-3 bg-gray-950/40 rounded-xl border border-gray-900 grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:border-gray-800 transition-all"
                id={`alt-th-${item.id}`}
              >
                <div className="md:col-span-8 space-y-0.5">
                  <span className="text-[9px] font-mono font-bold uppercase text-purple-400 block">💡 Pensamento Alternativo Flexibilizado:</span>
                  <p className="text-xs text-gray-200 leading-snug font-sans">{item.text}</p>
                </div>

                <div className="md:col-span-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>Acredito nisso:</span>
                    <strong className="text-purple-400">{item.beliefPercentage}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.beliefPercentage}
                    onChange={(e) => handleUpdateAltThoughtPercent(item.id, parseInt(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer bg-gray-950 h-1 rounded"
                  />
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveAltThought(item.id)}
                    className="text-gray-650 hover:text-red-500 transition-colors p-1"
                    title="Remover este pensamento alternativo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-600 font-mono text-[9px] italic border border-dashed border-gray-900 rounded-xl" id="empty-alt-thoughts">
              Nenhum pensamento alternativo cadastrado ainda. Use os fatos colhidos contra a crença limitante para construir alternativas!
            </div>
          )}
        </div>
      </div>

      {/* Synthesis / Veredito do Juiz */}
      <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 space-y-4 shadow-teal" id="synthesis-panel">
        <div className="border-b border-gray-900 pb-2">
          <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            Estágio 3: Veredito e Síntese Integradora (Visão Equilibrada)
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Conclua o exame redigindo um veredito jurídico com base exclusivamente nas provas do processo. Que nova visão prática você decide adotar?</p>
        </div>

        <div className="space-y-3">
          <textarea
            value={state.balancedConclusion}
            onChange={(e) => handleUpdateConclusion(e.target.value)}
            placeholder="Ex: O júri conclui que a crença de incapacidade foi gerada pelo filtro seletivo nas poucas falhas do passado. A farta quantidade de evidências de resiliência e amparo social prova que sou competente para lidar com os novos desafios organizando metas parciais diárias..."
            className="w-full min-h-[100px] p-2.5 bg-gray-950 border border-gray-900 text-xs rounded-xl text-white outline-none focus:ring-1 focus:ring-emerald-500 font-sans block"
          />

          {/* Belief flex percent evaluation after the process */}
          <div className="bg-gray-950/60 rounded-xl border border-gray-900 p-4 grid grid-cols-1 md:grid-cols-2 gap-4" id="after-belief-impact font-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="font-bold flex items-center gap-1 font-sans">
                  Convicção Subjectiva ATUAL na Crença Inicial:
                  <HelpCircle className="w-3" title="Depois de listar as evidências e ler as alternativas, o quanto você ainda acredita emocionalmente no pensamento limitante anterior?" />
                </span>
                <strong className="text-emerald-400 font-mono text-sm">{state.currentBeliefPercentage}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={state.currentBeliefPercentage}
                onChange={(e) => handleUpdateCurrentPercent(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer bg-gray-950 h-1.5 rounded"
              />
              <span className="text-[9px] text-gray-600 font-mono block text-right">(Idealmente após o teste)</span>
            </div>

            <div className="bg-gray-950/90 border border-gray-870 p-3 rounded-lg flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-gray-500 font-mono text-[9px] uppercase block">Índice de Flexibilidade Cognitiva (IFC):</span>
                <span className="text-[10px] text-gray-300 leading-tight block">Avaliação geral de flexibilização de esquemas</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold text-[#00A3FF] block">{cognitiveFlexibilityIndex}%</span>
                {cognitiveFlexibilityIndex >= 70 ? (
                  <span className="text-[8px] text-emerald-400 uppercase font-bold px-1 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono">Alta Robustez</span>
                ) : cognitiveFlexibilityIndex >= 40 ? (
                  <span className="text-[8px] text-yellow-500 uppercase font-bold px-1 rounded bg-yellow-500/10 border border-yellow-500/20 font-mono">Modera Labilidade</span>
                ) : (
                  <span className="text-[8px] text-red-400 uppercase font-bold px-1 rounded bg-red-500/10 border border-red-500/20 font-mono">Baixa Flexibilidade</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
