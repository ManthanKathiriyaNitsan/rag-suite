import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchActivationAPI } from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export function useSearchActivation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get activation status
  const activationQuery = useQuery({
    queryKey: ['search-activation'],
    queryFn: searchActivationAPI.getActivationStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Update activation status mutation
  const updateActivationMutation = useMutation({
    mutationFn: (isActive: boolean) => searchActivationAPI.updateActivationStatus(isActive),
    onSuccess: (response, variables) => {
      // Update the query cache optimistically with the new status
      // Convert boolean to string format that matches the API response (GET returns a string)
      const newStatus = variables ? 'active' : 'inactive';
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

  // Extract is_active from response string
  // The API returns a string like "active" or "inactive"
  const activationStatus = activationQuery.data;
  const isActive = typeof activationStatus === 'string' 
    ? activationStatus.toLowerCase().trim() === 'active'
    : false; // Default to false if not available

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

