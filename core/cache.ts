type CacheEntry = {
  html: string;
  createdAt: number;
};

const CACHE_TTL = 1000 * 60 * 5; // 5 dakika

const pageCache = new Map<string, CacheEntry>();

export function getCached(path: string): string | null {
  const entry = pageCache.get(path);
  if (!entry) return null;

  const isExpired = Date.now() - entry.createdAt > CACHE_TTL;
  if (isExpired) {
    pageCache.delete(path);
    return null;
  }

  return entry.html;
}

export function setCached(path: string, html: string) {
  pageCache.set(path, {
    html,
    createdAt: Date.now(),
  });
}

export function invalidate(path: string) {
  pageCache.delete(path);
}
