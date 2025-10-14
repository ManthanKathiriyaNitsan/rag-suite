/**
 * Images Index
 * Central export for all image assets
 */

// Note: In a real project, you would import actual image files here
// For now, this serves as a placeholder for the images directory structure

export const IMAGE_TYPES = {
  // Logos
  LOGO: 'logo',
  LOGO_LIGHT: 'logo-light',
  LOGO_DARK: 'logo-dark',
  FAVICON: 'favicon',
  
  // Illustrations
  EMPTY_STATE: 'empty-state',
  ERROR_404: 'error-404',
  ERROR_500: 'error-500',
  MAINTENANCE: 'maintenance',
  COMING_SOON: 'coming-soon',
  
  // Onboarding
  ONBOARDING_1: 'onboarding-1',
  ONBOARDING_2: 'onboarding-2',
  ONBOARDING_3: 'onboarding-3',
  
  // Placeholders
  AVATAR_PLACEHOLDER: 'avatar-placeholder',
  DOCUMENT_PLACEHOLDER: 'document-placeholder',
  IMAGE_PLACEHOLDER: 'image-placeholder',
  
  // Backgrounds
  BACKGROUND_GRADIENT: 'background-gradient',
  BACKGROUND_PATTERN: 'background-pattern',
  
  // Features
  FEATURE_SEARCH: 'feature-search',
  FEATURE_CHAT: 'feature-chat',
  FEATURE_ANALYTICS: 'feature-analytics',
  FEATURE_INTEGRATIONS: 'feature-integrations',
} as const;

export type ImageType = typeof IMAGE_TYPES[keyof typeof IMAGE_TYPES];

// Image component props
export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Image optimization settings
export const IMAGE_OPTIMIZATION = {
  QUALITY: 85,
  FORMATS: ['webp', 'avif', 'jpeg', 'png'] as const,
  SIZES: [320, 640, 768, 1024, 1280, 1920] as const,
  BREAKPOINTS: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1920,
  } as const,
} as const;

// Image loading states
export const IMAGE_STATES = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
} as const;

// Common image dimensions
export const IMAGE_DIMENSIONS = {
  AVATAR: {
    SM: { width: 32, height: 32 },
    MD: { width: 48, height: 48 },
    LG: { width: 64, height: 64 },
    XL: { width: 96, height: 96 },
  },
  THUMBNAIL: {
    SM: { width: 100, height: 100 },
    MD: { width: 150, height: 150 },
    LG: { width: 200, height: 200 },
  },
  HERO: {
    SM: { width: 640, height: 360 },
    MD: { width: 768, height: 432 },
    LG: { width: 1024, height: 576 },
  },
} as const;
