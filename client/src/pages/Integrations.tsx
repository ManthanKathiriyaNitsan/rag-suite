import React, { useState, useMemo, useCallback, Suspense, lazy } from "react";
import { Plus, Search, Filter, Globe, Copy, Pause, Play, Archive, Settings, BarChart3, Users, Edit, ExternalLink, Loader2 } from "lucide-react";

// 🚀 Lazy load heavy integration components
const IntegrationCreateEdit = lazy(() => import("@/components/features/integrations/IntegrationCreatePage"));
import { IntegrationCreateErrorBoundary } from "@/components/features/integrations/IntegrationCreateErrorBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

import { Integration } from "@/types/components";

// Mock data - replace with API calls
const mockIntegrations: Integration[] = [
  {
    id: "int-001",
    name: "Documentation Widget",
    slug: "docs-widget",
    publicId: "docs-widget-abc123",
    description: "AI assistant for customer documentation and help center",
    status: "active",
    environments: ["staging", "production"],
    lastPublish: new Date(Date.now() - 2 * 60 * 60 * 1000),
    queriesLast7d: 1247,
    errorsLast7d: 3,
    queriesLast30d: 5420,
    errorsLast30d: 12,
    owner: {
      id: "user-001",
      name: "John Doe",
      email: "john@company.com",
    },
    tags: ["customer-support", "documentation"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "int-002", 
    name: "Internal Knowledge Base",
    slug: "kb-internal",
    publicId: "kb-internal-def456",
    description: "Employee knowledge base for internal documentation",
    status: "active",
    environments: ["production"],
    lastPublish: new Date(Date.now() - 24 * 60 * 60 * 1000),
    queriesLast7d: 423,
    errorsLast7d: 0,
    queriesLast30d: 1892,
    errorsLast30d: 2,
    owner: {
      id: "user-002",
      name: "Jane Smith",
      email: "jane@company.com",
    },
    tags: ["internal", "hr"],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "int-003",
    name: "API Documentation Chat",
    slug: "api-docs",
    publicId: "api-docs-ghi789",
    description: "Interactive chat for API documentation and examples",
    status: "paused",
    environments: ["staging"],
    lastPublish: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    queriesLast7d: 0,
    errorsLast7d: 0,
    queriesLast30d: 156,
    errorsLast30d: 5,
    owner: {
      id: "user-003",
      name: "Bob Wilson",
      email: "bob@company.com",
    },
    tags: ["api", "developers"],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "int-004",
    name: "Product Support Bot",
    slug: "support-bot",
    publicId: "support-bot-jkl012",
    description: "Customer support chatbot for product inquiries",
    status: "archived",
    environments: [],
    lastPublish: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    queriesLast7d: 0,
    errorsLast7d: 0,
    queriesLast30d: 0,
    errorsLast30d: 15,
    owner: {
      id: "user-004",
      name: "Alice Johnson", 
      email: "alice@company.com",
    },
    tags: ["support", "deprecated"],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");
  const { t } = useTranslation();
  
  // Navigation state
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit">("list");
  const [editingIntegrationId, setEditingIntegrationId] = useState<string | undefined>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "paused":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "outline";
    }
  };

  const getEnvBadgeColor = (env: string) => {
    switch (env) {
      case "production":
        return "default";
      case "staging":
        return "secondary";
      default:
        return "outline";
    }
  };

  // 🔍 Memoized filtered integrations
  const filteredIntegrations = useMemo(() => {
    return integrations.filter(integration => {
      if (searchQuery && !integration.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !integration.publicId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== "all" && integration.status !== statusFilter) return false;
      if (ownerFilter !== "all" && integration.owner.email !== ownerFilter) return false;
      if (envFilter !== "all" && !integration.environments.includes(envFilter as any)) return false;
      return true;
    });
  }, [integrations, searchQuery, statusFilter, ownerFilter, envFilter]);

  const handleBulkAction = (action: string) => {
    console.log(`${action} action for integrations:`, selectedIntegrations);
    setSelectedIntegrations([]);
  };

  const handleIntegrationAction = (integrationId: string, action: string) => {
    console.log(`${action} action for integration:`, integrationId);
    
    if (action === "pause" || action === "resume") {
      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === integrationId
            ? { ...integration, status: action === "pause" ? "paused" : "active" as const }
            : integration
        )
      );
    }
  };

  const handleCreateIntegration = () => {
    console.log("Create new integration");
    setCurrentView("create");
    setEditingIntegrationId(undefined);
  };

  const handleEditIntegration = (integrationId: string) => {
    console.log("Edit integration:", integrationId);
    setCurrentView("edit");
    setEditingIntegrationId(integrationId);
  };

  const handleOpenIntegration = (integrationId: string) => {
    console.log("Open integration:", integrationId);
    // For now, treat "open" the same as "edit" - open in edit mode
    setCurrentView("edit");
    setEditingIntegrationId(integrationId);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setEditingIntegrationId(undefined);
  };

  const handleSaveIntegration = (data: Integration) => {
    console.log("Saving integration data:", data);
    handleBackToList();
  };

  const handleDuplicateIntegration = (integrationId: string) => {
    console.log("Duplicate integration:", integrationId);
    setCurrentView("create");
    setEditingIntegrationId(integrationId);
  };

  // Show create/edit form if not in list view
  if (currentView === "create" || currentView === "edit") {
    return (
      <IntegrationCreateErrorBoundary onRetry={handleBackToList}>
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
          <IntegrationCreateEdit
            integrationId={editingIntegrationId}
            mode={currentView}
            onBack={handleBackToList}
            onSave={handleSaveIntegration}
          />
        </Suspense>
      </IntegrationCreateErrorBoundary>
    );
  }

  // Show list view
  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 space-y-6 w-full max-w-full overflow-hidden min-w-0 p-0 sm:p-6" style={{ maxWidth: '92vw' }}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('nav.integrations')}</h1>
          <p className="text-muted-foreground">
            {t('integrations.description')}
          </p>
        </div>
        <div className="relative">
          <Button onClick={handleCreateIntegration} data-testid="button-create-integration" className="group">
            <Plus className="h-4 w-4 mr-2" />
            Create Integration
          </Button>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="w-full overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </h3>
          <div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or public ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-integrations"
              />
            </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-owner-filter">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                <SelectItem value="john@company.com">John Doe</SelectItem>
                <SelectItem value="jane@company.com">Jane Smith</SelectItem>
                <SelectItem value="bob@company.com">Bob Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Select value={envFilter} onValueChange={setEnvFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-env-filter">
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
          </div>
          </div>
        </div>
      </GlassCard>

      {/* Bulk Actions */}
      {selectedIntegrations.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-sidebar-accent" style={{ borderRadius: '2px' }}>
          <span className="text-sm font-medium">
            {selectedIntegrations.length} integration{selectedIntegrations.length > 1 ? "s" : ""} selected
          </span>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("pause")}
              data-testid="button-bulk-pause"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("resume")}
            data-testid="button-bulk-resume"
          >
            <Play className="h-4 w-4 mr-2" />
            Resume
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("archive")}
            data-testid="button-bulk-archive"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      )}

      {/* Integrations Table */}
      <GlassCard className="w-full overflow-hidden">
        <div className="p-0">
          <div className="overflow-x-auto max-w-full" style={{ maxWidth: '100%' }}>
            <Table className="min-w-[1000px] w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%]  text-center ">
                  <Checkbox
                  className="mt-[4px]"
                    checked={selectedIntegrations.length === filteredIntegrations.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIntegrations(filteredIntegrations.map(i => i.id));
                      } else {
                        setSelectedIntegrations([]);
                      }
                    }}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
                <TableHead className="w-[15%]">Name</TableHead>
                <TableHead className="w-[12%]">Public ID</TableHead>
                <TableHead className="w-[12%]">Environments</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[12%]">Last Publish</TableHead>
                <TableHead className="w-[10%]">Queries (7d)</TableHead>
                <TableHead className="w-[10%]">Errors (7d)</TableHead>
                <TableHead className="w-[12%]">Owner</TableHead>
                <TableHead className="w-[12%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIntegrations.map((integration) => (
                <TableRow
                  key={integration.id}
                  className="hover-elevate cursor-pointer"
                  data-testid={`row-integration-${integration.id}`}
                >
                  <TableCell className="text-center" >
                    <Checkbox
                      checked={selectedIntegrations.includes(integration.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIntegrations(prev => [...prev, integration.id]);
                        } else {
                          setSelectedIntegrations(prev => prev.filter(id => id !== integration.id));
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`checkbox-${integration.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {integration.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {integration.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">{integration.publicId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {integration.environments.map((env, index) => (
                        <Badge key={index} variant={getEnvBadgeColor(env)} className="text-xs">
                          {env}
                        </Badge>
                      ))}
                      {integration.environments.length === 0 && (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(integration.status)} className="capitalize">
                      {integration.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {integration.lastPublish ? (
                      new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                        Math.floor((integration.lastPublish.getTime() - Date.now()) / (1000 * 60 * 60)),
                        "hour"
                      )
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {integration.queriesLast7d.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className={integration.errorsLast7d > 0 ? "text-red-600" : ""}>
                      {integration.errorsLast7d}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{integration.owner.name}</div>
                      <div className="text-xs text-muted-foreground">{integration.owner.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`button-actions-${integration.id}`}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenIntegration(integration.id)}
                          data-testid={`action-open-${integration.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditIntegration(integration.id)}
                          data-testid={`action-edit-${integration.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateIntegration(integration.id)}
                          data-testid={`action-duplicate-${integration.id}`}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {integration.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() => handleIntegrationAction(integration.id, "pause")}
                            data-testid={`action-pause-${integration.id}`}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleIntegrationAction(integration.id, "resume")}
                            data-testid={`action-resume-${integration.id}`}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleIntegrationAction(integration.id, "archive")}
                          data-testid={`action-archive-${integration.id}`}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => console.log("View analytics:", integration.id)}
                          data-testid={`action-analytics-${integration.id}`}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first integration to get started with AI-powered search and chat.
              </p>
              <Button onClick={handleCreateIntegration} data-testid="button-create-first-integration">
                <Plus className="h-4 w-4 mr-2" />
                Create Integration
              </Button>
            </div>
          )}
        </div>
      </GlassCard>
      </div>
    </div>
  );
}

