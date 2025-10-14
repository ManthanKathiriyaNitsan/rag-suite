/**
 * Icons Index
 * Central export for all icon assets
 */

// Note: In a real project, you would import actual icon files here
// For now, this serves as a placeholder for the icons directory structure

export const ICON_TYPES = {
  // Navigation Icons
  HOME: 'home',
  DASHBOARD: 'dashboard',
  DOCUMENTS: 'documents',
  INTEGRATIONS: 'integrations',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  
  // Action Icons
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  SAVE: 'save',
  CANCEL: 'cancel',
  SEARCH: 'search',
  FILTER: 'filter',
  SORT: 'sort',
  REFRESH: 'refresh',
  
  // Status Icons
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading',
  
  // User Icons
  USER: 'user',
  LOGOUT: 'logout',
  PROFILE: 'profile',
  AVATAR: 'avatar',
  
  // File Icons
  FILE: 'file',
  FOLDER: 'folder',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  
  // Communication Icons
  CHAT: 'chat',
  MESSAGE: 'message',
  NOTIFICATION: 'notification',
  EMAIL: 'email',
  
  // Media Icons
  PLAY: 'play',
  PAUSE: 'pause',
  STOP: 'stop',
  VOLUME: 'volume',
  MUTE: 'mute',
  
  // System Icons
  MENU: 'menu',
  CLOSE: 'close',
  MAXIMIZE: 'maximize',
  MINIMIZE: 'minimize',
  FULLSCREEN: 'fullscreen',
  
  // Social Icons
  GITHUB: 'github',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  DISCORD: 'discord',
  
  // Brand Icons
  LOGO: 'logo',
  FAVICON: 'favicon',
} as const;

export type IconType = typeof ICON_TYPES[keyof typeof ICON_TYPES];

// Icon component props
export interface IconProps {
  name: IconType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
  onClick?: () => void;
}

// Icon sizes
export const ICON_SIZES = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
} as const;

// Icon colors
export const ICON_COLORS = {
  primary: 'currentColor',
  secondary: '#6b7280',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;
