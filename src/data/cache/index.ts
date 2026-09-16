/** In-memory TTL cache. Redis adapter can replace this later without changing callers. */

type Entry<T> = { value: T; exp: number };

const store = new Map<string, Entry<unknown>>();

export const cache = {
  get<T>(key: string): T | null {
    const hit = store.get(key);
    if (!hit) return null;
    if (Date.now() > hit.exp) {
      store.delete(key);
      return null;
    }
    return hit.value as T;
  },
  set<T>(key: string, value: T, ttlMs: number): void {
    store.set(key, { value, exp: Date.now() + ttlMs });
  },
};
