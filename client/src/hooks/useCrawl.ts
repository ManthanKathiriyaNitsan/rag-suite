import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crawlAPI, CrawlSiteData, CrawlSite, CrawlStatus, UrlPreview } from '@/lib/api';

// 🕷️ Crawl sites hook - Get all crawling targets
export const useCrawlSites = () => {
  const queryClient = useQueryClient();

  // Get all crawl sites
  const sitesQuery = useQuery({
    queryKey: ['crawl-sites'],
    queryFn: crawlAPI.getSites,
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });

  // Add a new site
  const addSiteMutation = useMutation({
    mutationFn: (siteData: CrawlSiteData) => crawlAPI.addSite(siteData),
    
    onSuccess: () => {
      console.log('✅ Site added successfully');
      // Refresh sites list
      queryClient.invalidateQueries({ queryKey: ['crawl-sites'] });
    },
    
    onError: (error) => {
      console.error('❌ Add site failed:', error);
    },
  });

  // Update a site
  const updateSiteMutation = useMutation({
    mutationFn: ({ id, siteData }: { id: string; siteData: CrawlSiteData }) => 
      crawlAPI.updateSite(id, siteData),
    
    onSuccess: () => {
      console.log('✅ Site updated successfully');
      // Refresh sites list
      queryClient.invalidateQueries({ queryKey: ['crawl-sites'] });
    },
    
    onError: (error) => {
      console.error('❌ Update site failed:', error);
    },
  });

  // Delete a site
  const deleteSiteMutation = useMutation({
    mutationFn: (id: string) => crawlAPI.deleteSite(id),
    
    onSuccess: () => {
      console.log('✅ Site deleted successfully');
      // Refresh sites list
      queryClient.invalidateQueries({ queryKey: ['crawl-sites'] });
    },
    
    onError: (error) => {
      console.error('❌ Delete site failed:', error);
    },
  });

  return {
    sites: sitesQuery.data || [],
    isLoading: sitesQuery.isLoading,
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
      refetchInterval: 2000, // Refetch every 2 seconds for live status
      staleTime: 1000, // Consider data stale after 1 second
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
  const statsQuery = useQuery({
    queryKey: ['crawl-stats'],
    queryFn: async () => {
      // This would be a separate endpoint for statistics
      // For now, we'll calculate from sites data
      const sites = await crawlAPI.getSites();
      return {
        totalSites: sites.length,
        activeSites: sites.filter((site: CrawlSite) => site.status === 'active').length,
        crawlingSites: sites.filter((site: CrawlSite) => site.status === 'crawling').length,
        totalPages: sites.reduce((sum: number, site: CrawlSite) => sum + (site.pagesCrawled || 0), 0),
        lastCrawled: sites
          .filter((site: CrawlSite) => site.lastCrawled)
          .sort((a: CrawlSite, b: CrawlSite) => 
            new Date(b.lastCrawled || '').getTime() - new Date(a.lastCrawled || '').getTime()
          )[0]?.lastCrawled,
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};
