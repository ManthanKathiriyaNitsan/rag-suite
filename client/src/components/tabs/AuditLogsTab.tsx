import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { 
  FileText, 
  Clock, 
  User, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Activity,
  Database,
  Settings,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  RefreshCw,
  Globe,
  Key,
  Webhook,
  BarChart3,
  TestTube2,
  Folder,
  Upload,
  FileX,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { VirtualizedTable } from "@/components/ui/VirtualizedTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

// Audit Log interfaces
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  action: string;
  category: "user" | "integration" | "security" | "data" | "system" | "api";
  severity: "low" | "medium" | "high" | "critical";
  resource: string;
  resourceId?: string;
  description: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  location?: string;
  sessionId: string;
  outcome: "success" | "failure" | "warning";
  changes?: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

interface SecurityAlert {
  id: string;
  timestamp: Date;
  type: "failed_login" | "suspicious_activity" | "unauthorized_access" | "data_breach" | "policy_violation";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  affected: {
    userId?: string;
    resourceId?: string;
    ipAddress?: string;
    count?: number;
  };
  status: "open" | "investigating" | "resolved" | "false_positive";
  assignee?: string;
  resolution?: string;
  relatedLogIds: string[];
}

interface ComplianceReport {
  id: string;
  type: "access_report" | "change_log" | "security_audit" | "data_usage" | "policy_compliance";
  title: string;
  description: string;
  generatedAt: Date;
  generatedBy: string;
  period: {
    start: Date;
    end: Date;
  };
  status: "generating" | "ready" | "expired";
  downloadUrl?: string;
  fileSize?: string;
  recordCount: number;
  filters: Record<string, unknown>;
}

interface AuditSettings {
  retentionPeriod: number; // days
  enableRealTimeAlerts: boolean;
  logLevels: string[];
  categories: string[];
  automaticReports: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    recipients: string[];
    includeCompliance: boolean;
  };
  alertThresholds: {
    failedLogins: number;
    suspiciousActivity: number;
    dataAccess: number;
  };
  export: {
    formats: string[];
    encryption: boolean;
    maxRecords: number;
  };
}

interface AuditLogsData {
  logs: AuditLogEntry[];
  securityAlerts: SecurityAlert[];
  complianceReports: ComplianceReport[];
  settings: AuditSettings;
  stats: {
    totalLogs: number;
    logsToday: number;
    activeAlerts: number;
    criticalAlerts: number;
    userActivity: {
      totalUsers: number;
      activeToday: number;
      newThisWeek: number;
    };
    systemHealth: {
      uptime: string;
      errorRate: number;
      responseTime: number;
    };
  };
}

// Sample audit logs data
const defaultAuditData: AuditLogsData = {
  logs: [
    {
      id: "log-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      userId: "user-001",
      userName: "John Doe",
      userEmail: "john@company.com",
      action: "integration.update",
      category: "integration",
      severity: "medium",
      resource: "Integration Settings",
      resourceId: "int-001",
      description: "Updated integration configuration for search widget",
      details: {
        configChanges: ["searchPlaceholder", "primaryColor", "enableAnalytics"],
        previousValues: {
          searchPlaceholder: "Search...",
          primaryColor: "#0066CC",
          enableAnalytics: false
        },
        newValues: {
          searchPlaceholder: "Ask me anything...",
          primaryColor: "#1F6FEB",
          enableAnalytics: true
        }
      },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      location: "San Francisco, CA",
      sessionId: "sess-abc123",
      outcome: "success",
      changes: {
        before: { enableAnalytics: false },
        after: { enableAnalytics: true }
      }
    },
    {
      id: "log-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      userId: "user-002",
      userName: "Jane Smith",
      userEmail: "jane@company.com",
      action: "user.invite",
      category: "user",
      severity: "low",
      resource: "User Management",
      description: "Invited new user to the platform",
      details: {
        invitedEmail: "newuser@company.com",
        assignedRole: "editor",
        invitationMessage: "Welcome to our team!"
      },
      ipAddress: "10.0.0.50",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      location: "New York, NY",
      sessionId: "sess-def456",
      outcome: "success"
    },
    {
      id: "log-003",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      userId: "user-003",
      userName: "Bob Wilson",
      userEmail: "bob@company.com",
      action: "auth.login_failed",
      category: "security",
      severity: "high",
      resource: "Authentication",
      description: "Failed login attempt - invalid credentials",
      details: {
        attemptCount: 3,
        reason: "invalid_password",
        lockoutTriggered: false
      },
      ipAddress: "203.0.113.45",
      userAgent: "Mozilla/5.0 (Linux; Android 10)",
      location: "Unknown",
      sessionId: "sess-ghi789",
      outcome: "failure"
    },
    {
      id: "log-004",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      userId: "user-001",
      userName: "John Doe",
      userEmail: "john@company.com",
      action: "data.export",
      category: "data",
      severity: "medium",
      resource: "Analytics Data",
      description: "Exported search analytics data",
      details: {
        dateRange: "2024-08-01 to 2024-08-31",
        recordCount: 15420,
        fileFormat: "CSV",
        fileSize: "2.3 MB"
      },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      location: "San Francisco, CA",
      sessionId: "sess-jkl012",
      outcome: "success"
    },
    {
      id: "log-005",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      userId: "system",
      userName: "System",
      userEmail: "system@platform.com",
      action: "system.maintenance",
      category: "system",
      severity: "low",
      resource: "System Maintenance",
      description: "Automated database backup completed",
      details: {
        backupSize: "1.2 GB",
        duration: "15 minutes",
        tables: ["integrations", "users", "analytics", "audit_logs"]
      },
      ipAddress: "127.0.0.1",
      userAgent: "Internal System",
      sessionId: "system-backup",
      outcome: "success"
    },
  ],
  securityAlerts: [
    {
      id: "alert-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      type: "failed_login",
      severity: "high",
      title: "Multiple Failed Login Attempts",
      description: "User account bob@company.com has 5 failed login attempts in the last 10 minutes",
      affected: {
        userId: "user-003",
        ipAddress: "203.0.113.45",
        count: 5
      },
      status: "investigating",
      assignee: "security-team",
      relatedLogIds: ["log-003"]
    },
    {
      id: "alert-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      type: "suspicious_activity",
      severity: "medium",
      title: "Unusual Data Access Pattern",
      description: "Large data export outside normal business hours",
      affected: {
        userId: "user-001",
        resourceId: "analytics-data",
        count: 1
      },
      status: "resolved",
      assignee: "admin-team",
      resolution: "Confirmed legitimate business use - user working on quarterly report",
      relatedLogIds: ["log-004"]
    },
  ],
  complianceReports: [
    {
      id: "report-001",
      type: "access_report",
      title: "Monthly User Access Report",
      description: "Comprehensive report of all user access activities for August 2024",
      generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      generatedBy: "system-automated",
      period: {
        start: new Date("2024-08-01"),
        end: new Date("2024-08-31")
      },
      status: "ready",
      downloadUrl: "/downloads/access-report-aug-2024.pdf",
      fileSize: "4.2 MB",
      recordCount: 1542,
      filters: {
        includeSystemUsers: false,
        minimumSeverity: "low"
      }
    },
    {
      id: "report-002",
      type: "security_audit",
      title: "Q3 Security Audit Report",
      description: "Quarterly security audit including failed logins, policy violations, and access patterns",
      generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      generatedBy: "jane@company.com",
      period: {
        start: new Date("2024-07-01"),
        end: new Date("2024-09-30")
      },
      status: "ready",
      downloadUrl: "/downloads/security-audit-q3-2024.pdf",
      fileSize: "8.7 MB",
      recordCount: 3241,
      filters: {
        securityOnly: true,
        includeSuspiciousActivity: true
      }
    },
    {
      id: "report-003",
      type: "change_log",
      title: "Integration Changes Report",
      description: "All configuration changes made to integrations in the last 30 days",
      generatedAt: new Date(),
      generatedBy: "john@company.com",
      period: {
        start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        end: new Date()
      },
      status: "generating",
      recordCount: 0,
      filters: {
        category: "integration",
        includeMinorChanges: false
      }
    },
  ],
  settings: {
    retentionPeriod: 365,
    enableRealTimeAlerts: true,
    logLevels: ["low", "medium", "high", "critical"],
    categories: ["user", "integration", "security", "data", "system", "api"],
    automaticReports: {
      enabled: true,
      frequency: "monthly",
      recipients: ["admin@company.com", "security@company.com"],
      includeCompliance: true
    },
    alertThresholds: {
      failedLogins: 5,
      suspiciousActivity: 3,
      dataAccess: 10
    },
    export: {
      formats: ["CSV", "JSON", "PDF"],
      encryption: true,
      maxRecords: 50000
    }
  },
  stats: {
    totalLogs: 15420,
    logsToday: 124,
    activeAlerts: 3,
    criticalAlerts: 0,
    userActivity: {
      totalUsers: 45,
      activeToday: 12,
      newThisWeek: 2
    },
    systemHealth: {
      uptime: "99.9%",
      errorRate: 0.02,
      responseTime: 245
    }
  }
};

interface AuditLogsTabProps {
  data: AuditLogsData;
  onChange: (data: AuditLogsData) => void;
}

export default function AuditLogsTab({ data, onChange }: AuditLogsTabProps) {
  const [activeTab, setActiveTab] = useState("logs");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  // Use data directly from props (controlled component pattern)
  
  const updateAuditData = (updates: Partial<AuditLogsData>) => {
    onChange({ ...data, ...updates });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "high": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "medium": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "low": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "user": return <User className="w-4 h-4" />;
      case "integration": return <Settings className="w-4 h-4" />;
      case "security": return <Shield className="w-4 h-4" />;
      case "data": return <Database className="w-4 h-4" />;
      case "system": return <Activity className="w-4 h-4" />;
      case "api": return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failure": return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge variant="destructive">Open</Badge>;
      case "investigating": return <Badge variant="secondary">Investigating</Badge>;
      case "resolved": return <Badge variant="outline">Resolved</Badge>;
      case "false_positive": return <Badge variant="outline">False Positive</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case "generating": return <Badge variant="secondary">Generating</Badge>;
      case "ready": return <Badge variant="default">Ready</Badge>;
      case "expired": return <Badge variant="outline">Expired</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredLogs = data.logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    
    // Date range filtering
    const now = Date.now();
    const logTime = log.timestamp.getTime();
    let matchesDate = true;
    
    switch (dateRange) {
      case "1d":
        matchesDate = now - logTime <= 24 * 60 * 60 * 1000;
        break;
      case "7d":
        matchesDate = now - logTime <= 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        matchesDate = now - logTime <= 30 * 24 * 60 * 60 * 1000;
        break;
      case "90d":
        matchesDate = now - logTime <= 90 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesDate;
  });

  return (
    <div className="space-y-4 lg:space-y-6 w-full max-w-full overflow-hidden min-w-0 px-2 lg:px-0" style={{ maxWidth: 'calc(93vw)' }}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Audit Logs & Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Monitor system activity, track changes, and generate compliance reports
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full lg:w-auto">
          <Button variant="outline" size="sm" data-testid="button-export-logs" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" data-testid="button-refresh-logs" className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-stats-total-logs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold" data-testid="text-total-logs">{data.stats.totalLogs.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stats-logs-today">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Logs Today</p>
                <p className="text-2xl font-bold" data-testid="text-logs-today">{data.stats.logsToday}</p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stats-active-alerts">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-500" data-testid="text-active-alerts">{data.stats.activeAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stats-system-uptime">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold text-green-500" data-testid="text-system-uptime">{data.stats.systemHealth.uptime}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="logs" data-testid="tab-activity-logs" className="text-sm">Activity Logs</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-security-alerts" className="text-sm">Security Alerts</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-compliance-reports" className="text-sm">Reports</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-audit-settings" className="text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card data-testid="card-activity-logs">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0 sm:items-center justify-between">
                <div>
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>
                    Real-time activity monitoring and historical log review
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0 sm:items-center justify-between">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                      data-testid="input-search-logs"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className=" w-[100%] lg:w-32" data-testid="select-category-filter">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className=" w-[100%]  lg:w-28" data-testid="select-severity-filter">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className=" w-[100%] lg:w-24" data-testid="select-date-range">
                      <SelectValue placeholder="Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12" data-testid="status-no-logs">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No logs found matching your filters</p>
                  </div>
                ) : (
                  <div className="mx-2 sm:mx-0">
                    <div className="text-xs text-muted-foreground mb-2">
                      🚀 Virtualized table for optimal performance with large datasets
                    </div>
                    <VirtualizedTable
                      data={filteredLogs}
                      columns={[
                        {
                          key: 'timestamp',
                          label: 'Time',
                          width: 150,
                          render: (log: AuditLogEntry) => (
                            <div className="font-mono text-xs">
                              {log.timestamp.toLocaleString()}
                            </div>
                          ),
                        },
                        {
                          key: 'user',
                          label: 'User',
                          width: 200,
                          render: (log: AuditLogEntry) => (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={log.userAvatar} alt={log.userName} />
                                <AvatarFallback className="text-xs">
                                  {log.userName.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{log.userName}</p>
                                <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                              </div>
                            </div>
                          ),
                        },
                        {
                          key: 'action',
                          label: 'Action',
                          width: 200,
                          render: (log: AuditLogEntry) => (
                            <div>
                              <div className="font-mono text-sm">{log.action}</div>
                              <div className="text-xs text-muted-foreground">{log.resource}</div>
                            </div>
                          ),
                        },
                        {
                          key: 'category',
                          label: 'Category',
                          width: 100,
                          render: (log: AuditLogEntry) => (
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(log.category)}
                              <span className="text-sm capitalize">{log.category}</span>
                            </div>
                          ),
                        },
                        {
                          key: 'severity',
                          label: 'Severity',
                          width: 100,
                          render: (log: AuditLogEntry) => (
                            <Badge variant={getSeverityBadgeVariant(log.severity)}>
                              {getSeverityIcon(log.severity)}
                              <span className="ml-1 capitalize">{log.severity}</span>
                            </Badge>
                          ),
                        },
                        {
                          key: 'outcome',
                          label: 'Outcome',
                          width: 80,
                          render: (log: AuditLog) => getOutcomeIcon(log.outcome),
                        },
                        {
                          key: 'details',
                          label: 'Details',
                          width: 100,
                          render: (log: AuditLogEntry) => (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedLog(log.id)}
                              data-testid={`button-view-log-${log.id}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          ),
                        },
                      ]}
                      height={400}
                      itemHeight={60}
                      className="min-w-[800px] lg:min-w-[1000px]"
                      onRowClick={(log: any) => setSelectedLog(log.id)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card data-testid="card-security-alerts">
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Monitor and respond to security incidents and suspicious activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.securityAlerts.length === 0 ? (
                  <div className="text-center py-12" data-testid="status-no-alerts">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="font-medium text-green-600">All Clear!</p>
                    <p className="text-sm text-muted-foreground">No active security alerts</p>
                  </div>
                ) : (
                  data.securityAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-0 lg:p-4 space-y-3" data-testid={`card-alert-${alert.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col lg:flex-row gap-3 lg:gap-0 items-start gap-3">
                          <div className="mt-1">
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {getAlertStatusBadge(alert.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                            <div className="text-xs text-muted-foreground">
                              {alert.timestamp.toLocaleString()}
                              {alert.assignee && ` • Assigned to ${alert.assignee}`}
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-alert-menu-${alert.id}`}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem data-testid={`button-view-alert-${alert.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem data-testid={`button-assign-alert-${alert.id}`}>
                              <User className="w-4 h-4 mr-2" />
                              Assign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem data-testid={`button-resolve-alert-${alert.id}`}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {alert.resolution && (
                        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-3">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Resolution:</strong> {alert.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card data-testid="card-compliance-reports">
            <CardHeader>
              <div className="flex flex-col lg:flex-row items-start gap-3 lg:gap-0 lg:items-center justify-between">
                <div>
                  <CardTitle>Compliance Reports</CardTitle>
                  <CardDescription>
                    Generate and download compliance and audit reports
                  </CardDescription>
                </div>
                <Button data-testid="button-generate-report">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.complianceReports.map((report) => (
                  <div key={report.id} className="border rounded-lg  p-0 lg:p-4 space-y-3" data-testid={`card-report-${report.id}`}>
                    <div className="flex flex-col lg:flex-row items-start gap-3 lg:gap-0 lg:items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{report.title}</h4>
                          {getReportStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Period:</span>{" "}
                            {report.period.start.toLocaleDateString()} - {report.period.end.toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Records:</span>{" "}
                            {report.recordCount.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Generated:</span>{" "}
                            {report.generatedAt.toLocaleDateString()}
                          </div>
                          {report.fileSize && (
                            <div>
                              <span className="text-muted-foreground">Size:</span>{" "}
                              {report.fileSize}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {report.status === "ready" && (
                          <Button variant="outline" size="sm" data-testid={`button-download-report-${report.id}`}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-report-menu-${report.id}`}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem data-testid={`button-view-report-${report.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem data-testid={`button-regenerate-report-${report.id}`}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Regenerate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" data-testid={`button-delete-report-${report.id}`}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card data-testid="card-audit-settings">
            <CardHeader>
              <CardTitle>Audit Settings</CardTitle>
              <CardDescription>
                Configure logging, retention, and alert policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retention-period">Log Retention Period (days)</Label>
                    <Input
                      id="retention-period"
                      type="number"
                      min="30"
                      max="2555"
                      value={data.settings.retentionPeriod}
                      onChange={(e) => 
                        updateAuditData({
                          settings: { 
                            ...data.settings, 
                            retentionPeriod: parseInt(e.target.value) || 365 
                          }
                        })
                      }
                      data-testid="input-retention-period"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-export-records">Max Export Records</Label>
                    <Input
                      id="max-export-records"
                      type="number"
                      min="1000"
                      max="1000000"
                      value={data.settings.export.maxRecords}
                      onChange={(e) => 
                        updateAuditData({
                          settings: { 
                            ...data.settings, 
                            export: {
                              ...data.settings.export,
                              maxRecords: parseInt(e.target.value) || 50000
                            }
                          }
                        })
                      }
                      data-testid="input-max-export-records"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Alert Thresholds</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="failed-logins-threshold">Failed Logins</Label>
                      <Input
                        id="failed-logins-threshold"
                        type="number"
                        min="3"
                        max="20"
                        value={data.settings.alertThresholds.failedLogins}
                        onChange={(e) => 
                          updateAuditData({
                            settings: { 
                              ...data.settings, 
                              alertThresholds: {
                                ...data.settings.alertThresholds,
                                failedLogins: parseInt(e.target.value) || 5
                              }
                            }
                          })
                        }
                        data-testid="input-failed-logins-threshold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="suspicious-activity-threshold">Suspicious Activity</Label>
                      <Input
                        id="suspicious-activity-threshold"
                        type="number"
                        min="1"
                        max="10"
                        value={data.settings.alertThresholds.suspiciousActivity}
                        onChange={(e) => 
                          updateAuditData({
                            settings: { 
                              ...data.settings, 
                              alertThresholds: {
                                ...data.settings.alertThresholds,
                                suspiciousActivity: parseInt(e.target.value) || 3
                              }
                            }
                          })
                        }
                        data-testid="input-suspicious-activity-threshold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data-access-threshold">Data Access Events</Label>
                      <Input
                        id="data-access-threshold"
                        type="number"
                        min="5"
                        max="50"
                        value={data.settings.alertThresholds.dataAccess}
                        onChange={(e) => 
                          updateAuditData({
                            settings: { 
                              ...data.settings, 
                              alertThresholds: {
                                ...data.settings.alertThresholds,
                                dataAccess: parseInt(e.target.value) || 10
                              }
                            }
                          })
                        }
                        data-testid="input-data-access-threshold"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Real-time Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Send immediate notifications for security events
                      </p>
                    </div>
                    <Switch
                      checked={data.settings.enableRealTimeAlerts}
                      onCheckedChange={(enableRealTimeAlerts) => 
                        updateAuditData({
                          settings: { ...data.settings, enableRealTimeAlerts }
                        })
                      }
                      data-testid="switch-real-time-alerts"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Automatic Reports</Label>
                      <p className="text-xs text-muted-foreground">
                        Generate periodic compliance reports automatically
                      </p>
                    </div>
                    <Switch
                      checked={data.settings.automaticReports.enabled}
                      onCheckedChange={(enabled) => 
                        updateAuditData({
                          settings: { 
                            ...data.settings, 
                            automaticReports: {
                              ...data.settings.automaticReports,
                              enabled
                            }
                          }
                        })
                      }
                      data-testid="switch-automatic-reports"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Export Encryption</Label>
                      <p className="text-xs text-muted-foreground">
                        Encrypt exported audit data files
                      </p>
                    </div>
                    <Switch
                      checked={data.settings.export.encryption}
                      onCheckedChange={(encryption) => 
                        updateAuditData({
                          settings: { 
                            ...data.settings, 
                            export: {
                              ...data.settings.export,
                              encryption
                            }
                          }
                        })
                      }
                      data-testid="switch-export-encryption"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Detail Dialog */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-log-details">
            <DialogHeader>
              <DialogTitle>Activity Log Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected log entry
              </DialogDescription>
            </DialogHeader>
            
            {(() => {
              const log = data.logs.find(l => l.id === selectedLog);
              if (!log) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Timestamp:</span>{" "}
                      {log.timestamp.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">User:</span>{" "}
                      {log.userName} ({log.userEmail})
                    </div>
                    <div>
                      <span className="font-medium">Action:</span>{" "}
                      {log.action}
                    </div>
                    <div>
                      <span className="font-medium">Resource:</span>{" "}
                      {log.resource}
                    </div>
                    <div>
                      <span className="font-medium">IP Address:</span>{" "}
                      {log.ipAddress}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>{" "}
                      {log.location || "Unknown"}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{log.description}</p>
                  </div>
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Details</h4>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                  
                  {log.changes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Changes</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-red-600 mb-1">Before</p>
                            <pre className="bg-red-50 dark:bg-red-950 p-2 rounded text-xs">
                              {JSON.stringify(log.changes.before, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-600 mb-1">After</p>
                            <pre className="bg-green-50 dark:bg-green-950 p-2 rounded text-xs">
                              {JSON.stringify(log.changes.after, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
