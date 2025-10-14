/**
 * Fonts Index
 * Font family definitions and configurations
 */

// Font families
export const FONT_FAMILIES = {
  SANS: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  SERIF: [
    'Georgia',
    'Cambria',
    'Times New Roman',
    'Times',
    'serif',
  ],
  MONO: [
    'JetBrains Mono',
    'Fira Code',
    'Consolas',
    'Monaco',
    'Courier New',
    'monospace',
  ],
  DISPLAY: [
    'Inter',
    'system-ui',
    'sans-serif',
  ],
} as const;

// Font weights
export const FONT_WEIGHTS = {
  THIN: 100,
  EXTRALIGHT: 200,
  LIGHT: 300,
  NORMAL: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
  BOLD: 700,
  EXTRABOLD: 800,
  BLACK: 900,
} as const;

// Font sizes
export const FONT_SIZES = {
  XS: '0.75rem',    // 12px
  SM: '0.875rem',   // 14px
  BASE: '1rem',     // 16px
  LG: '1.125rem',   // 18px
  XL: '1.25rem',    // 20px
  '2XL': '1.5rem',  // 24px
  '3XL': '1.875rem', // 30px
  '4XL': '2.25rem', // 36px
  '5XL': '3rem',    // 48px
  '6XL': '3.75rem', // 60px
  '7XL': '4.5rem',  // 72px
  '8XL': '6rem',    // 96px
  '9XL': '8rem',    // 128px
} as const;

// Line heights
export const LINE_HEIGHTS = {
  NONE: 1,
  TIGHT: 1.25,
  SNUG: 1.375,
  NORMAL: 1.5,
  RELAXED: 1.625,
  LOOSE: 2,
} as const;

// Letter spacing
export const LETTER_SPACING = {
  TIGHTER: '-0.05em',
  TIGHT: '-0.025em',
  NORMAL: '0em',
  WIDE: '0.025em',
  WIDER: '0.05em',
  WIDEST: '0.1em',
} as const;

// Typography scales
export const TYPOGRAPHY_SCALE = {
  DISPLAY: {
    fontSize: FONT_SIZES['6XL'],
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: LINE_HEIGHTS.TIGHT,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  H1: {
    fontSize: FONT_SIZES['5XL'],
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: LINE_HEIGHTS.TIGHT,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  H2: {
    fontSize: FONT_SIZES['4XL'],
    fontWeight: FONT_WEIGHTS.BOLD,
    lineHeight: LINE_HEIGHTS.TIGHT,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  H3: {
    fontSize: FONT_SIZES['3XL'],
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
    lineHeight: LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  H4: {
    fontSize: FONT_SIZES['2XL'],
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
    lineHeight: LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  H5: {
    fontSize: FONT_SIZES.XL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  H6: {
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    lineHeight: LINE_HEIGHTS.SNUG,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  BODY: {
    fontSize: FONT_SIZES.BASE,
    fontWeight: FONT_WEIGHTS.NORMAL,
    lineHeight: LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  SMALL: {
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.NORMAL,
    lineHeight: LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  CAPTION: {
    fontSize: FONT_SIZES.XS,
    fontWeight: FONT_WEIGHTS.NORMAL,
    lineHeight: LINE_HEIGHTS.NORMAL,
    letterSpacing: LETTER_SPACING.WIDE,
  },
} as const;

// Font loading configuration
export const FONT_LOADING = {
  DISPLAY: 'swap',
  FALLBACK: 'block',
  OPTIONAL: 'optional',
} as const;

// Google Fonts configuration
export const GOOGLE_FONTS = {
  INTER: {
    family: 'Inter',
    weights: [300, 400, 500, 600, 700],
    display: 'swap',
  },
  JETBRAINS_MONO: {
    family: 'JetBrains Mono',
    weights: [400, 500, 600, 700],
    display: 'swap',
  },
} as const;
