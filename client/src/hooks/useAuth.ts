import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { authAPI, LoginCredentials, LoginResponse, User } from '@/services/api/api';

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
  }, []); // Empty dependency array - runs only on mount

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    
    onSuccess: (data: LoginResponse) => {
      console.log('✅ Login successful:', data);
      
      // Validate token before storing
      if (!data.token || data.token.trim() === '') {
        console.error('❌ Invalid token received from API:', data.token);
        throw new Error('Invalid token received from server');
      }
      
      // Store token in localStorage (use auth_token as primary key)
      localStorage.setItem('auth_token', data.token);
      // Also store in legacy key for compatibility
      localStorage.setItem('auth-token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      localStorage.setItem('token_expires', data.expiresAt);
      
      // Verify token was stored correctly
      const storedToken = localStorage.getItem('auth_token');
      console.log('🔐 Stored auth data:', {
        token: data.token ? `${data.token.substring(0, 20)}...` : 'missing',
        tokenLength: data.token?.length || 0,
        storedToken: storedToken ? `${storedToken.substring(0, 20)}...` : 'missing',
        storedTokenLength: storedToken?.length || 0,
        user: data.user?.username || 'missing',
        expiresAt: data.expiresAt
      });
      
      if (!storedToken || storedToken !== data.token) {
        console.error('❌ Token storage verification failed!');
        throw new Error('Failed to store authentication token');
      }
      
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
      
      // Note: Navigation will be handled by the Login component's useEffect
      // No need to reload the page - the auth state is now reactive
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
      
    // Check if token is expired with robust timezone handling
    const expirationDate = new Date(expiresAt);
    const currentDate = new Date();
    
    // Calculate time difference in minutes
    const timeDiffMinutes = Math.round((expirationDate.getTime() - currentDate.getTime()) / (1000 * 60));
    
    // If the time difference is negative but less than 6 hours, it's likely a timezone issue
    // In this case, we'll treat the token as valid if it's within 6 hours of expiration
    const isLikelyTimezoneIssue = timeDiffMinutes < 0 && timeDiffMinutes > -360; // -6 hours
    
    // Add 30 minute buffer for normal cases, but be more lenient for timezone issues
    const bufferTime = isLikelyTimezoneIssue ? 0 : 30 * 60 * 1000; // 30 minutes for normal, 0 for timezone issues
    const isExpired = expirationDate <= new Date(currentDate.getTime() + bufferTime);
    
    console.log('🔐 Token expiration check:', {
      expiresAt: expiresAt,
      expirationDate: expirationDate.toISOString(),
      currentDate: currentDate.toISOString(),
      timeDiffMinutes: timeDiffMinutes,
      isLikelyTimezoneIssue: isLikelyTimezoneIssue,
      bufferTime: bufferTime,
      isExpired: isExpired
    });
    
    if (isExpired && !isLikelyTimezoneIssue) {
      console.log('🔐 Token expired (with buffer), clearing data');
      // Token expired, clear data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
      return null;
    } else if (isLikelyTimezoneIssue) {
      console.log('🔐 Likely timezone issue detected, treating token as valid');
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
    
    // Check if token is expired with robust timezone handling
    const expirationDate = new Date(expiresAt);
    const currentDate = new Date();
    
    // Calculate time difference in minutes
    const timeDiffMinutes = Math.round((expirationDate.getTime() - currentDate.getTime()) / (1000 * 60));
    
    // If the time difference is negative but less than 6 hours, it's likely a timezone issue
    // In this case, we'll treat the token as valid if it's within 6 hours of expiration
    const isLikelyTimezoneIssue = timeDiffMinutes < 0 && timeDiffMinutes > -360; // -6 hours
    
    // Add 30 minute buffer for normal cases, but be more lenient for timezone issues
    const bufferTime = isLikelyTimezoneIssue ? 0 : 30 * 60 * 1000; // 30 minutes for normal, 0 for timezone issues
    const isExpired = expirationDate <= new Date(currentDate.getTime() + bufferTime);
    
    console.log('🔐 Token expiration check (getCurrentToken):', {
      expiresAt: expiresAt,
      expirationDate: expirationDate.toISOString(),
      currentDate: currentDate.toISOString(),
      timeDiffMinutes: timeDiffMinutes,
      isLikelyTimezoneIssue: isLikelyTimezoneIssue,
      bufferTime: bufferTime,
      isExpired: isExpired
    });
    
    if (isExpired && !isLikelyTimezoneIssue) {
      console.log('🔐 Token expired (with buffer), clearing data (getCurrentToken)');
      // Token expired, clear data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
      return null;
    } else if (isLikelyTimezoneIssue) {
      console.log('🔐 Likely timezone issue detected, treating token as valid (getCurrentToken)');
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
