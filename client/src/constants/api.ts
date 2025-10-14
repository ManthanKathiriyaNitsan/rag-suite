// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.ragsuite.com' 
    : 'http://localhost:5000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents/upload',
    DELETE: '/documents/:id',
    UPDATE: '/documents/:id',
    SEARCH: '/documents/search',
  },
  CRAWL: {
    SITES: '/crawl/sites',
    JOBS: '/crawl/jobs',
    START: '/crawl/start',
    STOP: '/crawl/stop',
  },
  INTEGRATIONS: {
    LIST: '/integrations',
    CREATE: '/integrations',
    UPDATE: '/integrations/:id',
    DELETE: '/integrations/:id',
  },
  ANALYTICS: {
    STATS: '/analytics/stats',
    USAGE: '/analytics/usage',
    PERFORMANCE: '/analytics/performance',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
