import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI, SettingsRequest, SettingsResponse } from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export function useSettingsAPI() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get settings
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingsAPI.getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (settings: SettingsRequest) => settingsAPI.saveSettings(settings),
    onSuccess: (response, variables) => {
      // Update the query cache immediately with the saved data
      queryClient.setQueryData(['settings'], response);
      // Also invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to save settings. Please try again.',
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
    saveSettingsAsync: saveSettingsMutation.mutateAsync,
    isSaving: saveSettingsMutation.isPending,
  };
}

