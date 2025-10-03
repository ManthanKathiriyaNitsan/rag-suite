import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CrawlSite, crawlAPI } from "@/lib/api";

// 🕷️ Updated interface to match API data
interface CrawlSourceTableProps {
  sites: CrawlSite[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStartCrawl: (id: string) => void;
  isStarting: boolean;
  isDeleting: boolean;
}

// todo: remove mock functionality - keeping for reference
const mockSources = [
  {
    id: "1",
    url: "https://docs.company.com",
    depth: 3,
    cadence: "Daily",
    headless: "Auto",
    status: "Active",
    lastCrawl: new Date(Date.now() - 2 * 60 * 60 * 1000),
    documents: 245,
  },
  {
    id: "2",
    url: "https://help.company.com",
    depth: 2,
    cadence: "Weekly",
    headless: "On",
    status: "Active",
    lastCrawl: new Date(Date.now() - 6 * 60 * 60 * 1000),
    documents: 89,
  },
  {
    id: "3",
    url: "https://blog.company.com",
    depth: 1,
    cadence: "Daily",
    headless: "Off",
    status: "Error",
    lastCrawl: new Date(Date.now() - 24 * 60 * 60 * 1000),
    documents: 156,
  },
];

export function CrawlSourceTable({ 
  sites, 
  isLoading, 
  onEdit, 
  onDelete, 
  onStartCrawl, 
  isStarting, 
  isDeleting 
}: CrawlSourceTableProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const { toast } = useToast();

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

  return (
    <div className="rounded-md w-full   border">
      <Table className="  ">
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Depth</TableHead>
            <TableHead>Cadence</TableHead>
            <TableHead>Headless Mode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Crawl</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading sites...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : sites.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="text-muted-foreground">
                  No crawl sites found. Add your first site to get started.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sites.map((site) => (
              <TableRow key={site.id} data-testid={`row-source-${site.id}`}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  <div className="flex flex-col">
                    <span className="font-medium">{site.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {crawlAPI.normalizeUrl(site.url)}
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
                {(() => {
                  const badge = getStatusBadge(site.status);
                  return (
                    <Badge variant={badge.variant} className={`text-xs ${badge.className}`}>
                      {site.status}
                    </Badge>
                  );
                })()}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                  {site.lastCrawled ? 
                    new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                      Math.floor((new Date(site.lastCrawled).getTime() - Date.now()) / (1000 * 60 * 60)),
                  "hour"
                    ) : 'Never'
                  }
              </TableCell>
                <TableCell>{site.pagesCrawled || 0}</TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}