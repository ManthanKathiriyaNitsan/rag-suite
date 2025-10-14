// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  company?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  dashboard: {
    defaultView: string;
    widgets: string[];
  };
}

// Document Types
export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'pdf' | 'markdown' | 'json' | 'csv';
  size: number;
  status: 'processing' | 'ready' | 'error';
  metadata: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
}

export interface DocumentMetadata {
  author?: string;
  description?: string;
  tags: string[];
  language?: string;
  wordCount?: number;
  pageCount?: number;
  extractedText?: string;
  summary?: string;
}

export interface UploadResponse {
  document: Document;
  message: string;
}

// Crawl Types
export interface CrawlSite {
  id: string;
  url: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error';
  lastCrawlAt?: string;
  nextCrawlAt?: string;
  crawlFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  settings: CrawlSettings;
  createdAt: string;
  updatedAt: string;
}

export interface CrawlSettings {
  maxPages: number;
  maxDepth: number;
  allowedDomains: string[];
  blockedDomains: string[];
  respectRobotsTxt: boolean;
  crawlDelay: number;
}

export interface CrawlJob {
  id: string;
  siteId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  pagesFound: number;
  pagesCrawled: number;
  errors: CrawlError[];
}

export interface CrawlError {
  url: string;
  error: string;
  timestamp: string;
}

export interface UrlPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

// Integration Types
export interface Integration {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'sdk';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface AnalyticsStats {
  totalDocuments: number;
  totalCrawls: number;
  totalIntegrations: number;
  totalUsers: number;
  storageUsed: number;
  apiCalls: number;
  lastUpdated: string;
}

export interface UsageStats {
  period: string;
  documents: number;
  searches: number;
  apiCalls: number;
  storageUsed: number;
}

// Search Types
export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  pagination?: {
    page: number;
    pageSize: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface SearchFilters {
  documentTypes?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  tags?: string[];
  authors?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took: number;
  suggestions?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  score: number;
  highlights: string[];
  metadata: Record<string, any>;
}
