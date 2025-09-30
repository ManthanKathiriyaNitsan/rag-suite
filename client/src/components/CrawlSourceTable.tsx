import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Play, Pause } from "lucide-react";
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

interface CrawlSource {
  id: string;
  url: string;
  depth: number;
  cadence: "Hourly" | "Daily" | "Weekly";
  headless: "Auto" | "On" | "Off";
  status: "Active" | "Paused" | "Error";
  lastCrawl: Date;
  documents: number;
}

interface CrawlSourceTableProps {
  sources?: CrawlSource[];
}

// todo: remove mock functionality
const mockSources: CrawlSource[] = [
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

export function CrawlSourceTable({ sources = mockSources }: CrawlSourceTableProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Paused":
        return "secondary";
      case "Error":
        return "destructive";
      default:
        return "secondary";
    }
  };

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
        toast({
          title: "Edit Source",
          description: "Opening edit form for source configuration",
        });
        break;
      case "crawl":
        toast({
          title: "Crawl Started",
          description: "Crawl job has been queued and will start shortly",
        });
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
            <TableHead>Headless</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Crawl</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.id} data-testid={`row-source-${source.id}`}>
              <TableCell className="font-medium max-w-[200px] truncate">
                {source.url}
              </TableCell>
              <TableCell>{source.depth}</TableCell>
              <TableCell>{source.cadence}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {source.headless}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(source.status)} className="text-xs">
                  {source.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                  Math.floor((source.lastCrawl.getTime() - Date.now()) / (1000 * 60 * 60)),
                  "hour"
                )}
              </TableCell>
              <TableCell>{source.documents}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-actions-${source.id}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleAction("preview", source.id)}
                      data-testid={`action-preview-${source.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Render
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("edit", source.id)}
                      data-testid={`action-edit-${source.id}`}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("crawl", source.id)}
                      data-testid={`action-crawl-${source.id}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Crawl
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}