/**
 * Hook Types
 * TypeScript definitions for custom hooks
 */

import { ReactNode } from 'react';
import { AuthUser } from './contexts';

// Search Hook Types
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  url?: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took: number;
  suggestions?: string[];
}

export interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  query: string;
  total: number;
  took: number;
}

export interface SearchActions {
  search: (params: SearchParams) => Promise<void>;
  clearResults: () => void;
  setQuery: (query: string) => void;
}

export interface UseSearchReturn extends SearchState, SearchActions {}

// Chat Hook Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  createSession: (name?: string) => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  clearMessages: () => void;
  setTyping: (typing: boolean) => void;
}

export interface UseChatReturn extends ChatState, ChatActions {}

// Documents Hook Types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  status: 'processing' | 'ready' | 'error';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface DocumentUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface DocumentsState {
  documents: Document[];
  uploads: DocumentUpload[];
  isLoading: boolean;
  error: string | null;
  selectedDocuments: string[];
}

export interface DocumentsActions {
  uploadDocuments: (files: File[]) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  downloadDocument: (documentId: string) => Promise<void>;
  selectDocument: (documentId: string) => void;
  deselectDocument: (documentId: string) => void;
  selectAllDocuments: () => void;
  deselectAllDocuments: () => void;
  refreshDocuments: () => Promise<void>;
}

export interface UseDocumentsReturn extends DocumentsState, DocumentsActions {}

// Crawl Hook Types
export interface CrawlJob {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
  documentsFound?: number;
}

export interface CrawlSource {
  id: string;
  url: string;
  name: string;
  type: 'website' | 'sitemap' | 'rss';
  status: 'active' | 'inactive' | 'error';
  lastCrawl?: Date;
  nextCrawl?: Date;
  documentsCount: number;
}

export interface CrawlState {
  jobs: CrawlJob[];
  sources: CrawlSource[];
  isLoading: boolean;
  error: string | null;
}

export interface CrawlActions {
  startCrawl: (url: string) => Promise<void>;
  stopCrawl: (jobId: string) => Promise<void>;
  addSource: (source: Omit<CrawlSource, 'id' | 'documentsCount'>) => Promise<void>;
  removeSource: (sourceId: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
  refreshSources: () => Promise<void>;
}

export interface UseCrawlReturn extends CrawlState, CrawlActions {}

// Integration Hook Types
export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'database';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

export interface IntegrationFormData {
  name: string;
  type: string;
  config: Record<string, any>;
}

export interface IntegrationState {
  integrations: Integration[];
  isLoading: boolean;
  error: string | null;
  selectedIntegration: Integration | null;
}

export interface IntegrationActions {
  createIntegration: (data: IntegrationFormData) => Promise<void>;
  updateIntegration: (id: string, data: Partial<IntegrationFormData>) => Promise<void>;
  deleteIntegration: (id: string) => Promise<void>;
  testIntegration: (id: string) => Promise<void>;
  selectIntegration: (integration: Integration | null) => void;
  refreshIntegrations: () => Promise<void>;
}

export interface UseIntegrationReturn extends IntegrationState, IntegrationActions {}

// Auth Hook Types
export interface AuthHookState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthHookActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface UseAuthReturn extends AuthHookState, AuthHookActions {}

// Toast Hook Types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface ToastState {
  toasts: ToastMessage[];
}

export interface ToastActions {
  showToast: (toast: Omit<ToastMessage, 'id'>) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

export interface UseToastReturn extends ToastState, ToastActions {}

// Mobile Hook Types
export interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export interface UseMobileReturn extends MobileState {}

// Onboarding Hook Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: ReactNode;
  completed: boolean;
}

export interface OnboardingState {
  steps: OnboardingStep[];
  currentStep: number;
  isCompleted: boolean;
  isActive: boolean;
}

export interface OnboardingActions {
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (stepId: string) => void;
  skipOnboarding: () => void;
  startOnboarding: () => void;
  resetOnboarding: () => void;
}

export interface UseOnboardingReturn extends OnboardingState, OnboardingActions {}
