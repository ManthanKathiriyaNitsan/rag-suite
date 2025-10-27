import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Globe,
  Key,
  Database,
  Server,
  Download,
  RefreshCw,
  Eye,
  Bell,
  BellOff,
  Info,
  ExternalLink,
  Settings,
  Filter
} from "lucide-react";

interface SecurityAlert {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "authentication" | "authorization" | "data_breach" | "suspicious_activity" | "system_vulnerability" | "network_attack";
  status: "active" | "investigating" | "resolved" | "false_positive";
  source: string;
  affectedUsers?: string[];
  affectedResources?: string[];
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
}

interface SecurityAlertsSectionProps {
  alerts: SecurityAlert[];
  onRefresh: () => void;
  onExport: () => void;
  onUpdateAlert: (alertId: string, updates: Partial<SecurityAlert>) => void;
  loading?: boolean;
}

const SecurityAlertsSection: React.FC<SecurityAlertsSectionProps> = ({
  alerts,
  onRefresh,
  onExport,
  onUpdateAlert,
  loading = false
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    if (statusFilter !== "all") {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(alert => alert.category === categoryFilter);
    }

    return filtered.sort((a, b) => {
      // Sort by severity first (critical -> low), then by timestamp
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aSeverity = severityOrder[a.severity as keyof typeof severityOrder];
      const bSeverity = severityOrder[b.severity as keyof typeof severityOrder];
      
      if (aSeverity !== bSeverity) {
        return bSeverity - aSeverity;
      }
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [alerts, statusFilter, severityFilter, categoryFilter]);

  const getSeverityIcon = useCallback((severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "high":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "low":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  }, []);

  const getSeverityBadge = useCallback((severity: string) => {
    const variants = {
      low: "secondary" as const,
      medium: "default" as const,
      high: "destructive" as const,
      critical: "destructive" as const,
    };
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || "secondary"}>
        {severity.toUpperCase()}
      </Badge>
    );
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const variants = {
      active: "destructive" as const,
      investigating: "default" as const,
      resolved: "secondary" as const,
      false_positive: "outline" as const,
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    const icons: Record<string, React.ReactNode> = {
      "authentication": <Key className="h-4 w-4" />,
      "authorization": <Shield className="h-4 w-4" />,
      "data_breach": <Database className="h-4 w-4" />,
      "suspicious_activity": <User className="h-4 w-4" />,
      "system_vulnerability": <Server className="h-4 w-4" />,
      "network_attack": <Globe className="h-4 w-4" />,
    };
    
    return icons[category] || <AlertTriangle className="h-4 w-4" />;
  }, []);

  const formatTimestamp = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  }, []);

  const getRelativeTime = useCallback((timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, []);

  const handleStatusUpdate = useCallback((alertId: string, newStatus: string) => {
    onUpdateAlert(alertId, { 
      status: newStatus as SecurityAlert['status'],
      resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : undefined
    });
  }, [onUpdateAlert]);

  const alertStats = useMemo(() => {
    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      investigating: alerts.filter(a => a.status === 'investigating').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
    };
    return stats;
  }, [alerts]);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </h3>
          <p className="text-sm text-muted-foreground">
            Monitor and manage security incidents and threats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{alertStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{alertStats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{alertStats.investigating}</p>
                <p className="text-xs text-muted-foreground">Investigating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{alertStats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{alertStats.critical}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{alertStats.high}</p>
                <p className="text-xs text-muted-foreground">High</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-input rounded-md bg-background"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <select 
                value={severityFilter} 
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-input rounded-md bg-background"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-input rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="authorization">Authorization</option>
                <option value="data_breach">Data Breach</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="system_vulnerability">System Vulnerability</option>
                <option value="network_attack">Network Attack</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No security alerts found</p>
              <p className="text-sm text-muted-foreground">
                Security alerts will appear here when detected
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-l-red-500' :
              alert.severity === 'high' ? 'border-l-orange-500' :
              alert.severity === 'medium' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                        {getSeverityBadge(alert.severity)}
                        {getStatusBadge(alert.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(alert.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(alert.category)}
                          {alert.category.replace('_', ' ')}
                        </div>
                        {alert.ipAddress && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {alert.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">{alert.description}</p>
                
                {alert.status === 'active' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStatusUpdate(alert.id, 'investigating')}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Start Investigation
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(alert.id, 'false_positive')}
                    >
                      <BellOff className="h-3 w-3 mr-1" />
                      Mark False Positive
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(alert.id, 'resolved')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                  </div>
                )}

                {alert.status === 'investigating' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStatusUpdate(alert.id, 'resolved')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(alert.id, 'false_positive')}
                    >
                      <BellOff className="h-3 w-3 mr-1" />
                      Mark False Positive
                    </Button>
                  </div>
                )}

                {alert.resolution && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Resolution:</p>
                    <p className="text-sm text-muted-foreground">{alert.resolution}</p>
                    {alert.resolvedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Resolved: {formatTimestamp(alert.resolvedAt)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Security alerts help you monitor and respond to potential security threats.
          Critical and high severity alerts should be investigated immediately.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SecurityAlertsSection;
