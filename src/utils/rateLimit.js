import store from './ttlStore';

// Rate-limit helper that uses the TTL store. Keys are per-day by default.
// Returns true if allowed (after increment), or false if limit exceeded.

function secondsUntilEndOfUtcDay() {
  const now = new Date();
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  return Math.ceil((end.getTime() - now.getTime()) / 1000);
}

export async function incrDayKey(key, by = 1) {
  const ttl = secondsUntilEndOfUtcDay();
  try {
    const value = await store.incr(key, by, ttl);
    return value;
  } catch (err) {
    // On any store error, return null so caller can fallback to DB
    console.warn('ttlStore.incr failed', err?.message || err);
    return null;
  }
}

export async function limitedByDay(key, limit) {
  // increment and return whether the new count is within limit
  const val = await incrDayKey(key, 1);
  if (val === null) return null; // caller should fallback
  return val <= limit;
}

export default { incrDayKey, limitedByDay };
