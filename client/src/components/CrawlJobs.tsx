import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCrawlOperations } from "@/hooks/useCrawl";
import { CrawlSite } from "@/lib/api";

interface CrawlJobsProps {
  sites: CrawlSite[];
  statusFilter?: string;
  dateFilter?: string;
}

export function CrawlJobs({ sites, statusFilter = "all", dateFilter = "today" }: CrawlJobsProps) {
  // Filter sites based on status and date
  const filteredSites = sites.filter((site) => {
    // For now, we'll filter based on the site's basic properties
    // The actual status filtering will be done in CrawlJobRow based on the badge status
    return true; // We'll do the actual filtering in CrawlJobRow
  });

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Crawl Jobs</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

function CrawlJobRow({ 
  site, 
  statusFilter = "all", 
  dateFilter = "today" 
}: { 
  site: CrawlSite; 
  statusFilter?: string; 
  dateFilter?: string; 
}) {
  const { getCrawlStatus } = useCrawlOperations();
  const statusQuery = getCrawlStatus(site.id);

  // Determine if this job should be shown based on filters
  const shouldShowJob = () => {
    // Status filtering
    if (statusFilter !== "all") {
      if (statusQuery.isLoading) {
        return statusFilter === "pending";
      }
      if (statusQuery.error) {
        return statusFilter === "failed";
      }
      if (statusQuery.data) {
        const jobStatus = statusQuery.data.status;
        if (statusFilter === "running" && jobStatus !== "running") return false;
        if (statusFilter === "completed" && jobStatus !== "completed") return false;
        if (statusFilter === "failed" && jobStatus !== "failed") return false;
        if (statusFilter === "pending" && jobStatus !== "pending") return false;
      }
    }

    // Date filtering
    if (dateFilter !== "all" && statusQuery.data?.startedAt) {
      const jobDate = new Date(statusQuery.data.startedAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      switch (dateFilter) {
        case "today":
          return jobDate >= today;
        case "week":
          return jobDate >= weekAgo;
        case "month":
          return jobDate >= monthAgo;
        default:
          return true;
      }
    }

    return true;
  };

  // Don't render if filters don't match
  if (!shouldShowJob()) {
    return null;
  }

  if (statusQuery.isLoading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{site.name}</p>
            <Badge variant="outline" className="text-xs">loading</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{site.url} • Loading status…</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm font-medium">— pages</p>
          <p className="text-xs text-muted-foreground">—</p>
        </div>
      </div>
    );
  }

  if (statusQuery.error) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{site.name}</p>
            <Badge variant="destructive" className="text-xs">error</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{site.url} • Failed to fetch status</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm font-medium">0 pages</p>
          <p className="text-xs text-muted-foreground">—</p>
        </div>
      </div>
    );
  }

  const status = statusQuery.data;
  const badgeVariant = status?.status === "completed"
    ? "default"
    : status?.status === "running"
    ? "secondary"
    : status?.status === "failed"
    ? "destructive"
    : "outline";

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover-elevate">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{site.name}</p>
          <Badge variant={badgeVariant} className="text-xs">
            {status?.status ?? "unknown"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {site.url} • Started {status?.startedAt ? new Date(status.startedAt).toLocaleTimeString() : "—"}
        </p>
      </div>
      <div className="text-right space-y-1">
        <p className="text-sm font-medium">{status?.pagesCrawled ?? 0} pages</p>
        <p className="text-xs text-muted-foreground">
          {status?.completedAt ? `Finished ${new Date(status.completedAt).toLocaleTimeString()}` : "In progress"}
          {status?.error ? ` • Error: ${status.error}` : ""}
        </p>
      </div>
    </div>
  );
}