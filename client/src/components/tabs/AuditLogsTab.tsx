import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Eye,
  Activity,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  outcome: "success" | "failure" | "warning";
  details: string;
  ipAddress: string;
  userAgent: string;
  resource?: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

interface AuditLogsTabProps {
  data: AuditLog[];
  onChange: (logs: AuditLog[]) => void;
}

export default function AuditLogsTab({ data, onChange }: AuditLogsTabProps) {
  const [logs, setLogs] = useState<AuditLog[]>(data || []);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(data || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLogs(data || []);
    setFilteredLogs(data || []);
  }, [data]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, categoryFilter, severityFilter]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge variant="outline" className="border-red-500 text-red-500">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="border-green-500 text-green-500">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failure":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "integration":
        return <FileText className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      case "system":
        return <Activity className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStats = () => {
    const total = logs.length;
    const today = logs.filter(log => 
      new Date(log.timestamp).toDateString() === new Date().toDateString()
    ).length;
    const alerts = logs.filter(log => log.severity === "high" || log.severity === "critical").length;
    const uptime = 99.9; // This would be calculated from actual data

    return { total, today, alerts, uptime };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Audit Logs & Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Monitor system activity, track changes, and generate compliance reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Logs Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{stats.alerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold text-green-600">{stats.uptime}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                  <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                    />
                  </div>
            </div>
            <div className="flex flex-wrap gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

      {/* Activity Logs */}
      <Card>
            <CardHeader>
          <CardTitle className="text-base">Activity Logs</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time activity monitoring and historical log review
          </p>
            </CardHeader>
            <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No logs found</p>
                  </div>
                ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                      {getCategoryIcon(log.category)}
                      <div className="text-sm min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.action}</span>
                          {getSeverityBadge(log.severity)}
                        </div>
                        <p className="text-muted-foreground break-words">{log.details}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={log.user.avatar} />
                        <AvatarFallback>{getInitials(log.user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm min-w-0">
                        <div className="font-medium truncate">{log.user.name}</div>
                        <div className="text-muted-foreground truncate">{log.user.email}</div>
                </div>
                    </div>
                    <div className="text-sm text-muted-foreground flex-shrink-0">
                      {formatTimestamp(log.timestamp)}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getOutcomeIcon(log.outcome)}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
                    </div>
          )}
            </CardContent>
          </Card>
    </div>
  );
}
