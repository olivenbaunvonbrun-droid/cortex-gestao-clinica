import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db as firestore, handleFirestoreError, OperationType } from './firebase';
import { db as localDB } from './db';

// This service will help transition from Dexie to Firestore
// If a userId is a Firebase UID (checked by presence of firebase auth user), it uses Firestore.
// Otherwise it falls back to Dexie.

export const dataService = {
  // Patients
  getPatients: async (userId: string) => {
    try {
      if (userId.length > 20) { // Simple heuristic for Firebase UID vs numeric/short Dexie ID
        const q = query(collection(firestore, 'pacientes'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data() }));
      }
      return await localDB.pacientes.toArray();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'pacientes');
      return [];
    }
  },

  savePatient: async (userId: string, patient: any) => {
    try {
      if (userId.length > 20) {
        const patientData = { ...patient, userId };
        await setDoc(doc(firestore, 'pacientes', patient.id), patientData);
      } else {
        await localDB.pacientes.put(patient);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `pacientes/${patient.id}`);
    }
  },

  // Add more methods as needed for other collections...
};
