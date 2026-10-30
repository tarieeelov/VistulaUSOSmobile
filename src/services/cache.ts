import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'usos_cache_';

interface CacheEntry<T> {
  data: T;
  timestamp: string;
}

/**
 * Store data in AsyncStorage cache with timestamp.
 */
export async function cacheSet<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    console.warn('[Cache] Failed to write:', key, error);
  }
}

/**
 * Retrieve cached data. Returns null if no cache exists.
 */
export async function cacheGet<T>(key: string): Promise<{ data: T; cachedAt: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return { data: entry.data, cachedAt: entry.timestamp };
  } catch (error) {
    console.warn('[Cache] Failed to read:', key, error);
    return null;
  }
}

/**
 * Remove a specific cache entry.
 */
export async function cacheRemove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.warn('[Cache] Failed to remove:', key, error);
  }
}

/**
 * Clear all USOS cache entries (preserves non-USOS AsyncStorage data).
 */
export async function cacheClearAll(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.warn('[Cache] Failed to clear all:', error);
  }
}

/**
 * Generate a deterministic cache key from endpoint + params.
 */
export function makeCacheKey(endpoint: string, params?: Record<string, string>): string {
  const paramStr = params
    ? Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&')
    : '';
  return `${endpoint}?${paramStr}`;
}
