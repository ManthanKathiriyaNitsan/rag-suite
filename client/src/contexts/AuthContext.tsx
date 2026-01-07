import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, AuthState } from '@/services/api/api';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';

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

  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  // 🔐 Listen for session expiration events from API interceptor
  useEffect(() => {
    const handleSessionExpired = (event: CustomEvent) => {
      const errorMessage = event.detail?.message || 'Session expired due to inactivity';
      
      // Show toast notification
      toast({
        title: 'Session Expired',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Update auth state to reflect logout (storage already cleared by interceptor)
      // Don't call logout mutation to avoid API call since we're already redirecting
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      // Clear React Query cache
      queryClient.clear();
    };

    window.addEventListener('session-expired', handleSessionExpired as EventListener);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired as EventListener);
    };
  }, [toast]);

  // Clear error when it changes
  useEffect(() => {
    if (loginError) {
      // Extract user-friendly error message from API response
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (loginError instanceof Error) {
        // Check if it's an Axios error with response data
        const axiosError = loginError as any;
        if (axiosError.response?.data) {
          // Try to get error message from response
          const responseData = axiosError.response.data;
          
          // FastAPI typically returns error in 'detail' field
          if (responseData.detail) {
            errorMessage = typeof responseData.detail === 'string' 
              ? responseData.detail 
              : JSON.stringify(responseData.detail);
          } 
          // Some APIs return 'message' field
          else if (responseData.message) {
            errorMessage = responseData.message;
          }
          // Some APIs return 'error' field
          else if (responseData.error) {
            errorMessage = responseData.error;
          }
        }
        
        // If no response data, check status code for common errors
        if (axiosError.response?.status === 401) {
          errorMessage = 'Invalid username or password. Please try again.';
        } else if (axiosError.response?.status === 403) {
          errorMessage = 'Access denied. Please contact your administrator.';
        } else if (axiosError.response?.status === 404) {
          errorMessage = 'Login endpoint not found. Please contact support.';
        } else if (axiosError.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (axiosError.response?.status === 400) {
          errorMessage = 'Invalid request. Please check your input.';
        } else if (axiosError.message && !axiosError.message.includes('status code')) {
          // Use the error message if it's not the generic Axios status code message
          errorMessage = axiosError.message;
        }
      }
      
      setError(errorMessage);
    } else if (logoutError) {
      // Extract user-friendly error message for logout
      let errorMessage = 'Logout failed.';
      
      if (logoutError instanceof Error) {
        const axiosError = logoutError as any;
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message && !axiosError.message.includes('status code')) {
          errorMessage = axiosError.message;
        }
      }
      
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [loginError, logoutError]); // Only depend on actual values

  // Check if we're in widget mode (external website with projectId)
  const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
  const projectId = isWidgetMode ? (window as any).RAGSUITE_PROJECT_ID : null;

  // 🔐 Debug authentication state changes
  useEffect(() => {
    // In widget mode, authentication works via projectId, not user login
    if (isWidgetMode) {
      console.log('🔐 Widget mode: Authenticated via projectId', {
        projectId: projectId,
        isWidgetMode: true,
        isLoading: isInitializing || isLoggingIn || isLoggingOut,
        isInitializing
      });
    } else {
      console.log('🔐 Auth state changed:', {
        isAuthenticated,
        user: user?.username,
        token: token ? 'present' : 'missing',
        isLoading: isInitializing || isLoggingIn || isLoggingOut,
        isInitializing,
        error
      });
    }
  }, [isAuthenticated, user, token, isInitializing, isLoggingIn, isLoggingOut, error, isWidgetMode, projectId]);

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
