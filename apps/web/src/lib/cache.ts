type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

type CacheConfig = {
  defaultTTL: number; // Time to live in milliseconds
  maxEntries: number;
  persistenceKey: string;
};

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private config: CacheConfig;

  private constructor() {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxEntries: 100,
      persistenceKey: 'app_cache',
    };

    this.cache = new Map();
    this.loadFromStorage();
    this.setupPeriodicCleanup();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.persistenceKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value as CacheEntry<any>);
        });
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }

  private setupPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  private cleanup(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveToStorage();
    }
  }

  private generateCacheKey(key: string, params?: Record<string, any>): string {
    if (!params) return key;
    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join('&');
    return `${key}?${sortedParams}`;
  }

  public set<T>(
    key: string,
    data: T,
    ttl: number = this.config.defaultTTL,
    params?: Record<string, any>
  ): void {
    const cacheKey = this.generateCacheKey(key, params);
    const now = Date.now();

    // Ensure we don't exceed max entries
    if (this.cache.size >= this.config.maxEntries) {
      // Remove oldest entry
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });

    this.saveToStorage();
  }

  public get<T>(
    key: string,
    params?: Record<string, any>
  ): T | null {
    const cacheKey = this.generateCacheKey(key, params);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    // Check if entry has expired
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(cacheKey);
      this.saveToStorage();
      return null;
    }

    return entry.data;
  }

  public remove(key: string, params?: Record<string, any>): void {
    const cacheKey = this.generateCacheKey(key, params);
    this.cache.delete(cacheKey);
    this.saveToStorage();
  }

  public clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  public has(key: string, params?: Record<string, any>): boolean {
    const cacheKey = this.generateCacheKey(key, params);
    return this.cache.has(cacheKey);
  }

  public getTimestamp(key: string, params?: Record<string, any>): number | null {
    const cacheKey = this.generateCacheKey(key, params);
    const entry = this.cache.get(cacheKey);
    return entry ? entry.timestamp : null;
  }

  public getTTL(key: string, params?: Record<string, any>): number | null {
    const cacheKey = this.generateCacheKey(key, params);
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    return Math.max(0, entry.expiresAt - Date.now());
  }

  public setConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getSize(): number {
    return this.cache.size;
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getEntries(): Array<[string, CacheEntry<any>]> {
    return Array.from(this.cache.entries());
  }
}

export const cacheService = CacheService.getInstance();