import React, { useState } from "react";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MapPin, 
  CheckCircle, 
  Activity, 
  Compass,
  ArrowRight
} from "lucide-react";

interface UserGuideTourProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  id: string;
  tabKey: string;
  title: string;
  badge: string;
  desc: string;
  instructions: string[];
  tips: string;
}

const tourSteps: TourStep[] = [
  {
    id: "step1",
    tabKey: "profiler",
    title: "1. Prontuário Clínico & Registros RID",
    badge: "Ficha Base",
    desc: "O ponto inicial do tratamento. Aqui você realiza o cadastro demográfico denso do paciente e mapeia seus gatilhos, esquemas e necessidades de infância.",
    instructions: [
      "Cadastre ou altere dados demográficos, queixas e crenças ativadas de Pedro Henrique Silveira.",
      "Crie ou edite novos registros RIDs (Registro de Interação Disfuncional) que funcionam como dever de casa para analisar reações somatocognitivas, pensamentos automáticos e consequências nos atritos cotidianos.",
      "Preencha o RID e ganhe +150 XP de Neuroplasticidade!"
    ],
    tips: "Dica Clínica: Use o painel de RIDs para monitorar as reações imediatas e de longo prazo de Pedro diante de prazos apertados."
  },
  {
    id: "step2",
    tabKey: "scales",
    title: "2. Escalas & Evidências Clínicas (BAI, BDI e Neurocognitivo)",
    badge: "Psicometria",
    desc: "Módulo neuropsicológico quantitativo do Neocortex. Permite calcular precisamente o estado do paciente através de escalas clínicas e testes operacionais de inibição.",
    instructions: [
      "Submeta o Inventário de Ansiedade de Beck (BAI) marcando a gravidade somatovisceral dos sintomas para calcular a pontuação de ansiedade.",
      "Submeta o Inventário de Depressão de Beck (BDI) avaliando tristezas, autocríticas severas e pessimismo.",
      "Inicie o Teste Neurocognitivo Go/No-Go: Clique apenas nos círculos VERDES síncronos e evite os círculos vermelhos para treinar a inibição de resposta do córtex pré-frontal sob pressão!"
    ],
    tips: "Dica Clínica: O teste Go/No-Go mede a impulsividade atenta do paciente, fator chave na modulação de crises ansiosas."
  },
  {
    id: "step3",
    tabKey: "clinical-map",
    title: "3. Formulação e Mapeamento Clínico TCC-4",
    badge: "Fisiologia Cognitiva",
    desc: "Visualize graficamente toda a cadeia de processamento psicológico com base na Teoria Cognitiva Avançada de 4ª Geração.",
    instructions: [
      "Observe como as Necessidades Infantis Negligenciadas geram os Esquemas Iniciais Disfuncionais (como Defectividade/Vergonha e Padrões Inflexíveis).",
      "Rastreie o Estilo de Coping (Evitação, Compensação ou Rendição) e acompanhe a transição até as Competências Assertivas saudáveis.",
      "Use este mapa visual interativo para explicar o funcionamento cerebral do paciente nas sessões psicoeducativas."
    ],
    tips: "Dica Clínica: Esta aba age como excelente recurso psicoeducativo de retroalimentação biológica visual."
  },
  {
    id: "step4",
    tabKey: "pharmacology",
    title: "4. Gabinete de Psicofarmacologia & Registro SUD",
    badge: "Química & Fisiologia",
    desc: "Controle as substâncias ativas receitadas e visualize graficamente a correlação termodinâmica entre a meia-vida do fármaco e o nível de estresse SUD.",
    instructions: [
      "Adicione prescrições detalhando miligramas, posologia diária e o nível subjetivo de estresse (SUD).",
      "Consulte o compêndio de psicotrópicos e fitoterápicos (Calmene, Heptaforte, etc.) com suas meias-vidas, receptores (GABAe, 5-HT, etc.) e interações sadias.",
      "Monitore o Gráfico SUD que traça a curva de atenuação ansiosa correlacionada com a saturação de neurotransmissores."
    ],
    tips: "Dica Clínica: O estresse subjetivo de ansiedade (SUD) costuma declinar à medida que os picos de posologia GABAérgica se estabilizam."
  },
  {
    id: "step5",
    tabKey: "periodization",
    title: "5. Periodização de Metas Semanais",
    badge: "Grade Técnica",
    desc: "Estruture o ciclo técnico de intervenção para cada habilidade psicológica com precisão cirúrgica de etapas clínicas.",
    instructions: [
      "Crie metas de treino associadas a Habilidades Psicológicas específicas (como Resolução de Problemas, Autorregulação Emocional, Hedonismo Responsável, etc.).",
      "Configure a Fase de Ciclo Técnico (Aquece, Ativo ou Consolidação), prazos em semanas e nível de prioridade clínica.",
      "Cadastre exercícios técnicos específicos para cada fase de treino e controle o progresso cumulativo das tarefas de casa."
    ],
    tips: "Dica Clínica: Fases em Consolidação ativam rotinas autônomas que perpetuam a manutenção da saúde fora do consultório."
  },
  {
    id: "step6",
    tabKey: "training",
    title: "6. Laboratório de Treino Real (Simulações PDP)",
    badge: "Treino Síncrono",
    desc: "O núcleo gamificado interativo do software. Aqui você executa intervenções vivas direcionadas aos esquemas deficitários e ajuda o paciente a somar XP.",
    instructions: [
      "Selecione a Habilidade Psicológica que deseja submeter ao treino prático (Autorregulação Emocional, Sociabilidade, Autoestima, etc.).",
      "Leia o cenário de caso voltado para a queixa de Pedro e resolva os exercícios clínicos escolhendo comportamentos assertivos sadios e reestruturando sua autocrítica.",
      "Agende atividades de Hedonismo Responsável para quebrar o perfeccionismo ou selecione missões altruístas de desvio de foco para acumular pontos de XP de neuroplasticidade!"
    ],
    tips: "Dica Clínica: Estes exercícios práticos induzem mudanças reacionais de forma empírica e dessensibilizam o medo do erro social."
  },
  {
    id: "step7",
    tabKey: "report",
    title: "7. Relatório de Evolução & Algoritmo Neocortex",
    badge: "Evidências",
    desc: "Aba de consolidação de dados e inteligência analítica. Gere prontas notas de atendimento, laudos descritivos e analise métricas biológicas síncronas.",
    instructions: [
      "Registre novas notas de evolução informando a porcentagem de assertividade verbal e linguagem não-verbal de Pedro.",
      "Preencha marcadores de neurociência: Variabilidade da Frequência Cardíaca (HRV/VFC) do repouso e Eficácia Diafragmática da respiração.",
      "Visualize o Gráfico de Linhas de Evolução Multidimensional do paciente.",
      "Gere o laudo em Markdown e acione o Algoritmo Neocortex para analisar o concatenamento de sessões passadas de forma descritiva e emitir diagnóstico preditivo!"
    ],
    tips: "Dica Clínica: A elevação na VFC (HRV) indica regulação do tônus vagal e consolidação do controle da ansiedade somática."
  }
];

export default function UserGuideTour({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose
}: UserGuideTourProps) {
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = tourSteps[activeStepIdx];

  const handleNext = () => {
    if (activeStepIdx < tourSteps.length - 1) {
      const nextIdx = activeStepIdx + 1;
      setActiveStepIdx(nextIdx);
      // Sync dynamic page navigation based on step
      setCurrentTab(tourSteps[nextIdx].tabKey);
    }
  };

  const handlePrev = () => {
    if (activeStepIdx > 0) {
      const prevIdx = activeStepIdx - 1;
      setActiveStepIdx(prevIdx);
      // Sync dynamic page navigation based on step
      setCurrentTab(tourSteps[prevIdx].tabKey);
    }
  };

  const triggerGoToPage = (tabKey: string) => {
    setCurrentTab(tabKey);
  };

  return (
    <div className="fixed inset-0 bg-bg-deep/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="user-guide-tour-overlay">
      <div className="bg-bg-sidebar border border-border-subtle rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-col" id="user-guide-card">
        {/* Banner header */}
        <div className="p-5 bg-bg-deep text-white flex justify-between items-center border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-sm tracking-tight">Manual Interativo de Operação</h3>
              <p className="text-[10px] text-text-dim font-mono">THP-NEOCORTEX v4.0 • GUIA INTEGRADO</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-text-main hover:text-white transition cursor-pointer text-xs flex items-center gap-1 border-0"
          >
            <X className="w-4 h-4" /> <span>Fechar Guia</span>
          </button>
        </div>

        {/* Steps navigation toolbar */}
        <div className="bg-bg-card border-b border-border-subtle px-4 py-2 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex gap-1">
            {tourSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStepIdx(idx);
                  triggerGoToPage(step.tabKey);
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono transition pr-2.5 flex items-center gap-1 cursor-pointer border-0 ${
                  activeStepIdx === idx
                    ? "bg-primary text-bg-deep font-bold text-white font-bold"
                    : "bg-bg-sidebar text-text-dim hover:bg-bg-deep"
                }`}
              >
                <span>{idx + 1}</span>
                <span className="hidden sm:inline opacity-80">{step.badge}</span>
              </button>
            ))}
          </div>
          <span className="text-[10px] font-mono text-text-dim font-bold hidden sm:inline whitespace-nowrap">
            PASSO {activeStepIdx + 1} DE {tourSteps.length}
          </span>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <h4 className="font-bold text-base text-text-main tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary animate-spin" />
              {currentStep.title}
            </h4>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded font-mono">
              Aba: {currentStep.tabKey}
            </span>
          </div>

          <p className="text-xs text-text-dim leading-relaxed font-medium">
            {currentStep.desc}
          </p>

          <div className="space-y-2.5">
            <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider block font-mono">Como Operar Funcionalidades:</span>
            <div className="space-y-2">
              {currentStep.instructions.map((ins, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs text-text-main bg-bg-card/50 p-2.5 rounded-lg border border-border-subtle">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="leading-snug">{ins}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips section */}
          <div className="p-3 bg-primary/10/70 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold font-mono">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>DIRETRIZ DA ANÁLISE COMPORTAMENTAL</span>
            </div>
            <p className="text-[11px] text-text-main mt-1 leading-relaxed font-mono">
              {currentStep.tips}
            </p>
          </div>

          {/* Real-time synchronization tool button */}
          <div className="flex justify-between items-center bg-bg-sidebar/60 p-3 rounded-lg border border-border-subtle/50">
            <span className="text-[10px] text-text-dim font-medium">Você quer testar as funções desta página agora mesmo?</span>
            <button
              onClick={() => triggerGoToPage(currentStep.tabKey)}
              className="text-[11px] bg-bg-sidebar border border-border-subtle rounded px-2.5 py-1 text-text-main hover:border-slate-400 hover:text-text-main flex items-center gap-1 transition cursor-pointer font-bold"
            >
              Navegar para {currentStep.badge} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-bg-card border-t border-border-subtle flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={activeStepIdx === 0}
            className="px-3 py-1.5 bg-bg-sidebar border border-border-subtle hover:border-slate-400 text-text-main text-xs font-bold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Passo Anterior
          </button>

          <div className="text-[11px] text-text-dim font-mono hidden md:inline">
            Clique em "Próximo Passo" para navegar e aprender de forma prática
          </div>

          {activeStepIdx === tourSteps.length - 1 ? (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-1 shadow cursor-pointer border-0"
            >
              Concluir Aprendizado <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-bg-deep hover:bg-white/10 text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border-0"
            >
              Próximo Passo <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
