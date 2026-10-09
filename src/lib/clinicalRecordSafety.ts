/** Deterministic safeguards: generated interpretations are never source evidence. */
export const NOT_REPORTED = '<p>Não relatado na sessão.</p>';
export function escapeClinicalText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function transcriptToHtml(value: string): string {
  return `<div style="white-space: pre-wrap;">${escapeClinicalText(value)}</div>`;
}
export function transcriptText(value: string): string {
  if (!/<(?:p|div|br|strong|span|ul|li)(?:\s|>)/i.test(value)) return value.trim();
  return value.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}
export function isLegacyGeneratedReport(value: string): boolean {
  return /rid-sintese-analitica|clinical-synthesis|Formulação (?:e Síntese |Clínica|Funcional)|PARTE A:/i.test(value);
}
export function normalizeProgress(value?: string): string {
  const options = ['Excelente', 'Satisfatório', 'Em desenvolvimento', 'Necessita de ajuste'];
  return options.includes(value?.trim() || '') ? value!.trim() : '';
}
// Only speaker labels may change. Words, order and existing annotations must survive.
export function preservesTranscript(original: string, candidate: string): boolean {
  const canonical = (value: string) => transcriptText(value)
    .replace(/^(?:Psi|P|Terapeuta|Paciente|Speaker\s*\d+|Locutor\s*\d+)(?:\s*\([^)]*\))?\s*:\s*/gim, '')
    .replace(/\s+/g, ' ').trim();
  return canonical(original) === canonical(candidate);
}

export const VALID_ENTRY_TYPES = [
  'evolucao',
  'agendamento',
  'arquivo',
  'sistema',
  'rid',
  'pci',
  'ysq',
  'ihs',
  'dfc',
  'psidiagnostic',
  'psicometrik',
  'registro_atendimento',
  'linha_vida',
  'ihp_pr',
  'thp',
  'tdah',
  'tdah-ecosystem'
] as const;

export type KnownClinicalEntryType = typeof VALID_ENTRY_TYPES[number];

export function isValidMedicalRecordEntryType(value: unknown): value is KnownClinicalEntryType {
  return typeof value === 'string' && (VALID_ENTRY_TYPES as readonly string[]).includes(value);
}

export interface InspectedRecordEntryType {
  rawTipo: string;
  isRecognized: boolean;
  effectiveTipo: KnownClinicalEntryType | 'incompativel';
  warning?: string;
}

export function inspectMedicalRecordEntryType(value: unknown): InspectedRecordEntryType {
  const rawTipo = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
  if (isValidMedicalRecordEntryType(rawTipo)) {
    return {
      rawTipo,
      isRecognized: true,
      effectiveTipo: rawTipo
    };
  }
  return {
    rawTipo,
    isRecognized: false,
    effectiveTipo: 'incompativel',
    warning: `Tipo de registro não reconhecido: "${rawTipo}". O dado foi preservado integralmente sem conversão forçada.`
  };
}

/**
 * Valida ou sinaliza tipo de registro clínico.
 * NUNCA altera silenciosamente um tipo desconhecido para "evolucao".
 * Preserva o dado original bruto e sinaliza incompatibilidade.
 */
export function sanitizeMedicalRecordEntryType(value: unknown): KnownClinicalEntryType | string {
  const inspection = inspectMedicalRecordEntryType(value);
  if (inspection.isRecognized) {
    return inspection.effectiveTipo as KnownClinicalEntryType;
  }
  console.warn(`[Cortex Safety] ${inspection.warning}`);
  return inspection.rawTipo || 'incompativel';
}

