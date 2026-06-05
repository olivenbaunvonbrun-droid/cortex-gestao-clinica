export interface PatientData {
  name: string;
  age: string;
  psychologistName: string;
  crp: string;
  logoUrl?: string;
  signatureUrl?: string;
}

export interface ThpExercise {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;
}

export interface ThpSession {
  id: string;
  date: string;
  duration: number; // in minutes
  description: string;
  difficulty: number; // 1 (Very easy) to 5 (Very hard)
  achievements: string;
  obstacles: string;
  strategy: string;
}

export interface ThpRecord {
  id: string; // timestamp or uuid
  patient: PatientData;
  skillName: string;
  skillDescription: string;
  currentLevel: number; // 0 to 100
  targetLevel: number; // 0 to 100
  exercises: ThpExercise[];
  sessions: ThpSession[];
  aiAnalysis?: string;
  createdAt: string;
}
