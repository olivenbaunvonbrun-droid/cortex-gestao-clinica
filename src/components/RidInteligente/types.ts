/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Emotion {
  name: string;
  intensity: number;
}

export interface RidEntry {
  id: string;
  date: string;
  patientName?: string;
  patientAge?: string;
  situacao: string;
  necessidade: string[];
  esquema: string[];
  pensamento: string;
  emocao: Emotion;
  comportamento: string;
  consequenciasCurtoPrazo: string;
  consequenciasLongoPrazo: string;
  analysis?: string;
}

export type Theme = 'light' | 'dark';
export type FontSize = '14px' | '16px' | '18px';

export interface AppSettings {
  theme: Theme;
  fontSize: FontSize;
  professionalName?: string;
  professionalCRP?: string;
  professionalSignature?: string; // Base64 string
  professionalLogo?: string; // Base64 string
  geminiApiKey?: string; // Encrypted string
  lgpdAccepted?: boolean;
}
