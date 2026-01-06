import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { systemHealthAPI } from '@/services/api/api';

export function useSystemHealth() {
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  // Get system health with auto-refresh every 30 seconds (reduced frequency)
  const systemHealthQuery = useQuery({
    queryKey: ['system-health'],
    queryFn: systemHealthAPI.getSystemHealth,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: hasCORBError ? false : 30000, // Refetch every 30 seconds (reduced from 10s), disabled on CORB errors
    refetchOnWindowFocus: false, // Disabled to prevent excessive requests
    refetchOnMount: true,
    retry: 1, // Only retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (systemHealthQuery.error) {
      const error: any = systemHealthQuery.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [systemHealthQuery.error]);

  return {
    systemHealth: systemHealthQuery.data,
    isLoading: systemHealthQuery.isLoading,
    isError: systemHealthQuery.isError,
    error: systemHealthQuery.error,
    refetch: systemHealthQuery.refetch,
  };
}

