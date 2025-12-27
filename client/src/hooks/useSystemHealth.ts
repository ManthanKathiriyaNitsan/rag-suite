import { useQuery } from '@tanstack/react-query';
import { systemHealthAPI } from '@/services/api/api';

export function useSystemHealth() {
  // Get system health with auto-refresh every 10 seconds
  const systemHealthQuery = useQuery({
    queryKey: ['system-health'],
    queryFn: systemHealthAPI.getSystemHealth,
    staleTime: 1000 * 5, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for live monitoring
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    systemHealth: systemHealthQuery.data,
    isLoading: systemHealthQuery.isLoading,
    isError: systemHealthQuery.isError,
    error: systemHealthQuery.error,
    refetch: systemHealthQuery.refetch,
  };
}

