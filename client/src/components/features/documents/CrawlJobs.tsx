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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 border rounded-lg hover-elevate" data-testid={`job-row-${site.id}`}>
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{site.name || 'Unnamed Site'}</h4>
            <p className="text-sm text-muted-foreground truncate break-all sm:break-normal">{site.url || 'No URL'}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={jobStatus.isRunning ? "default" : "secondary"} className="text-xs whitespace-nowrap">
              {jobStatus.isRunning ? "Running" : "Idle"}
            </Badge>
            {jobStatus.isRunning && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-2 sm:gap-2 sm:text-right sm:min-w-[140px]">
          {/* Progress Bar - Show whenever progress data is available */}
          {site.progress !== undefined && site.progress !== null && (
            <div className="space-y-1 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <Progress value={site.progress} className="h-2 flex-1 sm:flex-initial sm:w-24 max-w-[200px]" />
                <span className="text-sm font-medium text-foreground whitespace-nowrap flex-shrink-0">
                  {Math.round(site.progress)}%
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:items-end gap-1">
            <p className="text-sm font-medium whitespace-nowrap">
              {site.pagesCrawled || 0} pages
            </p>
            <p className="text-xs text-muted-foreground break-words sm:break-normal sm:text-right">
              {jobStatus.completedAt ? `Finished ${jobStatus.completedAt.toLocaleTimeString()}` : "In progress"}
              {jobStatus.error ? ` • Error: ${jobStatus.error}` : ""}
            </p>
          </div>
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
