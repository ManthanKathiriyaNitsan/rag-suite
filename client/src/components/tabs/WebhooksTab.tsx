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
  Webhook, 
  Globe,
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
  EyeOff,
  Zap,
  Activity,
} from "lucide-react";

interface WebhookEvent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  status: "active" | "inactive" | "error";
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  description: string;
    headers: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
  };
}

interface WebhooksTabProps {
  data: Webhook[];
  onChange: (webhooks: Webhook[]) => void;
}

const availableEvents: WebhookEvent[] = [
  { id: "integration.created", name: "Integration Created", description: "Triggered when a new integration is created", enabled: true },
  { id: "integration.updated", name: "Integration Updated", description: "Triggered when an integration is updated", enabled: true },
  { id: "integration.deleted", name: "Integration Deleted", description: "Triggered when an integration is deleted", enabled: true },
  { id: "user.query", name: "User Query", description: "Triggered when a user submits a query", enabled: true },
  { id: "user.response", name: "User Response", description: "Triggered when a response is generated", enabled: true },
  { id: "error.occurred", name: "Error Occurred", description: "Triggered when an error occurs", enabled: true },
  { id: "analytics.updated", name: "Analytics Updated", description: "Triggered when analytics data is updated", enabled: true },
];

export default function WebhooksTab({ data, onChange }: WebhooksTabProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(data || []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({
    name: "",
    url: "",
    events: [],
    description: "",
    headers: {},
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 1000,
    },
  });
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setWebhooks(data || []);
  }, [data]);

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) return;
    
    const webhook: Webhook = {
      id: `webhook-${Date.now()}`,
      name: newWebhook.name,
      url: newWebhook.url,
      secret: generateSecret(),
      events: newWebhook.events || [],
      status: "inactive",
      successCount: 0,
      failureCount: 0,
      description: newWebhook.description || "",
      headers: newWebhook.headers || {},
      retryPolicy: newWebhook.retryPolicy || {
        maxRetries: 3,
        retryDelay: 1000,
      },
    };

    const updated = [...webhooks, webhook];
    setWebhooks(updated);
    onChange(updated);
    setIsCreateOpen(false);
    setNewWebhook({
      name: "",
      url: "",
      events: [],
      description: "",
      headers: {},
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
      },
    });
  };

  const handleUpdateWebhook = (id: string, updates: Partial<Webhook>) => {
    const updated = webhooks.map(webhook =>
        webhook.id === id ? { ...webhook, ...updates } : webhook
    );
    setWebhooks(updated);
    onChange(updated);
  };

  const handleDeleteWebhook = (id: string) => {
    const updated = webhooks.filter(webhook => webhook.id !== id);
    setWebhooks(updated);
    onChange(updated);
  };

  const handleToggleStatus = (id: string) => {
    const webhook = webhooks.find(w => w.id === id);
    if (!webhook) return;

    const newStatus = webhook.status === "active" ? "inactive" : "active";
    handleUpdateWebhook(id, { status: newStatus });
  };

  const generateSecret = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte =>
      byte.toString(16).padStart(2, '0')
    ).join('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
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
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const toggleSecretVisibility = (webhookId: string) => {
    setShowSecret(prev => ({
      ...prev,
      [webhookId]: !prev[webhookId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Webhooks & Events</h3>
            <p className="text-sm text-muted-foreground">
            Configure webhooks to receive real-time notifications about integration events
            </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Webhook
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-2xl">
                <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Set up a webhook to receive notifications about integration events
              </DialogDescription>
                </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhook-name">Webhook Name</Label>
                      <Input
                        id="webhook-name"
                    value={newWebhook.name || ""}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Production Notifications"
                      />
                    </div>
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                    value={newWebhook.url || ""}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://api.example.com/webhook"
                      />
                    </div>
                  </div>
              <div>
                <Label htmlFor="webhook-description">Description</Label>
                <Textarea
                  id="webhook-description"
                  value={newWebhook.description || ""}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <Label>Events to Subscribe To</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Switch
                        id={event.id}
                        checked={newWebhook.events?.includes(event.id) || false}
                        onCheckedChange={(checked) => {
                              const events = newWebhook.events || [];
                          if (checked) {
                            setNewWebhook(prev => ({ ...prev, events: [...events, event.id] }));
                              } else {
                            setNewWebhook(prev => ({ ...prev, events: events.filter(e => e !== event.id) }));
                          }
                        }}
                      />
                      <Label htmlFor={event.id} className="text-sm">
                        {event.name}
                      </Label>
                    </div>
                      ))}
                    </div>
                  </div>
                    </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                className="sm:min-w-[140px]"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="sm:min-w-[140px]"
                onClick={handleCreateWebhook}
              >
                Create Webhook
              </Button>
            </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Webhooks</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first webhook to receive real-time notifications
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </Button>
                </CardContent>
              </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
            <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Webhook className="h-5 w-5 text-primary" />
                          </div>
                    <div>
                      <CardTitle className="text-base">{webhook.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{webhook.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                    {getStatusBadge(webhook.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingWebhook(webhook)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(webhook.id)}>
                          {webhook.status === "active" ? (
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
                          onClick={() => handleDeleteWebhook(webhook.id)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                    <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono flex-1 truncate">{webhook.url}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Copy className="h-3 w-3" />
                      </Button>
                                  </div>
                                </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Secret Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-mono flex-1">
                        {showSecret[webhook.id] ? webhook.secret : "••••••••••••••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleSecretVisibility(webhook.id)}
                      >
                        {showSecret[webhook.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                            </div>
                      </div>
                    </div>
                
                <div className="mt-4">
                  <Label className="text-xs text-muted-foreground">Subscribed Events</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {webhook.events.map((eventId) => {
                      const event = availableEvents.find(e => e.id === eventId);
                      return event ? (
                        <Badge key={eventId} variant="outline" className="text-xs">
                          {event.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{webhook.successCount}</div>
                    <div className="text-xs text-muted-foreground">Successful</div>
                    </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{webhook.failureCount}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {webhook.successCount + webhook.failureCount}
                </div>
                    <div className="text-xs text-muted-foreground">Total</div>
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
