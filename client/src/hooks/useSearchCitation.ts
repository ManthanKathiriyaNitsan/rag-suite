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

  // Get search citation settings
  const citationQuery = useQuery({
    queryKey: ['search-citation'],
    queryFn: async () => {
      console.log('🔍 useSearchCitation - Fetching citation settings...');
      const apiData = await searchAPI.getSearchCitation();
      console.log('🔍 useSearchCitation - API data received:', apiData);
      const mappedData = mapApiToFrontend(apiData);
      console.log('🔍 useSearchCitation - Mapped data:', mappedData);
      return mappedData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
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

