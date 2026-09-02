/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CLINICAL_SUGGESTIONS_DB } from "../BibliotecaAvaliacao/components/ClinicalSuggestionsHelper";

export const SCHEMAS_DATA = [
  {
    domain: "Domínio 1 – Desconexão e Rejeição",
    description: "Crença de que necessidades básicas de segurança, amor, estabilidade, empatia e respeito não serão atendidas",
    schemas: [
      { 
        name: "Abandono/Instabilidade", 
        definition: "Medo de perder pessoas importantes e de ficar desamparado.",
        question: "Você costuma sentir um medo constante ou aflição de que as pessoas que você ama vão te deixar, se afastar, falecer ou encontrar alguém melhor que você?"
      },
      { 
        name: "Desconfiança/Abuso", 
        definition: "Expectativa de ser enganado, maltratado, traído ou abusado.",
        question: "Você sente que precisa estar sempre em guarda porque, cedo ou tarde, as pessoas vão mentir para você, te prejudicar, trair sua confiança ou tirar vantagem?"
      },
      { 
        name: "Privação Emocional", 
        definition: "Crença de que apoio, afeto, escuta e carinho nunca estarão disponíveis de verdade.",
        question: "Você sente um vazio de que ninguém nunca vai realmente te compreender no fundo, te dar o carinho que precisa ou cuidar de você de verdade?"
      },
      { 
        name: "Defectividade/Vergonha", 
        definition: "Sensação íntima de ser defeituoso, falho, inferior ou indigno de amor.",
        question: "Você guarda uma sensação íntima de que tem algum 'defeito' ou imperfeição que, se as pessoas descobrirem como você realmente é por dentro, vão te rejeitar ou sentir vergonha?"
      },
      { 
        name: "Isolamento Social/Alienação", 
        definition: "Sentir-se diferente, não pertencente a grupos ou à comunidade.",
        question: "Você se sente um estranho ou um 'peixe fora d'água' nos ambientes, como se fosse diferente das outras pessoas e não pertencesse a lugar nenhum?"
      }
    ]
  },
  {
    domain: "Domínio 2 – Autonomia e Desempenho Prejudicados",
    description: "Crença de incapacidade de viver de forma independente e competente",
    schemas: [
      { 
        name: "Dependência/Incompetência", 
        definition: "Crença de não conseguir lidar com as tarefas e decisões do dia a dia sozinho.",
        question: "Você sente que não dá conta da vida sozinho e que precisa sempre que alguém te oriente, decida por você ou assuma a responsabilidade para você não errar?"
      },
      { 
        name: "Vulnerabilidade a Danos ou Doenças", 
        definition: "Medo excessivo de catástrofes, doenças súbitas, acidentes ou ruína financeira.",
        question: "Você vive com uma sensação de perigo iminente, temendo que uma tragédia de saúde, financeira ou familiar possa acontecer a qualquer instante sem você poder evitar?"
      },
      { 
        name: "Emaranhamento/Self Subdesenvolvido", 
        definition: "Fusão excessiva com figuras significativas, perda de identidade própria e autonomia.",
        question: "Você sente que sua vida é tão ligada aos seus pais (ou parceiro) que é difícil saber quem você é de verdade sozinho, ou sente que se afastar seria uma traição?"
      },
      { 
        name: "Fracasso", 
        definition: "Sensação de ser inadequado, inferior, incapaz de ter sucesso nos estudos ou carreira.",
        question: "Você se sente inferior ou menos capaz que as outras pessoas da sua idade, acreditando que na carreira ou nos estudos você é um fracasso ou uma fraude que logo será descoberta?"
      }
    ]
  },
  {
    domain: "Domínio 3 – Limites Prejudicados",
    description: "Dificuldade em respeitar limites, direitos e responsabilidades",
    schemas: [
      { 
        name: "Grandiosidade/Arrogância", 
        definition: "Sensação de superioridade, privilégios especiais e desrespeito a regras comuns.",
        question: "Você se irrita facilmente quando as coisas não saem exatamente do seu jeito ou sente que as regras comuns do dia a dia não deveriam se aplicar a você?"
      },
      { 
        name: "Autocontrole/Autodisciplina Insuficientes", 
        definition: "Dificuldade em controlar impulsos, adiar gratificação ou tolerar rotina e frustração.",
        question: "Você tem muita dificuldade de terminar o que começa, cede fácil a impulsos imediatos ou desiste rápido quando uma tarefa fica chata, cansativa ou frustrante?"
      }
    ]
  },
  {
    domain: "Domínio 4 – Orientação para os Outros",
    description: "Excesso de foco em atender às necessidades alheias para ser aceito",
    schemas: [
      { 
        name: "Subjugação", 
        definition: "Submissão excessiva e anulação das próprias vontades para evitar rejeição ou raiva.",
        question: "Você costuma ceder às vontades dos outros ou engolir o que pensa e sente apenas para evitar que a outra pessoa fique com raiva, chateada ou se afaste de você?"
      },
      { 
        name: "Auto-sacrifício", 
        definition: "Foco excessivo em ajudar e salvar os outros, negligenciando a si mesmo por culpa.",
        question: "Você se sente culpado se colocar suas próprias necessidades em primeiro lugar, priorizando sempre cuidar e resolver os problemas dos outros antes de você mesmo?"
      },
      { 
        name: "Busca de Aprovação/Reconhecimento", 
        definition: "Necessidade exagerada de aprovação externa, elogios e validação para ter valor.",
        question: "O quanto a opinião e a validação dos outros definem como você se sente consigo mesmo? Você muda seu jeito de ser para se encaixar e ser admirado?"
      }
    ]
  },
  {
    domain: "Domínio 5 – Supervigilância e Inibição",
    description: "Excesso de repressão de sentimentos e busca rígida de padrões",
    schemas: [
      { 
        name: "Negatividade/Pessimismo", 
        definition: "Foco no lado negativo da vida, minimizando conquistas e esperando catástrofes.",
        question: "Mesmo quando algo dá certo, você logo pensa no que pode dar errado em seguida, como se uma coisa boa sempre fosse acompanhada de um desastre iminente?"
      },
      { 
        name: "Inibição Emocional", 
        definition: "Dificuldade em expressar emoções espontâneas, preferindo autocontrole e frieza.",
        question: "Você acha muito difícil demonstrar afeto, chorar na frente de alguém ou expressar o que sente abertamente, preferindo manter uma postura fria, racional e controlada?"
      },
      { 
        name: "Padrões Inflexíveis/Crítica Exagerada", 
        definition: "Busca rígida de perfeição, regras inflexíveis e autocrítica interna implacável.",
        question: "Você se cobra de forma implacável para que tudo seja perfeito, sentindo que nada do que você faz está bom o suficiente e se martirizando duramente pelos mínimos erros?"
      },
      { 
        name: "Punitividade", 
        definition: "Crença de que erros merecem punição severa, com pouca tolerância ou compaixão.",
        question: "Você tem dificuldade em perdoar seus próprios erros ou os erros dos outros, achando que quem erra tem que pagar o preço e ser duramente castigado?"
      }
    ]
  }
];

export const NEEDS_DATA = [
  {
    category: "Necessidades Infantis",
    needs: CLINICAL_SUGGESTIONS_DB.necessidades_infantil.items.map(item => item.key),
    items: CLINICAL_SUGGESTIONS_DB.necessidades_infantil.items.map(item => ({
      name: item.key,
      desc: item.value,
      question: item.question
    }))
  },
  {
    category: "Estilos Parentais",
    needs: CLINICAL_SUGGESTIONS_DB.estilos_parentais.items.map(item => item.key),
    items: CLINICAL_SUGGESTIONS_DB.estilos_parentais.items.map(item => ({
      name: item.key,
      desc: item.value,
      question: item.question
    }))
  },
  {
    category: "Necessidades Parentais",
    needs: CLINICAL_SUGGESTIONS_DB.necessidades_parental.items.map(item => item.key),
    items: CLINICAL_SUGGESTIONS_DB.necessidades_parental.items.map(item => ({
      name: item.key,
      desc: item.value,
      question: item.question
    }))
  },
  {
    category: "Necessidades Conjugais",
    needs: CLINICAL_SUGGESTIONS_DB.necessidades_conjugal.items.map(item => item.key),
    items: CLINICAL_SUGGESTIONS_DB.necessidades_conjugal.items.map(item => ({
      name: item.key,
      desc: item.value,
      question: item.question
    }))
  },
  {
    category: "Necessidades Adultas",
    needs: CLINICAL_SUGGESTIONS_DB.necessidades_adulto.items.map(item => item.key),
    items: CLINICAL_SUGGESTIONS_DB.necessidades_adulto.items.map(item => ({
      name: item.key,
      desc: item.value,
      question: item.question
    }))
  },
  {
    category: "Esquemas Desadaptativos",
    needs: CLINICAL_SUGGESTIONS_DB.esquemas.items.map(item => item.key)
  },
  {
    category: "Esquemas Adaptativos",
    needs: CLINICAL_SUGGESTIONS_DB.esquemas_adaptativos.items.map(item => item.key)
  },
  {
    category: "Crenças Centrais Disfuncionais",
    needs: CLINICAL_SUGGESTIONS_DB.crencas_centrais.items.map(item => item.key)
  },
  {
    category: "Crenças Centrais Funcionais",
    needs: CLINICAL_SUGGESTIONS_DB.crencas_centrais_funcionais.items.map(item => item.key)
  },
  {
    category: "Crenças Intermediárias",
    needs: [
      ...CLINICAL_SUGGESTIONS_DB.crencas_intermediarias.items.map(item => item.key),
      ...CLINICAL_SUGGESTIONS_DB.crencas_intermediarias_adaptativas.items.map(item => item.key)
    ]
  },
  {
    category: "Pensamentos Automáticos",
    needs: [
      ...CLINICAL_SUGGESTIONS_DB.pensamentos_automaticos_negativos.items.map(item => item.key),
      ...CLINICAL_SUGGESTIONS_DB.pensamentos_automaticos_positivos.items.map(item => item.key)
    ]
  },
  {
    category: "Modos Esquemáticos",
    needs: CLINICAL_SUGGESTIONS_DB.modos_esquematicos.items.map(item => item.key)
  },
  {
    category: "Vieses Cognitivos",
    needs: CLINICAL_SUGGESTIONS_DB.vieses_cognitivos.items.map(item => item.key)
  },
  {
    category: "Padrões Comportamentais",
    needs: [
      ...CLINICAL_SUGGESTIONS_DB.padroes_comportamentais_disfuncionais.items.map(item => item.key),
      ...CLINICAL_SUGGESTIONS_DB.padroes_comportamentais_funcionais.items.map(item => item.key)
    ]
  },
  {
    category: "Emoções Nucleares",
    needs: [
      ...CLINICAL_SUGGESTIONS_DB.sentimentos.items.map(item => item.key),
      ...CLINICAL_SUGGESTIONS_DB.sentimentos_funcionais.items.map(item => item.key)
    ]
  },
  {
    category: "Fatores Protetivos",
    needs: CLINICAL_SUGGESTIONS_DB.fatores_protetivos.items.map(item => item.key)
  },
  {
    category: "Parâmetros Avançados",
    needs: CLINICAL_SUGGESTIONS_DB.parametros_avancados.items.map(item => item.key)
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
  { name: "Ansiedade", symptoms: "Aperto no peito, inquietação motora, suor nas mãos, nó no estômago, tremores, tensionamento de ombros." },
  { name: "Culpa", symptoms: "Sensação de peso nos ombros/peito, nó na garganta, evitação do olhar, desconforto no estômago." },
  { name: "Vergonha", symptoms: "Rubor facial (corar), calor súbito, aumento cardíaco repentino, evitação do contato visual." },
  { name: "Frustração", symptoms: "Tensão na mandíbula/ombros, suspiros frequentes, sensação de calor na cabeça, impaciência." },
  { name: "Alívio", symptoms: "Expiração profunda (suspiro), relaxamento muscular imediato, sensação de leveza, batimentos calmos." },
  { name: "Amor", symptoms: "Sensação de calor/acolhimento no peito, sorriso fácil, expressão suave, leve frio no estômago." }
];

export const COGNITIVE_DISTORTIONS = CLINICAL_SUGGESTIONS_DB.distorcoes.items.map(item => ({
  name: item.key,
  description: item.explanation
}));

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
