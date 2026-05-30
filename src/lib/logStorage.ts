/**
 * IndexedDB storage wrapper for .log format
 * Database: sentinelscan_logs
 * Object stores: access_log, error_log
 */

const DB_NAME = 'sentinelscan_logs';
const DB_VERSION = 1;
const STORES = ['access_log', 'error_log'] as const;

export class LogStorage {
  private db: IDBDatabase | null = null;

  /**
   * Initialize the database and create object stores if needed
   */
  initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is not supported in this browser'));
        return;
      }

      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        STORES.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { autoIncrement: true });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * Get the database instance, initializing if needed
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    return this.initDB();
  }

  /**
   * Add a log line to the specified store
   * Handles QuotaExceededError by deleting oldest 20% and retrying
   */
  async appendLog(storeName: typeof STORES[number], text: string): Promise<void> {
    const doAppend = async (): Promise<void> => {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        const request = store.add(text);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          if (error?.name === 'QuotaExceededError') {
            reject(error);
          } else {
            reject(error);
          }
        };

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = (event) => {
          reject((event.target as IDBTransaction).error);
        };
      });
    };

    try {
      await doAppend();
    } catch (error: any) {
      if (error?.name === 'QuotaExceededError') {
        // Delete oldest 20% and retry
        await this.deleteOldestLogs(storeName, 0.2);
        await doAppend();
      } else {
        throw error;
      }
    }
  }

  /**
   * Retrieve all log lines from the specified store
   */
  async getAllLogs(storeName: typeof STORES[number]): Promise<string[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results as string[]);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  /**
   * Clear all logs from the specified store
   */
  async clearLogs(storeName: typeof STORES[number]): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  /**
   * Get total size of logs in bytes for the specified store
   */
  async getLogSize(storeName: typeof STORES[number]): Promise<number> {
    const logs = await this.getAllLogs(storeName);
    const totalString = logs.join('\n');
    // Use Blob to get accurate byte size (handles UTF-8 correctly)
    return new Blob([totalString]).size;
  }

  /**
   * Delete oldest percentage of logs from the store
   */
  private async deleteOldestLogs(
    storeName: typeof STORES[number],
    percentage: number
  ): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.getAllKeys();

      request.onsuccess = async () => {
        const keys = request.result || [];
        if (keys.length === 0) {
          resolve();
          return;
        }

        const deleteCount = Math.max(1, Math.floor(keys.length * percentage));
        const keysToDelete = keys.slice(0, deleteCount);

        for (const key of keysToDelete) {
          store.delete(key);
        }

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = (event) => {
          reject((event.target as IDBTransaction).error);
        };
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}

// Export singleton instance
export const logStorage = new LogStorage();
