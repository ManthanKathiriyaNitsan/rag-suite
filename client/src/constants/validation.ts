/**
 * Validation Constants
 * Form validation rules and patterns
 */

export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
    MAX_LENGTH: 254,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    MESSAGE: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    MESSAGE: 'Username must contain only letters, numbers, hyphens, and underscores',
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s'-]+$/,
    MESSAGE: 'Name must contain only letters, spaces, hyphens, and apostrophes',
  },
  URL: {
    PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    MESSAGE: 'Please enter a valid URL',
  },
  PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
    MESSAGE: 'Please enter a valid phone number',
  },
  API_KEY: {
    PATTERN: /^[a-zA-Z0-9]{32,}$/,
    MESSAGE: 'API key must be at least 32 characters long and contain only alphanumeric characters',
  },
  DOCUMENT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255,
    PATTERN: /^[^<>:"/\\|?*\x00-\x1f]+$/,
    MESSAGE: 'Document name contains invalid characters',
  },
  INTEGRATION_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s_-]+$/,
    MESSAGE: 'Integration name must contain only letters, numbers, spaces, hyphens, and underscores',
  },
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_TOO_WEAK: 'Password is too weak. Please include uppercase, lowercase, number, and special character',
  USERNAME_TOO_SHORT: 'Username must be at least 3 characters long',
  USERNAME_INVALID: 'Username contains invalid characters',
  NAME_TOO_SHORT: 'Name must be at least 2 characters long',
  NAME_TOO_LONG: 'Name must be less than 100 characters',
  FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
  FILE_TYPE_INVALID: 'File type is not supported',
  TOO_MANY_FILES: 'Too many files selected',
  SEARCH_QUERY_TOO_SHORT: 'Search query must be at least 2 characters long',
  SEARCH_QUERY_TOO_LONG: 'Search query must be less than 1000 characters',
  MESSAGE_TOO_LONG: 'Message must be less than 2000 characters',
  API_KEY_INVALID: 'Invalid API key format',
  INTEGRATION_NAME_INVALID: 'Invalid integration name',
  WEBHOOK_URL_INVALID: 'Invalid webhook URL',
} as const;

export const VALIDATION_PATTERNS = {
  EMAIL: VALIDATION_RULES.EMAIL.PATTERN,
  PASSWORD: VALIDATION_RULES.PASSWORD.PATTERN,
  USERNAME: VALIDATION_RULES.USERNAME.PATTERN,
  NAME: VALIDATION_RULES.NAME.PATTERN,
  URL: VALIDATION_RULES.URL.PATTERN,
  PHONE: VALIDATION_RULES.PHONE.PATTERN,
  API_KEY: VALIDATION_RULES.API_KEY.PATTERN,
  DOCUMENT_NAME: VALIDATION_RULES.DOCUMENT_NAME.PATTERN,
  INTEGRATION_NAME: VALIDATION_RULES.INTEGRATION_NAME.PATTERN,
} as const;

export const VALIDATION_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_UPLOAD: 10,
  MAX_SEARCH_QUERY_LENGTH: 1000,
  MAX_MESSAGE_LENGTH: 2000,
  MAX_DOCUMENT_NAME_LENGTH: 255,
  MAX_INTEGRATION_NAME_LENGTH: 100,
  MAX_USERNAME_LENGTH: 50,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
  MIN_NAME_LENGTH: 2,
  MIN_SEARCH_QUERY_LENGTH: 2,
} as const;

export const ALLOWED_FILE_TYPES = {
  DOCUMENTS: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown'],
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
} as const;

export const ALLOWED_FILE_EXTENSIONS = {
  DOCUMENTS: ['.pdf', '.txt', '.docx', '.md'],
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  ARCHIVES: ['.zip', '.rar', '.7z'],
} as const;
