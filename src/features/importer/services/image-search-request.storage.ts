import type { ImportImagePayload } from "../types/importer.type";

export type ImageSearchRequest = {
  payload: ImportImagePayload;
  activeJobId: string;
  retries: number;
  expiresAt: number;
};

const DATABASE = "iranmobix-image-search";
const STORE = "requests";
const TTL = 30 * 60 * 1000;

async function database(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return null;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImageSearchRequest(id: string, value: Omit<ImageSearchRequest, "expiresAt">) {
  const db = await database();
  if (!db) return;
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      const store = transaction.objectStore(STORE);
      // Remove expired uploads so old images do not accumulate.
      const cursor = store.openCursor();
      cursor.onsuccess = () => {
        const entry = cursor.result;
        if (!entry) return;
        if (entry.value.expiresAt <= Date.now()) entry.delete();
        entry.continue();
      };
      store.put({ ...value, expiresAt: Date.now() + TTL }, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function readImageSearchRequest(id: string): Promise<ImageSearchRequest | null> {
  const db = await database();
  if (!db) return null;
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).get(id);
      request.onsuccess = () => {
        const value = request.result as ImageSearchRequest | undefined;
        resolve(value && value.expiresAt > Date.now() ? value : null);
      };
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
