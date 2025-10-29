import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus,
  History, 
  GitBranch, 
  Settings,
  Play,
  Pause,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Clock,
  Copy,
  Eye,
  Download,
  Upload,
  Tag,
  GitCommit,
  Users,
  Calendar,
} from "lucide-react";

interface Version {
  id: string;
  version: string;
  status: "draft" | "published" | "archived";
  description: string;
  changes: string[];
  createdAt: string;
  publishedAt?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  deployment: {
    status: "pending" | "deploying" | "deployed" | "failed";
    environment: string;
    deployedAt?: string;
  };
  metrics: {
    downloads: number;
    activeUsers: number;
    errorRate: number;
  };
}

interface VersionsTabProps {
  data: Version[];
  onChange: (versions: Version[]) => void;
}

export default function VersionsTab({ data, onChange }: VersionsTabProps) {
  const [versions, setVersions] = useState<Version[]>(data || []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [newVersion, setNewVersion] = useState<Partial<Version>>({
    version: "",
    description: "",
    changes: [],
  });

  useEffect(() => {
    setVersions(data || []);
  }, [data]);

  const handleCreateVersion = () => {
    if (!newVersion.version || !newVersion.description) return;

    const version: Version = {
      id: `version-${Date.now()}`,
      version: newVersion.version,
      status: "draft",
      description: newVersion.description,
      changes: newVersion.changes || [],
      createdAt: new Date().toISOString(),
      author: {
        id: "current-user",
        name: "Current User",
        email: "user@example.com",
      },
      deployment: {
        status: "pending",
        environment: "staging",
      },
      metrics: {
        downloads: 0,
        activeUsers: 0,
        errorRate: 0,
      },
    };

    const updated = [...versions, version];
    setVersions(updated);
    onChange(updated);
    setIsCreateOpen(false);
    setNewVersion({
      version: "",
      description: "",
      changes: [],
    });
  };

  const handleUpdateVersion = (id: string, updates: Partial<Version>) => {
    const updated = versions.map(version =>
      version.id === id ? { ...version, ...updates } : version
    );
    setVersions(updated);
    onChange(updated);
  };

  const handleDeleteVersion = (id: string) => {
    const updated = versions.filter(version => version.id !== id);
    setVersions(updated);
    onChange(updated);
  };

  const handlePublishVersion = (id: string) => {
    handleUpdateVersion(id, {
      status: "published",
      publishedAt: new Date().toISOString(),
    });
  };

  const handleDeployVersion = (id: string, environment: string) => {
    handleUpdateVersion(id, {
      deployment: {
        status: "deploying",
        environment,
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "archived":
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="bg-green-500">Published</Badge>;
      case "draft":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Draft</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getDeploymentStatusBadge = (deployment: Version["deployment"]) => {
    switch (deployment.status) {
      case "deployed":
        return <Badge variant="default" className="bg-green-500">Deployed</Badge>;
      case "deploying":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Deploying</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Versions</h3>
          <p className="text-sm text-muted-foreground">
            Manage integration versions, deployments, and release history
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Version
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Version</DialogTitle>
              <DialogDescription>
                Create a new version of your integration
              </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
              <div>
                <Label htmlFor="version-number">Version Number</Label>
                <Input
                  id="version-number"
                  value={newVersion.version || ""}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="e.g., 1.2.0"
                  />
                </div>
              <div>
                <Label htmlFor="version-description">Description</Label>
                <Textarea
                  id="version-description"
                  value={newVersion.description || ""}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What's new in this version?"
                />
                  </div>
                </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
              <Button onClick={handleCreateVersion}>
                    Create Version
                  </Button>
            </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>

      {/* Versions List */}
      {versions.length === 0 ? (
      <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Versions</h3>
            <p className="text-muted-foreground text-center mb-4">
                    Create your first version to start tracking changes
                  </p>
            <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Version
                  </Button>
                </CardContent>
              </Card>
      ) : (
          <div className="space-y-4">
          {versions.map((version) => (
            <Card key={version.id}>
              <CardHeader>
            <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">v{version.version}</CardTitle>
                      <p className="text-sm text-muted-foreground">{version.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(version.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingVersion(version)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        {version.status === "draft" && (
                          <DropdownMenuItem onClick={() => handlePublishVersion(version.id)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeployVersion(version.id, "production")}>
                          <Play className="h-4 w-4 mr-2" />
                          Deploy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteVersion(version.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                          </div>
                        </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Author</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{version.author.name}</span>
                          </div>
                        </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Created</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                      </div>
                    </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Deployment Status</Label>
                    <div className="mt-1">
                      {getDeploymentStatusBadge(version.deployment)}
          </div>
                  </div>
                </div>

                {version.changes.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-xs text-muted-foreground">Changes</Label>
                    <ul className="text-sm mt-1 space-y-1">
                      {version.changes.map((change, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <GitCommit className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{version.metrics.downloads}</div>
                    <div className="text-xs text-muted-foreground">Downloads</div>
                    </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{version.metrics.activeUsers}</div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{version.metrics.errorRate}%</div>
                    <div className="text-xs text-muted-foreground">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
                </div>
              )}
    </div>
  );
}
