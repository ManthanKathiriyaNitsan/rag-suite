import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Plus,
  Server,
  Globe,
  Settings,
  Play,
  Pause,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface Environment {
  id: string;
  name: string;
  type: "staging" | "production" | "development";
  url: string;
  status: "active" | "inactive" | "deploying";
  lastDeployed: string;
  version: string;
  description: string;
  variables: Record<string, string>;
  healthCheck: {
    status: "healthy" | "warning" | "error";
    lastCheck: string;
    responseTime: number;
  };
}

interface EnvironmentsTabProps {
  data: Environment[];
  onChange: (environments: Environment[]) => void;
}

export default function EnvironmentsTab({ data, onChange }: EnvironmentsTabProps) {
  const [environments, setEnvironments] = useState<Environment[]>(data || []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [newEnvironment, setNewEnvironment] = useState<Partial<Environment>>({
    name: "",
    type: "staging",
    url: "",
    description: "",
    variables: {},
  });

  useEffect(() => {
    setEnvironments(data || []);
  }, [data]);

  const handleCreateEnvironment = () => {
    if (!newEnvironment.name || !newEnvironment.url) return;

    const env: Environment = {
      id: `env-${Date.now()}`,
      name: newEnvironment.name,
      type: newEnvironment.type as "staging" | "production" | "development",
      url: newEnvironment.url,
      status: "inactive",
      lastDeployed: new Date().toISOString(),
      version: "1.0.0",
      description: newEnvironment.description || "",
      variables: newEnvironment.variables || {},
      healthCheck: {
        status: "healthy",
        lastCheck: new Date().toISOString(),
        responseTime: 0,
      },
    };

    const updated = [...environments, env];
    setEnvironments(updated);
    onChange(updated);
    setIsCreateOpen(false);
    setNewEnvironment({
      name: "",
      type: "staging",
      url: "",
      description: "",
      variables: {},
    });
  };

  const handleUpdateEnvironment = (id: string, updates: Partial<Environment>) => {
    const updated = environments.map(env =>
      env.id === id ? { ...env, ...updates } : env
    );
    setEnvironments(updated);
    onChange(updated);
  };

  const handleDeleteEnvironment = (id: string) => {
    const updated = environments.filter(env => env.id !== id);
    setEnvironments(updated);
    onChange(updated);
  };

  const handleToggleStatus = (id: string) => {
    const env = environments.find(e => e.id === id);
    if (!env) return;

    const newStatus = env.status === "active" ? "inactive" : "active";
    handleUpdateEnvironment(id, { status: newStatus });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "deploying":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "deploying":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Deploying</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getHealthStatus = (health: Environment["healthCheck"]) => {
    switch (health.status) {
      case "healthy":
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case "warning":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Warning</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Environments</h3>
          <p className="text-sm text-muted-foreground">
            Manage staging and production environments for your integration
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Environment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Environment</DialogTitle>
              <DialogDescription>
                Set up a new environment for your integration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="env-name">Environment Name</Label>
                <Input
                  id="env-name"
                  value={newEnvironment.name || ""}
                  onChange={(e) => setNewEnvironment(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Production, Staging"
                />
              </div>
              <div>
                <Label htmlFor="env-type">Environment Type</Label>
                <Select
                  value={newEnvironment.type}
                  onValueChange={(value) => setNewEnvironment(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="env-url">Environment URL</Label>
                <Input
                  id="env-url"
                  value={newEnvironment.url || ""}
                  onChange={(e) => setNewEnvironment(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.example.com"
                />
              </div>
              <div>
                <Label htmlFor="env-description">Description</Label>
                <Textarea
                  id="env-description"
                  value={newEnvironment.description || ""}
                  onChange={(e) => setNewEnvironment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEnvironment}>
                Create Environment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Environments List */}
      {environments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Environments</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first environment to start deploying your integration
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Environment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {environments.map((env) => (
            <Card key={env.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Server className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{env.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        {env.type} Environment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(env.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingEnv(env)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(env.id)}>
                          {env.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteEnvironment(env.id)}
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
                    <Label className="text-xs text-muted-foreground">URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{env.url}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Health Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getHealthStatus(env.healthCheck)}
                      <span className="text-xs text-muted-foreground">
                        {env.healthCheck.responseTime}ms
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Deployed</Label>
                    <p className="text-sm mt-1">
                      {new Date(env.lastDeployed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {env.description && (
                  <div className="mt-4">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1">{env.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}