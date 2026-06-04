import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db as firestore, handleFirestoreError, OperationType } from './firebase';
import { db as localDB } from './db';

function cleanUndefinedFields(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => typeof item === 'object' ? cleanUndefinedFields(item) : item);
  }
  if (typeof obj === 'object') {
    if (obj.constructor !== Object && !Array.isArray(obj)) return obj;
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        newObj[key] = typeof obj[key] === 'object' ? cleanUndefinedFields(obj[key]) : obj[key];
      }
    }
    return newObj;
  }
  return obj;
}

const TABLES = [
  { name: 'pacientes', localTable: localDB.pacientes },
  { name: 'agendamentos', localTable: localDB.agendamentos },
  { name: 'prontuarios', localTable: localDB.prontuarios },
  { name: 'transacoes', localTable: localDB.transacoes },
  { name: 'settings', localTable: localDB.settings },
  { name: 'anexos', localTable: localDB.anexos }
];

export interface SyncState {
  status: 'idle' | 'syncing' | 'synced' | 'error';
  lastSync: Date | null;
  errorMessage: string | null;
}

let syncListeners: ((state: SyncState) => void)[] = [];
let currentSyncState: SyncState = {
  status: 'idle',
  lastSync: null,
  errorMessage: null
};

function updateSyncState(newState: Partial<SyncState>) {
  currentSyncState = { ...currentSyncState, ...newState };
  syncListeners.forEach(listener => listener(currentSyncState));
}

let isSyncInProgress = false;

const getLatestProntuarioTimestamp = (item: any) => {
  if (!item || !item.entradas || !Array.isArray(item.entradas) || item.entradas.length === 0) return 0;
  return Math.max(...item.entradas.map((e: any) => e.timestamp || 0));
};

export const syncService = {
  getSyncState: () => currentSyncState,

  subscribe: (listener: (state: SyncState) => void) => {
    syncListeners.push(listener);
    listener(currentSyncState);
    return () => {
      syncListeners = syncListeners.filter(l => l !== listener);
    };
  },

  syncAll: async (userId: string) => {
    if (!userId || isSyncInProgress) return;
    isSyncInProgress = true;
    updateSyncState({ status: 'syncing', errorMessage: null });

    try {
      console.log('Iniciando sincronização para usuário:', userId);

      for (const tableConfig of TABLES) {
        const { name, localTable } = tableConfig;
        try {
          // 1. Fetch remote items for this collection
          const q = query(collection(firestore, name), where('userId', '==', userId));
          let remoteSnapshot;
          try {
            remoteSnapshot = await getDocs(q);
          } catch (e: any) {
            if (e?.code === 'permission-denied' || e?.message?.includes('permissions')) {
              handleFirestoreError(e, OperationType.LIST, name);
            }
            throw e;
          }
          const remoteItemsMap = new Map<string, any>();
          
          remoteSnapshot.forEach(docSnap => {
            remoteItemsMap.set(docSnap.id, docSnap.data());
          });

          // 2. Fetch local items
          const localItems = await localTable.toArray();
          const localItemsMap = new Map<string, any>();
          localItems.forEach(item => {
            const key = name === 'prontuarios' ? item.pacienteId : (name === 'settings' ? item.key : item.id);
            if (key) localItemsMap.set(String(key), item);
          });

          // 3. Upload local-only or newer items to Cloud
          const itemsToUpload: any[] = [];
          for (const [key, localItem] of localItemsMap.entries()) {
            const remoteItem = remoteItemsMap.get(key);
            if (!remoteItem) {
              itemsToUpload.push(localItem);
            } else if (name === 'prontuarios') {
              const localMax = getLatestProntuarioTimestamp(localItem);
              const remoteMax = getLatestProntuarioTimestamp(remoteItem);
              if (localMax > remoteMax) {
                itemsToUpload.push(localItem);
              }
            }
          }
          if (itemsToUpload.length > 0) {
            try {
              await syncService.saveToCloudBatch(userId, name, itemsToUpload);
            } catch (e: any) {
              if (e?.code === 'permission-denied' || e?.message?.includes('permissions')) {
                handleFirestoreError(e, OperationType.WRITE, name);
              }
              throw e;
            }
          }

          // 4. Download remote-only or newer items to Local DB
          for (const [key, remoteItem] of remoteItemsMap.entries()) {
            const localItem = localItemsMap.get(key);
            
            if (!localItem) {
              await localTable.put(remoteItem);
            } else if (name === 'prontuarios') {
              const localMax = getLatestProntuarioTimestamp(localItem);
              const remoteMax = getLatestProntuarioTimestamp(remoteItem);
              if (remoteMax > localMax) {
                await localTable.put(remoteItem);
              }
            }
          }
        } catch (tableError: any) {
          console.error(`Erro ao sincronizar tabela ${name}:`, tableError);
          throw new Error(`Erro na tabela ${name}: ${tableError.message}`);
        }
      }

      updateSyncState({ 
        status: 'synced', 
        lastSync: new Date(), 
        errorMessage: null 
      });
      console.log('Sincronização concluída com sucesso!');
    } catch (error: any) {
      console.error('Erro de sincronização:', error);
      updateSyncState({ 
        status: 'error', 
        errorMessage: error.message || 'Falha ao sincronizar dados na nuvem.' 
      });
    } finally {
      isSyncInProgress = false;
    }
  },

  // Direct helper to push a document to firestore
  saveToCloud: async (userId: string, tableName: string, item: any) => {
    if (!userId || userId.length < 10) return;
    try {
      const key = tableName === 'prontuarios' ? item.pacienteId : (tableName === 'settings' ? item.key : item.id);
      if (!key) return;
      
      const itemToUpload = cleanUndefinedFields({ 
        ...item, 
        userId,
        id: item.id ? String(item.id) : undefined,
        pacienteId: item.pacienteId ? String(item.pacienteId) : undefined,
        ownerId: item.ownerId ? String(item.ownerId) : undefined
      });
      await setDoc(doc(firestore, tableName, String(key)), itemToUpload);
    } catch (e) {
      console.error(`Erro ao salvar documento em tempo real no Cloud (${tableName}):`, e);
    }
  },

  removeFromCloud: async (userId: string, tableName: string, itemId: string) => {
    if (!userId || userId.length < 10) return;
    try {
      await deleteDoc(doc(firestore, tableName, itemId));
    } catch (e) {
      console.error(`Erro ao remover documento em tempo real no Cloud (${tableName}):`, e);
    }
  },

  saveToCloudBatch: async (userId: string, tableName: string, items: any[]) => {
    if (!userId || userId.length < 10 || items.length === 0) return;
    try {
      for (let i = 0; i < items.length; i += 400) {
        const chunk = items.slice(i, i + 400);
        const batch = writeBatch(firestore);
        chunk.forEach(item => {
          const key = tableName === 'prontuarios' ? item.pacienteId : (tableName === 'settings' ? item.key : item.id);
          if (key) {
            const itemToUpload = cleanUndefinedFields({ 
              ...item, 
              userId,
              id: item.id ? String(item.id) : undefined,
              pacienteId: item.pacienteId ? String(item.pacienteId) : undefined,
              ownerId: item.ownerId ? String(item.ownerId) : undefined
            });
            batch.set(doc(firestore, tableName, String(key)), itemToUpload);
          }
        });
        await batch.commit();
      }
    } catch (e) {
      console.error(`Erro ao salvar documentos em lote no Cloud (${tableName}):`, e);
    }
  },

  deleteFromCloudBatch: async (userId: string, tableName: string, ids: string[]) => {
    if (!userId || userId.length < 10 || ids.length === 0) return;
    try {
      for (let i = 0; i < ids.length; i += 400) {
        const chunk = ids.slice(i, i + 400);
        const batch = writeBatch(firestore);
        chunk.forEach(id => {
          batch.delete(doc(firestore, tableName, String(id)));
        });
        await batch.commit();
      }
    } catch (e) {
      console.error(`Erro ao remover documentos em lote no Cloud (${tableName}):`, e);
    }
  }
};
