import { useMutation } from '@tanstack/react-query';
import { searchAPI, SearchResponse } from '@/lib/api';

// 🎣 Custom hook for search functionality
export const useSearch = () => {
  // 🔄 Mutation hook - This handles API calls with loading states
  const searchMutation = useMutation({
    // This function is called when you want to search
    mutationFn: ({ query, ragSettings }: { 
      query: string; 
      ragSettings?: {
        topK?: number;
        similarityThreshold?: number;
        useReranker?: boolean;
        maxTokens?: number;
      };
    }) => searchAPI.search(query, ragSettings),
    
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
    search: (query: string, ragSettings?: any) => searchMutation.mutate({ query, ragSettings }),        // Function to call search
    searchAsync: (query: string, ragSettings?: any) => searchMutation.mutateAsync({ query, ragSettings }),  // Function that returns a promise
    isSearching: searchMutation.isPending,   // True when searching
    searchData: searchMutation.data,         // The API response
    searchError: searchMutation.error,       // Any error that occurred
    reset: searchMutation.reset,             // Clear the search state
  };
};
