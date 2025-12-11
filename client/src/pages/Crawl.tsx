import React, { useEffect, useState, useMemo, Suspense, lazy } from "react";
import { Plus, Filter, Play, Pause, Trash2, Edit, Eye, Loader2, Search, X } from "lucide-react";

// 🚀 Lazy load heavy crawl components
const AddSourceForm = lazy(() => import("@/components/forms/AddSourceForm"));
const CrawlSourceTable = lazy(() => import("@/components/features/documents/CrawlSourceTable"));
const CrawlJobs = lazy(() => import("@/components/features/documents/CrawlJobs"));
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCrawlSites, useCrawlOperations, useCrawlStats } from "@/hooks/useCrawl";
import { CrawlSiteData } from "@/services/api/api";

export default function Crawl() {
  const [activeTab, setActiveTab] = useState("sources");
  const [showAddSourceForm, setShowAddSourceForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [editingSite, setEditingSite] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cadenceFilter, setCadenceFilter] = useState("all");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  
  const { toast } = useToast();
  const { t } = useTranslation();

  // 🕷️ Use crawl hooks
  const {
    sites,
    isLoading: sitesLoading,
    isRefetching: sitesRefetching,
    isFetching: sitesFetching,
    error: sitesError,
    addSite,
    addSiteAsync,
    updateSite,
    updateSiteAsync,
    deleteSite,
    deleteSiteAsync,
    isAdding,
    isUpdating,
    isDeleting,
  } = useCrawlSites();

  // 🔍 Debug: Log sites data to help diagnose issues
  useEffect(() => {
    console.log('🔍 Crawl Page - Sites data:', {
      sites,
      sitesType: typeof sites,
      isArray: Array.isArray(sites),
      length: Array.isArray(sites) ? sites.length : 'N/A',
      isLoading: sitesLoading,
      error: sitesError
    });
  }, [sites, sitesLoading, sitesError]);

  const {
    startCrawl,
    isStarting,
    getCrawlStatus,
  } = useCrawlOperations();

  const {
    stats,
    isLoading: statsLoading,
  } = useCrawlStats();

  // Filter and search logic
  // CRITICAL: Always return an array, never undefined/null
  const filteredSites = useMemo(() => {
    // Ensure sites is an array before filtering
    if (!sites) {
      return [];
    }
    if (!Array.isArray(sites)) {
      console.warn('Crawl: sites is not an array, got:', typeof sites);
      return [];
    }
    
    return sites.filter((site: any) => {
      // Ensure site is valid
      if (!site || !site.id) {
        return false;
      }
      
      // Search filter
      const matchesSearch = searchQuery === "" || 
        site.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || 
        site.status?.toLowerCase() === statusFilter.toLowerCase();
      
      // Cadence filter
      const matchesCadence = cadenceFilter === "all" || 
        site.cadence?.toLowerCase() === cadenceFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesCadence;
    });
  }, [sites, searchQuery, statusFilter, cadenceFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCadenceFilter("all");
    setJobStatusFilter("all");
    setDateFilter("today");
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || cadenceFilter !== "all" || jobStatusFilter !== "all" || dateFilter !== "today";

  // 🕷️ Crawl operation handlers
  const handleAddSite = async (siteData: CrawlSiteData) => {
    try {
      // Use addSiteAsync to properly await the mutation and handle errors
      await addSiteAsync(siteData);
      toast({
        title: "Site Added",
        description: `Successfully added ${siteData.name}`,
      });
      setShowAddSourceForm(false);
      // Note: The sites list will automatically refresh via query invalidation
      // React Query will refetch, but we use placeholderData to prevent undefined
    } catch (error: any) {
      console.error('❌ Add site error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add site. Please try again.",
        variant: "destructive",
      });
      // Don't close the form on error so user can retry
    }
  };

  const handleUpdateSite = async (id: string, siteData: CrawlSiteData) => {
    try {
      await updateSiteAsync({ id, siteData });
      toast({
        title: "Site Updated",
        description: "Site configuration updated successfully",
      });
      setEditingSite(null);
    } catch (error: any) {
      console.error('❌ Update site error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update site. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSite = async (id: string) => {
    try {
      await deleteSiteAsync(id);
      toast({
        title: "Site Deleted",
        description: "Site removed successfully",
      });
    } catch (error: any) {
      console.error('❌ Delete site error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete site. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartCrawl = async (id: string) => {
    try {
      await startCrawl(id);
      toast({
        title: "Crawl Started",
        description: "Crawling job has been initiated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start crawl. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "running":
      case "crawling":
        return "secondary";
      case "failed":
      case "error":
        return "destructive";
      case "active":
        return "outline";
      default:
        return "outline";
    }
  };


 

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 space-y-6 w-full max-w-full overflow-hidden min-w-0 p-0 sm:p-6" style={{ maxWidth: '92vw' }}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('crawl.title')}</h1>
          <p className="text-muted-foreground  ">
            {t('crawl.description')}
          </p>
        </div>
        <div className="relative">
          <Button
            onClick={() => setShowAddSourceForm(true)}
            data-testid="button-add-source"
            className="group"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sources" data-testid="tab-sources">Sources</TabsTrigger>
          <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4 w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 mt-3 lg:mt-0">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-sources"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            {/* Cadence Filter */}
            <Select value={cadenceFilter} onValueChange={setCadenceFilter}>
              <SelectTrigger className="w-40" data-testid="select-cadence-filter">
                <SelectValue placeholder="Cadence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cadence</SelectItem>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center gap-2"
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
            <CrawlSourceTable 
              sites={filteredSites}
              isLoading={sitesLoading}
              isRefetching={sitesRefetching}
              isFetching={sitesFetching}
              onEdit={setEditingSite}
              onDelete={handleDeleteSite}
              onStartCrawl={handleStartCrawl}
              isStarting={isStarting}
              isDeleting={isDeleting}
            />
          </Suspense>
        </TabsContent>




        <TabsContent value="jobs" className="space-y-4 w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-job-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40" data-testid="select-date-filter">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button for Jobs */}
            {(jobStatusFilter !== "all" || dateFilter !== "today") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setJobStatusFilter("all");
                  setDateFilter("today");
                }}
                className="flex items-center gap-2"
                data-testid="button-clear-job-filters"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
          <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
            <CrawlJobs 
              sites={sites || []} 
              statusFilter={jobStatusFilter}
              dateFilter={dateFilter}
          />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Add Source Form */}
      <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
        <AddSourceForm
          open={showAddSourceForm}
          onOpenChange={setShowAddSourceForm}
          onSubmit={handleAddSite}
        />
      </Suspense>

      {/* Edit Source Form */}
      {editingSite && (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
          <AddSourceForm
            open={!!editingSite}
            onOpenChange={(open) => {
              if (!open) setEditingSite(null);
            }}
          onSubmit={(data) => handleUpdateSite(editingSite, data)}
          editData={sites && Array.isArray(sites) ? (sites.find((s: any) => s?.id === editingSite) as any) : undefined}
        />
        </Suspense>
      )}
      </div>
    </div>
  );
}
