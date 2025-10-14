// Application Configuration Constants
export const APP_CONFIG = {
  NAME: 'RAGSuite',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-Powered RAG Platform',
  
  // Environment
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Features
  FEATURES: {
    DARK_MODE: true,
    MULTI_LANGUAGE: true,
    ANALYTICS: true,
    NOTIFICATIONS: true,
    ONBOARDING: true,
    HELP_SYSTEM: true,
  },
  
  // UI Configuration
  UI: {
    SIDEBAR_WIDTH: '20rem',
    SIDEBAR_WIDTH_ICON: '4rem',
    HEADER_HEIGHT: '4rem',
    ANIMATION_DURATION: 200,
    DEBOUNCE_DELAY: 300,
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
  },
  
  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'text/plain',
      'application/pdf',
      'text/markdown',
      'application/json',
      'text/csv',
    ],
    MAX_FILES: 10,
  },
  
  // Search
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    DEBOUNCE_DELAY: 500,
    MAX_RESULTS: 50,
  },
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  THEMES: ['light', 'dark'] as const,
  STORAGE_KEY: 'ragsuite-theme',
} as const;

// Localization Configuration
export const I18N_CONFIG = {
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'zh', 'ja'] as const,
  STORAGE_KEY: 'ragsuite-language',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'ragsuite-theme',
  LANGUAGE: 'ragsuite-language',
  USER_PREFERENCES: 'ragsuite-user-preferences',
  ONBOARDING_COMPLETED: 'ragsuite-onboarding-completed',
  SIDEBAR_COLLAPSED: 'ragsuite-sidebar-collapsed',
} as const;
