export interface PatientData {
  name: string;
  age: string;
  psychologistName: string;
  crp: string;
  logoUrl?: string;
  signatureUrl?: string;
}

export type AttendanceTemplateType = 'soap' | 'evolution' | 'screening' | 'completo';

export interface AttendanceRecord {
  id: string;
  patient: PatientData;
  template: AttendanceTemplateType;
  fields: Record<string, string>;
  aiAnalysis?: string;
  createdAt: string;
}
