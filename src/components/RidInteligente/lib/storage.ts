import { RidEntry, AppSettings } from '../types';
import { dbWrapper } from './ridDbWrapper';

export const storage = {
  async migrateFromLocalStorage() {
    // Shared DB, no local storage migration needed
  },

  getHistory: async (patientId?: string): Promise<RidEntry[]> => {
    return await dbWrapper.getHistory(patientId);
  },
  
  saveEntry: async (entry: RidEntry, patientId: string, userId?: string) => {
    console.log(`[Storage] Saving RID entry: ${entry.id} for patient ${patientId}`);
    await dbWrapper.saveEntry(entry, patientId, userId);
    return await dbWrapper.getHistory(patientId);
  },
  
  deleteEntry: async (id: string, patientId: string, userId?: string) => {
    console.log(`[Storage] Deleting RID entry: ${id} for patient ${patientId}`);
    await dbWrapper.deleteEntry(id, patientId, userId);
    return await dbWrapper.getHistory(patientId);
  },
  
  clearHistory: async () => {
    // Handled globally
  },
  
  getSettings: async (): Promise<AppSettings> => {
    return { 
      theme: 'dark', 
      fontSize: '14px',
      professionalName: '',
      professionalCRP: '',
      professionalSignature: '',
      professionalLogo: '',
      lgpdAccepted: true
    };
  },
  
  saveSettings: async (settings: AppSettings) => {
    // Handled globally
  },

  clearAllData: async () => {
    // Handled globally
  }
};
