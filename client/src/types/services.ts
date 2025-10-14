/**
 * Service Types
 * TypeScript definitions for service layer
 */

// Storage Service Types
export interface StorageConfig {
  prefix?: string;
  encryption?: boolean;
  ttl?: number;
}

export interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheConfig {
  maxSize?: number;
  defaultTTL?: number;
  enablePersistence?: boolean;
  storageKey?: string;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  oldestItem: string | null;
  newestItem: string | null;
}

// Analytics Service Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

// Notification Service Types
export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  timestamp: number;
}

export interface NotificationConfig {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  duration?: number;
  maxNotifications?: number;
  enableSounds?: boolean;
}

// Error Reporting Service Types
export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string | null;
  sessionId: string;
  level: 'critical' | 'page' | 'component';
  errorId: string;
  metadata?: Record<string, any>;
}

export interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  maxRetries?: number;
  retryDelay?: number;
  batchSize?: number;
  flushInterval?: number;
}

// API Service Types
export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Query Client Types
export interface QueryConfig {
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  retryDelay?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

// Service Interfaces
export interface StorageService {
  setLocal<T>(key: string, value: T): void;
  getLocal<T>(key: string): T | null;
  removeLocal(key: string): void;
  setSession<T>(key: string, value: T): void;
  getSession<T>(key: string): T | null;
  removeSession(key: string): void;
  clearAll(): void;
  setAuthToken(token: string): void;
  getAuthToken(): string | null;
  removeAuthToken(): void;
  setUserData(userData: Record<string, unknown>): void;
  getUserData(): Record<string, unknown> | null;
  removeUserData(): void;
  clearAuthData(): void;
}

export interface CacheService {
  set<T>(key: string, value: T, ttl?: number): void;
  get<T>(key: string): T | null;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  keys(): string[];
  size(): number;
  getStats(): CacheStats;
  cleanup(): void;
  setConfig(config: Partial<CacheConfig>): void;
}

export interface AnalyticsService {
  track(eventName: string, properties?: Record<string, any>): void;
  trackPageView(page: string, properties?: Record<string, any>): void;
  trackUserAction(action: string, target?: string, properties?: Record<string, any>): void;
  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void;
  trackError(error: Error, properties?: Record<string, any>): void;
  trackSearch(query: string, results?: number, properties?: Record<string, any>): void;
  trackIntegration(action: string, integrationType?: string, properties?: Record<string, any>): void;
  setConfig(config: Partial<AnalyticsConfig>): void;
  destroy(): void;
}

export interface NotificationService {
  show(notification: Omit<Notification, 'id' | 'timestamp'>): string;
  success(title: string, message?: string, options?: Partial<Notification>): string;
  error(title: string, message?: string, options?: Partial<Notification>): string;
  warning(title: string, message?: string, options?: Partial<Notification>): string;
  info(title: string, message?: string, options?: Partial<Notification>): string;
  remove(id: string): void;
  clear(): void;
  clearByType(type: Notification['type']): void;
  getAll(): Notification[];
  getByType(type: Notification['type']): Notification[];
  getCount(): number;
  getCountByType(type: Notification['type']): number;
  subscribe(listener: (notifications: Notification[]) => void): () => void;
  setConfig(config: Partial<NotificationConfig>): void;
}

export interface ErrorReportingService {
  report(error: Error, metadata?: Record<string, any>): void;
  reportPageError(error: Error, componentStack?: string, metadata?: Record<string, any>): void;
  reportComponentError(error: Error, componentStack?: string, metadata?: Record<string, any>): void;
  setConfig(config: Partial<ErrorReportingConfig>): void;
  flush(): Promise<void>;
}
