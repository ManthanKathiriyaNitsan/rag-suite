import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type BackgroundTheme = 'veil' | 'geometric' | 'simple';

interface BackgroundContextType {
  backgroundTheme: BackgroundTheme;
  setBackgroundTheme: (theme: BackgroundTheme) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [backgroundTheme, setBackgroundThemeState] = useState<BackgroundTheme>(() => {
    const saved = localStorage.getItem('backgroundTheme');
    if (saved === 'veil' || saved === 'geometric' || saved === 'simple') {
      return saved as BackgroundTheme;
    }
    return 'veil'; // Default to veil
  });

  const setBackgroundTheme = (theme: BackgroundTheme) => {
    setBackgroundThemeState(theme);
    localStorage.setItem('backgroundTheme', theme);
  };

  return (
    <BackgroundContext.Provider value={{ backgroundTheme, setBackgroundTheme }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}

