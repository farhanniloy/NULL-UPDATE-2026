// Simple in-memory cache with TTL. Suitable as short-lived cache to reduce DB reads.
// Not durable across instances — for distributed caching use Redis/Upstash and implement the same interface.

class Cache {
  constructor() {
    this.map = new Map(); // key -> { value, expiresAt }
  }

  _cleanup(key) {
    const e = this.map.get(key);
    if (!e) return;
    if (e.expiresAt && Date.now() > e.expiresAt) this.map.delete(key);
  }

  async get(key) {
    this._cleanup(key);
    const e = this.map.get(key);
    return e ? e.value : null;
  }

  async set(key, value, ttlSeconds = 30) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.map.set(key, { value, expiresAt });
  }

  async del(key) {
    this.map.delete(key);
  }
}

const defaultCache = new Cache();
export default defaultCache;
