import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  configModelsAPI, 
  ConfigModelsData, 
  ConfigModelsRequest 
} from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export function useConfigModels() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get config models
  const configModelsQuery = useQuery({
    queryKey: ['config-models'],
    queryFn: configModelsAPI.getConfigModels,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Save config models mutation
  const saveConfigModelsMutation = useMutation({
    mutationFn: (config: ConfigModelsRequest) => configModelsAPI.saveConfigModels(config),
    onSuccess: (response) => {
      // Update the query cache with the new config
      queryClient.setQueryData<ConfigModelsData>(['config-models'], (oldData) => {
        return {
          ...oldData,
          ...response,
        } as ConfigModelsData;
      });
      // Invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ['config-models'] });
      toast({
        title: 'Model Settings Saved',
        description: 'Your model configuration has been saved successfully.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || error?.response?.data?.message || 'Failed to save model settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    configModels: configModelsQuery.data,
    isLoading: configModelsQuery.isLoading,
    isError: configModelsQuery.isError,
    error: configModelsQuery.error,
    refetchConfigModels: configModelsQuery.refetch,
    saveConfigModelsAsync: saveConfigModelsMutation.mutateAsync,
    isSaving: saveConfigModelsMutation.isPending,
  };
}

export function useAvailableModels() {
  const availableModelsQuery = useQuery({
    queryKey: ['available-models'],
    queryFn: configModelsAPI.getAvailableModels,
    staleTime: 1000 * 60 * 10, // 10 minutes - models don't change often
    refetchOnWindowFocus: false,
  });

  return {
    providers: availableModelsQuery.data || [],
    isLoading: availableModelsQuery.isLoading,
    isError: availableModelsQuery.isError,
    error: availableModelsQuery.error,
    refetch: availableModelsQuery.refetch,
  };
}

export function useAvailableChatModels(provider?: string) {
  const { providers } = useAvailableModels();
  
  const chatModels = useMemo(() => {
    if (!provider || !providers) return [];
    const providerInfo = providers.find(p => p.value.toLowerCase() === provider.toLowerCase());
    return providerInfo?.chat_models.map(model => model.value) || [];
  }, [provider, providers]);

  return {
    availableModels: chatModels,
    isLoading: false, // Already loaded from useAvailableModels
  };
}

export function useAvailableEmbeddingModels(provider?: string) {
  const { providers } = useAvailableModels();
  
  const embeddingModels = useMemo(() => {
    if (!provider || !providers) return [];
    const providerInfo = providers.find(p => p.value.toLowerCase() === provider.toLowerCase());
    return providerInfo?.embedding_models.map(model => model.value) || [];
  }, [provider, providers]);

  return {
    availableModels: embeddingModels,
    isLoading: false, // Already loaded from useAvailableModels
  };
}

