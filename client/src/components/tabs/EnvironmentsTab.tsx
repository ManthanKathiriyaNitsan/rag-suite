import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Separator } from "@/components/ui/Separator";
import { Progress } from "@/components/ui/Progress";
import { 
  Server, 
  Globe, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Eye,
  GitBranch,
  Zap,
  Settings,
  Monitor,
  Database,
  Shield,
  BarChart3,
  Copy,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface EnvironmentConfig {
  id: string;
  name: string;
  type: "staging" | "production";
  status: "active" | "inactive" | "deploying" | "error";
  url: string;
  lastDeployed: Date | null;
  version: string;
  
  // Performance
  uptime: number; // percentage
  responseTime: number; // ms
  requestsPerMinute: number;
  errorRate: number; // percentage
  
  // Configuration
  autoDeployEnabled: boolean;
  maintenanceMode: boolean;
  deploymentBranch: string;
  
  // Limits
  rateLimitRpm: number;
  maxConcurrentUsers: number;
  
  // Environment Variables
  environmentVars: {
    key: string;
    value: string;
    isSecret: boolean;
  }[];
}

interface EnvironmentsData {
  environments: EnvironmentConfig[];
  defaultEnvironment: string;
  autoPromotionEnabled: boolean;
  deploymentNotifications: boolean;
}

interface EnvironmentsTabProps {
  data: EnvironmentsData;
  onChange: (data: EnvironmentsData) => void;
}

export default function EnvironmentsTab({ data, onChange }: EnvironmentsTabProps) {
  const [environments, setEnvironments] = useState<EnvironmentsData>(data);
  const [selectedEnv, setSelectedEnv] = useState<string>(data.environments[0]?.id || "");
  const [newEnvVar, setNewEnvVar] = useState({ key: "", value: "", isSecret: false });
  const [showEnvVars, setShowEnvVars] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Sync local state when parent data changes (for edit mode)
  useEffect(() => {
    setEnvironments(data);
    if (data.environments.length > 0 && !selectedEnv) {
      setSelectedEnv(data.environments[0].id);
    }
  }, [data, selectedEnv, setEnvironments, setSelectedEnv]);

  // Update parent state when environments change
  useEffect(() => {
    onChange(environments);
  }, [environments, onChange]);

  const updateEnvironments = (updates: Partial<EnvironmentsData>) => {
    setEnvironments(prev => ({ ...prev, ...updates }));
  };

  const updateEnvironment = (envId: string, updates: Partial<EnvironmentConfig>) => {
    setEnvironments(prev => ({
      ...prev,
      environments: prev.environments.map(env =>
        env.id === envId ? { ...env, ...updates } : env
      )
    }));
  };

  const getSelectedEnvironment = () => {
    return environments.environments.find(env => env.id === selectedEnv);
  };

  const deployToEnvironment = (envId: string) => {
    updateEnvironment(envId, { 
      status: "deploying",
      lastDeployed: new Date()
    });
    
    // Simulate deployment
    setTimeout(() => {
      updateEnvironment(envId, { 
        status: "active",
        version: `v1.${Math.floor(Math.random() * 100)}.0`
      });
      toast({
        title: "Deployment successful",
        description: `Successfully deployed to ${environments.environments.find(e => e.id === envId)?.name}`,
      });
    }, 3000);
    
    toast({
      title: "Deployment started",
      description: `Deploying to ${environments.environments.find(e => e.id === envId)?.name}...`,
    });
  };

  const promoteToProduction = () => {
    const staging = environments.environments.find(env => env.type === "staging");
    const production = environments.environments.find(env => env.type === "production");
    
    if (staging && production) {
      updateEnvironment(production.id, {
        version: staging.version,
        status: "deploying"
      });
      
      setTimeout(() => {
        updateEnvironment(production.id, {
          status: "active",
          lastDeployed: new Date()
        });
        toast({
          title: "Promotion successful",
          description: "Staging version promoted to production",
        });
      }, 2000);
      
      toast({
        title: "Promoting to production",
        description: "Deploying staging version to production...",
      });
    }
  };

  const addEnvironmentVariable = () => {
    const env = getSelectedEnvironment();
    if (!env || !newEnvVar.key.trim()) return;
    
    const updatedVars = [
      ...env.environmentVars,
      { ...newEnvVar, key: newEnvVar.key.trim() }
    ];
    
    updateEnvironment(env.id, { environmentVars: updatedVars });
    setNewEnvVar({ key: "", value: "", isSecret: false });
    
    toast({
      title: "Environment variable added",
      description: `Added ${newEnvVar.key} to ${env.name}`,
    });
  };

  const removeEnvironmentVariable = (envId: string, varIndex: number) => {
    const env = environments.environments.find(e => e.id === envId);
    if (!env) return;
    
    const updatedVars = env.environmentVars.filter((_, index) => index !== varIndex);
    updateEnvironment(envId, { environmentVars: updatedVars });
    
    toast({
      title: "Environment variable removed",
      description: "Variable has been deleted",
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Environment URL copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "deploying":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "deploying":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Environment Management</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={promoteToProduction}
            disabled={!environments.environments.find(e => e.type === "staging" && e.status === "active")}
            data-testid="button-promote-production"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Promote to Production
          </Button>
        </div>
      </div>

      {/* Environment Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {environments.environments.map((env) => (
          <Card 
            key={env.id} 
            className={`cursor-pointer transition-all hover-elevate ${
              selectedEnv === env.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedEnv(env.id)}
            data-testid={`card-environment-${env.type}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(env.status)}`} />
                  <div>
                    <CardTitle className="text-lg">{env.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{env.type} Environment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(env.status)}
                  <Badge variant={env.type === "production" ? "default" : "secondary"}>
                    {env.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL and Version */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">URL</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(env.url);
                      }}
                      data-testid={`button-copy-url-${env.type}`}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(env.url, "_blank");
                      }}
                      data-testid={`button-open-url-${env.type}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  {env.url}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version:</span>
                  <Badge variant="outline" data-testid={`badge-version-${env.type}`}>{env.version}</Badge>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Performance</Label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium" data-testid={`metric-uptime-${env.type}`}>{env.uptime}%</span>
                    </div>
                    <Progress value={env.uptime} className="h-1" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response</span>
                      <span className="font-medium" data-testid={`metric-response-${env.type}`}>{env.responseTime}ms</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requests/min</span>
                      <span className="font-medium" data-testid={`metric-requests-${env.type}`}>{env.requestsPerMinute}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Error rate</span>
                      <span className="font-medium" data-testid={`metric-errors-${env.type}`}>{env.errorRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant={env.status === "active" ? "secondary" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    deployToEnvironment(env.id);
                  }}
                  disabled={env.status === "deploying"}
                  data-testid={`button-deploy-${env.type}`}
                >
                  {env.status === "deploying" ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {env.status === "deploying" ? "Deploying..." : "Deploy"}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEnv(env.id);
                  }}
                  data-testid={`button-configure-${env.type}`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>

              {/* Last Deployed */}
              {env.lastDeployed && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Clock className="h-3 w-3" />
                  Last deployed: {env.lastDeployed.toLocaleDateString()} at {env.lastDeployed.toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Configuration for Selected Environment */}
      {selectedEnv && getSelectedEnvironment() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {getSelectedEnvironment()?.name} Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* General Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deployment-branch">Deployment Branch</Label>
                  <Select 
                    value={getSelectedEnvironment()?.deploymentBranch} 
                    onValueChange={(value) => updateEnvironment(selectedEnv, { deploymentBranch: value })}
                  >
                    <SelectTrigger id="deployment-branch" data-testid="select-deployment-branch">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="develop">develop</SelectItem>
                      <SelectItem value="staging">staging</SelectItem>
                      <SelectItem value="release">release</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={getSelectedEnvironment()?.rateLimitRpm}
                    onChange={(e) => updateEnvironment(selectedEnv, { rateLimitRpm: parseInt(e.target.value) || 0 })}
                    data-testid="input-rate-limit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-users">Max Concurrent Users</Label>
                  <Input
                    id="max-users"
                    type="number"
                    value={getSelectedEnvironment()?.maxConcurrentUsers}
                    onChange={(e) => updateEnvironment(selectedEnv, { maxConcurrentUsers: parseInt(e.target.value) || 0 })}
                    data-testid="input-max-users"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-deploy">Auto Deploy</Label>
                    <p className="text-sm text-muted-foreground">Deploy automatically on code push</p>
                  </div>
                  <Switch
                    id="auto-deploy"
                    checked={getSelectedEnvironment()?.autoDeployEnabled}
                    onCheckedChange={(checked) => updateEnvironment(selectedEnv, { autoDeployEnabled: checked })}
                    data-testid="switch-auto-deploy"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Show maintenance page to users</p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={getSelectedEnvironment()?.maintenanceMode}
                    onCheckedChange={(checked) => updateEnvironment(selectedEnv, { maintenanceMode: checked })}
                    data-testid="switch-maintenance-mode"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Environment Variables */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Environment Variables</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEnvVars({
                    ...showEnvVars,
                    [selectedEnv]: !showEnvVars[selectedEnv]
                  })}
                  data-testid="button-toggle-env-vars"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showEnvVars[selectedEnv] ? "Hide Values" : "Show Values"}
                </Button>
              </div>

              {/* Add New Variable */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 bg-muted rounded-lg">
                <Input
                  placeholder="Variable name"
                  value={newEnvVar.key}
                  onChange={(e) => setNewEnvVar(prev => ({ ...prev, key: e.target.value }))}
                  data-testid="input-env-var-key"
                />
                <Input
                  placeholder="Value"
                  type={newEnvVar.isSecret ? "password" : "text"}
                  value={newEnvVar.value}
                  onChange={(e) => setNewEnvVar(prev => ({ ...prev, value: e.target.value }))}
                  data-testid="input-env-var-value"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id="is-secret"
                    checked={newEnvVar.isSecret}
                    onCheckedChange={(checked) => setNewEnvVar(prev => ({ ...prev, isSecret: checked }))}
                    data-testid="switch-env-var-secret"
                  />
                  <Label htmlFor="is-secret" className="text-sm">Secret</Label>
                </div>
                <Button 
                  onClick={addEnvironmentVariable}
                  disabled={!newEnvVar.key.trim()}
                  data-testid="button-add-env-var"
                >
                  Add Variable
                </Button>
              </div>

              {/* Variables List */}
              <div className="space-y-2">
                {getSelectedEnvironment()?.environmentVars.map((envVar, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                    data-testid={`env-var-${index}`}
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">KEY</Label>
                        <p className="font-mono text-sm">{envVar.key}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">VALUE</Label>
                        <p className="font-mono text-sm">
                          {envVar.isSecret && !showEnvVars[selectedEnv] 
                            ? "••••••••" 
                            : envVar.value || "(empty)"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {envVar.isSecret && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Secret
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEnvironmentVariable(selectedEnv, index)}
                        data-testid={`button-remove-env-var-${index}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                {getSelectedEnvironment()?.environmentVars.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No environment variables configured</p>
                    <p className="text-sm">Add variables above to get started</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Environment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-environment">Default Environment</Label>
                <Select 
                  value={environments.defaultEnvironment} 
                  onValueChange={(value) => updateEnvironments({ defaultEnvironment: value })}
                >
                  <SelectTrigger id="default-environment" data-testid="select-default-environment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.environments.map((env) => (
                      <SelectItem key={env.id} value={env.id}>
                        {env.name} ({env.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-promotion">Auto Promotion</Label>
                  <p className="text-sm text-muted-foreground">Auto-promote staging to production</p>
                </div>
                <Switch
                  id="auto-promotion"
                  checked={environments.autoPromotionEnabled}
                  onCheckedChange={(checked) => updateEnvironments({ autoPromotionEnabled: checked })}
                  data-testid="switch-auto-promotion"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="deployment-notifications">Deployment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify on deployments</p>
                </div>
                <Switch
                  id="deployment-notifications"
                  checked={environments.deploymentNotifications}
                  onCheckedChange={(checked) => updateEnvironments({ deploymentNotifications: checked })}
                  data-testid="switch-deployment-notifications"
                />
              </div>
            </div>
          </div>

          {environments.autoPromotionEnabled && (
            <Alert>
              <GitBranch className="h-4 w-4" />
              <AlertDescription>
                Auto-promotion is enabled. Successful staging deployments will automatically be promoted to production after validation.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
