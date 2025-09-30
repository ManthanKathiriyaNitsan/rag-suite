import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Edit, 
  TestTube,
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Search,
  Filter,
  RotateCcw,
  Play,
  Settings,
  Shield,
  History,
  Code,
  Bell,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Activity,
  Zap,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  retryCount: number;
  timeoutMs: number;
  customHeaders: { key: string; value: string }[];
  createdAt: Date;
  lastTriggered: Date | null;
  successCount: number;
  failureCount: number;
}

interface EventLog {
  id: string;
  webhookId: string;
  webhookName: string;
  event: string;
  payload: any;
  response: {
    status: number;
    body: string;
    headers: Record<string, string>;
  } | null;
  attempts: number;
  status: "success" | "failed" | "pending" | "retrying";
  timestamp: Date;
  duration: number; // ms
  nextRetry?: Date;
}

interface WebhooksData {
  endpoints: WebhookEndpoint[];
  eventTypes: string[];
  globalRetryEnabled: boolean;
  globalTimeoutMs: number;
  eventLogs: EventLog[];
  testMode: boolean;
}

interface WebhooksTabProps {
  data: WebhooksData;
  onChange: (data: WebhooksData) => void;
}

export default function WebhooksTab({ data, onChange }: WebhooksTabProps) {
  const [webhooks, setWebhooks] = useState<WebhooksData>(data);
  const [activeTab, setActiveTab] = useState("endpoints");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testPayload, setTestPayload] = useState("");
  const { toast } = useToast();

  const [newWebhook, setNewWebhook] = useState<Partial<WebhookEndpoint>>({
    name: "",
    url: "",
    events: [],
    isActive: true,
    secret: "",
    retryCount: 3,
    timeoutMs: 5000,
    customHeaders: [],
  });

  // Sync local state when parent data changes (for edit mode)
  useEffect(() => {
    setWebhooks(data);
  }, [data]);

  // Update parent state when webhooks change
  useEffect(() => {
    onChange(webhooks);
  }, [webhooks, onChange]);

  const updateWebhooks = (updates: Partial<WebhooksData>) => {
    setWebhooks(prev => ({ ...prev, ...updates }));
  };

  const addWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) return;
    
    const webhook: WebhookEndpoint = {
      id: `webhook-${Date.now()}`,
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events || [],
      isActive: newWebhook.isActive ?? true,
      secret: newWebhook.secret || "",
      retryCount: newWebhook.retryCount || 3,
      timeoutMs: newWebhook.timeoutMs || 5000,
      customHeaders: newWebhook.customHeaders || [],
      createdAt: new Date(),
      lastTriggered: null,
      successCount: 0,
      failureCount: 0,
    };

    setWebhooks(prev => ({
      ...prev,
      endpoints: [...prev.endpoints, webhook]
    }));

    setNewWebhook({
      name: "",
      url: "",
      events: [],
      isActive: true,
      secret: "",
      retryCount: 3,
      timeoutMs: 5000,
      customHeaders: [],
    });
    setShowCreateDialog(false);

    toast({
      title: "Webhook created",
      description: `${webhook.name} has been added successfully`,
    });
  };

  const updateWebhook = (id: string, updates: Partial<WebhookEndpoint>) => {
    setWebhooks(prev => ({
      ...prev,
      endpoints: prev.endpoints.map(webhook =>
        webhook.id === id ? { ...webhook, ...updates } : webhook
      )
    }));
  };

  const deleteWebhook = (id: string) => {
    let webhookName = "";
    setWebhooks(prev => {
      const webhook = prev.endpoints.find(w => w.id === id);
      webhookName = webhook?.name || "";
      return {
        ...prev,
        endpoints: prev.endpoints.filter(w => w.id !== id),
        eventLogs: prev.eventLogs.filter(log => log.webhookId !== id)
      };
    });

    toast({
      title: "Webhook deleted",
      description: `${webhookName} has been removed`,
    });
  };

  const testWebhook = async (webhookId: string) => {
    let webhook: WebhookEndpoint | undefined;
    let webhookName = "";
    
    setWebhooks(prev => {
      webhook = prev.endpoints.find(w => w.id === webhookId);
      webhookName = webhook?.name || "";
      return prev;
    });
    
    if (!webhook) return;

    setTestingWebhook(webhookId);

    // Parse test payload with validation
    let parsedPayload;
    try {
      parsedPayload = testPayload ? JSON.parse(testPayload) : { test: true, timestamp: new Date().toISOString() };
    } catch (error) {
      toast({
        title: "Invalid test payload",
        description: "Test payload must be valid JSON",
        variant: "destructive",
      });
      setTestingWebhook(null);
      return;
    }

    const testEvent: EventLog = {
      id: `test-${Date.now()}`,
      webhookId: webhook.id,
      webhookName: webhook.name,
      event: "test",
      payload: parsedPayload,
      response: null,
      attempts: 1,
      status: "pending",
      timestamp: new Date(),
      duration: 0,
    };

    // Add test event to logs
    setWebhooks(prev => ({
      ...prev,
      eventLogs: [testEvent, ...prev.eventLogs]
    }));

    // Simulate webhook test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      const updatedEvent: EventLog = {
        ...testEvent,
        status: success ? "success" : "failed",
        duration: Math.floor(Math.random() * 1000) + 100,
        response: {
          status: success ? 200 : 500,
          body: success ? "OK" : "Internal Server Error",
          headers: { "content-type": "application/json" }
        }
      };

      setWebhooks(prev => {
        const webhook = prev.endpoints.find(w => w.id === webhookId);
        return {
          ...prev,
          eventLogs: prev.eventLogs.map(log => 
            log.id === testEvent.id ? updatedEvent : log
          ),
          endpoints: prev.endpoints.map(w =>
            w.id === webhookId ? {
              ...w,
              lastTriggered: new Date(),
              successCount: success ? w.successCount + 1 : w.successCount,
              failureCount: success ? w.failureCount : w.failureCount + 1,
            } : w
          )
        };
      });

      setTestingWebhook(null);

      toast({
        title: success ? "Test successful" : "Test failed",
        description: success ? "Webhook responded successfully" : "Webhook test failed",
        variant: success ? "default" : "destructive",
      });
    }, 2000);

    toast({
      title: "Testing webhook",
      description: `Sending test payload to ${webhookName}...`,
    });
  };

  const retryEvent = (eventId: string) => {
    let event: EventLog | undefined;
    
    setWebhooks(prev => {
      event = prev.eventLogs.find(e => e.id === eventId);
      if (!event) return prev;

      const updatedEvent = {
        ...event,
        status: "retrying" as const,
        attempts: event.attempts + 1,
        nextRetry: new Date(Date.now() + 60000) // 1 minute from now
      };

      return {
        ...prev,
        eventLogs: prev.eventLogs.map(log => 
          log.id === eventId ? updatedEvent : log
        )
      };
    });

    if (!event) return;

    // Simulate retry
    setTimeout(() => {
      const success = Math.random() > 0.5;
      setWebhooks(prev => {
        const retryingEvent = prev.eventLogs.find(log => log.id === eventId);
        if (!retryingEvent) return prev;

        return {
          ...prev,
          eventLogs: prev.eventLogs.map(log => 
            log.id === eventId ? {
              ...log,
              status: success ? "success" : "failed",
              duration: Math.floor(Math.random() * 1000) + 100,
              response: {
                status: success ? 200 : 500,
                body: success ? "OK" : "Internal Server Error",
                headers: { "content-type": "application/json" }
              }
            } : log
          ),
          endpoints: prev.endpoints.map(webhook =>
            webhook.id === retryingEvent.webhookId ? {
              ...webhook,
              lastTriggered: new Date(),
              successCount: success ? webhook.successCount + 1 : webhook.successCount,
              failureCount: success ? webhook.failureCount : webhook.failureCount + 1,
            } : webhook
          )
        };
      });
    }, 3000);

    toast({
      title: "Retrying event",
      description: "Attempting to resend webhook...",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "retrying":
        return <RotateCcw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "retrying":
        return "text-yellow-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const filteredLogs = webhooks.eventLogs.filter(log => {
    const matchesEvent = eventFilter === "" || log.event.toLowerCase().includes(eventFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesEvent && matchesStatus;
  });

  const addCustomHeader = (webhook: Partial<WebhookEndpoint>) => {
    const headers = webhook.customHeaders || [];
    return {
      ...webhook,
      customHeaders: [...headers, { key: "", value: "" }]
    };
  };

  const updateCustomHeader = (webhook: Partial<WebhookEndpoint>, index: number, field: "key" | "value", value: string) => {
    const headers = [...(webhook.customHeaders || [])];
    headers[index] = { ...headers[index], [field]: value };
    return {
      ...webhook,
      customHeaders: headers
    };
  };

  const removeCustomHeader = (webhook: Partial<WebhookEndpoint>, index: number) => {
    return {
      ...webhook,
      customHeaders: (webhook.customHeaders || []).filter((_, i) => i !== index)
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 px-2 sm:px-0" style={{ maxWidth: '95vw' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Webhooks & Event Log</h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Label htmlFor="test-mode" className="text-sm">Test Mode</Label>
            <Switch
              id="test-mode"
              checked={webhooks.testMode}
              onCheckedChange={(checked) => updateWebhooks({ testMode: checked })}
              data-testid="switch-test-mode"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 align-items-center h-auto">
          <TabsTrigger value="endpoints" data-testid="tab-endpoints" className="text-xs sm:text-sm">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Endpoints</span>
            <span className="sm:hidden">End</span>
          </TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events" className="text-xs sm:text-sm">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Event Log</span>
            <span className="sm:hidden">Log</span>
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings" className="text-xs sm:text-sm">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Set</span>
          </TabsTrigger>
        </TabsList>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Manage webhook endpoints and configure event delivery
            </p>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-webhook" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl  sm:mx-0 w-[calc(100vw-2rem)] sm:w-auto max-h-[100vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Webhook Endpoint</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-name">Name</Label>
                      <Input
                        id="webhook-name"
                        placeholder="My Webhook"
                        value={newWebhook.name}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                        data-testid="input-webhook-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://api.example.com/webhooks"
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                        data-testid="input-webhook-url"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Events</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {webhooks.eventTypes.map((event) => (
                        <label key={event} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newWebhook.events?.includes(event)}
                            onChange={(e) => {
                              const events = newWebhook.events || [];
                              if (e.target.checked) {
                                setNewWebhook(prev => ({ ...prev, events: [...events, event] }));
                              } else {
                                setNewWebhook(prev => ({ ...prev, events: events.filter(e => e !== event) }));
                              }
                            }}
                            data-testid={`checkbox-event-${event}`}
                            className="rounded"
                          />
                          <span className="text-sm break-words">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-secret">Secret (Optional)</Label>
                      <Input
                        id="webhook-secret"
                        type="password"
                        placeholder="webhook_secret_key"
                        value={newWebhook.secret}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                        data-testid="input-webhook-secret"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhook-timeout">Timeout (ms)</Label>
                      <Input
                        id="webhook-timeout"
                        type="number"
                        value={newWebhook.timeoutMs}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, timeoutMs: parseInt(e.target.value) || 5000 }))}
                        data-testid="input-webhook-timeout"
                      />
                    </div>
                  </div>

                  {/* Custom Headers */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <Label>Custom Headers</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewWebhook(addCustomHeader(newWebhook))}
                        data-testid="button-add-header"
                        className="w-full sm:w-auto"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Header
                      </Button>
                    </div>
                    {newWebhook.customHeaders?.map((header, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Header name"
                          value={header.key}
                          onChange={(e) => setNewWebhook(updateCustomHeader(newWebhook, index, "key", e.target.value))}
                          data-testid={`input-header-key-${index}`}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Header value"
                          value={header.value}
                          onChange={(e) => setNewWebhook(updateCustomHeader(newWebhook, index, "value", e.target.value))}
                          data-testid={`input-header-value-${index}`}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setNewWebhook(removeCustomHeader(newWebhook, index))}
                          data-testid={`button-remove-header-${index}`}
                          className="w-full sm:w-auto flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={addWebhook} 
                      disabled={!newWebhook.name || !newWebhook.url}
                      data-testid="button-save-webhook"
                      className="w-full sm:w-auto order-1 sm:order-2"
                    >
                      Create Webhook
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Webhooks List */}
          <div className="space-y-4">
            {webhooks.endpoints.map((webhook) => (
              <Card key={webhook.id} className="hover-elevate w-full overflow-hidden" data-testid={`webhook-card-${webhook.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${webhook.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg break-words">{webhook.name}</CardTitle>
                        <p className="text-sm text-muted-foreground font-mono break-all">{webhook.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={webhook.isActive ? "default" : "secondary"}>
                        {webhook.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Events */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Events</Label>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.length > 0 ? (
                        webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No events configured</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Success</span>
                      <p className="font-medium text-green-600" data-testid={`success-count-${webhook.id}`}>
                        {webhook.successCount}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Failed</span>
                      <p className="font-medium text-red-600" data-testid={`failure-count-${webhook.id}`}>
                        {webhook.failureCount}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Last Triggered</span>
                      <p className="font-medium text-xs break-words" data-testid={`last-triggered-${webhook.id}`}>
                        {webhook.lastTriggered 
                          ? webhook.lastTriggered.toLocaleString()
                          : "Never"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testWebhook(webhook.id)}
                      disabled={testingWebhook === webhook.id}
                      data-testid={`button-test-${webhook.id}`}
                      className="flex-1 sm:flex-none"
                    >
                      {testingWebhook === webhook.id ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Test
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => updateWebhook(webhook.id, { isActive: !webhook.isActive })}
                      data-testid={`button-toggle-${webhook.id}`}
                      className="flex-1 sm:flex-none"
                    >
                      {webhook.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteWebhook(webhook.id)}
                      data-testid={`button-delete-${webhook.id}`}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {webhooks.endpoints.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No webhooks configured</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first webhook to start receiving event notifications
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-webhook">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Event Log Tab */}
        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by event name..."
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="pl-10"
                data-testid="input-event-filter"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event Log */}
          <Card>
            <CardHeader>
              <CardTitle>Event Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="lg:h-96">
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`event-log-${log.id}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <div className="text-sm">
                            <p className="font-medium">{log.event}</p>
                            <p className="text-muted-foreground">{log.webhookName}</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{log.timestamp.toLocaleString()}</p>
                          {log.duration > 0 && <p>{log.duration}ms</p>}
                        </div>
                        <div className="text-sm">
                          <Badge variant="outline" className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                          {log.attempts > 1 && (
                            <Badge variant="secondary" className="ml-2">
                              Attempt {log.attempts}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.status === "failed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => retryEvent(log.id)}
                            data-testid={`button-retry-${log.id}`}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" data-testid={`button-view-${log.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Event Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Event</Label>
                                  <p className="text-sm">{log.event}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(log.status)}
                                    <span className={`text-sm ${getStatusColor(log.status)}`}>
                                      {log.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Payload</Label>
                                <Textarea
                                  value={JSON.stringify(log.payload, null, 2)}
                                  readOnly
                                  className="font-mono text-xs h-32"
                                  data-testid={`payload-${log.id}`}
                                />
                              </div>
                              {log.response && (
                                <div>
                                  <Label className="text-sm font-medium">Response</Label>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-4 text-sm">
                                      <span>Status: {log.response.status}</span>
                                      <span>Duration: {log.duration}ms</span>
                                    </div>
                                    <Textarea
                                      value={log.response.body}
                                      readOnly
                                      className="font-mono text-xs h-20"
                                      data-testid={`response-${log.id}`}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}

                  {filteredLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No events found</p>
                      <p className="text-sm">Webhook events will appear here when triggered</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Webhook Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="global-timeout">Default Timeout (ms)</Label>
                    <Input
                      id="global-timeout"
                      type="number"
                      value={webhooks.globalTimeoutMs}
                      onChange={(e) => updateWebhooks({ globalTimeoutMs: parseInt(e.target.value) || 5000 })}
                      data-testid="input-global-timeout"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="global-retry">Global Retry</Label>
                      <p className="text-sm text-muted-foreground">Enable retry for failed webhooks</p>
                    </div>
                    <Switch
                      id="global-retry"
                      checked={webhooks.globalRetryEnabled}
                      onCheckedChange={(checked) => updateWebhooks({ globalRetryEnabled: checked })}
                      data-testid="switch-global-retry"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Available Event Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {webhooks.eventTypes.map((event) => (
                    <div 
                      key={event} 
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-3 bg-muted rounded-lg"
                      data-testid={`event-type-${event}`}
                    >
                      <span className=" text-xs lg:text-sm  font-medium">{event}</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {webhooks.testMode && (
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>
                    Test mode is enabled. Webhooks will not be sent to external endpoints, only simulated locally.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Test Payload */}
          <Card>
            <CardHeader>
              <CardTitle>Test Payload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-payload">Custom Test Payload (JSON)</Label>
                <Textarea
                  id="test-payload"
                  placeholder='{"test": true, "message": "Hello World"}'
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="font-mono text-sm h-32"
                  data-testid="textarea-test-payload"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This payload will be used when testing webhooks. Leave empty to use default test payload.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}