import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, LoginCredentials, LoginResponse, User } from '@/lib/api';

// 🔐 Authentication hook for login functionality
export const useAuth = () => {
  const queryClient = useQueryClient();

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
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
    
    onError: (error) => {
      console.error('❌ Login failed:', error);
      // Clear any existing auth data on error
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
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
      
      // Invalidate all queries
      queryClient.clear();
    },
    
    onError: (error) => {
      console.error('❌ Logout failed:', error);
      // Still clear local data even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expires');
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

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    const user = getCurrentUser();
    const token = getCurrentToken();
    return !!(user && token);
  };

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
    
    // Auth state
    isAuthenticated: isAuthenticated(),
    user: getCurrentUser(),
    token: getCurrentToken(),
    
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
