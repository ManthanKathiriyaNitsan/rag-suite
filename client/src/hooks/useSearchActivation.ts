import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchActivationAPI } from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export function useSearchActivation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if we're in widget mode (external website)
  const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;

  // Get activation status
  const activationQuery = useQuery({
    queryKey: ['search-activation'],
    queryFn: searchActivationAPI.getActivationStatus,
    staleTime: 300000, // 5 minutes - data is fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false, // Disable refetch on reconnect to prevent infinite loops
    // Disable polling in widget mode to prevent CORB/CORS issues and infinite requests
    // Settings will still update when widget is opened/closed or page is refreshed
    refetchInterval: false, // Disabled to prevent infinite requests
    // Enable query in widget mode even if not authenticated
    enabled: true,
    retry: false, // Don't retry - if backend doesn't support projectId, we'll use default
    // In widget mode, 401 errors are expected if backend doesn't support projectId authentication
    // The API function will handle this gracefully by returning default active status
  });

  // Update activation status mutation
  const updateActivationMutation = useMutation({
    mutationFn: (isActive: boolean) => searchActivationAPI.updateActivationStatus(isActive),
    onSuccess: (response, variables) => {
      // Update the query cache optimistically with the new status
      // API returns: { success: true, data: { is_active: boolean }, message: "..." }
      const newStatus = response?.data || { is_active: variables };
      queryClient.setQueryData(['search-activation'], newStatus);
      toast({
        title: 'Activation Status Updated',
        description: response.message || 'Your search activation status has been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || error?.response?.data?.message || 'Failed to update activation status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Extract is_active from response object
  // The API returns: { is_active: true/false }
  const activationStatus = activationQuery.data;
  // In widget mode, default to true if:
  // 1. API returns 401 (backend might not support projectId yet)
  // 2. API fails with any error (show widget by default)
  // 3. Status is undefined (still loading or error)
  // Otherwise, use the actual status or default to false (main app)
  const isActive = activationStatus?.is_active ?? (isWidgetMode ? true : false);
  
  // If there's an error in widget mode, still show the widget (default to active)
  // Only hide if we explicitly get is_active: false from the API
  if (isWidgetMode && activationQuery.isError && !activationStatus) {
    // Error occurred but we don't have status - default to showing widget
    // This ensures widget works even if activation endpoint doesn't exist or fails
  }

  return {
    activationQuery, // Expose query for direct access to data
    activationData: activationQuery.data,
    isActive,
    isLoading: activationQuery.isLoading,
    isError: activationQuery.isError,
    error: activationQuery.error,
    refetchActivation: activationQuery.refetch,
    updateActivationAsync: updateActivationMutation.mutateAsync,
    isUpdating: updateActivationMutation.isPending,
  };
}

