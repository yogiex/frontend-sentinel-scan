import { Store } from './store';
import type { AuthCredential } from '@/types/credential';

const STORAGE_KEY = 'sentinelscan_credentials';

let nextId = 1;

function loadNextId(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const max = Math.max(...parsed.map((c: AuthCredential) => parseInt(c.id, 10) || 0));
        nextId = max + 1;
      }
    }
  } catch {
    // ignore
  }
}

loadNextId();

export const credentialStore = new Store<AuthCredential>(STORAGE_KEY);

export function createCredential(data: Omit<AuthCredential, 'id' | 'createdAt' | 'updatedAt'>): AuthCredential {
  const now = new Date().toISOString();
  const credential: AuthCredential = {
    ...data,
    id: String(nextId++),
    createdAt: now,
    updatedAt: now,
  };
  credentialStore.create(credential);
  return credential;
}
