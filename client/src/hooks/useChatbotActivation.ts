import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotAPI } from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export function useChatbotActivation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get activation status
  const activationQuery = useQuery({
    queryKey: ['chatbot-activation'],
    queryFn: chatbotAPI.getActivationStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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

  // Extract is_active from response, default to true if not available
  const isActive = activationQuery.data?.is_active ?? true;

  return {
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

