/**
 * Cache Service
 * Centralized caching with TTL and memory management
 */

interface CacheConfig {
  maxSize?: number;
  defaultTTL?: number;
  enablePersistence?: boolean;
  storageKey?: string;
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      enablePersistence: false,
      storageKey: 'ragsuite_cache',
      ...config
    };

    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }
  }

  // Core Methods
  set<T>(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Remove oldest items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, item);
    this.saveToStorage();
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();

    return item.value;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  // Utility Methods
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestItem: string | null;
    newestItem: string | null;
  } {
    const keys = this.keys();
    const now = Date.now();
    
    let totalAccess = 0;
    let oldestTime = Infinity;
    let newestTime = 0;
    let oldestKey: string | null = null;
    let newestKey: string | null = null;

    for (const key of keys) {
      const item = this.cache.get(key);
      if (item) {
        totalAccess += item.accessCount;
        if (item.timestamp < oldestTime) {
          oldestTime = item.timestamp;
          oldestKey = key;
        }
        if (item.timestamp > newestTime) {
          newestTime = item.timestamp;
          newestKey = key;
        }
      }
    }

    const hitRate = keys.length > 0 ? totalAccess / keys.length : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate,
      oldestItem: oldestKey,
      newestItem: newestKey
    };
  }

  // Cleanup Methods
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      this.saveToStorage();
    }
  }

  // Configuration
  setConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Resize cache if maxSize changed
    if (config.maxSize && this.cache.size > config.maxSize) {
      this.evictOldest();
    }
  }

  // Private Methods
  private evictOldest(): void {
    if (this.cache.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private saveToStorage(): void {
    if (!this.config.enablePersistence) return;

    try {
      const data = Array.from(this.cache.entries()).map(([key, item]) => [key, item]);
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private loadFromStorage(): void {
    if (!this.config.enablePersistence) return;

    try {
      const data = localStorage.getItem(this.config.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        const now = Date.now();

        for (const [key, item] of parsed) {
          // Only load non-expired items
          if (now - item.timestamp <= item.ttl) {
            this.cache.set(key, item);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }
}

export const cacheService = new CacheService();
