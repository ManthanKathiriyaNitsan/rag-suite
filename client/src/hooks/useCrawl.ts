import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { crawlAPI, CrawlSiteData, CrawlSite, CrawlStatus, UrlPreview } from '@/services/api/api';

// 🕷️ Crawl sites hook - Get all crawling targets
export const useCrawlSites = () => {
  const queryClient = useQueryClient();

  // Get all crawl sites
  const sitesQuery = useQuery({
    queryKey: ["crawl-sites"],
    queryFn: async () => {
      console.log('🔄 useCrawlSites - Fetching sites from API...');
      const result = await crawlAPI.getSites();
      console.log('✅ useCrawlSites - Received sites:', result?.length || 0);
      return result;
    },
    placeholderData: (prev) => prev ?? [],
    // Always refetch on mount to ensure fresh data when navigating to /crawl
    refetchOnMount: 'always',
    // Ensure query is enabled and will fetch
    enabled: true,
    // Use a reasonable staleTime (5 minutes) instead of Infinity
    // This allows refetch on mount while still caching data
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add a new site
  const addSiteMutation = useMutation({
    mutationFn: (siteData: CrawlSiteData) => crawlAPI.addSite(siteData),
    
    // Optimistic update - add the site immediately to the cache
    onMutate: async (newSiteData) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['crawl-sites'] });
      
      // Snapshot the previous value
      const previousSites = queryClient.getQueryData<CrawlSite[]>(['crawl-sites']);
      
      // Optimistically add the new site to the cache
      if (previousSites) {
        // Create a temporary site object with the data we have
        const optimisticSite: CrawlSite = {
          id: `temp-${Date.now()}`,
          name: newSiteData.name,
          url: newSiteData.url,
          description: newSiteData.description || '',
          crawlDepth: newSiteData.crawlDepth || 2,
          cadence: newSiteData.cadence || 'ONCE',
          headlessMode: newSiteData.headlessMode || 'AUTO',
          status: 'inactive', // Use 'inactive' instead of 'pending' to match type
          pagesCrawled: 0,
          lastCrawled: undefined, // Use undefined instead of null
          includePatterns: newSiteData.includePatterns || [],
          excludePatterns: newSiteData.excludePatterns || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData<CrawlSite[]>(['crawl-sites'], (old = []) => {
          return [optimisticSite, ...old];
        });
      }
      
      // Return context with the previous value
      return { previousSites };
    },
    
    onSuccess: (data) => {
      console.log('✅ Site added successfully:', data);
      console.log('🔄 Invalidating queries to trigger refetch...');
      // Invalidate to refetch and get the real data from server
      queryClient.invalidateQueries({ 
        queryKey: ['crawl-sites'],
        exact: true
      });
      console.log('✅ Queries invalidated, refetch should start soon');
    },
    
    // If mutation fails, rollback to previous state
    onError: (err: any, newSiteData, context) => {
      // Rollback optimistic update
      if (context?.previousSites) {
        queryClient.setQueryData(['crawl-sites'], context.previousSites);
      }
      
      console.error('❌ Add site failed:', err);
      // Show user-friendly error message
      if (err.response?.status === 401) {
        console.error('🔐 Authentication required. Please log in again.');
      } else if (err.response?.status === 400) {
        console.error('📝 Invalid site data. Please check your input.');
      } else if (err.response?.status === 409) {
        console.error('🔄 Site already exists. Please choose a different name.');
      } else {
        console.error('🌐 Network error. Please check your connection.');
      }
      // Don't throw - let the component handle the error via the promise rejection
    },
  });

  // Update a site
  const updateSiteMutation = useMutation({
    mutationFn: ({ id, siteData }: { id: string; siteData: CrawlSiteData }) => 
      crawlAPI.updateSite(id, siteData),
    
    onSuccess: (data) => {
      console.log('✅ Site updated successfully:', data);
      // Refresh sites list
      queryClient.invalidateQueries({ queryKey: ['crawl-sites'] });
    },
    
    onError: (error: any) => {
      console.error('❌ Update site failed:', error);
      // Show user-friendly error message
      if (error.response?.status === 401) {
        console.error('🔐 Authentication required. Please log in again.');
      } else if (error.response?.status === 404) {
        console.error('🔍 Site not found. It may have been deleted.');
      } else if (error.response?.status === 400) {
        console.error('📝 Invalid site data. Please check your input.');
      } else {
        console.error('🌐 Network error. Please check your connection.');
      }
    },
  });

  // Delete a site
  const deleteSiteMutation = useMutation({
    mutationFn: (id: string) => crawlAPI.deleteSite(id),
    
    onSuccess: (data) => {
      console.log('✅ Site deleted successfully:', data);
      // Refresh sites list
      queryClient.invalidateQueries({ queryKey: ['crawl-sites'] });
    },
    
    onError: (error: any) => {
      console.error('❌ Delete site failed:', error);
      // Show user-friendly error message
      if (error.response?.status === 401) {
        console.error('🔐 Authentication required. Please log in again.');
      } else if (error.response?.status === 404) {
        console.error('🔍 Site not found. It may have been deleted.');
      } else if (error.response?.status === 403) {
        console.error('🚫 Permission denied. You cannot delete this site.');
      } else {
        console.error('🌐 Network error. Please check your connection.');
      }
    },
  });

  // Get the current data, ensuring it's always an array
  // placeholderData in query config will automatically be used if data is undefined
  // CRITICAL: This ensures we NEVER return undefined, even during refetch transitions
  const currentSites = useMemo(() => {
    // sitesQuery.data will use placeholderData automatically if configured
    // But we add an extra safety check here to be absolutely sure
    const data = sitesQuery.data;
    console.log('🔍 useCrawl - Processing query data:', {
      data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : 'N/A',
      isFetching: sitesQuery.isFetching,
      isLoading: sitesQuery.isLoading,
      status: sitesQuery.status
    });
    
    if (data === undefined || data === null) {
      // If data is undefined/null, placeholderData should have kicked in
      // But as a safety net, return empty array
      console.warn('⚠️ sitesQuery.data is undefined/null, using empty array as fallback');
      return [];
    }
    if (Array.isArray(data)) {
      // CRITICAL: Filter out any invalid entries to ensure all items are valid objects
      // This prevents react-window from receiving invalid data structures
      const validData = data.filter((item: any) => 
        item != null && 
        typeof item === 'object' && 
        item.id != null &&
        typeof item.id === 'string'
      );
      console.log('✅ useCrawl - Returning valid array with', validData.length, 'items (filtered from', data.length, ')');
      return validData;
    }
    // Fallback to empty array if data is not an array
    console.warn('⚠️ sitesQuery.data is not an array, got:', typeof data);
    return [];
  }, [sitesQuery.data, sitesQuery.isFetching, sitesQuery.isLoading, sitesQuery.status]);

  return {
    // Ensure sites is always an array, even during refetch
    sites: currentSites,
    isLoading: sitesQuery.isLoading || sitesQuery.isFetching,
    isRefetching: sitesQuery.isFetching && !sitesQuery.isLoading,
    isFetching: sitesQuery.isFetching, // Expose isFetching directly for more precise control
    error: sitesQuery.error,
    refetch: sitesQuery.refetch,
    
    // Mutations
    addSite: addSiteMutation.mutate,
    addSiteAsync: addSiteMutation.mutateAsync,
    isAdding: addSiteMutation.isPending,
    addSiteError: addSiteMutation.error,
    
    updateSite: updateSiteMutation.mutate,
    updateSiteAsync: updateSiteMutation.mutateAsync,
    isUpdating: updateSiteMutation.isPending,
    updateSiteError: updateSiteMutation.error,
    
    deleteSite: deleteSiteMutation.mutate,
    deleteSiteAsync: deleteSiteMutation.mutateAsync,
    isDeleting: deleteSiteMutation.isPending,
    deleteSiteError: deleteSiteMutation.error,
  };
};

// 🚀 Crawl operations hook - Start crawl and check status
export const useCrawlOperations = () => {
  const queryClient = useQueryClient();

  // Start crawling job
  const startCrawlMutation = useMutation({
    mutationFn: (id: string) => crawlAPI.startCrawl(id),
    
    onSuccess: (data, id) => {
      console.log('✅ Crawl started successfully for site:', id);
      // Refresh sites list to update status
      queryClient.invalidateQueries({ queryKey: ['crawl-sites'] });
      // Invalidate status query for this specific site
      queryClient.invalidateQueries({ queryKey: ['crawl-status', id] });
    },
    
    onError: (error) => {
      console.error('❌ Start crawl failed:', error);
    },
  });

  // Get crawl status for a specific site
  const getCrawlStatus = (id: string) => {
    return useQuery({
      queryKey: ['crawl-status', id],
      queryFn: () => crawlAPI.getCrawlStatus(id),
      enabled: !!id,
      // Disable automatic polling for status as requested
      refetchInterval: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });
  };

  return {
    startCrawl: startCrawlMutation.mutate,
    startCrawlAsync: startCrawlMutation.mutateAsync,
    isStarting: startCrawlMutation.isPending,
    startCrawlError: startCrawlMutation.error,
    
    getCrawlStatus,
  };
};

// 👁️ URL preview hook - Preview URL content
export const useUrlPreview = () => {
  const previewMutation = useMutation({
    mutationFn: (url: string) => crawlAPI.previewUrl(url),
    
    onSuccess: (data) => {
      console.log('✅ URL preview retrieved:', data);
    },
    
    onError: (error) => {
      console.error('❌ URL preview failed:', error);
    },
  });

  return {
    previewUrl: previewMutation.mutate,
    previewUrlAsync: previewMutation.mutateAsync,
    isPreviewing: previewMutation.isPending,
    previewData: previewMutation.data,
    previewError: previewMutation.error,
  };
};

// 📊 Crawl statistics hook - Get crawl statistics
export const useCrawlStats = () => {
  // Reuse the crawl-sites query cache to derive stats without additional network calls
  const sitesQuery = useQuery({
    queryKey: ['crawl-sites'],
    queryFn: async () => {
      try {
        const result = await crawlAPI.getSites();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('❌ Error in stats query:', error);
        return [];
      }
    },
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialData: [],
    placeholderData: (previousData) => previousData || [],
    throwOnError: false,
  });

  // Ensure sites is always an array
  const sites = Array.isArray(sitesQuery.data) ? (sitesQuery.data as CrawlSite[]) : [];
  
  // 📊 Memoized crawl statistics
  const stats = useMemo(() => {
    // Additional safety check
    if (!Array.isArray(sites) || sites.length === 0) {
      return {
        totalSites: 0,
        activeSites: 0,
        crawlingSites: 0,
        totalPages: 0,
        lastCrawled: undefined,
      };
    }
    
    const activeSites = sites.filter((site: CrawlSite) => site && site.status === 'active');
    const crawlingSites = sites.filter((site: CrawlSite) => site && site.status === 'crawling');
    const totalPages = sites.reduce((sum: number, site: CrawlSite) => {
      if (!site) return sum;
      return sum + (site.pagesCrawled || 0);
    }, 0);
    
    const lastCrawled = sites
      .filter((site: CrawlSite) => site && site.lastCrawled)
      .sort((a: CrawlSite, b: CrawlSite) => {
        const aTime = a.lastCrawled ? new Date(a.lastCrawled).getTime() : 0;
        const bTime = b.lastCrawled ? new Date(b.lastCrawled).getTime() : 0;
        return bTime - aTime;
      })[0]?.lastCrawled;
    
    return {
      totalSites: sites.length,
      activeSites: activeSites.length,
      crawlingSites: crawlingSites.length,
      totalPages,
      lastCrawled,
    };
  }, [sites]);

  return {
    stats,
    isLoading: sitesQuery.isLoading,
    error: sitesQuery.error,
    refetch: sitesQuery.refetch,
  };
};
