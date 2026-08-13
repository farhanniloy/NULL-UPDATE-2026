// small site-level cache helpers for light-weight data (categories, counts)
// TTL in seconds
import cache from './cache';

export async function getCachedCategories(key = 'orderedCategories', ttlSeconds = 300, fetcher) {
  const cached = await cache.get(key);
  if (cached) return cached;
  const val = await fetcher();
  await cache.set(key, val, ttlSeconds);
  return val;
}

export default { getCachedCategories };
