/**
 * Application Constants
 * Core app configuration and settings
 */

export const APP_CONFIG = {
  NAME: 'RAG Suite',
  VERSION: '1.0.0',
  DESCRIPTION: 'Advanced RAG-powered document search and chat platform',
  AUTHOR: 'RAG Suite Team',
  REPOSITORY: 'https://github.com/ragsuite/ragsuite',
  SUPPORT_EMAIL: 'support@ragsuite.com',
} as const;

export const APP_FEATURES = {
  SEARCH: {
    ENABLED: true,
    MAX_QUERY_LENGTH: 1000,
    MAX_RESULTS: 50,
    DEFAULT_RESULTS: 10,
  },
  CHAT: {
    ENABLED: true,
    MAX_MESSAGE_LENGTH: 2000,
    MAX_HISTORY: 100,
    TYPING_INDICATOR_DELAY: 500,
  },
  DOCUMENTS: {
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['pdf', 'txt', 'docx', 'md'],
    MAX_FILES_PER_UPLOAD: 10,
  },
  INTEGRATIONS: {
    ENABLED: true,
    MAX_INTEGRATIONS: 20,
    SUPPORTED_TYPES: ['webhook', 'api', 'database'],
  },
  ANALYTICS: {
    ENABLED: true,
    TRACK_PAGE_VIEWS: true,
    TRACK_USER_ACTIONS: true,
    TRACK_PERFORMANCE: true,
  },
  NOTIFICATIONS: {
    ENABLED: true,
    MAX_NOTIFICATIONS: 5,
    DEFAULT_DURATION: 5000,
    ENABLE_SOUNDS: true,
  },
} as const;

export const APP_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const APP_LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  RU: 'ru',
  ZH: 'zh',
  JA: 'ja',
  KO: 'ko',
} as const;

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  DOCUMENTS: '/documents',
  INTEGRATIONS: '/integrations',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  FEEDBACK: '/feedback',
  ONBOARDING: '/onboarding',
} as const;

export const APP_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  TOKEN_EXPIRES: 'token_expires',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebar_state',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  MOCK_MODE: 'mock-mode',
  SESSION_ID: 'session_id',
} as const;

export const APP_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const APP_EVENTS = {
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  THEME_CHANGED: 'theme-changed',
  LANGUAGE_CHANGED: 'language-changed',
  DOCUMENT_UPLOADED: 'document:uploaded',
  DOCUMENT_DELETED: 'document:deleted',
  INTEGRATION_CREATED: 'integration:created',
  INTEGRATION_UPDATED: 'integration:updated',
  INTEGRATION_DELETED: 'integration:deleted',
  SEARCH_PERFORMED: 'search:performed',
  CHAT_MESSAGE: 'chat:message',
} as const;
