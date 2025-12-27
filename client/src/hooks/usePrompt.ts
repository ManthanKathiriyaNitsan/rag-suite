import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  promptAPI, 
  PromptRequest 
} from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export function usePrompt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get prompt
  const promptQuery = useQuery({
    queryKey: ['prompt'],
    queryFn: promptAPI.getPrompt,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Save prompt mutation
  const savePromptMutation = useMutation({
    mutationFn: (prompt: PromptRequest) => promptAPI.savePrompt(prompt),
    onSuccess: (response) => {
      // Update the query cache with the new prompt - ONLY affect prompt query
      queryClient.setQueryData(['prompt'], response);
      // Invalidate ONLY the prompt query - do NOT affect chatbot-settings
      queryClient.invalidateQueries({ queryKey: ['prompt'], exact: true });
      toast({
        title: 'Prompt Saved',
        description: 'Your system prompt has been saved successfully.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || error?.response?.data?.message || 'Failed to save prompt. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    prompt: promptQuery.data,
    isLoading: promptQuery.isLoading,
    isError: promptQuery.isError,
    error: promptQuery.error,
    refetchPrompt: promptQuery.refetch,
    savePromptAsync: savePromptMutation.mutateAsync,
    isSaving: savePromptMutation.isPending,
  };
}

