import { useMutation } from '@tanstack/react-query';
import { searchAPI, SearchResponse } from '@/services/api/api';

// 🎣 Custom hook for search functionality
export const useSearch = () => {
  // 🔄 Mutation hook - This handles API calls with loading states
  const searchMutation = useMutation({
    // This function is called when you want to search
    mutationFn: ({ query, ragSettings, responseType }: { 
      query: string; 
      ragSettings?: {
        topK?: number;
        similarityThreshold?: number;
        useReranker?: boolean;
        maxTokens?: number;
      };
      responseType?: 'long' | 'short';
    }) => searchAPI.search(query, ragSettings, responseType),
    
    // This runs when search is successful
    onSuccess: (data: SearchResponse) => {
      console.log('✅ Search successful:', data);
    },
    
    // This runs when search fails
    onError: (error) => {
      console.error('❌ Search failed:', error);
    },
  });

  // Return everything you need to use in components
  return {
    search: (query: string, ragSettings?: any, responseType?: 'long' | 'short') => searchMutation.mutate({ query, ragSettings, responseType }),        // Function to call search
    searchAsync: (query: string, ragSettings?: any, responseType?: 'long' | 'short') => searchMutation.mutateAsync({ query, ragSettings, responseType }),  // Function that returns a promise
    isSearching: searchMutation.isPending,   // True when searching
    searchData: searchMutation.data,         // The API response
    searchError: searchMutation.error,       // Any error that occurred
    reset: searchMutation.reset,             // Clear the search state
  };
};
