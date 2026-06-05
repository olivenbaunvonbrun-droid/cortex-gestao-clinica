import { PsychologicalSkill } from "../types";

export interface SkillInfo {
  description: string;
  gains: string[];
  losses: string[];
  distortions: {
    distortion: string;
    correction: string;
  }[];
  affirmations: {
    title: string;
    content: string;
  }[];
  immersions: {
    type: "video" | "article" | "podcast" | "book";
    title: string;
    desc: string;
  }[];
}

export const skillData: Record<PsychologicalSkill, SkillInfo> = {
  [PsychologicalSkill.Autoconhecimento]: {
    description: "Conhecer como o seu passado proporcionou-lhe limitações e potencialidades e a quais fatores está respondendo quando age funcionalmente.",
    gains: [
      "Identificação de gatilhos históricos e sua conexão estrutural com atitudes do presente.",
      "Desfusão de engramas infantis cristalizados de inadequação.",
      "Maior lucidez e calma ao tomar decisões cruciais sob forte pressão."
    ],
    losses: [
      "Ciclos cegos de reatividade automática sem discernimento dos estressores.",
      "Adesão involuntária a salvaguardas limitantes do Esquema de Fracasso.",
      "Instabilidade de comportamento por ausência de um senso histórico coerente."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'Estou agindo assim por pura teimosia de hoje, meu passado não dita nada.'",
        correction: "Nossas reações automáticas e defesas repetem salvaguardas aprendidas sob dores passadas para autotutela. Entender sua história é o primeiro passo para o governo da própria conduta."
      },
      {
        distortion: "Distorção 2: 'Sou um defeituoso crônico de fábrica e jamais mudarei de postura.'",
        correction: "Ao discernir as origens históricas de um engrama amigdalar de fobia, seu Córtex pré-frontal torna-se capaz de recalibrar a própria autonomia e atualizar a identidade."
      },
      {
        distortion: "Distorção 3: 'Analisar feridas de infância é perda de tempo; basta focar em agir.'",
        correction: "Mapear a origem funcional das necessidades emocionais negligenciadas e as regras rígidas do passado desarma as resistências à mudança que sabotam tratamentos de longo prazo."
      }
    ],
    affirmations: [
      {
        title: "Diferenciação Histórica",
        content: "Eu compreendo que meu passado imprimiu marcas e engramas defensivos, mas no presente possuo as rédeas livres das minhas escolhas adaptativas."
      },
      {
        title: "Inteligência Autocentrada",
        content: "Mapear de onde vêm meus anseios clareia os fatores mantenedores de hoje. Sou o condutor do meu auto-aperfeiçoamento."
      }
    ],
    immersions: [
      { type: "article", title: "Análise do Histórico nas Terapias Funcionais", desc: "Como mapear determinantes de longa duração e interromper ciclos repetitivos." },
      { type: "book", title: "Manual de Reparentalização Mútua (Poubel & Rodrigues)", desc: "Seções dedicadas a cura de memórias traumáticas e reconsolidação sináptica." },
      { type: "video", title: "O Eu-Infantil vs Eu-Adulto", desc: "Sessão prática demonstrando diálogos socráticos focados em modos de sobrevivência." }
    ]
  },
  [PsychologicalSkill.RealismoOtimista]: {
    description: "Interpretar adequadamente as contingências e as adversidades, buscando ver as alternativas cabíveis de forma probabilística.",
    gains: [
      "Geração instantânea de interpretações realistas e úteis sob pressões ambientais.",
      "Redução drástica do viés confirmatório pessimista nas interações profissionais.",
      "Tolerância otimizada à incerteza residual de fluxos de carreira corporativa."
    ],
    losses: [
      "Catastrofização maciça que antecipa colapsos sociais em qualquer silêncio ou deslize.",
      "Visão de túnel que filtra unicamente sinais punitivos ou de desaprovação descontextualizada.",
      "Apatia derivada do pressuposto conformista de que 'nenhum plano vingará'."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'Se um projeto deu errado no passado, os próximos darão errado sempre.'",
        correction: "Fracassos anteriores indicam experimentações específicas sob certas circunstâncias históricas, não leis absolutas do universo. O cenário futuro pode ser alterado por novas ações."
      },
      {
        distortion: "Distorção 2: 'As pessoas estão criticando ou agindo assim exclusivamente para me sabotar.'",
        correction: "Os outros agem guiados por seus próprios estressores, temores e agendas pessoais. Quase nunca suas condutas pretendem nos ferir pessoalmente de modo ativo."
      },
      {
        distortion: "Distorção 3: 'Este problema técnico de apresentação de slides não tem conserto real.'",
        correction: "Qualquer problema de grande monta, quando fatiado em frações minúsculas e sequenciais, revela múltiplos canais de intervenção prática de forma perfeitamente manejável."
      }
    ],
    affirmations: [
      {
        title: "Raciocínio Probabilístico",
        content: "Avalio as contingências pelos fatos concretos e evidências reais, não pelas lentes distorcidas do meu pior vício antecipatório."
      },
      {
        title: "Percepção Flexível",
        content: "Sempre há alternativas cabíveis viáveis de resolução quando paramos para pensar de forma lógica."
      }
    ],
    immersions: [
      { type: "book", title: "Mente Flexível: Como Superar a Visão de Túnel", desc: "A ciência cognitiva voltada a interpretação realista de crises súbitas." },
      { type: "video", title: "A Anatomia Pré-frontal do Realismo", desc: "Investigação de neuroimagem sobre a regulação cortical de picos de apreensão." },
      { type: "podcast", title: "Descatastrofizando o Cotidiano", desc: "Técnicas clínicas práticas de estruturação lógica baseadas na fita de fatos reais." }
    ]
  },
  [PsychologicalSkill.Autocontrole]: {
    description: "Estabelecer propósitos bem definidos e planejar-se consistentemente para alcançá-los de forma disciplinada.",
    gains: [
      "Construção de hábitos sustentáveis protegendo a saúde mental do Burnout.",
      "Arranjo assertivo do ambiente diminuindo a fricção para iniciar tarefas complexas.",
      "Estabilidade de esforço mesmo em dias com baixa motivação ou humor flutuante."
    ],
    losses: [
      "Procrastinação crônica operando sob o engano de que 'preciso estar animado para agir'.",
      "Vulnerabilidade à atração imediata de dopamina barata de redes sociais ou vícios de esquiva.",
      "Sensação crônica de estar apagando incêndios constantemente por pura imperícia operacional."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'Devo obrigatoriamente sentir apetite terapêutico ou ânimo para sentar e planejar.'",
        correction: "O ânimo e a motivação são resultantes secundários do movimento autônomo iniciado, nunca seu pré-requisito. Ao dar o primeiro passo microscópico, a inércia se dissipa."
      },
      {
        distortion: "Distorção 2: 'Se falhei na minha rotina planejada por um dia, perdi toda a minha constância clínica.'",
        correction: "Desvios e quebras pontuais são meras irregularidades estatísticas normais no plano. A consistência de longo prazo mede-se pela rapidez da retomada inteligente, não pela perfeição cega."
      },
      {
        distortion: "Distorção 3: 'Eu não possuo temperamento ou força de vontade inerente de sucesso.'",
        correction: "O autocontrole resolutivo é uma competência técnica treinável decorrente de controle de estímulos ambientais e design de tarefas, nunca de recursos biológicos místicos."
      }
    ],
    affirmations: [
      {
        title: "Inércia Inversa",
        content: "Foco no início imediato e simples de pequenas metas. A motivação e o bem-estar seguem os meus atos voluntários."
      },
      {
        title: "Arranjo Saudável",
        content: "Mudo o meu contexto e gerencio os meus estímulos para facilitar a execução dos meus nobres ideais de vida."
      }
    ],
    immersions: [
      { type: "podcast", title: "Biologia do Hábito e da Dopamina", desc: "Como usar sinais e pequenas recompensas sob regras de reforçamento." },
      { type: "book", title: "Controle Operacional nas Organizações", desc: "Organização racional de agendas e rotinas contra a exaustão adrenal." },
      { type: "video", title: "O Pré-frontal no Governo do Impulso", desc: "Aula magna de neuropsicologia demonstrando as redes corticais inibitórias." }
    ]
  },
  [PsychologicalSkill.Sociabilidade]: {
    description: "Relacionar-se adequadamente, expressando-se de forma empática e respeitosa, atendendo simultaneamente as próprias necessidades.",
    gains: [
      "Laços profundos, íntimos e recíprocos de colaboração profissional e amizade real.",
      "Redução rápida da solidão corporativa por falar sinceramente de necessidades humanas.",
      "Canalização adequada de feedbacks empáticos assertivos que promovem alianças seguras."
    ],
    losses: [
      "Isolamento defensivo pela crença de que as pessoas são sumariamente egoístas.",
      "Interações superficiais dominadas por fachadas perfeccionistas de evitação social.",
      "Amargura por acreditar que ninguém se voluntaria a acolher suas limitações."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'Pedir afeto, carinho ou auxílio me revela como um dependente vulnerável.'",
        correction: "A necessidade de suporte interpessoal e interdependência mútua é uma característica adaptativa inerente à nossa espécie. Expressar carências sinceras legitima relacionamentos."
      },
      {
        distortion: "Distorção 2: 'Para ser respeitado e querido nas discussões, preciso concordar passivamente.'",
        correction: "A anuência forçada gera ressentimento cumulativo e amizades vazias. Limites honestos e polidos constroem respeito maduro e admiração de verdade."
      },
      {
        distortion: "Distorção 3: 'Os meus colegas deviam descobrir o que preciso sem que eu diga nada.'",
        correction: "Ninguém consegue ler mentes. Projetar essa expectativa mística nos outros de forma indireta apenas produz decepções cíclicas injustas."
      }
    ],
    affirmations: [
      {
        title: "Reciprocidade Legítima",
        content: "Tenho o direito pleno de expressar o que sinto de forma diplomática, ensinando as pessoas a respeitarem minhas fronteiras."
      },
      {
        title: "Interdependência Empática",
        content: "Compartilhar vulnerabilidades e aceitar auxílio nos integra e consolida pontes de confiança."
      }
    ],
    immersions: [
      { type: "book", title: "Princípios Clínicos de THS (Poubel & Rodrigues)", desc: "Como cultivar empatia pragmática sem subjugação de vontades." },
      { type: "article", title: "A Ocitocina e a Neuropsicologia do Vínculo", desc: "As reações endócrinas que ocorrem quando há comunicação profunda e franca." },
      { type: "video", title: "A Teoria da Comunicação Não-Violenta", desc: "Dinâmicas de mediação de conflitos corporativos sob a lente da 4ª geração." }
    ]
  },
  [PsychologicalSkill.ResolutividadeEnfrentamento]: {
    description: "Encontrar soluções pragmáticas para situações adversas da vida e enfrentá-las de forma proativa.",
    gains: [
      "Enfrentamento diplomático de atritos interpessoais antes que se tornem crises agudas.",
      "Instalação de uma sólida percepção de capacidade de resolução técnica autônoma.",
      "Redução imediata da ansiedade antecipatória pela substituição de esquivas por ação."
    ],
    losses: [
      "Procrastinação crônica de problemas difíceis que fermentam em pendências graves.",
      "Dependência abusiva de figuras tutelares ou mentores para decisões corriqueiras.",
      "Permanência estagnada em carreiras insustentáveis por pavor de gerir conflitos de fronteiras."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'Deixar o tempo correr esperando o estresse dissolver-se é o mais confortável.'",
        correction: "Adiar problemas e evitar diálogos difíceis apenas nutre a ansiedade antecipatória e inflaciona as consequências reais no futuro. Enfrentar cedo economiza estresse."
      },
      {
        distortion: "Distorção 2: 'Qualquer tentativa de me expor no conflito vai resultar em demissão imediata.'",
        correction: "Vocalizar impasses sob design claro, fatos técnicos e elegância diplomática aumenta o prestígio profissional de Pedro, sinalizando firmeza e liderança."
      },
      {
        distortion: "Distorção 3: 'Eu não suporto o impacto emocional de ver as pessoas zangadas ou irritadas comigo.'",
        correction: "O atrito eventual das relações é contingência biológica normal e administrável. Possuímos os recursos pré-frontais para tolerar e responder de forma calma."
      }
    ],
    affirmations: [
      {
        title: "Resolução Inteligente",
        content: "Não evito os problemas do meu caminho. Encaro-os como problemas matemáticos práticos a serem resolvidos por meio de atitudes lógicas."
      },
      {
        title: "Coragem Diplomática",
        content: "A assertividade resguarda o meu valor pessoal intrínseco. Posiciono-me de cabeça erguida e tom de voz calmo."
      }
    ],
    immersions: [
      { type: "book", title: "Superando Conversas Críticas no Trabalho", desc: "Roteiros comportamentais detalhados para mediar limites hierárquicos de forma íntegra." },
      { type: "podcast", title: "Ações Pragmáticas sob Fogo Cruzado", desc: "Mapeamento sistemático de como dividir conflitos extensos em etapas gerenciáveis." },
      { type: "video", title: "Treino Prático de Roleplay Clínico", desc: "Cenários de modelagem comportamental conduzidos pelo psicoterapeuta Lincoln Poubel." }
    ]
  },
  [PsychologicalSkill.AutorregulacaoEmocional]: {
    description: "Modular e gerenciar bem as reações emocionais e viscerais agudas, de modo a preservar-se e evitar danos interpessoais.",
    gains: [
      "Bloqueio de tremores e pânico autonômico simpático com técnicas fisiológicas celeráveis.",
      "Estabilidade cardíaca e modulação da variabilidade de frequência cardíaca (HRV).",
      "Clareza de raciocínio lógico mesmo sob disparo agudo de cortisol ou estresse surpresa."
    ],
    losses: [
      "Vulnerabilidade sistêmica a sobressaltos emocionais que arruínam dias de labor útil.",
      "Adoção de compulsões nocivas ou automedicação abusiva para tentar anestesiar as dores.",
      "Sequestro amigdalar crônico que paralisa a fala e induz ao congelamento somático em reuniões."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'Sentir ansiedade aguda ou palpitações é prova de que sou doente e inadequado.'",
        correction: "A ansiedade é apenas uma reação de sobrevivência filogenética inoculada em todos nós. Ela não avalia o seu merecimento e passará em poucos minutos."
      },
      {
        distortion: "Distorção 2: 'Minhas emoções intensas de momento traduzem a verdade absoluta do cenário.'",
        correction: "As emoções são descargas químicas temporárias e informam sobre seu estado fisiológico interno, não sobre a periculosidade factual do ambiente externo."
      },
      {
        distortion: "Distorção 3: 'Devo reprimir e punir rigorosamente qualquer nervosismo para ser considerado bom.'",
        correction: "Acolher o nervosismo sem medo e operar ciclos diafragmáticos lentos ativa a autogestão vagal natural. Reprimir gera picos inflacionados de rebote."
      }
    ],
    affirmations: [
      {
        title: "Tônus Vagal Ativo",
        content: "Minha respiração calma desacelera os meus batimentos. O córtex reassume o leme sobre o meu estado emocional."
      },
      {
        title: "Acolhimento Sereno",
        content: "Sinto a tensão corporal ir embora lentamente por meio do sopro parassimpático. Estou no controle."
      }
    ],
    immersions: [
      { type: "video", title: "Treino de Respiração Diafragmática", desc: "Tutorial em tempo real focado em sintonizar o ritmo parassimpático." },
      { type: "book", title: "Biofeedback Cardio-Emocional Integrado", desc: "Como mensurar e aprimorar a HRV para restabelecer o equilíbrio cortical anterior." },
      { type: "podcast", title: "Desarmando o Sequestro Límbico", desc: "Neurofisiologia do medo social e técnicas de inibição veloz de descargas adrenérgicas." }
    ]
  },
  [PsychologicalSkill.HedonismoResponsavel]: {
    description: "Divertir-se e desfrutar deliberadamente de prazeres saudáveis na vida, livre de cobranças inflexíveis ou sentimento de culpa.",
    gains: [
      "Alocação equilibrada de dopamina, prevenindo quadros de estafa, cansaço crônico e apatia.",
      "Leveza mental e bem-estar para partilhar com pessoas essenciais no tempo livre.",
      "Elevação da energia e eficiência profissional por interrupções reparadoras planejadas."
    ],
    losses: [
      "Esgotamento neurovegetativo crônico sob a tirania do perfeccionismo perpétuo.",
      "Inabilidade de descansar em finais de semana, permanecendo em ruminação aflita sobre pendências.",
      "Ciclos de rebote agressivo em prazeres descontrolados e compensações autodestrutivas por privação severa."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'Usar parte do meu dia para lazer ou passatempos é prova de preguiça e falha de caráter.'",
        correction: "O autocuidado e o descanso lúdico restabelecem os estoques neurotransmissores essenciais para a alta cognição. O ócio sadio é um ato médico reparador fisiológico."
      },
      {
        distortion: "Distorção 2: 'Eu só poderei tirar férias ou respirar aliviado após bater o ideal impossível de perfeição.'",
        correction: "Padrões rígidos criam idealizações inatingíveis. Esperar a perfeição para relaxar condena Pedro à infelicidade permanente. Diversão é terapia hoje."
      },
      {
        distortion: "Distorção 3: 'Momentos divertidos só trazem real prazer se forem imensamente caros e elaborados.'",
        correction: "O hedonismo de alta qualidade reside em pequenos hábitos diários intencionais vividos integralmente sem remorso (tomar um bom café, caminhar, ler)."
      }
    ],
    affirmations: [
      {
        title: "Satisfação Orgânica",
        content: "Eu honro a necessidade biológica de descansar e divertir-me. Isto recarrega meu cérebro de felicidade."
      },
      {
        title: "Prazer sem Culpa",
        content: "A vida de Pedro Silveira vai além da produtividade profissional. Eu me permito brincar e ser plenamente humano."
      }
    ],
    immersions: [
      { type: "book", title: "A Neuroquímica do Lazer", desc: "Porque prever momentos recreativos é crucial contra a deterioração do sistema imunológico." },
      { type: "podcast", title: "A Arte do Descompressão", desc: "Diretrizes práticas de lazer produtivo de baixo custo sob estresse corporativo." },
      { type: "video", title: "Meditação e o Brincar Adulto", desc: "Explorando atividades lúdicas criativas para desinflamar e estabilizar as taxas de cortisol." }
    ]
  },
  [PsychologicalSkill.SensibilidadeSocial]: {
    description: "Doar-se, apoiar, investir energia sincera e ajudar os outros de forma ética e voluntária, fortalecendo a rede social de bem-estar comum.",
    gains: [
      "Níveis consistentes de ocitocina que promovem bem-estar existencial profundo.",
      "Rápido senso de integração e quebra imediata da solidão por meio do altruísmo ativo.",
      "Rede mútua de suporte protetor quando surgirem fases difíceis de vida."
    ],
    losses: [
      "Foco restrito às próprias angústias (egocentrismo ansioso), gerando exaustão rumiativa.",
      "Perda de laços comunitários pelo ceticismo sistemático de que ninguém merece apoio.",
      "Urgência em julgar severamente os colegas, retroalimentando ambientes hostis de trabalho."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'Ser complacente e amparar as pessoas apenas abre brechas para que folgados abusem.'",
        correction: "Cooperar estruturalmente ativa a melhor faceta filogenética gregária de nossa biologia. Ajudar os outros floresce empatia mútua sob limites firmes."
      },
      {
        distortion: "Distorção 2: 'Com o tanto de cobranças que eu tenho, focar no alívio do outro é desperdiçar tempo.'",
        correction: "Promover pequenos gestos de amparo interpessoal reduz significativamente o peso percebido das nossas próprias mazelas cotidianas e nos engrandece."
      },
      {
        distortion: "Distorção 3: 'Qualquer movimento de solidariedade voluntária me expõe ao risco de subjugação silenciosa.'",
        correction: "A doação autêntica de auxílio opera em plena soberania de quem escolhe ajudar. Consigo ser generoso e altruísta e guardar minha imunidade de direitos."
      }
    ],
    affirmations: [
      {
        title: "Bons Ventos da Reciprocidade",
        content: "Eu contribuo para um mundo mais empático e justo. Ajudar meus pares é um investimento de alma."
      },
      {
        title: "Falta Menos Egocentrismo",
        content: "Ao desviar os olhos das minhas dores para apoiar outro ser humano, crio um cinturão coletivo de paz."
      }
    ],
    immersions: [
      { type: "book", title: "A Ciência da Cooperação e do Pertencimento", desc: "Como dinâmicas cooperativas transformaram a psicologia evolutiva do homem." },
      { type: "article", title: "Ocitocina Contra o Medo Cortical", desc: "Estudos endócrinos detalhando a diminuição da reatividade na amígdala visceral." },
      { type: "podcast", title: "Generosidade Inteligente", desc: "Como apoiar as pessoas sem perder o senso crítico e as fronteiras do autorrespeito." }
    ]
  },
  [PsychologicalSkill.Autoestima]: {
    description: "Reconhecer, nutrir, valorizar e proteger incondicionalmente a própria dignidade, conquistas e capacidades pessoais.",
    gains: [
      "Soberania perante críticas destrutivas ou erros sinceros inevitáveis na vida profissional.",
      "Capacidade de reconhecer as próprias potencialidades e saborear o progresso individual.",
      "Extinção completa da autocrítica abusiva e humilhante em interações sociais."
    ],
    losses: [
      "Auto-avaliação paralisante pautada na inferioridade crônica e vergonha visceral.",
      "Busca desesperada por elogios alheios constantes para justificar a própria existência.",
      "Evitação inábil e esquiva sistêmica de oportunidades por presumir antecipadamente incapacidade."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'Meus fracassos ou gagueiras em reuniões carimbam que sou incompetente definitivo.'",
        correction: "Os insucessos mostram que você é falível e se encontra em aprendizado técnico de transição. Errar não revoga o valor global da sua pessoa."
      },
      {
        distortion: "Distorção 2: 'Se um colega de escrivaninha se destaca, isso significa que sou péssimo.'",
        correction: "O florescimento de outrem decorre do percurso dele. Vida não é uma competição olímpica de valor pessoal. Cada um desabrocha no seu tempo geométrico."
      },
      {
        distortion: "Distorção 3: 'Eu só posso me dar ao luxo de me amar e respeitar se for perfeito em tudo.'",
        correction: "O auto-respeito deve ser sumariamente incondicional. Tratar-se com autocompaixão diante dos limites corporais cria um terreno fértil de superação."
      }
    ],
    affirmations: [
      {
        title: "Autoaceitação Total",
        content: "Meu valor é intrínseco, inalienável e imune às flutuações de opinião ou resultados temporários."
      },
      {
        title: "Reconhecimento das Minhas Forças",
        content: "Observo as minhas potencialidades técnicas com verdade e justiça. Mereço erguer minha fronte hoje."
      }
    ],
    immersions: [
      { type: "book", title: "O Solo Inteiro do Auto-respeito (Poubel & Rodrigues)", desc: "Estudo crítico sobre a defectividade e o resgate da integridade da alma." },
      { type: "video", title: "Dissolvendo o Eu-Punitivo na Cadeira Vazia", desc: "Exercício clínico prático para mediar os ataques severos das autopunições infantis." },
      { type: "podcast", title: "Altas Metas Sadias", desc: "Diferenciando autoexigência produtiva de perfeccionismo incapacitante sob a TCC-4." }
    ]
  },
  [PsychologicalSkill.ImunidadeSocial]: {
    description: "Preservar-se de intromissões, pressões de conformidade e arbitrariedades sociais invasivas de forma ética e consciente.",
    gains: [
      "Soberania ética em relação a falatórios, deboches ou indiferenças de terceiros.",
      "Redução imediata da ansiedade social na fenda sináptica ao focar nos valores internos.",
      "Escolhas autônomas fundadas em lógica, livres da dependência aflita de aprovação."
    ],
    losses: [
      "Subjugação constante dos próprios anseios pela obsessão neurótica de agradar a todos.",
      "Paralisia decisória e dependência permanente de tutores para passos comuns.",
      "Vulnerabilidade crônica a fofocas de café e manipulações sutis no trabalho."
    ],
    distortions: [
      {
        distortion: "Distorção 1: 'O que as pessoas do trabalho comentam sobre Pedro importa ao extremo e altera quem sou.'",
        correction: "O que as pessoas pensam e falam a seu respeito sem o devido conhecimento factual revela apenas limitações pessoais delas. A elas não se deve dar crédito (Pág 8)."
      },
      {
        distortion: "Distorção 2: 'Se grande parte das pessoas segue e prescreve certas regras de atitude, devo acatá-las.'",
        correction: "Muitos replicam costumes cegamente sem qualquer análise lógica ou ética. Agir segundo nossa livre convicção ética nos consagra livres (Pág 4)."
      },
      {
        distortion: "Distorção 3: 'Tenho a obrigação ética de pedir conselhos a familiares ou chefes para toda decisão.'",
        correction: "Podemos escutar opiniões de forma educada, mas o julgamento ético autônomo baseado nos impactos de longo prazo pertencem unicamente a nós. Autonomia é virtude."
      }
    ],
    affirmations: [
      {
        title: "Direito à Isenção Crítica (Pág 263)",
        content: "Possuo o direito legítimo de expressar minhas vontades éticas de forma independente do acolhimento ou desdém da plateia."
      },
      {
        title: "Blindagem de Fronteira (Pág 258)",
        content: "A opinião alheia é mera preferência subjetiva deles, jamais uma prescrição sobre a minha identidade histórica."
      }
    ],
    immersions: [
      { type: "book", title: "Manual Clínico da Blindagem Pessoal (Lincoln Poubel)", desc: "As páginas fundamentais (237-265) traçando o mapa da libertação de pressões coercitivas." },
      { type: "article", title: "O Fator F25 e a Sobrevivência Urbana", desc: "Análise da distinção cirúrgica entre rir com você vs rir de você, preferência vs prescrição." },
      { type: "video", title: "Inativando Tentativas de Subjugação síncronas", desc: "Técnicas clínicas assertivas de imunidade sob olhares depreciativos em salas de reunião." }
    ]
  }
};
