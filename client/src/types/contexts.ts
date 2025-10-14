/**
 * Context Types
 * TypeScript definitions for React contexts
 */

import { ReactNode } from 'react';

// Auth Context Types
export interface AuthUser {
  id: string | number;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
}

export interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
}

export interface AuthContextType extends AuthState, AuthActions {}

export interface AuthProviderProps {
  children: ReactNode;
}

// Theme Context Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
}

export interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export interface ThemeContextType extends ThemeState, ThemeActions {}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

// Language Context Types
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

export interface LanguageState {
  language: Language;
  direction: 'ltr' | 'rtl';
  locale: string;
}

export interface LanguageActions {
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

export interface LanguageContextType extends LanguageState, LanguageActions {}

export interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

// RAG Settings Context Types
export interface RAGSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topK: number;
  reranker: boolean;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
}

export interface RAGSettingsState {
  settings: RAGSettings;
  isLoading: boolean;
  isDirty: boolean;
}

export interface RAGSettingsActions {
  updateSettings: (settings: Partial<RAGSettings>) => void;
  resetSettings: () => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

export interface RAGSettingsContextType extends RAGSettingsState, RAGSettingsActions {}

export interface RAGSettingsProviderProps {
  children: ReactNode;
}

// Branding Context Types
export interface BrandingSettings {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customCSS?: string;
  companyName?: string;
  companyUrl?: string;
  supportEmail?: string;
}

export interface BrandingState {
  settings: BrandingSettings;
  isLoading: boolean;
}

export interface BrandingActions {
  updateBranding: (settings: Partial<BrandingSettings>) => void;
  resetBranding: () => void;
  saveBranding: () => Promise<void>;
  loadBranding: () => Promise<void>;
}

export interface BrandingContextType extends BrandingState, BrandingActions {}

export interface BrandingProviderProps {
  children: ReactNode;
}

// Citation Formatting Context Types
export interface CitationFormat {
  style: 'apa' | 'mla' | 'chicago' | 'ieee' | 'custom';
  customFormat?: string;
  includeUrl: boolean;
  includeDate: boolean;
  includeAuthor: boolean;
}

export interface CitationFormattingState {
  format: CitationFormat;
  isLoading: boolean;
}

export interface CitationFormattingActions {
  updateFormat: (format: Partial<CitationFormat>) => void;
  resetFormat: () => void;
  saveFormat: () => Promise<void>;
  loadFormat: () => Promise<void>;
  formatCitation: (source: Record<string, unknown>) => string;
}

export interface CitationFormattingContextType extends CitationFormattingState, CitationFormattingActions {}

export interface CitationFormattingProviderProps {
  children: ReactNode;
}

// Generic Context Types
export interface BaseContextProviderProps {
  children: ReactNode;
}

export interface ContextError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ContextState<T> {
  data: T | null;
  isLoading: boolean;
  error: ContextError | null;
}

export interface ContextActions<T> {
  setData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: ContextError | null) => void;
  reset: () => void;
}

export interface BaseContextType<T> extends ContextState<T>, ContextActions<T> {}
