import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Heart, Plus, Trash2, HelpCircle, ArrowRight, ShieldCheck, 
  Sparkles, Award, Scale, CheckCircle2, ChevronRight, BookOpen, AlertCircle, TrendingUp
} from "lucide-react";

export interface SelfEsteemCategoryItem {
  id: string;
  text: string;
}

export interface SelfEsteemDimension {
  id: string;
  title: string;
  description: string;
  satisfaction: number; // 0 to 10
  currentAttributes: SelfEsteemCategoryItem[];
  developGoals: SelfEsteemCategoryItem[];
  relatedHPs: string[];
}

export interface SelfEsteemState {
  dimensions: SelfEsteemDimension[];
  actionStrategy: string;
}

interface ExameDesenvolvimentoAutoestimaViewProps {
  patient: PatientInfo;
  state: SelfEsteemState;
  setState: React.Dispatch<React.SetStateAction<SelfEsteemState>>;
}

export default function ExameDesenvolvimentoAutoestimaView({
  patient,
  state,
  setState
}: ExameDesenvolvimentoAutoestimaViewProps) {
  const [selectedDimId, setSelectedDimId] = useState<string>("aparencia");
  
  const [newCurrentAttr, setNewCurrentAttr] = useState("");
  const [newGoal, setNewGoal] = useState("");

  const CURRENT_HP_OPTIONS = [
    "Altruísmo", "Autoaceitação", "Autenticidade", "Autoestima", "Autoconfiança", 
    "Resolutividade de Problemas", "Enfrentamento de Desafios", "Assertividade Social", 
    "Comunicação Não-Violenta", "Independência Emocional", "Autonomia Regulatória", 
    "Comprometimento com Valores", "Autocompaixão", "Resiliência Existencial"
  ];

  // Presets
  const PRESETS = [
    {
      label: "Síndrome do Impostor e Segurança Profissional",
      strategy: "Focar em auditoria objetiva de e-mails de elogio e manter diário de pequenas vitórias práticas para minar a voz autocrítica.",
      dimensions: [
        {
          id: "aparencia",
          title: "Aparência Física e Estética",
          description: "Percepção corporal, cuidados diários, expressão visual e conforto com a própria imagem física.",
          satisfaction: 7,
          currentAttributes: [
            { id: "ap_1", text: "Cuido bem da minha vestimenta para reuniões importantes" },
            { id: "ap_2", text: "Sinto-me satisfeito com minha postura e expressão corporal" }
          ],
          developGoals: [
            { id: "apg_1", text: "Melhorar a constância de exercícios físicos regulares na semana" }
          ],
          relatedHPs: ["Autoaceitação", "Autocuidado"]
        },
        {
          id: "competencias",
          title: "Competências",
          description: "Habilidades técnicas, conquistas intelectuais, talentos, capacidade de resolução e aprendizado.",
          satisfaction: 4,
          currentAttributes: [
            { id: "cp_1", text: "Tenho facilidade para compreender lógicas de programação complexas" },
            { id: "cp_2", text: "Consigo resolver crises operacionais com rapidez quando sob pressão extrema" }
          ],
          developGoals: [
            { id: "cpg_1", text: "Aceitar feedbacks positivos de gerentes sem justificar como 'sorte'" },
            { id: "cpg_2", text: "Estudar uma nova arquitetura de nuvem para solidificar domínio técnico" }
          ],
          relatedHPs: ["Autoconfiança", "Resolutividade de Problemas", "Enfrentamento de Desafios"]
        },
        {
          id: "interpessoal",
          title: "Estilo Interpessoal",
          description: "Relacionamentos, conexões com amigos e familiares, e assertividade de comunicação.",
          satisfaction: 6,
          currentAttributes: [
            { id: "int_1", text: "Sou um ouvinte atento e as pessoas costumam desabafar comigo" }
          ],
          developGoals: [
            { id: "intg_1", text: "Aprender a discordar amigavelmente em comitês técnicos em vez de silenciar" }
          ],
          relatedHPs: ["Assertividade Social", "Comunicação Não-Violenta"]
        },
        {
          id: "autonomia",
          title: "Autonomia",
          description: "Independência de decisões, capacidade de tolerar desaprovação alheia e autogestão.",
          satisfaction: 5,
          currentAttributes: [
            { id: "aut_1", text: "Consigo organizar minha própria rotina de home office com afinco" }
          ],
          developGoals: [
            { id: "autg_1", text: "Decidir rotas de projetos técnicos confiando nos meus critérios pessoais primeiro" }
          ],
          relatedHPs: ["Autonomia Regulatória", "Independência Emocional"]
        },
        {
          id: "valores",
          title: "Valores",
          description: "Alinhamento de conduta com propósitos existenciais, ética e causas norteadoras pessoais.",
          satisfaction: 8,
          currentAttributes: [
            { id: "val_1", text: "Prezo profundamente pela honestidade e transparência nos meus códigos" },
            { id: "val_2", text: "Apoio jovens desenvolvedores no início da jornada com mentoria gratuita" }
          ],
          developGoals: [
            { id: "valg_1", text: "Manter o compartilhamento de conhecimento sem buscar validação extrema" }
          ],
          relatedHPs: ["Comprometimento com Valores", "Altruísmo"]
        }
      ]
    },
    {
      label: "Insegurança de Autoimagem e Esquiva Social",
      strategy: "Reduzir o hábito de comparar o próprio corpo nas redes sociais; praticar o autocuidado físico focado na funcionalidade e conforto do corpo.",
      dimensions: [
        {
          id: "aparencia",
          title: "Aparência Física e Estética",
          description: "Percepção corporal, cuidados diários, expressão visual e conforto com a própria imagem física.",
          satisfaction: 3,
          currentAttributes: [
            { id: "ap_1_b", text: "Sinto orgulho na resistência física e saúde geral dos meus exames" }
          ],
          developGoals: [
            { id: "apg_1_b", text: "Parar de me pesar diariamente e usar fotos para auto-punição" },
            { id: "apg_2_b", text: "Comprar roupas confortáveis que me façam sentir bem no corpo de hoje" }
          ],
          relatedHPs: ["Autoaceitação", "Autocompaixão"]
        },
        {
          id: "competencias",
          title: "Competências",
          description: "Habilidades técnicas, conquistas intelectuais, talentos, capacidade de resolução e aprendizado.",
          satisfaction: 8,
          currentAttributes: [
            { id: "cp_1_b", text: "Sou fluente em inglês e espanhol com excelente gramática" },
            { id: "cp_2_b", text: "Tenho facilidade para escrever ficções e narrativas criativas estruturadas" }
          ],
          developGoals: [
            { id: "cpg_1_b", text: "Enviar um de meus contos escritos para avaliação de leitores externos" }
          ],
          relatedHPs: ["Autoconfiança", "Enfrentamento de Desafios"]
        },
        {
          id: "interpessoal",
          title: "Estilo Interpessoal",
          description: "Relacionamentos, conexões com amigos e familiares, e assertividade de comunicação.",
          satisfaction: 4,
          currentAttributes: [
            { id: "int_1_b", text: "Sou carinhoso e protetor com meus poucos amigos de extrema confiança" }
          ],
          developGoals: [
            { id: "intg_1_b", text: "Aceitar convites para sair em pequenos grupos amigáveis sem inventar desculpas fóbicas" }
          ],
          relatedHPs: ["Assertividade Social", "Enfrentamento de Desafios"]
        },
        {
          id: "autonomia",
          title: "Autonomia",
          description: "Independência de decisões, capacidade de tolerar desaprovação alheia e autogestão.",
          satisfaction: 6,
          currentAttributes: [
            { id: "aut_1_b", text: "Moro sozinho e gerencio todas as minhas contas sem sofrer atrasos" }
          ],
          developGoals: [
            { id: "autg_1_b", text: "Saber dizer 'não' a solicitações invasivas de vizinhos ou familiares" }
          ],
          relatedHPs: ["Autonomia Regulatória"]
        },
        {
          id: "valores",
          title: "Valores",
          description: "Alinhamento de conduta com propósitos existenciais, ética e causas norteadoras pessoais.",
          satisfaction: 9,
          currentAttributes: [
            { id: "val_1_b", text: "Prezo pela empatia, proteção animal e cuidado com a preservação ecológica" }
          ],
          developGoals: [
            { id: "valg_1_b", text: "Voluntarizar 2 horas aos sábados em abrigo de animais local" }
          ],
          relatedHPs: ["Comprometimento com Valores", "Altruísmo", "Resiliência Existencial"]
        }
      ]
    }
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (confirm(`Deseja carregar o perfil clínico de "${preset.label}"? Os dados de autoestima atuais serão sobrescritos.`)) {
      setState({
        dimensions: JSON.parse(JSON.stringify(preset.dimensions)),
        actionStrategy: preset.strategy
      });
    }
  };

  // Helper selectors
  const activeDim = state.dimensions.find(d => d.id === selectedDimId) || state.dimensions[0];

  const handleUpdateSatisfaction = (id: string, val: number) => {
    setState(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(d => 
        d.id === id ? { ...d, satisfaction: val } : d
      )
    }));
  };

  const handleAddCurrentAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrentAttr.trim()) return;
    const newItem = { id: `item_cur_${Date.now()}`, text: newCurrentAttr.trim() };
    
    setState(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(d => 
        d.id === selectedDimId 
          ? { ...d, currentAttributes: [...d.currentAttributes, newItem] } 
          : d
      )
    }));
    setNewCurrentAttr("");
  };

  const handleRemoveCurrentAttribute = (itemId: string) => {
    setState(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(d => 
        d.id === selectedDimId 
          ? { ...d, currentAttributes: d.currentAttributes.filter(i => i.id !== itemId) } 
          : d
      )
    }));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const newItem = { id: `item_goal_${Date.now()}`, text: newGoal.trim() };

    setState(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(d => 
        d.id === selectedDimId 
          ? { ...d, developGoals: [...d.developGoals, newItem] } 
          : d
      )
    }));
    setNewGoal("");
  };

  const handleRemoveGoal = (itemId: string) => {
    setState(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(d => 
        d.id === selectedDimId 
          ? { ...d, developGoals: d.developGoals.filter(i => i.id !== itemId) } 
          : d
      )
    }));
  };

  const handleToggleHP = (id: string, hpName: string) => {
    setState(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(d => {
        if (d.id === id) {
          const isSelected = d.relatedHPs.includes(hpName);
          return {
            ...d,
            relatedHPs: isSelected 
              ? d.relatedHPs.filter(name => name !== hpName)
              : [...d.relatedHPs, hpName]
          };
        }
        return d;
      })
    }));
  };

  // Global calculations
  const totalSatisfaction = state.dimensions.reduce((acc, d) => acc + d.satisfaction, 0);
  const globalSelfEsteemIndex = Math.round((totalSatisfaction / (state.dimensions.length * 10)) * 100);

  // Development index: ratio of listed future development goals written down with support HPs
  const totalGoals = state.dimensions.reduce((acc, d) => acc + d.developGoals.length, 0);
  const hpsMapped = state.dimensions.reduce((acc, d) => acc + d.relatedHPs.length, 0);
  
  const activeDevelopmentIndex = Math.min(100, Math.round(
    (totalGoals * 10) + (hpsMapped * 5) + (state.actionStrategy.trim().length > 15 ? 25 : 0)
  ));

  return (
    <div className="space-y-6 animate-fadeIn" id="exame-autoestima-vroot">
      
      {/* Clinician Guidance Header */}
      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs text-red-300 space-y-1 block" id="header-clinical-notes">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">❤️ EXAME E DESENVOLVIMENTO DA AUTOESTIMA</strong>
        <span className="text-gray-400 font-sans">
          A autoestima saudável reside na harmonia conceitual entre o <strong>Eu Real</strong> (Estado Atual) e o <strong>Eu Admirável</strong> (A desenvolver). 
          Foque em extrair do paciente os dados factuais de suas características atuais para construir uma aceitação realista. 
          Use as colunas de "A Desenvolver" para incentivar o auto-investimento planejado estruturado com Habilidades Psicogológicas claras, transformando frustração em progresso acionável.
        </span>
      </div>

      {/* Patient context summary bar */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="assessment-info-bar">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente / Cliente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Paciente Selecionado"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Foco de Intervenção</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Aceitação Incondicional & Fortalecimento de Autoeficácia</div>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">HP Primária Relacionada</span>
          <div className="text-red-400 font-sans text-xs font-bold py-1 block flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-400" />
            Autoestima & Autocompaixão Ativa
          </div>
        </div>
      </div>

      {/* Direct Presets Fast Loading */}
      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 space-y-2" id="autoestima-presets">
        <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          ⚡ Modelos Clínicos Rápidos de Autoestima (Carregar exemplos estruturados):
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[10.5px] font-sans font-medium px-3.5 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-red-500 hover:bg-red-950/10 transition-all cursor-pointer block"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Analytics Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="overview-statistics-row">
        
        {/* Metric 1: IAG (Índice de Autoestima Global) */}
        <div className="bg-[#111217] border border-gray-900 p-5 rounded-2xl flex items-center justify-between" id="metric-iag">
          <div className="space-y-1">
            <span className="text-red-400 font-mono text-[10px] font-bold block uppercase">Índice de Autoestima Global (IAG)</span>
            <span className="text-gray-400 text-[10px] leading-relaxed font-sans block max-w-sm">Média ponderada do nível de satisfação atual nas cinco esferas da autoimagem.</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold font-mono text-red-400 block">{globalSelfEsteemIndex}%</span>
            {globalSelfEsteemIndex >= 75 ? (
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Apreciação Ótima</span>
            ) : globalSelfEsteemIndex >= 50 ? (
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Autoestima Moderada</span>
            ) : (
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">Rebaixamento Grave</span>
            )}
          </div>
        </div>

        {/* Metric 2: IDA (Índice de Desenvolvimento Ativo) */}
        <div className="bg-[#111217] border border-gray-900 p-5 rounded-2xl flex items-center justify-between" id="metric-ida">
          <div className="space-y-1">
            <span className="text-blue-400 font-mono text-[10px] font-bold block uppercase">Índice de Auto-Investimento Ativo (IDA)</span>
            <span className="text-gray-400 text-[10px] leading-relaxed font-sans block max-w-sm">Aferição do grau de engajamento prático em planos e metas futuras de crescimento pessoal.</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold font-mono text-blue-400 block">{activeDevelopmentIndex}%</span>
            {activeDevelopmentIndex >= 70 ? (
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Ação Alta</span>
            ) : activeDevelopmentIndex >= 35 ? (
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Ação Planejada</span>
            ) : (
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">Sem Metas Claras</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Structural Interactive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="autoestima-workspace-body">
        
        {/* Left Side: Category Navigator Tabs */}
        <div className="lg:col-span-4 flex flex-col space-y-2" id="sidebar-dimension-selector">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono font-bold block mb-1">Selecione uma Dimensão para trabalhar:</span>
          {state.dimensions.map(dim => {
            const isSelected = dim.id === selectedDimId;
            return (
              <button
                key={dim.id}
                onClick={() => {
                  setSelectedDimId(dim.id);
                  setNewCurrentAttr("");
                  setNewGoal("");
                }}
                className={`w-full p-4.5 text-left rounded-xl border transition-all flex flex-col space-y-1 relative group cursor-pointer ${
                  isSelected 
                    ? "bg-[#111217] border-red-500/40 text-white shadow-md shadow-red-500/5" 
                    : "bg-gray-950/40 border-gray-900/50 hover:border-gray-800 text-gray-400"
                }`}
                id={`dim-tab-${dim.id}`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl" />
                )}
                
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11.5px] font-sans font-bold uppercase ${isSelected ? "text-red-400" : "text-gray-300 group-hover:text-white"}`}>
                    {dim.title}
                  </span>
                  <span className="font-mono text-xs font-bold bg-gray-900 border border-gray-850 px-2 py-0.5 rounded text-gray-300">
                    S: {dim.satisfaction}/10
                  </span>
                </div>
                
                <p className="text-[10px] text-gray-550 leading-tight block truncate w-full pr-4">{dim.description}</p>
                
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-gray-900/80 text-gray-400">
                    {dim.currentAttributes.length} Atributos
                  </span>
                  <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-[#00A3FF]/10 text-blue-300">
                    {dim.developGoals.length} Metas
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Active Dimension Workspace Editor */}
        <div className="lg:col-span-8 bg-[#111217] border border-gray-900 rounded-2xl p-6 flex flex-col space-y-6" id="active-dimension-editor">
          
          {/* Section banner */}
          <div className="border-b border-gray-900 pb-3 flex justify-between items-start" id="active-category-header">
            <div className="space-y-1">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-red-400 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/15">
                Editor de Autoimagem
              </span>
              <h4 className="text-sm font-sans font-extrabold text-white uppercase tracking-wide block pt-1.5">{activeDim.title}</h4>
              <p className="text-[11px] text-gray-500 max-w-xl block leading-snug">{activeDim.description}</p>
            </div>

            <div className="flex flex-col items-end space-y-1">
              <span className="text-[10px] text-gray-400 font-mono font-bold uppercase flex items-center gap-1">
                Satisfação Atual:
                <HelpCircle className="w-3 text-gray-500 cursor-help" title="No momento atual da terapia, o quanto o paciente se sente em paz e satisfeito com este vetor (0-10)?" />
              </span>
              <strong className="text-red-400 text-lg font-mono tracking-tight">{activeDim.satisfaction} / 10</strong>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={activeDim.satisfaction}
                onChange={(e) => handleUpdateSatisfaction(activeDim.id, parseInt(e.target.value))}
                className="w-24 accent-red-500 cursor-pointer h-1.5 bg-gray-950 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="category-columns">
            
            {/* COLUMN 1: ESTADO ATUAL (Reconhecendo atributos de valor que já tem) */}
            <div className="space-y-4 flex flex-col bg-gray-950/20 p-4 border border-gray-900 rounded-xl" id="current-attributes">
              <div className="border-b border-gray-900 pb-2">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">📌 ESTADO ATUAL (Atributos Existentes)</span>
                <span className="text-[9.5px] text-gray-500 block">Atributos e qualidades que o paciente já possui neste campo, mas tende a desconsiderar ou desvalorizar.</span>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddCurrentAttribute} className="flex gap-1.5 text-xs" id="attr-form">
                <input
                  type="text"
                  value={newCurrentAttr}
                  onChange={(e) => setNewCurrentAttr(e.target.value)}
                  placeholder="Ex: Minha postura firme ao falar..."
                  className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-870 rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-gray-700"
                />
                <button
                  type="submit"
                  className="px-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold block"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Items List */}
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1" id="current-attr-scroller">
                {activeDim.currentAttributes.length > 0 ? (
                  activeDim.currentAttributes.map(item => (
                    <div 
                      key={item.id} 
                      className="p-2.5 bg-gray-950/80 border border-gray-900 rounded-lg flex items-start justify-between text-[11px]"
                      id={`curr-item-${item.id}`}
                    >
                      <p className="text-gray-300 flex-1 leading-snug">✓ {item.text}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveCurrentAttribute(item.id)}
                        className="text-gray-650 hover:text-red-500 ml-1 transition-colors pt-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-600 font-mono text-[9px] italic border border-dashed border-gray-950 rounded-lg" id="empty-attrs">
                    Nenhum atributo atual reconhecido ainda nesta dimensão. Estimule o paciente!
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: A DESENVOLVER (Auto-investimento / Metas) */}
            <div className="space-y-4 flex flex-col bg-gray-950/20 p-4 border border-gray-950 rounded-xl" id="develop-goals">
              <div className="border-b border-gray-900 pb-2">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block">🚀 A DESENVOLVER (Metas Futuras)</span>
                <span className="text-[9.5px] text-gray-500 block">Metas de auto-investimento realistas, fáceis de treinar ativamente, sob parâmetros práticos.</span>
              </div>

              {/* Add goal form */}
              <form onSubmit={handleAddGoal} className="flex gap-1.5 text-xs" id="goal-form">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Ex: Treinar me alongar todas as manhãs..."
                  className="flex-1 px-3 py-1.5 bg-gray-950 border border-blue-950 rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-300 font-bold block"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Goals List */}
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1" id="goals-attr-scroller">
                {activeDim.developGoals.length > 0 ? (
                  activeDim.developGoals.map(item => (
                    <div 
                      key={item.id} 
                      className="p-2.5 bg-gray-950/80 border border-blue-950/25 rounded-lg flex items-start justify-between text-[11px]"
                      id={`g-item-${item.id}`}
                    >
                      <p className="text-gray-300 flex-1 leading-snug">🎯 {item.text}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(item.id)}
                        className="text-gray-650 hover:text-red-500 ml-1 transition-colors pt-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-600 font-mono text-[9px] italic border border-dashed border-gray-950 rounded-lg" id="empty-goals">
                    Nenhuma meta de investimento cadastrada ainda. Proponha mudanças adaptativas!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Related Psychological HPs for the active dimension */}
          <div className="bg-gray-950/60 p-4 border border-gray-900 rounded-xl space-y-3" id="related-hps-configuration">
            <span className="text-[10px] text-gray-400 font-mono font-bold uppercase block tracking-wider">🧠 Habilidades Médicas / HPs Clínicas para ativação nesta Dimensão:</span>
            
            <div className="flex flex-wrap gap-1.5">
              {CURRENT_HP_OPTIONS.map(hp => {
                const isSelected = activeDim.relatedHPs.includes(hp);
                return (
                  <button
                    key={hp}
                    type="button"
                    onClick={() => handleToggleHP(activeDim.id, hp)}
                    className={`text-[9.5px] px-2.5 py-1.5 rounded-lg border font-sans font-medium transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-red-500/10 border-red-500/35 text-red-300 font-bold" 
                        : "bg-gray-950 border-gray-870 hover:border-gray-800 text-gray-500"
                    }`}
                  >
                    {hp}
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] text-gray-650 font-mono italic mt-1 leading-none">Vinculando HPs, você aumenta a clareza analítica do paciente sobre o repertório que sustenta o seu crescimento.</p>
          </div>

        </div>

      </div>

      {/* Synthesis section: Action strategy and general conclusions */}
      <div className="bg-[#111217] border border-gray-900 rounded-2xl p-5 space-y-4" id="autoestima-synthesis-card">
        <div className="border-b border-gray-900 pb-2">
          <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-red-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-red-400" />
            Plano Estratégico de Auto-investimento (Veredito de Autovalorização)
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Defina condutas e imersões estruturadas para o paciente treinar. Como ele irá agir ativamente sob os valores mapeados?</p>
        </div>

        <textarea
          value={state.actionStrategy}
          onChange={(e) => setState(prev => ({ ...prev, actionStrategy: e.target.value }))}
          placeholder="Ex: O paciente irá programar 3 sessões semanais de corrida ativa de 20 minutos de manhã, registrará em diário portátil 3 feedbacks operacionais honestos recebidos na equipe técnica, e praticará assertividade dizendo 'Não' de forma calma para demandas extras do vizinho..."
          className="w-full min-h-[100px] p-2.5 bg-gray-950 border border-gray-900 text-xs rounded-xl text-white outline-none focus:ring-1 focus:ring-red-500 font-sans block"
        />

        {/* Tip banner */}
        <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 flex items-start gap-2.5 text-[10.5px] text-blue-300" id="tip-info">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span className="leading-snug font-sans">
            <strong>Lembrete Clínico:</strong> Desenvolver a autoestima não significa acreditar na ilusão de que o sujeito é infalível ou superior aos demais. A verdadeira autoestima é compassiva: o paciente compreende suas fraquezas reais (Aparência, Competência) e as acolhe com amparo, ao mesmo tempo que se esforça ativamente de forma humilde e disciplinada nos seus objetivos de crescimento pessoal.
          </span>
        </div>
      </div>

    </div>
  );
}
