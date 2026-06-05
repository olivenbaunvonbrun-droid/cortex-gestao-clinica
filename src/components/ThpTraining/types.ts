/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum EarlyNeed {
  Atencao = "Atenção",
  Carinho = "Carinho",
  Admiracao = "Admiração",
  Vinculo = "Vínculo",
  Protecao = "Proteção",
  Cuidado = "Cuidado",
  Autonomia = "Autonomia",
  Sociabilidade = "Sociabilidade",
  Conversacao = "Conversação",
  Instrucao = "Instrução",
  Diversao = "Diversão",
  Responsabilidade = "Responsabilidade",
  Gregariedade = "Gregariedade",
  Identidade = "Identidade",
  Compreensao = "Compreensão"
}

export enum SchemaEID {
  Fracasso = "Fracasso",
  Abandono = "Abandono/Instabilidade",
  Desconfianca = "Desconfiança/Abuso",
  PrivacaoEmocional = "Privação Emocional",
  Defectividade = "Defectividade/Vergonha",
  IsolamentoSocial = "Isolamento Social/Alienação",
  Dependencia = "Dependência/Incompetência",
  Vulnerabilidade = "Vulnerabilidade a Danos ou Doenças",
  Emaranhamento = "Emaranhamento/Self Subdesenvolvido",
  Grandiosidade = "Grandiosidade/Arrogância",
  AutocontroleInsuficiente = "Autocontrole/Autodisciplina Insuficientes",
  Subjugacao = "Subjugação",
  AutoSacrificio = "Auto-sacrifício",
  BuscaAprovacao = "Busca de Aprovação/Reconhecimento",
  Negatividade = "Negatividade/Pessimismo",
  InibicaoEmocional = "Inibição Emocional",
  PadroesInflexiveis = "Padrões Inflexíveis/Crítica Exagerada",
  Punitividade = "Punitividade"
}

export enum CopingStyle {
  Rendicao = "Rendição (Ceder ao esquema)",
  Evitacao = "Evitação (Fugir ou esquivar-se)",
  Hipercompensacao = "Hipercompensação (Agir de forma contrária/arrogante)"
}

export enum PsychologicalSkill {
  Autoconhecimento = "Autoconhecimento",
  RealismoOtimista = "Realismo Otimista",
  Autocontrole = "Autocontrole",
  Sociabilidade = "Sociabilidade",
  ResolutividadeEnfrentamento = "Resolutividade e Enfrentamento",
  AutorregulacaoEmocional = "Autorregulação Emocional",
  HedonismoResponsavel = "Hedonismo Responsável",
  SensibilidadeSocial = "Sensibilidade Social",
  Autoestima = "Autoestima",
  ImunidadeSocial = "Imunidade Social"
}

export interface BeliefSystem {
  coreBeliefs: string[];            // Crenças Centrais (ex: "Sou um fracasso")
  intermediateBeliefs: string[];    // Crenças Intermediárias: regras, pressupostos (ex: "Se eu falhar...")
  automaticThoughts: string[];      // Pensamentos Automáticos frequentes
}

export interface TrainingPeriod {
  id: string;
  skill: PsychologicalSkill;
  title: string;
  durationWeeks: number;
  phase: "Aquece" | "Ativo" | "Consolidação";
  completed: boolean;
  priority: "Alta" | "Média" | "Baixa";
  exercises: {
    id: string;
    title: string;
    completed: boolean;
    rewardXp: number;
  }[];
}

export interface SessionLog {
  id: string;
  date: string;
  evolutionSummary: string;
  adherenceScore: number; // 1 to 100
  verbalCompetenceScore: number; // 1 to 100
  nonVerbalCompetenceScore: number; // 1 to 100
  clinicalObservations: string;
  hrvBaseline?: number; // in ms
  diaphragmaticEffectiveness?: number; // 1 to 100 %
  socraticRestructureScore?: number; // 1 to 100 %
  sleepWakeHygieneScore?: number; // 1 to 100 %
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  profession: string;
  clinicalQueixa: string;                     // Queixa Principal
  establishingOperations: string;            // Operações Estabelecedoras (contexto, estressores crônicos)
  neglectedNeeds: EarlyNeed[];               // Necessidades negligenciadas
  activeSchemas: SchemaEID[];                // Esquemas ativados
  beliefs: BeliefSystem;
  copingStyleSelected: CopingStyle;
  copingBehaviors: string[];                 // Comportamentos desadaptativos específicos
  periodization: TrainingPeriod[];           // Cronograma de Periodização
  sessionHistory: SessionLog[];              // Registros para o terapeuta
  level: number;
  xp: number;
  streakDays: number;
  unlockedBadges: {
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
  }[];
  activePrescriptions?: {
    id: string;
    drugName: string;
    dosage: string;
    frequency: string;
    startDate: string;
    status: "active" | "ceased";
  }[];
  sudLogs?: {
    date: string;
    sudValue: number;
    notes?: string;
  }[];
  scaleHistory?: {
    id: string;
    date: string;
    type: "BAI" | "BDI" | "COG_EF";
    score: number;
    classification: string;
    details?: any;
  }[];
}

export interface RIDEntry {
  id: string;
  patientId: string;
  date: string;
  context: string;                           // Situação/Contexto (Onde? Quando? Com quem?)
  needs: string;                             // Necessidades/Estressores (O que queria? O que pressionava?)
  resThoughts: string;                       // Resposta: Pensamentos
  resEmotions: string;                       // Resposta: Sentimentos/Emoções
  resActions: string;                        // Resposta: Ações/Comportamentos
  conImmediates: string;                     // Consequências Imediatas
  conLongTerm: string;                       // Consequências Longo Prazo
}
