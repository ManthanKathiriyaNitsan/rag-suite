import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type TypographyState = {
  fontFamily: string;
  baseFontSize: number; // in pixels
  fontSizeScale: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  lineHeight: number;
  fontWeight: string;
  letterSpacing: number; // in pixels
  textAlign: string;
};

type TypographyContextType = TypographyState & {
  setTypography: (updates: Partial<TypographyState>) => void;
  resetTypography: () => void;
};

const DEFAULT_TYPOGRAPHY: TypographyState = {
  fontFamily: "Inter",
  baseFontSize: 16,
  fontSizeScale: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
  },
  lineHeight: 1.5,
  fontWeight: "normal",
  letterSpacing: 0,
  textAlign: "left",
};

const LOCAL_STORAGE_KEY = "typography";

const TypographyContext = createContext<TypographyContextType | undefined>(undefined);

export function TypographyProvider({ children }: { children: React.ReactNode }) {
  const [typography, setTypographyState] = useState<TypographyState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<TypographyState>;
        const result = {
          fontFamily: parsed.fontFamily ?? DEFAULT_TYPOGRAPHY.fontFamily,
          baseFontSize: parsed.baseFontSize ?? DEFAULT_TYPOGRAPHY.baseFontSize,
          fontSizeScale: {
            xs: parsed.fontSizeScale?.xs ?? DEFAULT_TYPOGRAPHY.fontSizeScale.xs,
            sm: parsed.fontSizeScale?.sm ?? DEFAULT_TYPOGRAPHY.fontSizeScale.sm,
            base: parsed.fontSizeScale?.base ?? DEFAULT_TYPOGRAPHY.fontSizeScale.base,
            lg: parsed.fontSizeScale?.lg ?? DEFAULT_TYPOGRAPHY.fontSizeScale.lg,
            xl: parsed.fontSizeScale?.xl ?? DEFAULT_TYPOGRAPHY.fontSizeScale.xl,
            '2xl': parsed.fontSizeScale?.['2xl'] ?? DEFAULT_TYPOGRAPHY.fontSizeScale['2xl'],
          },
          lineHeight: parsed.lineHeight ?? DEFAULT_TYPOGRAPHY.lineHeight,
          fontWeight: parsed.fontWeight ?? DEFAULT_TYPOGRAPHY.fontWeight,
          letterSpacing: parsed.letterSpacing ?? DEFAULT_TYPOGRAPHY.letterSpacing,
          textAlign: parsed.textAlign ?? DEFAULT_TYPOGRAPHY.textAlign,
        };
        return result;
      }
    } catch (error) {
      console.error('TypographyContext: Error loading from localStorage:', error);
    }
    return DEFAULT_TYPOGRAPHY;
  });

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(typography));
      // Typography saved to localStorage
    } catch (error) {
      console.error('TypographyContext: Error saving to localStorage:', error);
    }
  }, [typography]);

  // Load Google Fonts dynamically
  useEffect(() => {
    const fontName = typography.fontFamily.split(',')[0].trim();
    if (fontName && fontName !== 'system-ui' && fontName !== 'sans-serif') {
      // Check if font is already loaded
      const existingLink = document.querySelector(`link[href*="${fontName.replace(/\s+/g, '+')}"]`);
      if (existingLink) {
        // Font already loaded, just apply it
        return;
      }

      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
      link.rel = 'stylesheet';
      
      link.onload = () => {
        console.log(`Font ${fontName} loaded successfully`);
        // Apply font family after font loads to prevent flashing
        const root = document.documentElement;
        const body = document.body;
        root.style.setProperty("--font-family", `${typography.fontFamily}, system-ui, sans-serif`);
        body.style.fontFamily = `${typography.fontFamily}, system-ui, sans-serif`;
      };
      
      link.onerror = () => {
        console.warn(`Font ${fontName} failed to load, using fallback`);
        // Still apply the font family even if loading failed
        const root = document.documentElement;
        const body = document.body;
        root.style.setProperty("--font-family", `${typography.fontFamily}, system-ui, sans-serif`);
        body.style.fontFamily = `${typography.fontFamily}, system-ui, sans-serif`;
      };
      
      document.head.appendChild(link);
      
      return () => {
        // Don't remove the link immediately to prevent flashing
      };
    }
  }, [typography.fontFamily]);

  // Apply typography globally via CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply font family (only if not already set to prevent flashing)
    const currentFontFamily = root.style.getPropertyValue('--font-family');
    if (currentFontFamily !== `${typography.fontFamily}, system-ui, sans-serif`) {
      root.style.setProperty("--font-family", `${typography.fontFamily}, system-ui, sans-serif`);
      body.style.fontFamily = `${typography.fontFamily}, system-ui, sans-serif`;
    }
    
    // Apply font sizes
    root.style.setProperty("--font-size-base", `${typography.baseFontSize}px`);
    root.style.setProperty("--font-size-xs", `${typography.fontSizeScale.xs}px`);
    root.style.setProperty("--font-size-sm", `${typography.fontSizeScale.sm}px`);
    root.style.setProperty("--font-size-lg", `${typography.fontSizeScale.lg}px`);
    root.style.setProperty("--font-size-xl", `${typography.fontSizeScale.xl}px`);
    root.style.setProperty("--font-size-2xl", `${typography.fontSizeScale['2xl']}px`);
    
    // Apply text styling
    root.style.setProperty("--line-height", `${typography.lineHeight}`);
    root.style.setProperty("--font-weight", typography.fontWeight);
    root.style.setProperty("--letter-spacing", `${typography.letterSpacing}px`);
    root.style.setProperty("--text-align", typography.textAlign);
    
    // Apply to body
    body.style.fontSize = `${typography.baseFontSize}px`;
    body.style.lineHeight = `${typography.lineHeight}`;
    body.style.fontWeight = typography.fontWeight;
    body.style.letterSpacing = `${typography.letterSpacing}px`;
    body.style.textAlign = typography.textAlign;
    
    // Typography applied globally
  }, [typography]);

  const setTypography = (updates: Partial<TypographyState>) => {
    setTypographyState(prev => ({ ...prev, ...updates }));
  };

  const resetTypography = () => {
    setTypographyState(DEFAULT_TYPOGRAPHY);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const value = useMemo<TypographyContextType>(() => ({
    ...typography,
    setTypography,
    resetTypography,
  }), [typography]);

  return (
    <TypographyContext.Provider value={value}>{children}</TypographyContext.Provider>
  );
}

export function useTypography(): TypographyContextType {
  const ctx = useContext(TypographyContext);
  if (!ctx) throw new Error("useTypography must be used within a TypographyProvider");
  return ctx;
}
