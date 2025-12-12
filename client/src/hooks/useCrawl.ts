import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { crawlAPI, CrawlSiteData, CrawlSite, CrawlStatus, UrlPreview } from '@/services/api/api';

// 🕷️ Crawl sites hook - Get all crawling targets
export const useCrawlSites = () => {
  const queryClient = useQueryClient();

  // Get all crawl sites
  const sitesQuery = useQuery({
    queryKey: ["crawl-sites"],
    queryFn: crawlAPI.getSites,
    placeholderData: (prev) => prev ?? [],
  });

  // Add a new site
  const addSiteMutation = useMutation({
    mutationFn: (siteData: CrawlSiteData) => crawlAPI.addSite(siteData),
    
    onSuccess: (data) => {
      console.log('✅ Site added successfully:', data);
      console.log('🔄 Invalidating queries to trigger refetch...');
      // Just invalidate - React Query will refetch with placeholderData keeping old data visible
      // This prevents the undefined error because placeholderData ensures data is never undefined
      queryClient.invalidateQueries({ 
        queryKey: ['crawl-sites'],
        exact: true
      });
      console.log('✅ Queries invalidated, refetch should start soon');
    },
    
    onError: (error: any) => {
      console.error('❌ Add site failed:', error);
      // Show user-friendly error message
      if (error.response?.status === 401) {
        console.error('🔐 Authentication required. Please log in again.');
      } else if (error.response?.status === 400) {
        console.error('📝 Invalid site data. Please check your input.');
      } else if (error.response?.status === 409) {
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
