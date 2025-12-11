import React, { useState, useMemo, useRef, useEffect } from "react";
import { MoreHorizontal, Eye, Edit, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VirtualizedTable } from "@/components/ui/VirtualizedTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { CrawlSite, crawlAPI } from "@/services/api/api";

// 🕷️ Updated interface to match API data
interface CrawlSourceTableProps {
  sites: CrawlSite[];
  isLoading: boolean;
  isRefetching?: boolean;
  isFetching?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStartCrawl: (id: string) => void;
  isStarting: boolean;
  isDeleting: boolean;
}

const CrawlSourceTable = React.memo(function CrawlSourceTable({ 
  sites, 
  isLoading,
  isRefetching = false,
  isFetching = false, 
  onEdit, 
  onDelete, 
  onStartCrawl, 
  isStarting, 
  isDeleting 
}: CrawlSourceTableProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Track if we've ever had data - this helps detect refetch vs initial load
  // CRITICAL: Update this synchronously during render, not in useEffect
  // useEffect runs AFTER render, so the refetch check would miss it
  const hasHadDataRef = useRef(false);
  
  // Update ref synchronously during render if we have data
  // This ensures the refetch check can see it immediately
  if (sites && Array.isArray(sites) && sites.length > 0) {
    hasHadDataRef.current = true;
  }

  const getStatusBadge = (status: string): { variant: "default" | "secondary" | "destructive" | "outline"; className: string } => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "active":
        // User request: Active should be blue with white text
        return { variant: "outline", className: "bg-blue-600 text-white border-blue-600" };
      case "pending":
        return { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" };
      case "inactive":
        return { variant: "secondary", className: "bg-gray-100 text-gray-700" };
      case "crawling":
      case "running":
        return { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" };
      case "error":
        // User request: Error should be red with white text
        return { variant: "destructive", className: "bg-red-600 text-white border-red-600" };
      default:
        return { variant: "secondary", className: "bg-gray-100 text-gray-700" };
    }
  };

  // 🕷️ Updated action handlers using real API functions
  const handleAction = (action: string, sourceId: string) => {
    console.log(`${action} action for source:`, sourceId);
    
    switch (action) {
      case "preview":
        toast({
          title: "Preview Render",
          description: "Opening preview window for source crawl simulation",
        });
        break;
      case "edit":
        onEdit(sourceId);
        break;
      case "crawl":
        onStartCrawl(sourceId);
        break;
      case "delete":
        onDelete(sourceId);
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  // Ensure sites is an array and filter out any invalid entries
  // CRITICAL: Always return an array, never undefined/null
  const safeSites = useMemo(() => {
    console.log('🔍 CrawlSourceTable - Processing sites:', {
      sites,
      sitesType: typeof sites,
      isArray: Array.isArray(sites),
      length: Array.isArray(sites) ? sites.length : 'N/A',
      isFetching,
      isLoading,
      hasHadData: hasHadDataRef.current
    });
    
    if (!sites) {
      console.warn('⚠️ CrawlSourceTable: sites is falsy, returning empty array');
      return [];
    }
    if (!Array.isArray(sites)) {
      console.warn('⚠️ CrawlSourceTable: sites is not an array, got:', typeof sites);
      return [];
    }
    // Filter out null/undefined and ensure each site has an id
    const filtered = sites.filter((site) => site != null && site.id);
    console.log('✅ CrawlSourceTable - Filtered sites:', {
      originalLength: sites.length,
      filteredLength: filtered.length
    });
    return filtered;
  }, [sites, isFetching, isLoading]);

  // CRITICAL: Prevent rendering VirtualizedTable during ANY refetch operation
  // Check isFetching FIRST - if we're fetching and we've had data, it's a refetch
  // This prevents react-window from receiving undefined data during refetch transitions
  // The key is checking isFetching BEFORE processing the data
  if (isFetching && hasHadDataRef.current) {
    // We're refetching (we've had data before) - don't render table
    // This prevents the brief moment when data becomes undefined during refetch
    console.log('🔄 Refetch detected - showing loading state to prevent undefined error', {
      isRefetching,
      isFetching,
      isLoading,
      hasHadData: hasHadDataRef.current,
      sitesLength: sites?.length || 0,
      safeSitesLength: safeSites?.length || 0
    });
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Crawl Sources
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Refreshing data...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // ADDITIONAL SAFETY: If sites is undefined/null but we've had data, we're in a transition
  // Don't render table during this transition
  if ((!sites || (Array.isArray(sites) && sites.length === 0)) && hasHadDataRef.current && !isLoading) {
    console.log('⚠️ Sites is empty but we had data before - transition state, showing loading', {
      sites,
      hasHadData: hasHadDataRef.current,
      isLoading
    });
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Crawl Sources
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Refreshing data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state if initial load and no data
  if (isLoading && (!safeSites || safeSites.length === 0)) {
    return (
      <Card className="w-full overflow-hidden">
        <CardContent>
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading sites...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Additional safety check: Don't render table if sites is invalid
  // This prevents the error during refetch transitions
  if (!safeSites || !Array.isArray(safeSites) || safeSites.length === 0) {
    return (
      <Card className="w-full overflow-hidden">
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              No crawl sites found. Add your first site to get started.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Crawl Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-2 p-2">
          🚀 Virtualized table for optimal performance with large datasets
        </div>
        <VirtualizedTable
            data={safeSites}
            columns={[
          {
            key: 'url',
            label: 'URL',
            width: 250,
            render: (site: CrawlSite) => (
              <div className="flex flex-col">
                <span className="font-medium">{site?.name || 'Unnamed'}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {site?.url ? crawlAPI.normalizeUrl(site.url) : 'No URL'}
                </span>
              </div>
            ),
          },
          {
            key: 'depth',
            label: 'Depth',
            width: 80,
            render: (site: CrawlSite) => site.crawlDepth || 'Auto',
          },
          {
            key: 'cadence',
            label: 'Cadence',
            width: 100,
            render: (site: CrawlSite) => site.cadence ?? 'ONCE',
          },
          {
            key: 'headless',
            label: 'Headless Mode',
            width: 120,
            render: (site: CrawlSite) => (
              <Badge variant="outline" className="text-xs">
                {site.headlessMode ?? 'AUTO'}
              </Badge>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            width: 100,
            render: (site: CrawlSite) => {
              const status = site?.status || 'unknown';
              const badge = getStatusBadge(status);
              return (
                <Badge variant={badge.variant} className={`text-xs ${badge.className}`}>
                  {status}
                </Badge>
              );
            },
          },
          {
            key: 'lastCrawl',
            label: 'Last Crawl',
            width: 120,
            render: (site: CrawlSite) => (
              <div className="text-sm text-muted-foreground">
                {site.lastCrawled ? 
                  new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                    Math.floor((new Date(site.lastCrawled).getTime() - Date.now()) / (1000 * 60 * 60)),
                    "hour"
                  ) : 'Never'
                }
              </div>
            ),
          },
          {
            key: 'documents',
            label: 'Documents',
            width: 100,
            render: (site: CrawlSite) => site.pagesCrawled || 0,
          },
          {
            key: 'actions',
            label: '',
            width: 50,
            render: (site: CrawlSite) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`button-actions-${site.id}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleAction("preview", site.id)}
                    data-testid={`action-preview-${site.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Render
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAction("edit", site.id)}
                    data-testid={`action-edit-${site.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAction("crawl", site.id)}
                    data-testid={`action-crawl-${site.id}`}
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Start Crawl
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAction("delete", site.id)}
                    data-testid={`action-delete-${site.id}`}
                    disabled={isDeleting}
                    className="text-destructive"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        height={400}
        itemHeight={60}
        className="min-w-[800px]"
        onRowClick={(site: CrawlSite) => handleAction("edit", site.id)}
      />
      </CardContent>
    </Card>
  );
});

export default CrawlSourceTable;
