import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { authAPI, LoginCredentials, LoginResponse, User } from '@/lib/api';

// 🔐 Authentication hook for login functionality
export const useAuth = () => {
  const queryClient = useQueryClient();
  
  // 🔧 FIXED: Add reactive state for auth data
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 🔧 FIXED: Sync with localStorage on mount and storage changes
  useEffect(() => {
    const syncAuthState = () => {
      const currentUser = getCurrentUser();
      const currentToken = getCurrentToken();
      const isAuth = !!(currentUser && currentToken);
      
      setUser(currentUser);
      setToken(currentToken);
      setIsAuthenticated(isAuth);
    };

    // Initial sync
    syncAuthState();

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user_data' || e.key === 'token_expires') {
        syncAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    
    onSuccess: (data: LoginResponse) => {
      console.log('✅ Login successful:', data);
      
      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      localStorage.setItem('token_expires', data.expiresAt);
      
      console.log('🔐 Stored auth data:', {
        token: data.token,
        user: data.user,
        expiresAt: data.expiresAt
      });
      
      // 🔧 FIXED: Update reactive state immediately
      // Ensure user object has all required fields
      const userWithCreatedAt: User = {
        ...data.user,
        createdAt: (data.user as any).createdAt || new Date().toISOString()
      };
      setUser(userWithCreatedAt);
      setToken(data.token);
      setIsAuthenticated(true);
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      
      // Force a page reload to update authentication state
      window.location.reload();
    },
    
    onError: (error) => {
      console.error('❌ Login failed:', error);
      // Clear any existing auth data on error
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
      
      // 🔧 FIXED: Update reactive state on error
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    
    onSuccess: () => {
      console.log('✅ Logout successful');
      // Clear all auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
      
      // 🔧 FIXED: Update reactive state immediately
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      // Invalidate all queries
      queryClient.clear();
    },
    
    onError: (error) => {
      console.error('❌ Logout failed:', error);
      // Still clear local data even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
      
      // 🔧 FIXED: Update reactive state on error
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      queryClient.clear();
    },
  });

  // Get current user from localStorage
  const getCurrentUser = (): User | null => {
    try {
      const userData = localStorage.getItem('user_data');
      const token = localStorage.getItem('auth_token');
      const expiresAt = localStorage.getItem('token_expires');
      
      console.log('🔐 Getting current user:', {
        userData: userData ? 'present' : 'missing',
        token: token ? 'present' : 'missing',
        expiresAt: expiresAt ? 'present' : 'missing'
      });
      
      // Check for null, undefined, or empty string
      if (!userData || userData === 'null' || userData === 'undefined' || !token || !expiresAt) {
        console.log('🔐 No valid user data found');
        return null;
      }
      
      // Check if token is expired
      if (new Date(expiresAt) <= new Date()) {
        console.log('🔐 Token expired, clearing data');
        // Token expired, clear data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token_expires');
        return null;
      }
      
      const user = JSON.parse(userData);
      console.log('🔐 Parsed user data:', user);
      return user;
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      // Clear invalid data on error
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
      return null;
    }
  };

  // Get current token
  const getCurrentToken = (): string | null => {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('token_expires');
    
    // Check for null, undefined, or empty string
    if (!token || token === 'null' || token === 'undefined' || !expiresAt || expiresAt === 'null' || expiresAt === 'undefined') {
      return null;
    }
    
    // Check if token is expired
    if (new Date(expiresAt) <= new Date()) {
      // Token expired, clear data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
      return null;
    }
    
    return token;
  };

  // Check if user is authenticated (legacy function - now using reactive state)
  // const isAuthenticated = (): boolean => {
  //   const user = getCurrentUser();
  //   const token = getCurrentToken();
  //   return !!(user && token);
  // };

  return {
    // Login
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    loginData: loginMutation.data,
    
    // Logout
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    logoutError: logoutMutation.error,
    
    // 🔧 FIXED: Use reactive state instead of functions
    isAuthenticated: isAuthenticated,
    user,
    token,
    
    // Reset login state
    resetLogin: loginMutation.reset,
  };
};

// 🔐 Token verification hook
export const useTokenVerification = () => {
  const token = localStorage.getItem('auth_token');
  
  const verificationQuery = useQuery({
    queryKey: ['auth-verify', token],
    queryFn: () => authAPI.verifyToken(token!),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    isVerifying: verificationQuery.isLoading,
    isTokenValid: verificationQuery.isSuccess,
    verificationError: verificationQuery.error,
    refetch: verificationQuery.refetch,
  };
};
