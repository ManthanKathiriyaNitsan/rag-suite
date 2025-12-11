import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { crawlAPI, CrawlSiteData, CrawlSite, CrawlStatus, UrlPreview } from '@/services/api/api';

// 🕷️ Crawl sites hook - Get all crawling targets
export const useCrawlSites = () => {
  const queryClient = useQueryClient();

  // Get all crawl sites
  const sitesQuery = useQuery({
    queryKey: ['crawl-sites'],
    queryFn: async () => {
      try {
        const result = await crawlAPI.getSites();
        // Ensure we always return an array
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('❌ Error in sitesQuery:', error);
        // Return empty array on error to prevent crashes
        return [];
      }
    },
    // Disable automatic polling/refresh; fetch once unless manually invalidated
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Set initial data to empty array to prevent undefined
    initialData: [],
    // Keep previous data while refetching to prevent undefined during transitions
    placeholderData: (previousData) => previousData || [],
    // Don't throw errors, just return empty array
    throwOnError: false,
  });

  // Add a new site
  const addSiteMutation = useMutation({
    mutationFn: (siteData: CrawlSiteData) => crawlAPI.addSite(siteData),
    
    onSuccess: (data) => {
      console.log('✅ Site added successfully:', data);
      // Refresh sites list - this will trigger a refetch
      // placeholderData ensures we keep previous data during refetch
      queryClient.invalidateQueries({ queryKey: ['crawl-sites'] });
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

  return {
    // Ensure sites is always an array, even during refetch
    sites: Array.isArray(sitesQuery.data) ? sitesQuery.data : [],
    isLoading: sitesQuery.isLoading || sitesQuery.isFetching,
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
