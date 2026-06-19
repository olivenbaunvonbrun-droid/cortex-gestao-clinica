import React, { useState, useRef, useEffect } from "react";
import { Sparkles, HelpCircle, Check, Copy, RefreshCw, Plus, ChevronDown, Search, X } from "lucide-react";

export type SuggestionsCategoryType =
  | "esquemas"
  | "esquemas_adaptativos"
  | "crencas_centrais"
  | "crencas_centrais_funcionais"
  | "crencas_intermediarias"
  | "crencas_intermediarias_adaptativas"
  | "distorcoes"
  | "pensamentos_automaticos_negativos"
  | "pensamentos_automaticos_positivos"
  | "enfrentamento"
  | "enfrentamento_funcional"
  | "modos_esquematicos"
  | "necessidades_emocionais_frustradas"
  | "necessidades_emocionais_atendidas"
  | "vieses_cognitivos"
  | "padroes_comportamentais_disfuncionais"
  | "padroes_comportamentais_funcionais"
  | "sentimentos"
  | "sentimentos_funcionais"
  | "fatores_protetivos"
  | "parametros_avancados"
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
      },
      {
        key: "Suposição do desamparo: Se eu pedir ajuda, sou fraco",
        value: "Suposição: 'Se eu precisar pedir ajuda a alguém para resolver um problema, é porque sou fraco e incapaz.'",
        explanation: "Crença intermediária que impede a busca por cooperação mútua sadia no ambiente de trabalho ou pessoal."
      },
      {
        key: "Regra da punitividade: Devo punir meus erros",
        value: "Atitude/Regra: 'Se eu cometer um erro, não mereço descanso nem perdão; devo me cobrar e me punir rigorosamente.'",
        explanation: "Regra extrema que gera exaustão mental crônica e alimenta a autocrítica punitiva nociva."
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
      },
      {
        key: "Minimização / Maximização",
        value: "Distorção: Minimização / Maximização (Exagerar a gravidade de falhas ou minimizar a importância de acertos)",
        explanation: "Processamento distorcido onde conquistas parecem irrelevantes e deslizes comuns assumem proporções catastróficas."
      },
      {
        key: "Adivinhação / Previsão do Futuro",
        value: "Distorção: Adivinhação (Prever que eventos futuros terão desfechos negativos de forma dogmática)",
        explanation: "A pessoa adota uma postura fatalista, agindo como se um fracasso ou tragédia futura já estivesse predefinido."
      },
      {
        key: "Comparação Injusta",
        value: "Distorção: Comparação Injusta (Comparar-se com pessoas com vantagens extremas, sentindo-se inferior)",
        explanation: "O paciente foca apenas nas qualidades e conquistas de terceiros e as contrasta com suas próprias fraquezas cotidianas."
      },
      {
        key: "Falácia da Justiça",
        value: "Distorção: Falácia da Justiça (Julgar que tudo deveria ser justo de acordo com suas regras e ressentir-se)",
        explanation: "Indignação crônica quando a realidade não corresponde a regras ideais de justiça distributiva ou moral."
      },
      {
        key: "Falácia do Controle",
        value: "Distorção: Falácia do Controle (Sentir responsabilidade extrema por tudo ao redor ou sentir controle nulo)",
        explanation: "Pensar que controla reações alheias (hipercontrole) ou que é vítima indefesa das circunstâncias (controle nulo)."
      },
      {
        key: "Falácia da Mudança",
        value: "Distorção: Falácia da Mudança (Achar que o próprio bem-estar depende de fazer as outras pessoas mudarem)",
        explanation: "Pressionar e focar esforços em alterar a conduta do cônjuge ou colegas para tentar se sentir feliz."
      },
      {
        key: "Viés Confirmatório",
        value: "Distorção: Viés Confirmatório (Apenas filtrar fatos que confirmem suas crenças e ignorar o resto)",
        explanation: "O paciente processa seletivamente críticas e desconsidera elogios, mantendo ativas suas crenças centrais latentes."
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
        key: "Hipercompensação (Busca obsessiva por status)",
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
      },
      {
        key: "Vazio existencial",
        value: "Sentimento: Vazio Existencial (Falta crônica de sentido interno, apatia e desconexão de desejos genuínos)",
        explanation: "Estado de anestesia e falta de propósito, frequentemente associado a esquemas de subjugação e emaranhamento subjacentes."
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
    title: "Necessidades Clínicas - Parâmetros Infantis",
    items: [
      { key: "Atenção", value: "Necessidade Infantil: Atenção (Sentir-se notada, vista, percebida fisicamente e socialmente)", explanation: "A criança se sente notada, vista, percebida pelos pais?" },
      { key: "Carinho", value: "Necessidade Infantil: Carinho (Receber contato físico agradável, afeto, calor e ternura)", explanation: "Recebe contato físico agradável, afeto e abraços?" },
      { key: "Admiração", value: "Necessidade Infantil: Admiração (Sente-se admirada, valorizada e encorajada na sua essência)", explanation: "Sente-se admirada, valorizada e elogiada pelos cuidadores?" },
      { key: "Vínculo", value: "Necessidade Infantil: Vínculo (Sente-se conectada, pertencente e acolhida de forma incondicional)", explanation: "Sente-se conectada, pertencente à família nuclear e aos pais?" },
      { key: "Proteção", value: "Necessidade Infantil: Proteção (Sente-se segura, livre de ameaças e fisicamente amparada)", explanation: "Sente-se segura, amparada nos momentos de angústia ou medo?" },
      { key: "Cuidado", value: "Necessidade Infantil: Cuidado (Necessidades básicas como fome, sono e higiene atendidas)", explanation: "Suas necessidades básicas (alimentação, repouso, higiene) são atendidas?" },
      { key: "Autonomia", value: "Necessidade Infantil: Autonomia (Estímulo sadio a ser independente e agir por si mesma)", explanation: "É incentivada a ser independente e a fazer coisas por si mesma?" },
      { key: "Sociabilidade", value: "Necessidade Infantil: Sociabilidade (Interação horizontal e troca com outras crianças/pares)", explanation: "Consegue trocar, compartilhar e interagir com outras pessoas de forma sadia?" },
      { key: "Conversação", value: "Necessidade Infantil: Conversação (Poder dialogar e expressar ideias e sentimentos livremente)", explanation: "Pode dialogar, expressar seus pensamentos e sentimentos sem repressões?" },
      { key: "Instrução", value: "Necessidade Infantil: Instrução (Sente-se inteligente, capaz de aprender, raciocinar e refletir)", explanation: "Sente-se inteligente, capaz de aprender, receber ensino e refletir?" },
      { key: "Diversão", value: "Necessidade Infantil: Diversão (Necessidade vital de brincar e explorar o mundo ludicamente)", explanation: "Tem a necessidade de brincar, recriar-se e explorar atendida?" },
      { key: "Responsabilidade", value: "Necessidade Infantil: Responsabilidade (Carregar limites realistas e entender consequências)", explanation: "Carrega limites coerentes e entende as consequências de seus atos no convívio?" },
      { key: "Gregariedade", value: "Necessidade Infantil: Gregariedade (Sentir que agrega valor à vida do outro, sendo boa e bondosa)", explanation: "Sente que agrega valor à vida do outro, sendo generosa, bondosa e cooperativa?" },
      { key: "Identidade", value: "Necessidade Infantil: Identidade (Consegue se ver e ter um autoconceito claro apartada dos pais)", explanation: "Consegue se ver com clareza e ter um autoconceito nítido de sua individualidade?" },
      { key: "Compreensão", value: "Necessidade Infantil: Compreensão (Sente-se compreendida em suas dores e empatizada)", explanation: "Sente-se compreendida e empatizada nas suas dificuldades diárias?" }
    ]
  },
  necessidades_parental: {
    title: "Necessidades Clínicas - Parâmetros Parentais",
    items: [
      { key: "Honra", value: "Necessidade Parental: Honra (O filho honra os valores e orientações dos pais na ausência deles)", explanation: "O filho honra os valores e orientações dos pais, mesmo na ausência deles?" },
      { key: "Respeito", value: "Necessidade Parental: Respeito (O filho respeita, acata e considera os pais na presença deles)", explanation: "O filho respeita e considera os pais e sua liderança na sua presença?" },
      { key: "Acariciamento", value: "Necessidade Parental: Acariciamento (Troca de afeto físico sadio como carícias e abraços)", explanation: "Há uma troca de afeto físico mútuo (carícias, abraços) na relação com os filhos?" },
      { key: "Admiração", value: "Necessidade Parental: Admiração (Os pais se sentem admirados e valorizados pelos filhos)", explanation: "Os pais se sentem admirados e reconhecidos pelos filhos em suas condutas?" },
      { key: "Vínculo", value: "Necessidade Parental: Vínculo (Sentem-se conectados, próximos e afetivamente sintonizados)", explanation: "Os pais sentem-se conectados e próximos aos filhos?" },
      { key: "Autoridade", value: "Necessidade Parental: Autoridade (Sentirem-se como a liderança firme e a referência vital)", explanation: "Sentem-se como a liderança legítima e a referência reguladora na vida dos filhos?" },
      { key: "Autonomia Parental", value: "Necessidade Parental: Autonomia Parental (Exercer a parentalidade livre de intromissões)", explanation: "Sentem-se livres para exercer a parentalidade sem interferências de avós, vizinhos, etc.?" },
      { key: "Diálogo", value: "Necessidade Parental: Diálogo (Conseguir conversar, orientar e trocar ideias abertamente)", explanation: "Conseguem conversar de forma bidirecional e trocar ideias com os filhos?" },
      { key: "Compreensão", value: "Necessidade Parental: Compreensão (Sentirem-se compreendidos em suas limitações adultas)", explanation: "Sentem-se compreendidos pelos filhos em suas dificuldades e limitações pragmáticas?" },
      { key: "Sabedoria", value: "Necessidade Parental: Sabedoria (Sentirem-se mentores capazes de instruir e guiar na vida)", explanation: "Sentem-se como mentores sadios, capazes de instruir e guiar os filhos para o futuro?" }
    ]
  },
  necessidades_conjugal: {
    title: "Necessidades Clínicas - Parâmetros na Conjugalidade",
    items: [
      { key: "Atenção Conjugal", value: "Necessidade Conjugal: Atenção (O casal se sente notado, visto e visível um para o outro)", explanation: "O casal se sente notado, visto e visível um para o outro na rotina?" },
      { key: "Admiração Conjugal", value: "Necessidade Conjugal: Admiração (Sentirem-se admirados e reconhecidos por quem são)", explanation: "Sentem-se admirados e reconhecidos pelo que são e pelo que realizam na união?" },
      { key: "Conversa Íntima", value: "Necessidade Conjugal: Conversa Íntima (Espaço para confidências, segredos e vulnerabilidades)", explanation: "Há um espaço seguro para troca de confidências, segredos e partilha de fraquezas?" },
      { key: "Carinho Conjugal", value: "Necessidade Conjugal: Carinho (Troca de carícias, toques e afeto físico não sexual)", explanation: "Existe troca frequente de carícias, toques afetuosos e afeto físico não sexual?" },
      { key: "Atração Física", value: "Necessidade Conjugal: Atração Física (Sentirem-se atraentes e desejados mutuamente)", explanation: "Sentem-se sexualmente atraentes e desejados um pelo outro?" },
      { key: "Sexo", value: "Necessidade Conjugal: Sexo (Vida sexual satisfatória das preliminares ao orgasmo)", explanation: "A vida sexual é mutuamente satisfatória, desde as preliminares até o orgasmo?" },
      { key: "Romantismo", value: "Necessidade Conjugal: Romantismo (Surpresas, gestos de afeto e lembrança na ausência)", explanation: "Há surpresas, gestos espontâneos de carinho e a sensação de ser lembrado na ausência?" },
      { key: "Apoio Doméstico", value: "Necessidade Conjugal: Apoio Doméstico (Parceria e colaboração ativa nas tarefas da casa)", explanation: "Há parceria, divisão justa e colaboração nas tarefas domésticas diárias?" },
      { key: "Apoio Financeiro", value: "Necessidade Conjugal: Apoio Financeiro (Parceria e transparência na gestão de finanças)", explanation: "Existe parceria, clareza e transparência na gestão das finanças do casal?" },
      { key: "Lazer Conjugal", value: "Necessidade Conjugal: Lazer (Conseguirem se divertir, relaxar e se recriar juntos)", explanation: "O casal consegue se divertir, rir e ter momentos recreativos juntos?" },
      { key: "Individualidade", value: "Necessidade Conjugal: Individualidade (Respeito à privacidade e interesses de cada um)", explanation: "A privacidade e os interesses individuais de cada um são respeitados sem ciúmes?" }
    ]
  },
  necessidades_adulto: {
    title: "Necessidades Clínicas - Parâmetros Adultos (Individuais)",
    items: [
      { key: "Atenção Adulta", value: "Necessidade Adulta: Atenção (Receber atenção das pessoas próximas de forma regulada)", explanation: "Recebe atenção das pessoas ao redor? Sente necessidade de muita ou pouca?" },
      { key: "Carinho Adulto", value: "Necessidade Adulta: Carinho (Receber afeto físico e toques de forma confortável)", explanation: "Recebe afeto físico e acolhimento? É carente ou apresenta evitação ao toque?" },
      { key: "Reconhecimento Adulto", value: "Necessidade Adulta: Reconhecimento (Sente-se admirado, valorizado e validado)", explanation: "Sente-se admirado e valorizado profissional ou socialmente?" },
      { key: "Autoestima Adulta", value: "Necessidade Adulta: Autoestima (Sente-se valioso, digno e competente como pessoa)", explanation: "Sente-se valioso, seguro de si e merecedor de afeto/respeito?" },
      { key: "Vínculo Adulto", value: "Necessidade Adulta: Vínculo (Sentir-se conectado e pertencente a círculos íntimos)", explanation: "Sente-se conectado emocionalmente a outras pessoas na sua vida?" },
      { key: "Confiança", value: "Necessidade Adulta: Confiança (Capacidade de se abrir e confiar na lealdade alheia)", explanation: "Consegue confiar nos outros e estabelecer relações livres de suspeitas?" },
      { key: "Sociabilidade Adulta", value: "Necessidade Adulta: Sociabilidade (Capacidade de interagir bem e se socializar)", explanation: "É sociável, comunica-se com facilidade e interage bem em grupos?" },
      { key: "Atratividade", value: "Necessidade Adulta: Atratividade (Sentir-se desejável, atraente e esteticamente aceito)", explanation: "Sente-se desejável, bonito e atraente física ou socialmente?" },
      { key: "Realização", value: "Necessidade Adulta: Realização (Sentir-se cumpridor de metas e tarefas propostas)", explanation: "Sente-se um realizador de tarefas, que executa o que planeja sem procrastinar?" },
      { key: "Autonomia Adulta", value: "Necessidade Adulta: Autonomia (Independência para decidir e agir por si só)", explanation: "Sente-se independente e capaz de agir baseado no seu próprio repertório?" },
      { key: "Proteção Adulta", value: "Necessidade Adulta: Proteção (Sentir-se seguro contra abusos, perigos e riscos)", explanation: "Sente-se seguro, em paz e livre de ameaças ou abusos de terceiros?" },
      { key: "Asserção", value: "Necessidade Adulta: Asserção (Expressar opinião honestamente de forma assertiva)", explanation: "Consegue expressar sua opinião honestamente e colocar limites firmes?" },
      { key: "Gregariedade Adulta", value: "Necessidade Adulta: Gregariedade (Sentir-se útil e agregador de valor à vida alheia)", explanation: "Sente-se útil no mundo, percebendo que agrega valor à vida das outras pessoas?" },
      { key: "Compreensão Adulta", value: "Necessidade Adulta: Compreensão (Sentir-se ouvido, compreendido e empatizado)", explanation: "Sente-se compreendido, validado e ouvido em suas angústias?" },
      { key: "Responsabilidade Adulta", value: "Necessidade Adulta: Responsabilidade (Tomar decisões maduras e arcar com consequências)", explanation: "Sabe tomar decisões pragmáticas na vida e arcar com as consequências delas?" },
      { key: "Liberdade", value: "Necessidade Adulta: Liberdade (Agir livre de coações, chantagens ou subjugações)", explanation: "Sente-se livre para guiar sua vida sem coerção, chantagens ou culpas induzidas?" },
      { key: "Aprovação", value: "Necessidade Adulta: Aprovação (Sentir-se aprovado pelo que realiza profissionalmente)", explanation: "Sente-se aprovado, validado e reconhecido pelo trabalho ou conduta?" },
      { key: "Otimismo", value: "Necessidade Adulta: Otimismo (Manter visão esperançosa, realista e promissora do amanhã)", explanation: "Mantém uma visão de esperança, baseada em raciocínio realisticamente otimista?" },
      { key: "Reflexão", value: "Necessidade Adulta: Reflexão (Sentir-se instruído, inteligente e capaz de discernimento)", explanation: "Sente-se inteligente, instruído e dotado de capacidade para refletir e discernir?" },
      { key: "Controle", value: "Necessidade Adulta: Controle (Sentir capacidade de intervir e influenciar nos fatos)", explanation: "Sente que possui agência e capacidade de intervir nas coisas e na própria rotina?" },
      { key: "Diversão Adulta", value: "Necessidade Adulta: Diversão (Sente-se alegre, recreativo e com tempo de lazer)", explanation: "Sente-se alegre, dotado de momentos recreativos e lazer autêntico?" },
      { key: "Coragem", value: "Necessidade Adulta: Coragem (Sentir-se apto a enfrentar desafios e temores)", explanation: "Sente-se corajoso, proativo e enfrentador de desafios existenciais?" },
      { key: "Intimidade Adulta", value: "Necessidade Adulta: Intimidade (Conseguir viver relacionamentos profundos)", explanation: "Consegue viver relacionamentos profundos, sem medo de abandono ou fusão?" },
      { key: "Correspondência", value: "Necessidade Adulta: Correspondência (Corresponder a expectativas sociais de forma sadia)", explanation: "Sente que corresponde às expectativas de seus papéis sociais de forma equilibrada?" },
      { key: "Retorno (Feedback)", value: "Necessidade Adulta: Retorno (Receber feedbacks claros sobre suas ações na vida)", explanation: "Recebe um retorno franco das pessoas significativas sobre suas ações?" },
      { key: "Dignidade", value: "Necessidade Adulta: Dignidade (Sentir-se merecedor de afeto, respeito e coisas boas)", explanation: "Sente-se merecedor de coisas boas, afeto genuíno e respeito existencial?" }
    ]
  },
  esquemas_adaptativos: {
    title: "Esquemas Adaptativos (YPQ)",
    items: [
      { key: "Apego Seguro", value: "Apego Seguro (Convicção de ser merecedor de afeto e de que os outros são confiáveis)", explanation: "Desenvolve relações estáveis e seguras, baseadas em confiança mútua e sentimentos de pertencimento e proteção." },
      { key: "Autonomia Saudável", value: "Autonomia Saudável (Senso interno de agência e auto-direcionamento)", explanation: "Capacidade de definir metas, tomar decisões e agir de forma independente, com base em seus próprios valores." },
      { key: "Competência", value: "Competência (Sensação de eficácia e aptidão para lidar com responsabilidades)", explanation: "Crença na própria capacidade e recursos práticos para solucionar problemas, realizar tarefas e vencer desafios." },
      { key: "Valor Pessoal", value: "Valor Pessoal (Consciência do próprio valor incondicional como ser humano)", explanation: "Reconhecimento do próprio valor intrínseco, que não é diminuído por falhas, erros ou julgamentos alheios." },
      { key: "Merecimento Saudável", value: "Merecimento Saudável (Convicção do direito ao bem-estar e afeto)", explanation: "Sentimento saudável de que tem direito a ser feliz, amado, respeitado e a buscar conquistas sadias." },
      { key: "Autocontrole Saudável", value: "Autocontrole Saudável (Diferir gratificações e gerenciar impulsos)", explanation: "Capacidade de regular impulsos imediatos em prol de objetivos importantes de longo prazo, com autodisciplina equilibrada." },
      { key: "Confiança Interpessoal", value: "Confiança Interpessoal (Se abrir e confiar na lealdade alheia)", explanation: "Facilidade em construir vínculos profundos e saudáveis baseados em reciprocidade e boa-fé dos outros." },
      { key: "Autoaceitação", value: "Autoaceitação (Integrar qualidades e limitações de forma acolhedora)", explanation: "Suavização do diálogo interno crítico; aceita a si mesmo com bondade sem se punir por limitações comuns." },
      { key: "Expressão Emocional Livre", value: "Expressão Emocional Livre (Expressar sentimentos espontaneamente)", explanation: "Liberdade para expressar emoções, vontades e desejos de forma autêntica e saudável nas relações." },
      { key: "Otimismo Realista", value: "Otimismo Realista (Visão esperançosa do futuro baseada em fatos)", explanation: "Interpretação construtiva do cotidiano, focando em oportunidades sem negar riscos reais." },
      { key: "Limites Saudáveis", value: "Limites Saudáveis (Respeito recíproco a direitos e deveres)", explanation: "Habilidade de se posicionar assertivamente, colocando limites claros e respeitando o espaço e individualidade alheios." },
      { key: "Identidade Coesa", value: "Identidade Coesa (Autoconceito claro e estável integrado)", explanation: "Senso de individualidade firme e consistente, livre de dependências emocionais fusivas ou emaranhadas." },
      { key: "Pertencimento", value: "Pertencimento (Sentir-se acolhido e integrado socialmente)", explanation: "Sentimento de fazer parte ativa e valorizada de grupos, comunidades e redes de apoio." },
      { key: "Resiliência", value: "Resiliência (Habilidade de se recuperar ativamente de choques)", explanation: "Capacidade de lidar e se restabelecer de crises, perdas ou situações traumáticas, encontrando saídas sadias." },
      { key: "Autocompaixão", value: "Autocompaixão (Atitude de carinho e suporte a si mesmo diante da dor)", explanation: "Tratar a si mesmo com empatia e autocuidado ao vivenciar falhas, erros ou sofrimentos inevitáveis." }
    ]
  },
  crencas_centrais_funcionais: {
    title: "Crenças Centrais (Funcionais / Adaptativas)",
    items: [
      { key: "Sou valioso", value: "Sou valioso (Eu tenho um valor intrínseco como pessoa, independente de performance)", explanation: "Eu tenho um valor intrínseco como pessoa, independentemente do que eu faça ou do que os outros pensem." },
      { key: "Sou capaz", value: "Sou capaz (Eu sou capaz de lidar com as situações práticas e de solucionar problemas)", explanation: "Eu sou capaz de lidar com os desafios cotidianos de forma resolutiva." },
      { key: "Posso aprender", value: "Posso aprender (O erro não define minha inteligência; eu posso aprender e evoluir)", explanation: "O erro não define meu intelecto; posso crescer e desenvolver novas competências." },
      { key: "Sou digno de amor", value: "Sou digno de amor (Eu sou digno de receber afeto, cuidado e respeito nas relações)", explanation: "Eu sou digno de amor, sem precisar buscar aprovação incessante de performance." },
      { key: "Posso errar sem perder valor", value: "Posso errar sem perder valor (Minhas falhas pontuais não diminuem meu valor existencial)", explanation: "Cometer falhas faz parte do ser humano; posso errar e continuar sendo valioso." },
      { key: "Sou resiliente", value: "Sou resiliente (Eu tenho forças internas para superar adversidades e me reerguer)", explanation: "Eu tenho a capacidade de lidar com estresses e me restabelecer." }
    ]
  },
  crencas_intermediarias_adaptativas: {
    title: "Crenças Intermediárias Adaptativas",
    items: [
      { key: "Posso cometer erros", value: "Posso cometer erros (Se eu cometer um erro, posso corrigi-lo e aprender com ele)", explanation: "Regra flexível que ameniza a autocrítica punitiva severa." },
      { key: "Nem todos precisam gostar de mim", value: "Nem todos precisam gostar de mim (Não é necessário que todos me aprovem; o meu valor não depende disso)", explanation: "Desconstrução da busca de aprovação constante." },
      { key: "Emoções são humanas", value: "Emoções são humanas (Expressar sentimentos e fraquezas é natural e saudável, não sinal de defeito)", explanation: "Permissão para sentir e expressar vulnerabilidade de forma segura." },
      { key: "Valor independente de resultados", value: "Valor independente de resultados (Meu valor existencial é independente da minha produtividade)", explanation: "Desvincula a autoestima incondicional da performance laboral ou financeira." }
    ]
  },
  pensamentos_automaticos_negativos: {
    title: "Pensamentos Automáticos Negativos",
    items: [
      { key: "Não vou conseguir", value: "Não vou conseguir (Certeza antecipada de fracasso frente a um desafio)", explanation: "Antecipação de derrota que paralisa as tentativas do paciente." },
      { key: "Vai dar errado", value: "Vai dar errado (Catastrofização automática sobre desfechos futuros)", explanation: "Vício de processar o amanhã apenas por cenários trágicos." },
      { key: "Ninguém se importa comigo", value: "Ninguém se importa comigo (Filtro mental de rejeição e desamor)", explanation: "Foco nos sinais de desatenção, desconsiderando carinhos e contatos sadios." },
      { key: "Eu estraguei tudo", value: "Eu estraguei tudo (Personalização e rotulação global diante de um erro)", explanation: "Culpa crônica exacerbada que impossibilita a reavaliação objetiva." }
    ]
  },
  pensamentos_automaticos_positivos: {
    title: "Pensamentos Automáticos Positivos",
    items: [
      { key: "Posso lidar com isso", value: "Posso lidar com isso (Foco na própria capacidade de gerenciamento da situação)", explanation: "Pensamento adaptativo de autoeficácia perante estressores." },
      { key: "Já enfrentei dores antes", value: "Já enfrentei dores antes (Resgate de recursos de enfrentamento do passado)", explanation: "Reativação de memórias de superação e resiliência ativa." },
      { key: "Posso aprender algo aqui", value: "Posso aprender algo aqui (Reavaliação de flexibilidade e aprendizado)", explanation: "Lente focada no aprendizado socrático existencial." }
    ]
  },
  enfrentamento_funcional: {
    title: "Estratégias de Enfrentamento (Coping) Funcionais",
    items: [
      { key: "Resolução de problemas", value: "Resolução de problemas (Definição clara do estressor e planejamento focado)", explanation: "Ação estruturada para resolver adversidades factíveis." },
      { key: "Assertividade", value: "Assertividade (Expressão de opiniões e limites de forma firme e respeitosa)", explanation: "Habilidade de dizer não e expor as próprias necessidades sadias." },
      { key: "Aceitação", value: "Aceitação (Postura de aceitar a realidade como ela se apresenta no agora)", explanation: "Redução do sofrimento secundário de lutar contra o que não se pode mudar." },
      { key: "Exposição gradual", value: "Exposição gradual (Enfrentar os medos de forma programada para promover habituação)", explanation: "Combate ativo a esquivas e fobias respondentes." }
    ]
  },
  modos_esquematicos: {
    title: "Modos Esquemáticos (Schema Modes)",
    items: [
      { key: "Criança Vulnerável", value: "Criança Vulnerável (Vivência visceral da dor do abandono e inadequação)", explanation: "Sente-se desamparada, inadequada, pequena e assustada emocionalmente." },
      { key: "Pai Punitivo", value: "Pai Punitivo (Crítica impiedosa e autossabotagem interna)", explanation: "Voz interna severa que culpa e pune a criança vulnerável pelos erros." },
      { key: "Protetor Distante", value: "Protetor Distante (Desconexão emocional e anestesia preventiva)", explanation: "Usa escapes (redes, jogo, comida, ócio) para se isolar e não sentir a dor do esquema." },
      { key: "Adulto Saudável", value: "Adulto Saudável (Modo executivo focado em valores e reparentalização)", explanation: "Protege a criança vulnerável, desativa o pai punitivo e toma decisões maduras." }
    ]
  },
  necessidades_emocionais_frustradas: {
    title: "Necessidades Emocionais Frustradas",
    items: [
      { key: "Validação Emocional", value: "Necessidades Frustradas: Validação Emocional (Invalidação dos sentimentos na infância)", explanation: "Pais desqualificavam as dores infantis, ensinando a criança a suprimir afetos." },
      { key: "Segurança / Apego", value: "Necessidades Frustradas: Segurança / Apego (Falta de suporte emocional consistente)", explanation: "Vivência familiar instável ou caótica que impediu a vinculação segura." }
    ]
  },
  necessidades_emocionais_atendidas: {
    title: "Necessidades Emocionais Atendidas",
    items: [
      { key: "Pertencimento", value: "Necessidades Atendidas: Pertencimento (Sentimento de acolhimento em comunidades)", explanation: "Sensação estável de fazer parte ativa e valorizada de grupos significativos." },
      { key: "Conexão", value: "Necessidades Atendidas: Conexão (Intimidade emocional profunda recíproca)", explanation: "Partilha de afeições e intimidades sadias com parceiros." }
    ]
  },
  vieses_cognitivos: {
    title: "Vieses Cognitivos",
    items: [
      { key: "Viés de Confirmação", value: "Viés: Viés de Confirmação (Buscar fatos que apenas comprovem o esquema disfuncional)", explanation: "Filtro atencional que ignora feedbacks positivos e supervaloriza rejeições." },
      { key: "Viés de Negatividade", value: "Viés: Viés de Negatividade (Foco sistemático nos perigos e imperfeições)", explanation: "O cérebro atenta prioritariamente aos riscos e desastres, omitindo o bem-estar." }
    ]
  },
  padroes_comportamentais_disfuncionais: {
    title: "Padrões Comportamentais Disfuncionais",
    items: [
      { key: "Evitação e Fuga", value: "Padrão Disfuncional: Evitação Experiencial e Fuga sistemática de desafios.", explanation: "Esquiva de conversas sérias, procrastinação de deveres e isolamento defensivo." },
      { key: "Agradabilidade Excessiva", value: "Padrão Disfuncional: Submissão e autoanulação sistemática pelos outros.", explanation: "Priorizar todas as vontades alheias para evitar abandonos reais." }
    ]
  },
  padroes_comportamentais_funcionais: {
    title: "Padrões Comportamentais Funcionais",
    items: [
      { key: "Assertividade", value: "Padrão Funcional: Comunicação assertiva de limites e necessidades sadias.", explanation: "Colocação clara e respeitosa de limites interpessoais sadios." },
      { key: "Autocuidado", value: "Padrão Funcional: Engajamento em rotinas promissoras de saúde e sono.", explanation: "Equilíbrio diário ativo entre deveres, lazer e cuidados com o corpo." }
    ]
  },
  sentimentos_funcionais: {
    title: "Emoções Nucleares Funcionais",
    items: [
      { key: "Alegria / Contentamento", value: "Sentimento Funcional: Alegria (Sensação de leveza e contentamento)", explanation: "Contato espontâneo com riso e descontração." },
      { key: "Gratidão", value: "Sentimento Funcional: Gratidão (Reconhecimento sincero de aspectos positivos da vida)", explanation: "Apreciação por conquistas, gestos alheios e momentos sadios." }
    ]
  },
  fatores_protetivos: {
    title: "Fatores Protetivos",
    items: [
      { key: "Autoeficácia", value: "Fator Protetivo: Autoeficácia (Crença na própria habilidade de atingir metas)", explanation: "Confiança na própria capacidade executiva." },
      { key: "Rede de Apoio", value: "Fator Protetivo: Rede de Apoio (Círculos de amigos e suporte acessíveis)", explanation: "Acolhimento social em momentos de forte vulnerabilidade." }
    ]
  },
  parametros_avancados: {
    title: "Parâmetros Clínicos Avançados",
    items: [
      { key: "Valores Pessoais", value: "Parâmetro Avançado: Valores Pessoais (Princípios existenciais fundamentais)", explanation: "Diretrizes que norteiam o que de fato traz sentido e propósito para a vida do paciente." },
      { key: "Nível de Insight", value: "Parâmetro Avançado: Nível de Insight (Consciência da disfuncionalidade dos padrões)", explanation: "Capacidade reflexiva de compreender o caráter distorcido e esquemático de seus pensamentos." }
    ]
  }
};

export interface MchfNeedModel {
  needName: string;
  estiloParental: string;
  necessidade: string;
  historico: string;
  edi: string;
  crencasCentrais: string;
  crencasIntermediarias: string;
  comportamento: string;
  distorcoes: string;
  sentimentos: string;
  funcoesMantenedoras: string;
  hipotesesDiagnosticas: string;
}

export const MCHF_NEEDS_DB: MchfNeedModel[] = [
  {
    needName: "1. Vínculo Seguro, Aceitação e Cuidado",
    estiloParental: "Parentagem Fria, Rejeitadora, Negligente, Instável ou Abusiva.",
    necessidade: "Vínculo Seguro, Estabilidade, Cuidado, Aceitação e Empatia.",
    historico: "Pais emocionalmente inacessíveis; agressões verbais/físicas; abandono real ou ameaças de separação; invalidação de necessidades afetivas infantis primárias.",
    edi: "Privação Emocional, Abandono/Instabilidade, Desconfiança/Abuso, Defectividade/Vergonha, Isolamento Social.",
    crencasCentrais: "\"Eu sou indigno de amor\", \"Todos vão me deixar\", \"Vão abusar de mim\", \"Sou falho/defeituoso\".",
    crencasIntermediarias: "\"Se eu confiar, serei ferido\", \"Se eu demonstrar vulnerabilidade, vão me humilhar\", \"Devo agradar sempre para não ser rejeitado\".",
    comportamento: "Esquiva de relacionamentos íntimos; submissão excessiva; hipervigilância a sinais de rejeição; agressividade defensiva precoce.",
    distorcoes: "Leitura de Mente, Catastrofização, Filtro Mental, Pensamento Tudo-ou-Nada.",
    sentimentos: "Solidão intensa, pânico de abandono, vergonha crônica, raiva contida, ciúmes.",
    funcoesMantenedoras: "Reforçamento negativo pela evitação da intimidade (evita a dor temporária, mas impede a correção do esquema); reforço social por complacência excessiva.",
    hipotesesDiagnosticas: "Transtorno de Personalidade Borderline (TPB), Transtorno de Personalidade Esquiva, Depressão Maior, Transtorno de Ansiedade Social."
  },
  {
    needName: "2. Autonomia, Competência e Identidade",
    estiloParental: "Superprotetor, Controlador, Intrusivo, Infantilizador ou Altamente Ansioso.",
    necessidade: "Autonomia, Competência, Senso de Identidade e Autodirecionamento.",
    historico: "Superproteção debilitante; os pais faziam todas as escolhas pela criança; alertas catastróficos contínuos sobre o mundo exterior; proibição de tomar iniciativas.",
    edi: "Dependência/Incompetência, Vulnerabilidade a Danos ou Doenças, Emaranhamento/Self Subdesenvolvido, Fracasso.",
    crencasCentrais: "\"Eu sou fraco e indefeso\", \"Sou incompetente\", \"O mundo exterior é perigoso e catastrófico\".",
    crencasIntermediarias: "\"Se eu agir sem aprovação, falharei terrivelmente\", \"Se eu tomar decisões só, causarei um desastre\", \"Devo delegar responsabilidades aos outros para estar seguro\".",
    comportamento: "Consulta compulsiva a terceiros para qualquer decisão; procrastinação por medo de errar; evitação de cargos/responsabilidades; dependência financeira ou operacional de pais/parceiros.",
    distorcoes: "Catastrofização, Pensamento Tudo-ou-Nada, Desqualificação do Positivo, Supergeneralização.",
    sentimentos: "Ansiedade antecipatória constante, pânico físico, sensação de fragilidade, desamparo.",
    funcoesMantenedoras: "Reforçamento negativo por delegação (evita o estresse imediato da decisão, mas impede a aquisição de autoconfiança); reforçamento negativo por evitação de tarefas.",
    hipotesesDiagnosticas: "Transtorno de Ansiedade Generalizada (TAG), Transtorno de Pânico, Transtorno de Personalidade Dependente, Agorafobia."
  },
  {
    needName: "3. Limites Realistas e Autocontrole",
    estiloParental: "Permissivo, Indulgente, Sem Limites Coerentes, Superindulgente ou Sem Consequências.",
    necessidade: "Limites Realistas, Autocontrole, Autodisciplina e Respeito à Reciprocidade.",
    historico: "Satisfação imediata de todos os caprichos infantis; ausência de cobranças por tarefas domésticas ou cooperação familiar; modelagem de superioridade e impunidade.",
    edi: "Merecimento/Grandiosidade, Autocontrole/Autodisciplina Insuficientes.",
    crencasCentrais: "\"Eu sou especial/superior\", \"As regras comuns não se aplicam a mim\", \"Não sou obrigado a tolerar tédio ou desconforto\".",
    crencasIntermediarias: "\"Se eu não obtiver o que desejo na hora, é intolerável\", \"Se for difícil ou chato, devo abandonar imediatamente\", \"Os outros devem se submeter aos meus desejos\".",
    comportamento: "Abandono de cursos, empregos e tratamentos ao menor sinal de frustração; explosões de ira quando contrariado; manipulação relacional; procrastinação severa.",
    distorcoes: "Raciocínio Emocional, Ditadura dos Deverias (em relação aos outros), Personalização.",
    sentimentos: "Tédio crônico, irritabilidade intensa, raiva explosiva, insatisfação existencial.",
    funcoesMantenedoras: "Reforçamento negativo imediato ao desistir de tarefas aversivas ou aborrecidas (cessação da frustração); reforço social pelas demandas agressivas atendidas.",
    hipotesesDiagnosticas: "Transtorno de Personalidade Narcisista, TDAH em adultos, Transtornos de Controle dos Impulsos, Transtorno de Personalidade Borderline (traço impulsivo)."
  },
  {
    needName: "4. Liberdade de Expressão de Emoções e Necessidades",
    estiloParental: "Dominador, Autoritário, Controlador, com Amor Condicional ou Focado em Aparências.",
    necessidade: "Liberdade para Expressar Emoções, Desejos e Necessidades Saudáveis.",
    historico: "Punições ou rejeição emocional fria quando a criança discordava ou chorava; cobrança obsessiva de metas sociais ou comportamento impecável para ser valorizada.",
    edi: "Subjugação, Auto-sacrifício, Busca de Aprovação/Reconhecimento.",
    crencasCentrais: "\"Minhas vontades não contam\", \"Só sou aceito se eu agradar\", \"Sou egoísta se priorizar minhas necessidades\".",
    crencasIntermediarias: "\"Se eu discordar, serei punido ou excluído\", \"Devo carregar os problemas dos outros para ter valor\", \"O conflito interpessoal deve ser evitado a qualquer custo\".",
    comportamento: "Dificuldade grave em dizer não e estabelecer limites; acúmulo de tarefas alheias; comportamento passivo-agressivo; busca de status ou validação cênica constante.",
    distorcoes: "Ditadura dos Deverias, Leitura de Mente, Filtro Mental, Personalização.",
    sentimentos: "Ressentimento silencioso, cansaço profundo (Burnout), culpa patológica, ansiedade de avaliação.",
    funcoesMantenedoras: "Reforçamento negativo por evitação de confrontos imediatos; reforço positivo social por ser considerado prestativo, reforçando a anulação do self.",
    hipotesesDiagnosticas: "Transtorno Depressivo Maior, Distimia, Burnout Parental ou Profissional, Transtornos Psicossomáticos/Dor Crônica."
  },
  {
    needName: "5. Espontaneidade, Lazer e Recreação",
    estiloParental: "Rígido, Exigente, Perfeccionista, Punitivo, Preocupado ou Focado no Dever.",
    necessidade: "Espontaneidade, Brincadeira, Lazer, Recreação e Expressão Emocional Leve.",
    historico: "Criação sob regras estritas; lazer desencorajado ou punido como 'preguiça'; hipervigilância sobre possíveis erros morais ou falhas intelectuais.",
    edi: "Negatividade/Pessimismo, Inibição Emocional, Padrões Inflexíveis, Punitividade.",
    crencasCentrais: "\"Não posso falhar\", \"A vida é um ambiente perigoso de obrigações\", \"Se eu relaxar, algo terrível acontecerá\".",
    crencasIntermediarias: "\"Devo fazer tudo perfeitamente para não ser culpado\", \"O dever sempre antecede o prazer; divertir-se é perda de tempo\", \"Demonstrar sentimentos quentes é vulnerabilidade perigosa\".",
    comportamento: "Workaholism crônico; críticas implacáveis a si e aos outros; evitação ativa de momentos recreativos; inibição na expressão física de afeto.",
    distorcoes: "Ditadura dos Deverias, Catastrofização, Pensamento Tudo-ou-Nada, Filtro Mental.",
    sentimentos: "Estresse e tensão crônicos, culpa intensa por descansar, insatisfação e melancolia.",
    funcoesMantenedoras: "Reforçamento negativo por evitação de culpa (manter-se ocupado impede o surgimento da culpa de ociosidade, mas perpetua a exaustão); reforço por aprovação de produtividade.",
    hipotesesDiagnosticas: "Transtorno Obsessivo-Compulsivo (TOC), Transtorno de Personalidade Obsessivo-Compulsiva (TPOC), Transtorno Depressivo Persistente, Transtorno de Ansiedade Generalizada (TAG)."
  }
];

export interface MchfSchemaModel {
  schemaName: string;
  necessidadesVioladas: string;
  estiloParental: string;
  crencasCentrais: string;
  crencasIntermediarias: string;
  comportamento: string;
  distorcoes: string;
  sentimentos: string;
  hipotesesDiagnosticas: string;
}

export const MCHF_SCHEMAS_DB: MchfSchemaModel[] = [
  {
    schemaName: "Privação Emocional",
    necessidadesVioladas: "Vínculo Seguro, Cuidado, Empatia, Atenção e Proteção.",
    estiloParental: "Pais frios, indisponíveis, negligentes, fisicamente ausentes ou exaustos.",
    crencasCentrais: "\"Ninguém se importa de verdade comigo\", \"Minha dor é invisível para os outros\", \"Estou destinado ao vazio afetivo\".",
    crencasIntermediarias: "\"Se eu pedir afeto, serei ignorado\", \"Se eu demonstrar carência, serei considerado fraco\".",
    comportamento: "Isolamento preventivo; não verbalizar necessidades de carinho; escolher parceiros frios (resignação); afastar-se quando o outro tenta se aproximar (evitação).",
    distorcoes: "Leitura de Mente, Filtro Mental, Desqualificação do Positivo.",
    sentimentos: "Solidão devastadora, vazio existencial, tristeza profunda, melancolia.",
    hipotesesDiagnosticas: "Transtorno Depressivo Maior, Distimia, Transtorno de Personalidade Esquiva."
  },
  {
    schemaName: "Dependência / Incompetência",
    necessidadesVioladas: "Autonomia, Competência e Senso de Identidade.",
    estiloParental: "Pais superprotetores, ansiosos ou controladores, que tomavam todas as decisões pela criança.",
    crencasCentrais: "\"Eu sou fraco e incapaz\", \"Eu não sei decidir sozinho\", \"O mundo prático é perigoso demais para mim\".",
    crencasIntermediarias: "\"Se eu agir sem aprovação ou conselho, causarei um desastre\", \"Devo delegar minhas responsabilidades para estar seguro\".",
    comportamento: "Solicitar opiniões de terceiros compulsivamente; recusa a assumir tarefas adultas (declaração de impostos, compras complexas); evitação de desafios profissionais.",
    distorcoes: "Catastrofização, Desqualificação do Positivo, Pensamento Tudo-ou-Nada.",
    sentimentos: "Ansiedade antecipatória difusa, desamparo, insegurança física, pânico.",
    hipotesesDiagnosticas: "Transtorno de Personalidade Dependente, TAG, Transtorno de Pânico."
  },
  {
    schemaName: "Merecimento / Grandiosidade",
    necessidadesVioladas: "Limites Realistas, Autocontrole e Cooperação Social.",
    estiloParental: "Pais permissivos, indulgentes, sem limites coerentes, que bajulavam a criança sem exigir reciprocidade.",
    crencasCentrais: "\"Eu sou superior aos outros\", \"As regras comuns não se aplicam a mim\", \"Mereço privilégios e atenção imediata\".",
    crencasIntermediarias: "\"Se eu não conseguir o que desejo na hora, é intolerável\", \"Os outros devem se adaptar às minhas necessidades\".",
    comportamento: "Desistência rápida ao menor sinal de tédio ou dificuldade; exigências egoístas; desrespeito a regras sociais/leis; agressividade com quem o contraria.",
    distorcoes: "Raciocínio Emocional, Ditadura dos Deverias (focada nos outros), Personalização.",
    sentimentos: "Irritabilidade crônica, tédio intenso, raiva explosiva, indignação arrogante.",
    hipotesesDiagnosticas: "Transtorno de Personalidade Narcisista, Transtornos de Controle de Impulsos, TDAH desregulado."
  },
  {
    schemaName: "Subjugação",
    necessidadesVioladas: "Liberdade de Expressão de Emoções e Necessidades Válidas.",
    estiloParental: "Pais dominadores, autoritários, punitivos ou com amor condicionado à obediência cega.",
    crencasCentrais: "\"Minhas opiniões não importam\", \"Se eu discordar, serei rejeitado ou punido\", \"Não tenho direito a ter desejos\".",
    crencasIntermediarias: "\"Devo agradar e acomodar todas as vontades alheias sem reclamar para manter a segurança e a aceitação\".",
    comportamento: "Dizer 'sim' para tudo; anular hobbys e vontades próprias; expressar raiva de forma passivo-agressiva (procrastinar tarefas pedidas, sarcasmo); submissão afetiva.",
    distorcoes: "Leitura de Mente, Ditadura dos Deverias, Catastrofização.",
    sentimentos: "Ressentimento silencioso, culpa devoradora, ansiedade de julgamento, esgotamento.",
    hipotesesDiagnosticas: "Depressão Maior, Distimia, Transtornos Psicossomáticos."
  },
  {
    schemaName: "Padrões Inflexíveis / Perfeccionismo",
    necessidadesVioladas: "Espontaneidade, Lazer, Recreação e Aceitação Incondicional.",
    estiloParental: "Pais hiperexigentes, frios, moralistas ou punitivos, focados obsessivamente em desempenho e dever.",
    crencasCentrais: "\"Eu só tenho valor se eu for perfeito\", \"Qualquer falha minha é imperdoável\", \"Devo estar sempre ocupado\".",
    crencasIntermediarias: "\"Se eu cometer o menor erro, provarei que sou um fracasso absoluto\", \"Não posso me divertir enquanto houver deveres\".",
    comportamento: "Workaholism; autocobrança implacável; criticar severamente parceiros ou subordinados; rigidez metódica; negligência do sono e da saúde.",
    distorcoes: "Pensamento Tudo-ou-Nada, Ditadura dos Deverias, Filtro Mental.",
    sentimentos: "Estresse e tensão crônicos, culpa intensa ao relaxar, insatisfação perpétua.",
    hipotesesDiagnosticas: "Transtorno de Personalidade Obsessivo-Compulsiva (TPOC), TOC, Burnout."
  }
];

export interface MchfDisorderModel {
  disorderName: string;
  contextualName: string;
  historicoContextual: string[];
  cognicoes: string;
  caracteristicasComportamentais: string;
  funcoesMantenedoras: string[];
  habilidadesPsicologicas: string[];
  novasFuncoes: string;
}

export const MCHF_DISORDERS_DB: MchfDisorderModel[] = [
  {
    disorderName: "Depressão Maior",
    contextualName: "Transtorno por Desamparo Generalizado",
    historicoContextual: [
      "Histórico de extinção e punição generalizadas.",
      "Histórico punitivo verbal modelando regras de desamor, desvalor e desamparo.",
      "Déficit na variabilidade para obtenção de reforçadores imediatos e posteriores."
    ],
    cognicoes: "Não há nada que se possa fazer para mudar as coisas. Não há saída. Sou um fracassado, solitário e inútil. A vida é um sofrimento. Tudo dará errado. Nasci para sofrer. Continuar vivendo é arrastar sofrimento.",
    caracteristicasComportamentais: "Humor deprimido, redução drástica do interesse e prazer nas atividades (anedonia), perda ou ganho de peso significativo, insônia ou hipersonia, fadiga ou perda de energia, sentimentos inapropriados de desvalia ou culpa, ideias recorrentes de morte ou suicídio.",
    funcoesMantenedoras: [
      "Reforçamento social direto e mediado (atenção por queixumes).",
      "Reforçamento negativo por evitação de atividades ou tarefas aversivas."
    ],
    habilidadesPsicologicas: [
      "Autoconhecimento",
      "Autorregulação Emocional",
      "Raciocínio Realisticamente Otimista",
      "Autoestima",
      "Resolutividade e Enfrentamento",
      "Autocontrole",
      "Sociabilidade",
      "Imunidade Social",
      "Sensibilidade Social",
      "Hedonismo Responsável"
    ],
    novasFuncoes: "Reestabelecimento de variabilidade comportamental; acesso a fontes de reforço positivo direto e não-mediado pela queixa; enfraquecimento de regras de desamparo."
  },
  {
    disorderName: "Transtorno Bipolar",
    contextualName: "Transtorno por Responsividade a Sinalizadores Armadilosos Alternado com Desamparo Generalizado",
    historicoContextual: [
      "Déficit na modelagem de variabilidade e estabelecimento de reforçadores não-armadilosos.",
      "Estado severo de privação biológica ou socioemocional.",
      "Déficit no controle por regras e consequências sociais ao envolver-se em armadilhas comportamentais.",
      "Esvanecimento das consequências aversivas pelo ambiente social.",
      "Desamparo ante a necessidade de resolução das consequências punitivas."
    ],
    cognicoes: "Fase maníaca: 'Posso tudo e quero agora o que sinto vontade.' | Fase depressiva: 'Sou um inconsequente, um fracassado irresponsável. Não há nada que se possa fazer para consertar as coisas.'",
    caracteristicasComportamentais: "Fase maníaca: Grandiosidade, redução da necessidade de sono, pressão para falar, fuga de ideias, distratibilidade severa, envolvimento compulsivo em atividades de alto risco e hedonismo nocivo. Fase depressiva: Humor deprimido, anedonia, perturbação de sono, sentimentos graves de culpa e desvalia.",
    funcoesMantenedoras: [
      "Reforçamento imediato das armadilhas (acesso rápido a estimulação sensorial/hedonista).",
      "Reforçamento social direto e mediado.",
      "Reforçamento negativo por evitação de atividades ou tarefas aversivas."
    ],
    habilidadesPsicologicas: [
      "Fase Maníaca: Autocontrol, Autorregulação Emocional, Sensibilidade Social.",
      "Fase Depressiva: Autoestima, Imunidade Social, Resolutividade e Enfrentamento.",
      "Ambas as Fases: Autoconhecimento, Raciocínio Realisticamente Otimista, Sociabilidade, Hedonismo Responsável."
    ],
    novasFuncoes: "Estabilização comportamental via regras protetivas; identificação precoce de sinalizadores de fases; desenvolvimento de reforçadores saudáveis livres de armadilhas de endividamento ou exposição moral."
  },
  {
    disorderName: "Compulsões / Controle do Impulso",
    contextualName: "Transtorno por Obtenção de Reforçadores Armadilosos",
    historicoContextual: [
      "Déficits no controle por regras e consequenciação aversiva para gerar variação autocontrolada em função de reforçamento a longo prazo.",
      "Histórico de reforçamento contínuo, desenvolvendo baixa tolerância à frustração, que hipersensibiliza às operações estabelecedoras."
    ],
    cognicoes: "Detesto me frustrar. Preciso ter as coisas que eu quero imediatamente. Não é justo eu não poder ter essa fonte de prazer.",
    caracteristicasComportamentais: "Padrão incontrolável e impulsivo de acesso e envolvimento com fontes de prazer imediato (substâncias, comida, compras, jogo, sexo, etc.), levando a sérios prejuízos financeiros, físicos e sociais decorrentes dos excessos.",
    funcoesMantenedoras: [
      "Reforçamento positivo imediato das armadilhas.",
      "Reforçamento social direto e mediado.",
      "Reforçamento negativo por evitação de atividades ou tarefas aversivas (escape de frustrações)."
    ],
    habilidadesPsicologicas: [
      "Hedonismo Responsável",
      "Autocontrole",
      "Autorregulação Emocional"
    ],
    novasFuncoes: "Desenvolvimento de tolerância ao desconforto; substituição do hedonismo imediatista pelo hedonismo responsável de longo prazo; regulação por regras autoformuladas protetivas."
  },
  {
    disorderName: "Fobia Específica",
    contextualName: "Transtorno por Remoção de Estimulação Aversiva Exteroceptiva Específica",
    historicoContextual: [
      "Condicionamento respondente aversivo clássico.",
      "Modelação punitiva familiar.",
      "Modelagem de regras ameaçadoras.",
      "Reforçamento arbitrário de relações simbólicas aversivas."
    ],
    cognicoes: "Sou vulnerável. Sou frágil. Posso me machucar. Esse medo é excessivo e irracional.",
    caracteristicasComportamentais: "Medo acentuado, persistente, excessivo e irracional diante da presença ou antecipação de um objeto ou situação fóbica. A exposição provoca ansiedade imediata (podendo gerar ataque de pânico). Esquiva sistemática da situação fóbica.",
    funcoesMantenedoras: [
      "Reforçamento negativo imediato pela evitação ou afastamento do estímulo fóbico (alívio da ansiedade).",
      "Reforçamento social direto e mediado (cuidado da família).",
      "Reforçamento negativo por evitação de tarefas."
    ],
    habilidadesPsicologicas: [
      "Autorregulação Emocional",
      "Raciocínio Realisticamente Otimista",
      "Resolutividade e Enfrentamento"
    ],
    novasFuncoes: "Habituação e extinção do medo respondente via exposição gradual; enfraquecimento de regras de vulnerabilidade corporal; ampliação da coragem executiva."
  },
  {
    disorderName: "Ansiedade Social",
    contextualName: "Transtorno por Remoção de Estimulação Aversiva Social",
    historicoContextual: [
      "Padrão filogenético de inibição comportamental.",
      "Privação de oportunidades para experiências socializadoras de modelagem de habilidades sociais.",
      "Pais autoritários e subjugadores.",
      "Histórico de bullying, chacotas e depreciação em ambientes variados.",
      "Padrões exigentes de desempenho mantidos coercitivamente na infância."
    ],
    cognicoes: "Sou feio e desajeitado. As pessoas vão me criticar e rejeitar se eu fizer ou falar besteira.",
    caracteristicasComportamentais: "Medo excessivo e paralisante de ser avaliado de modo humilhante, embaraçoso ou inadequado em situações sociais ou de desempenho. Evitação sistemática de reuniões, apresentações em público e conversas com estranhos.",
    funcoesMantenedoras: [
      "Reforçamento negativo por evitar punição, crítica ou rejeição social real/imaginária.",
      "Reforçamento social direto e mediado (apoio de mediadores).",
      "Reforçamento negativo por evitação de atividades e tarefas."
    ],
    habilidadesPsicologicas: [
      "Autoestima",
      "Autorregulação Emocional",
      "Raciocínio Realisticamente Otimista",
      "Imunidade Social",
      "Sociabilidade",
      "Resolutividade e Enfrentamento"
    ],
    novasFuncoes: "Desenvolvimento de habilidades sociais assertivas; teste de realidade de regras catastróficas de rejeição; exposição social voluntária controlada; desenvolvimento de imunidade social."
  },
  {
    disorderName: "Transtorno do Pânico",
    contextualName: "Transtorno por Remoção de Estimulação Aversiva Interoceptiva",
    historicoContextual: [
      "Superproteção familiar acompanhada de regras ameaçadoras quanto à autonomia.",
      "Desenvolvimento de regras rígidas de vulnerabilidade orgânica.",
      "Excesso de estimulação aversiva, culminando em crise aguda de estresse.",
      "Estabelecimento de condicionamento interoceptivo aversivo (medo do medo) e automonitoria corporal obsessiva."
    ],
    cognicoes: "Reações do meu corpo podem ser algum mal e me levarem à morte.",
    caracteristicasComportamentais: "Ataques de pânico recorrentes e inesperados, caracterizados por palpitações, falta de ar, tremores, tontura, sensações de asfixia, desrealização, medo de enlouquecer, perder o controle ou morrer. Preocupação persistente com novos ataques (ansiedade de antecipação).",
    funcoesMantenedoras: [
      "Reforçamento negativo por evitar desconforto privado ou sensações físicas incômodas.",
      "Reforçamento social direto e mediado.",
      "Reforçamento negativo por evitação de atividades (limitar saídas)."
    ],
    habilidadesPsicologicas: [
      "Autoestima",
      "Autorregulação Emocional",
      "Resolutividade e Enfrentamento"
    ],
    novasFuncoes: "Dessensibilização interoceptiva (exposição a sensações corporais); enfraquecimento das regras catastróficas sobre sintomas cardíacos/respiratórios; restauração da autonomia."
  },
  {
    disorderName: "Agorafobia",
    contextualName: "Transtorno por Desamparo sob Circunstâncias Inescapáveis",
    historicoContextual: [
      "Condicionamento respondente aversivo em contextos de inescapabilidade.",
      "Desenvolvimento de regras e suposições de vulnerabilidade física extrema.",
      "Histórico familiar hipervigilante."
    ],
    cognicoes: "Preciso estar confiante de que, se algo ruim acontecer, eu receberei ajuda, serei socorrido ou conseguirei chegar a um lugar seguro.",
    caracteristicasComportamentais: "Medo ou ansiedade acentuados sobre duas ou mais situações (transporte público, espaços abertos, locais fechados, filas ou multidões, sair de casa sozinho) baseados na crença de que a fuga seria difícil ou o socorro inexistente se surgirem sintomas de pânico. Evitação rigorosa destas situações.",
    funcoesMantenedoras: [
      "Reforçamento negativo por evitar desconforto interoceptivo em público.",
      "Reforçamento social direto e mediado (necessidade crônica de acompanhante).",
      "Reforçamento negativo por evitação de tarefas."
    ],
    habilidadesPsicologicas: [
      "Autoestima",
      "Autorregulação Emocional",
      "Resolutividade e Enfrentamento"
    ],
    novasFuncoes: "Exposição in vivo sistemática e gradual aos ambientes agorafóbicos; independência de acompanhantes; fortalecimento do self operacional autónomo."
  },
  {
    disorderName: "Transtorno de Estresse Pós-Traumático (TEPT)",
    contextualName: "Transtorno por Desamparo sob Estimulação Aversiva Generalizada após Pareamento Agudo",
    historicoContextual: [
      "Condicionamento respondente aversivo por inescapabilidade de estimulação aversiva intensa, violenta e súbita (assaltos, acidentes, abusos)."
    ],
    cognicoes: "A qualquer momento algo muito ruim pode acontecer e não terei a mesma sorte.",
    caracteristicasComportamentais: "Reexperimentação intrusiva do trauma (flashbacks, pesadelos); sofrimento psicológico intenso ao se expor a gatilhos; evitação sistemática de estímulos associados ao evento; distanciamento emocional; hipervigilância, respostas de sobressalto exageradas e insônia.",
    funcoesMantenedoras: [
      "Reforçamento negativo por evitar recordações, conversas ou locais que eliciem emoções aflitivas associadas ao trauma.",
      "Reforçamento social direto e mediado.",
      "Reforçamento negativo por evitação de atividades."
    ],
    habilidadesPsicologicas: [
      "Autorregulação Emocional",
      "Raciocínio Realisticamente Otimista",
      "Resolutividade e Enfrentamento"
    ],
    novasFuncoes: "Processamento emocional e ressignificação do trauma via exposição imaginária e reestruturação cognitiva; atenuação do estado neurofisiológico de alerta contínuo."
  },
  {
    disorderName: "Transtorno de Ansiedade Generalizada (TAG)",
    contextualName: "Transtorno por Desamparo e Remoção de Estimulação Aversiva Generalizada Estabelecida por Regras",
    historicoContextual: [
      "Histórico de superproteção parental extrema.",
      "Déficit na oportunização de experiências autônomas de enfrentamento prático.",
      "Modelagem parental de regras catastróficas de perigo generalizado.",
      "Extinção do repertório de resolutividade, minando a autoestima e estabelecendo preocupação e catastrofização crônicas."
    ],
    cognicoes: "Há perigo em todo lugar e não saberei lidar com ele quando surgir.",
    caracteristicasComportamentais: "Preocupação excessiva e de difícil controle com múltiplos eventos ou atividades da vida cotidiana (família, finanças, saúde, trabalho), acompanhada de tensão motora (dores), inquietação, fadiga, dificuldade de concentração e hipervigilância.",
    funcoesMantenedoras: [
      "Reforçamento negativo pela evitação da aversividade corporal (a preocupação verbal atua como escape temporário da ativação física).",
      "Reforçamento negativo por contiguidade em relação às ameaças previstas (achar que a preocupação 'evitou' a tragédia).",
      "Reforçamento social direto e mediado.",
      "Reforçamento negativo por evitação de atividades."
    ],
    habilidadesPsicologicas: [
      "Autoconhecimento",
      "Raciocínio Realisticamente Otimista",
      "Autorregulação Emocional",
      "Resolutividade e Enfrentamento"
    ],
    novasFuncoes: "Interrupção do ciclo de preocupação improdutiva (worrying); treino em tolerância à incerteza; desenvolvimento de habilidades assertivas de resolução pragmática de problemas."
  },
  {
    disorderName: "Transtorno Obsessivo-Compulsivo (TOC)",
    contextualName: "Transtorno por Remoção Contígua de Estimulação Aversiva Estabelecida por Regras",
    historicoContextual: [
      "Modelagem de regras distorcidas, rígidas e ameaçadoras de responsabilidade inflada.",
      "Reforçamento por contiguidade temporal da resposta de alívio compulsiva."
    ],
    cognicoes: "Se eu não fizer isso, algo de ruim pode acontecer.",
    caracteristicasComportamentais: "Obsessões (pensamentos, imagens ou impulsos intrusivos e indesejados que geram ansiedade grave) seguidas de Compulsões (comportamentos ou atos mentais repetitivos executados em resposta a regras rígidas para aliviar a ansiedade ou prevenir desastres).",
    funcoesMantenedoras: [
      "Reforçamento negativo por supressão emocional, alívio contíguo da obsessão e evitação temporária da ameaça verbalizada.",
      "Reforçamento social direto e mediado.",
      "Reforçamento negativo por evitação de tarefas."
    ],
    habilidadesPsicologicas: [
      "Raciocínio Realisticamente Otimista",
      "Autorregulação Emocional",
      "Resolutividade e Enfrentamento"
    ],
    novasFuncoes: "Exposição com Prevenção de Respostas (EPR); enfraquecimento das fusões pensamento-ação e das regras de responsabilidade inflada; tolerância à ansiedade sem rituais."
  }
];

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
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const config = CLINICAL_SUGGESTIONS_DB[category] || { title: "Sugestões Clínicas", items: [] };

  const filteredItems = config.items.filter(
    item =>
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onSelectSuggestion(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef} id={`helper-root-${category}`}>
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

      {isOpen && (
        <div 
          className="absolute z-[999] mt-1.5 w-80 sm:w-96 bg-[#0c0d12] border border-gray-800 rounded-xl shadow-2xl p-3.5 space-y-3 font-sans animate-fadeIn left-0 sm:left-auto sm:right-0"
          id={`helper-panel-box-${category}`}
          style={{ minWidth: "320px" }}
        >
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

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1" id="suggestions-list-box">
            {filteredItems.length === 0 ? (
              <span className="text-[11px] text-gray-550 italic block text-center py-2">
                Nenhum termo clínico encontrado para "{searchTerm}".
              </span>
            ) : (
              filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.value)}
                  className="p-2 rounded-lg border border-gray-900/60 bg-gray-950/40 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all flex flex-col space-y-1 cursor-pointer group"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs text-gray-250 font-semibold group-hover:text-amber-400 font-sans">
                      {item.key}
                    </span>
                    <span className="text-[9px] font-mono text-amber-500/65 opacity-0 group-hover:opacity-100 transition-opacity">Selecionar &gt;</span>
                  </div>
                  <p className="text-[10px] text-gray-450 leading-relaxed font-normal p-1 bg-[#101116] border border-gray-900 rounded select-none">
                    {item.explanation}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="text-[9px] text-gray-550 font-mono text-center pt-1 border-t border-gray-900 flex justify-between px-1">
            <span>Lincoln Poubel</span>
            <span className="text-amber-500 font-bold">TERAPIA DE ESQUEMAS</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ClinicalSuggestionsApp({ onClose }: { onClose?: () => void }) {
  const [viewMode, setViewMode] = useState<"dictionary" | "needs" | "schemas" | "disorders">("mchf");
  
  // Dictionary category state
  const [selectedCategory, setSelectedCategory] = useState<SuggestionsCategoryType>("esquemas");
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Selected item states for detail flowchart views
  const [selectedNeedIdx, setSelectedNeedIdx] = useState<number>(0);
  const [selectedSchemaIdx, setSelectedSchemaIdx] = useState<number>(0);
  const [selectedDisorderIdx, setSelectedDisorderIdx] = useState<number>(0);

  const categoriesList: { id: SuggestionsCategoryType; name: string }[] = [
    { id: "esquemas", name: "EDIs (Esquemas de Young)" },
    { id: "esquemas_adaptativos", name: "Esquemas Adaptativos (YPQ)" },
    { id: "crencas_centrais", name: "Crenças Centrais (Disfuncionais)" },
    { id: "crencas_centrais_funcionais", name: "Crenças Centrais (Funcionais)" },
    { id: "crencas_intermediarias", name: "Crenças Intermediárias (Regras/Atitudes)" },
    { id: "crencas_intermediarias_adaptativas", name: "Crenças Intermediárias Adaptativas" },
    { id: "distorcoes", name: "Distorções Cognitivas (Beck)" },
    { id: "pensamentos_automaticos_negativos", name: "Pensamentos Automáticos (Negativos)" },
    { id: "pensamentos_automaticos_positivos", name: "Pensamentos Automáticos (Positivos)" },
    { id: "enfrentamento", name: "Estratégias de Enfrentamento (Disfuncionais)" },
    { id: "enfrentamento_funcional", name: "Estratégias de Enfrentamento (Funcionais)" },
    { id: "modos_esquematicos", name: "Modos Esquemáticos (Schema Modes)" },
    { id: "necessidades_emocionais_frustradas", name: "Necessidades Emocionais (Frustradas)" },
    { id: "necessidades_emocionais_atendidas", name: "Necessidades Emocionais (Atendidas)" },
    { id: "vieses_cognitivos", name: "Vieses Cognitivos" },
    { id: "padroes_comportamentais_disfuncionais", name: "Padrões Comportamentais Disfuncionais" },
    { id: "padroes_comportamentais_funcionais", name: "Padrões Comportamentais Funcionais" },
    { id: "sentimentos", name: "Emoções Nucleares (Disfuncionais)" },
    { id: "sentimentos_funcionais", name: "Emoções Nucleares (Funcionais)" },
    { id: "fatores_protetivos", name: "Fatores Protetivos" },
    { id: "parametros_avancados", name: "Parâmetros Clínicos Avançados" },
    { id: "estilos_parentais", name: "Estilos Parentais Formativos" },
    { id: "necessidades_infantil", name: "Necessidades Infantis" },
    { id: "necessidades_parental", name: "Necessidades Parentais" },
    { id: "necessidades_conjugal", name: "Necessidades Conjugais" },
    { id: "necessidades_adulto", name: "Necessidades Adultas" }
  ];

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const currentCategoryData = CLINICAL_SUGGESTIONS_DB[selectedCategory] || { title: "", items: [] };

  const filteredDictionaryItems = currentCategoryData.items.filter(
    item =>
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNeeds = MCHF_NEEDS_DB.filter(
    n =>
      n.needName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.estiloParental.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.edi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.crencasCentrais.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.hipotesesDiagnosticas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSchemas = MCHF_SCHEMAS_DB.filter(
    s =>
      s.schemaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.necessidadesVioladas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.crencasCentrais.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.hipotesesDiagnosticas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDisorders = MCHF_DISORDERS_DB.filter(
    d =>
      d.disorderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contextualName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cognicoes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-[#0c0d12] text-gray-250 p-5 space-y-4 font-sans select-none overflow-hidden" id="clinical-suggestions-app-root">
      {/* Header Info */}
      <div className="border-b border-gray-900 pb-3 flex justify-between items-start" id="clinical-app-header">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">Lincoln Poubel & Pedro Rodrigues</span>
          <h3 className="text-base font-black text-white mt-1 flex items-center gap-1.5 font-sans">
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
            PARÂMETROS CLÍNICOS E TAXONOMIA
          </h3>
          <p className="text-[11px] text-gray-500 font-sans mt-0.5">
            Dicionário de critérios, análise de necessidades e retroanálise de esquemas e transtornos.
          </p>
        </div>
      </div>

      {/* Main Tabs segmented controller */}
      <div className="flex bg-[#14151b] p-1 rounded-xl border border-gray-900 shrink-0 select-none">
        <button
          onClick={() => { setViewMode("mchf"); setSearchTerm(""); }}
          className={`flex-1 text-center py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${viewMode === "mchf" ? "bg-amber-500 text-gray-950 shadow-md font-bold" : "text-gray-400 hover:text-white bg-transparent"}`}
        >
          1. Análise: Necessidades
        </button>
        <button
          onClick={() => { setViewMode("schemas"); setSearchTerm(""); }}
          className={`flex-1 text-center py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${viewMode === "schemas" ? "bg-amber-500 text-gray-950 shadow-md font-bold" : "text-gray-400 hover:text-white bg-transparent"}`}
        >
          2. Retroanálise: Esquemas
        </button>
        <button
          onClick={() => { setViewMode("disorders"); setSearchTerm(""); }}
          className={`flex-1 text-center py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${viewMode === "disorders" ? "bg-amber-500 text-gray-950 shadow-md font-bold" : "text-gray-400 hover:text-white bg-transparent"}`}
        >
          3. Retroanálise: Transtornos
        </button>
        <button
          onClick={() => { setViewMode("dictionary"); setSelectedCategory("esquemas"); setSearchTerm(""); }}
          className={`flex-1 text-center py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${viewMode === "dictionary" ? "bg-amber-500 text-gray-950 shadow-md font-bold" : "text-gray-400 hover:text-white bg-transparent"}`}
        >
          4. Dicionário Geral
        </button>
      </div>

      {/* Controls Grid depending on Tab */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0" id="clinical-app-controls">
        {viewMode === "dictionary" ? (
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-black text-gray-450 uppercase tracking-wider block">Categoria do Dicionário:</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as SuggestionsCategoryType);
                setSearchTerm("");
              }}
              className="w-full bg-[#14151b] border border-gray-800 text-gray-250 text-xs rounded-lg p-2 focus:outline-none focus:border-amber-500"
            >
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-black text-gray-450 uppercase tracking-wider block">
              {viewMode === "mchf" ? "Selecione a Necessidade a Analisar:" :
               viewMode === "schemas" ? "Selecione o Esquema (EDI) a Retroanalisar:" :
               "Selecione o Transtorno Clínico (DSM):"}
            </label>
            <select
              value={viewMode === "mchf" ? selectedNeedIdx : viewMode === "schemas" ? selectedSchemaIdx : selectedDisorderIdx}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (viewMode === "mchf") setSelectedNeedIdx(val);
                else if (viewMode === "schemas") setSelectedSchemaIdx(val);
                else setSelectedDisorderIdx(val);
              }}
              className="w-full bg-[#14151b] border border-gray-800 text-gray-250 text-xs rounded-lg p-2 focus:outline-none focus:border-amber-500"
            >
              {viewMode === "mchf" ? (
                MCHF_NEEDS_DB.map((n, idx) => <option key={idx} value={idx}>{n.needName}</option>)
              ) : viewMode === "schemas" ? (
                MCHF_SCHEMAS_DB.map((s, idx) => <option key={idx} value={idx}>{s.schemaName}</option>)
              ) : (
                MCHF_DISORDERS_DB.map((d, idx) => <option key={idx} value={idx}>{d.disorderName}</option>)
              )}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[9px] font-mono font-black text-gray-450 uppercase tracking-wider block">Filtro / Pesquisa:</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Digite palavra-chave para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#14151b] border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-250 focus:outline-none focus:border-amber-500 placeholder-gray-650"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area Scrollpane */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin" id="clinical-app-main-pane">
        
        {/* VIEW 1: FORWARD ANALYSIS FROM NEEDS */}
        {viewMode === "mchf" && (
          <div className="space-y-4 text-left font-sans">
            {filteredNeeds.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-6">Nenhuma necessidade encontrada para "{searchTerm}".</div>
            ) : (
              (() => {
                const activeNeed = filteredNeeds[selectedNeedIdx] || filteredNeeds[0];
                if (!activeNeed) return null;
                const valueText = `MAPA CONTEXTUAL-HISTÓRICO-FUNCIONAL: ${activeNeed.needName}
Estilo Parental: ${activeNeed.estiloParental}
Necessidade: ${activeNeed.necessidade}
Histórico: ${activeNeed.historico}
EDI: ${activeNeed.edi}
Crenças Centrais: ${activeNeed.crencasCentrais}
Crenças Intermediárias: ${activeNeed.crencasIntermediarias}
Enfrentamento: ${activeNeed.comportamento}
Distorções: ${activeNeed.distorcoes}
Sentimentos: ${activeNeed.sentimentos}
Funções Mantenedoras: ${activeNeed.funcoesMantenedoras}
Transtornos Associados: ${activeNeed.hipotesesDiagnosticas}`;

                const steps = [
                  { label: "1. Estilo Parental Formativo", value: activeNeed.estiloParental, color: "border-red-500/20 text-red-400 bg-red-500/5", desc: "Origens e estilo de criação dos cuidadores." },
                  { label: "2. Necessidade Psicológica Negligenciada", value: activeNeed.necessidade, color: "border-blue-500/20 text-blue-400 bg-blue-500/5", desc: "A carência de desenvolvimento que eliciou o sofrimento." },
                  { label: "3. Histórico Contextual-Funcional", value: activeNeed.historico, color: "border-gray-800 text-gray-300 bg-gray-950/40", desc: "As interações e consequenciações da infância." },
                  { label: "4. Esquemas Iniciais Disfuncionais (EDI)", value: activeNeed.edi, color: "border-purple-500/20 text-purple-400 bg-purple-500/5", desc: "A lente cognitiva rígida ativada por experiências aversivas." },
                  { label: "5. Crenças Centrais (Core Beliefs)", value: activeNeed.crencasCentrais, color: "border-amber-500/20 text-amber-400 bg-amber-500/5", desc: "Ideias nucleares inabaláveis sobre si, os outros e o mundo." },
                  { label: "6. Crenças Intermediárias (Regras)", value: activeNeed.crencasIntermediarias, color: "border-yellow-500/20 text-yellow-450 bg-yellow-500/5", desc: "Pressupostos e regras arbitrárias criadas como proteção." },
                  { label: "7. Enfrentamento Desadaptativo", value: activeNeed.comportamento, color: "border-rose-500/20 text-rose-450 bg-rose-500/5", desc: "Resignação, esquiva ou hipercompensação do esquema." },
                  { label: "8. Distorções Cognitivas Frequentes", value: activeNeed.distorcoes, color: "border-orange-500/20 text-orange-400 bg-orange-500/5", desc: "Erros sistemáticos no processamento da informação." },
                  { label: "9. Emoções e Sentimentos Ativados", value: activeNeed.sentimentos, color: "border-pink-500/20 text-pink-400 bg-pink-500/5", desc: "A dor interna eliciada na ativação do padrão." },
                  { label: "10. Funções Mantenedoras", value: activeNeed.funcoesMantenedoras, color: "border-teal-500/20 text-teal-400 bg-teal-500/5", desc: "Reforçamento e contingências que perpetuam o sofrimento." },
                  { label: "11. Hipóteses Diagnósticas (DSM)", value: activeNeed.hipotesesDiagnosticas, color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5", desc: "Quadros clínicos onde esta cadeia se manifesta." }
                ];

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">{activeNeed.needName}</h4>
                      <button
                        onClick={() => handleCopy(valueText, activeNeed.needName)}
                        className="p-1.5 px-2.5 text-[10px] font-mono font-bold hover:bg-amber-500 hover:text-gray-950 text-amber-400 rounded-md border border-amber-500/30 bg-transparent cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        {copiedKey === activeNeed.needName ? <Check size={11} /> : <Copy size={11} />}
                        {copiedKey === activeNeed.needName ? "Copiado!" : "Copiar Análise"}
                      </button>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-[10px] text-gray-400 leading-relaxed">
                      <strong className="text-amber-300 block mb-0.5">Legenda Explicativa:</strong>
                      Este mapa traça a análise direta (causalidade progressiva), mapeando como a privação existencial infantil evolui até desencadear comportamentos disfuncionais e hipóteses diagnósticas na vida adulta.
                    </div>

                    <div className="relative pl-4 border-l-2 border-dashed border-gray-800 space-y-4 mt-2">
                      {steps.map((step, idx) => (
                        <div key={idx} className="relative group/step">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-800 border-2 border-[#0c0d12] group-hover/step:bg-amber-500 transition-colors" />
                          <div className={`p-3 rounded-lg border ${step.color} space-y-1 transition-all hover:border-opacity-100`}>
                            <span className="text-[8px] font-mono font-black uppercase tracking-wider block opacity-60">{step.label}</span>
                            <p className="text-[11px] font-bold leading-relaxed text-gray-150 select-text">{step.value}</p>
                            <span className="text-[9px] text-gray-500 block italic leading-normal font-sans border-t border-white/[0.02] pt-1">{step.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* VIEW 2: RETROANALYSIS FROM SCHEMAS */}
        {viewMode === "schemas" && (
          <div className="space-y-4 text-left font-sans">
            {filteredSchemas.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-6">Nenhum esquema encontrado para "{searchTerm}".</div>
            ) : (
              (() => {
                const activeSchema = filteredSchemas[selectedSchemaIdx] || filteredSchemas[0];
                if (!activeSchema) return null;
                const valueText = `RETROANÁLISE DO ESQUEMA: ${activeSchema.schemaName}
Necessidades Violadas na Infância: ${activeSchema.necessidadesVioladas}
Estilo Parental Formativo: ${activeSchema.estiloParental}
Crenças Centrais: ${activeSchema.crencasCentrais}
Crenças Intermediárias: ${activeSchema.crencasIntermediarias}
Estratégias de Enfrentamento: ${activeSchema.comportamento}
Distorções Cognitivas: ${activeSchema.distorcoes}
Sentimentos/Emoções: ${activeSchema.sentimentos}
Transtornos Clínicos Associados: ${activeSchema.hipotesesDiagnosticas}`;

                const steps = [
                  { label: "NECESSIDADES PSICOLÓGICAS VIOLADAS (RETROANÁLISE)", value: activeSchema.necessidadesVioladas, color: "border-blue-500/20 text-blue-400 bg-blue-500/5", desc: "As carências afetivas que constituíram a vulnerabilidade inicial do indivíduo." },
                  { label: "PARENTALIDADE CAUSADORA (ESTILO FORMATIVO)", value: activeSchema.estiloParental, color: "border-red-500/20 text-red-400 bg-red-500/5", desc: "A dinâmica relacional imposta pelos pais que desencadeou o esquema." },
                  { label: "ESQUEMA INICIAL DISFUNCIONAL (EDI)", value: activeSchema.schemaName, color: "border-purple-500/35 text-purple-400 bg-purple-500/10 font-bold", desc: "A lente disfuncional e dolorosa pela qual o paciente enxerga o mundo." },
                  { label: "CRENÇAS CENTRAIS ATIVADAS", value: activeSchema.crencasCentrais, color: "border-amber-500/20 text-amber-400 bg-amber-500/5", desc: "Afirmações rígidas internalizadas e consideradas verdades dogmáticas." },
                  { label: "REGRAS E PRESSUPOSTOS INTERMEDIÁRIOS", value: activeSchema.crencasIntermediarias, color: "border-yellow-500/20 text-yellow-450 bg-yellow-500/5", desc: "Regras do tipo 'Se eu... então...' formuladas para conviver com o esquema." },
                  { label: "ESTRATÉGIAS DE ENFRENTAMENTO (COMPORTAMENTAL)", value: activeSchema.comportamento, color: "border-rose-500/20 text-rose-450 bg-rose-500/5", desc: "Topografias de resignação, esquiva ou hipercompensação utilizadas." },
                  { label: "DISTORÇÕES COGNITIVAS PRESENTES", value: activeSchema.distorcoes, color: "border-orange-500/20 text-orange-400 bg-orange-500/5", desc: "Vieses sistemáticos de processamento de informação na vida adulta." },
                  { label: "EMOÇÕES E ESTADOS DE SOFRIMENTO", value: activeSchema.sentimentos, color: "border-pink-500/20 text-pink-400 bg-pink-500/5", desc: "A ativação neurofisiológica e a dor interna de sofrimento resultante." },
                  { label: "TRANSTORNOS CLÍNICOS DSM CORRELACIONADOS", value: activeSchema.hipotesesDiagnosticas, color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5", desc: "As síndromes topográficas onde o esquema geralmente atua como gerador." }
                ];

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">EDI: {activeSchema.schemaName}</h4>
                      <button
                        onClick={() => handleCopy(valueText, activeSchema.schemaName)}
                        className="p-1.5 px-2.5 text-[10px] font-mono font-bold hover:bg-amber-500 hover:text-gray-950 text-amber-400 rounded-md border border-amber-500/30 bg-transparent cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        {copiedKey === activeSchema.schemaName ? <Check size={11} /> : <Copy size={11} />}
                        {copiedKey === activeSchema.schemaName ? "Copiado!" : "Copiar Retroanálise"}
                      </button>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-[10px] text-gray-400 leading-relaxed">
                      <strong className="text-amber-300 block mb-0.5">Legenda Explicativa:</strong>
                      A retroanálise de Esquema realiza um rastreamento bidirecional. Ela retroage às necessidades não atendidas na infância (causa) e projeta as ramificações de regras e sintomas clínicos no presente (consequências).
                    </div>

                    <div className="relative pl-4 border-l-2 border-dashed border-gray-800 space-y-4 mt-2">
                      {steps.map((step, idx) => (
                        <div key={idx} className="relative group/step">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-800 border-2 border-[#0c0d12] group-hover/step:bg-amber-500 transition-colors" />
                          <div className={`p-3 rounded-lg border ${step.color} space-y-1 transition-all hover:border-opacity-100`}>
                            <span className="text-[8px] font-mono font-black uppercase tracking-wider block opacity-60">{step.label}</span>
                            <p className="text-[11px] font-bold leading-relaxed text-gray-150 select-text">{step.value}</p>
                            <span className="text-[9px] text-gray-550 block italic leading-normal font-sans border-t border-white/[0.02] pt-1">{step.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* VIEW 3: RETROANALYSIS FROM DISORDERS */}
        {viewMode === "disorders" && (
          <div className="space-y-4 text-left font-sans">
            {filteredDisorders.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-6">Nenhum transtorno encontrado para "{searchTerm}".</div>
            ) : (
              (() => {
                const activeDisorder = filteredDisorders[selectedDisorderIdx] || filteredDisorders[0];
                if (!activeDisorder) return null;
                const valueText = `ANÁLISE FUNCIONAL DOS TRANSTORNOS (POUBEL & RODRIGUES)
Nomenclatura Topográfica: ${activeDisorder.disorderName}
Nomenclatura Contextual-Funcional: ${activeDisorder.contextualName}
Histórico Contextual: ${activeDisorder.historicoContextual.join(" | ")}
Cognições: ${activeDisorder.cognicoes}
Características Comportamentais: ${activeDisorder.caracteristicasComportamentais}
Funções Mantenedoras: ${activeDisorder.funcoesMantenedoras.join(" | ")}
Déficits em Habilidades Psicológicas: ${activeDisorder.habilidadesPsicologicas.join(" | ")}
Histórico Terapêutico (Novas Funções): ${activeDisorder.novasFuncoes}`;

                return (
                  <div className="space-y-4 select-text">
                    <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">{activeDisorder.disorderName}</h4>
                      <button
                        onClick={() => handleCopy(valueText, activeDisorder.disorderName)}
                        className="p-1.5 px-2.5 text-[10px] font-mono font-bold hover:bg-amber-500 hover:text-gray-950 text-amber-400 rounded-md border border-amber-500/30 bg-transparent cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        {copiedKey === activeDisorder.disorderName ? <Check size={11} /> : <Copy size={11} />}
                        {copiedKey === activeDisorder.disorderName ? "Copiado!" : "Copiar Laudo AF"}
                      </button>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-[10px] text-gray-400 leading-relaxed">
                      <strong className="text-amber-300 block mb-0.5">Legenda Explicativa da Análise Funcional de Transtornos:</strong>
                      Este painel transcreve a taxonomia de contingências do <strong>Manual Diagnóstico Contextual-Funcional</strong> de Lincoln Poubel e Pedro Rodrigues. Ele desmembra o diagnóstico DSM (topografia) em sua etiologia desenvolvimental, regras verbais, funções de manutenção e habilidades psicológicas deficitárias recomendadas para treinamento.
                    </div>

                    {/* Book Layout Matrix */}
                    <div className="border border-gray-800 rounded-2xl overflow-hidden bg-gray-950/20 text-xs">
                      
                      {/* Row 1: Contextual-Functional Title */}
                      <div className="bg-amber-500/10 border-b border-gray-800 p-4">
                        <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-widest block">Nomenclatura Contextual-Funcional</span>
                        <h5 className="text-sm font-black text-gray-100 mt-1">{activeDisorder.contextualName}</h5>
                      </div>

                      {/* Row 2: Contextual History, Topography + Cognitions, Maintaining Functions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-800">
                        {/* Col Left: Histórico Contextual */}
                        <div className="p-4 border-r border-gray-800 space-y-2">
                          <span className="text-[9px] font-mono font-black text-gray-450 uppercase tracking-wider block">Histórico Contextual</span>
                          <ul className="list-disc pl-4 space-y-1.5 text-gray-300 leading-relaxed text-[11px]">
                            {activeDisorder.historicoContextual.map((h, i) => <li key={i}>{h}</li>)}
                          </ul>
                        </div>

                        {/* Col Center: Topografia, Cognição, Comportamento */}
                        <div className="p-4 border-r border-gray-800 space-y-4 bg-white/[0.01]">
                          <div>
                            <span className="text-[9px] font-mono font-black text-gray-450 uppercase tracking-wider block">Nomenclatura Topográfica</span>
                            <strong className="text-gray-150 text-[11px]">{activeDisorder.disorderName}</strong>
                          </div>

                          <div>
                            <span className="text-[9px] font-mono font-black text-gray-450 uppercase tracking-wider block">Cognições / Regras</span>
                            <blockquote className="border-l-2 border-amber-500/40 pl-2 text-gray-400 italic leading-relaxed text-[11px] mt-1 font-sans">
                              "{activeDisorder.cognicoes}"
                            </blockquote>
                          </div>

                          <div>
                            <span className="text-[9px] font-mono font-black text-gray-450 uppercase tracking-wider block">Características Comportamentais</span>
                            <p className="text-gray-300 leading-relaxed text-[11px] mt-1">{activeDisorder.caracteristicasComportamentais}</p>
                          </div>
                        </div>

                        {/* Col Right: Funções Mantenedoras */}
                        <div className="p-4 space-y-2">
                          <span className="text-[9px] font-mono font-black text-gray-450 uppercase tracking-wider block">Funções Mantenedoras</span>
                          <ul className="list-disc pl-4 space-y-1.5 text-gray-300 leading-relaxed text-[11px]">
                            {activeDisorder.funcoesMantenedoras.map((fm, i) => <li key={i}>{fm}</li>)}
                          </ul>
                        </div>
                      </div>

                      {/* Row 3: Histórico Terapêutico, Habilidades, Novas Funções */}
                      <div className="grid grid-cols-1 md:grid-cols-3 bg-white/[0.02]">
                        {/* Col Left: Histórico Terapêutico */}
                        <div className="p-4 border-r border-gray-800 space-y-2">
                          <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-wider block">Histórico Terapêutico</span>
                          <p className="text-gray-350 leading-relaxed text-[11px]">
                            Implementar um programa estruturado de reabilitação clínica visando enfraquecer o padrão mantenedor de escape/evitação e reestruturar regras de catastrofização verbal.
                          </p>
                        </div>

                        {/* Col Center: Habilidades Psicológicas */}
                        <div className="p-4 border-r border-gray-800 space-y-2">
                          <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-wider block">Habilidades Psicológicas em Déficit</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {activeDisorder.habilidadesPsicologicas.map((hp, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-gray-900 border border-gray-850 text-[10px] font-semibold text-gray-300">
                                {hp}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Col Right: Novas Funções */}
                        <div className="p-4 space-y-2">
                          <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-wider block">Novas Funções a Estabelecer</span>
                          <p className="text-gray-350 leading-relaxed text-[11px] font-sans">
                            {activeDisorder.novasFuncoes}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* VIEW 4: DICTIONARY TAB */}
        {viewMode === "dictionary" && (
          <div className="space-y-3 font-sans text-left">
            {filteredDictionaryItems.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-6">Nenhum termo clínico encontrado para "{searchTerm}".</div>
            ) : (
              filteredDictionaryItems.map((item, idx) => (
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
                    >
                      {copiedKey === item.key ? (
                        <>
                          <Check size={11} />
                          Copiado!
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
                    <span className="text-amber-500 font-bold font-mono text-[9px] uppercase tracking-wider block mb-0.5">Legenda / Critério Clínico:</span>
                    {item.explanation}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-center space-y-1 block shrink-0" id="clinical-app-footer">
        <span className="text-[11px] text-amber-300 font-bold block">Terapia de Esquemas & Análise Funcional de Contingências</span>
        <span className="text-[9px] text-gray-550 block font-mono">Consulte explicações, análises e retroanálises e insira em qualquer formulário.</span>
      </div>
    </div>
  );
}
