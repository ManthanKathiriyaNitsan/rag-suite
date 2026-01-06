import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotAPI } from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export function useChatbotActivation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if we're in widget mode (external website)
  const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;

  // Get activation status
  const activationQuery = useQuery({
    queryKey: ['chatbot-activation'],
    queryFn: chatbotAPI.getActivationStatus,
    staleTime: 300000, // 5 minutes - data is fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false, // Disable refetch on reconnect to prevent infinite loops
    // Disable polling in widget mode to prevent CORB/CORS issues and infinite requests
    // Settings will still update when widget is opened/closed or page is refreshed
    refetchInterval: false, // Disabled to prevent infinite requests
    // Enable query in widget mode even if not authenticated
    enabled: true,
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });

  // Update activation status mutation
  const updateActivationMutation = useMutation({
    mutationFn: (isActive: boolean) => chatbotAPI.updateActivationStatus(isActive),
    onSuccess: (response) => {
      // Update the query cache with the new status
      queryClient.setQueryData(['chatbot-activation'], response);
      // Invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ['chatbot-activation'], exact: true });
      toast({
        title: 'Activation Status Updated',
        description: response.message || 'Your chatbot activation status has been updated successfully.',
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

  // Extract is_active from response
  // Default to true (enabled) if not available - show widget by default, only hide if explicitly disabled
  // This allows widget to work even if backend doesn't support activation endpoint with projectId
  const isActive = activationQuery.data?.is_active ?? true;

  return {
    activationData: activationQuery.data,
    activationQuery, // Expose full query object for access to data property
    isActive,
    isLoading: activationQuery.isLoading,
    isError: activationQuery.isError,
    error: activationQuery.error,
    refetchActivation: activationQuery.refetch,
    updateActivationAsync: updateActivationMutation.mutateAsync,
    isUpdating: updateActivationMutation.isPending,
  };
}

