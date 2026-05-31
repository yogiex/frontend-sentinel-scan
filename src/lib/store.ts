export class Store<T extends { id: string }> {
  private items: Map<string, T> = new Map();
  private listeners: Set<() => void> = new Set();
  private storageKey: string;

  constructor(storageKey: string, initialData?: T[]) {
    this.storageKey = storageKey;
    this.load();
    if (initialData && this.items.size === 0) {
      initialData.forEach(item => this.items.set(item.id, item));
      this.save();
    }
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: T) => this.items.set(item.id, item));
        }
      }
    } catch (e) {
      console.warn(`[Store:${this.storageKey}] Failed to load:`, e);
    }
  }

  private save(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.items.values())));
    } catch (e) {
      console.warn(`[Store:${this.storageKey}] Failed to save:`, e);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  getAll(): T[] {
    return Array.from(this.items.values());
  }

  getById(id: string): T | undefined {
    return this.items.get(id);
  }

  create(item: T): T {
    this.items.set(item.id, item);
    this.save();
    this.notify();
    return item;
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    this.save();
    this.notify();
    return updated;
  }

  delete(id: string): boolean {
    const deleted = this.items.delete(id);
    if (deleted) {
      this.save();
      this.notify();
    }
    return deleted;
  }

  clear(): void {
    this.items.clear();
    localStorage.removeItem(this.storageKey);
    this.notify();
  }
}
