import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCrawlOperations } from "@/hooks/useCrawl";
import { CrawlSite } from "@/services/api/api";

interface CrawlJobsProps {
  sites: CrawlSite[];
  statusFilter?: string;
}

const CrawlJobs = React.memo(function CrawlJobs({ sites, statusFilter = "all" }: CrawlJobsProps) {
  // 📊 Memoized filtered sites based on status and date
  const filteredSites = useMemo(() => {
    // Ensure sites is an array before filtering
    if (!sites || !Array.isArray(sites)) {
      return [];
    }
    
    return sites.filter((site) => {
      // Ensure site is valid
      if (!site || !site.id) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== "all") {
        const siteStatus = site.status?.toLowerCase() || "";
        const filterStatus = statusFilter.toLowerCase();
        
        // Map filter values to site status values
        let matchesStatus = false;
        switch (filterStatus) {
          case "running":
            matchesStatus = siteStatus === "crawling" || siteStatus === "running";
            break;
          case "completed":
            matchesStatus = siteStatus === "active" && (site.progress === 100 || site.progress === undefined);
            break;
          case "failed":
            matchesStatus = siteStatus === "error" || siteStatus === "failed";
            break;
          case "pending":
            matchesStatus = siteStatus === "pending" || (siteStatus === "active" && !site.lastCrawled);
            break;
          default:
            matchesStatus = true;
        }
        
        if (!matchesStatus) {
          return false;
        }
      }
      
      return true;
    });
  }, [sites, statusFilter]);

  // 📊 CrawlJobRow component
  function CrawlJobRow({ 
    site
  }: { 
    site: CrawlSite; 
  }) {
    const { startCrawl } = useCrawlOperations();
    
    // Determine status based on site properties
    if (!site) {
      return null;
    }
    
    const jobStatus = {
      isRunning: site.status === "crawling",
      completedAt: site.lastCrawled ? new Date(site.lastCrawled) : null,
      error: site.status === "error" ? "Crawl failed" : null
    };

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover-elevate" data-testid={`job-row-${site.id}`}>
        <div className="flex items-center space-x-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{site.name || 'Unnamed Site'}</h4>
            <p className="text-sm text-muted-foreground truncate">{site.url || 'No URL'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={jobStatus.isRunning ? "default" : "secondary"}>
              {jobStatus.isRunning ? "Running" : "Idle"}
            </Badge>
            {jobStatus.isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
        <div className="text-right space-y-2 min-w-[140px]">
          {/* Progress Bar - Show whenever progress data is available */}
          {site.progress !== undefined && site.progress !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <Progress value={site.progress} className="h-2 w-24" />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {Math.round(site.progress)}%
                </span>
              </div>
            </div>
          )}
          <p className="text-sm font-medium">
            {site.pagesCrawled || 0} pages
          </p>
          <p className="text-xs text-muted-foreground">
            {jobStatus.completedAt ? `Finished ${jobStatus.completedAt.toLocaleTimeString()}` : "In progress"}
            {jobStatus.error ? ` • Error: ${jobStatus.error}` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Crawl Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredSites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No crawl jobs found. Start a crawl to see jobs here.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSites.map((site) => (
              <CrawlJobRow 
                key={site.id} 
                site={site}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default CrawlJobs;
