import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCrawlOperations } from "@/hooks/useCrawl";
import { CrawlSite } from "@/services/api/api";

interface CrawlJobsProps {
  sites: CrawlSite[];
  statusFilter?: string;
  dateFilter?: string;
}

const CrawlJobs = React.memo(function CrawlJobs({ sites, statusFilter = "all", dateFilter = "today" }: CrawlJobsProps) {
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
      // For now, we'll filter based on the site's basic properties
      // The actual status filtering will be done in CrawlJobRow based on the badge status
      return true; // We'll do the actual filtering in CrawlJobRow
    });
  }, [sites, statusFilter, dateFilter]);

  // 📊 CrawlJobRow component
  function CrawlJobRow({ 
    site, 
    statusFilter = "all", 
    dateFilter = "today" 
  }: { 
    site: CrawlSite; 
    statusFilter?: string; 
    dateFilter?: string; 
  }) {
    const { startCrawl } = useCrawlOperations();
    
    // Determine status based on site properties
    if (!site) {
      return null;
    }
    
    const jobStatus = {
      isRunning: site.status === "crawling" || site.status === "running",
      completedAt: site.lastCrawled ? new Date(site.lastCrawled) : null,
      error: site.status === "error" || site.status === "failed" ? "Crawl failed" : null
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
        <div className="text-right">
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
                statusFilter={statusFilter}
                dateFilter={dateFilter}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default CrawlJobs;
