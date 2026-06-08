export interface Tool {
  id: string;
  code: string; // e.g. "F1", "F2"
  title: string;
  description: string;
  category: ToolCategory;
  duration: string; // e.g. "10-15 min"
  targetGroup: string; // e.g. "Adultos", "Crianças", "Idosos"
  skillsEvaluated: string[];
  status: 'ready' | 'pending';
  icon: string; // Lucide icon name
  scoringInfo: string;
}

export type ToolCategory = 
  | 'felicidade'
  | 'autoconhecimento'
  | 'autoestima'
  | 'racio_real_otimista'
  | 'resolut_enfrent'
  | 'imunidade_social'
  | 'autocontrole'
  | 'mentalidades';

export interface Report {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  toolId: string;
  toolTitle: string;
  evaluationDate: string;
  rawAnswers: Record<string, any>;
  calculatedScores: {
    score: number;
    classification: string;
    subscales?: Record<string, number>;
  };
  aiReportText?: string;
  createdAt: string;
}

export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  clinicalContext?: string;
}

export interface PmeState {
  profissional: string;
  crp: string;
  dataInicio: string;
  esquemaPrincipal: string;
  origemTraumatica: string;
  fase1: { text: string; done: boolean };
  fase2: { text: string; done: boolean };
  fase3: { text: string; done: boolean };
  fase4: { text: string; done: boolean };
  fase5: { text: string; done: boolean };
  fase6: { text: string; done: boolean };
  fase7: { text: string; done: boolean };
  fase8: { text: string; done: boolean };
  
  // Replicated PDP elements
  pdpHp: string;
  pdpFase1: {
    nocoes_iniciais: { text: string; done: boolean };
    valores_relacionados: { text: string; done: boolean };
    beneficios_hp: { text: string; done: boolean };
    impactos_deficit: { text: string; done: boolean };
    ganhos_atual_padrao: { text: string; done: boolean };
  };
  pdpFase2: {
    investigacao_reestruturacao: { text: string; done: boolean };
  };
  pdpFase3: {
    leitura_selecao_reflexao: { text: string; done: boolean };
  };
  pdpFase4: Array<{ id: number; text: string; done: boolean }>;
  pdpFase5: Array<{ id: number; text: string; done: boolean }>;
}
