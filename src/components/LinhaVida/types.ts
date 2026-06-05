export interface LifeEvent {
  id: string;
  age: number;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  intensity: number; // 1 to 5
}

export interface PatientData {
  name: string;
  age: string;
  psychologistName: string;
  crp: string;
  logoUrl?: string;
  signatureUrl?: string;
}

export interface Assessment {
  id: string;
  patient: PatientData;
  events: LifeEvent[];
  aiAnalysis?: string;
  createdAt: string;
}
