export enum Frequency {
  NONE = 0,
  SLIGHTLY = 1,
  OFTEN = 2,
  VERY_OFTEN = 3,
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  [Frequency.NONE]: 'Nem um pouco (0)',
  [Frequency.SLIGHTLY]: 'Só um pouco (1)',
  [Frequency.OFTEN]: 'Bastante (2)',
  [Frequency.VERY_OFTEN]: 'Demais (3)',
};

export const FREQUENCY_TEXTS: Record<Frequency, string> = {
  [Frequency.NONE]: 'Nem um pouco',
  [Frequency.SLIGHTLY]: 'Só um pouco',
  [Frequency.OFTEN]: 'Bastante',
  [Frequency.VERY_OFTEN]: 'Demais',
};

export interface TdahQuestion {
  id: number;
  numberInPart: number;
  text: string;
  part: 'A' | 'B';
  partTitle: string;
  partCategory: 'Desatenção' | 'Hiperatividade-Impulsividade';
}

export interface PatientData {
  name: string;
  age: string;
  psychologistName: string;
  crp: string;
  signatureUrl?: string;
  logoUrl?: string;
}

export interface Assessment {
  id: string;
  patient: PatientData;
  answers: Record<number, Frequency>;
  aiAnalysis: string;
  createdAt: string;
}

export interface TdahSubscaleResult {
  name: string;
  part: 'A' | 'B';
  rawScore: number;
  maxScore: number;
  significantSymptoms: number; // Items with score >= 2 (Bastante ou Demais)
  thresholdMet: boolean; // >= 4 significant symptoms
  percentage: number;
  classification: string;
}

export interface TdahScoringResult {
  partA: TdahSubscaleResult;
  partB: TdahSubscaleResult;
  totalScore: number;
  maxTotalScore: number;
  totalSignificantSymptoms: number;
  classification: string;
  riskLevel: 'Alta Probabilidade' | 'Moderada' | 'Baixa Probabilidade';
  summaryText: string;
}

export const ASRS_QUESTIONS: TdahQuestion[] = [
  // PARTE A: DESATENÇÃO (Itens 1 a 9)
  {
    id: 1,
    numberInPart: 1,
    part: 'A',
    partTitle: 'Parte A - Desatenção',
    partCategory: 'Desatenção',
    text: 'Com que frequência você comete erros por falta de atenção quando tem de trabalhar num projeto chato ou difícil?'
  },
  {
    id: 2,
    numberInPart: 2,
    part: 'A',
    partTitle: 'Parte A - Desatenção',
    partCategory: 'Desatenção',
    text: 'Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho chato ou repetitivo?'
  },
  {
    id: 3,
    numberInPart: 3,
    part: 'A',
    partTitle: 'Parte A - Desatenção',
    partCategory: 'Desatenção',
    text: 'Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando elas estão falando diretamente com você?'
  },
  {
    id: 4,
    numberInPart: 4,
    part: 'A',
    partTitle: 'Parte A - Desatenção',
    partCategory: 'Desatenção',
    text: 'Com que frequência você deixa um projeto pela metade depois de já ter feito as partes mais difíceis?'
  },
  {
    id: 5,
    numberInPart: 5,
    part: 'A',
    partTitle: 'Parte A - Desatenção',
    partCategory: 'Desatenção',
    text: 'Com que frequência você tem dificuldade para fazer um trabalho que exige organização?'
  },
  {
    id: 6,
    numberInPart: 6,
    part: 'A',
    partTitle: 'Parte A - Desatenção',
    partCategory: 'Desatenção',
    text: 'Quando você precisa fazer algo que exige muita concentração, com que frequência você evita ou adia o início?'
  },
  {
    id: 7,
    numberInPart: 7,
    part: 'A',
    partTitle: 'Parte A - Desatenção',
    partCategory: 'Desatenção',
    text: 'Com que frequência você coloca as coisas fora do lugar ou tem dificuldade de encontrar as coisas em casa ou no trabalho?'
  },
  {
    id: 8,
    numberInPart: 8,
    part: 'A',
    partTitle: 'Parte A - Desatenção',
    partCategory: 'Desatenção',
    text: 'Com que frequência você se distrai com atividades ou barulho a sua volta?'
  },
  {
    id: 9,
    numberInPart: 9,
    part: 'A',
    partTitle: 'Parte A - Desatenção',
    partCategory: 'Desatenção',
    text: 'Com que frequência você tem dificuldade para lembrar de compromissos?'
  },

  // PARTE B: HIPERATIVIDADE / IMPULSIVIDADE (Itens 10 a 18)
  {
    id: 10,
    numberInPart: 1,
    part: 'B',
    partTitle: 'Parte B - Hiperatividade / Impulsividade',
    partCategory: 'Hiperatividade-Impulsividade',
    text: 'Com que frequência você fica se mexendo na cadeira ou balançando as mãos ou os pés quando precisa ficar sentado(a) por muito tempo?'
  },
  {
    id: 11,
    numberInPart: 2,
    part: 'B',
    partTitle: 'Parte B - Hiperatividade / Impulsividade',
    partCategory: 'Hiperatividade-Impulsividade',
    text: 'Com que frequência você se levanta da cadeira em reuniões ou em outras situações onde deveria ficar sentado(a)?'
  },
  {
    id: 12,
    numberInPart: 3,
    part: 'B',
    partTitle: 'Parte B - Hiperatividade / Impulsividade',
    partCategory: 'Hiperatividade-Impulsividade',
    text: 'Com que frequência você se sente inquieto(a) ou agitado(a)?'
  },
  {
    id: 13,
    numberInPart: 4,
    part: 'B',
    partTitle: 'Parte B - Hiperatividade / Impulsividade',
    partCategory: 'Hiperatividade-Impulsividade',
    text: 'Com que frequência você tem dificuldade para sossegar e relaxar quando tem tempo livre para você?'
  },
  {
    id: 14,
    numberInPart: 5,
    part: 'B',
    partTitle: 'Parte B - Hiperatividade / Impulsividade',
    partCategory: 'Hiperatividade-Impulsividade',
    text: 'Com que frequência você se sente ativo(a) demais e necessitando fazer coisas, como se estivesse "com um motor ligado"?'
  },
  {
    id: 15,
    numberInPart: 6,
    part: 'B',
    partTitle: 'Parte B - Hiperatividade / Impulsividade',
    partCategory: 'Hiperatividade-Impulsividade',
    text: 'Com que frequência você se pega falando demais em situações sociais?'
  },
  {
    id: 16,
    numberInPart: 7,
    part: 'B',
    partTitle: 'Parte B - Hiperatividade / Impulsividade',
    partCategory: 'Hiperatividade-Impulsividade',
    text: 'Quando você está conversando, com que frequência você se pega terminando as frases das pessoas antes delas?'
  },
  {
    id: 17,
    numberInPart: 8,
    part: 'B',
    partTitle: 'Parte B - Hiperatividade / Impulsividade',
    partCategory: 'Hiperatividade-Impulsividade',
    text: 'Com que frequência você tem dificuldade para esperar nas situações onde cada um tem a sua vez?'
  },
  {
    id: 18,
    numberInPart: 9,
    part: 'B',
    partTitle: 'Parte B - Hiperatividade / Impulsividade',
    partCategory: 'Hiperatividade-Impulsividade',
    text: 'Com que frequência você interrompe os outros quando eles estão ocupados?'
  }
];
