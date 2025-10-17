import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AdvancedState = {
  customCSS: string;
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    focusVisible: boolean;
  };
  responsive: {
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
  };
};

const DEFAULT_ADVANCED: AdvancedState = {
  customCSS: '',
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    focusVisible: true,
  },
  responsive: {
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280,
    },
  },
};

const LOCAL_STORAGE_KEY = "advanced";

export type AdvancedContextType = AdvancedState & {
  setAdvanced: (updates: Partial<AdvancedState>) => void;
  resetAdvanced: () => void;
};

const AdvancedContext = createContext<AdvancedContextType | null>(null);

export function AdvancedProvider({ children }: { children: React.ReactNode }) {
  const [advanced, setAdvancedState] = useState<AdvancedState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AdvancedState>;
        const result = {
          customCSS: parsed.customCSS ?? DEFAULT_ADVANCED.customCSS,
          accessibility: {
            reducedMotion: parsed.accessibility?.reducedMotion ?? DEFAULT_ADVANCED.accessibility.reducedMotion,
            highContrast: parsed.accessibility?.highContrast ?? DEFAULT_ADVANCED.accessibility.highContrast,
            focusVisible: parsed.accessibility?.focusVisible ?? DEFAULT_ADVANCED.accessibility.focusVisible,
          },
          responsive: {
            breakpoints: {
              mobile: parsed.responsive?.breakpoints?.mobile ?? DEFAULT_ADVANCED.responsive.breakpoints.mobile,
              tablet: parsed.responsive?.breakpoints?.tablet ?? DEFAULT_ADVANCED.responsive.breakpoints.tablet,
              desktop: parsed.responsive?.breakpoints?.desktop ?? DEFAULT_ADVANCED.responsive.breakpoints.desktop,
            },
          },
        };
        return result;
      }
    } catch (error) {
      console.error('AdvancedContext: Error loading from localStorage:', error);
    }
    return DEFAULT_ADVANCED;
  });

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(advanced));
      // Advanced settings saved to localStorage
    } catch (error) {
      console.error('AdvancedContext: Error saving to localStorage:', error);
    }
  }, [advanced]);

  // Apply advanced settings globally
  useEffect(() => {
    // Apply custom CSS globally
    const applyCustomCSS = () => {
      // Remove existing custom CSS style element
      const existingStyle = document.getElementById('advanced-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      if (advanced.customCSS.trim()) {
        const style = document.createElement('style');
        style.id = 'advanced-custom-css';
        style.textContent = advanced.customCSS;
        document.head.appendChild(style);
      }
    };

    // Apply accessibility settings globally
    const applyAccessibilitySettings = () => {
      const root = document.documentElement;
      
      // Reduced motion
      if (advanced.accessibility.reducedMotion) {
        root.style.setProperty('--animation-duration', '0ms');
        root.style.setProperty('--transition-duration', '0ms');
      } else {
        root.style.removeProperty('--animation-duration');
        root.style.removeProperty('--transition-duration');
      }
      
      // High contrast
      if (advanced.accessibility.highContrast) {
        root.classList.add('high-contrast');
        root.style.setProperty('--contrast-boost', '1.5');
      } else {
        root.classList.remove('high-contrast');
        root.style.removeProperty('--contrast-boost');
      }
      
      // Focus visible
      if (advanced.accessibility.focusVisible) {
        root.classList.add('focus-visible-enabled');
      } else {
        root.classList.remove('focus-visible-enabled');
      }
    };

    // Apply responsive breakpoints globally
    const applyResponsiveBreakpoints = () => {
      const root = document.documentElement;
      root.style.setProperty('--breakpoint-mobile', `${advanced.responsive.breakpoints.mobile}px`);
      root.style.setProperty('--breakpoint-tablet', `${advanced.responsive.breakpoints.tablet}px`);
      root.style.setProperty('--breakpoint-desktop', `${advanced.responsive.breakpoints.desktop}px`);
    };

    // Apply all settings
    applyCustomCSS();
    applyAccessibilitySettings();
    applyResponsiveBreakpoints();
    
    // Advanced settings applied globally
  }, [advanced]);

  const setAdvanced = (updates: Partial<AdvancedState>) => {
    setAdvancedState(prev => ({ ...prev, ...updates }));
  };

  const resetAdvanced = () => {
    try {
      setAdvancedState(DEFAULT_ADVANCED);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      // Apply default values immediately
      const root = document.documentElement;
      
      // Remove custom CSS
      const existingStyle = document.getElementById('advanced-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Reset accessibility settings
      root.classList.remove('high-contrast', 'focus-visible-enabled');
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
      root.style.removeProperty('--contrast-boost');
      
      // Reset responsive breakpoints to defaults
      root.style.setProperty('--breakpoint-mobile', `${DEFAULT_ADVANCED.responsive.breakpoints.mobile}px`);
      root.style.setProperty('--breakpoint-tablet', `${DEFAULT_ADVANCED.responsive.breakpoints.tablet}px`);
      root.style.setProperty('--breakpoint-desktop', `${DEFAULT_ADVANCED.responsive.breakpoints.desktop}px`);
      
      console.log('Advanced settings reset to defaults and applied globally');
    } catch (error) {
      console.error('AdvancedContext: Error resetting advanced settings:', error);
    }
  };

  const value = useMemo(() => ({ ...advanced, setAdvanced, resetAdvanced }), [advanced]);

  return (
    <AdvancedContext.Provider value={value}>{children}</AdvancedContext.Provider>
  );
}

export function useAdvanced(): AdvancedContextType {
  const ctx = useContext(AdvancedContext);
  if (!ctx) throw new Error("useAdvanced must be used within an AdvancedProvider");
  return ctx;
}
