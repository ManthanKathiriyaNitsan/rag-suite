import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  chatbotAPI, 
  ChatbotSettingsResponse, 
  ChatbotConfigurationRequest, 
  ChatbotCustomizationRequest 
} from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export function useChatbotSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get chatbot settings (configuration + customization)
  const settingsQuery = useQuery({
    queryKey: ['chatbot-settings'],
    queryFn: chatbotAPI.getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Save configuration mutation
  const saveConfigurationMutation = useMutation({
    mutationFn: (config: ChatbotConfigurationRequest) => chatbotAPI.saveConfiguration(config),
    onSuccess: (response) => {
      // Update the query cache with the new configuration
      queryClient.setQueryData<ChatbotSettingsResponse>(['chatbot-settings'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          configuration: response,
        };
      });
      // Invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ['chatbot-settings'] });
      toast({
        title: 'Configuration Saved',
        description: 'Your chatbot configuration has been saved successfully.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to save configuration. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Save customization mutation
  const saveCustomizationMutation = useMutation({
    mutationFn: (customization: ChatbotCustomizationRequest) => chatbotAPI.saveCustomization(customization),
    onSuccess: (response) => {
      // Update the query cache with the new customization
      queryClient.setQueryData<ChatbotSettingsResponse>(['chatbot-settings'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          customization: response,
        };
      });
      // Invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ['chatbot-settings'] });
      toast({
        title: 'Customization Saved',
        description: 'Your widget customization has been saved successfully.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to save customization. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    refetchSettings: settingsQuery.refetch,
    saveConfigurationAsync: saveConfigurationMutation.mutateAsync,
    saveCustomizationAsync: saveCustomizationMutation.mutateAsync,
    isSavingConfiguration: saveConfigurationMutation.isPending,
    isSavingCustomization: saveCustomizationMutation.isPending,
  };
}

