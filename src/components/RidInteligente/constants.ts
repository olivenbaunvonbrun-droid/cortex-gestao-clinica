/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SCHEMAS_DATA = [
  {
    domain: "Domínio 1 – Desconexão e Rejeição",
    description: "Crença de que necessidades básicas de segurança, amor, estabilidade, empatia e respeito não serão atendidas",
    schemas: [
      { name: "Abandono/Instabilidade", definition: "Medo de perder pessoas importantes." },
      { name: "Desconfiança/Abuso", definition: "Expectativa de ser enganado, maltratado ou abusado." },
      { name: "Privação Emocional", definition: "Crença de que apoio e afeto nunca estarão disponíveis." },
      { name: "Defectividade/Vergonha", definition: "Sensação de ser defeituoso, indigno de amor." },
      { name: "Isolamento Social/Alienação", definition: "Sentir-se diferente, não pertencente." }
    ]
  },
  {
    domain: "Domínio 2 – Autonomia e Desempenho Prejudicados",
    description: "Crença de incapacidade de viver de forma independente e competente",
    schemas: [
      { name: "Dependência/Incompetência", definition: "Crença de não conseguir lidar sozinho." },
      { name: "Vulnerabilidade a Danos ou Doenças", definition: "Medo excessivo de catástrofes, doenças, acidentes." },
      { name: "Emaranhamento/Self Subdesenvolvido", definition: "Fusão excessiva com figuras significativas, perda de identidade própria." },
      { name: "Fracasso", definition: "Sensação de ser inadequado, inferior, incapaz de ter sucesso." }
    ]
  },
  {
    domain: "Domínio 3 – Limites Prejudicados",
    description: "Dificuldade em respeitar limites, direitos e responsabilidades",
    schemas: [
      { name: "Grandiosidade/Arrogância", definition: "Sensação de superioridade, privilégios especiais." },
      { name: "Autocontrole/Autodisciplina Insuficientes", definition: "Dificuldade em controlar impulsos ou adiar gratificação." }
    ]
  },
  {
    domain: "Domínio 4 – Orientação para os Outros",
    description: "Excesso de foco em atender às necessidades alheias para ser aceito",
    schemas: [
      { name: "Subjugação", definition: "Submissão excessiva para evitar rejeição ou raiva." },
      { name: "Auto-sacrifício", definition: "Foco excessivo em ajudar os outros, negligenciando a si mesmo." },
      { name: "Busca de Aprovação/Reconhecimento", definition: "Necessidade exagerada de aprovação externa." }
    ]
  },
  {
    domain: "Domínio 5 – Supervigilância e Inibição",
    description: "Excesso de repressão de sentimentos e busca rígida de padrões",
    schemas: [
      { name: "Negatividade/Pessimismo", definition: "Foco no lado negativo da vida, medo de fracasso e sofrimento." },
      { name: "Inibição Emocional", definition: "Dificuldade em expressar emoções, preferindo controle." },
      { name: "Padrões Inflexíveis/Crítica Exagerada", definition: "Busca rígida de perfeição, altos padrões e crítica interna severa." },
      { name: "Punitividade", definition: "Crença de que erros merecem punição, pouca compaixão consigo/outros." }
    ]
  }
];

export const NEEDS_DATA = [
  {
    category: "Necessidades Infantis",
    needs: [
      "Atenção", "Carinho", "Reconhecimento", "Vinculação", "Proteção", 
      "Cuidado", "Autonomia", "Socialização", "Conversação", "Instrução", 
      "Brincar", "Limites", "Gregária", "Autoconceito", "Compreensão"
    ]
  },
  {
    category: "Estilos Parentais",
    needs: ["Negligente", "Permissivo", "Autoritário", "Participativo"]
  },
  {
    category: "Necessidades Parentais",
    needs: [
      "Honra", "Respeito", "Carinho", "Reconhecimento", "Vinculação", 
      "Autoridade", "Autonomia", "Conversação", "Compreensão", "Sabedoria"
    ]
  },
  {
    category: "Necessidades Conjugais",
    needs: [
      "Atenção", "Admiração", "Conversa íntima", "Carinho", "Atração física", 
      "Sexo", "Romantismo", "Apoio doméstico", "Apoio financeiro", "Lazer", "Individualidade"
    ]
  },
  {
    category: "Necessidades Adultas",
    needs: [
      "Atenção", "Carinho", "Reconhecimento", "Autoestima", "Vínculo", 
      "Confiança", "Socialização", "Desejabilidade", "Realização", "Autonomia", 
      "Proteção", "Asserção", "Gregária", "Compreensão", "Responsabilidade", 
      "Liberdade e poder", "Aprovação", "Otimismo", "Reflexividade", "Controle", 
      "Recreatividade", "Enfrentamento", "Intimidade", "Correspondência", "Feedback", "Merecimento"
    ]
  },
  {
    category: "Esquemas Desadaptativos",
    needs: [
      "Privação emocional", "Abandono", "Desconfiança", "Defectividade", 
      "Indesejabilidade social", "Fracasso", "Dependência/incompetência", 
      "Vulnerabilidade", "Emaranhamento", "Subjugação", "Autossacrifício", 
      "Inibição emocional", "Padrões inflexíveis", "Grandiosidade", "Autocontrole insuficiente"
    ]
  },
  {
    category: "Habilidades Psicológicas",
    needs: [
      "Autoconhecimento", "Autorregulação emocional", "Raciocínio Realisticamente Otimista", 
      "Autoestima", "Resolutividade e Enfrentamento", "Autocontrole", "Sociabilidade", 
      "Imunidade Social", "Sensibilidade Social", "Hedonismo Responsável"
    ]
  },
  {
    category: "Dimensões da Vida",
    needs: ["Pessoal", "Interpessoal", "Ocupacional", "Material", "Recreativa", "Existencial"]
  },
  {
    category: "P's da Felicidade",
    needs: ["Prazer", "Paz", "Pertencimento", "Propósito", "Positividade"]
  }
];

export const COPING_STYLES = [
  { name: "Rendição", description: "Ceder ao esquema (Ex: 'sou mesmo incompetente')." },
  { name: "Evitação", description: "Fugir (Ex: evitar relacionamentos, evitar intimidade)." },
  { name: "Hipercompensação", description: "Agir de forma contrária (Ex: ser perfeccionista, controlador, arrogante)." }
];

export const BASIC_EMOTIONS = [
  { name: "Alegria", symptoms: "Calor no corpo, leveza, sorriso involuntário, energia elevada, batimentos ligeiramente aumentados." },
  { name: "Tristeza", symptoms: "Sensação de aperto ou vazio no peito, nó na garganta, fadiga, choro, peso nos olhos." },
  { name: "Raiva", symptoms: "Tensão muscular (mandíbula apertada, punhos cerrados), calor no rosto/pescoço, aceleração cardíaca." },
  { name: "Medo", symptoms: "Taquicardia (coração disparado), respiração curta/ofegante, tremores, suor frio, boca seca." },
  { name: "Nojo", symptoms: "Náusea, contração na região do estômago, careta/expressão facial de repulsa, salivação excessiva." },
  { name: "Surpresa", symptoms: "Sobressalto, olhos arregalados/elevação das sobrancelhas, inspiração rápida e retenção do ar." },
  { name: "Ansiedade", symptoms: "Aperto no peito, inquietação motora, suor nas mãos, nó no estômago, tremores, tensão nos ombros." },
  { name: "Culpa", symptoms: "Sensação de peso nos ombros/peito, nó na garganta, evitação do olhar, desconforto no estômago." },
  { name: "Vergonha", symptoms: "Rubor facial (corar), calor súbito, aumento cardíaco repentino, evitação do contato visual." },
  { name: "Frustração", symptoms: "Tensão na mandíbula/ombros, suspiros frequentes, sensação de calor na cabeça, impaciência." },
  { name: "Alívio", symptoms: "Expiração profunda (suspiro), relaxamento muscular imediato, sensação de leveza, batimentos calmos." },
  { name: "Amor", symptoms: "Sensação de calor/acolhimento no peito, sorriso fácil, expressão suave, leve frio no estômago." }
];

export const COGNITIVE_DISTORTIONS = [
  { name: "Catastrofização", description: "Imaginar o pior cenário possível sem considerar outras alternativas." },
  { name: "Tudo ou Nada", description: "Ver as coisas em categorias de preto ou branco, sem meio-termo." },
  { name: "Leitura de Mente", description: "Acreditar saber o que os outros estão pensando, geralmente de forma negativa." },
  { name: "Supergeneralização", description: "Ver um único evento negativo como um padrão interminável de derrotas." },
  { name: "Personalização", description: "Assumir a responsabilidade por eventos negativos externos sem base factual." },
  { name: "Raciocínio Emocional", description: "Presumir que suas emoções negativas refletem a realidade das coisas." },
  { name: "Imperativos (Devo/Tenho que)", description: "Autoimpor regras rígidas que geram culpa ou frustração." },
  { name: "Rotulação", description: "Atribuir rótulos globais negativos a si mesmo ou aos outros." }
];

export const SITUATION_SUGGESTIONS = [
  "Receber uma crítica ou feedback negativo",
  "Esconder um erro cometido no trabalho/casa",
  "Sentir-se ignorado em uma conversa social",
  "Ver o sucesso de outra pessoa nas redes sociais",
  "Antecipar um evento futuro estressante",
  "Conflito ou discussão com pessoa próxima",
  "Cometer um erro em público",
  "Estar em um ambiente com muitas pessoas",
  "Receber uma tarefa nova e desafiadora",
  "Ficar sozinho por um longo período"
];

export const BEHAVIOR_SUGGESTIONS = {
  maladaptive: [
    "Afastar-se ou evitar o contato visual",
    "Pedir desculpas excessivamente",
    "Comer de forma compulsiva para se acalmar",
    "Procrastinar a tarefa que gera medo",
    "Tentar agradar o outro para não ser rejeitado",
    "Explodir em raiva ou agressividade verbal",
    "Ficar checando o celular repetidamente",
    "Buscar garantias constantes de outras pessoas",
    "Isolar-se no quarto ou em local fechado",
    "Paralisar e não conseguir tomar decisão",
    "Trabalhar excessivamente para evitar pensar",
    "Uso de substâncias (álcool, doces, etc)",
    "Ruminar sobre o problema sem agir",
    "Autocrítica severa e punitiva",
    "Gastar dinheiro de forma impulsiva",
    "Suprimir ou esconder o que está sentindo"
  ],
  adaptive: [
    "Respirar fundo e usar técnica de relaxamento",
    "Questionar a validade do pensamento negativo",
    "Expressar sentimentos de forma assertiva",
    "Pedir ajuda ou apoio a alguém de confiança",
    "Dividir uma tarefa grande em pequenos passos",
    "Praticar autocompaixão e aceitação",
    "Engajar-se em uma atividade prazerosa",
    "Estabelecer limites claros com os outros",
    "Enfrentar gradualmente a situação temida",
    "Praticar Mindfulness (atenção plena)",
    "Focar no que está sob meu controle direto",
    "Reservar um tempo para o autocuidado"
  ]
};

export const CONSEQUENCE_SUGGESTIONS = {
  shortTerm: [
    "Alívio imediato da ansiedade",
    "Sentimento de culpa e arrependimento",
    "Redução momentânea do estresse",
    "Sensação de segurança temporária",
    "Evitação do conflito imediato",
    "Sugestão de bem-estar passageiro",
    "Aumento súbito de irritabilidade",
    "Frustração antecipada"
  ],
  longTerm: [
    "Reforço da crença de incapacidade",
    "Afastamento das pessoas queridas",
    "Piora na qualidade do sono",
    "Acúmulo de problemas não resolvidos",
    "Aumento da autocrítica e desvalorização",
    "Manutenção do ciclo de evitação",
    "Perda de autoconfiança",
    "Desenvolvimento de sintomas depressivos",
    "Dificuldade em estabelecer novos vínculos",
    "Estagnação profissional ou pessoal"
  ]
};
