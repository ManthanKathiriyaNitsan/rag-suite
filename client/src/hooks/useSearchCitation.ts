import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchAPI } from '@/services/api/api';
import { useToast } from '@/hooks/useToast';
import { CitationFormattingOptions } from '@/contexts/CitationFormattingContext';

// Map API response to frontend format
function mapApiToFrontend(apiData: any): CitationFormattingOptions {
  return {
    style: apiData.citation_style || 'detailed',
    layout: apiData.layout || 'vertical',
    numbering: apiData.numbering_style || 'brackets',
    colorScheme: apiData.color_scheme || 'default',
    showSnippets: apiData.show_snippets !== undefined ? apiData.show_snippets : true,
    showUrls: apiData.show_urls !== undefined ? apiData.show_urls : true,
    showSourceCount: apiData.show_source_count !== undefined ? apiData.show_source_count : true,
    enableHover: apiData.enable_hover_effects !== undefined ? apiData.enable_hover_effects : true,
    maxSnippetLength: apiData.max_snippet_length || 150,
  };
}

// Map frontend format to API format
function mapFrontendToApi(frontendData: Partial<CitationFormattingOptions>): {
  citation_style: string;
  layout: string;
  numbering_style: string;
  color_scheme: string;
  show_snippets: boolean;
  show_urls: boolean;
  show_source_count: boolean;
  enable_hover_effects: boolean;
  max_snippet_length: number;
} {
  return {
    citation_style: frontendData.style || 'detailed',
    layout: frontendData.layout || 'vertical',
    numbering_style: frontendData.numbering || 'brackets',
    color_scheme: frontendData.colorScheme || 'default',
    show_snippets: frontendData.showSnippets !== undefined ? frontendData.showSnippets : true,
    show_urls: frontendData.showUrls !== undefined ? frontendData.showUrls : true,
    show_source_count: frontendData.showSourceCount !== undefined ? frontendData.showSourceCount : true,
    enable_hover_effects: frontendData.enableHover !== undefined ? frontendData.enableHover : true,
    max_snippet_length: frontendData.maxSnippetLength || 150,
  };
}

export function useSearchCitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Track if we've encountered a 401 error to stop polling
  const [has401Error, setHas401Error] = React.useState(false);

  // Get search citation settings with real-time polling
  const citationQuery = useQuery({
    queryKey: ['search-citation'],
    queryFn: async () => {
      console.log('🔍 useSearchCitation - Fetching citation settings...');
      try {
        const apiData = await searchAPI.getSearchCitation();
        console.log('🔍 useSearchCitation - API data received:', apiData);
        const mappedData = mapApiToFrontend(apiData);
        console.log('🔍 useSearchCitation - Mapped data:', mappedData);
        setHas401Error(false); // Reset error flag on success
        return mappedData;
      } catch (error: any) {
        // If error is 401 in widget mode, API already returns defaults
        // But if it's a different error, return defaults here too
        const isWidgetMode = typeof window !== 'undefined' && !!(window as any).RAGSUITE_PROJECT_ID;
        if (isWidgetMode && error?.response?.status === 401) {
          console.log('ℹ️ useSearchCitation - 401 in widget mode, using default citation settings');
          setHas401Error(true);
          return mapApiToFrontend({
            citation_style: 'detailed',
            layout: 'vertical',
            numbering_style: 'brackets',
            color_scheme: 'default',
            show_snippets: true,
            show_urls: true,
            show_source_count: true,
            enable_hover_effects: true,
            max_snippet_length: 150,
          });
        }
        throw error;
      }
    },
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    refetchInterval: has401Error ? false : 5000, // Poll every 5 seconds for live updates (same as config/customization)
  });

  // Save search citation settings mutation
  const saveCitationMutation = useMutation({
    mutationFn: async (config: Partial<CitationFormattingOptions>) => {
      const apiConfig = mapFrontendToApi(config);
      await searchAPI.saveSearchCitation(apiConfig);
      return config;
    },
    onSuccess: async (response) => {
      console.log('🔍 useSearchCitation - Save successful, response:', response);
      
      // Convert the saved response to API format and then back to frontend format
      // to ensure consistency
      const apiFormat = mapFrontendToApi(response as CitationFormattingOptions);
      const frontendFormat = mapApiToFrontend(apiFormat);
      
      // Update the query cache with the new config immediately for better UX
      queryClient.setQueryData<CitationFormattingOptions>(['search-citation'], frontendFormat);
      console.log('🔍 useSearchCitation - Updated cache with:', frontendFormat);
      
      // Refetch from server to ensure we have the latest data
      // Use a small delay to ensure backend has processed the save
      setTimeout(async () => {
        console.log('🔍 useSearchCitation - Refetching from server after save...');
        try {
          const refetched = await queryClient.refetchQueries({ queryKey: ['search-citation'] });
          console.log('🔍 useSearchCitation - Refetch result:', refetched);
        } catch (refetchError) {
          console.error('❌ useSearchCitation - Refetch failed:', refetchError);
        }
      }, 300);
      
      toast({
        title: 'Citation Settings Saved',
        description: 'Your citation formatting preferences have been saved successfully.',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || error?.response?.data?.message || 'Failed to save citation settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    formatting: citationQuery.data,
    isLoading: citationQuery.isLoading,
    isError: citationQuery.isError,
    error: citationQuery.error,
    refetch: citationQuery.refetch,
    updateFormatting: (newFormatting: Partial<CitationFormattingOptions>) => {
      // Update local state immediately for better UX
      queryClient.setQueryData<CitationFormattingOptions>(['search-citation'], (oldData) => {
        return {
          ...oldData,
          ...newFormatting,
        } as CitationFormattingOptions;
      });
    },
    saveCitationAsync: saveCitationMutation.mutateAsync,
    isSaving: saveCitationMutation.isPending,
  };
}

