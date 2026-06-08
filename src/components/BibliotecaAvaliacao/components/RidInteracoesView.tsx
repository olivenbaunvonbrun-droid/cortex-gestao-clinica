import React, { useState } from "react";
import { PatientInfo } from "../types";
import { 
  Clipboard, Plus, Trash2, Sparkles, Award, Eye, Compass, ShieldCheck, 
  CheckSquare, ChevronRight, HelpCircle, Activity, Heart, RefreshCw, Layers
} from "lucide-react";

export interface RidInteraction {
  id: string;
  situation: string; 
  necessity: string; 
  realStressors: string; 
  distortedStressors: string; 
  lifeHistory: string; // Eventos significativos do histórico de vida
  cognitions: string; 
  emotions: string; 
  excessActions: string; // Ações - Excessos
  deficitActions: string; // Ações - Défices
  immediateReinforcement: string; // Consequências imediatas - Reforço
  immediatePunishment: string; // Consequências imediatas - Punição
  finalReinforcement: string; // Consequências finais - Reforço
  finalPunishment: string; // Consequências finais - Punição
}

export interface RidInteracoesState {
  interactions: RidInteraction[];
  clinicalNotes: string;
}

interface RidInteracoesViewProps {
  patient: PatientInfo;
  state: RidInteracoesState;
  setState: React.Dispatch<React.SetStateAction<RidInteracoesState>>;
}

export default function RidInteracoesView({
  patient,
  state,
  setState
}: RidInteracoesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    state.interactions.length > 0 ? state.interactions[0].id : null
  );

  const [viewMode, setViewMode] = useState<"editor" | "sheet">("editor");

  // Clinical realistic cases
  const PRESETS = [
    {
      label: "Assertividade Conjugal (Círculo de Cobrança / Afastamento)",
      situation: "Cônjuge chega cansado em casa, isola-se no telefone celular ignorando tentativas de diálogo sobre as contas conjuntas.",
      necessity: "Pertencimento, conexão emocional íntima e cooperação segura no planejamento da vida doméstica.",
      realStressors: "Fadiga extrema do cônjuge após jornada de 11h úteis de logística operacional e contas mensais acumuladas ultrapassando reservas.",
      distortedStressors: "Pensamento do tipo tudo-ou-nada; leitura mental ('Ele não sente mais respeito por mim e está escondendo um desinteresse vitalício').",
      lifeHistory: "Vivência de divórcio explosivo dos pais na infância marcado por silêncios hostis de semanas seguidos por abandono domiciliar paterno repentino.",
      cognitions: "Crença Intermediária: 'Se eu não me impor de forma barulhenta com ultimatos agora, serei invisibilizada e abandonada como minha mãe foi'. Crença Central: 'Não sou importante o suficiente para ser escutada'.",
      emotions: "Ira defensiva intensa (8/10), ansiedade de desamparo (9/10), taquicardia severa e aperto doloroso no tórax.",
      excessActions: "Cobranças agressivas com tom sarcástico, batidas de portas na cozinha, ultimatos repetidos sob ameaça de recolha de aliança conjugal.",
      deficitActions: "Falta de assertividade tranquila para adiar o assunto, escuta terapêutica da exaustão física do parceiro e comunicação aberta em tom calmo no dia seguinte.",
      immediateReinforcement: "Alívio momentâneo da ansiedade devido à descarga de ira e atenção reativa (embora belicosa) obtida à força do parceiro.",
      immediatePunishment: "Briga explosiva mútua em que ambos trocam ofensas pesadas e se retiram para dormir em ambientes apartados da residência.",
      finalReinforcement: "Prevenção disfuncional provisória do abandono (mantém o parceiro ocupado na discussão reativa, sem espaço para silêncio espontâneo).",
      finalPunishment: "Corrosão progressiva do afeto recíproco, distanciamento voluntário do cônjuge que passa a evitar voltar cedo para casa, aumento da sensação de inadequação e desamparo pessoal crônico."
    },
    {
      label: "Sobrecarregamento no Trabalho (Perfeccionismo e Burnout)",
      situation: "Coordenador corporativo solicita em cima da hora um relatório de análise de metas adicionais sem redefinir os prazos prévios já esgotados.",
      necessity: "Reconhecimento, competência autêntica e conservação de limites biológicos e de saúde física e mental.",
      realStressors: "Acúmulo factual de 4 projetos paralelos de auditoria com datas de entrega coincidentes e escassez crônica de mão de obra assistente sênior.",
      distortedStressors: "Raciocínio emocional ('Se estou com medo, significa que sou incapaz para o cargo'); hipergeneralização ('Se eu pedir prazos, estragarei para sempre meu plano de carreira').",
      lifeHistory: "Educação rígida e exigente orientada a conquistas excepcionais sob pena de privação de carinho e rejeição afetiva explícita dos genitores se as notas caíssem.",
      cognitions: "Regra Condicional: 'Eu preciso satisfazer perfeitamente toda e qualquer solicitação de chefia e jamais relatar fraquezas, ou serei desmascarado como uma fraude preguiçosa'. Central: 'Sou falho e incapaz'.",
      emotions: "Esgotamento depressivo agudo, pânico velado (7/10), desamparo, insônia persistente de início de noite e cefaleia tensional.",
      excessActions: "Aceitar a requisição sorrindo sem fazer ressalvas de agenda, trabalhar madrugadas adentro sacrificando o sono e a alimentação básica.",
      deficitActions: "Falta de delegação, ausência de habilidades de negociação transparente de cronograma e direito de dizer não amparado em limites de capacidade.",
      immediateReinforcement: "Aprovação inicial imediata da diretoria e diminuição da fantasia terrível do desmascaramento rápido por mais de 24h.",
      immediatePunishment: "Exaustão psíquica extrema, erro metodológico primário induzido pela fadiga física nos projetos e comprometimento da atenção em reuniões de prestação de contas.",
      finalReinforcement: "Manutenção temporária da imagem idealizada de 'superfuncionário infalível' com custos abusivos à própria integridade vital.",
      finalPunishment: "Instalação definitiva da Síndrome de Burnout clínica, necessidade de afastamento de saúde compulsório, sentimentos de absoluto colapso e depreciação crônica das próprias habilidades."
    },
    {
      label: "Isolamento e Vulnerabilidade Social (Ansiedade Social)",
      situation: "Convidado por conhecidos de um grupo acadêmico para participar de uma comemoração em bar local movimentado após evento.",
      necessity: "Socialização cooperativa, conexão comunitária e expressão voluntária livre sem amarras de máscaras sociais perfeccionistas.",
      realStressors: "Barulhos intensos e circulação massiva de pessoas estranhas no recinto escolhido dificultando engajamentos e futilidade de conversações rápidas de corredor.",
      distortedStressors: "Leitura mental ('Eles me consideram o sujeito mais esquisito e desinteressante da sala'); catastrofização ('Vou gaguejar em público e todos rirão de mim pelas costas').",
      lifeHistory: "Episódio contínuo de bullying humilhante sofrido na pré-adolescência escolar por gaguejar ao ler poesia romântica no auditório sob risos generalizados sem socorro pedagógico.",
      cognitions: "Crença Condicional: 'Se eu ficar calado ou declinar convites, estarei seguro contra escárnios de público'. Crença Central: 'Sou socialmente inadequado, defeituoso e incompatível'.",
      emotions: "Vergonha antecipatória, ansiedade fóbica social (8/10), sudorese palmar extrema e tremores visíveis nos membros superiores.",
      excessActions: "Declinar o convite de última hora mentindo que tem dores estomacais fortes, isolar-se no quarto navegando em redes sociais até tarde.",
      deficitActions: "Ausência de enfrentamento construtivo das sensações físicas, déficit de iniciação de pequenos diálogos livres e de aceitação humilde da própria imperfeição interpessoal.",
      immediateReinforcement: "Alívio físico imediato e intenso decorrente de escapar da situação assustadora geradora de ansiedade.",
      immediatePunishment: "Solidão pungente de fim de semana, sensação amarga de auto-sabotagem crônica e autocobranças impiedosas no quarto.",
      finalReinforcement: "Proteção contra a fantasia revivida de bullying e humilhação na infância.",
      finalPunishment: "Atrofia das habilidades de conversação social básica por falta de exposição reflexiva, enfraquecimento drástico do círculo de pretendidos contatos espontâneos e manutenção duradoura da autoimagem desadaptada."
    }
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (confirm("Gostaria de carregar este preset de RID estruturado? Isso criará um novo registro de interações disfuncionais para o paciente.")) {
      const newId = "rid_" + Date.now();
      const newInteraction: RidInteraction = {
        id: newId,
        situation: preset.situation,
        necessity: preset.necessity,
        realStressors: preset.realStressors,
        distortedStressors: preset.distortedStressors,
        lifeHistory: preset.lifeHistory,
        cognitions: preset.cognitions,
        emotions: preset.emotions,
        excessActions: preset.excessActions,
        deficitActions: preset.deficitActions,
        immediateReinforcement: preset.immediateReinforcement,
        immediatePunishment: preset.immediatePunishment,
        finalReinforcement: preset.finalReinforcement,
        finalPunishment: preset.finalPunishment
      };
      setState(prev => ({
        ...prev,
        interactions: [...prev.interactions, newInteraction]
      }));
      setSelectedId(newId);
    }
  };

  const handleCreateNew = () => {
    const newId = "rid_" + Date.now();
    const newInteraction: RidInteraction = {
      id: newId,
      situation: "Situação: Onde ocorreu, com quem...",
      necessity: "Necessidade latente de satisfação ou privação em jogo...",
      realStressors: "Estressores reais externos do ambiente (fatos)...",
      distortedStressors: "Estressores distorcidos gerados por vieses e leituras mentais...",
      lifeHistory: "Histórico de vida associado representativo...",
      cognitions: "Esquemas, regras condicionais ou pensamentos automáticos latentes...",
      emotions: "Reações emocionais subjetivas e físicas...",
      excessActions: "Ações desadaptativas em excesso...",
      deficitActions: "Ações essenciais omitidas ou em déficit...",
      immediateReinforcement: "Reforço imediato que mantém o padrão (alívio)...",
      immediatePunishment: "Punição imediata do comportamento disfuncional...",
      finalReinforcement: "Ganhos secundários de longo prazo ou perpetuações...",
      finalPunishment: "Custo final, privação emocional e reações adversas a longo prazo..."
    };
    setState(prev => ({
      ...prev,
      interactions: [...prev.interactions, newInteraction]
    }));
    setSelectedId(newId);
    setViewMode("editor");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Gostaria de excluir permanentemente este Registro de Interações Disfuncionais (RID)?")) {
      setState(prev => {
        const filtered = prev.interactions.filter(i => i.id !== id);
        return { ...prev, interactions: filtered };
      });
      if (selectedId === id) {
        const remaining = state.interactions.filter(i => i.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const updateField = (field: keyof RidInteraction, val: string) => {
    if (!selectedId) return;
    setState(prev => ({
      ...prev,
      interactions: prev.interactions.map(item => 
        item.id === selectedId ? { ...item, [field]: val } : item
      )
    }));
  };

  const activeInteraction = state.interactions.find(i => i.id === selectedId);

  // Score computation ("Índice de Completude de Autoconsciência" - ICA)
  const calculateICA = (item: RidInteraction) => {
    let score = 10; // completed presence
    const fieldsToTest: (keyof RidInteraction)[] = [
      "situation", "necessity", "realStressors", "distortedStressors", "lifeHistory",
      "cognitions", "emotions", "excessActions", "deficitActions",
      "immediateReinforcement", "immediatePunishment", "finalReinforcement", "finalPunishment"
    ];

    let filledCount = 0;
    fieldsToTest.forEach(f => {
      const val = item[f] as string;
      if (val && val.length > 20 && !val.includes("Ex: ") && !val.startsWith("Situação:") && !val.startsWith("Necessidade") && !val.includes("...")) {
        filledCount++;
      }
    });

    score += (filledCount * 7); // max 91. 10 + 91 = 101, capped at 100
    return Math.min(100, score);
  };

  const activeICA = activeInteraction ? calculateICA(activeInteraction) : 0;
  const countIn = state.interactions.length;
  const avgICA = countIn > 0 
    ? Math.round(state.interactions.reduce((acc, i) => acc + calculateICA(i), 0) / countIn)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn" id="rid-view-container">

      {/* Dynamic Supervisor Banner */}
      <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/20 p-4 rounded-xl text-xs text-cyan-300 space-y-1 block" id="superv-instruct-rid">
        <strong className="text-gray-100 block font-sans text-sm mb-1 uppercase tracking-wide">🔬 INSTRUMENTO 18: REGISTRO DE INTERAÇÕES DISFUNCIONAIS (RID)</strong>
        <span className="text-gray-400 font-sans">
          O instrumento <strong>RID (Registro de Interações Disfuncionais)</strong>, concebido por Poubel e Rodrigues (Inteligência Psicológica), 
          constitui um avanço clínico integrativo sobre a teoria analítico-comportamental e o clássico RDPD cognitivo-comportamental de Aaron Beck. Ele não apenas analisa o evento situacional, 
          mas promove o mapeamento de nexos históricos de dor (Histórico de Vida), discriminação de privação ativa (Necessidade), subdivisão entre estressores factuais ou enviesados, 
          e mapeia a tríade funcional de Ações (Excessos vs. Déficits) e Consequências Imediatas e Finais do padrão autoderrotista. Use o painel interativo abaixo para consolidar essas interações.
        </span>
      </div>

      {/* Patient Core Info Panel */}
      <div className="bg-[#111217] border border-gray-900 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-400" id="patient-banner-rid">
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Paciente / Cliente</span>
          <span className="text-gray-200 font-sans font-semibold text-xs py-1 block">{patient.name || "Nenhum Paciente Cadastrado"}</span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Pilar de Desenvolvimento</span>
          <span className="text-cyan-400 font-sans text-xs font-bold py-1 block flex items-center gap-1">
            <Compass className="w-4 h-4 text-cyan-400" />
            Mapeamento Funcional de Padrões Autoderrotistas
          </span>
        </div>
        <div>
          <span className="text-gray-650 block uppercase font-bold text-[9px] mb-1">Alvo Clínico</span>
          <div className="text-gray-200 font-sans text-xs py-1 block">Extinção de Excessos e Treinamento de Novas Habilidades</div>
        </div>
      </div>

      {/* Clinical Presets Section */}
      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900 space-y-2" id="rid-presets-deck">
        <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          ⚡ Casos Presets Clínicos Estruturados para Carregamento Rápido:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-[10.5px] font-sans font-medium px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500 hover:bg-cyan-950/10 transition-all cursor-pointer block"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numeric calculations columns / stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="stats-dashboard-row-rid">
        
        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-cases-count">
          <div className="space-y-0.5">
            <span className="text-gray-500 font-mono text-[9px] uppercase block">Interações Mapeadas</span>
            <span className="font-mono text-xl font-bold text-gray-200 block">{countIn} interações</span>
          </div>
          <Layers className="w-8 h-8 text-gray-700" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-avg-ica">
          <div className="space-y-0.5">
            <span className="text-cyan-400 font-mono text-[9px] uppercase block">Índice Autoconsciência Geral (ICA)</span>
            <span className="font-mono text-xl font-bold text-cyan-400 block">{avgICA}% médio</span>
          </div>
          <Activity className="w-8 h-8 text-cyan-950" />
        </div>

        <div className="bg-[#111217] border border-gray-900 p-4.5 rounded-xl flex items-center justify-between text-xs" id="stat-current-ica">
          <div className="space-y-0.5">
            <span className="text-emerald-400 font-mono text-[9px] uppercase block">Completude do Casuístico Ativo</span>
            <span className="font-mono text-xl font-bold text-emerald-400 block">
              {activeInteraction ? `${activeICA}%` : "0%"}
            </span>
          </div>
          <Award className="w-8 h-8 text-emerald-950" />
        </div>

      </div>

      {/* Navigation and Actions Row */}
      <div className="flex justify-between items-center bg-gray-950/60 p-2.5 rounded-xl border border-gray-900" id="top-nav-bar-rid">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode("editor")}
            className={`text-xs px-3 py-1.5 rounded-lg font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "editor" 
                ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Mapeamento Interativo</span>
          </button>
          
          <button
            type="button"
            disabled={!activeInteraction}
            onClick={() => setViewMode("sheet")}
            className={`text-xs px-3 py-1.5 rounded-lg font-sans font-bold transition-all flex items-center gap-1.5 ${
              !activeInteraction 
                ? "opacity-55 cursor-not-allowed text-gray-750"
                : viewMode === "sheet"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "text-gray-400 hover:text-white cursor-pointer"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Matriz do Livro de Mesa</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="px-3.5 py-1.5 text-xs rounded-xl bg-cyan-400 text-black font-extrabold hover:bg-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Interação</span>
        </button>
      </div>

      {/* Display workspace */}
      {viewMode === "editor" ? (
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="editor-view-rid-layout">
          
          {/* Side navigation bar list directories items */}
          <div className="lg:col-span-3 flex flex-col space-y-2" id="sidebar-sessions-rid">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono font-bold block mb-1">Histórico de Sessões ({countIn}):</span>
            
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {state.interactions.length > 0 ? (
                state.interactions.map(item => {
                  const isSelected = item.id === selectedId;
                  const itemICA = calculateICA(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative group cursor-pointer ${
                        isSelected 
                          ? "bg-[#111217] border-cyan-500/40 text-white shadow-md" 
                          : "bg-gray-950/40 border-gray-900/50 hover:border-gray-850 text-gray-400"
                      }`}
                      id={`rid-sidebar-item-${item.id}`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-l-xl" />
                      )}
                      
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-0.5 block flex-1">
                          <span className="text-[8px] uppercase font-mono font-extrabold text-cyan-400 block tracking-wide">
                            Contexto / Situação:
                          </span>
                          <p className="text-xs font-sans font-bold text-gray-200 line-clamp-2 leading-tight">
                            {item.situation || "Sem Situação Denominada"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="text-gray-650 hover:text-red-500 transition-colors p-0.5 cursor-pointer opacity-30 group-hover:opacity-100 shrink-0"
                          title="Excluir esta interação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-gray-900/40 text-[8.5px] font-mono">
                        <span className="text-gray-500 truncate max-w-[130px]" title={item.necessity}>Nec: {item.necessity}</span>
                        <span className={`px-1 rounded-sm text-[8px] ${
                          itemICA >= 75 ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                        }`}>ICA: {itemICA}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-gray-650 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-xl bg-gray-950/10">
                  Nenhuma interação registrada. Carregue um preset clínico acima ou crie uma nova interação do zero.
                </div>
              )}
            </div>
          </div>

          {/* Interactive Detailed form editor */}
          <div className="lg:col-span-9 flex flex-col space-y-6" id="form-active-panel-rid">
            {activeInteraction ? (
              <div className="bg-[#111217] border border-gray-900 rounded-2xl p-6 space-y-6 animate-fadeIn" id="interactive-assessment-inputs-rid">
                
                {/* Section title header */}
                <div className="border-b border-gray-900 pb-3" id="rid-panel-subheading">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Clipboard className="w-4 h-4" />
                    Análise Modular de Conduta e Registro de Variáveis do Padrão
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">Preencha cada um dos seis macroblocos da matriz RID de Poubel e Rodrigues para consolidar a autoconsciência reflexiva.</p>
                </div>

                {/* Bloco 1: Histórico de Vida e Cognições Nucleares */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950/40 p-4 rounded-xl border border-gray-900/60" id="macro-block-1-rid">
                  <div className="space-y-1 block">
                    <label className="text-cyan-400 text-[10px] font-extrabold uppercase tracking-widest block font-mono flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      EVENTOS DO HISTÓRICO DE VIDA:
                    </label>
                    <textarea
                      value={activeInteraction.lifeHistory}
                      onChange={(e) => updateField("lifeHistory", e.target.value)}
                      className="w-full min-h-[105px] h-28 p-2.5 bg-gray-950 border border-gray-905 rounded-xl text-xs text-rose-300 font-sans focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none block leading-relaxed"
                      placeholder="Ex: Histórico infante de cobranças hostis, bullying, abandono de pais..."
                    />
                  </div>

                  <div className="space-y-1 block">
                    <label className="text-cyan-400 text-[10px] font-extrabold uppercase tracking-widest block font-mono flex items-center gap-1">
                      <Compass className="w-3 h-3 text-emerald-400" />
                      COGNIÇÕES (Crenças e Regras):
                    </label>
                    <textarea
                      value={activeInteraction.cognitions}
                      onChange={(e) => updateField("cognitions", e.target.value)}
                      className="w-full min-h-[105px] h-28 p-2.5 bg-gray-950 border border-gray-905 rounded-xl text-xs text-emerald-200 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none block leading-relaxed"
                      placeholder="Ex: Crenças centrais de desamparo/inadequação e regras condicionais de hipervigilância..."
                    />
                  </div>
                </div>

                {/* Bloco 2: Contexto Completo: Situação, Necessidade, Estressores (Reais vs Distorcidos) */}
                <div className="bg-[#111217] space-y-4 rounded-xl border border-gray-900 p-4" id="macro-block-2-rid">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider block">🏢 MACROBLOCO CONTEXTO (PREMISSAS E DISPARADORES):</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 block">
                      <label className="text-gray-400 text-[9.5px] font-bold uppercase block font-mono">SITUAÇÃO GATILHO:</label>
                      <input
                        type="text"
                        value={activeInteraction.situation}
                        onChange={(e) => updateField("situation", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                        placeholder="Ex: Feedback negativo do chefe perante a equipe..."
                      />
                    </div>
                    <div className="space-y-1 block">
                      <label className="text-gray-400 text-[9.5px] font-bold uppercase block font-mono">NECESSIDADE EM PRIVAÇÃO:</label>
                      <input
                        type="text"
                        value={activeInteraction.necessity}
                        onChange={(e) => updateField("necessity", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-lg text-white text-xs outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                        placeholder="Ex: Reconhecimento profissional, segurança financeira, conexão..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 block">
                      <label className="text-gray-450 text-[9px] font-bold uppercase block font-mono">ESTRESSORES REAIS (Factuais / Circunstanciais):</label>
                      <textarea
                        value={activeInteraction.realStressors}
                        onChange={(e) => updateField("realStressors", e.target.value)}
                        className="w-full h-20 p-2 bg-gray-950 border border-gray-900 rounded-lg text-[11px] text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none block leading-normal"
                        placeholder="Quais são os fatos objetivos e limites tangíveis em jogo..."
                      />
                    </div>
                    <div className="space-y-1 block">
                      <label className="text-gray-455 text-[9px] font-bold uppercase block font-mono">ESTRESSORES DISTORCIDOS (Crenças de Viés / Leituras Mentais):</label>
                      <textarea
                        value={activeInteraction.distortedStressors}
                        onChange={(e) => updateField("distortedStressors", e.target.value)}
                        className="w-full h-20 p-2 bg-gray-950 border border-gray-900 rounded-lg text-[11px] text-gray-300 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none block leading-normal"
                        placeholder="Quais as inferências errôneas ou previsões catastróficas projetadas..."
                      />
                    </div>
                  </div>
                </div>

                {/* Bloco 3: Reações Emocionais */}
                <div className="space-y-1 block" id="macro-block-3-rid">
                  <label className="text-cyan-400 text-[10px] font-extrabold uppercase tracking-widest block font-mono">
                    🎭 REAÇÕES EMOÇÕES E ATIVAÇÃO FISIOLÓGICA:
                  </label>
                  <input
                    type="text"
                    value={activeInteraction.emotions}
                    onChange={(e) => updateField("emotions", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-900 rounded-xl text-xs text-rose-250 font-sans outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Ex: Raiva defensiva (9/10), ansiedade aguda de desamparo, aperto forte no peito, taquicardia..."
                  />
                </div>

                {/* Bloco 4: Ações (Excessos e Déficits) */}
                <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-900 flex flex-col space-y-3" id="macro-block-4-rid">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider block">⚡ MACROBLOCO AÇÕES (CONDUTA OPERANTE):</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 block">
                      <label className="text-red-400 text-[9px] font-extrabold uppercase block font-mono">EXCESSOS COMPORTAMENTAIS (O que faz em excesso disfuncional):</label>
                      <textarea
                        value={activeInteraction.excessActions}
                        onChange={(e) => updateField("excessActions", e.target.value)}
                        className="w-full h-24 p-2.5 bg-gray-950 border border-red-950/20 rounded-xl text-xs text-red-200 font-sans focus:outline-none focus:ring-1 focus:ring-red-500 resize-none block leading-relaxed"
                        placeholder="Ex: Cobranças ruidosas, ultimatos, explosões verbais, mentiras de esquiva, passividade belicosa..."
                      />
                    </div>
                    <div className="space-y-1 block">
                      <label className="text-orange-400 text-[9px] font-extrabold uppercase block font-mono">DÉFICITS COMPORTAMENTAIS (HabilidadesPsic que faltam agir):</label>
                      <textarea
                        value={activeInteraction.deficitActions}
                        onChange={(e) => updateField("deficitActions", e.target.value)}
                        className="w-full h-24 p-2.5 bg-gray-950 border border-orange-950/20 rounded-xl text-xs text-orange-200 font-sans focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none block leading-relaxed"
                        placeholder="Ex: Assertividade controladora tranquila, paciência terapêutica, capacidade de adiar para dialogar sob calma..."
                      />
                    </div>
                  </div>
                </div>

                {/* Bloco 5: Consequências (Imediatas vs. Finais) */}
                <div className="bg-cyan-500/[0.015] border border-cyan-950/25 p-4 rounded-xl space-y-4" id="macro-block-5-rid">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">📊 MACROBLOCO CONSEQUENCIAS (ANÁLISE FUNCIONAL DE MANUTENÇÃO):</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Imediatas */}
                    <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-900 space-y-2">
                      <span className="text-[9.5px] text-gray-400 font-mono font-black uppercase tracking-wide block border-b border-gray-850 pb-1">CONSEQUÊNCIAS IMEDIATAS (Curto Prazo)</span>
                      
                      <div className="space-y-2">
                        <div className="space-y-0.5 block">
                          <label className="text-emerald-400 text-[8.5px] font-bold block font-mono">REFORÇO IMEDIATO (Ganhos de Alívio):</label>
                          <input
                            type="text"
                            value={activeInteraction.immediateReinforcement}
                            onChange={(e) => updateField("immediateReinforcement", e.target.value)}
                            className="w-full px-2 py-1 bg-gray-950 border border-gray-900 rounded text-xs text-gray-300 font-sans"
                            placeholder="Alívio súbito da ansiedade aguda..."
                          />
                        </div>
                        <div className="space-y-0.5 block">
                          <label className="text-red-400 text-[8.5px] font-bold block font-mono">PUNIÇÃO IMEDIATA (Perdas Rápidas):</label>
                          <input
                            type="text"
                            value={activeInteraction.immediatePunishment}
                            onChange={(e) => updateField("immediatePunishment", e.target.value)}
                            className="w-full px-2 py-1 bg-gray-950 border border-gray-900 rounded text-xs text-gray-300 font-sans"
                            placeholder="Briga ruidosa instantânea conjugal..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Finais */}
                    <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-900 space-y-2">
                      <span className="text-[9.5px] text-gray-400 font-mono font-black uppercase tracking-wide block border-b border-gray-850 pb-1">CONSEQUÊNCIAS FINAIS (Longo Prazo)</span>
                      
                      <div className="space-y-2">
                        <div className="space-y-0.5 block">
                          <label className="text-emerald-400 text-[8.5px] font-bold block font-mono">REFORÇO LONGO PRAZO:</label>
                          <input
                            type="text"
                            value={activeInteraction.finalReinforcement}
                            onChange={(e) => updateField("finalReinforcement", e.target.value)}
                            className="w-full px-2 py-1 bg-gray-950 border border-gray-900 rounded text-xs text-gray-300 font-sans"
                            placeholder="Agressão reprime o abandono percebido..."
                          />
                        </div>
                        <div className="space-y-0.5 block">
                          <label className="text-red-400 text-[8.5px] font-bold block font-mono">PUNIÇÃO LONGO PRAZO (Custo Total Extremo):</label>
                          <input
                            type="text"
                            value={activeInteraction.finalPunishment}
                            onChange={(e) => updateField("finalPunishment", e.target.value)}
                            className="w-full px-2 py-1 bg-gray-950 border border-gray-900 rounded text-xs text-gray-300 font-sans"
                            placeholder="Desgaste conjugal drástico irreversível..."
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Clinician general observations text area */}
                <div className="space-y-1 block" id="macro-block-6-rid">
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block font-mono">
                    📝 COMENTÁRIOS E APONTAMENTOS TERAPÊUTICOS ADICIONAIS:
                  </label>
                  <textarea
                    value={state.clinicalNotes}
                    onChange={(e) => setState(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                    placeholder="Adicione notas adicionais de terapia, diretrizes de manejo para o paciente ou planos de contingência..."
                    className="w-full bg-gray-950 border border-gray-900 p-2.5 text-xs rounded-xl text-gray-350 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 block min-h-[60px]"
                  />
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-gray-600 font-mono text-[10px] italic border border-dashed border-gray-900 rounded-2xl bg-[#111217] flex flex-col items-center justify-center space-y-2 animate-pulse">
                <Clipboard className="w-10 h-10 text-gray-800" />
                <span>Nenhum Registro de Interação cadastrado no momento. Adicione um novo utilizando a barra lateral ou prepare um de nossos presets criados para agilizar o atendimento clínico.</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        
        // MATRIZ DO LIVRO DE MESA (PDF LANDSCAPE-MIMICKING SCHEME)
        <div className="w-full max-w-7xl mx-auto py-2 flex flex-col space-y-6" id="printed-matrix-rid-view">
          {activeInteraction ? (
            <div className="space-y-4">
              
              <p className="text-[11px] text-center text-gray-500 italic max-w-2xl mx-auto">
                A visualização de matriz simula com precisão o design físico e estrutural do PDF clássico RID (Registro de Interações Disfuncionais de Poubel e Rodrigues), permitindo uma exploração clara e sequencial das variáveis do nexo operante.
              </p>

              {/* Landscape Paper Block */}
              <div className="bg-white text-gray-950 rounded-2xl p-7 shadow-2xl border-4 border-gray-900 relative font-sans select-text block overflow-x-auto" id="printed-sheet-rid">
                <div className="min-w-[1050px] space-y-6">
                  
                  {/* Row 1: Brand labels */}
                  <div className="flex justify-between items-center border-b-2 border-gray-900 pb-2.5" id="p-header-rid">
                    <div className="flex items-center gap-1.5 font-bold font-sans text-xs tracking-wider text-gray-900 uppercase">
                      <Clipboard className="w-4.5 h-4.5 text-gray-950" />
                      <span>REGISTRO DE INTERAÇÕES DISFUNCIONAIS (RID)</span>
                    </div>
                    <span className="text-[8.5px] font-mono font-black text-gray-500 tracking-widest uppercase">POUBEL E RODRIGUES - INTELIGÊNCIA PSICOLÓGICA</span>
                  </div>

                  {/* Row 2: Client metadata line */}
                  <div className="grid grid-cols-3 gap-6 p-3 bg-gray-100 border border-gray-300 rounded text-[9.5px] font-mono text-gray-600" id="p-metadata-rid">
                    <div>
                      <strong>PACIENTE:</strong> <span className="font-sans font-bold text-gray-900 text-[10.5px] ml-1">{patient.name || "NÃO CADASTRADO"}</span>
                    </div>
                    <div>
                      <strong>PROFISSIONAL:</strong> <span className="font-sans font-medium text-gray-900 text-[10.5px] ml-1">Supervisor Clínico TCC</span>
                    </div>
                    <div className="text-right">
                      <strong>COMPLETUDE (ICA):</strong> <span className="font-sans font-bold text-cyan-750 text-[10.5px]">{activeICA}%</span>
                    </div>
                  </div>

                  {/* Row 3: Historic context and rules (Top areas) */}
                  <div className="grid grid-cols-12 gap-4 border-b-2 border-gray-300 pb-4" id="p-life-history-row">
                    
                    {/* Eventos Historicos de Vida */}
                    <div className="col-span-4 bg-red-100/10 border border-red-300 p-3 rounded-lg flex flex-col justify-between">
                      <span className="text-[9.5px] font-black text-red-900 block uppercase border-b border-red-250 pb-1 mb-1.5">EVENTOS SIGNIFICATIVOS DO HISTÓRICO DE VIDA</span>
                      <p className="text-[10.5px] font-serif text-gray-800 leading-relaxed font-normal italic">
                        {activeInteraction.lifeHistory || "Não relatado."}
                      </p>
                    </div>

                    {/* Cognições */}
                    <div className="col-span-4 bg-emerald-100/10 border border-emerald-300 p-3 rounded-lg flex flex-col justify-between">
                      <span className="text-[9.5px] font-black text-emerald-900 block uppercase border-b border-emerald-250 pb-1 mb-1.5">COGNIÇÕES (Crenças, Padrões, Regras)</span>
                      <p className="text-[10.5px] font-sans text-gray-900 leading-relaxed font-medium">
                        {activeInteraction.cognitions || "Não preenchido."}
                      </p>
                    </div>

                    {/* Emoções */}
                    <div className="col-span-4 bg-amber-100/10 border border-amber-300 p-3 rounded-lg flex flex-col justify-between">
                      <span className="text-[9.5px] font-black text-amber-900 block uppercase border-b border-amber-250 pb-1 mb-1.5">EMOÇÕES E FISIOLOGIA ASSOCIADA</span>
                      <p className="text-[10.5px] font-sans text-rose-900 leading-relaxed font-bold">
                        {activeInteraction.emotions || "Não relatado."}
                      </p>
                    </div>

                  </div>

                  {/* Row 4: Column structural layout exactly like screenshot */}
                  <div className="border border-gray-900 rounded-xl overflow-hidden grid grid-cols-12 divide-x divide-gray-900 text-xs" id="p-matrix-columns-mesh">
                    
                    {/* COL 1-3: CONTEXTO */}
                    <div className="col-span-4 flex flex-col divide-y divide-gray-300">
                      
                      <div className="bg-gray-100/80 p-1.5 text-center font-bold text-[9px] uppercase tracking-wider text-gray-700">
                        Macrobloco Contexto
                      </div>

                      <div className="p-3 bg-blue-10/10 min-h-[140px] flex flex-col justify-between">
                        <span className="text-[8px] font-extrabold text-blue-900 uppercase block tracking-wider leading-none">A. SITUAÇÃO</span>
                        <p className="text-[10px] font-sans font-semibold text-gray-900 mt-2 block leading-relaxed">
                          {activeInteraction.situation || "-"}
                        </p>
                      </div>

                      <div className="p-3 bg-blue-10/10 min-h-[130px] flex flex-col justify-between">
                        <span className="text-[8px] font-extrabold text-blue-900 uppercase block tracking-wider leading-none">B. NECESSIDADE ATIVA</span>
                        <p className="text-[10px] font-sans text-gray-800 mt-2 block leading-relaxed italic">
                          {activeInteraction.necessity || "-"}
                        </p>
                      </div>

                      <div className="p-3 bg-blue-10/10 min-h-[150px] grid grid-cols-2 divide-x divide-gray-300">
                        <div className="pr-2 flex flex-col">
                          <span className="text-[7.5px] font-bold text-gray-650 uppercase block leading-tight border-b border-gray-200 pb-0.5 mb-1">STRESSOR REAL</span>
                          <span className="text-[9.5px] font-sans text-gray-700 leading-tight block">{activeInteraction.realStressors || "-"}</span>
                        </div>
                        <div className="pl-2 flex flex-col">
                          <span className="text-[7.5px] font-bold text-gray-650 uppercase block leading-tight border-b border-gray-200 pb-0.5 mb-1">STRESSOR DISTORCIDO</span>
                          <span className="text-[9.5px] font-sans text-gray-700 leading-tight block font-semibold text-red-800">{activeInteraction.distortedStressors || "-"}</span>
                        </div>
                      </div>

                    </div>

                    {/* COL 4-6: AÇÕES */}
                    <div className="col-span-4 flex flex-col divide-y divide-gray-300">
                      
                      <div className="bg-gray-100/80 p-1.5 text-center font-bold text-[9px] uppercase tracking-wider text-gray-700">
                        Macrobloco Ações (Comportamentos)
                      </div>

                      <div className="p-3.5 bg-red-10/10 min-h-[210px] flex flex-col justify-between">
                        <span className="text-[8px] font-black text-red-800 uppercase block tracking-wider leading-none">EXCESSOS COMPORTAMENTAIS</span>
                        <p className="text-[10.5px] font-sans text-red-950 font-bold leading-relaxed mt-2.5">
                          {activeInteraction.excessActions || "-"}
                        </p>
                      </div>

                      <div className="p-3.5 bg-orange-10/10 min-h-[210px] flex flex-col justify-between">
                        <span className="text-[8px] font-black text-orange-850 uppercase block tracking-wider leading-none">DÉFICITS COMPORTAMENTAIS</span>
                        <p className="text-[10.5px] font-sans text-orange-950 mt-2.5 leading-relaxed font-semibold">
                          {activeInteraction.deficitActions || "-"}
                        </p>
                      </div>

                    </div>

                    {/* COL 7-12: CONSEQUÊNCIAS */}
                    <div className="col-span-4 flex flex-col divide-y divide-gray-300">
                      
                      <div className="bg-gray-100/80 p-1.5 text-center font-bold text-[9px] uppercase tracking-wider text-gray-700">
                        Socio-Consequências (Manutenção do padrão)
                      </div>

                      {/* Imediatas */}
                      <div className="p-3.5 bg-cyan-10/10 min-h-[210px] flex flex-col space-y-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase block tracking-wider leading-none border-b border-gray-300 pb-1 mb-1">IMEDIATAS (Curto Prazo)</span>
                        
                        <div className="space-y-1 block">
                          <strong className="text-[7.5px] font-mono uppercase text-emerald-800 block">REFORÇO (Ganho de Alívio):</strong>
                          <p className="text-[10px] font-sans text-emerald-900 leading-tight font-medium">{activeInteraction.immediateReinforcement || "Não relatado."}</p>
                        </div>
                        <div className="space-y-1 block pt-1.5 border-t border-dashed border-gray-200">
                          <strong className="text-[7.5px] font-mono uppercase text-red-800 block">PUNIÇÃO (Prejuízo Rápido):</strong>
                          <p className="text-[10px] font-sans text-red-900 leading-tight">{activeInteraction.immediatePunishment || "Não relatado."}</p>
                        </div>
                      </div>

                      {/* Finais */}
                      <div className="p-3.5 bg-cyan-10/10 min-h-[210px] flex flex-col space-y-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase block tracking-wider leading-none border-b border-gray-300 pb-1 mb-1">FINAIS (Longo Prazo)</span>
                        
                        <div className="space-y-1 block">
                          <strong className="text-[7.5px] font-mono uppercase text-emerald-800 block">REFORÇO (Ganhos Secundários):</strong>
                          <p className="text-[10px] font-sans text-emerald-900 leading-tight font-semibold">{activeInteraction.finalReinforcement || "Não relatado."}</p>
                        </div>
                        <div className="space-y-1 block pt-1.5 border-t border-dashed border-gray-200">
                          <strong className="text-[7.5px] font-mono uppercase text-red-800 block">PUNIÇÃO (Custo de Vida / Danidades):</strong>
                          <p className="text-[10.5px] font-sans text-red-950 font-bold leading-tight">{activeInteraction.finalPunishment || "Não preenchido."}</p>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Matrix footer validation credits stamp */}
                  <div className="mt-4 pt-3 border-t border-gray-300 flex justify-between items-center text-[8.5px] font-mono text-gray-450 uppercase" id="p-footer-stamp">
                    <span>ÍNDICE GLOBAL DE AUTOCONSCIÊNCIA DO CLIENTE: {activeICA}%</span>
                    <span>Plano de Moderação de Comportamentos Autoderrotistas</span>
                  </div>

                </div>
              </div>

              {/* Extra observations */}
              {state.clinicalNotes && (
                <div className="p-4 bg-[#111217] rounded-xl border border-gray-900 text-xs text-gray-400 space-y-1 block" id="printed-rid-notes-addendum">
                  <strong className="text-gray-200 font-mono text-[9px] uppercase tracking-wide text-cyan-400 block">📝 EXTRAS / HISTÓRIA DE TRATAMENTO ADICIONAL:</strong>
                  <p className="font-sans leading-relaxed text-gray-300">{state.clinicalNotes}</p>
                </div>
              )}

            </div>
          ) : null}
        </div>

      )}

    </div>
  );
}
