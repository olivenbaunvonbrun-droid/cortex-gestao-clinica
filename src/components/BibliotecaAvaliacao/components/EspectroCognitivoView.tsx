import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Sliders, Plus, Trash2, Sparkles, Award, Eye, Compass, ShieldCheck, 
  CheckSquare, Square, ChevronRight, HelpCircle, Activity, Lightbulb, Target
} from "lucide-react";

export type SpectroColumnKey = "catastrofismo" | "pessimismo" | "realismo" | "otimismo" | "utopismo";

export interface EspectroScenario {
  id: string;
  situation: string; // Situação analisada
  catastrofismo: string; // "Tudo vai sempre dar errado"
  pessimismo: string; // "As coisas tendem a dar errado"
  realismo: string; // "As coisas são o que os fatos mostram"
  otimismo: string; // "As coisas tendem a dar certo"
  utopismo: string; // "Tudo vai sempre dar certo"
  initialBeliefLocation: SpectroColumnKey; // Onde a crença inicial do paciente se localiza
  jointSynthesis: string; // Realismo conjugado com Otimismo (Recomendação Clinica)
  convictionSynthesis: number; // Convicção subjetiva (0 a 100%)
}

export interface EspectroCognitivoState {
  scenarios: EspectroScenario[];
  generalObservations: string;
}

interface EspectroCognitivoViewProps {
  patient: PatientInfo;
  state: EspectroCognitivoState;
  setState: React.Dispatch<React.SetStateAction<EspectroCognitivoState>>;
}

export default function EspectroCognitivoView({
  patient,
  state,
  setState
}: EspectroCognitivoViewProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    state.scenarios.length > 0 ? state.scenarios[0].id : null
  );

  const [viewMode, setViewMode] = useState<"editor" | "sheet">("editor");

  const PRESETS = [
    {
      label: "Falar em Público / Apresentações",
      situation: "Apresentar o resultado anual da empresa para toda a diretoria e conselho administrativo",
      catastrofismo: "Eu vou gaguejar logo na primeira frase, esquecer as informações cruciais, ser vaiado abertamente, mandado embora no mesmo dia e nunca mais conseguirei recolocação profissional no mercado.",
      pessimismo: "É muito provável que eu me sinta extremamente nervoso, faça uma apresentação abaixo da média, as pessoas fiquem entediadas ou façam perguntas difíceis que eu não saberei responder com perfeição.",
      realismo: "Eu já revisei e dominei os slides e conheço os dados do meu setor. Posso sentir algum nervosismo físico normal nos primeiros minutos, mas tenho anotações de apoio, e perguntas difíceis fazem parte de qualquer reunião executiva saudável.",
      otimismo: "O conselho está interessado em entender os números reais, não em me sabotar. Se eu mantiver a calma e conduzir a reunião de forma transparente, as propostas serão bem recebidas e obterei aprovação das diretrizes.",
      utopismo: "Minha apresentação será a mais impecável e memorável da história da corporação. Todos se levantarão para me aplaudir de pé por 10 minutos, serei promovido instantaneamente a vice-presidente no dia seguinte.",
      initialBeliefLocation: "catastrofismo" as SpectroColumnKey,
      jointSynthesis: "Fatos comprovados mostram que conheço o produto e estou preparado. Combinando isso com a expectativa saudável de que eles buscam cooperação, vou iniciar a reunião focado nas soluções práticas, aceitando qualquer frio na barriga provisório.",
      convictionSynthesis: 85
    },
    {
      label: "Iniciar Projeto / Negócio Próprio",
      situation: "Lançar uma marca inovadora de serviços digitais no mercado local",
      catastrofismo: "Vou falir nos primeiros três meses de operação, contrair dívidas bancárias impagáveis que destruirão minhas economias de uma vida, perder minha moradia e ser ridicularizado por todos os meus amigos e parentes.",
      pessimismo: "A economia atual está terrível, o mercado já está totalmente saturado de agências e provavelmente não conseguirei clientes suficientes nem para cobrir as ferramentas básicas de trabalho mensal.",
      realismo: "Qualquer empreendimento possui riscos inerentes de caixa e tempo de maturação. Preciso de um planejamento financeiro inicial bem delimitado para operar com custos reduzidos enquanto valido os primeiros contratos de prestação de serviços.",
      otimismo: "Ao utilizar estratégias direcionadas de captação ativa e apresentar soluções direcionadas a problemas reais de microempresas, as chances de obter uma carteira estável de clientes recorrentes crescem consistentemente a médio prazo.",
      utopismo: "Meu projeto vai viralizar na primeira semana do lançamento, alcançaremos o patamar de unicórnio tecnológico em menos de um ano e eu poderei me aposentar confortavelmente aos 30 anos sem precisar trabalhar nunca mais.",
      initialBeliefLocation: "pessimismo" as SpectroColumnKey,
      jointSynthesis: "Entendo os riscos e delimitei a margem de segurança financeira (realismo). Ao mesmo tempo, confio na minha capacidade de entrega técnica, sabendo que os novos negócios demandam esforço de vendas ativo (otimismo). Esperar sucesso com base em ações diligentes, sem ilusões de ganhos milagrosos.",
      convictionSynthesis: 90
    },
    {
      label: "Socialização / Vulnerabilidade",
      situation: "Convidar um novo colega de trabalho ou ciclo social para sair e compartilhar planos pessoais",
      catastrofismo: "A pessoa vai me humilhar em público, falar para todos no escritório o quanto sou carente e patético, serei banido socialmente de todos os departamentos e me isolarei para sempre em depressão profunda.",
      pessimismo: "Provavelmente a pessoa vai inventar uma desculpa amigável mas esfarrapada, fingir que está ocupada e passar a me evitar nos corredores para não precisar conversar comigo novamente.",
      realismo: "Pessoas possuem agendas individuais, preferências sociais e ritmos de aproximação próprios. Se ela recusar, reflete apenas a rotina ou preferências dela naquele momento, e não um atestado de que sou inadequado ou desinteressante.",
      otimismo: "O colega pareceu cordial e receptivo nas últimas conversas do almoço acadêmico. Há uma ótima possibilidade de aceitar partilhar um momento agradável de café ou conversa livre, fortalecendo nossa conexão cooperativa.",
      utopismo: "A pessoa dirá que eu sou a alma gêmea de amizade que ela procurou a vida inteira, passaremos a nos falar de hora em hora e ela resolverá todos os meus problemas de fobia e solidão existencial imediata.",
      initialBeliefLocation: "pessimismo" as SpectroColumnKey,
      jointSynthesis: "Fatos provam que a cordialidade mútua já existe (realismo). Escolho esperar um resultado agradável com energia positiva (otimismo), compreendendo e acolhendo com maturidade emocional que uma eventual indisponibilidade de horário faz parte das interações normais.",
      convictionSynthesis: 80
    }
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (confirm("Gostaria de carregar este preset clínico estruturado? Isso criará um novo cenário de análise no espectro cognitivo do paciente.")) {
      const newId = "scen_" + Date.now();
      const newScenario: EspectroScenario = {
        id: newId,
        situation: preset.situation,
        catastrofismo: preset.catastrofismo,
        pessimismo: preset.pessimismo,
        realismo: preset.realismo,
        otimismo: preset.otimismo,
        utopismo: preset.utopismo,
        initialBeliefLocation: preset.initialBeliefLocation,
        jointSynthesis: preset.jointSynthesis,
        convictionSynthesis: preset.convictionSynthesis
      };
      setState(prev => ({
        ...prev,
        scenarios: [...prev.scenarios, newScenario]
      }));
      setSelectedScenarioId(newId);
    }
  };

  const handleCreateNewScenario = () => {
    const newId = "scen_" + Date.now();
    const newScenario: EspectroScenario = {
      id: newId,
      situation: "Ex: Falar com o cônjuge sobre problemas financeiros...",
      catastrofismo: "Tudo vai sempre dar errado: Ele vai pedir divórcio, nos odiaremos, serei expulso de casa...",
      pessimismo: "As coisas tendem a dar errado: A conversa será muito tensa, ele vai brigar comigo e ficaremos de mal por semanas...",
      realismo: "As coisas são o que os fatos mostram: Temos contas pendentes e discutir isso gera desconforto inicial, mas somos maduros e precisamos nos planejar...",
      otimismo: "As coisas tendem a dar certo: Ao sentarmos com calma e os números na mesa, ele se mostrará cooperativo e acharemos caminhos juntos...",
      utopismo: "Tudo vai sempre dar certo: Ele vai sorrir e dizer que adora dívidas, faturaremos na loteria amanhã e reinará apenas paz e fortuna absoluta...",
      initialBeliefLocation: "pessimismo",
      jointSynthesis: "A nossa realidade factual inclui ferramentas de resolução, e se conversarmos de forma polida e pragmática (realismo) buscando o crescimento mútuo, há excelentes chances de sairmos fortalecidos e com plano concreto (otimismo).",
      convictionSynthesis: 50
    };
    setState(prev => ({
      ...prev,
      scenarios: [...prev.scenarios, newScenario]
    }));
    setSelectedScenarioId(newId);
    setViewMode("editor");
  };

  const handleDeleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Gostaria de excluir esta análise de espectro cognitivo permanentemente?")) {
      setState(prev => {
        const filtered = prev.scenarios.filter(s => s.id !== id);
        return { ...prev, scenarios: filtered };
      });
      if (selectedScenarioId === id) {
        const remaining = state.scenarios.filter(s => s.id !== id);
        setSelectedScenarioId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const updateScenarioField = (field: keyof EspectroScenario, val: any) => {
    if (!selectedScenarioId) return;
    setState(prev => ({
      ...prev,
      scenarios: prev.scenarios.map(s => 
        s.id === selectedScenarioId ? { ...s, [field]: val } : s
      )
    }));
  };

  // Pull active scenario data
  const activeScenario = state.scenarios.find(s => s.id === selectedScenarioId);

  // Score computation
  const calculateIEE = (scen: EspectroScenario) => {
    let score = 20; // completed basic presence
    
    // Check completeness in the spectrum text fields
    const keys: (keyof EspectroScenario)[] = ["catastrofismo", "pessimismo", "realismo", "otimismo", "utopismo"];
    keys.forEach(k => {
      const val = scen[k] as string;
      if (val && val.length > 15 && !val.includes("Ex: ") && !val.includes("Tudo vai sempre dar errado:")) {
        score += 8; // 8 points per robust column, up to 40 max
      }
    });

    // Check synthesis
    if (scen.jointSynthesis && scen.jointSynthesis.length > 20) {
      score += 15;
    }

    // Weight by conviction
    score += Math.round((scen.convictionSynthesis / 100) * 25); // max 25

    return Math.min(100, score);
  };

  const activeIEE = activeScenario ? calculateIEE(activeScenario) : 0;
  const totalScenarios = state.scenarios.length;
  const globalAvgIEE = totalScenarios > 0
    ? Math.round(state.scenarios.reduce((acc, s) => acc + calculateIEE(s), 0) / totalScenarios)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn" id="espectro-cognitivo-vroot">
      
      {/* Information Header Block */}
      <div className="bg-[#00A3FF]/10 border border-[#00A3FF]/20 p-4 rounded-xl text-xs text-blue-300 space-y-1 block" id="info-header-espectro">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">📐 GERAÇÃO DE ALTERNATIVAS NO ESPECTRO COGNITIVO (INSTRUMENTO 17)</strong>
        <span className="text-gray-400 font-sans">
          Esta ferramenta ajuda o paciente a flexibilizar crenças rígidas desenhando um espectro analítico amplo de 5 colunas: 
          <strong> Catastrofismo</strong> (certeza do pior), <strong>Pessimismo</strong> (tendência ao pior), <strong>Realismo</strong> (fatos brutos neutros), 
          <strong> Otimismo</strong> (tendência ao melhor) e <strong>Utopismo</strong> (certeza de fantasia intocável). Como ensinado pelo supervisor clínico, 
          a melhor postura adaptativa consiste em conjugar <strong>Realismo com Otimismo saudável</strong> (esperar e trabalhar pelo melhor de forma fundamentada em fatos), 
          resgatando a adaptabilidade emocional.
        </span>
      </div>

      {/* Patient info tracker bar */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="patient-context-espectro">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente / Cliente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Selecionado"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Pilar Psicoterapêutico</span>
          <span className="text-blue-400 font-sans text-xs font-bold py-1 block flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Amortecimento de Rigidezes Cognitivas / Crenças
          </span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Indicador-Chave</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Raciocínio Adaptativo e Auto-instrução Equilibrada</div>
        </div>
      </div>

      {/* Clinical Preset Examples Trigger Panel */}
      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 space-y-2" id="espectro-presets">
        <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          ⚡ Modelos Clínicos de Espectro (Carregamento Rápido):
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[10.5px] font-sans font-medium px-3.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-450 hover:text-white hover:border-blue-500 hover:bg-blue-950/10 transition-all cursor-pointer block"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numerical Index Calculations / Score overview widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="overview-statistics-row-espectro">
        
        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-scenarios-count">
          <div className="space-y-0.5">
            <span className="text-gray-500 font-mono text-[9px] uppercase block">Cenários de Espectro</span>
            <span className="font-mono text-xl font-bold text-gray-200 block">{totalScenarios} situações</span>
          </div>
          <Activity className="w-8 h-8 text-gray-700" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-iee-index">
          <div className="space-y-0.5">
            <span className="text-[#00A3FF] font-mono text-[9px] uppercase block">Índice Equilíbrio Espectro (IEE)</span>
            <span className="font-mono text-xl font-bold text-[#00A3FF] block">{globalAvgIEE}% médio</span>
          </div>
          <Sliders className="w-8 h-8 text-blue-950" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-active-scenario-iee">
          <div className="space-y-0.5">
            <span className="text-emerald-400 font-mono text-[9px] uppercase block">IEE do Cenário Ativo</span>
            <span className="font-mono text-xl font-bold text-emerald-400 block">
              {activeScenario ? `${activeIEE}%` : "0%"}
            </span>
          </div>
          <Award className="w-8 h-8 text-emerald-950" />
        </div>

      </div>

      {/* Navigation bars and creator */}
      <div className="flex justify-between items-center bg-gray-950/60 p-2.5 rounded-xl border border-gray-900" id="controls-top-bar-espectro">
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
            <Sliders className="w-3.5 h-3.5" />
            <span>Painel do Espectro</span>
          </button>
          
          <button
            type="button"
            disabled={!activeScenario}
            onClick={() => setViewMode("sheet")}
            className={`text-xs px-3 py-1.5 rounded-lg font-sans font-bold transition-all flex items-center gap-1.5 ${
              !activeScenario 
                ? "opacity-50 cursor-not-allowed text-gray-650"
                : viewMode === "sheet"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "text-gray-400 hover:text-white cursor-pointer"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ficha Física de Impressão</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCreateNewScenario}
          className="px-3.5 py-1.5 text-xs rounded-xl bg-blue-500 text-black font-extrabold hover:bg-blue-400 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Situação</span>
        </button>
      </div>

      {/* Main Body Switcher output */}
      {viewMode === "editor" ? (
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="editor-scenarios-grid">
          
          {/* Left panel list directories */}
          <div className="lg:col-span-3 flex flex-col space-y-2" id="sidebar-scenarios-list">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono font-bold block mb-1">Cenários Mapeados ({totalScenarios}):</span>
            
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {state.scenarios.length > 0 ? (
                state.scenarios.map(scen => {
                  const isSelected = scen.id === selectedScenarioId;
                  const scenIEE = calculateIEE(scen);
                  return (
                    <div
                      key={scen.id}
                      onClick={() => setSelectedScenarioId(scen.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative group cursor-pointer ${
                        isSelected 
                          ? "bg-[#111217] border-blue-500/40 text-white shadow-md shadow-blue-500/5" 
                          : "bg-gray-950/40 border-gray-900/50 hover:border-gray-850 text-gray-400"
                      }`}
                      id={`scen-directory-item-${scen.id}`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                      )}
                      
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-0.5 block flex-1">
                          <span className="text-[8px] uppercase font-mono font-extrabold text-blue-450 block tracking-wide">
                            Situação:
                          </span>
                          <p className="text-xs font-sans font-bold text-gray-200 line-clamp-2 leading-tight">
                            {scen.situation || "Cenário Sem Nome"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteScenario(scen.id, e)}
                          className="text-gray-650 hover:text-red-500 transition-colors p-0.5 cursor-pointer opacity-40 group-hover:opacity-100 shrink-0"
                          title="Excluir este cenário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-gray-900/40 text-[8.5px] font-mono">
                        <span className="text-gray-500 uppercase">Crença: {scen.initialBeliefLocation}</span>
                        <span className={`px-1 rounded-sm text-[8px] ${
                          scenIEE >= 75 ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-500"
                        }`}>Equilíbrio: {scenIEE}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-gray-650 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-xl bg-gray-950/10">
                  Nenhum cenário cadastrado no espectro. Adicione um novo cenário ou clique nos presets acima.
                </div>
              )}
            </div>
          </div>

          {/* Right panel inputs workspaces */}
          <div className="lg:col-span-9 flex flex-col space-y-6" id="editor-active-workbook-espectro">
            {activeScenario ? (
              <div className="bg-[#111217] border border-gray-900 rounded-2xl p-6 space-y-6 animate-fadeIn" id="editor-inputs-panel-espectro">
                
                {/* Section title banner */}
                <div className="border-b border-gray-900 pb-3" id="active-pane-header-espectro">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    Análise do Espectro Cognitivo de 5 Colunas
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">Inscreva a narrativa para cada patamar cognitivo e ajude o paciente a enxergar as nuances da realidade.</p>
                </div>

                {/* Situation Input */}
                <div className="space-y-1 block" id="situation-field-box">
                  <label className="text-gray-400 text-[10.5px] font-bold uppercase tracking-wider block font-mono">
                    Situação Desafiadora / Foco Teórico:
                  </label>
                  <input
                    type="text"
                    value={activeScenario.situation}
                    onChange={(e) => updateScenarioField("situation", e.target.value)}
                    placeholder="Ex: Tive um feedback negativo em público do meu coordenador acadêmico..."
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-xl text-white text-xs outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>

                {/* Cognitive spectrum 5 columns editor fields */}
                <div className="space-y-4" id="spectrum-columns-group">
                  <span className="text-[10px] text-gray-450 uppercase font-mono font-bold block mb-1">Mapeamento de Patamares (Roteador Cognitivo):</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3" id="spectrum-columns-grid">
                    
                    {/* Catastrofismo */}
                    <div className="p-3 bg-red-950/10 border border-red-900/20 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-extrabold text-red-400 block uppercase leading-none">CATASTROFISMO</span>
                        <span className="text-[8.5px] text-gray-500 block leading-tight mt-0.5">"Tudo vai sempre dar errado."</span>
                      </div>
                      <textarea
                        value={activeScenario.catastrofismo}
                        onChange={(e) => updateScenarioField("catastrofismo", e.target.value)}
                        className="w-full h-32 p-1.5 bg-gray-950 text-[11px] rounded-lg text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-red-500 resize-none leading-normal block"
                        placeholder="Cenário extremo ultrajante..."
                      />
                    </div>

                    {/* Pessimismo */}
                    <div className="p-3 bg-orange-950/10 border border-orange-900/20 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-extrabold text-orange-400 block uppercase leading-none">PESSIMISMO</span>
                        <span className="text-[8.5px] text-gray-500 block leading-tight mt-0.5">"As coisas tendem a dar errado."</span>
                      </div>
                      <textarea
                        value={activeScenario.pessimismo}
                        onChange={(e) => updateScenarioField("pessimismo", e.target.value)}
                        className="w-full h-32 p-1.5 bg-gray-950 text-[11px] rounded-lg text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none leading-normal block"
                        placeholder="Perspectiva cinzenta de insucesso..."
                      />
                    </div>

                    {/* Realismo */}
                    <div className="p-3 bg-blue-950/15 border border-blue-900/20 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-extrabold text-blue-300 block uppercase leading-none">REALISMO (Fatos)</span>
                        <span className="text-[8.5px] text-gray-400 block leading-tight mt-0.5">"As coisas são como os fatos mostram."</span>
                      </div>
                      <textarea
                        value={activeScenario.realismo}
                        onChange={(e) => updateScenarioField("realismo", e.target.value)}
                        className="w-full h-32 p-1.5 bg-gray-950 text-[11px] rounded-lg text-white font-sans focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none leading-normal block"
                        placeholder="Quais fatos são testáveis de verdade?"
                      />
                    </div>

                    {/* Otimismo */}
                    <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-extrabold text-emerald-400 block uppercase leading-none">OTIMISMO</span>
                        <span className="text-[8.5px] text-gray-500 block leading-tight mt-0.5">"As coisas tendem a dar certo."</span>
                      </div>
                      <textarea
                        value={activeScenario.otimismo}
                        onChange={(e) => updateScenarioField("otimismo", e.target.value)}
                        className="w-full h-32 p-1.5 bg-gray-950 text-[11px] rounded-lg text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-505 resize-none leading-normal block"
                        placeholder="Expectativa virtuosa construtiva..."
                      />
                    </div>

                    {/* Utopismo */}
                    <div className="p-3 bg-purple-950/10 border border-purple-900/20 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-extrabold text-purple-400 block uppercase leading-none">UTOPISMO</span>
                        <span className="text-[8.5px] text-gray-500 block leading-tight mt-0.5">"Tudo vai sempre dar certo."</span>
                      </div>
                      <textarea
                        value={activeScenario.utopismo}
                        onChange={(e) => updateScenarioField("utopismo", e.target.value)}
                        className="w-full h-32 p-1.5 bg-gray-950 text-[11px] rounded-lg text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none leading-normal block"
                        placeholder="Fantasia irreal mágica..."
                      />
                    </div>

                  </div>
                </div>

                {/* Where did my original automated belief lie? */}
                <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-900 space-y-3" id="initial-belief-localization">
                  <div className="space-y-0.5 block">
                    <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider block">📍 Identificação de Viés Primário Automático:</span>
                    <span className="text-[9px] text-gray-500 block">Em qual dessas lentes ou colunas o raciocínio inicial de erro do paciente foi formulado originalmente?</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" id="toggle-belief-location-row">
                    {(["catastrofismo", "pessimismo", "realismo", "otimismo", "utopismo"] as SpectroColumnKey[]).map(val => {
                      const labels: Record<string, string> = {
                        catastrofismo: "Catastrofismo (1)",
                        pessimismo: "Pessimismo (2)",
                        realismo: "Realismo (3)",
                        otimismo: "Otimismo (4)",
                        utopismo: "Utopismo (5)"
                      };
                      const isSelected = activeScenario.initialBeliefLocation === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateScenarioField("initialBeliefLocation", val)}
                          className={`px-2 py-1.5 text-xs font-mono font-medium rounded-lg text-center cursor-pointer transition-all border ${
                            isSelected 
                              ? "bg-blue-500/10 border-blue-500/40 text-blue-300 font-bold" 
                              : "bg-gray-950/30 border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                          }`}
                        >
                          {labels[val] || val}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RECOMMENDATION SYNTHESIS (REALISMO + OTIMISMO) */}
                <div className="bg-emerald-500/[0.015] border border-emerald-550/15 p-5 rounded-xl space-y-4" id="joint-synthesis-form">
                  <div className="border-b border-gray-900 pb-2 flex items-center justify-between" id="joint-synthesis-header">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-gray-100 flex items-center gap-1.5">
                        <span className="text-emerald-400 font-sans uppercase">🌟 REESTRUTURAÇÃO TERAPÊUTICA: REALISMO CONJUGADO COM OTIMISMO</span>
                      </span>
                      <span className="text-[9px] text-gray-500 block">O contraponto ideal: alie os fatos empíricos frios (Realismo) à expectativa benigna construtiva racional (Otimismo).</span>
                    </div>
                  </div>

                  <textarea
                    value={activeScenario.jointSynthesis}
                    onChange={(e) => updateScenarioField("jointSynthesis", e.target.value)}
                    className="w-full min-h-[100px] p-3 bg-gray-950 border border-emerald-950/30 text-xs rounded-xl text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 block leading-relaxed"
                    placeholder="Alinhando os fatos concretos... junto do estímulo cooperativo para agir com esperança baseada na realidade..."
                  />

                  {/* Conviction Slider inside Synthesis panel */}
                  <div className="flex flex-wrap justify-between items-center text-xs pt-3 mt-1 border-t border-gray-900" id="conviction-panel-espectro">
                    <div className="space-y-0.5 block">
                      <strong className="text-gray-400 block font-mono text-[10px] uppercase">🔥 Convicção do Paciente nesta Síntese Equilibrada (0-100%):</strong>
                      <span className="text-[9px] text-gray-550 block">Qual o grau de persuasão intelectual e prontidão existencial perante esta nova lente?</span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-mono text-[#00A3FF] font-bold text-sm">{activeScenario.convictionSynthesis}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={activeScenario.convictionSynthesis}
                        onChange={(e) => updateScenarioField("convictionSynthesis", parseInt(e.target.value))}
                        className="w-36 bg-gray-950 rounded cursor-pointer accent-[#00A3FF]"
                      />
                    </div>
                  </div>

                </div>

                {/* Notebook Observations */}
                <div className="space-y-1 block" id="clinical-observations-box">
                  <label className="text-gray-400 text-[10.5px] font-bold uppercase tracking-wider block font-mono">
                    📝 Comentários Clínicos do Psicólogo:
                  </label>
                  <textarea
                    value={state.generalObservations}
                    onChange={(e) => setState(prev => ({ ...prev, generalObservations: e.target.value }))}
                    placeholder="Adicione notas adicionais de terapia, reatividade evidenciada ou planos de ação para este espectro..."
                    className="w-full bg-gray-950 border border-gray-900 p-2.5 text-xs rounded-xl text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 block min-h-[60px]"
                  />
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-gray-600 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-2xl bg-[#111217] flex flex-col items-center justify-center space-y-2">
                <Sliders className="w-10 h-10 text-gray-800 animate-pulse" />
                <span>Nenhum cenário cadastrado no espectro cognitivo. Adicione um utilizando a barra lateral ou prepare um de nossos presets criados para agilizar o atendimento clínico.</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        
        // PHYSICAL PRINT SHEET REPLICATED SCHEME
        <div className="max-w-4xl mx-auto py-4 flex flex-col space-y-6" id="printed-desk-espectro">
          {activeScenario ? (
            <div className="space-y-6">
              
              <p className="text-[11px] text-center text-gray-500 italic font-sans max-w-xl mx-auto">
                A folha física representa a matriz do instrumento clínico correspondente ao PDF. Cada nível de raciocínio é distribuído visualmente em colunas, ideal para fixação cognitiva.
              </p>

              {/* Sheet Paper layout */}
              <div className="bg-white text-gray-950 rounded-2xl p-8 shadow-2xl border-4 border-gray-900 relative font-sans select-text block" id="printed-sheet-spectrum">
                
                {/* Brand row header */}
                <div className="flex justify-between items-center border-b-2 border-gray-900 pb-3" id="sheet-header-brand">
                  <div className="flex items-center gap-1.5 font-bold font-sans text-xs tracking-wider text-gray-900 uppercase">
                    <Sliders className="w-4 h-4 text-gray-900" />
                    <span>Geração de Alternativas no Espectro Cognitivo</span>
                  </div>
                  <span className="text-[8px] font-mono font-black text-gray-450 tracking-widest uppercase">INTELIGÊNCIA PSICOLÓGICA</span>
                </div>

                {/* Client / Theme metadata */}
                <div className="grid grid-cols-2 gap-4 mt-4 p-3.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono text-gray-650" id="sheet-metadata">
                  <div>
                    <strong>PACIENTE:</strong> <span className="font-sans font-bold text-gray-900 text-[11px]">{patient.name || "NÃO CADASTRADO"}</span>
                  </div>
                  <div className="text-right">
                    <strong>SITUAÇÃO:</strong> <span className="font-sans font-bold text-gray-900 text-[11px] uppercase truncate max-w-xs inline-block">{activeScenario.situation || "NÃO DEFINIDA"}</span>
                  </div>
                </div>

                {/* THE 5-COLUMN CONTINUOUS GRID EXACTLY LIKE SCREENSHOT */}
                <div className="mt-6 border-2 border-gray-900 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-5 divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-900" id="spectrum-5-columns-mesh">
                  
                  {/* Catastrofismo column */}
                  <div className="p-3 flex flex-col bg-red-100/10 min-h-[290px] relative">
                    <div className="border-b border-gray-300 pb-2 mb-2 text-center">
                      <span className="text-[9.5px] font-black text-red-800 block uppercase">CATASTROFISMO</span>
                      <span className="text-[8px] text-gray-550 block italic leading-tight">"Tudo vai sempre dar errado."</span>
                    </div>
                    <p className="text-[11px] font-serif text-gray-750 font-normal leading-relaxed pl-0.5">
                      {activeScenario.catastrofismo || "-"}
                    </p>
                    {activeScenario.initialBeliefLocation === "catastrofismo" && (
                      <div className="absolute bottom-2 left-2 right-2 px-1.5 py-0.5 bg-red-650 text-white font-mono text-[8.5px] font-extrabold rounded text-center">
                        📍 Crença Primária
                      </div>
                    )}
                  </div>

                  {/* Pessimismo column */}
                  <div className="p-3 flex flex-col bg-orange-100/10 min-h-[290px] relative">
                    <div className="border-b border-gray-300 pb-2 mb-2 text-center">
                      <span className="text-[9.5px] font-black text-orange-700 block uppercase">PESSIMISMO</span>
                      <span className="text-[8px] text-gray-550 block italic leading-tight">"As coisas tendem a dar errado."</span>
                    </div>
                    <p className="text-[11px] font-serif text-gray-750 font-normal leading-relaxed pl-0.5">
                      {activeScenario.pessimismo || "-"}
                    </p>
                    {activeScenario.initialBeliefLocation === "pessimismo" && (
                      <div className="absolute bottom-2 left-2 right-2 px-1.5 py-0.5 bg-orange-600 text-white font-mono text-[8.5px] font-extrabold rounded text-center">
                        📍 Crença Primária
                      </div>
                    )}
                  </div>

                  {/* Realismo column */}
                  <div className="p-3 flex flex-col bg-[#00A3FF]/5 min-h-[290px] relative">
                    <div className="border-b border-gray-300 pb-2 mb-2 text-center">
                      <span className="text-[9.5px] font-black text-blue-900 block uppercase">REALISMO</span>
                      <span className="text-[8px] text-gray-650 block italic leading-tight">"As coisas são como os fatos mostram."</span>
                    </div>
                    <p className="text-[11.5px] font-sans text-gray-950 font-bold leading-relaxed pl-0.5">
                      {activeScenario.realismo || "-"}
                    </p>
                    {activeScenario.initialBeliefLocation === "realismo" && (
                      <div className="absolute bottom-2 left-2 right-2 px-1.5 py-0.5 bg-blue-650 text-white font-mono text-[8.5px] font-extrabold rounded text-center">
                        📍 Crença Primária
                      </div>
                    )}
                  </div>

                  {/* Otimismo column */}
                  <div className="p-3 flex flex-col bg-emerald-100/10 min-h-[290px] relative">
                    <div className="border-b border-gray-300 pb-2 mb-2 text-center">
                      <span className="text-[9.5px] font-black text-emerald-850 block uppercase">OTIMISMO</span>
                      <span className="text-[8px] text-gray-550 block italic leading-tight">"As coisas tendem a dar certo."</span>
                    </div>
                    <p className="text-[11px] font-serif text-gray-750 font-normal leading-relaxed pl-0.5">
                      {activeScenario.otimismo || "-"}
                    </p>
                    {activeScenario.initialBeliefLocation === "otimismo" && (
                      <div className="absolute bottom-2 left-2 right-2 px-1.5 py-0.5 bg-emerald-600 text-white font-mono text-[8.5px] font-extrabold rounded text-center">
                        📍 Crença Primária
                      </div>
                    )}
                  </div>

                  {/* Utopismo column */}
                  <div className="p-3 flex flex-col bg-purple-100/10 min-h-[290px] relative font-sans">
                    <div className="border-b border-gray-300 pb-2 mb-2 text-center">
                      <span className="text-[9.5px] font-black text-purple-800 block uppercase">UTOPISMO</span>
                      <span className="text-[8px] text-gray-550 block italic leading-tight">"Tudo vai sempre dar certo."</span>
                    </div>
                    <p className="text-[11px] font-serif text-gray-750 font-normal leading-relaxed pl-0.5">
                      {activeScenario.utopismo || "-"}
                    </p>
                    {activeScenario.initialBeliefLocation === "utopismo" && (
                      <div className="absolute bottom-2 left-2 right-2 px-1.5 py-0.5 bg-purple-650 text-white font-mono text-[8.5px] font-extrabold rounded text-center">
                        📍 Crença Primária
                      </div>
                    )}
                  </div>

                </div>

                {/* Joint Realism + Optimism synthesis section below the grid */}
                <div className="mt-6 p-4 bg-emerald-50 border-2 border-emerald-900 rounded-xl space-y-2 block" id="printed-joint-synthesis-card">
                  <span className="text-[10.5px] font-black text-emerald-900 uppercase block tracking-wider font-sans">⭐ REESTRUTURAÇÃO TERAPÊUTICA: REALISMO CONJUGADO COM OTIMISMO</span>
                  <p className="text-xs font-sans text-gray-900 leading-relaxed font-semibold pl-0.5">
                    {activeScenario.jointSynthesis || "Não preenchido."}
                  </p>
                </div>

                {/* Footer validation seals */}
                <div className="mt-6 pt-4 border-t border-gray-300 flex flex-wrap justify-between items-center text-[9px] font-mono text-gray-450" id="matrix-document-footer-espectro">
                  <span>ÍNDICE DE EQUILÍBRIO DO ESPECTRO: {activeIEE}%</span>
                  <span className="font-extrabold text-gray-750">ADESÃO SUBJETIVA DO USO: {activeScenario.convictionSynthesis}%</span>
                </div>

              </div>

              {/* Observations notes display sheet */}
              {state.generalObservations && (
                <div className="p-4 bg-[#111217] rounded-xl border border-gray-900 text-xs text-gray-400 space-y-1 block" id="observations-card-output">
                  <strong className="text-gray-200 font-mono text-[9px] uppercase tracking-wide text-blue-400 block">📝 ANOTAÇÃO DE PARECER TÉCNICO:</strong>
                  <p className="font-sans leading-relaxed">{state.generalObservations}</p>
                </div>
              )}

            </div>
          ) : null}
        </div>

      )}

    </div>
  );
}
