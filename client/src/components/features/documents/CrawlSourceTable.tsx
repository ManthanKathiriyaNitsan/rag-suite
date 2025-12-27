import React, { useState, useMemo, useRef } from "react";
import { MoreHorizontal, Eye, Edit, Play, Trash2, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

  const safeSites = useMemo(() => {
    return Array.isArray(sites) ? sites.filter(s => s != null) : [];
  }, [sites]);

  // CRITICAL: Prevent rendering VirtualizedTable during ANY refetch operation
  // This prevents react-window from receiving undefined data during transitions
  if (isFetching || isRefetching) {
    // If we've had data before, show loading state
    if (hasHadDataRef.current) {
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
    // If initial load, show loading state
    if (isLoading) {
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

  // CRITICAL: Additional safety check - Don't render table if sites is invalid
  // Show table if we have data, even during refetch (just show loading indicator in header)
  if (!safeSites || !Array.isArray(safeSites) || safeSites.length === 0) {
    // Only show empty state if we're not fetching (initial load) or if we have no data after fetch
    if (isLoading && !hasHadDataRef.current) {
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
        <CardTitle className="flex items-center gap-2">
          Crawl Sources
          {(isFetching || isRefetching) && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">URL</TableHead>
                <TableHead className="w-[80px]">Depth</TableHead>
                <TableHead className="w-[100px]">Cadence</TableHead>
                <TableHead className="w-[120px]">Headless Mode</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Training</TableHead>
                <TableHead className="w-[120px]">Last Crawl</TableHead>
                <TableHead className="w-[100px]">Links</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeSites.map((site: CrawlSite) => (
                <TableRow 
                  key={site.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => {
                    // Only trigger edit if click is not on a button or dropdown
                    const target = e.target as HTMLElement;
                    if (!target.closest('button') && !target.closest('[role="menuitem"]')) {
                      handleAction("edit", site.id);
                    }
                  }}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{site?.name || 'Unnamed'}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {site?.url ? crawlAPI.normalizeUrl(site.url) : 'No URL'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{site.crawlDepth || 'Auto'}</TableCell>
                  <TableCell>{site.cadence ?? 'ONCE'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {site.headlessMode ?? 'AUTO'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      {(() => {
                        const status = site?.status || 'unknown';
                        const badge = getStatusBadge(status);
                        return (
                          <Badge variant={badge.variant} className={`text-xs ${badge.className}`}>
                            {status}
                          </Badge>
                        );
                      })()}
                      {/* Show progress if we have progress data (regardless of status badge) */}
                      {site.progress !== undefined && site.progress !== null && (
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={site.progress} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {Math.round(site.progress)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {site.isTrained && site.trainedAt ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-xs font-medium text-green-600">Trained</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(site.trainedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-yellow-600" />
                        <span className="text-xs text-muted-foreground">Pending</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {site.lastCrawled ? 
                        new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                          Math.floor((new Date(site.lastCrawled).getTime() - Date.now()) / (1000 * 60 * 60)),
                          "hour"
                        ) : 'Never'
                      }
                    </div>
                  </TableCell>
                  <TableCell>{site.pagesCrawled || 0}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-actions-${site.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction("preview", site.id);
                          }}
                          data-testid={`action-preview-${site.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Render
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction("edit", site.id);
                          }}
                          data-testid={`action-edit-${site.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction("crawl", site.id);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction("delete", site.id);
                          }}
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});

export default CrawlSourceTable;
