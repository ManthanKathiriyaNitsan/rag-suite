import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, AuthState } from '@/services/api/api';

// 🔐 Authentication Context
interface AuthContextType {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (credentials: { username: string; password: string }) => void;
  logout: () => void;
  clearError: () => void;
}

// Initialize with default value to prevent "must be used within provider" errors
const defaultAuthContextValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null,
  login: () => {
    console.warn('login called before AuthProvider is initialized');
  },
  logout: () => {
    console.warn('logout called before AuthProvider is initialized');
  },
  clearError: () => {
    console.warn('clearError called before AuthProvider is initialized');
  },
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

// 🔐 Authentication Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    login: loginMutation,
    logout: logoutMutation,
    isLoggingIn,
    isLoggingOut,
    loginError,
    logoutError,
    isAuthenticated,
    user,
    token,
    resetLogin,
  } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Handle initialization
  useEffect(() => {
    // Set a timeout to ensure we have time to check authentication
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    return () => clearTimeout(initTimer);
  }, []); // Empty dependency array - runs only on mount

  // Clear error when it changes
  useEffect(() => {
    if (loginError) {
      setError(loginError.message || 'Login failed');
    } else if (logoutError) {
      setError(logoutError.message || 'Logout failed');
    } else {
      setError(null);
    }
  }, [loginError, logoutError]); // Only depend on actual values

  // 🔐 Debug authentication state changes
  useEffect(() => {
    console.log('🔐 Auth state changed:', {
      isAuthenticated,
      user: user?.username,
      token: token ? 'present' : 'missing',
      isLoading: isInitializing || isLoggingIn || isLoggingOut,
      isInitializing,
      error
    });
  }, [isAuthenticated, user, token, isInitializing, isLoggingIn, isLoggingOut, error]);

  // Clear error function
  const clearError = () => {
    setError(null);
    resetLogin();
  };

  // Login function
  const login = (credentials: { username: string; password: string }) => {
    setError(null);
    loginMutation(credentials);
  };

  // Logout function
  const logout = () => {
    setError(null);
    logoutMutation();
  };

  const value: AuthContextType = {
    // Auth state
    isAuthenticated,
    user,
    token,
    isLoading: isInitializing || isLoggingIn || isLoggingOut,
    error,

    // Auth actions
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 🔐 Use Auth Hook
export function useAuthContext() {
  const context = useContext(AuthContext);
  // Context is always defined (has default value), so no need to check
  return context;
}

// 🔐 Auth Guard Hook
export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuthContext();

  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isAuthenticated && !isLoading,
  };
}
