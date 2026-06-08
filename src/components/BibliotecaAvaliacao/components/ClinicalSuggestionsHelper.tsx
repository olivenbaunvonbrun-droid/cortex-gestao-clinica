import React, { useState, useRef, useEffect } from "react";
import { Sparkles, HelpCircle, Check, Copy, RefreshCw, Plus, ChevronDown, Search, X } from "lucide-react";

export type SuggestionsCategoryType =
  | "esquemas"
  | "crencas_centrais"
  | "crencas_intermediarias"
  | "distorcoes"
  | "enfrentamento"
  | "sentimentos"
  | "estilos_parentais"
  | "necessidades_infantil"
  | "necessidades_adulto"
  | "necessidades_conjugal"
  | "necessidades_parental";

export interface ClinicalSuggestionItem {
  key: string;
  value: string; // The text to be inserted
  explanation: string; // Clinical detailed description/explanation
}

export const CLINICAL_SUGGESTIONS_DB: Record<SuggestionsCategoryType, { title: string; items: ClinicalSuggestionItem[] }> = {
  esquemas: {
    title: "Esquemas Iniciais Disfuncionais (EIDs / EDIs)",
    items: [
      {
        key: "Privação Emocional",
        value: "Privação Emocional (Expectativa de que as necessidades de afeto, empatia e proteção não serão supridas)",
        explanation: "Vivência de carência de apoio emocional primário. O paciente sente que ninguém se importa de modo profundo com ele, compreende suas dores ou o protege de perigos."
      },
      {
        key: "Abandono / Instabilidade",
        value: "Abandono / Instabilidade (Percepção de que as pessoas significativas são instáveis, não confiáveis ou irão falecer/ir embora)",
        explanation: "Medo crônico de separação, divórcio ou morte das figuras de apego. Sentimento de que conexões humanas são frágeis e que murcharão a qualquer momento."
      },
      {
        key: "Desconfiança / Abuso",
        value: "Desconfiança / Abuso (Expectativa de que os outros irão mentir, enganar, humilhar ou se aproveitar deliberadamente)",
        explanation: "Sensação constante de estar sob mira de má futilidade alheia. Tende a agir defensivamente ou a pressupor más intenções ocultas em atitudes neutras."
      },
      {
        key: "Isolamento Social / Alienação",
        value: "Isolamento Social / Alienação (Sensação de inadequação cultural, alienação ou de que é fundamentalmente diferente dos outros humana e socialmente)",
        explanation: "Sensação subjetiva de solidão. O indivíduo sente que é um estranho, incompreendido pelo seu círculo social e que não pertence a comunidade alguma."
      },
      {
        key: "Defectividade / Vergonha",
        value: "Defectividade / Vergonha (Crença de ser falho, indesejado, defeituoso por dentro ou moralmente inadequado se descoberto)",
        explanation: "Hipersensibilidade a críticas e forte autocrítica. Medo paralisante de que seus supostos segredos feios venham à tona e causem humilhação definitiva."
      },
      {
        key: "Fracasso",
        value: "Fracasso (Fracasso de realização, sensação de incompetência ou de inferioridade técnica nos estudos em relação aos pares)",
        explanation: "Certeza apriorística de que fracassará na carreira profissional ou acadêmica. Tende a se sabotar por acreditar que não possui intelecto ou capacidade."
      },
      {
        key: "Dependência / Incompetência",
        value: "Dependência / Incompetência (Atitude de desamparo operacional, incapacidade de gerir as obrigações corriqueiras de forma autônoma)",
        explanation: "Sensação de incompetência física ou executiva. O paciente delega decisões vitais a parceiros ou pais por acreditar que não se vira sozinho."
      },
      {
        key: "Vulnerabilidade a Danos ou Doenças",
        value: "Vulnerabilidade a Danos ou Doenças (Temores catastróficos infundados quanto a colapsos médicos, acidentes, crimes ou falência financeira imediata)",
        explanation: "Fobia obsessiva voltada à segurança. Qualquer alteração orgânica ligeira é processada como prenúncio de infarto, câncer ou ruína monetária."
      },
      {
        key: "Emaranhamento / Self Subdesenvolvido",
        value: "Emaranhamento (Fusão de sentimentos e comportamentos com genitores, que solapa o desenvolvimento de uma individualidade consolidada)",
        explanation: "Co-dependência neurótica. O paciente sente que não tem existência legal ou moral própria sem a aprovação diária de figuras parentais."
      },
      {
        key: "Subjugação",
        value: "Subjugação (Controle cedido às pressões externas para evitar rompantes de ira, retaliações sociais ou perdas de vínculo)",
        explanation: "Recomenda-se calar desejos pessoais para apaziguar parceiros ou familiares. Gera acumulação crônica de raiva reprimida que eclode de forma passivo-agressiva."
      },
      {
        key: "Auto-sacrifício",
        value: "Auto-sacrifício (Foco excessivo involuntário em sanar as urgências alheias à custa da sua própria saúde física ou integridade psicológica)",
        explanation: "O indivíduo sente-se culpado se focar em si mesmo. Sacrifica sua própria saúde e repouso para socorrer amigos, cônjuge ou familiares."
      },
      {
        key: "Busca de Aprovação / Reconhecimento",
        value: "Busca de Aprovação ou Reconhecimento (Necessidade crônica de aplausos, aceitação ou validação de terceiros para estabilizar seu valor próprio)",
        explanation: "Perda da identidade autêntica. A prioridade existencial consiste em projetar aparências caras, riqueza ou títulos acadêmicos para angariar admiração alheia."
      },
      {
        key: "Negatividade / Pessimismo",
        value: "Negatividade / Pessimismo (Minimização ou descarte de conquistas benéficas e foco persistente em dores, erros e catástrofes futuras)",
        explanation: "Visão cinzenta de mundo. Há a crença de que qualquer conquista promissora naufragará rapidamente, resultando em ansiedade crônica."
      },
      {
        key: "Inibição Emocional",
        value: "Inibição Emocional (Restrição deliberada e vigilante de manifestações emocionais espontâneas para manter autocontrole absoluto e polidez)",
        explanation: "O paciente evita chorar, expressar afeto caloroso ou raiva legítima. Prefere parecer excessivamente lógico, racional e imune a sensibilidades."
      },
      {
        key: "Padrões Inflexíveis / Crítica Exagerada",
        value: "Padrões Inflexíveis / Crítica Exagerada (Cobrança obsessiva de metas inatingíveis de moralidade, estética ou trabalho com estresse crônico associado)",
        explanation: "Rigidez perfeccionista de conduta. O indivíduo sente que nada é suficientemente bom e sacrifica seu repouso, prazer e relacionamentos em nome do dever."
      },
      {
        key: "Punitividade",
        value: "Punitividade (Impaciência absoluta com erros alheios ou de si mesmo, exigindo castigo implacável sem compreensão de limites normativos)",
        explanation: "Intolerância clínica extrema. Não há condescendência com falhas humanas comuns. O paciente culpa rigidamente e pune quem erra com silêncio ou hostilidade."
      },
      {
        key: "Grandiosidade / Arrogância",
        value: "Grandiosidade / Arrogância (Sensação de ser superior, especial e intocável, demandando tratamento de exceção constante e violando regras sociais)",
        explanation: "Falta de empatia pragmática e sensação de que as normas cotidianas que regem os outros não se aplicam a ele. Tende a subjugar e dominar parceiros."
      },
      {
        key: "Autocontrole / Autodisciplina Insuficientes",
        value: "Autocontrole Insuficiente (Recusa de tolerar frustrações leves e de estender o esforço em prol de metas valiosas de longo prazo)",
        explanation: "Tolerância nula a tédio ou repetição. O paciente sabota estudos, trabalhos ou cuidados com a saúde por não suportar processos penosos."
      }
    ]
  },
  crencas_centrais: {
    title: "Crenças Centrais Disfuncionais",
    items: [
      {
        key: "Desamparo: Eu sou incompetente / incapaz",
        value: "Crença de Desamparo: 'Eu sou incompetente, inútil para os desafios práticos e desprovido de habilidades para vencer na vida.'",
        explanation: "Sensação crônica de fraqueza e insuficiência para enfrentar tarefas, vestibulares, entrevistas profissionais de alto nível ou resolver problemas cotidianos."
      },
      {
        key: "Desamparo: Eu sou fraco / indefeso",
        value: "Crença de Desamparo: 'Eu sou fraco por natureza, indefeso frente à hostilidade humana e incapaz de me proteger dos outros.'",
        explanation: "O paciente sente-se fisicamente ou psicologicamente vulnerável, desprotegido, à mercê de decisões abusivas alheias e incapaz de autoafirmação segura."
      },
      {
        key: "Desamor: Eu sou indigno de amor / indesejável",
        value: "Crença de Desamor: 'Eu sou fundamentalmente indigno de amor, desinteressante e intolerável se as pessoas me conhecerem por dentro.'",
        explanation: "Sentimento profundo de desamor. O indivíduo crê que não merece afeto, que os parceiros se cansarão dele e que o amor só existe se houver performance impecável."
      },
      {
        key: "Desamor: Destinado a ser abandonado / ficar só",
        value: "Crença de Desamor: 'Estou fadado à solidão definitiva. Todos que se aproximam de mim eventualmente irão embora e restarão o abandono e o vazio.'",
        explanation: "Presunção hiper-defensiva de perda iminente. O paciente sabota relacionamentos nascentes para antecipar uma rejeição que já considera garantida."
      },
      {
        key: "Desvalor: Eu sou insignificante",
        value: "Crença de Desvalor: 'Eu sou insignificante, minha existência não tem peso algum no mundo e se eu sumir ninguém notará.'",
        explanation: "Baixíssima estima existencial. O sujeito não se dá licença de ter necessidades e julga que suas manifestações intelectuais ou afetivas valem zero."
      },
      {
        key: "Desvalor: Eu sou mau / nocivo para os outros",
        value: "Crença de Desvalor: 'Eu sou um ser defeituoso, mau de espírito e causo apenas infelicidade para as pessoas que tentam me amar.'",
        explanation: "Culpa clínica internalizada. O paciente carrega a autopercepção crônica de ser contaminado pelas experiências passadas de abuso ou abandono familiares."
      }
    ]
  },
  crencas_intermediarias: {
    title: "Crenças Intermediárias (Regras e Suposições)",
    items: [
      {
        key: "Regra do agrado: Se eu agradar, serei aceito",
        value: "Atitude/Suposição: 'Se eu agradar e acomodar todas as vontades alheias sem reclamar, então serei protegido, aceito e querido.'",
        explanation: "Regra de subjugação protetiva. O indivíduo prefere silenciar incômodos para evitar fricção interpessoal, à custa de negligência de si."
      },
      {
        key: "Suposição do erro: Se eu errar, sou incompetente",
        value: "Suposição: 'Se eu cometer o menor erro operacional no trabalho ou vacilar na faculdade, é prova cabal de que sou uma fraude inútil.'",
        explanation: "Crença intermediária gerada por padrões inflexíveis. Impossibilita o erro pedagógico, gerando paralisia por medo de falhar."
      },
      {
        key: "Regra da vulnerabilidade: Se demonstrar emoção, serei pisado",
        value: "Atitude/Regra: 'Se eu me abrir emocionalmente ou demonstrar fraqueza, as pessoas vão usar isso para me controlar ou me humilhar.'",
        explanation: "Raciocínio defensivo muito comum em esquemas de Desconfiança/Abuso. Promove distanciamento defensivo ou agressividade preventiva."
      },
      {
        key: "Suposição de hipercompensação: Devo ser perfeito para ter valor",
        value: "Suposição/Atitude: 'Eu só terei valor moral e respeito profissional se eu trabalhar 16 horas por dia e produzir resultados perfeitos sem auxílio.'",
        explanation: "Regra extrema voltada a blindar um esquema latente de fracasso ou defectividade através de hiperatividade workaholic compulsiva."
      },
      {
        key: "Regra do distanciamento: Se me criticarem, é o fim",
        value: "Atitude/Regra: 'A crítica profissional é um veredito de destruição existencial. Se alguém discordar de mim, devo romper o contato imediatamente.'",
        explanation: "Regra que nutre a fobia ao julgamento profissional e inviabiliza feedbacks sadios em ambientes corporativos de alta pressão."
      }
    ]
  },
  distorcoes: {
    title: "Distorções Cognitivas Clássicas",
    items: [
      {
        key: "Catastrofização",
        value: "Distorção: Catastrofização (Prever o pior desfecho sem considerar chances realistas amenas)",
        explanation: "A mente infla pequenos riscos normais e os projeta como tragédias inevitáveis de escala insustentável (ex: 'Se eu gaguejar na reunião, serei demitido e ficarei morando na rua')."
      },
      {
        key: "Pensamento Tudo-ou-Nada / Dicotômico",
        value: "Distorção: Pensamento Tudo-ou-Nada (Dicotomização de situações em pólos opostos, sem nuances)",
        explanation: "Classificação binária extremada do self ou de terceiros (ex: 'Ou eu faço uma entrega 100% livre de questionamentos, ou sou um profissional inútil')."
      },
      {
        key: "Filtro Mental / Abstração Seletiva",
        value: "Distorção: Filtro Mental (Foco obsessivo em um único e minúsculo detalhe adverso, apagando o todo sadio)",
        explanation: "O paciente ignora elogios abundantes e passa dias torturando-se com uma palavra neutra dita de soslaio por um colega."
      },
      {
        key: "Desqualificação do Positivo",
        value: "Distorção: Desqualificação do Positivo (Rejeitar fatos admiráveis argumentando que foram apenas acaso)",
        explanation: "O indivíduo desvaloriza seus sucessos legítimos (ex: 'Eles gostaram da apresentação apenas porque são bem-educados, mas foi péssima')."
      },
      {
        key: "Leitura de Mente",
        value: "Distorção: Leitura de Mente (Acreditar saber o que os outros pensam e julgam de você sem ter evidências)",
        explanation: "Presumir de antemão desrespeito ou tédio por parte dos interlocutores (ex: 'Olharam para o relógio porque me acham enfadonho e vão me rejeitar')."
      },
      {
        key: "Supergeneralização",
        value: "Distorção: Supergeneralização (Aplicar falsamente uma única falha pontual como regra de vida duradoura)",
        explanation: "Ampliação absurda de fatos isolados (ex: 'Uma namorada terminou comigo, logo sou intrinsecamente indesejável para qualquer mulher na Terra')."
      },
      {
        key: "Raciocínio Emocional",
        value: "Distorção: Raciocínio Emocional (Tratar as flutuações químicas internas do humor como fatos materiais externos)",
        explanation: "Crer dogmaticamente que sensações internas validam verdades físicas (ex: 'Sinto um aperto terrível no peito, portanto algo trágico vai explodir hoje')."
      },
      {
        key: "Ditadura dos Deverias",
        value: "Distorção: Ditadura dos Deverias (Cobranças imperiosas e inflexíveis com expressões de 'Eu tenho que...')",
        explanation: "Regras arbitrárias severas aplicadas ao comportamento próprio ou de terceiros, gerando sentimentos de culpa neurótica, frustração perpétua e ressentimento."
      },
      {
        key: "Personalização",
        value: "Distorção: Personalização (Chamar para o próprio self a culpa por intempéries alheias desvinculadas de sua ação)",
        explanation: "Atribuição egocêntrica de danos (ex: 'Minha mãe está com cara fechada no almoço, com certeza eu fiz algo de errado que a estragou')."
      },
      {
        key: "Rotulação",
        value: "Distorção: Rotulação (Fixar rótulos absolutos arbitrários no self ou nas pessoas ao redor)",
        explanation: "Reduzir a complexidade humana a chavões limitantes (ex: 'Cometi uma asneira técnica ontem, portanto eu sou um retardado profissional inútil')."
      }
    ]
  },
  enfrentamento: {
    title: "Comportamentos e Estratégias de Enfrentamento",
    items: [
      {
        key: "Resignação (Submissão Passiva)",
        value: "Comportamento de Resignação: Aceitação passiva do padrão doloroso do esquema, agindo como se ele fosse imutável.",
        explanation: "O paciente escolhe parceiros frios se tem Privação Emocional e silencia passivamente suas carências interpessoais, confirmando a profecia do esquema."
      },
      {
        key: "Evitação (Esquiva de Exposição)",
        value: "Comportamento de Evitação: Esquivar-se ativamente de situações que ativem desregulação e ansiedade ligadas ao esquema.",
        explanation: "Fuga sistemática de desafios. Envolve recusar promoções salariais corporativas, procrastinar tarefas árduas e se isolar socialmente de forma preventiva."
      },
      {
        key: "Hipercompensação (Perfeccionismo / Rigidez)",
        value: "Comportamento de Hipercompensação: Lutar contra o esquema de forma beligerante, agindo no extremo oposto de maneira artificial.",
        explanation: "O indivíduo tenta compensar inferioridade impondo dominância exagerada, perfeccionismo doentio, arrogância cênica e defensividade irada."
      },
      {
        key: "Hipercompensação (Busca obsessiva por poder/status)",
        value: "Comportamento de Hipercompensação: Perseguição incansável por riqueza, títulos ou cargos de comando para silenciar o sentimento de demência latente.",
        explanation: "Utilização do status profissional como armadura. Tende a tratar pares com altivez e a se desregular ao menor indício de feedback corretivo."
      },
      {
        key: "Evitação (Anestesia Emocional / Abuso de Substâncias)",
        value: "Comportamento de Evitação: Uso de álcool, comida, jogos ou fármacos de forma compulsiva para entorpecer e anestesiar dores psíquicas de solidão.",
        explanation: "Procura incessante por escapes dopaminérgicos imediatos que ajudem a atenuar temporariamente o vazio, sem resolver os conflitos subjacentes."
      }
    ]
  },
  sentimentos: {
    title: "Sentimentos e Estados Emocionais",
    items: [
      {
        key: "Ansiedade Antecipada",
        value: "Sentimento de Ansiedade Antecipada (Tensão vigilante contínua quanto a perigos futuros percebidos)",
        explanation: "Estado hiper-alerta do sistema nervoso, focado em cenários catastróficos, acompanhado por rigidez muscular e aceleração cardíaca."
      },
      {
        key: "Vergonha Humilhação",
        value: "Sentimento de Vergonha e Humilhação (Vulnerabilidade dolorosa ligada à convicção de defeito interno)",
        explanation: "Sensação visceral de inadequação frente ao olhar alheio. O sentimento de que se é indigno de respeito, gerando o impulso urgente de se esconder e calar."
      },
      {
        key: "Tristeza Desoladora",
        value: "Sentimento de Tristeza Desoladora (Sensação profunda de carência afetiva crônica, apatia existencial e abandono)",
        explanation: "Luto pelas dores do passado e sentimento de que a vida carece de calor emocional ou de pessoas verdadeiramente comprometidas com o seu bem."
      },
      {
        key: "Culpa Patológica / Autocobrança",
        value: "Sentimento de Culpa Devastadora (Sentir-se pessoalmente responsável por toda dor expressa no ambiente familiar)",
        explanation: "O paciente tortura-se por ter violado diretrizes perfeccionistas autoimpostas ou por se julgar indevidamente o causador da discórdia alheia."
      },
      {
        key: "Raiva / Indignação Reativa",
        value: "Sentimento de Raiva / Indignação (Impulso agressivo reativo diante da invasão de limites individuais)",
        explanation: "Irritação desproporcional decorrente do cansaço das subjugações pretéritas. O paciente eclode sob stress para defender regras rígidas pessoais."
      },
      {
        key: "Frustração / Desalento Profissional",
        value: "Sentimento de Frustração (Esgotamento diante de esforços seguidos sabotados por distorções e evitamentos)",
        explanation: "Sensação subjetiva de saturação e estagnação laboral, gerada pela incapacidade de se posicionar de cabeça erguida e propor novas ideias aos líderes."
      }
    ]
  },
  estilos_parentais: {
    title: "Estilos Parentais (Histórico Formativo)",
    items: [
      {
        key: "Autoritário / Punitivo",
        value: "Estilo Parental Autoritário / Punitivo (Exigência mecânica de regras, punições severas e escassas demonstrações de calor afetivo)",
        explanation: "Os pais exercem poder opressor. Não há espaço para o erro ou diálogos afetivos; a criança cresce imersa em cobranças de performance impecável."
      },
      {
        key: "Permissivo / Indulgente",
        value: "Estilo Parental Permissivo / Indulgente (Superproteção debilitante, carência de contornos e limites realistas)",
        explanation: "Os pais poupam a criança de qualquer contrariedade do mundo real. Estimula a ausência de autodisciplina e a baixa tolerância à frustração no adulto."
      },
      {
        key: "Negligente / Desconectado",
        value: "Estilo Parental Negligente / Ausente (Falta de suporte físico, emocional e afetivo básico, com frieza ou exaustão parental)",
        explanation: "A infância transcorre desamparada de amparo afetivo genuíno. A criança é impelida a se virar sozinha precocemente, gerando esquemas de abandono."
      },
      {
        key: "Autoritativo (Socioemocionalmente Saudável)",
        value: "Estilo Parental Autoritativo / Democrático (Balanço ideal de afeto incondicional constante e imposição firme de limites coerentes)",
        explanation: "Os pais validam dores, apoiam a resiliência ativa, mas cobram regras claras de cooperação social adequadas à idade do filho."
      },
      {
        key: "Espantoso / Instável (Inconsistente)",
        value: "Estilo Parental Inconsistente / Instável (Oscilação caótica de genitores entre afeto bajulador extremo e explosões raivosas de insultos)",
        explanation: "Gera pânico existencial na criança, que nunca aprende a prever as reações parentais. Consolida esquemas permanentes de Desconfiança e Abuso."
      }
    ]
  },
  necessidades_infantil: {
    title: "Necessidades Psicológicas - Contexto Infantil",
    items: [
      {
        key: "Vínculo Seguro, Aceitação e Cuidado",
        value: "Necessidade Infantil: Vínculo Seguro (Segurança de afeto contínuo, estabilidade protetiva de figuras parentais e aceitação)",
        explanation: "Demanda do desenvolvimento por sentir que os cuidadores são uma base inabalável de amor e nunca sumirão nos momentos de crise infantil."
      },
      {
        key: "Autonomia e Competência",
        value: "Necessidade Infantil: Autonomia e Competência (Estímulo sadio à iniciativa própria para se testar e agir sem controle asfixiante)",
        explanation: "A criança precisa de licença e estímulo para brincar, resolver pequenas querelas só e se perceber um indivíduo apartável e eficaz."
      },
      {
        key: "Limites Realistas e Autocontrole",
        value: "Necessidade Infantil: Limites Realistas (Aprender a lidar com frustrações normais de cooperação e respeitar limites alheios)",
        explanation: "Aprender a escutar o 'não' sem colapsos infantis irremediáveis. Fundamental para estruturar circuitos de persistência laboral no cérebro."
      },
      {
        key: "Liberdade para Expressar Necessidades e Emoções",
        value: "Necessidade Infantil: Liberdade de Expressão (Espaço de acolhimento para verbalizar raiva, medo ou choro sem invalidação verbal)",
        explanation: "Necessita de pais sensíveis que ajudem a nomear e modular biologicamente os sentimentos infantis, em vez de exigir silêncio forçado de submissão."
      },
      {
        key: "Esponatenidade e Jogo/Lazer",
        value: "Necessidade Infantil: Espontaneidade e Jogo (Liberdade de brincar sem cobranças prematuras de rendimento ou maturidade)",
        explanation: "Necessidade vital de se divertir livremente, rir de bobagens e viver o lúdico sem obrigações funcionais severas antecipadas de adultos."
      }
    ]
  },
  necessidades_adulto: {
    title: "Necessidades Psicológicas - Contexto Adulto",
    items: [
      {
        key: "Validação Interna e Autoestima",
        value: "Necessidade Adulta: Validação Interna e Autoestima (Sólido senso de dignidade existencial apartada das demandas de validação externa)",
        explanation: "O adulto necessita aprender a autodescrever seus pontos fortes e sustentar seu valor próprio mesmo sob eventuais críticas ou rejeições externas."
      },
      {
        key: "Significado, Autenticidade e Carreira Genuína",
        value: "Necessidade Adulta: Significado e Autenticidade (Alinhar escolhas ocupacionais aos valores profundos do seu self)",
        explanation: "Demanda por exercer uma profissão que mobilize suas verdadeiras paixões existenciais, em vez de viver sob imposições familiares sufocantes."
      },
      {
        key: "Pertencimento e Conexão Comunitária",
        value: "Necessidade Adulta: Pertencimento (Vínculos horizontais recíprocos de amizade sincera em comunidades de interesses mútuos)",
        explanation: "Compartilhar a jornada em grupos onde seja valorizado pela sua essência genuína, mitigando o aborrecimento e isolamento cotidianos."
      },
      {
        key: "Paciência e Autorregulação Fisiológica",
        value: "Necessidade Adulta: Autorregulação (Tempo hábil de descanso, cuidados de saúde orgânica, sono de qualidade e limites na labuta)",
        explanation: "Práticas de autocuidado essenciais para estabilizar taxas de cortisol e dar sustentação biológica estável aos processos de enfrentamento cognitivo."
      }
    ]
  },
  necessidades_conjugal: {
    title: "Necessidades Psicológicas - Contexto Conjugal",
    items: [
      {
        key: "Validação Recíproca e Intimidade Emocional",
        value: "Necessidade Conjugal: Validação Recíproca (Fronteira segura do amor onde ambos admitem fragilidades comuns sem receios defensivos)",
        explanation: "Pacto de reciprocidade afetiva. Exige escuta compassiva livre de ironias ácidas, em que o casal sinta-se aceito intimamente."
      },
      {
        key: "Segurança de Vínculo e Aliança Segura",
        value: "Necessidade Conjugal: Aliança Segura (Certeza mútua da lealdade prioritária e de suporte recíproco em tormentas externas)",
        explanation: "Garantia de que o cônjuge é sua parceria prioritária do mundo prático e que não haverá trapaças, desqualificações públicas ou fáceis abandonos."
      },
      {
        key: "Cooperação Prática e Equidade Operacional",
        value: "Necessidade Conjugal: Cooperação Prática (Divisão de obrigações cotidianas e finanças com isonomia equilibrada)",
        explanation: "Previne o estresse ocupacional e a subjugação ressentida que eclode quando um dos cônjuges centraliza toda a sobrecarga executiva da família."
      },
      {
        key: "Individualidade e Autocuidado Mantidos",
        value: "Necessidade Conjugal: Individualidade Mantida (Espaço sadio para hobbys de lazer individuais do self, sem patrulhamento ciumento)",
        explanation: "O casamento necessita de ar e respiro de autonomia. Nutre o desejo e evita a asfixia de emaranhamentos simbióticos desadaptativos."
      }
    ]
  },
  necessidades_parental: {
    title: "Necessidades Psicológicas - Contexto Parental",
    items: [
      {
        key: "Divisão de Carga e Coparentalidade Ativa",
        value: "Necessidade Parental: Coparentalidade Alinhada (Parceria equitativa no gerenciamento emocional e físico da rotina dos filhos)",
        explanation: "Exige comunicação unificada e divisão salutar da loucura diária doméstica, evitando que um dos pais desmorone em Burnout parental."
      },
      {
        key: "Auto-compaixão contra Culpas Fantasiosas",
        value: "Necessidade Parental: Auto-compaixão Parental (Consciência tolerante de que genitores fazem o melhor possível e cometem erros comuns)",
        explanation: "Descarte da pretensão de suntuosa perfeição mítica parental. Atenua o autoelogio inalcançável e a culpa por variações de humor infantis."
      },
      {
        key: "Tempo de Reabastecimento Isolado dos Filhos",
        value: "Necessidade Parental: Espaço de Reabastecimento (Tempo semanal livre para repouso, lazer isolado e reconexão consigo mesmo)",
        explanation: "Genitores exaustos não possuem paciência estrutural refinada. Garantir saídas de descanso é o melhor antídoto contra agressividade doméstica."
      },
      {
        key: "Validação e Sentido de Competência",
        value: "Necessidade Parental: Senso de Competência (Amparo social e validação técnica de que as condutas parentais adotadas dão frutos graduais)",
        explanation: "Fugir das palpitações intrometidas e fofocas agressivas de parentes distantes, fortalecendo a segurança decisória da parentalidade saudável."
      }
    ]
  }
};

interface ClinicalSuggestionsButtonProps {
  category: SuggestionsCategoryType;
  onSelectSuggestion: (selectedValue: string) => void;
  className?: string;
  tooltipText?: string;
}

export function ClinicalSuggestionsButton({
  category,
  onSelectSuggestion,
  className = "",
  tooltipText = "Sugestões de Preenchimento"
}: ClinicalSuggestionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const config = CLINICAL_SUGGESTIONS_DB[category] || {
    title: "Sugestões Clínicas",
    items: []
  };

  const filteredItems = config.items.filter(
    item =>
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val: string, method: "replace" | "append" | "copy") => {
    if (method === "copy") {
      navigator.clipboard.writeText(val);
    } else {
      onSelectSuggestion(val);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef} id={`helper-root-${category}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-500/30 hover:border-amber-500 bg-amber-500/10 text-amber-400 hover:text-amber-300 font-sans text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
        title={tooltipText}
        id={`helper-trigger-btn-${category}`}
      >
        <Sparkles size={12} className="animate-pulse" />
        <span>Sugestões</span>
        <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Suggestion Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute z-[999] mt-1.5 w-80 sm:w-96 bg-[#0c0d12] border border-gray-800 rounded-xl shadow-2xl p-3.5 space-y-3 font-sans animate-fadeIn left-0 sm:left-auto sm:right-0"
          id={`helper-panel-box-${category}`}
          style={{ minWidth: "320px" }}
        >
          {/* Header Panel */}
          <div className="flex justify-between items-start pb-2 border-b border-gray-900">
            <div>
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider block">Sugestões Clínicas</span>
              <h5 className="text-[12px] text-gray-100 font-bold mt-0.5">{config.title}</h5>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-300 bg-transparent border-0 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-gray-500" size={13} />
            <input
              type="text"
              placeholder="Pesquisar termo ou explicação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#13141a] border border-gray-800 focus:border-amber-550 focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-550"
            />
          </div>

          {/* Guidelines / Double Columns list */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1" id="suggestions-list-box">
            {filteredItems.length === 0 ? (
              <span className="text-[11px] text-gray-550 italic block text-center py-2">
                Nenhum termo clínico encontrado para "{searchTerm}".
              </span>
            ) : (
              filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg border border-gray-900/60 bg-gray-950/40 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all flex flex-col space-y-1 group"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs text-gray-200 font-semibold group-hover:text-amber-400 font-sans">
                      {item.key}
                    </span>
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* Action buttons */}
                      <button
                        type="button"
                        onClick={() => handleSelect(item.value, "replace")}
                        className="p-1 px-1.5 text-[9px] font-mono hover:bg-amber-500 hover:text-gray-950 text-amber-500 rounded border border-amber-500/20 bg-transparent cursor-pointer font-bold"
                        title="Substituir campo de texto completo"
                      >
                        Substituir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelect(item.value, "copy")}
                        className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded bg-transparent border-0 cursor-pointer"
                        title="Copiar para área de transferência"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded explanation/description details */}
                  <p className="text-[10px] text-gray-450 leading-relaxed font-normal p-1 bg-[#101116] border border-gray-900 rounded select-none">
                    {item.explanation}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Quick Informational Bottom line */}
          <div className="text-[9px] text-gray-550 font-mono text-center pt-1 border-t border-gray-900 flex justify-between px-1">
            <span>Lincoln Poubel</span>
            <span className="text-amber-500 font-bold">TERAPIA DE ESQUEMAS</span>
          </div>

        </div>
      )}
    </div>
  );
}

export function ClinicalSuggestionsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SuggestionsCategoryType>("esquemas");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const categoriesList: { id: SuggestionsCategoryType; name: string }[] = [
    { id: "esquemas", name: "EDIs (Esquemas)" },
    { id: "crencas_centrais", name: "Crenças Centrais" },
    { id: "crencas_intermediarias", name: "Crenças Intermediárias" },
    { id: "distorcoes", name: "Distorções Cognitivas" },
    { id: "enfrentamento", name: "Enfrentamento" },
    { id: "sentimentos", name: "Sentimentos / Estados" },
    { id: "estilos_parentais", name: "Estilos Parentais" },
    { id: "necessidades_infantil", name: "Nec. Psicológica: Infantil" },
    { id: "necessidades_adulto", name: "Nec. Psicológica: Adulto" },
    { id: "necessidades_conjugal", name: "Nec. Psicológica: Conjugal" },
    { id: "necessidades_parental", name: "Nec. Psicológica: Parentagem" }
  ];

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const currentCategoryData = CLINICAL_SUGGESTIONS_DB[selectedCategory];

  const filteredItems = currentCategoryData.items.filter(
    item =>
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative font-sans" id="clinical-sidebar-helper-root">
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[80px] right-6 z-[9999] flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-gray-950 font-sans text-xs font-black shadow-2xl p-3 px-4 rounded-full transition-transform hover:scale-105 active:scale-95 border-0 cursor-pointer uppercase tracking-wider"
        title="Dicionário e Sugestões Clínicas de Preenchimento"
        id="clinical-floating-trigger-btn"
      >
        <Sparkles size={14} className="animate-spin text-gray-950" style={{ animationDuration: "10s" }} />
        <span>Sugestões Clínicas</span>
      </button>

      {/* Sidebar Panel overlay sliding from right */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[9998] animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar Drawer container */}
          <div
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-[#0c0d12]/98 border-l border-gray-800 shadow-2xl z-[9999] p-5 flex flex-col space-y-4 animate-slideInRight"
            id="clinical-floating-drawer"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-gray-900 pb-3" id="clinical-drawer-header">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">Lincoln Poubel</span>
                <h3 className="text-base font-black text-gray-150 mt-1 flex items-center gap-1.5 font-sans">
                  <Sparkles size={16} className="text-amber-400" />
                  BANCO DE SUGESTÕES CLÍNICAS
                </h3>
                <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                  Copie conceitos técnicos fundamentais e explicados diretamente para suas ferramentas.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-900 rounded-lg text-gray-400 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selector list of Categories */}
            <div className="space-y-1.5" id="clinical-drawer-selector-box">
              <label className="text-[10px] font-mono font-black text-gray-450 uppercase tracking-wider block">Selecione o Contexto Clínico:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as SuggestionsCategoryType);
                  setSearchTerm("");
                }}
                className="w-full bg-[#14151b] border border-gray-800 text-gray-200 text-xs rounded-lg p-2 focus:outline-none focus:border-amber-500"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword search input */}
            <div className="relative" id="clinical-drawer-search-box">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
              <input
                type="text"
                placeholder="Pesquisar por palavra chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#14151b] border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500 placeholder-gray-600"
              />
            </div>

            {/* List results scrollpane */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1" id="clinical-drawer-results">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  {filteredItems.length} termos clínicos encontrados
                </span>
                <span className="text-[9px] text-gray-600 italic">Clique em Copiar para utilizar</span>
              </div>

              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#111218] border border-gray-900 hover:border-amber-500/20 rounded-xl p-3.5 space-y-2 transition-all group relative"
                >
                  <div className="flex justify-between items-start gap-3">
                    <h5 className="text-[12px] text-gray-150 font-bold group-hover:text-amber-400 transition-colors font-sans leading-snug">
                      {item.key}
                    </h5>
                    <button
                      onClick={() => handleCopy(item.value, item.key)}
                      className="p-1 px-2 text-[10px] font-mono font-bold hover:bg-amber-500 hover:text-gray-950 text-amber-400 rounded-md border border-amber-500/30 bg-transparent cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      title="Copiar texto de preenchimento sugerido"
                    >
                      {copiedKey === item.key ? (
                        <>
                          <Check size={11} />
                          Copie!
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans bg-gray-950/50 p-2.5 rounded-lg border border-gray-950 select-text">
                    <span className="text-amber-500 font-bold font-mono text-[9px] uppercase tracking-wider block mb-0.5">Explicação Clínica:</span>
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom info signature banner */}
            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-center space-y-1 block" id="clinical-drawer-footer">
              <span className="text-[11px] text-amber-300 font-bold block">Terapia de Esquemas Integrada</span>
              <span className="text-[9px] text-gray-550 block font-mono">Consulte explicações e insira em qualquer formulário de laudos.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
