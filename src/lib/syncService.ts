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
        // Strip heavy base64 logo/signature to fit Firestore 1MB limits
        if ((key === 'logoUrl' || key === 'signatureUrl') && typeof obj[key] === 'string' && obj[key].startsWith('data:')) {
          continue;
        }
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

// TTL for tombstone records: 90 days in ms
const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

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

/**
 * Records a deletion tombstone locally (IndexedDB) so syncAll never
 * re-uploads this item if the local cache hasn't been cleaned yet.
 */
async function recordLocalTombstone(tableName: string, itemId: string) {
  try {
    await localDB.deletedIds.put({
      id: `${tableName}:${itemId}`,
      tableName,
      itemId,
      deletedAt: Date.now()
    });
  } catch (e) {
    console.error('[SyncService] Failed to record local tombstone:', e);
  }
}

/**
 * Records a deletion tombstone in Firestore `_deletions` collection so that
 * other devices' syncAll can learn about this deletion and clean their IndexedDB.
 */
async function recordCloudTombstone(userId: string, tableName: string, itemId: string) {
  if (!userId || userId.length < 10) return;
  try {
    const tombstoneId = `${userId}_${tableName}_${itemId}`;
    await setDoc(doc(firestore, '_deletions', tombstoneId), {
      userId,
      tableName,
      itemId,
      deletedAt: Date.now()
    });
  } catch (e) {
    console.error('[SyncService] Failed to record cloud tombstone:', e);
  }
}

async function recordCloudTombstoneBatch(userId: string, tableName: string, itemIds: string[]) {
  if (!userId || userId.length < 10 || itemIds.length === 0) return;
  try {
    for (let i = 0; i < itemIds.length; i += 400) {
      const chunk = itemIds.slice(i, i + 400);
      const batch = writeBatch(firestore);
      chunk.forEach(itemId => {
        const tombstoneId = `${userId}_${tableName}_${itemId}`;
        batch.set(doc(firestore, '_deletions', tombstoneId), {
          userId,
          tableName,
          itemId,
          deletedAt: Date.now()
        });
      });
      await batch.commit();
    }
  } catch (e) {
    console.error('[SyncService] Failed to record cloud tombstone batch:', e);
  }
}

/**
 * Prunes expired tombstone records from IndexedDB (older than 90 days).
 */
async function pruneExpiredTombstones() {
  try {
    const cutoff = Date.now() - TOMBSTONE_TTL_MS;
    await localDB.deletedIds.where('deletedAt').below(cutoff).delete();
  } catch (e) {
    // Non-critical, ignore
  }
}

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

      // --- STEP 0: Apply remote deletions first ---
      // Download all tombstones from Firestore for this user, apply to local DB,
      // so we don't re-upload items that were deleted on another device.
      try {
        const deletionsQuery = query(
          collection(firestore, '_deletions'),
          where('userId', '==', userId)
        );
        const deletionsSnapshot = await getDocs(deletionsQuery);

        if (!deletionsSnapshot.empty) {
          // Group by tableName for efficient local batch delete
          const remoteDeleteMap = new Map<string, string[]>();
          deletionsSnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.tableName && data.itemId) {
              const list = remoteDeleteMap.get(data.tableName) || [];
              list.push(data.itemId);
              remoteDeleteMap.set(data.tableName, list);
            }
          });

          for (const tableConfig of TABLES) {
            const idsToDelete = remoteDeleteMap.get(tableConfig.name);
            if (!idsToDelete || idsToDelete.length === 0) continue;

            for (const itemId of idsToDelete) {
              try {
                const key = tableConfig.name === 'prontuarios' ? itemId : itemId;
                if (tableConfig.name === 'prontuarios') {
                  await (tableConfig.localTable as any).delete(itemId);
                } else {
                  await (tableConfig.localTable as any).delete(itemId);
                }
                // Record local tombstone so we don't re-upload in this same sync
                await recordLocalTombstone(tableConfig.name, itemId);
              } catch (_) { /* item may not exist locally, safe to ignore */ }
            }
          }
        }
      } catch (e: any) {
        // _deletions may not yet exist or permission issue — non-fatal, continue sync
        console.warn('[SyncService] Could not apply remote deletions (non-fatal):', e?.message);
      }

      // --- STEP 1: Prune expired local tombstones ---
      await pruneExpiredTombstones();

      // --- STEP 2: Load all local tombstones into a Set for O(1) lookup ---
      const localTombstones = new Set<string>(); // "tableName:itemId"
      try {
        const allTombstones = await localDB.deletedIds.toArray();
        allTombstones.forEach(t => localTombstones.add(`${t.tableName}:${t.itemId}`));
      } catch (_) { /* ignore if table not ready */ }

      // --- STEP 3: Per-table bidirectional sync (with tombstone awareness) ---
      for (const tableConfig of TABLES) {
        const { name, localTable } = tableConfig;
        try {
          // Fetch remote items for this collection
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

          // Fetch local items
          const localItems = await localTable.toArray();
          const localItemsMap = new Map<string, any>();
          localItems.forEach(item => {
            const key = name === 'prontuarios' ? item.pacienteId : (name === 'settings' ? item.key : item.id);
            if (key) localItemsMap.set(String(key), item);
          });

          // Upload local-only or newer items to Cloud
          // SKIP items that have a local tombstone (they were deleted on this or another device)
          const itemsToUpload: any[] = [];
          for (const [key, localItem] of localItemsMap.entries()) {
            // Tombstone check: never re-upload a deleted item
            if (localTombstones.has(`${name}:${key}`)) {
              // Clean up local DB if the item still exists there (stale data)
              try { await (localTable as any).delete(key); } catch (_) {}
              continue;
            }

            const remoteItem = remoteItemsMap.get(key);
            if (!remoteItem) {
              // No tombstone + not in cloud → genuinely new local item, upload it
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

          // Download remote-only or newer items to Local DB
          // SKIP items that have a local tombstone (we deleted them, skip re-download)
          for (const [key, remoteItem] of remoteItemsMap.entries()) {
            if (localTombstones.has(`${name}:${key}`)) {
              // Item was deleted locally — remove from cloud too (deferred cleanup)
              // This handles the case where deletion cloud-write failed earlier
              try {
                await deleteDoc(doc(firestore, name, String(key)));
              } catch (_) {}
              continue;
            }

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

      const estimatedSize = JSON.stringify(itemToUpload).length;
      if (estimatedSize > 1048576) {
        console.warn(`[SyncService] Documento da tabela ${tableName} com ID ${key} excede 1MB (${estimatedSize} bytes). Sincronização em nuvem pulada.`);
        return;
      }

      await setDoc(doc(firestore, tableName, String(key)), itemToUpload);
    } catch (e) {
      console.error(`Erro ao salvar documento em tempo real no Cloud (${tableName}):`, e);
    }
  },

  removeFromCloud: async (userId: string, tableName: string, itemId: string) => {
    if (!userId || userId.length < 10) return;
    try {
      // Record tombstone BEFORE deleting, so even if the cloud delete fails,
      // the local tombstone prevents re-upload on next sync.
      await recordLocalTombstone(tableName, itemId);
      await recordCloudTombstone(userId, tableName, itemId);
      await deleteDoc(doc(firestore, tableName, itemId));
    } catch (e) {
      console.error(`Erro ao remover documento em tempo real no Cloud (${tableName}):`, e);
    }
  },

  saveToCloudBatch: async (userId: string, tableName: string, items: any[]) => {
    if (!userId || userId.length < 10 || items.length === 0) return;
    try {
      const chunkSize = tableName === 'anexos' ? 1 : 100;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        try {
          const batch = writeBatch(firestore);
          let hasOp = false;
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
              
              const estimatedSize = JSON.stringify(itemToUpload).length;
              if (estimatedSize > 1048576) {
                console.warn(`[SyncService] Documento da tabela ${tableName} com ID ${key} possui tamanho estimado de ${estimatedSize} bytes, excedendo o limite de 1MB do Firestore. Sincronização em nuvem pulada.`);
                return;
              }
              
              batch.set(doc(firestore, tableName, String(key)), itemToUpload);
              hasOp = true;
            }
          });
          if (hasOp) {
            await batch.commit();
          }
        } catch (e) {
          console.error(`Erro ao salvar lote de documentos na tabela (${tableName}) no intervalo [${i} - ${i + chunk.length}]:`, e);
        }
      }
    } catch (e) {
      console.error(`Erro ao processar saveToCloudBatch na tabela (${tableName}):`, e);
    }
  },

  deleteFromCloudBatch: async (userId: string, tableName: string, ids: string[]) => {
    if (!userId || userId.length < 10 || ids.length === 0) return;
    try {
      // Record tombstones for all IDs before batch deleting
      for (const id of ids) {
        await recordLocalTombstone(tableName, id);
      }
      await recordCloudTombstoneBatch(userId, tableName, ids);

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
