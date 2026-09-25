import React from 'react';
import {
  Brain,
  Heart,
  TrendingUp,
  Award,
  Compass,
  ShieldAlert,
  Users,
  ShieldCheck,
  Eye,
  Smile,
  LucideIcon
} from 'lucide-react';

export interface BaselineQuestion {
  id: string;
  statement: string;
  inverted?: boolean;
}

export interface RolePlayScenario {
  tier: 1 | 2;
  tierLabel: string;
  title: string;
  context: string;
  dysfunctionalExample: string;
  dysfunctionalType: 'Passivo' | 'Agressivo' | 'Passivo-Agressivo' | 'Inibido' | 'Impulsivo';
  targetResponse: string;
  nonVerbalTips: string[];
  verbalStructure: {
    statement: string;
    justification: string;
    actionOrRequest: string;
  };
  liberatingPrinciple: string;
}

export interface CognitiveHierarchy {
  automaticThought: string;
  intermediateRule: string;
  coreBelief: string;
  healthyAdultReframing: string;
}

export interface ExposureStep {
  level: number;
  title: string;
  description: string;
  suds: number; // 0-10
  targetSkill: string;
}

export interface HpConfigItem {
  id: string;
  name: string;
  shortTitle: string;
  number: number;
  icon: LucideIcon;
  badgeColor: string; // Tailwind color class for badge
  gradient: string; // Tailwind gradient for headers
  borderColor: string;
  definition: string;
  objective: string;
  corePremise: string;
  powerPhrases: string[];
  eidsCombated: string[];
  neurobiology: string;
  deficitSigns: string[];
  masteryBenefits: string[];
  cognitiveHierarchy: CognitiveHierarchy;
  rolePlayScenarios: RolePlayScenario[];
  exposureHierarchy: ExposureStep[];
  baselineQuestions: BaselineQuestion[];
  deliberateExercises: {
    title: string;
    description: string;
    suggestedDuration: string;
  }[];
  interactiveToolType:
    | 'breathing_protocol' // HP2
    | 'urge_surfing' // HP6
    | 'evidence_matrix' // HP3
    | 'assertive_shield' // HP8
    | 'savoring_scheduler' // HP10
    | 'self_compassion' // HP4
    | 'trigger_tracker' // HP1
    | 'problem_solver' // HP5
    | 'cnv_builder' // HP7
    | 'active_listener'; // HP9
}

export const HP_TOOLS_CONFIG: Record<string, HpConfigItem> = {
  'hp-autoconhecimento': {
    id: 'hp-autoconhecimento',
    name: 'Autoconhecimento',
    shortTitle: 'HP 1: Autoconhecimento',
    number: 1,
    icon: Brain,
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    gradient: 'from-sky-600/20 via-sky-500/10 to-transparent',
    borderColor: 'border-sky-500/30',
    definition: 'Capacidade metacognitiva de observar, decodificar e nomear os próprios estados mentais, emoções, padrões de resposta somática, esquemas latentes e valores existenciais.',
    objective: 'Fortalecer o Self-como-Contexto e a consciência dos gatilhos primários para impedir reações automáticas desadaptativas.',
    corePremise: 'Observar sem julgar é o primeiro passo para a liberdade: você é o espaço consciente onde pensamentos e sensações ocorrem, não o pensamento em si.',
    powerPhrases: [
      'Eu sou o observador dos meus pensamentos, não a tempestade da minha mente.',
      'Posso notar o desconforto e a tensão corporal sem precisar reagir a eles no automático.',
      'Minha mente produz hipóteses constantes; meu papel de adulto é testar os fatos com serenidade.'
    ],
    eidsCombated: ['Isolamento Social / Alienação', 'Defectividade / Vergonha', 'Emaranhamento / Self Subdesenvolvido'],
    neurobiology: 'Ativação do córtex pré-frontal medial e da ínsula anterior, responsáveis pela interocepção somática e metacognição reflexiva.',
    deficitSigns: [
      'Dificuldade em identificar o que está sentindo além de termos genéricos como "mal" ou "estranho"',
      'Não saber quais são seus valores fundamentais ou o que realmente deseja na vida',
      'Confusão crônica entre pensamentos automáticos e fatos concretos da realidade',
      'Desconhecimento dos próprios limites corporais e emocionais até atingir exaustão'
    ],
    masteryBenefits: [
      'Clareza instantânea sobre os próprios estados emocionais e fisiológicos',
      'Redução da impulsividade pela identificação precoce de gatilhos antecedentes',
      'Alinhamento existencial autêntico entre ações cotidianas e valores vitais'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Se eu sentir essa angústia no peito, vou perder o controle ou enlouquecer.',
      intermediateRule: 'Eu preciso estar 100% no controle do meu corpo e saber o que sinto a todo instante para estar em segurança.',
      coreBelief: 'Sou frágil, vulnerável e incapaz de sustentar emoções intensas.',
      healthyAdultReframing: 'Sensações corporais são ondas neurovegetativas transitórias. Eu respiro, dou espaço ao que sinto e permaneço seguro no presente.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Pares / Sobrecarga Inicial',
        title: 'Reconhecimento somático diante de demanda inesperada',
        context: 'Um colega de trabalho pede sua ajuda imediata quando você já está finalizando um relatório crítico e começa a sentir aperto na garganta e taquicardia.',
        dysfunctionalExample: 'Aceita sorrindo superficialmente e depois sente tontura, raiva contida e comete erros no relatório.',
        dysfunctionalType: 'Passivo',
        targetResponse: 'Percebo o aperto no peito, faço uma respiração diafragmática pausada e respondo: "Percebo que você precisa de apoio, mas neste momento meu foco está 100% neste prazo urgente. Posso ver isso com você às 16h."',
        nonVerbalTips: [
          'Pausa de 2 segundos antes de emitir qualquer som (quebra do automatismo)',
          'Ombros relaxados para baixo e contato visual suave',
          'Tom de voz tranquilo, compassado e sem afetação'
        ],
        verbalStructure: {
          statement: 'Neste momento estou finalizando uma entrega com prazo imediato.',
          justification: 'Meu foco precisa estar dedicado a esta tarefa para não comprometer a equipe.',
          actionOrRequest: 'Podemos sentar juntos para ver sua dúvida às 16h com calma.'
        },
        liberatingPrinciple: 'Não preciso me atropelar para demonstrar valor; reconhecer meu limite somático é autocuidado inteligente.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Pressão / Conflito / Reatividade Emocional',
        title: 'Metacognição sob provocação direta em reunião',
        context: 'Durante uma reunião de equipe, um colega insinua publicamente que seu trabalho causou um atraso no cronograma geral.',
        dysfunctionalExample: 'Reage gritando e interrompendo a reunião de forma defensiva, ou congela em silêncio humilhado e rumina por semanas.',
        dysfunctionalType: 'Impulsivo',
        targetResponse: 'Nomeio internamente ("Isto é ativação de raiva e injustiça, sinto calor no rosto"). Respiro, mantenho o olhar sereno e respondo: "Compreendo a preocupação com o cronograma. Os dados mostram que a entrega da minha etapa ocorreu na data pactuada. Vamos verificar os pontos de transição na planilha conjunta."',
        nonVerbalTips: [
          'Manter as mãos abertas sobre a mesa (postura de transparência e ancoragem)',
          'Respiração lenta pelo nariz para desativar a amígdala',
          'Tom de voz grave e pausado, evitando subir o tom para competir'
        ],
        verbalStructure: {
          statement: 'Compreendo a preocupação com o prazo geral do projeto.',
          justification: 'Os registros mostram que minha parte foi finalizada dentro da data acordada.',
          actionOrRequest: 'Convido a abrirmos a planilha de transição para identificarmos onde houve o gargalo.'
        },
        liberatingPrinciple: 'Uma acusação alheia é apenas uma fala do outro; eu não preciso me desintegrar para provar minha integridade.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: 'Mapeamento Interoceptivo Silencioso',
        description: 'Parar por 2 minutos em 3 momentos do dia, fechar os olhos e rotular 3 sensações corporais (tensão, temperatura, respiração).',
        suds: 3,
        targetSkill: 'Consciência somática sem julgamento'
      },
      {
        level: 2,
        title: 'Desaceleração diante do Smartphone',
        description: 'Notar a ansiedade ou o tédio antes de desbloquear o celular e aguardar 3 minutos nomeando o gatilho emocional.',
        suds: 5,
        targetSkill: 'Pausa metacognitiva pré-ação'
      },
      {
        level: 3,
        title: 'Nomeação Aberta de Estado Afetivo',
        description: 'Dizer a alguém de confiança com naturalidade: "Estou notando que me sinto um pouco sobrecarregado hoje".',
        suds: 7,
        targetSkill: 'Validação da própria vulnerabilidade'
      },
      {
        level: 4,
        title: 'Auto-Observação em Situação de Estresse Agudo',
        description: 'Identificar em tempo real o gatilho de raiva ou frustração em uma reunião de trabalho e descrever o estado interno antes de responder.',
        suds: 8,
        targetSkill: 'Metacognição sob alta ativação autonômica'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Consigo identificar e nomear com precisão as emoções que sinto ao longo do dia.' },
      { id: 'q2', statement: 'Percebo as reações físicas no meu corpo (tensão, respiração) antes que minhas emoções transbordem.' },
      { id: 'q3', statement: 'Sei com clareza quais são meus valores essenciais e o que é inegociável na minha vida.' },
      { id: 'q4', statement: 'Consigo perceber quando um pensamento catastrófico é apenas uma interpretação e não um fato real.' }
    ],
    deliberateExercises: [
      { title: 'Diário de Modos e Gatilhos', description: 'Registro diário de 3 colunas: Gatilho Externo, Sinal Somático Corporal e Modo Esquemático ativado.', suggestedDuration: '10 min diários' },
      { title: 'Varredura Interoceptiva (Body Scan)', description: 'Pausa de 5 minutos com foco na identificação de tensão muscular, temperatura e respiração.', suggestedDuration: '5 min' },
      { title: 'Hierarquia de Valores Vitais', description: 'Seleção e graduação dos 5 valores fundamentais que norteiam as decisões da semana.', suggestedDuration: '15 min' }
    ],
    interactiveToolType: 'trigger_tracker'
  },

  'hp-autorregulacao': {
    id: 'hp-autorregulacao',
    name: 'Autorregulação Emocional',
    shortTitle: 'HP 2: Autorregulação',
    number: 2,
    icon: Heart,
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    gradient: 'from-rose-600/20 via-rose-500/10 to-transparent',
    borderColor: 'border-rose-500/30',
    definition: 'Habilidade de tolerar, modular e desescalar a ativação autonômica e o sofrimento afetivo intenso sem recorrer à supressão nem à explosão desadaptativa.',
    objective: 'Dominar ferramentas de ancoragem somática e controle fisiológico para restaurar a janela de tolerância emocional.',
    corePremise: 'Desconforto não é perigo: a onda emocional atinge o ápice e decai naturalmente se você não alimentá-la com ruminação.',
    powerPhrases: [
      'Inspiro calma pelo nariz, expiro tensão pela boca: meu corpo é capaz de voltar ao equilíbrio.',
      'Sentir medo ou raiva é biologia; agir com violência ou fuga é uma escolha que posso modular.',
      'Eu posso tolerar o desconforto dos próximos 3 minutos até a curva da adrenalina cair.'
    ],
    eidsCombated: ['Vulnerabilidade a Danos ou Doenças', 'Abandono / Instabilidade', 'Inibição Emocional'],
    neurobiology: 'Regulação top-down do córtex pré-frontal dorsolateral sobre a amígdala e modulação vagal via nervo vago ventral.',
    deficitSigns: [
      'Explosões de raiva ou crises agudas de ansiedade desproporcionais ao estímulo disparador',
      'Uso de comida, substâncias ou telas como única via para anestesiar sentimentos aversivos',
      'Sensação de que emoções negativas são intoleráveis e que precisam ser eliminadas a qualquer custo',
      'Dificuldade para relaxar o corpo mesmo em ambientes seguros e calmos'
    ],
    masteryBenefits: [
      'Capacidade de permanecer centrado e funcional mesmo sob forte provocação emocional',
      'Redução do sofrimento secundário gerado por tentativas fúteis de controle emocional',
      'Rápida recuperação do equilíbrio homeostático após situações estressoras'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Essa raiva/ansiedade vai me sufocar e vou perder completamente a cabeça.',
      intermediateRule: 'Eu não posso tolerar emoções desagradáveis; preciso eliminá-las imediatamente.',
      coreBelief: 'Sou emocionalmente desequilibrado e incapaz de me conter.',
      healthyAdultReframing: 'A emoção é apenas uma ativação fisiológica passageira. Eu sei desacelerar meu sistema parassimpático e agir com maturidade.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Imprevisto / Frustração Operacional',
        title: 'Autorregulação diante de atraso e cobrança',
        context: 'Você está no trânsito parado a caminho de um compromisso e recebe mensagem de cobrança do cliente perguntando onde você está.',
        dysfunctionalExample: 'Bate no volante, envia áudio ríspido e chega à reunião suando, trêmulo e agressivo.',
        dysfunctionalType: 'Impulsivo',
        targetResponse: 'Aplica 2 ciclos da respiração 4-7-8, encosta a cabeça no apoio, respira e envia áudio calmo: "Olá, estou parado no trânsito da avenida principal devido a um acidente. Meu GPS estima chegada em 18 minutos. Peço desculpas pelo atraso e entrarei em contato assim que estacionar."',
        nonVerbalTips: [
          'Soltar o maxilar e destrancar os dentes',
          'Expiração longa e silenciosa pela boca',
          'Voz firme e educada sem justificação desesperada'
        ],
        verbalStructure: {
          statement: 'Estou retido em um engarrafamento severo neste momento.',
          justification: 'A via foi bloqueada por um acidente imprevisto.',
          actionOrRequest: 'A previsão é chegar às 14h18; assim que estacionar estarei com você.'
        },
        liberatingPrinciple: 'Imprevistos fazem parte da vida adulta; o que me define não é o trânsito, mas minha capacidade de permanecer equilibrado.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Provocação / Hostilidade Interpessoal',
        title: 'Desescalada diante de ataque verbal injusto',
        context: 'Um cliente ou colega entra na sua sala alterado, falando alto e dizendo que você foi negligente no atendimento.',
        dysfunctionalExample: 'Grita de volta dizendo que a culpa é dele, ou chora e pede desculpas desesperadamente sem analisar a situação.',
        dysfunctionalType: 'Agressivo',
        targetResponse: 'Ancora os pés no chão, mantém o olhar firme e sem desdém, reduz o tom de voz em 20% e diz: "Percebo que você está profundamente chateado. Quero entender exatamente o que ocorreu para resolvermos, mas precisamos conversar em tom respeitoso. Sente-se aqui para vermos isso juntos."',
        nonVerbalTips: [
          'Postura corporal aberta e estável (não cruzar os braços nem dar as costas)',
          'Modular o tom para baixo (desescalada acústica)',
          'Manter contato visual seguro sem desafiar'
        ],
        verbalStructure: {
          statement: 'Compreendo que a situação gerou grande insatisfação em você.',
          justification: 'Para solucionar o problema de forma técnica, precisamos de um diálogo calmo.',
          actionOrRequest: 'Peço que reduza o tom de voz e sente-se comigo para revisarmos os registros.'
        },
        liberatingPrinciple: 'A tempestade emocional do outro não me obriga a entrar no furacão dele; eu sou a âncora da conversa.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: 'Respiração Vagal 4-7-8 em Repouso',
        description: 'Praticar 4 ciclos completos da respiração 4-7-8 duas vezes ao dia em momentos calmos para consolidar a rota neural.',
        suds: 3,
        targetSkill: 'Condicionamento parassimpático'
      },
      {
        level: 2,
        title: 'Tolerância ao Tédio e à Espera',
        description: 'Aguardar em uma fila ou sala de espera por 10 minutos sem olhar redes sociais, apenas observando a respiração.',
        suds: 5,
        targetSkill: 'Desfusão do impulso de anestesia'
      },
      {
        level: 3,
        title: 'Pausa Consciente Pré-Resposta',
        description: 'Esperar 10 minutos cronometrados antes de responder a qualquer e-mail ou mensagem que tenha disparado indignação.',
        suds: 7,
        targetSkill: 'Interrupção do arco reflexo reativo'
      },
      {
        level: 4,
        title: 'Permanece Centrado sob Provocação',
        description: 'Sustentar uma conversa com alguém de opinião contrária ou irritadiço sem alterar o volume da voz nem revidar ironias.',
        suds: 9,
        targetSkill: 'Autorregulação em tempo real'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Quando sinto ansiedade ou raiva intensa, consigo usar a respiração para acalmar meu corpo.' },
      { id: 'q2', statement: 'Consigo tolerar um sentimento ruim sem precisar recorrer a distrações imediatas ou desabafos destrutivos.' },
      { id: 'q3', statement: 'Evito tomar decisões impulsivas quando estou com as emoções à flor da pele.' },
      { id: 'q4', statement: 'Recupero meu equilíbrio emocional em tempo razoável após um evento estressante.' }
    ],
    deliberateExercises: [
      { title: 'Técnica de Respiração 4-7-8', description: 'Ciclos de inspiração nasal (4s), retenção do ar (7s) e expiração bucal lenta (8s) para ativação parassimpática imediata.', suggestedDuration: '4 ciclos' },
      { title: 'Protocolo A.C.A.L.M.E.-S.E.', description: 'Passo a passo cognitivo-comportamental para tolerar e desarmar picos agudos de pânico ou agitação.', suggestedDuration: 'Durante a crise' },
      { title: 'Ancoragem 5-4-3-2-1', description: 'Técnica sensorial de redirecionamento atencional no ambiente físico.', suggestedDuration: '3 min' }
    ],
    interactiveToolType: 'breathing_protocol'
  },

  'hp-raciocinio-otimista': {
    id: 'hp-raciocinio-otimista',
    name: 'Raciocínio Realisticamente Otimista',
    shortTitle: 'HP 3: Raciocínio Otimista',
    number: 3,
    icon: TrendingUp,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    gradient: 'from-amber-600/20 via-amber-500/10 to-transparent',
    borderColor: 'border-amber-500/30',
    definition: 'Capacidade de interpretar eventos e adversidades sob uma perspectiva balanceada, fundamentada em fatos empíricos e com senso de agência pessoal realizável.',
    objective: 'Desarmar distorções catastróficas e pensamentos do tipo tudo-ou-nada, gerando interpretações funcionais e esperança ativa.',
    corePremise: 'Pensamentos automáticos são meras hipóteses cognitivas produzidas pelo cérebro, não vereditos forenses sobre a realidade.',
    powerPhrases: [
      'Quais são os fatos concretos e verificáveis que sustentam essa conclusão?',
      'O pior cenário raramente é o mais provável, e mesmo que aconteça, sou capaz de lidar.',
      'Contratempos operacionais são temporários e específicos; eles não cancelam meu valor nem meu futuro.'
    ],
    eidsCombated: ['Negatividade / Pessimismo', 'Fracasso', 'Catastrofização'],
    neurobiology: 'Reavaliação cognitiva pré-frontal modulando conexões com o estriado ventral e núcleo accumbens.',
    deficitSigns: [
      'Foco obsessivo no que deu errado, descartando sistematicamente dados positivos ou neutros',
      'Certeza prévia de que novas empreitadas resultarão em desastre ou vergonha pública',
      'Tendência a hiper-responsabilizar-se por falhas alheias ou atribuir sucessos à mera sorte',
      'Paralisia por excesso de antecipação do pior cenário possível'
    ],
    masteryBenefits: [
      'Substituição do fatalismo paralisante por planos de ação fundamentados em probabilidades reais',
      'Aumento da resiliência psicológica diante de contratempos operacionais',
      'Preservação do bem-estar psicológico e da persistência em metas de longo prazo'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Se esse projeto atrasar um único dia, serei demitido e ninguém mais me contratará no mercado.',
      intermediateRule: 'Tudo deve sair perfeitamente na primeira tentativa; se algo falhar, significa ruína total.',
      coreBelief: 'Sou incompetente, incapaz e destinado ao fracasso.',
      healthyAdultReframing: 'Ajustes de cronograma ocorrem em projetos profissionais complexos. Posso comunicar os dados com clareza e propor soluções sem antecipar tragédias inexistentes.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Feedback Ambíguo / Antecipação',
        title: 'Reestruturação de e-mail frio do gestor',
        context: 'O gestor envia mensagem seca: "Precisamos conversar amanhã às 9h". A mente dispara: "Serei demitido".',
        dysfunctionalExample: 'Passa a noite em claro sem dormir, revisa currículo em pânico e chega exausto e trêmulo à sala.',
        dysfunctionalType: 'Passivo-Agressivo',
        targetResponse: 'Aplica a Matriz de Evidências: "Tenho avaliações de desempenho positivas e entregas consistentes. Uma conversa às 9h pode ser alinhamento de rotina. Mesmo no pior cenário improvável, tenho reserva e competência."',
        nonVerbalTips: [
          'Postura corporal aprumada, cabeça erguida',
          'Respiração cadenciada ao ler a mensagem',
          'Evitar movimentos repetitivos de inquietação'
        ],
        verbalStructure: {
          statement: 'Bom dia. Estou disponível para o alinhamento das 9h.',
          justification: 'Revisei os indicadores da semana para facilitar nosso planejamento.',
          actionOrRequest: 'Qual é o foco principal da pauta para eu levar os materiais adequados?'
        },
        liberatingPrinciple: 'Não tenho bola de cristal para adivinhar catástrofes; investigo a realidade pelos fatos concretos.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Relevância / Crise / Desfecho Adverso Real',
        title: 'Enquadramento realista após perda de cliente ou oportunidade',
        context: 'Uma proposta comercial que você elaborou por semanas é recusada pelo conselho diretor da empresa contratante.',
        dysfunctionalExample: 'Conclui que não serve para essa profissão, rasga os relatórios e decide abandonar a área.',
        dysfunctionalType: 'Inibido',
        targetResponse: 'Analisa o feedback factual: "Perdemos porque o orçamento deles foi reduzido em 40%, não pela qualidade do método. Aprendemos pontos de melhoria no escopo e temos outros 3 prospectos ativos. Isso é aprendizado, não veredicto."',
        nonVerbalTips: [
          'Voz firme e afirmativa ao falar com a equipe',
          'Foco no olhar e acolhimento das frustrações sem autopunição',
          'Anotação objetiva dos dados sem drama'
        ],
        verbalStructure: {
          statement: 'A proposta não foi selecionada desta vez devido a cortes orçamentários do cliente.',
          justification: 'A qualidade técnica da nossa entrega foi amplamente elogiada pelo comitê.',
          actionOrRequest: 'Vamos documentar os aprendizados em 3 itens e direcionar o esforço para os novos prospectos.'
        },
        liberatingPrinciple: 'O "não" faz parte do ecossistema de quem produz; o fracasso só é real quando desisto de aprender.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: 'Checagem de Evidências em Diário',
        description: 'Identificar 1 pensamento pessimista diário e preencher as 3 colunas: Distorção, Fatos a favor, Fatos contra.',
        suds: 3,
        targetSkill: 'Exame factual de pensamentos'
      },
      {
        level: 2,
        title: 'Tríade dos 3 Cenários (Pior, Melhor, Mais Provável)',
        description: 'Antes de um evento gerador de ansiedade, escrever a probabilidade percentual real de cada um dos 3 desfechos.',
        suds: 5,
        targetSkill: 'Calibragem de probabilidades realistas'
      },
      {
        level: 3,
        title: 'Envio de Tarefa sem Hiper-Checagem Compulsiva',
        description: 'Enviar um e-mail ou documento relevante após apenas uma revisão criteriosa, sem checar 5 vezes.',
        suds: 7,
        targetSkill: 'Tolerância ao risco calculado'
      },
      {
        level: 4,
        title: 'Apresentação ou Posicionamento em Público',
        description: 'Expor uma ideia inovadora em reunião sem pedir aprovação prévia a colegas de confiança.',
        suds: 8,
        targetSkill: 'Agência e esperança fundamentada em ação'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Quando algo dá errado, busco evidências concretas antes de concluir que é o fim do mundo.' },
      { id: 'q2', statement: 'Consigo enxergar pelo menos duas interpretações alternativas realistas para uma situação difícil.' },
      { id: 'q3', statement: 'Reconheço que contratempos são temporários e não definem meu valor ou meu futuro como um todo.' },
      { id: 'q4', statement: 'Diante de um problema, foco minha energia nas partes que estão sob meu controle direto.' }
    ],
    deliberateExercises: [
      { title: 'Matriz de Evidências Factual', description: 'Registro rigoroso de evidências favoráveis e contrárias a um pensamento catastrófico.', suggestedDuration: '10 min' },
      { title: 'Tríade dos Três Cenários', description: 'Definição explícita do Pior Caso, Melhor Caso e Caso Mais Provável com probabilidade percentual.', suggestedDuration: '10 min' },
      { title: 'Torta da Responsabilidade Real', description: 'Distribuição gráfica das variáveis que causaram um desfecho indesejado para evitar autoculpa indevida.', suggestedDuration: '15 min' }
    ],
    interactiveToolType: 'evidence_matrix'
  },

  'hp-autoestima': {
    id: 'hp-autoestima',
    name: 'Autoestima',
    shortTitle: 'HP 4: Autoestima',
    number: 4,
    icon: Award,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    gradient: 'from-purple-600/20 via-purple-500/10 to-transparent',
    borderColor: 'border-purple-500/30',
    definition: 'Sentimento intrínseco de autovalorização, autoaceitação incondicional e respeito por si mesmo, independente de validações externas passageiras ou falhas operacionais.',
    objective: 'Desarmar os modos esquemáticos de Pais Punitivos e Autocrítica Tóxica, consolidando a voz do Adulto Saudável e autocompaixão de Kristin Neff.',
    corePremise: 'O Princípio da Dignidade Incondicional: você não precisa performar com perfeição para ter o direito de existir, errar e ser respeitado.',
    powerPhrases: [
      'Trato a mim mesmo com o mesmo carinho, dignidade e paciência que dedico a quem amo.',
      'Minhas falhas me conectam à humanidade compartilhada; errar não me torna inferior nem quebrado.',
      'Eu separo meu valor inato como ser humano do resultado pontual de uma tarefa.'
    ],
    eidsCombated: ['Defectividade / Vergonha', 'Punitividade', 'Padrões Inflexíveis'],
    neurobiology: 'Regulação do córtex cingulado anterior dorsal e diminuição da reatividade amigdalina a estímulos de rejeição social.',
    deficitSigns: [
      'Crítica interna implacável diante de qualquer pequeno erro ("sou um inútil, nunca acerto")',
      'Necessidade compulsiva de aprovação alheia para sentir que tem valor',
      'Dificuldade em receber elogios, atribuindo-os a educação ou fingimento alheio',
      'Sentimento crônico de que é uma farsa (Síndrome do Impostor)'
    ],
    masteryBenefits: [
      'Estabilidade emocional mesmo diante de críticas, demissões ou rejeições interpessoais',
      'Capacidade de aprender com erros sem mergulhar na vergonha ou na autopunição',
      'Coragem para assumir desafios sem medo paralisante do fracasso'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Cometi uma gafe na reunião, sou uma fraude completa e todos agora me desprezam.',
      intermediateRule: 'Se eu cometer um erro, devo me punir e me diminuir antes que os outros o façam.',
      coreBelief: 'Sou defectivo, inadequado e indigno de apreço genuíno.',
      healthyAdultReframing: 'Todos os seres humanos cometem gafes e falhas operacionais. Minha contribuição geral é sólida e eu me acolho com respeito e compaixão.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Recepção de Reconhecimento',
        title: 'Aceitação madura e elegante de um elogio sincero',
        context: 'Um colega ou superior elogia efusivamente sua apresentação dizendo: "Você foi impecável, parabéns pelo domínio do tema!"',
        dysfunctionalExample: 'Diz com vergonha: "Ah, que nada, foi sorte... quase esqueci os slides, qualquer um faria isso."',
        dysfunctionalType: 'Inibido',
        targetResponse: 'Sustenta o olhar com um sorriso genuíno, postura aberta e responde com segurança: "Muito obrigado! Dediquei bastante tempo preparando esse material e fico muito contente que tenha sido útil para vocês."',
        nonVerbalTips: [
          'Sorriso acolhedor e olhos nos olhos',
          'Cabeça erguida sem baixar o queixo em timidez',
          'Voz clara sem titubear'
        ],
        verbalStructure: {
          statement: 'Muito obrigado pelo feedback positivo.',
          justification: 'Eu me dediquei bastante na construção deste conteúdo.',
          actionOrRequest: 'Fico muito feliz que a apresentação tenha atingido esse objetivo.'
        },
        liberatingPrinciple: 'Aceitar um elogio não é arrogância; é honrar o esforço legítimo e a gentileza do outro.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Relevância / Confronto com o Crítico Interno',
        title: 'Desarmamento do Modo Pai Punitivo após um deslize',
        context: 'Você esquece de pagar uma conta no prazo ou perde a chave de casa, e a voz interna grita: "Idiota! Você nunca vai dar certo!"',
        dysfunctionalExample: 'Fica o dia inteiro murmurando xingamentos contra si mesmo, com postura encolhida e comendo por compulsão.',
        dysfunctionalType: 'Passivo',
        targetResponse: 'Pausa, coloca a mão sobre o peito e responde com a voz firme do Adulto Saudável: "Basta! Eu não permito esse tom comigo mesmo. Foi apenas um esquecimento humano. Vou pagar a conta agora com a multa e criar um alerta no calendário."',
        nonVerbalTips: [
          'Gesto de ancoragem física (mão no peito ou nas pernas)',
          'Respiração compassiva e calma',
          'Voz interior firme e protetora, como a de um mentor amoroso'
        ],
        verbalStructure: {
          statement: 'Houve uma falha de atenção pontual no pagamento deste boleto.',
          justification: 'Todos os humanos estão sujeitos a esquecimentos em rotinas intensas.',
          actionOrRequest: 'Vou quitar o débito agora e programar débito automático para evitar reincidência.'
        },
        liberatingPrinciple: 'Autocompaixão é coragem moral: autopunição só gera paralisia, gentileza gera aprendizado.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: 'Registro Diário de 3 Méritos Genuínos',
        description: 'Anotar todas as noites 3 coisas que você fez com empenho, honestidade ou carinho por si/outros.',
        suds: 4,
        targetSkill: 'Reconhecimento do próprio valor'
      },
      {
        level: 2,
        title: 'Aceitar Elogio sem Autodepreciação',
        description: 'Responder a qualquer elogio recebido durante a semana com "Muito obrigado, fico feliz com isso" sem inventar desculpas.',
        suds: 5,
        targetSkill: 'Recebimento de validação externa'
      },
      {
        level: 3,
        title: 'Pausa Compassiva de Kristin Neff diante de um Erro',
        description: 'Ao cometer uma falha menor, aplicar os 3 passos: 1) Nomear o sofrimento; 2) Lembrar da humanidade compartilhada; 3) Falar uma frase afetuosa para si.',
        suds: 7,
        targetSkill: 'Autocompaixão sob atrito'
      },
      {
        level: 4,
        title: 'Expressão de Limite e Autorrespeito em Público',
        description: 'Não rir de uma piada autodepreciativa ou corrigir alguém que fez um comentário jocoso sobre você com elegância: "Não acho graça nisso, prefiro que não repita".',
        suds: 8,
        targetSkill: 'Defesa da própria dignidade'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Trato a mim mesmo com a mesma compaixão e carinho que trataria um amigo querido que errou.' },
      { id: 'q2', statement: 'Sinto que meu valor como ser humano independe da aprovação ou do elogio dos outros.' },
      { id: 'q3', statement: 'Reconheço e valorizo minhas forças pessoais e conquistas legítimas.' },
      { id: 'q4', statement: 'Consigo perdoar minhas próprias falhas sem ficar me torturando mentalmente durante dias.' }
    ],
    deliberateExercises: [
      { title: 'Diário de Méritos e Autoelogios', description: 'Registro diário de 3 pequenas ações de integridade, esforço ou cuidado pessoal realizadas.', suggestedDuration: '5 min ao deitar' },
      { title: 'Pausa da Autocompaixão (Neff)', description: '3 passos experienciais: 1) Reconhecer o momento de sofrimento; 2) Humanidade compartilhada; 3) Bondade para consigo.', suggestedDuration: '5 min' },
      { title: 'Desarmamento do Crítico Interno', description: 'Escrever a fala da autocrítica e responder na voz protetora e assertiva do Adulto Saudável.', suggestedDuration: '15 min' }
    ],
    interactiveToolType: 'self_compassion'
  },

  'hp-resolutividade': {
    id: 'hp-resolutividade',
    name: 'Resolutividade e Enfrentamento',
    shortTitle: 'HP 5: Resolutividade',
    number: 5,
    icon: Compass,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    gradient: 'from-emerald-600/20 via-emerald-500/10 to-transparent',
    borderColor: 'border-emerald-500/30',
    definition: 'Capacidade de operacionalizar problemas complexos em variáveis objetivas, selecionar intervenções viáveis e executar comportamentos de aproximação ao estressor.',
    objective: 'Eliminar a esquiva passiva e a ruminação mental, transformando queixas em planos de ação estruturados por micro-passos.',
    corePremise: 'A clareza é filha da ação e não da ruminação: nenhum problema se resolve pensando em círculos, mas sim dando o primeiro passo mensurável.',
    powerPhrases: [
      'Feito é infinitamente melhor que perfeito quando o perfeito é sinônimo de paralisia.',
      'Qual é o menor micro-passo executável nos próximos 5 minutos que me aproxima da solução?',
      'Eu posso agir mesmo com medo, dúvida ou preguiça: a motivação segue a ação, não o contrário.'
    ],
    eidsCombated: ['Dependência / Incompetência', 'Fracasso', 'Subjugação'],
    neurobiology: 'Engajamento do córtex pré-frontal dorsolateral e rede executiva central voltados à tomada de decisão racional.',
    deficitSigns: [
      'Procrastinar decisões importantes por dias ou semanas por medo de errar',
      'Ficar ruminando sobre o problema em círculos sem nunca dar o primeiro passo prático',
      'Delegar todas as responsabilidades a familiares ou parceiro para não ter de assumir a escolha',
      'Sentimento de paralisia e sobrecarga mental diante de listas de tarefas diárias'
    ],
    masteryBenefits: [
      'Velocidade e eficácia na solução prática dos desafios do trabalho e da vida cotidiana',
      'Aumento exponencial da autoeficácia percebida (Bandura)',
      'Drástica redução da ansiedade crônica causada por pendências acumuladas'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Esse problema é colossal, se eu tentar resolver vou me enrolar todo e passar vergonha.',
      intermediateRule: 'Eu só posso tomar uma atitude quando tiver 100% de garantia de que não haverá nenhum imprevisto.',
      coreBelief: 'Sou incompetente, incapaz de decidir e desamparado.',
      healthyAdultReframing: 'Problemas complexos se resolvem em pedaços. Eu quebro a demanda em micro-etapas de 15 minutos e executo a primeira com tranquilidade.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Procrastinação Burocrática',
        title: 'Rompimento da inércia em pendência adiada',
        context: 'Você tem uma fatura errada para contestar na operadora de telefonia há 2 semanas e fica adiando por aversão à fila do teleatendimento.',
        dysfunctionalExample: 'Fica resmungando em casa, deixa acumular cobrança com juros e se sente frustrado consigo mesmo.',
        dysfunctionalType: 'Passivo',
        targetResponse: 'Aplica a Regra dos 5 Minutos: senta na mesa, abre o aplicativo da operadora, agenda a ligação e inicia o protocolo com foco na resolução objetiva.',
        nonVerbalTips: [
          'Postura corporal atenta e desperta',
          'Respiração profunda antes de discar',
          'Bloco de notas aberto para registrar o protocolo'
        ],
        verbalStructure: {
          statement: 'Bom dia. Solicito a revisão do valor cobrado na fatura de referência setembro.',
          justification: 'Há uma cobrança de serviço que não foi contratada nem autorizada por mim.',
          actionOrRequest: 'Solicito a emissão de boleto retificado com o valor contratual de R$ 89,90.'
        },
        liberatingPrinciple: 'O desconforto de 10 minutos de ação me liberta de semanas de ruído mental desgastante.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Relevância / Decisão Crítica Profissional',
        title: 'Alinhamento assertivo de repactuação de prazos',
        context: 'Você percebe que o escopo adicionado pelo cliente tornou impossível entregar o software na data prevista sem perder toda a qualidade.',
        dysfunctionalExample: 'Fica calado rezando por um milagre, vira noites trabalhando doente e no dia da entrega não tem o produto pronto.',
        dysfunctionalType: 'Inibido',
        targetResponse: 'Convoca reunião imediata de alinhamento com 5 dias de antecedência: "Analisamos o escopo ampliado e temos duas alternativas viáveis para manter a segurança do sistema. Convido para decidirmos juntos qual caminho priorizar."',
        nonVerbalTips: [
          'Olhar sereno e voz firme de autoridade técnica',
          'Sem sorriso subserviente nem gestos de culpa',
          'Apresentação de dados objetivos em gráfico/tabela'
        ],
        verbalStructure: {
          statement: 'Com o acréscimo dos 3 novos módulos solicitados, a data de sexta-feira tornou-se tecnicamente inviável.',
          justification: 'Precisamos de 72 horas para testes de segurança e validação dos dados dos usuários.',
          actionOrRequest: 'Podemos lançar a versão base na data prevista ou a versão completa na quarta-feira seguinte.'
        },
        liberatingPrinciple: 'Liderar é ter a coragem de trazer o problema à mesa antes que ele se torne um desastre.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: 'A Regra dos 5 Minutos em 1 Pendência Acumulada',
        description: 'Pegar uma tarefa evitada há dias e executá-la durante apenas 5 minutos cronometrados.',
        suds: 4,
        targetSkill: 'Quebra do limiar de inércia'
      },
      {
        level: 2,
        title: 'Resolução Imediata de Pequenos Problemas (< 2 min)',
        description: 'Tudo o que levar menos de 2 minutos para ser feito (guardar uma roupa, responder um e-mail simples) deve ser feito na hora.',
        suds: 5,
        targetSkill: 'Agilidade executiva diária'
      },
      {
        level: 3,
        title: 'Tomada de Decisão Autônoma sem Consulta',
        description: 'Tomar uma decisão de compra, rota ou rotina sozinho, sem pedir a opinião de familiares para dividir a culpa.',
        suds: 7,
        targetSkill: 'Independência e assunção de risco'
      },
      {
        level: 4,
        title: 'Conduzir Conversa Difícil de Alinhamento de Escopo',
        description: 'Chamar um parceiro, sócio ou cliente para renegociar termos de um contrato que ficaram injustos ou insustentáveis.',
        suds: 9,
        targetSkill: 'Enfrentamento de alto impacto'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Diante de um problema complexo, consigo dividi-lo em pequenas etapas simples e factíveis.' },
      { id: 'q2', statement: 'Tomo decisões necessárias mesmo quando não tenho 100% de certeza absoluta sobre o futuro.' },
      { id: 'q3', statement: 'Foco em buscar soluções práticas em vez de ficar lamentando ou culpando o destino.' },
      { id: 'q4', statement: 'Coloco em prática o primeiro passo de um plano em vez de adiar por medo de não dar conta.' }
    ],
    deliberateExercises: [
      { title: 'Matriz de Decisão Prós e Contras Ponderada', description: 'Tabela de comparação de alternativas atribuindo notas de 1 a 10 ao peso emocional e prático de cada opção.', suggestedDuration: '15 min' },
      { title: 'Roteiro de Micro-Passos dos 5 Minutos', description: 'Reduzir uma tarefa intimidadora a uma micro-ação de apenas 5 minutos que não possa ser recusada.', suggestedDuration: '5 min' },
      { title: 'Hierarquia de Enfrentamento Gradual', description: 'Construção de uma escada com 5 a 8 degraus de dificuldade crescente para aproximação com segurança.', suggestedDuration: '20 min' }
    ],
    interactiveToolType: 'problem_solver'
  },

  'hp-autocontrole': {
    id: 'hp-autocontrole',
    name: 'Autocontrole',
    shortTitle: 'HP 6: Autocontrole',
    number: 6,
    icon: ShieldAlert,
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    gradient: 'from-indigo-600/20 via-indigo-500/10 to-transparent',
    borderColor: 'border-indigo-500/30',
    definition: 'Capacidade voluntária de adiar gratificações imediatas, inibir impulsos automáticos e sustentar comportamentos comprometidos com objetivos de longo prazo.',
    objective: 'Aprender a tolerar a onda do impulso ("Urge Surfing") e implementar engenharia ambiental de estímulos antecedentes.',
    corePremise: 'Liberdade não é ser escravo de toda vontade que surge na mente; liberdade é ter o poder de escolher o que realmente importa mesmo com vontade de ceder.',
    powerPhrases: [
      'Eu posso sentir uma vontade avassaladora e simplesmente não agir sobre ela.',
      'O impulso é uma onda do mar: ele cresce, atinge o pico em 3 minutos e quebra na praia.',
      'Troco 10 minutos de prazer fugaz por anos de orgulho, integridade e saúde.'
    ],
    eidsCombated: ['Autocontrole Insuficiente', 'Grandiosidade / Merecimento'],
    neurobiology: 'Controle inibitório pré-frontal ventrolateral e giro frontal inferior modulando circuitos dopaminérgicos de recompensa imediata.',
    deficitSigns: [
      'Incapacidade de dizer não a impulsos de compras, telas, comida ou substâncias',
      'Abandonar metas importantes no primeiro momento em que o tédio ou a dificuldade surgem',
      'Reagir com intolerância e agressividade a frustrações cotidianas (filas, trânsito, esperas)',
      'Comprometer a própria estabilidade financeira ou conjugal em nome de prazeres imediatistas'
    ],
    masteryBenefits: [
      'Maestria na disciplina e alcance consistente de metas de médio e longo prazo',
      'Fortalecimento da tolerância à frustração e ao desconforto produtivo',
      'Preservação da integridade física, financeira e emocional'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Eu mereço esse doce/gasto agora, tive um dia muito difícil e não aguento mais passar vontade!',
      intermediateRule: 'Se sinto frustração ou cansaço, tenho o direito imediato de me anestesiar com qualquer coisa.',
      coreBelief: 'Sou fraco, escravo dos meus desejos e incapaz de sustentar disciplina.',
      healthyAdultReframing: 'O cansaço pede descanso genuíno e não compulsão que gera culpa futura. Eu respiro, surfo a onda do impulso e cuido de mim com respeito.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Gatilho Digital / Fissura de Telas',
        title: 'Urge Surfing diante da compulsão por redes sociais',
        context: 'Você está no meio de um trabalho que exige alta concentração e sente uma vontade incontrolável de abrir o Instagram ou checar mensagens.',
        dysfunctionalExample: 'Pega o celular no piloto automático, perde 45 minutos no feed e depois se desespera com o prazo.',
        dysfunctionalType: 'Impulsivo',
        targetResponse: 'Nota a mão estendendo para o telefone, larga o aparelho, coloca os pés no chão e aciona o cronômetro de 3 minutos de Urge Surfing: "Noto a fissura como uma coceira na mente. Deixo a onda passar sem tocar no aparelho."',
        nonVerbalTips: [
          'Afastar fisicamente o aparelho da linha de visão',
          'Colocar as duas mãos espalmadas sobre os joelhos',
          'Olhar fixo em um ponto neutro enquanto respira'
        ],
        verbalStructure: {
          statement: 'Estou notando a vontade compulsiva de checar o celular agora.',
          justification: 'Essa vontade é apenas dopamina barata querendo me afastar do foco.',
          actionOrRequest: 'Vou respirar por 3 minutos e concluir este parágrafo antes de qualquer pausa.'
        },
        liberatingPrinciple: 'Não sou obrigado a obedecer a comandos químicos primitivos do meu cérebro.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Pressão Social / Convite a Quebrar Metas',
        title: 'Sustentação do autocontrole diante de insistência em grupo',
        context: 'Em uma comemoração de trabalho, colegas insistem agressivamente para você beber além da conta ou comer até passar mal ("Ah, só hoje! Não seja chato!").',
        dysfunctionalExample: 'Cede com vergonha de desagradar e acorda no dia seguinte com ressaca moral, física e desânimo.',
        dysfunctionalType: 'Passivo',
        targetResponse: 'Sorri com simpatia, ergue seu copo de água com limão e diz em tom seguro e descontraído: "Agradeço a animação de vocês, mas hoje minha meta é curtir só na água com gás e acordar 100% amanhã. Brindemos a nós!"',
        nonVerbalTips: [
          'Sorriso desarmante e contato visual direto com quem insistiu',
          'Gesto corporal firme de recusa com a mão espalmada',
          'Sem justificação médica ou desculpas de doente'
        ],
        verbalStructure: {
          statement: 'Obrigado pelo convite, mas hoje não vou beber álcool.',
          justification: 'Minha meta é acordar cedo e com total disposição amanhã.',
          actionOrRequest: 'Estou ótimo com minha água com limão e aproveitando muito a noite com vocês.'
        },
        liberatingPrinciple: 'Minha lealdade prioritária é com a minha integridade física, não com a expectativa alheia.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: 'Regra dos 10 Minutos de Adiamento',
        description: 'Toda vez que tiver vontade de ceder a um impulso (comida, compra, tela), aguardar 10 minutos cronometrados.',
        suds: 4,
        targetSkill: 'Quebra da automaticidade dopaminérgica'
      },
      {
        level: 2,
        title: 'Engenharia de Controle de Estímulos',
        description: 'Dormir com o smartphone fora do quarto e desinstalar aplicativos de compras impulsivas por 7 dias.',
        suds: 6,
        targetSkill: 'Design ambiental pró-disciplina'
      },
      {
        level: 3,
        title: 'Sustentação de Tédio sem Compensação',
        description: 'Ficar 20 minutos sentado em um parque ou sala sem fones, telas ou comida, tolerando a inquietação mental.',
        suds: 7,
        targetSkill: 'Resistência ao vazio e à frustração'
      },
      {
        level: 4,
        title: 'Exposição com Prevenção de Resposta em Ambiente Tentador',
        description: 'Ir ao shopping ou padaria apenas para comprar 1 item pré-determinado na lista e sair sem levar nada extra.',
        suds: 8,
        targetSkill: 'Inibição voluntária em ambiente de alto estímulo'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Consigo adiar um prazer imediato quando sei que ele vai prejudicar meus objetivos futuros.' },
      { id: 'q2', statement: 'Quando sinto uma forte vontade de fazer algo prejudicial, consigo esperar a onda passar sem ceder.' },
      { id: 'q3', statement: 'Mantenho meus compromissos mesmo quando estou sem motivação ou com preguiça.' },
      { id: 'q4', statement: 'Consigo organizar meu ambiente para afastar tentações que atrapalham minha disciplina.' }
    ],
    deliberateExercises: [
      { title: 'Urge Surfing (Surfando na Onda do Impulso)', description: 'Observar a fissura como uma onda do oceano que cresce, atinge um pico em 3 minutos e murcha naturalmente sem agir.', suggestedDuration: '3 a 5 min' },
      { title: 'Regra dos 15 Minutos de Adiamento', description: 'Acordo consciente de esperar 15 minutos cronometrados antes de ceder a um impulso; geralmente a compulsão cessa.', suggestedDuration: '15 min' },
      { title: 'Engenharia de Controle de Estímulos', description: 'Remover o gatilho visual do ambiente físico (ex: telas fora do quarto, doces fora do alcance direto).', suggestedDuration: '10 min' }
    ],
    interactiveToolType: 'urge_surfing'
  },

  'hp-sociabilidade': {
    id: 'hp-sociabilidade',
    name: 'Sociabilidade e Assertividade',
    shortTitle: 'HP 7: Assertividade',
    number: 7,
    icon: Users,
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    gradient: 'from-cyan-600/20 via-cyan-500/10 to-transparent',
    borderColor: 'border-cyan-500/30',
    definition: 'Habilidade interpessoal de iniciar, cultivar e manter conversas e laços sociais recíprocos com empatia, assertividade e comunicação clara, fundamentada no Direito Incondicional de Ser Falível.',
    objective: 'Desenvolver a Tríade do Comportamento Assertivo (Postura Firme, Conteúdo Direto e Princípio Libertador), rompendo o ciclo de submissão ressentida e agressividade defensiva.',
    corePremise: 'O Direito Incondicional de Ser Falível: você tem o direito legítimo de dizer não, mudar de ideia, expressar sentimentos e impor limites sem precisar pedir perdão por existir.',
    powerPhrases: [
      'Tenho o direito incondicional de dizer não sem me sentir um monstro egoísta.',
      'Dizer não a uma demanda abusiva é um ato de cuidado comigo e de honestidade com o outro.',
      'Assertividade é firmeza inegociável no conteúdo com elegância e serenidade na forma.'
    ],
    eidsCombated: ['Isolamento Social / Alienação', 'Privação Emocional', 'Subjugação'],
    neurobiology: 'Rede de cognição social incluindo a junção temporoparietal e o córtex pré-frontal ventromedial.',
    deficitSigns: [
      'Inibição e travamento absoluto ao tentar iniciar conversas ou defender direitos básicos',
      'Comunicação passiva (engole sapo) seguida de explosões agressivas desproporcionais',
      'Pedir desculpas compulsivas antes de fazer uma pergunta ou colocar um posicionamento',
      'Aceitar demandas extras no trabalho que não cabem na rotina por medo de desagradar'
    ],
    masteryBenefits: [
      'Capacidade de dizer "não" com elegância sem destruir relacionamentos profissionais ou pessoais',
      'Desenvoltura natural em eventos sociais, reuniões e negociações de alto impacto',
      'Relacionamentos saudáveis fundamentados em transparência mútua e respeito recíproco'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Se eu disser que não posso fazer o relatório dele, ele vai me odiar e me queimar com todo mundo na empresa.',
      intermediateRule: 'Eu preciso me sacrificar e colocar a vontade dos outros sempre em primeiro lugar para ser amado e respeitado.',
      coreBelief: 'Não tenho valor por quem sou; meu único valor está em ser útil, submisso e prestativo.',
      healthyAdultReframing: 'Sou um ser humano com limites legítimos de tempo e energia. Dizer não a uma demanda é uma prerrogativa adulta. A reação do outro pertence a ele, não define minha dignidade.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Pares / Demanda Fora de Escopo',
        title: 'Colega de mesmo nível transferindo tarefa em cima da hora (Caso Pedro)',
        context: 'Às 17h30, um colega da sua equipe chega à sua mesa dizendo: "Cara, preciso sair mais cedo hoje para um compromisso, quebra esse galho e finaliza essa planilha para mim?".',
        dysfunctionalExample: 'Hesita, gagueja, olha para baixo e diz: "Ah... puxa, é que eu ia tentar sair no horário hoje... mas tá bom, pode deixar que eu faço..." e passa a noite com raiva.',
        dysfunctionalType: 'Passivo',
        targetResponse: 'Mantém postura ereta, faz contato visual direto e responde com voz firme e calma: "Compreendo que você tenha esse compromisso, mas eu já tenho tarefas programadas para o fechamento do meu expediente e não poderei assumir essa planilha hoje. Sugiro que você alinhe a entrega com a coordenação amanhã cedo."',
        nonVerbalTips: [
          'Postura corporal ereta, ombros encaixados para trás e queixo paralelo ao chão',
          'Contato visual direto e sustentado (sem desviar para o teclado ou teto)',
          'Tom de voz audível, constante e firme (sem afinar no final da frase)'
        ],
        verbalStructure: {
          statement: 'Compreendo que você tenha esse compromisso hoje.',
          justification: 'Porém, já tenho tarefas programadas para o encerramento do meu expediente e não poderei assumir a planilha.',
          actionOrRequest: 'Sugiro que converse com o coordenador para ajustar o prazo de entrega.'
        },
        liberatingPrinciple: 'Não sou responsável pela falta de planejamento alheia; meu tempo tem o mesmo valor que o de qualquer outra pessoa.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Pressão / Superior Hierárquico / Manipulação Sarcástica',
        title: 'Superior hierárquico com cobrança passivo-agressiva no final de semana',
        context: 'Sexta-feira às 19h, o diretor liga dizendo: "Preciso que você revise todo o plano de contas neste sábado e domingo. Achei que você vestia a camisa da empresa e podia contar com você...".',
        dysfunctionalExample: 'Começa a chorar ou se desculpar compulsivamente: "Desculpa, doutor, me perdoa, se não fosse meu filho doente eu juro que faria, desculpa mesmo..." ou explode: "Vocês são uns exploradores!".',
        dysfunctionalType: 'Passivo',
        targetResponse: 'Aplica a técnica do Disco Riscado combinada com a Tríade Assertiva: "Boa noite, diretor. Compreendo a relevância deste projeto para a empresa e meu histórico comprova meu total comprometimento com a equipe. No entanto, tenho compromissos pessoais e familiares inadiáveis já agendados para este fim de semana e não estarei disponível. Na segunda-feira às 8h da manhã colocarei prioridade total nesta revisão."',
        nonVerbalTips: [
          'Respiração lenta pelo nariz durante a fala do gestor (não interromper com desculpas)',
          'Postura firme sem tensão nos ombros nem cruzar os braços',
          'Tom grave, sereno e inabalável (o "tom do adulto saudável")'
        ],
        verbalStructure: {
          statement: 'Compreendo a importância estratégica dessa entrega para a empresa.',
          justification: 'Porém, minha agenda pessoal e familiar deste final de semana já está firmada e não estarei disponível.',
          actionOrRequest: 'Na segunda-feira às 8h iniciarei a revisão com prioridade absoluta para finalizá-la até o almoço.'
        },
        liberatingPrinciple: 'Comprometimento profissional não exige servidão nem destruição da vida privada; meu "não" é protegido pelo meu autorrespeito.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: 'Recusa Simples sem Desculpas a Vendedores',
        description: 'Dizer "Não, muito obrigado, não tenho interesse" a um operador de telemarketing ou vendedor de shopping com voz firme e sem se desculpar.',
        suds: 4,
        targetSkill: 'Recusa educada e direta'
      },
      {
        level: 2,
        title: 'Reclamação de Direito Legítimo no Comércio',
        description: 'Pedir a troca de um pedido que veio errado em restaurante ou solicitar a nota fiscal sem gaguejar nem titubear.',
        suds: 6,
        targetSkill: 'Afirmação de direitos contratuais'
      },
      {
        level: 3,
        title: 'Estabelecer Limite com Amigos ou Familiares',
        description: 'Recusar um convite social inconveniente dizendo com naturalidade: "Agradeço o carinho, mas neste sábado prefiro ficar em casa descansando".',
        suds: 7,
        targetSkill: 'Desfusão da necessidade de aprovação'
      },
      {
        level: 4,
        title: 'Posicionamento Assertivo com Superior Hierárquico',
        description: 'Dizer não a uma demanda de trabalho fora do expediente ou negociar um prazo inviável cara a cara usando a Tríade Assertiva.',
        suds: 9,
        targetSkill: 'Assertividade de alta pressão no trabalho'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Consigo iniciar e sustentar conversas agradáveis mesmo com pessoas que acabei de conhecer.' },
      { id: 'q2', statement: 'Expresso meus sentimentos e opiniões com clareza sem ser agressivo nem submisso.' },
      { id: 'q3', statement: 'Mantenho contato e cultivo relacionamentos saudáveis com amigos e colegas de forma equilibrada.' },
      { id: 'q4', statement: 'Sinto-me à vontade em situações sociais sem a necessidade de me isolar por medo do julgamento.' }
    ],
    deliberateExercises: [
      { title: 'Técnica do Disco Riscado (Assertividade)', description: 'Repetição calma e serena do posicionamento pessoal sem alterar o tom de voz nem entrar em discussões periféricas.', suggestedDuration: 'Treino em role-play' },
      { title: 'Comunicação Não-Violenta (CNV em 4 Passos)', description: '1. Fato objetivo; 2. O que sinto; 3. Minha necessidade; 4. Meu pedido claro.', suggestedDuration: '10 min' },
      { title: 'Micro-Conversa Social de 2 Minutos', description: 'Quebrar o gelo com uma pergunta aberta e observação de contexto com alguém do cotidiano (porteiro, caixa, colega).', suggestedDuration: '2 min' }
    ],
    interactiveToolType: 'cnv_builder'
  },

  'hp-imunidade-social': {
    id: 'hp-imunidade-social',
    name: 'Imunidade Social',
    shortTitle: 'HP 8: Imunidade Social',
    number: 8,
    icon: ShieldCheck,
    badgeColor: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30',
    gradient: 'from-emerald-700/20 via-emerald-600/10 to-transparent',
    borderColor: 'border-emerald-400/30',
    definition: 'Capacidade assertiva de dizer "NÃO", estabelecer limites interpessoais invioláveis e tolerar desaprovações ou críticas sem se desestruturar emocionalmente.',
    objective: 'Romper a tirania da agradabilidade compulsiva (people pleasing) e desfundir o valor próprio da opinião passageira de terceiros.',
    corePremise: 'A aprovação alheia é um bônus agradável, nunca uma necessidade vital de sobrevivência: você não precisa agradar a todos para ser digno e seguro.',
    powerPhrases: [
      'Eu posso tolerar o olhar feio ou a insatisfação de alguém sem que isso altere minha dignidade intrínseca.',
      'O que as pessoas pensam sobre mim diz mais sobre a história de vida delas do que sobre quem eu sou.',
      'Não é meu trabalho gerenciar a frustração dos outros quando imponho um limite justo.'
    ],
    eidsCombated: ['Subjugação', 'Auto-sacrifício', 'Busca de Aprovação / Reconhecimento'],
    neurobiology: 'Blindagem do córtex cingulado e córtex insular contra a dor social da desaprovação interpessoal.',
    deficitSigns: [
      'Dizer "sim" para favores ou tarefas quando por dentro queria gritar "não", por medo de rejeição',
      'Ficar dias ruminando e sofrendo por causa de uma cara feia ou crítica injusta de alguém',
      'Sentir culpa esmagadora ao recusar um pedido ou ao impor um limite aos próprios pais/cônjuge',
      'Mudar de opinião ou fingir gostar de algo apenas para não ser excluído do grupo'
    ],
    masteryBenefits: [
      'Libertação definitiva da escravidão de tentar agradar a todos o tempo todo',
      'Economia maciça de tempo e energia psíquica para investir no que realmente importa',
      'Relacionamentos mais autênticos, baseados em respeito mútuo e transparência'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Se fulano ficar chateado comigo porque impus um limite, eu serei culpado por estragar a relação.',
      intermediateRule: 'Eu devo sempre ser dócil, prestativo e neutro para garantir que ninguém sinta raiva de mim.',
      coreBelief: 'Sou frágil, rejeitável e só tenho valor se for útil aos outros.',
      healthyAdultReframing: 'Conflitos e divergências fazem parte de relacionamentos maduros. Tenho o direito incondicional de sustentar meus limites com serenidade. Frustração não mata ninguém.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Chantagem Emocional Leve / Família',
        title: 'Imposição de limite diante de invasão de privacidade familiar',
        context: 'Um familiar próximo aparece sem avisar na sua casa no meio de um momento de descanso e critica sua rotina dizendo: "Nossa, você não faz nada o dia todo!".',
        dysfunctionalExample: 'Fica vermelho de vergonha, começa a arrumar a casa desesperado e depois passa a semana reclamando com o cônjuge.',
        dysfunctionalType: 'Passivo-Agressivo',
        targetResponse: 'Acolhe com educação, mas mantém a linha vermelha: "Fico feliz em te ver, mas hoje meu plano para a tarde era descansar. Na próxima vez, por favor me avise com 1 dia de antecedência antes de vir, para podermos programar um café com calma."',
        nonVerbalTips: [
          'Postura relaxada sem afobação',
          'Não correr para servir como se fosse um criado',
          'Olhar sereno e voz cordial, mas sem subserviência'
        ],
        verbalStructure: {
          statement: 'É sempre bom te ver, mas hoje reservei meu sábado para descanso.',
          justification: 'Preciso repor minhas energias para a semana que vem.',
          actionOrRequest: 'Peço que nas próximas ocasiões me ligue no dia anterior para combinarmos.'
        },
        liberatingPrinciple: 'Minha casa e meu tempo não são espaços públicos de livre acesso.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Hostilidade / Crítica Destrutiva / Técnica do Nevoeiro',
        title: 'Desarmamento de crítica tóxica em ambiente corporativo (Fogging)',
        context: 'Em uma reunião, um colega invejoso tenta te constranger publicamente: "Você é muito devagar e detalhista demais, parece que tem medo de entregar!".',
        dysfunctionalExample: 'Começa a gritar chamando o colega de mentiroso, ou engole o choro e passa o resto do dia paralisado no banheiro.',
        dysfunctionalType: 'Passivo',
        targetResponse: 'Aplica a Técnica do Nevoeiro (Fogging): "Você tem razão no sentido de que sou extremamente cuidadoso com a precisão dos dados técnicos. E é exatamente por esse critério minucioso que nossa taxa de erro de sistema caiu a zero neste trimestre."',
        nonVerbalTips: [
          'Um leve assentimento de cabeça ao ouvir a fala (desarmamento instantâneo do agressor)',
          'Sem franzir as sobrancelhas nem fechar os punhos',
          'Tom de voz aveludado e confiante'
        ],
        verbalStructure: {
          statement: 'Você tem razão em apontar que sou muito rigoroso com os detalhes.',
          justification: 'Esse cuidado minucioso é o que garante a precisão e a segurança do nosso cliente.',
          actionOrRequest: 'Continuarei aplicando esse padrão técnico em todas as entregas críticas.'
        },
        liberatingPrinciple: 'Quando você concorda com a parte descritiva e ressignifica a crítica, o insulto perde toda a força destrutiva.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: "O 'NÃO' Elegante sem Justificativa Longa",
        description: 'Recusar um convite ou favor dispensável usando apenas 1 frase: "Agradeço por pensar em mim, mas não poderei assumir isso agora".',
        suds: 4,
        targetSkill: 'Recusa sem autoflagelação'
      },
      {
        level: 2,
        title: 'Tolerância ao Vácuo de Mensagens de Cobrança',
        description: 'Não responder imediatamente a uma mensagem de cobrança não-urgente no WhatsApp, tolerando a ansiedade por 4 horas.',
        suds: 6,
        targetSkill: 'Desaceleração da urgência reativa'
      },
      {
        level: 3,
        title: 'Expressão de Opinião Divergente no Grupo',
        description: 'Manifestar uma opinião ou gosto diferente da maioria em uma roda de amigos sem pedir desculpas por pensar diferente.',
        suds: 7,
        targetSkill: 'Sustentação da individuação social'
      },
      {
        level: 4,
        title: 'Sustentar o Limite sob Chantagem Emocional Ativa',
        description: 'Manter a recusa firme mesmo quando a pessoa faz cara feia, chora ou diz "pensei que éramos amigos" presencialmente.',
        suds: 9,
        targetSkill: 'Imunidade à manipulação afetiva'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Consigo dizer "não" com tranquilidade quando um pedido ultrapassa meus limites, sem me desculpar demais.' },
      { id: 'q2', statement: 'Suporto saber que alguém não gosta de mim ou discorda do meu jeito sem perder o sono por isso.' },
      { id: 'q3', statement: 'Mantenho minha opinião e valores mesmo quando todo o grupo está pressionando para eu ceder.' },
      { id: 'q4', statement: 'Lido com críticas injustas de forma serena, sem me defender agressivamente nem me sentir destruído.' }
    ],
    deliberateExercises: [
      { title: 'Treino do "NÃO" sem Justificativa Exaustiva', description: 'Prática de recusar pedidos abusivos com elegância: "Agradeço a confiança, mas infelizmente não posso assumir isso agora."', suggestedDuration: '5 min diários' },
      { title: 'Técnica do Nevoeiro (Fogging)', description: 'Concordar com a parte factual da crítica sem aceitar o insulto: "Você tem razão que me atrasei 5 minutos hoje, mas sou comprometido com a equipe."', suggestedDuration: 'Treino prático' },
      { title: 'Mapeamento de Linhas Vermelhas (Limites)', description: 'Registro explícito das atitudes que não serão mais toleradas no trabalho e em relacionamentos íntimos.', suggestedDuration: '15 min' }
    ],
    interactiveToolType: 'assertive_shield'
  },

  'hp-sensibilidade-social': {
    id: 'hp-sensibilidade-social',
    name: 'Sensibilidade Social',
    shortTitle: 'HP 9: Sensibilidade Social',
    number: 9,
    icon: Eye,
    badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    gradient: 'from-teal-600/20 via-teal-500/10 to-transparent',
    borderColor: 'border-teal-500/30',
    definition: 'Capacidade refinada de decodificar pistas não-verbais, empatizar com a experiência subjetiva alheia e validar as necessidades do outro nas interações.',
    objective: 'Desenvolver a tomada de perspectiva empática sem fundir-se com a dor do outro (compaixão lúcida vs auto-sacrifício).',
    corePremise: 'Escutar com presença profunda não é concordar nem tentar consertar o outro: é oferecer um espaço seguro de validação antes de qualquer raciocínio lógico.',
    powerPhrases: [
      'Primeiro eu compreendo e valido a dor do outro; apenas depois, se solicitado, ofereço perspectivas.',
      'As pessoas não precisam de palestras lógicas quando estão com o coração ferido; precisam de testemunho.',
      'Posso me conectar empaticamente com o sofrimento alheio sem carregar o fardo nos meus próprios ombros.'
    ],
    eidsCombated: ['Privação Emocional', 'Desconfiança / Abuso', 'Grandiosidade'],
    neurobiology: 'Ativação do sistema de neurônios-espelho e da rede de Teoria da Mente (ToM) no córtex pré-frontal dorsomedial.',
    deficitSigns: [
      'Incapacidade de perceber quando o interlocutor está entediado, magoado ou desconfortável',
      'Responder com conselhos racionais frios quando a pessoa precisava apenas de acolhimento e escuta',
      'Interromper as pessoas no meio da frase para falar das próprias experiências',
      'Julgar imediatamente os motivos do outro sem tentar compreender seu contexto de vida'
    ],
    masteryBenefits: [
      'Profunda conexão humana e confiança instantânea gerada nos interlocutores',
      'Prevenção de conflitos interpessoais graves antes que eles escalem',
      'Liderança empática e capacidade de acolher dores alheias com maturidade'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Se eu não der uma solução técnica para o desabafo dele agora, serei um amigo inútil.',
      intermediateRule: 'Eu preciso consertar os problemas e emoções de todos para ser digno de consideração.',
      coreBelief: 'Não tenho valor afetivo genuíno; meu valor é apenas instrumental.',
      healthyAdultReframing: 'O maior presente que posso oferecer é escuta ativa e validação afetiva. O outro é competente para conduzir a própria vida quando se sente ouvido com respeito.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Desabafo Afetivo / Paráfrase',
        title: 'Escuta empática sem conselho precipitado com parceiro ou amigo',
        context: 'Seu parceiro ou amigo chega do trabalho arrasado, senta no sofá e desabafa: "Meu chefe me humilhou na frente de todo mundo, estou me sentindo um lixo".',
        dysfunctionalExample: 'Interrompe no meio da fala: "Mas você também deu mole, né? Já te falei para procurar outro emprego logo, você não me ouve!".',
        dysfunctionalType: 'Agressivo',
        targetResponse: 'Guarda o celular, senta-se ao lado, olha nos olhos e aplica Paráfrase Empática: "Pelo que você está me dizendo, foi uma experiência terrível e profundamente dolorosa. Compreendo por que você está se sentindo assim. Estou aqui com você. Quer me contar mais?".',
        nonVerbalTips: [
          'Atenção plena: corpo voltado na direção da pessoa',
          'Assentimento compassivo de cabeça',
          'Silêncio acolhedor e toque afetuoso no ombro se houver intimidade'
        ],
        verbalStructure: {
          statement: 'Consigo ver o quanto esse episódio te feriu e te deixou exausto.',
          justification: 'Ser exposto diante da equipe é algo extremamente injusto e pesado de suportar.',
          actionOrRequest: 'Estou 100% aqui para te escutar; respire com calma e me conte o que precisar.'
        },
        liberatingPrinciple: 'A validação cura a solidão do sofrimento; o conselho só tem valor quando a dor já foi legitimada.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Hostilidade / Mediação de Conflito Crítico',
        title: 'Validação Dialética em 3 Níveis diante de cliente furioso',
        context: 'Um cliente importante ameaça cancelar o contrato e processar sua empresa devido a um erro de faturamento.',
        dysfunctionalExample: 'Diz: "O senhor leia a cláusula 4 do contrato que nós não temos culpa disso!".',
        dysfunctionalType: 'Agressivo',
        targetResponse: 'Validação Dialética Nível 3: "O senhor tem total razão em estar revoltado. Se eu visse uma cobrança indevida nessa proporção na minha conta, também estaria indignado. Vamos corrigir o lançamento agora e quero acompanhar pessoalmente até o estorno na sua conta."',
        nonVerbalTips: [
          'Postura receptiva sem arrogância',
          'Anotar os pontos em papel enquanto o interlocutor fala',
          'Voz firme, clara e desprovida de cinismo'
        ],
        verbalStructure: {
          statement: 'Compreendo perfeitamente a sua revolta e a considero absolutamente justa.',
          justification: 'Uma discrepância deste valor gera insegurança em qualquer organização.',
          actionOrRequest: 'Estou congelando a fatura neste segundo e emitindo a ordem de ajuste imediata com meu aval.'
        },
        liberatingPrinciple: 'Reconhecer a legitimidade da emoção alheia não é capitulação; é a única via para desarmar a ira irracional.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: 'Escuta Plena sem Interrupção por 5 Minutos',
        description: 'Ouvir um relato de alguém sem mexer no celular e sem interromper nenhuma vez com histórias próprias.',
        suds: 3,
        targetSkill: 'Atenção focalizada no interlocutor'
      },
      {
        level: 2,
        title: 'Paráfrase Empática em Diálogo Cotidiano',
        description: 'Antes de responder a qualquer desabafo, repetir a essência do que a pessoa disse: "Se entendi bem, você se sentiu desamparado quando isso ocorreu...".',
        suds: 5,
        targetSkill: 'Espelhamento empático reflexivo'
      },
      {
        level: 3,
        title: 'Validação de Emoções em Pessoas Discordantes',
        description: 'Dizer a alguém com quem você está discordando politicamente ou no trabalho: "Entendo a sua preocupação com esse ponto, faz todo sentido na sua perspectiva".',
        suds: 7,
        targetSkill: 'Desfusão ideológica e respeito afetivo'
      },
      {
        level: 4,
        title: 'Desescalada Consciente de Ataque Verbal',
        description: 'Receber uma reclamação áspera e aplicar a Validação em 3 Níveis até a pessoa mudar o tom e agradecer a atenção.',
        suds: 8,
        targetSkill: 'Mediação de alta complexidade'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Percebo mudanças sutis no tom de voz e expressão facial das pessoas antes que elas digam o que sentem.' },
      { id: 'q2', statement: 'Consigo escutar alguém desabafar com foco total sem interromper para dar conselhos precipitados.' },
      { id: 'q3', statement: 'Consigo me colocar no lugar de quem discorda de mim e entender por que a pessoa pensa daquele modo.' },
      { id: 'q4', statement: 'Valido o sentimento das pessoas ("compreendo que você esteja chateado") antes de discutir soluções.' }
    ],
    deliberateExercises: [
      { title: 'Laboratório de Escuta com Paráfrase', description: 'Ouvir um relato e parafrasear com as próprias palavras antes de responder: "Pelo que você me contou, você se sentiu desamparado quando isso aconteceu, certo?"', suggestedDuration: 'Em sessões / diálogos' },
      { title: 'Exercício de Tomada de Perspectiva (Cadeira Vazia)', description: 'Escrever uma carta ou diálogo a partir do ponto de vista e da dor da pessoa com quem teve um conflito.', suggestedDuration: '15 min' },
      { title: 'Validação Dialética em 3 Níveis', description: 'Nível 1: Atenção plena; Nível 2: Reflexão empática; Nível 3: Reconhecimento da sabedoria do sentimento.', suggestedDuration: '10 min' }
    ],
    interactiveToolType: 'active_listener'
  },

  'hp-hedonismo': {
    id: 'hp-hedonismo',
    name: 'Hedonismo Responsável',
    shortTitle: 'HP 10: Hedonismo',
    number: 10,
    icon: Smile,
    badgeColor: 'text-amber-300 bg-amber-400/10 border-amber-400/30',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderColor: 'border-amber-400/30',
    definition: 'Capacidade madura de planejar, cultivar e saborear prazeres autênticos e saudáveis a curto prazo, sem sabotar a integridade física, emocional ou metas futuras.',
    objective: 'Reconectar o paciente ao Modo Criança Feliz e desativar o excesso de dever, trabalho obsessivo ou privação punitiva de prazer.',
    corePremise: 'O descanso e o prazer autêntico não são recompensas morais por ter trabalhado até a exaustão; são direitos vitais e necessidades biológicas de um cérebro saudável.',
    powerPhrases: [
      'Descansar e saborear a vida é uma decisão estratégica de saúde física e mental.',
      'Eu me permito usufruir dos frutos do meu trabalho hoje, sem adiar a alegria para um futuro hipotético.',
      'Prazer responsável recarrega minha alma e me torna mais criativo, paciente e produtivo.'
    ],
    eidsCombated: ['Padrões Inflexíveis', 'Punitividade', 'Auto-sacrifício'],
    neurobiology: 'Estímulo ao circuito de liberação de dopamina tônica, serotonina e endorfinas em atividades recreativas integradas ao ritmo circadiano.',
    deficitSigns: [
      'Sentir culpa intensa ao descansar ou ao tirar um final de semana sem trabalhar',
      'Rotina 100% preenchida por obrigações, prazos e demandas de outras pessoas sem nada de lazer',
      'Comer, beber ou consumir coisas prazerosas com pressa, sem nem sentir o gosto ou desfrutar o momento',
      'Crença de que descanso só é permitido quando todo o trabalho do mundo estiver concluído'
    ],
    masteryBenefits: [
      'Restauração da vitalidade psíquica, do entusiasmo e da criatividade cotidiana',
      'Prevenção direta da síndrome de Burnout e de episódios depressivos',
      'Equilíbrio harmonioso e sustentável entre produtividade e prazer de viver'
    ],
    cognitiveHierarchy: {
      automaticThought: 'Se eu parar 30 minutos para relaxar ou almoçar com calma, tudo vai desmoronar e serei um vagabundo.',
      intermediateRule: 'Descansar é pecado; uma pessoa de bem deve trabalhar em estado de sacrifício contínuo.',
      coreBelief: 'Não mereço felicidade nem paz; só existo para suportar cargas e agradar aos outros.',
      healthyAdultReframing: 'O descanso é parte indissociável da vida saudável. Meu corpo e mente exigem pausas regenerativas. Cuidar do meu bem-estar é meu dever ético.'
    },
    rolePlayScenarios: [
      {
        tier: 1,
        tierLabel: 'Nível 1: Cotidiano / Consciência Sensorial / Savoring',
        title: 'Prática de Saboreamento Pleno de uma refeição ou café',
        context: 'Você tem 15 minutos de intervalo à tarde e vai tomar um café ou lanche, mas nota o impulso de comer olhando e-mails no celular.',
        dysfunctionalExample: 'Engole o lanche em 2 minutos em pé na cozinha enquanto digita mensagens e nem percebe que comeu.',
        dysfunctionalType: 'Impulsivo',
        targetResponse: 'Desliga as telas, senta perto de uma janela, respira o aroma do café, sente a temperatura da xícara e mastiga saboreando conscientemente cada gole e mordida por 10 minutos.',
        nonVerbalTips: [
          'Postura corporal confortável e recostada',
          'Olhar relaxado contemplando o ambiente ou a luz natural',
          'Movimentos lentos e compassados'
        ],
        verbalStructure: {
          statement: 'Este é meu momento de pausa e nutrição.',
          justification: 'Meu cérebro precisa de 10 minutos de desconexão para renovar o foco.',
          actionOrRequest: 'Aproveito este café com todos os sentidos e retorno renovado às 15h30.'
        },
        liberatingPrinciple: 'Saborear o presente é a única forma real de viver o tempo da minha vida.'
      },
      {
        tier: 2,
        tierLabel: 'Nível 2: Alta Relevância / Sustentação do Direito ao Lazer',
        title: 'Desconexão integral no fim de semana diante de cobranças veladas',
        context: 'No sábado de manhã, colegas de equipe começam a debater ideias no grupo de WhatsApp de trabalho, gerando a sensação de que você deveria estar online.',
        dysfunctionalExample: 'Abre o laptop no meio do almoço de família com culpa, trabalha por 4 horas e fica de mau humor com o cônjuge e filhos.',
        dysfunctionalType: 'Passivo',
        targetResponse: 'Mantém as notificações do grupo arquivadas/silenciadas, olha para sua família e desfruta do passeio planejado: "O expediente encerrou na sexta-feira. Esse tempo é sagrado para minha regeneração e para as pessoas que amo."',
        nonVerbalTips: [
          'Deixar o smartphone na bolsa ou gaveta',
          'Sorriso aberto e presença física total com os familiares',
          'Sem franzir o rosto olhando o relógio'
        ],
        verbalStructure: {
          statement: 'Meu final de semana está reservado para descanso e lazer familiar.',
          justification: 'Estar presente com minha família é um valor vital inegociável.',
          actionOrRequest: 'Na segunda-feira revisarei todas as mensagens com atenção plena.'
        },
        liberatingPrinciple: 'O trabalho serve para sustentar minha vida, e não minha vida para ser devorada pelo trabalho.'
      }
    ],
    exposureHierarchy: [
      {
        level: 1,
        title: 'Savoring de 5 Minutos em 1 Atividade Diária',
        description: 'Praticar atenção plena sensorial completa (visão, olfato, paladar, tato, audição) durante um banho ou xícara de café.',
        suds: 3,
        targetSkill: 'Amplificação do prazer somático'
      },
      {
        level: 2,
        title: 'Bloco Sagrado de Lazer Sem Telas (1 hora)',
        description: 'Agendar 1 hora durante a semana para uma atividade exclusivamente lúdica (ler ficção, tocar instrumento, caminhar) sem celular.',
        suds: 5,
        targetSkill: 'Nutrição do Modo Criança Feliz'
      },
      {
        level: 3,
        title: 'Desconexão Noturna das Notificações',
        description: 'Desativar todas as notificações de trabalho das 19h até as 8h da manhã seguinte por 5 dias consecutivos.',
        suds: 7,
        targetSkill: 'Preservação do ritmo circadiano de regeneração'
      },
      {
        level: 4,
        title: 'Fim de Semana 100% Livre de Produtividade Compulsiva',
        description: 'Passar um sábado e domingo inteiros sem abrir e-mails corporativos nem realizar tarefas de trabalho, tolerando a culpa inicial.',
        suds: 8,
        targetSkill: 'Consolidação do Hedonismo Responsável'
      }
    ],
    baselineQuestions: [
      { id: 'q1', statement: 'Planejo e desfruto de momentos de lazer e descanso durante a semana sem sentir culpa.' },
      { id: 'q2', statement: 'Quando estou vivendo um momento bom (comendo algo gostoso, admirando uma paisagem), consigo saborear com presença total.' },
      { id: 'q3', statement: 'Mantenho um equilíbrio saudável entre minhas obrigações de trabalho e minhas fontes de alegria pessoal.' },
      { id: 'q4', statement: 'Substituo prazeres impulsivos nocivos (excesso de telas/comida) por prazeres genuínos que me nutrem de verdade.' }
    ],
    deliberateExercises: [
      { title: 'Prática de Savoring (Desfrute Pleno de 5 Minutos)', description: 'Escolher uma refeição, banho morno, música ou café e apreciar com todos os 5 sentidos em silêncio.', suggestedDuration: '5 min diários' },
      { title: 'Cardápio de Reforçadores Semanais', description: 'Listar 5 atividades simples de baixo custo que trazem alegria genuína e agendar pelo menos 3 na semana.', suggestedDuration: '10 min no domingo' },
      { title: 'Balanço da Balança Dever vs Prazer', description: 'Mapeamento visual das 168 horas da semana avaliando a proporção de esforço obrigatório versus regeneração.', suggestedDuration: '15 min' }
    ],
    interactiveToolType: 'savoring_scheduler'
  }
};
