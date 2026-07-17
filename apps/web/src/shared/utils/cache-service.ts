interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.expiresIn;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  set<T>(key: string, data: T, expiresIn = this.DEFAULT_EXPIRY): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  async fetch<T>(key: string, fetcher: () => Promise<T>, expiresIn = this.DEFAULT_EXPIRY): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return cached;
    const data = await fetcher();
    this.set<T>(key, data, expiresIn);
    return data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  // Invalidate cache entries by prefix
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.invalidate(key);
      }
    }
  }

  // Generate a cache key from a URL and params
  generateCacheKey(url: string, params?: Record<string, any>): string {
    if (!params) return url;
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: Record<string, any>, key) => {
        result[key] = params[key];
        return result;
      }, {});
    return `${url}:${JSON.stringify(sortedParams)}`;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();