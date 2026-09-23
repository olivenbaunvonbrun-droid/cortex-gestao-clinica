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
  eidsCombated: string[];
  neurobiology: string;
  deficitSigns: string[];
  masteryBenefits: string[];
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
    name: 'Sociabilidade',
    shortTitle: 'HP 7: Sociabilidade',
    number: 7,
    icon: Users,
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    gradient: 'from-cyan-600/20 via-cyan-500/10 to-transparent',
    borderColor: 'border-cyan-500/30',
    definition: 'Habilidade interpessoal de iniciar, cultivar e manter conversas e laços sociais recíprocos com empatia, assertividade e comunicação clara.',
    objective: 'Desenvolver repertório comportamental de aproximação social e uso consistente da Comunicação Não-Violenta (CNV).',
    eidsCombated: ['Isolamento Social / Alienação', 'Privação Emocional', 'Inibição Emocional'],
    neurobiology: 'Rede de cognição social incluindo a junção temporoparietal e o córtex pré-frontal ventromedial.',
    deficitSigns: [
      'Inibição e travamento absoluto ao tentar iniciar conversas com desconhecidos ou novos colegas',
      'Comunicação passiva ou agressiva que afasta pessoas queridas ou cria mal-entendidos',
      'Falta de reciprocidade nas interações (ou fala só de si ou não fala nada de si)',
      'Isolamento progressivo aos finais de semana por timidez ou medo de incomodar'
    ],
    masteryBenefits: [
      'Facilidade para construir redes de apoio sólidas e amizades profundas',
      'Desenvoltura natural em eventos profissionais e interações informais',
      'Expressão clara de desejos e sentimentos sem gerar conflitos desnecessários'
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
    objective: 'Romper a tirania da agradabilidade compulsiva (people pleasing) e desfundir o valor próprio da opinião de terceiros.',
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
