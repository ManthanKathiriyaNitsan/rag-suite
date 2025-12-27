import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchPromptAPI } from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export function useSearchPrompt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get search prompt (returns string)
  const promptQuery = useQuery({
    queryKey: ['search-prompt'],
    queryFn: searchPromptAPI.getPrompt,
    staleTime: 0, // Always consider data stale to ensure fresh data on refresh
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
  });

  // Save search prompt mutation
  const savePromptMutation = useMutation({
    mutationFn: (prompt: { system_prompt: string }) => searchPromptAPI.savePrompt(prompt),
    onSuccess: async (response, variables) => {
      // Extract the saved prompt string from response or use the variable we sent
      let savedPromptString = '';
      if (typeof response === 'string') {
        savedPromptString = response;
      } else if (response && typeof response === 'object') {
        savedPromptString = (response as any).system_prompt || variables.system_prompt || '';
      } else {
        // Use the value we sent as fallback
        savedPromptString = variables.system_prompt;
      }
      
      // Update the query cache with the saved prompt string immediately
      queryClient.setQueryData(['search-prompt'], savedPromptString);
      
      // Invalidate and refetch to ensure we have the latest from server
      await queryClient.invalidateQueries({ queryKey: ['search-prompt'], exact: true });
      
      // Force a refetch to get the latest data from server
      await queryClient.refetchQueries({ queryKey: ['search-prompt'], exact: true });
      
      toast({
        title: 'Prompt Saved',
        description: 'Your search prompt has been saved successfully.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || error?.response?.data?.message || 'Failed to save search prompt. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Ensure promptString is always a string
  const promptString = typeof promptQuery.data === 'string' 
    ? promptQuery.data 
    : (promptQuery.data && typeof promptQuery.data === 'object')
      ? ((promptQuery.data as any).system_prompt || (promptQuery.data as any).data || String(promptQuery.data))
      : '';

  // Convert string response to object format for consistency
  const promptData = promptString ? { system_prompt: promptString } : undefined;

  return {
    prompt: promptData,
    promptString: promptString,
    isLoading: promptQuery.isLoading,
    isError: promptQuery.isError,
    error: promptQuery.error,
    refetchPrompt: promptQuery.refetch,
    savePromptAsync: savePromptMutation.mutateAsync,
    isSaving: savePromptMutation.isPending,
  };
}

