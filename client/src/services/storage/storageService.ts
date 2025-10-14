/**
 * Storage Service
 * Centralized storage management with error handling
 */

import { 
  safeGetItem, 
  safeSetItem, 
  safeGetSessionItem, 
  safeSetSessionItem,
  safeRemoveItem,
  safeRemoveSessionItem,
  safeClearStorage,
  safeClearSessionStorage
} from '@/utils/safeStorage';

export interface StorageConfig {
  prefix?: string;
  encryption?: boolean;
  ttl?: number; // Time to live in milliseconds
}

class StorageService {
  private config: StorageConfig;

  constructor(config: StorageConfig = {}) {
    this.config = {
      prefix: 'ragsuite_',
      encryption: false,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      ...config
    };
  }

  // Local Storage Operations
  setLocal<T>(key: string, value: T): void {
    const prefixedKey = this.getPrefixedKey(key);
    const data = {
      value,
      timestamp: Date.now(),
      ttl: this.config.ttl
    };
    safeSetItem(prefixedKey, data);
  }

  getLocal<T>(key: string): T | null {
    const prefixedKey = this.getPrefixedKey(key);
    const data = safeGetItem(prefixedKey) as {value: T, timestamp: number, ttl: number} | null;
    
    if (!data) return null;
    
    // Check TTL
    if (this.config.ttl && Date.now() - data.timestamp > data.ttl) {
      this.removeLocal(key);
      return null;
    }
    
    return data.value;
  }

  removeLocal(key: string): void {
    const prefixedKey = this.getPrefixedKey(key);
    safeRemoveItem(prefixedKey);
  }

  // Session Storage Operations
  setSession<T>(key: string, value: T): void {
    const prefixedKey = this.getPrefixedKey(key);
    safeSetSessionItem(prefixedKey, value);
  }

  getSession<T>(key: string): T | null {
    const prefixedKey = this.getPrefixedKey(key);
    return safeGetSessionItem(prefixedKey) as T | null;
  }

  removeSession(key: string): void {
    const prefixedKey = this.getPrefixedKey(key);
    safeRemoveSessionItem(prefixedKey);
  }

  // Utility Methods
  private getPrefixedKey(key: string): string {
    return this.config.prefix ? `${this.config.prefix}${key}` : key;
  }

  clearAll(): void {
    if (this.config.prefix) {
      // Clear only our prefixed keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.config.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } else {
      safeClearStorage();
    }
    safeClearSessionStorage();
  }

  // Auth-specific storage
  setAuthToken(token: string): void {
    this.setLocal('auth_token', token);
  }

  getAuthToken(): string | null {
    return this.getLocal<string>('auth_token');
  }

  removeAuthToken(): void {
    this.removeLocal('auth_token');
  }

  setUserData(userData: any): void {
    this.setLocal('user_data', userData);
  }

  getUserData(): any {
    return this.getLocal('user_data');
  }

  removeUserData(): void {
    this.removeLocal('user_data');
  }

  // Clear all auth data
  clearAuthData(): void {
    this.removeAuthToken();
    this.removeUserData();
    this.removeLocal('token_expires');
    this.removeLocal('mock-mode');
  }
}

export const storageService = new StorageService();
