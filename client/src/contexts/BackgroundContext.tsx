import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

export type BackgroundTheme = 'geometric' | 'simple';

interface BackgroundContextType {
  backgroundTheme: BackgroundTheme;
  setBackgroundTheme: (theme: BackgroundTheme) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
  
  const [backgroundTheme, setBackgroundThemeState] = useState<BackgroundTheme>(() => {
    return 'simple'; // Default to simple
  });

  // Reset background theme to default when user changes (logout/login)
  useEffect(() => {
    if (!isAuthenticated) {
      // User logged out - reset to default
      console.log('🔄 User logged out, resetting background theme to default...');
      setBackgroundThemeState('simple');
    }
  }, [isAuthenticated, user?.id]);

  const setBackgroundTheme = (theme: BackgroundTheme) => {
    setBackgroundThemeState(theme);
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

