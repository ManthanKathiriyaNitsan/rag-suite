import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  onboardingAPI,
  OnboardingBranding,
  OnboardingProject,
  OnboardingDataSource,
  OnboardingTestQuery,
  OnboardingStatus,
  SuggestionResponse,
} from '@/services/api/api';
import { useToast } from '@/hooks/useToast';

export const useOnboardingAPI = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get onboarding status
  const statusQuery = useQuery<OnboardingStatus, Error>({
    queryKey: ['onboarding', 'status'],
    queryFn: onboardingAPI.getStatus,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Get branding
  const brandingQuery = useQuery({
    queryKey: ['onboarding', 'branding'],
    queryFn: onboardingAPI.getBranding,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Save branding mutation
  const saveBrandingMutation = useMutation({
    mutationFn: (branding: OnboardingBranding) => onboardingAPI.saveBranding(branding),
    onSuccess: (response, variables) => {
      // Update the query cache immediately with the saved data
      queryClient.setQueryData(['onboarding', 'branding'], {
        ...response,
        org_name: variables.org_name,
        logo_data_url: variables.logo_data_url || null,
        primary_color: variables.primary_color || null,
        has_logo: !!variables.logo_data_url,
        has_color: !!variables.primary_color,
      });
      // Also invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'branding'] });
      toast({
        title: 'Branding Saved',
        description: 'Your branding configuration has been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to save branding. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (project: OnboardingProject) => onboardingAPI.createProject(project),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project Created',
        description: `"${data.name}" has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Create data source mutation
  const createDataSourceMutation = useMutation({
    mutationFn: (dataSource: OnboardingDataSource) => onboardingAPI.createDataSource(dataSource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['crawl', 'sites'] });
      toast({
        title: 'Data Source Created',
        description: 'Your data source has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to create data source. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Test query mutation
  const testQueryMutation = useMutation({
    mutationFn: (testData: OnboardingTestQuery) => onboardingAPI.testQuery(testData),
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to test query. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: () => onboardingAPI.completeOnboarding(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['crawl', 'sites'] });
      toast({
        title: 'Onboarding Completed!',
        description: data.message || 'Your project is ready to use.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Get suggestions query
  const suggestionsQuery = useQuery<SuggestionResponse, Error>({
    queryKey: ['onboarding', 'suggestions'],
    queryFn: () => {
      const projectId = statusQuery.data?.project_id;
      if (!projectId) {
        throw new Error('No project ID available');
      }
      return onboardingAPI.getSuggestions(projectId, 4);
    },
    enabled: !!statusQuery.data?.project_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    // Status
    status: statusQuery.data,
    isLoadingStatus: statusQuery.isLoading,
    statusError: statusQuery.error,
    refetchStatus: statusQuery.refetch,

    // Branding
    branding: brandingQuery.data,
    isLoadingBranding: brandingQuery.isLoading,
    brandingQueryError: brandingQuery.error,
    refetchBranding: brandingQuery.refetch,
    saveBranding: saveBrandingMutation.mutate,
    saveBrandingAsync: saveBrandingMutation.mutateAsync,
    isSavingBranding: saveBrandingMutation.isPending,
    saveBrandingError: saveBrandingMutation.error,

    // Project
    createProject: createProjectMutation.mutate,
    createProjectAsync: createProjectMutation.mutateAsync,
    isCreatingProject: createProjectMutation.isPending,
    projectError: createProjectMutation.error,

    // Data Source
    createDataSource: createDataSourceMutation.mutate,
    createDataSourceAsync: createDataSourceMutation.mutateAsync,
    isCreatingDataSource: createDataSourceMutation.isPending,
    dataSourceError: createDataSourceMutation.error,

    // Test Query
    testQuery: testQueryMutation.mutate,
    testQueryAsync: testQueryMutation.mutateAsync,
    isTestingQuery: testQueryMutation.isPending,
    testQueryData: testQueryMutation.data,
    testQueryError: testQueryMutation.error,

    // Suggestions
    suggestions: suggestionsQuery.data?.suggestions || [],
    isLoadingSuggestions: suggestionsQuery.isLoading,
    suggestionsError: suggestionsQuery.error,
    refetchSuggestions: suggestionsQuery.refetch,

    // Complete Onboarding
    completeOnboarding: completeOnboardingMutation.mutate,
    completeOnboardingAsync: completeOnboardingMutation.mutateAsync,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
    completeOnboardingData: completeOnboardingMutation.data,
    completeOnboardingError: completeOnboardingMutation.error,
  };
};

