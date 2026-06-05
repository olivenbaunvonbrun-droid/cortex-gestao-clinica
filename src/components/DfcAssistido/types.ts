export interface PatientData {
  name: string;
  age: string;
  psychologistName: string;
  crp: string;
  logoUrl?: string;
  signatureUrl?: string;
}

export interface DfcSituation {
  situation: string;
  automaticThought: string;
  meaning: string;
  emotion: string;
  behavior: string;
}

export interface DfcRecord {
  id: string;
  patient: PatientData;
  relevantChildhoodData: string;
  coreBeliefs: string;
  conditionalRules: string;
  compensatoryStrategies: string;
  situations: DfcSituation[];
  aiAnalysis?: string;
  createdAt: string;
}
