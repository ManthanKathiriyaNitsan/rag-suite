// Application Routes Constants
export const ROUTES = {
  // Public Routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  ONBOARDING: '/onboarding',
  
  // Protected Routes
  DASHBOARD: '/dashboard',
  OVERVIEW: '/',
  DOCUMENTS: '/documents',
  CRAWL: '/crawl',
  ANALYTICS: '/analytics',
  INTEGRATIONS: '/integrations',
  FEEDBACK: '/feedback',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  API_KEYS: '/api-keys',
  SYSTEM_HEALTH: '/system-health',
  PROJECTS: '/projects',
  CHATBOT_CONFIGURATION: '/chatbot-configuration',
  SEARCH_CONFIGURATION: '/search-configuration',
} as const;

export const ROUTE_LABELS = {
  [ROUTES.LOGIN]: 'Login',
  [ROUTES.SIGNUP]: 'Sign Up',
  [ROUTES.ONBOARDING]: 'Onboarding',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.OVERVIEW]: 'Overview',
  [ROUTES.DOCUMENTS]: 'Documents',
  [ROUTES.CRAWL]: 'Crawl',
  [ROUTES.ANALYTICS]: 'Analytics',
  [ROUTES.INTEGRATIONS]: 'Integrations',
  [ROUTES.FEEDBACK]: 'Feedback',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.API_KEYS]: 'API Keys',
  [ROUTES.SYSTEM_HEALTH]: 'System Health',
  [ROUTES.PROJECTS]: 'Projects',
  [ROUTES.CHATBOT_CONFIGURATION]: 'Chatbot Configuration',
  [ROUTES.SEARCH_CONFIGURATION]: 'Search Configuration',
} as const;

// Navigation Menu Items
export const NAVIGATION_ITEMS = [
  { path: ROUTES.OVERVIEW, label: ROUTE_LABELS[ROUTES.OVERVIEW], icon: 'Home' },
  { path: ROUTES.DOCUMENTS, label: ROUTE_LABELS[ROUTES.DOCUMENTS], icon: 'FileText' },
  { path: ROUTES.CRAWL, label: ROUTE_LABELS[ROUTES.CRAWL], icon: 'Globe' },
  { path: ROUTES.ANALYTICS, label: ROUTE_LABELS[ROUTES.ANALYTICS], icon: 'BarChart3' },
  { path: ROUTES.INTEGRATIONS, label: ROUTE_LABELS[ROUTES.INTEGRATIONS], icon: 'Plug' },
  { path: ROUTES.FEEDBACK, label: ROUTE_LABELS[ROUTES.FEEDBACK], icon: 'MessageSquare' },
] as const;
