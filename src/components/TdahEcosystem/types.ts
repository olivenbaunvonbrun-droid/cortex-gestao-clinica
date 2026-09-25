export type EvaluationStage = 
  | 'overview'
  | 'asrs18'
  | 'anamnese'
  | 'etdah'
  | 'epf'
  | 'bdefs'
  | 'heterorrelato'
  | 'diferenciais'
  | 'laudo';

export type StageStatus = 'pending' | 'in_progress' | 'completed';

export interface PatientInfo {
  id: string;
  name: string;
  age: string;
  birthDate?: string;
  gender?: string;
  education?: string;
  profession?: string;
  maritalStatus?: string;
  phone?: string;
  psychologistName: string;
  crp: string;
}

// ----------------------------------------
// FASE 1: ASRS-18
// ----------------------------------------
export interface AsrsData {
  answers: Record<number, number>;
  partAScore: number;
  partBScore: number;
  partASignificant: number;
  partBSignificant: number;
  thresholdMetA: boolean;
  classification: string;
  completedAt?: string;
}

// ----------------------------------------
// FASE 2: ANAMNESE RETROSPECTIVA
// ----------------------------------------
export interface AnamneseData {
  queixaPrincipal: string;
  impactoVidaDiaria: string;
  marcosDesenvolvimento: {
    idadeAndar: string;
    idadeFalar: string;
    idadeLer: string;
    desempenhoAcademicoInfancia: string;
    comportamentoEscola: string;
    problemasComportamentoInfanciaAdolescencia: string;
    repetenciaOuAdvertencias: string;
    esforcoCompensatorioOuApoioFamiliar: string;
  };
  historiaFamiliar: {
    temHistoricoFamiliar: boolean;
    parentesAfetados: string;
    detalhes: string;
  };
  historicoMedicoPsiquiatrico: {
    problemasMedicosInfancia: string;
    diagnosticosAnteriores: string;
    usoMedicacaoPsicotropica: string;
    tempoMedicacao: string;
    historicoSono: string;
    historicoSubstancias: string;
  };
  sintomasNuclearesAtuais: {
    focoEsforcoMental: string;
    organizacaoTarefas: string;
    seguirInstrucoes: string;
    lembrarDetalhes: string;
    procrastinacao: string;
    interrupcaoFala: string;
    inquietudeAgitacao: string;
  };
  tratamentosAnteriores: {
    fezTratamentoTdah: boolean;
    qualTratamentoETempo: string;
    houveMelhora: string;
  };
  expectativasTratamento: string;
  completedAt?: string;
}

// ----------------------------------------
// FASE 3: ETDAH-AD (69 itens)
// ----------------------------------------
export interface EtdahQuestion {
  id: number;
  text: string;
  factor: 1 | 2 | 3 | 4 | 5;
  factorName: string;
  isInverted?: boolean;
}

export interface EtdahFactorResult {
  factor: number;
  name: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  level: 'Inferior' | 'Médio Inferior' | 'Médio' | 'Médio Superior' | 'Superior';
  interpretation: string;
}

export interface EtdahData {
  answers: Record<number, number>; // 0 to 5
  factors: Record<number, EtdahFactorResult>;
  totalScore: number;
  maxTotalScore: number;
  overallClassification: string;
  completedAt?: string;
}

// ----------------------------------------
// FASE 4: EPF-TDAH (58 itens)
// ----------------------------------------
export interface EpfQuestion {
  id: number;
  domainId: number;
  domainName: string;
  text: string;
}

export interface EpfDomainResult {
  domainId: number;
  name: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  significantImpairments: number; // itens >= 2 (Algumas vezes ou mais)
  hasSignificantImpairment: boolean;
  level: 'Sem Prejuízo' | 'Leve' | 'Moderado' | 'Grave';
}

export interface EpfData {
  answers: Record<number, number>; // 0 to 4 (0: NA/Nunca, 1: Raramente, 2: Algumas vezes, 3: Muitas vezes, 4: Sempre)
  domains: Record<number, EpfDomainResult>;
  totalScore: number;
  affectedDomainsCount: number; // Domínios com prejuízo significativo
  meetsDsmMultipleContexts: boolean; // >= 2 contextos com prejuízo
  overallLevel: 'Mínimo' | 'Leve' | 'Moderado' | 'Grave' | 'Severo';
  completedAt?: string;
}

// ----------------------------------------
// FASE 5: BDEFS (89 itens)
// ----------------------------------------
export interface BdefsQuestion {
  id: number;
  sectionId: number;
  sectionName: string;
  text: string;
  isAdhdEfIndexItem?: boolean;
}

export interface BdefsSectionResult {
  sectionId: number;
  name: string;
  rawScore: number;
  itemsCount: number;
  averageScore: number;
  symptomsCount: number; // Itens pontuados com 3 ou 4
  level: 'Normal' | 'Limítrofe' | 'Disfunção Moderada' | 'Disfunção Grave';
}

export interface BdefsData {
  answers: Record<number, number>; // 1 to 4
  sections: Record<number, BdefsSectionResult>;
  totalScore: number; // Total seções 1 a 5
  totalSymptoms: number; // Itens pontuados com 3 ou 4
  adhdEfIndexScore: number; // Soma dos 11 itens chave (1, 6, 14, 16, 24, 49, 50, 55, 60, 65, 69)
  adhdEfIndexSymptoms: number;
  adhdEfIndexRisk: 'Baixo Risco' | 'Risco Moderado' | 'Alto Risco de TDAH';
  overallLevel: 'Funcionamento Típico' | 'Disfunção Executiva Leve' | 'Disfunção Executiva Moderada' | 'Disfunção Executiva Severa';
  completedAt?: string;
}

// ----------------------------------------
// FASE 6: HETERORRELATO
// ----------------------------------------
export interface HeterorrelatoData {
  respondenteNome: string;
  grauParentesco: 'Cônjuge/Parceiro(a)' | 'Mãe/Pai' | 'Irmão/Irmã' | 'Amigo(a) Próximo' | 'Colega de Trabalho' | 'Outro';
  tempoConvivio: string;
  conviveuNaInfancia: boolean;
  observacoesInfancia: string;
  percepcaoDesatencao: string;
  percepcaoHiperatividadeImpulsividade: string;
  percepcaoDisfuncaoExecutiva: string;
  impactoRelacionamentoRotina: string;
  concordanciaGeralComAutorrelato: 'Alta Convergência' | 'Convergência Parcial' | 'Divergência Notável';
  notasClinicasConfronto: string;
  completedAt?: string;
}

// ----------------------------------------
// FASE 7: DIAGNÓSTICOS DIFERENCIAIS
// ----------------------------------------
export interface DifferentialItem {
  id: string;
  title: string;
  description: string;
  symptomOverlap: string;
  distinguishingFeatures: string;
  status: 'descartado' | 'comorbidade_provavel' | 'investigacao_adicional_necessaria' | 'nao_avaliado';
  notes: string;
}

export interface DiferenciaisData {
  items: Record<string, DifferentialItem>;
  padraoTemporal: {
    inicioInfanciaConfirmado: boolean;
    flutuacaoConformeInteresse: boolean; // Varia conforme novidade/interesse (típico de TDAH)
    independenteDeFaseHumor: boolean; // Persiste mesmo eutímico
    impactoEmMultiplosContextos: boolean;
  };
  condicoesFisicasInvestigadas: string; // Exames tireoide, sono/polissonografia, vitaminas
  conclusaoDiferencial: string;
  completedAt?: string;
}

// ----------------------------------------
// FASE 8: LAUDO INTEGRATIVO
// ----------------------------------------
export interface LaudoTdahIntegrativo {
  identificacao: {
    nome: string;
    idade: string;
    nascimento: string;
    documento: string;
    escolaridade: string;
    profissao: string;
    solicitante: string;
    finalidade: string;
    dataAvaliacao: string;
    psicologo: string;
    crp: string;
  };
  descricaoDemanda: string;
  procedimentosUtilizados: string[];
  analiseSintomatologica: string;
  analisePrejuizoFuncional: string;
  analiseFuncoesExecutivas: string;
  triangulacaoHeterorrelato: string;
  diagnosticosDiferenciaisEComorbidades: string;
  criteriosDsm5Fulfillment: {
    desatencaoMet: boolean; // >= 5 sintomas
    hiperatividadeMet: boolean; // >= 5 sintomas
    inicioAntes12: boolean;
    multiplosContextos: boolean; // >= 2 contextos
    prejuizoFuncionalSignificativo: boolean;
    exclusaoOutrasCausas: boolean;
    apresentacaoSugerida: 'Combinada' | 'Predominantemente Desatenta' | 'Predominantemente Hiperativa/Impulsiva' | 'Inconclusiva / Não sustenta TDAH';
  };
  conclusaoDiagnostica: string;
  encaminhamentosEOrientacoes: string[];
  aiAssistedSynthesis?: string;
  completedAt?: string;
}

// ----------------------------------------
// ECOSSISTEMA COMPLETO DO PACIENTE
// ----------------------------------------
export interface TdahEcosystemAssessment {
  id: string;
  patientId: string;
  patientInfo: PatientInfo;
  createdAt: string;
  updatedAt: string;
  currentStage: EvaluationStage;
  stageStatuses: Record<EvaluationStage, StageStatus>;
  asrsData?: AsrsData;
  anamneseData?: AnamneseData;
  etdahData?: EtdahData;
  epfData?: EpfData;
  bdefsData?: BdefsData;
  heterorrelatoData?: HeterorrelatoData;
  diferenciaisData?: DiferenciaisData;
  laudoData?: LaudoTdahIntegrativo;
}
