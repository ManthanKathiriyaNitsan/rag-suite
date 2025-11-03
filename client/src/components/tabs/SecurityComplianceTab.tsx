import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Eye,
  Settings,
  Lock,
  Key,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
} from "lucide-react";

interface SecurityData {
  securityScore: number;
  complianceScore: number;
  vulnerabilities: number;
  encryptionCoverage: number;
  alerts: {
  id: string;
    title: string;
  description: string;
    severity: "critical" | "high" | "medium" | "low";
    timestamp: string;
    status: "investigating" | "resolved" | "dismissed";
  }[];
  vulnerabilityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scans: {
  id: string;
    type: string;
    status: "completed" | "running" | "failed";
  findings: {
    critical: number;
    high: number;
    medium: number;
    };
    duration: string;
    timestamp: string;
  }[];
  policies: {
  id: string;
  name: string;
  description: string;
    status: "active" | "inactive";
    lastUpdated: string;
  }[];
  compliance: {
    framework: string;
    status: "compliant" | "non-compliant" | "partial";
    score: number;
    lastAssessment: string;
  }[];
}

interface SecurityComplianceTabProps {
  data: SecurityData;
  onChange: (security: SecurityData) => void;
}

export default function SecurityComplianceTab({ data, onChange }: SecurityComplianceTabProps) {
  const [security, setSecurity] = useState<SecurityData>(data || {
    securityScore: 87,
    complianceScore: 78,
    vulnerabilities: 26,
    encryptionCoverage: 98,
    alerts: [],
    vulnerabilityBreakdown: {
      critical: 0,
      high: 3,
      medium: 8,
      low: 15,
    },
    scans: [],
    policies: [],
    compliance: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSecurity(data || security);
  }, [data]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-gray-500";
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
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "investigating":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Investigating</Badge>;
      case "resolved":
        return <Badge variant="default" className="bg-green-500">Resolved</Badge>;
      case "dismissed":
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getComplianceStatus = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge variant="default" className="bg-green-500">Compliant</Badge>;
      case "non-compliant":
        return <Badge variant="destructive">Non-Compliant</Badge>;
      case "partial":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Partial</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Security & Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Manage security policies, compliance frameworks, and monitoring
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

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:glass-navbar-dark" style={{ boxShadow: '0px 1px 5px -1px rgba(0,0,0,0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(security.securityScore || 0)}`}>
                  {security.securityScore || 0}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={security.securityScore || 0} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:glass-navbar-dark" style={{ boxShadow: '0px 1px 5px -1px rgba(0,0,0,0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(security.complianceScore || 0)}`}>
                  {security.complianceScore || 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={security.complianceScore || 0} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:glass-navbar-dark" style={{ boxShadow: '0px 1px 5px -1px rgba(0,0,0,0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vulnerabilities</p>
                <p className="text-2xl font-bold text-orange-600">{security.vulnerabilities || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {security.vulnerabilityBreakdown?.high || 0} high, {security.vulnerabilityBreakdown?.medium || 0} medium
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:glass-navbar-dark" style={{ boxShadow: '0px 1px 5px -1px rgba(0,0,0,0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Encryption Coverage</p>
                <p className="text-2xl font-bold text-green-600">{security.encryptionCoverage || 0}%</p>
              </div>
              <Lock className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={security.encryptionCoverage || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Security Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="policies" className="text-xs sm:text-sm">Policies</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs sm:text-sm">Compliance</TabsTrigger>
          <TabsTrigger value="encryption" className="text-xs sm:text-sm">Encryption</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 w-full max-w-full overflow-hidden min-w-0">
            {/* Recent Security Alerts */}
          <Card className="w-full overflow-hidden">
              <CardHeader>
              <CardTitle className="text-base">Recent Security Alerts</CardTitle>
              <p className="text-sm text-muted-foreground">
                  Latest security incidents and policy violations
              </p>
              </CardHeader>
              <CardContent>
              {security.alerts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                  <p>No security alerts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {security.alerts?.map((alert) => (
                    <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <AlertTriangle className={`h-5 w-5 ${getSeverityColor(alert.severity)} flex-shrink-0`} />
                          <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{alert.title}</span>
                            {getSeverityBadge(alert.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground break-words">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()} • Security Scanner
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(alert.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </CardContent>
            </Card>

              {/* Vulnerability Breakdown */}
          <Card className="w-full overflow-hidden">
                <CardHeader>
                <CardTitle className="text-base">Vulnerability Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                  Current security vulnerabilities by severity
              </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                <div className="flex  items-center justify-between">
                    <div className="flex  items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Critical</span>
                    </div>
                  <span className="font-medium">{security.vulnerabilityBreakdown?.critical || 0}</span>
                  </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">High</span>
                    </div>
                  <span className="font-medium">{security.vulnerabilityBreakdown?.high || 0}</span>
                  </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Medium</span>
                    </div>
                  <span className="font-medium">{security.vulnerabilityBreakdown?.medium || 0}</span>
                  </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Low</span>
                    </div>
                  <span className="font-medium">{security.vulnerabilityBreakdown?.low || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Scans */}
          {/* <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Security Scans</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent and scheduled security assessments
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {security.scans?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>No security scans available</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-w-full min-w-0 mx-2 sm:mx-0" style={{ maxWidth: 'calc(100% - 1rem)' }}>
                  <Table className="min-w-[600px] sm:min-w-[700px] w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[20%]">Type</TableHead>
                        <TableHead className="w-[15%]">Status</TableHead>
                        <TableHead className="w-[30%]">Findings</TableHead>
                        <TableHead className="w-[15%]">Duration</TableHead>
                        <TableHead className="w-[20%]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {security.scans?.map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell className="font-medium truncate">{scan.type}</TableCell>
                          <TableCell>
                            <Badge variant={scan.status === "completed" ? "default" : "outline"} className="text-xs flex-shrink-0">
                              {scan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="truncate">Critical: {scan.findings.critical}</div>
                              <div className="truncate">High: {scan.findings.high}</div>
                              <div className="truncate">Medium: {scan.findings.medium}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm truncate">{scan.duration}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card> */}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Policies</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage security policies and access controls
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>Security policies configuration coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Frameworks</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor compliance with industry standards
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Compliance monitoring coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Encryption Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure encryption and data protection
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-4" />
                <p>Encryption settings coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure security monitoring and alerts
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>Security settings configuration coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
