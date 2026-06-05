export interface PatientData {
  name: string;
  age: string;
  psychologistName: string;
  crp: string;
  logoUrl?: string;
  signatureUrl?: string;
}

export type PciPhase = 'triagem' | 'intervencao' | 'alta' | 'recaida';

export interface PciRecord {
  id: string;
  date: string;
  createdAt: string;
  patient: PatientData;
  approach: string;
  phase: PciPhase;

  // Clinical Fields (Fidelity to original PCI)
  idade: string;
  escolaridade: string;
  estadoCivil: string;
  familiaOrigem: string;
  rotina: string;
  eventoQueixas: string;

  // Análise Funcional (RID) Split
  ridSituacao: string;
  ridPensamento: string;
  ridEmocao: string;
  ridEmocaoIntensidade: number;
  ridComportamento: string;
  ridConsequencias: string;
  ridConsequenciasLP: string;

  // IMF Satisfaction
  satisfacaoPessoal: number;
  satisfacaoInterpessoal: number;
  satisfacaoOcupacional: number;
  satisfacaoMaterial: number;
  satisfacaoRecreativa: number;
  satisfacaoExistencial: number;

  // Deep Analysis
  necessidadesIdentificadas: string;
  esquemasCognitivos: string;
  crencasCentrais: string;
  crencasPerifericas: string;
  excessosComp: string;
  deficitsHab: string;
  historicoFormativo: string;
  instrumentos: string;
  diagTopo: string;
  diagFunc: string;
  projetoTerap: string;
  relacionamentoTerap: string;
  evolucao: string;

  // AI Results
  aiAnalysis?: string;
}
