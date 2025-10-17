import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CursorContextType {
  customCursorEnabled: boolean;
  setCustomCursorEnabled: (enabled: boolean) => void;
  toggleCursor: () => void;
  pointerIconsEnabled: boolean;
  setPointerIconsEnabled: (enabled: boolean) => void;
  togglePointerIcons: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

interface CursorProviderProps {
  children: ReactNode;
}

export function CursorProvider({ children }: CursorProviderProps) {
  const [customCursorEnabled, setCustomCursorEnabledState] = useState(() => {
    try {
      const saved = localStorage.getItem("customCursorEnabled");
      return saved ? JSON.parse(saved) : true; // Default to enabled
    } catch {
      return true;
    }
  });

  const [pointerIconsEnabled, setPointerIconsEnabledState] = useState(() => {
    try {
      const saved = localStorage.getItem("pointerIconsEnabled");
      return saved ? JSON.parse(saved) : true; // Default to enabled
    } catch {
      return true;
    }
  });

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customCursorEnabled') {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : true;
          setCustomCursorEnabledState(newValue);
        } catch {
          setCustomCursorEnabledState(true);
        }
      }
      if (e.key === 'pointerIconsEnabled') {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : true;
          setPointerIconsEnabledState(newValue);
        } catch {
          setPointerIconsEnabledState(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setCustomCursorEnabled = (enabled: boolean) => {
    setCustomCursorEnabledState(enabled);
    try {
      localStorage.setItem("customCursorEnabled", JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save cursor setting to localStorage:', error);
    }
  };

  const setPointerIconsEnabled = (enabled: boolean) => {
    setPointerIconsEnabledState(enabled);
    try {
      localStorage.setItem("pointerIconsEnabled", JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save pointer icons setting to localStorage:', error);
    }
  };

  const toggleCursor = () => {
    setCustomCursorEnabled(!customCursorEnabled);
  };

  const togglePointerIcons = () => {
    setPointerIconsEnabled(!pointerIconsEnabled);
  };

  return (
    <CursorContext.Provider value={{
      customCursorEnabled,
      setCustomCursorEnabled,
      toggleCursor,
      pointerIconsEnabled,
      setPointerIconsEnabled,
      togglePointerIcons
    }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
}
