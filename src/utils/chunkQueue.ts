// IndexedDB queue for video chunks
// Сохраняем чанки если отправка не удалась и пытаемся отправить позже

const DB_NAME = 'VideoChunksDB';
const STORE_NAME = 'chunks';
const DB_VERSION = 1;

export interface QueuedChunk {
  id: string;
  chunkNumber: number;
  cameraType: 'front' | 'back' | 'desktop';
  blob: Blob;
  geoData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null;
  timestamp: number;
  retryCount: number;
}

// Open IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('✅ [Queue] IndexedDB store created');
      }
    };
  });
};

// Add chunk to queue
export const addChunkToQueue = async (chunk: Omit<QueuedChunk, 'id' | 'timestamp' | 'retryCount'>): Promise<void> => {
  try {
    const db = await openDB();
    
    const queuedChunk: QueuedChunk = {
      ...chunk,
      id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(queuedChunk);
      request.onsuccess = () => {
        console.log(`💾 [Queue] Chunk #${chunk.chunkNumber} saved to IndexedDB`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.error('❌ [Queue] Error adding chunk to queue:', error);
  }
};

// Get all chunks from queue
export const getQueuedChunks = async (): Promise<QueuedChunk[]> => {
  try {
    const db = await openDB();
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    
    const chunks = await new Promise<QueuedChunk[]>((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return chunks;
  } catch (error) {
    console.error('❌ [Queue] Error getting queued chunks:', error);
    return [];
  }
};

// Remove chunk from queue
export const removeChunkFromQueue = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        console.log(`🗑️ [Queue] Chunk ${id} removed from IndexedDB`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.error('❌ [Queue] Error removing chunk from queue:', error);
  }
};

// Update retry count
export const incrementRetryCount = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const chunk = await new Promise<QueuedChunk>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (chunk) {
      chunk.retryCount++;
      await new Promise<void>((resolve, reject) => {
        const request = store.put(chunk);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    db.close();
  } catch (error) {
    console.error('❌ [Queue] Error incrementing retry count:', error);
  }
};

// Get queue size
export const getQueueSize = async (): Promise<number> => {
  try {
    const db = await openDB();
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const count = await new Promise<number>((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    return count;
  } catch (error) {
    console.error('❌ [Queue] Error getting queue size:', error);
    return 0;
  }
};

// Clear old chunks (older than 24 hours)
export const clearOldChunks = async (): Promise<void> => {
  try {
    const db = await openDB();
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    
    const chunks = await new Promise<QueuedChunk[]>((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const chunk of chunks) {
      if (chunk.timestamp < cutoffTime) {
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(chunk.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
    
    db.close();
    console.log(`🧹 [Queue] Cleared ${chunks.filter(c => c.timestamp < cutoffTime).length} old chunks`);
  } catch (error) {
    console.error('❌ [Queue] Error clearing old chunks:', error);
  }
};
