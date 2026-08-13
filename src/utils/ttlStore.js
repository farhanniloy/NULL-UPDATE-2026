// Lightweight in-process TTL-backed counter store.
// Fallback-only: suitable for modest throughput and short-term caching.
// If you add an external store (Upstash/Redis), implement the same interface here.

class TTLStore {
  constructor() {
    this.map = new Map(); // key -> { value: number, expiresAt: number }
  }

  _cleanup(key) {
    const e = this.map.get(key);
    if (!e) return;
    if (e.expiresAt && Date.now() > e.expiresAt) this.map.delete(key);
  }

  async get(key) {
    this._cleanup(key);
    const e = this.map.get(key);
    return e ? e.value : 0;
  }

  // increment key by delta, set TTL in seconds when key created or when ttlSeconds provided
  async incr(key, delta = 1, ttlSeconds = 86400) {
    this._cleanup(key);
    let e = this.map.get(key);
    const now = Date.now();
    if (!e) {
      e = { value: 0, expiresAt: ttlSeconds ? now + ttlSeconds * 1000 : null };
    }
    e.value += delta;
    // if ttlSeconds provided, refresh expiry
    if (ttlSeconds) e.expiresAt = now + ttlSeconds * 1000;
    this.map.set(key, e);
    return e.value;
  }

  async del(key) {
    this.map.delete(key);
  }
}

const defaultStore = new TTLStore();
export default defaultStore;
