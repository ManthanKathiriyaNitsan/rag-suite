import { useState } from "react";
import { History, Filter, ExternalLink, User, Settings, Database, Key, Globe, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditEntry {
  id: string;
  timestamp: Date;
  actor: {
    id: string;
    name: string;
    email: string;
    type: "user" | "system" | "api";
  };
  action: string;
  entity: {
    type: string;
    id: string;
    name?: string;
  };
  summary: string;
  metadata: Record<string, any>;
  resourceUrl?: string;
  ipAddress?: string;
  userAgent?: string;
}

// todo: remove mock functionality
const mockAuditEntries: AuditEntry[] = [
  {
    id: "audit-001",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    actor: {
      id: "user-123",
      name: "John Doe",
      email: "john@company.com",
      type: "user",
    },
    action: "config.update",
    entity: {
      type: "integration",
      id: "int-456",
      name: "Documentation Widget",
    },
    summary: "Updated RAG configuration for Documentation Widget",
    metadata: {
      changes: ["topK: 5 → 8", "temperature: 0.7 → 0.5"],
      version: "v2.1.3",
    },
    resourceUrl: "/integrations/int-456",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "audit-002",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    actor: {
      id: "api-789",
      name: "Production API",
      email: "api@company.com",
      type: "api",
    },
    action: "key.create",
    entity: {
      type: "api_key",
      id: "key-789",
      name: "Mobile App Key",
    },
    summary: "Created new API key for Mobile App integration",
    metadata: {
      rateLimit: 1000,
      environment: "production",
      permissions: ["read", "write"],
    },
    resourceUrl: "/settings?tab=api-keys",
    ipAddress: "10.0.0.15",
  },
  {
    id: "audit-003",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    actor: {
      id: "user-456",
      name: "Jane Smith",
      email: "jane@company.com",
      type: "user",
    },
    action: "source.create",
    entity: {
      type: "crawl_source",
      id: "src-123",
      name: "API Documentation",
    },
    summary: "Added new crawl source for API Documentation",
    metadata: {
      url: "https://api.company.com/docs",
      depth: 3,
      cadence: "daily",
    },
    resourceUrl: "/crawl/sources/src-123",
    ipAddress: "203.0.113.42",
  },
  {
    id: "audit-004",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    actor: {
      id: "system",
      name: "System",
      email: "system@ragsuite.com",
      type: "system",
    },
    action: "crawl.complete",
    entity: {
      type: "crawl_job",
      id: "job-456",
      name: "Scheduled Crawl",
    },
    summary: "Completed scheduled crawl job for docs.company.com",
    metadata: {
      pagesIndexed: 142,
      duration: "3m 42s",
      errors: 0,
    },
    resourceUrl: "/crawl/jobs/job-456",
  },
  {
    id: "audit-005",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actor: {
      id: "user-123",
      name: "John Doe",
      email: "john@company.com",
      type: "user",
    },
    action: "integration.publish",
    entity: {
      type: "integration",
      id: "int-456",
      name: "Documentation Widget",
    },
    summary: "Published integration v2.1 to production",
    metadata: {
      version: "v2.1",
      environment: "production",
      previousVersion: "v2.0",
    },
    resourceUrl: "/integrations/int-456",
    ipAddress: "192.168.1.100",
  },
];

export function AuditLog() {
  const [entries] = useState(mockAuditEntries);
  const [actorFilter, setActorFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case "integration":
        return <Globe className="h-4 w-4" />;
      case "api_key":
        return <Key className="h-4 w-4" />;
      case "crawl_source":
        return <Database className="h-4 w-4" />;
      case "crawl_job":
        return <Settings className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActorBadge = (actorType: string) => {
    switch (actorType) {
      case "user":
        return <Badge variant="default">User</Badge>;
      case "api":
        return <Badge variant="secondary">API</Badge>;
      case "system":
        return <Badge variant="outline">System</Badge>;
      default:
        return <Badge variant="outline">{actorType}</Badge>;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("publish")) return "text-green-600";
    if (action.includes("delete") || action.includes("revoke")) return "text-red-600";
    if (action.includes("update") || action.includes("modify")) return "text-blue-600";
    return "text-muted-foreground";
  };

  const filteredEntries = entries.filter(entry => {
    if (actorFilter !== "all" && entry.actor.type !== actorFilter) return false;
    if (entityFilter !== "all" && entry.entity.type !== entityFilter) return false;
    if (actionFilter !== "all" && !entry.action.includes(actionFilter)) return false;
    if (searchQuery && !entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !entry.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !entry.entity.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            Chronological record of all system activities and changes
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-audit"
              />
            </div>

            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger data-testid="select-actor-filter">
                <SelectValue placeholder="Actor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actors</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger data-testid="select-entity-filter">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="integration">Integrations</SelectItem>
                <SelectItem value="api_key">API Keys</SelectItem>
                <SelectItem value="crawl_source">Crawl Sources</SelectItem>
                <SelectItem value="crawl_job">Crawl Jobs</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger data-testid="select-action-filter">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="crawl">Crawl</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setActorFilter("all");
                setEntityFilter("all");
                setActionFilter("all");
                setSearchQuery("");
              }}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Log ({filteredEntries.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="hover-elevate cursor-pointer"
                  data-testid={`audit-entry-${entry.id}`}
                >
                  <TableCell className="font-mono text-sm">
                    <div>
                      <div>{entry.timestamp.toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{entry.actor.name}</div>
                        <div className="text-sm text-muted-foreground">{entry.actor.email}</div>
                      </div>
                      {getActorBadge(entry.actor.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getIcon(entry.entity.type)}
                      <div>
                        <div className="font-medium">{entry.entity.name || entry.entity.id}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {entry.entity.type.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px]">
                      <p className="line-clamp-2">{entry.summary}</p>
                      {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(entry.metadata).slice(0, 2).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value?.toString()}
                            </Badge>
                          ))}
                          {Object.keys(entry.metadata).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{Object.keys(entry.metadata).length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.resourceUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Navigate to:", entry.resourceUrl);
                        }}
                        data-testid={`button-view-resource-${entry.id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No audit entries found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}