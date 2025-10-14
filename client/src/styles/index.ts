/**
 * Styles Index
 * Central export for all style modules
 */

// Main style imports
import './index.css';
import './themes.css';
import './components.css';
import './utilities.css';

// Style utilities
export const STYLE_CLASSES = {
  // Layout
  CONTAINER: 'container mx-auto px-4 sm:px-6 lg:px-8',
  SECTION: 'py-8 sm:py-12 lg:py-16',
  GRID: 'grid gap-4 sm:gap-6 lg:gap-8',
  
  // Typography
  HEADING_1: 'text-3xl sm:text-4xl lg:text-5xl font-bold text-primary',
  HEADING_2: 'text-2xl sm:text-3xl lg:text-4xl font-bold text-primary',
  HEADING_3: 'text-xl sm:text-2xl lg:text-3xl font-semibold text-primary',
  HEADING_4: 'text-lg sm:text-xl lg:text-2xl font-semibold text-primary',
  HEADING_5: 'text-base sm:text-lg lg:text-xl font-medium text-primary',
  HEADING_6: 'text-sm sm:text-base lg:text-lg font-medium text-primary',
  
  PARAGRAPH: 'text-base text-secondary leading-relaxed',
  PARAGRAPH_LARGE: 'text-lg text-secondary leading-relaxed',
  PARAGRAPH_SMALL: 'text-sm text-tertiary',
  
  // Buttons
  BUTTON_PRIMARY: 'btn btn-primary',
  BUTTON_SECONDARY: 'btn btn-secondary',
  BUTTON_DANGER: 'btn btn-danger',
  BUTTON_SUCCESS: 'btn btn-success',
  BUTTON_WARNING: 'btn btn-warning',
  BUTTON_GHOST: 'btn btn-ghost',
  BUTTON_OUTLINE: 'btn btn-outline',
  
  // Forms
  INPUT: 'input',
  INPUT_ERROR: 'input input-error',
  INPUT_SUCCESS: 'input input-success',
  LABEL: 'form-label',
  HELP_TEXT: 'form-help',
  ERROR_TEXT: 'form-error',
  
  // Cards
  CARD: 'card',
  CARD_HEADER: 'card-header',
  CARD_BODY: 'card-body',
  CARD_FOOTER: 'card-footer',
  CARD_TITLE: 'card-title',
  CARD_DESCRIPTION: 'card-description',
  
  // Modals
  MODAL_OVERLAY: 'modal-overlay',
  MODAL_CONTAINER: 'modal-container',
  MODAL_CONTENT: 'modal-content',
  MODAL_HEADER: 'modal-header',
  MODAL_BODY: 'modal-body',
  MODAL_FOOTER: 'modal-footer',
  
  // Navigation
  NAV_ITEM: 'nav-item',
  NAV_ITEM_ACTIVE: 'nav-item nav-item-active',
  NAV_ITEM_INACTIVE: 'nav-item nav-item-inactive',
  NAV_LINK: 'nav-link',
  
  // Tables
  TABLE: 'table',
  TABLE_HEADER: 'table-header',
  TABLE_HEADER_CELL: 'table-header-cell',
  TABLE_BODY: 'table-body',
  TABLE_ROW: 'table-row',
  TABLE_CELL: 'table-cell',
  
  // Badges
  BADGE_PRIMARY: 'badge badge-primary',
  BADGE_SECONDARY: 'badge badge-secondary',
  BADGE_SUCCESS: 'badge badge-success',
  BADGE_WARNING: 'badge badge-warning',
  BADGE_DANGER: 'badge badge-danger',
  
  // Alerts
  ALERT_INFO: 'alert alert-info',
  ALERT_SUCCESS: 'alert alert-success',
  ALERT_WARNING: 'alert alert-warning',
  ALERT_ERROR: 'alert alert-error',
  
  // Loading
  SPINNER: 'spinner',
  SPINNER_SM: 'spinner spinner-sm',
  SPINNER_MD: 'spinner spinner-md',
  SPINNER_LG: 'spinner spinner-lg',
  
  // Tooltips
  TOOLTIP: 'tooltip',
  TOOLTIP_SHOW: 'tooltip tooltip-show',
  TOOLTIP_ARROW: 'tooltip-arrow',
  
  // Dropdowns
  DROPDOWN: 'dropdown',
  DROPDOWN_ITEM: 'dropdown-item',
  DROPDOWN_DIVIDER: 'dropdown-divider',
  
  // Sidebar
  SIDEBAR: 'sidebar',
  SIDEBAR_COLLAPSED: 'sidebar sidebar-collapsed',
  SIDEBAR_EXPANDED: 'sidebar sidebar-expanded',
  
  // Header
  HEADER: 'header',
  HEADER_CONTENT: 'header-content',
  
  // Footer
  FOOTER: 'footer',
  FOOTER_CONTENT: 'footer-content',
} as const;

// Responsive breakpoints
export const BREAKPOINTS = {
  XS: '480px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Spacing scale
export const SPACING = {
  XS: '0.25rem',
  SM: '0.5rem',
  MD: '1rem',
  LG: '1.5rem',
  XL: '2rem',
  '2XL': '3rem',
  '3XL': '4rem',
} as const;

// Color palette
export const COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  SUCCESS: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
} as const;

// Animation utilities
export const ANIMATIONS = {
  FADE_IN: 'animate-fade-in',
  FADE_OUT: 'animate-fade-out',
  SLIDE_IN_UP: 'animate-slide-in-up',
  SLIDE_IN_DOWN: 'animate-slide-in-down',
  SLIDE_IN_LEFT: 'animate-slide-in-left',
  SLIDE_IN_RIGHT: 'animate-slide-in-right',
  SCALE_IN: 'animate-scale-in',
  SCALE_OUT: 'animate-scale-out',
  BOUNCE: 'animate-bounce',
  PULSE: 'animate-pulse',
  SPIN: 'animate-spin',
} as const;

// Z-index scale
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;
