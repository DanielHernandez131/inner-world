import type { AdventureSession } from '../../features/adventure/model';
import type { ExplorationRequest } from '../contracts/exploration-request';
import type { ExplorationResponse } from '../contracts/exploration-response';
import type { EmotionalAnalysis } from '../contracts/generated';

export interface Draft {
  schemaVersion: 1;
  request: ExplorationRequest;
  response: ExplorationResponse | null;
  reviewed?: EmotionalAnalysis;
  answerText?: string;
}
export interface Experience {
  id: string;
  confirmedAt: string;
  draft: Draft;
  analysis: EmotionalAnalysis;
  adventure?: AdventureSession;
}

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('inner-world', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('drafts');
      request.result.createObjectStore('experiences', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('No se pudo abrir el almacenamiento local.'));
    request.onblocked = () =>
      reject(new Error('Cierra otras pestañas para abrir el almacenamiento.'));
  });
}
async function transact<T>(
  stores: string[],
  mode: IDBTransactionMode,
  run: (tx: IDBTransaction) => IDBRequest<T>,
): Promise<T> {
  const db = await database();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(stores, mode);
      const request = run(tx);
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = tx.onerror = () =>
        reject(new Error('No se pudo guardar o leer en este navegador. Tu mapa no ha cambiado.'));
    });
  } finally {
    db.close();
  }
}
export const repository = {
  async getDraft(): Promise<Draft | null> {
    const draft: Draft | undefined = await transact(['drafts'], 'readonly', (tx) =>
      tx.objectStore('drafts').get('current'),
    );
    if (draft && draft.schemaVersion !== 1)
      throw new Error('El borrador usa otra versión. No se sobrescribirá.');
    return draft ?? null;
  },
  saveDraft(draft: Draft) {
    return transact(['drafts'], 'readwrite', (tx) =>
      tx.objectStore('drafts').put(draft, 'current'),
    );
  },
  listExperiences(): Promise<Experience[]> {
    return transact(['experiences'], 'readonly', (tx) => tx.objectStore('experiences').getAll());
  },
  confirmExperience(experience: Experience) {
    return transact(['experiences', 'drafts'], 'readwrite', (tx) => {
      tx.objectStore('drafts').delete('current');
      return tx.objectStore('experiences').put(experience);
    });
  },
  saveAdventure(id: string, adventure: AdventureSession) {
    return transact(['experiences'], 'readwrite', (tx) => {
      const store = tx.objectStore('experiences');
      const request: IDBRequest<Experience | undefined> = store.get(id);
      request.onsuccess = () => {
        const experience = request.result;
        if (
          !experience ||
          adventure.experienceId !== id ||
          (experience.adventure && experience.adventure.schemaVersion !== 1)
        ) {
          tx.abort();
          return;
        }
        store.put({ ...experience, adventure });
      };
      return request;
    });
  },
  deleteExperience(id: string) {
    return transact(['experiences'], 'readwrite', (tx) => tx.objectStore('experiences').delete(id));
  },
};
