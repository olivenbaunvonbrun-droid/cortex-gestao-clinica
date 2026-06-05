export interface PatientData {
  name: string;
  age: string;
  psychologistName: string;
  crp: string;
  logoUrl?: string;
  signatureUrl?: string;
}

export interface DiagnosticRecord {
  id: string;
  patient: PatientData;
  hasProntuarioData: boolean;
  uploadedFilesCount: number;
  aiAnalysis?: string;
  createdAt: string;
}
