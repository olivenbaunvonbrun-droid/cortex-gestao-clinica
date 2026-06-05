/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, EarlyNeed, SchemaEID, CopingStyle, PsychologicalSkill, RIDEntry } from "../types";

export const initialPatients: Patient[] = [
  {
    id: "pedro-30",
    name: "Pedro Silveira",
    age: 30,
    profession: "Engenheiro de Software",
    clinicalQueixa: "Ansiedade social incapacitante em reuniões, apresentações de projetos e interações com superiores hierárquicos. Evitação sistemática de falar em público, delegando responsabilidades.",
    establishingOperations: "Pressão corporativa por resultados; aprovação de projetos dependente de defesas orais; cultura corporativa competitiva.",
    neglectedNeeds: [
      EarlyNeed.Protecao,
      EarlyNeed.Vinculo,
      EarlyNeed.Admiracao,
      EarlyNeed.Compreensao,
      EarlyNeed.Autonomia
    ],
    activeSchemas: [
      SchemaEID.Fracasso,
      SchemaEID.Defectividade,
      SchemaEID.InibicaoEmocional
    ],
    beliefs: {
      coreBeliefs: [
        "Sou incompetente e inadequado",
        "Sei que serei ridicularizado",
        "Meus defeitos são visíveis a todos"
      ],
      intermediateBeliefs: [
        "Se eu expressar minha opinião, as pessoas vão perceber que sou uma farsa",
        "Eu devo ser perfeito em minhas apresentações para evitar críticas",
        "É terrível ser julgado negativamente por figuras de autoridade"
      ],
      automaticThoughts: [
        "Não vou conseguir falar",
        "Eles estão cochichando porque sabem que estou tremendo",
        "Vou gaguejar e estragar tudo"
      ]
    },
    copingStyleSelected: CopingStyle.Evitacao,
    copingBehaviors: [
      "Delegar apresentações para colegas juniores",
      "Terminar reuniões de forma abrupta para aliviar a ansiedade",
      "Adotar postura física encolhida e evitar contato visual direto",
      "Checar repetitivamente o material de apoio para tentar controlar o estresse"
    ],
    periodization: [
      {
        id: "p1",
        skill: PsychologicalSkill.Autoconhecimento,
        title: "Fase 1: Mapeamento Funcional e Auto-monitoramento",
        durationWeeks: 2,
        phase: "Aquece",
        completed: true,
        priority: "Alta",
        exercises: [
          { id: "e1", title: "Preencher Primeiro RID com o Terapeuta", completed: true, rewardXp: 100 },
          { id: "e2", title: "Identificação Auditada de Padrões de Evitação", completed: true, rewardXp: 150 }
        ]
      },
      {
        id: "p2",
        skill: PsychologicalSkill.ResolutividadeEnfrentamento,
        title: "Fase 2: Treino de Assertividade e Enfrentamento de Conflitos",
        durationWeeks: 4,
        phase: "Ativo",
        completed: false,
        priority: "Alta",
        exercises: [
          { id: "e3", title: "Role-play: O Colega Distraído (Nível 1)", completed: true, rewardXp: 200 },
          { id: "e4", title: "Role-play: O Superior Sarcástico (Nível 2)", completed: false, rewardXp: 250 },
          { id: "e5", title: "Construção de Roteiro de Confrontação Diplomática", completed: false, rewardXp: 150 }
        ]
      },
      {
        id: "p3",
        skill: PsychologicalSkill.ImunidadeSocial,
        title: "Fase 3: Imunização Contra Críticas e Descatastrofização",
        durationWeeks: 3,
        phase: "Ativo",
        completed: false,
        priority: "Alta",
        exercises: [
          { id: "e6", title: "Exposição Imunizadora Voluntária (Meia Diferente)", completed: false, rewardXp: 300 },
          { id: "e7", title: "Leitura Sistemática da Declaração de Direitos Pessoais", completed: false, rewardXp: 100 },
          { id: "e8", title: "Técnica de Desfusão: Metáfora do Ônibus", completed: false, rewardXp: 200 }
        ]
      },
      {
        id: "p4",
        skill: PsychologicalSkill.Autoestima,
        title: "Fase 4: Integração de Recursos e Aceitação Saudável",
        durationWeeks: 2,
        phase: "Consolidação",
        completed: false,
        priority: "Média",
        exercises: [
          { id: "e9", title: "Ativação Mnemônica de Ressignificação de Lembranças", completed: false, rewardXp: 400 },
          { id: "e10", title: "Construção do Plano de Prevenção de Recaídas", completed: false, rewardXp: 200 }
        ]
      }
    ],
    sessionHistory: [
      {
        id: "s1",
        date: "2026-05-15",
        evolutionSummary: "Sessão diagnóstica inicial. O paciente conseguiu abdicar de relatar de modo passivo e focar na análise funcional do RID. Identificou-se o marco traumático do 'Festival de Talentos' aos 7 anos.",
        adherenceScore: 90,
        verbalCompetenceScore: 40,
        nonVerbalCompetenceScore: 35,
        clinicalObservations: "Grande carga de distorção do tipo catastrofização. O paciente sente-se muito vulnerável físico e socialmente."
      },
      {
        id: "s2",
        date: "2026-05-22",
        evolutionSummary: "Introdução ao PDP (Fase de Motivação) para Resolutividade e Enfrentamento. Primeiro ensaio comportamental com o cenário 'Colega Distraído'. Apresentou timidez extrema no início, mas superou.",
        adherenceScore: 95,
        verbalCompetenceScore: 65,
        nonVerbalCompetenceScore: 55,
        clinicalObservations: "Após modelagem pelo terapeuta, houve correção significativa na postura física e volume vocal."
      },
      {
        id: "s3",
        date: "2026-06-01",
        evolutionSummary: "Sessão focada na desfusão cognitiva do eu-infantil versus eu-adulto saudável com a Metáfora do Ônibus. Progresso no entendimento do mecanismo funcional da evitação.",
        adherenceScore: 85,
        verbalCompetenceScore: 70,
        nonVerbalCompetenceScore: 60,
        clinicalObservations: "Emocionou-se ao recordar do momento no festival em que a professora sorriu de forma inábil. Pactuamos o PME para a próxima semana."
      }
    ],
    level: 2,
    xp: 450,
    streakDays: 4,
    unlockedBadges: [
      { id: "b1", title: "Cientista de Si", description: "Concluiu seu primeiro Registro de Interação Disfuncional (RID)", unlockedAt: "2026-05-15" },
      { id: "b2", title: "Postura Pronta", description: "Alcançou nota superior a 50 no treinamento não-verbal", unlockedAt: "2026-05-22" }
    ]
  },
  {
    id: "mariana-28",
    name: "Mariana Alencar",
    age: 28,
    profession: "Gerente Financeira",
    clinicalQueixa: "Sobrecarga crônica de tarefas por incapacidade de delegar e dizer 'não' para subordinados e diretores. Crises de ansiedade e auto-cobrança implacável em relação a erros mínimos.",
    establishingOperations: "Metas de auditoria inflexíveis; fusão de responsabilidade pessoal com a saúde financeira de toda a empresa; privação crônica de sono.",
    neglectedNeeds: [
      EarlyNeed.Cuidado,
      EarlyNeed.Diversao,
      EarlyNeed.Responsabilidade,
      EarlyNeed.Conversacao
    ],
    activeSchemas: [
      SchemaEID.PadroesInflexiveis,
      SchemaEID.AutoSacrificio,
      SchemaEID.Subjugacao
    ],
    beliefs: {
      coreBeliefs: [
        "Se eu errar, sou incompetente e serei expulsa",
        "O valor das pessoas reside 100% no desempenho profissional",
        "Se eu não carregar o peso do mundo, tudo desaba"
      ],
      intermediateBeliefs: [
        "Eu preciso fazer tudo sozinha para garantir a perfeição",
        "Dizer não é sinônimo de egoísmo e incompetência",
        "Se alguém ficar frustrado comigo, a falha é totalmente minha"
      ],
      automaticThoughts: [
        "Tenho que resolver isso hoje, mesmo virando a noite",
        "Eles vão achar que sou preguiçosa se eu disser que estou cansada",
        "Não posso pedir ajuda, isso demonstra fraqueza catastrófica"
      ]
    },
    copingStyleSelected: CopingStyle.Rendicao,
    copingBehaviors: [
      "Assumir planilhas de terceiros para garantir que fiquem perfeitas",
      "Trabalhar mais de 12 horas diárias e abdicar de fins de semana",
      "Hesitar por dias antes de solicitar ajustes simples da sua equipe",
      "Auto-sabotagem do próprio lazer e saúde física em nome da reputação"
    ],
    periodization: [
      {
        id: "m_p1",
        skill: PsychologicalSkill.Autoconhecimento,
        title: "Fase 1: Identificação de Modos Críticos de Cobrança",
        durationWeeks: 2,
        phase: "Aquece",
        completed: true,
        priority: "Média",
        exercises: [
          { id: "m_e1", title: "Mapeamento do Crítico Interno Exagerado", completed: true, rewardXp: 120 },
          { id: "m_e2", title: "Ficha de Custo-Benefício do Perfeccionismo", completed: true, rewardXp: 180 }
        ]
      },
      {
        id: "m_p2",
        skill: PsychologicalSkill.AutorregulacaoEmocional,
        title: "Fase 2: Tolerância ao Desconforto e Limites Pessoais",
        durationWeeks: 3,
        phase: "Ativo",
        completed: false,
        priority: "Alta",
        exercises: [
          { id: "m_e3", title: "Exercício Prático de Deliberadamente adiar tarefa não-crítica", completed: false, rewardXp: 220 },
          { id: "m_e4", title: "Indução Vivencial: Cura do Eu Cobrado", completed: false, rewardXp: 300 }
        ]
      },
      {
        id: "m_p3",
        skill: PsychologicalSkill.ResolutividadeEnfrentamento,
        title: "Fase 3: Estabelecimento de Fronteiras e Delegação Assertiva",
        durationWeeks: 4,
        phase: "Ativo",
        completed: false,
        priority: "Alta",
        exercises: [
          { id: "m_e5", title: "Roteiro Assertivo para Dizer Não ao Diretor", completed: false, rewardXp: 250 },
          { id: "m_e6", title: "Delegação Gradual de Planilhas Sem Triplo Cheque", completed: false, rewardXp: 200 }
        ]
      }
    ],
    sessionHistory: [
      {
        id: "m_s1",
        date: "2026-05-20",
        evolutionSummary: "Sessão foca na identificação do esquema de auto-sacrifício e padrões inflexíveis. Mariana percebe como assume tarefas para evitar o medo profundo do descarte.",
        adherenceScore: 100,
        verbalCompetenceScore: 85,
        nonVerbalCompetenceScore: 70,
        clinicalObservations: "Paciente exibe facilidade de insights intelectuais, porém extrema dificuldade em expressar afeto ou pedir ajuda."
      }
    ],
    level: 1,
    xp: 300,
    streakDays: 2,
    unlockedBadges: [
      { id: "m_b1", title: "Autoconexão", description: "Concluiu a fase de mapeamento de cobranças internas", unlockedAt: "2026-05-20" }
    ]
  }
];

export const initialRIDs: RIDEntry[] = [
  {
    id: "rid-p-1",
    patientId: "pedro-30",
    date: "2026-05-14",
    context: "Reunião de alinhamento com o Diretor de Tecnologia e mais 6 engenheiros na sala central.",
    needs: "Queria defender a adoção da nova arquitetura de dados e receber o respeito técnico dos pares.",
    resThoughts: "Se eu errar esse detalhe, vão me achar uma farsa de engenheiro. Não sou bom nisso.",
    resEmotions: "Boca seca, taquicardia forte, tremedeira sutil nas mãos, rubor facial.",
    resActions: "Resumi demais minha fala, atropelando os argumentos. Deleguei a resposta das perguntas difíceis para o Lucas.",
    conImmediates: "Senti alívio imediato por sair do foco dos questionamentos.",
    conLongTerm: "Frustração extrema, sensação de fracasso contínuo e a arquitetura defasada continuou sendo adotada."
  },
  {
    id: "rid-m-1",
    patientId: "mariana-28",
    date: "2026-05-19",
    context: "Final do expediente, o diretor passa na mesa com uma pilha de relatórios financeiros não programados.",
    needs: "Queria ir para a academia cuidar do corpo e descansar. Sinto-me pressionada pelo olhar de desaprovação.",
    resThoughts: "Eu devo aceitar sem reclamar, senão vão pensar que não estou vestindo a camisa da empresa.",
    resEmotions: "Nó na garganta, fadiga extrema, irritabilidade guardada, dor tensional nos ombros.",
    resActions: "Sorri, aceitei a pilha enorme e trabalhei até às 22h, perdendo a sessão de autocuidado físico.",
    conImmediates: "Agradar o chefe e reter a imagem de profissional impecável.",
    conLongTerm: "Fadiga extrema no dia seguinte, as pessoas continuam explorando meu silêncio, ansiedade alta."
  }
];
