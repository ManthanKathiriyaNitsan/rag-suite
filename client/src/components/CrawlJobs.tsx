import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCrawlOperations } from "@/hooks/useCrawl";
import { CrawlSite } from "@/lib/api";

interface CrawlJobsProps {
  sites: CrawlSite[];
}

export function CrawlJobs({ sites }: CrawlJobsProps) {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Crawl Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sites.map((site) => (
            <CrawlJobRow key={site.id} site={site} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CrawlJobRow({ site }: { site: CrawlSite }) {
  const { getCrawlStatus } = useCrawlOperations();
  const statusQuery = getCrawlStatus(site.id);

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