import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Key, 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Download, 
  Upload, 
  Globe, 
  Database, 
  Server, 
  Wifi, 
  Eye, 
  EyeOff,
  Settings,
  Scan,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Info,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  BarChart3,
  Activity,
  Users,
  Calendar,
  Zap
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Security & Compliance interfaces
interface SecurityPolicy {
  id: string;
  name: string;
  type: "data_encryption" | "api_security" | "access_control" | "compliance" | "privacy";
  status: "active" | "inactive" | "pending" | "failed";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  requirements: string[];
  lastUpdated: Date;
  nextReview: Date;
  owner: string;
  tags: string[];
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    sox: boolean;
    iso27001: boolean;
    pci: boolean;
  };
}

interface SecurityScan {
  id: string;
  type: "vulnerability" | "penetration" | "compliance" | "dependency" | "code_analysis";
  status: "running" | "completed" | "failed" | "scheduled";
  severity: "critical" | "high" | "medium" | "low" | "info";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  summary: string;
  recommendations: string[];
  reportUrl?: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  status: "compliant" | "partial" | "non_compliant" | "in_progress";
  score: number; // 0-100
  requirements: {
    total: number;
    met: number;
    pending: number;
    failed: number;
  };
  lastAssessment: Date;
  nextAssessment: Date;
  certificationExpiry?: Date;
  assessor: string;
  findings: string[];
}

interface EncryptionConfig {
  id: string;
  type: "data_at_rest" | "data_in_transit" | "api_keys" | "session_data" | "logs";
  algorithm: string;
  keySize: number;
  status: "active" | "inactive" | "rotating" | "failed";
  lastRotation: Date;
  nextRotation: Date;
  rotationInterval: number; // days
  description: string;
  scope: string[];
}

interface SecurityAlert {
  id: string;
  type: "security_breach" | "vulnerability" | "policy_violation" | "compliance_issue" | "suspicious_activity";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  status: "open" | "investigating" | "mitigated" | "resolved" | "false_positive";
  assignee?: string;
  affectedSystems: string[];
  impact: "high" | "medium" | "low";
  resolution?: string;
  estimatedResolutionTime?: number; // hours
}

interface SecurityMetrics {
  overallSecurityScore: number; // 0-100
  complianceScore: number; // 0-100
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  incidentResponseTime: number; // average hours
  patchingCompliance: number; // percentage
  encryptionCoverage: number; // percentage
  securityTrainingCompletion: number; // percentage
  lastSecurityAudit: Date;
  nextScheduledScan: Date;
}

interface SecurityComplianceData {
  policies: SecurityPolicy[];
  scans: SecurityScan[];
  frameworks: ComplianceFramework[];
  encryption: EncryptionConfig[];
  alerts: SecurityAlert[];
  metrics: SecurityMetrics;
  settings: {
    automaticScanning: boolean;
    scanFrequency: "daily" | "weekly" | "monthly" | "quarterly";
    alertNotifications: boolean;
    complianceReporting: boolean;
    encryptionRequired: boolean;
    mfaRequired: boolean;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      expirationDays: number;
    };
    sessionTimeout: number; // minutes
    failedLoginLockout: number; // attempts
    ipWhitelisting: boolean;
    dataRetentionPeriod: number; // days
  };
}

// Default security compliance data
const defaultSecurityData: SecurityComplianceData = {
  policies: [
    {
      id: "policy-001",
      name: "Data Encryption Policy",
      type: "data_encryption",
      status: "active",
      severity: "critical",
      description: "All sensitive data must be encrypted at rest and in transit using AES-256 encryption",
      requirements: [
        "Use AES-256 encryption for data at rest",
        "Implement TLS 1.3 for data in transit",
        "Regular key rotation every 90 days",
        "Secure key management practices"
      ],
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      nextReview: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      owner: "Security Team",
      tags: ["encryption", "data-protection", "critical"],
      compliance: {
        gdpr: true,
        hipaa: true,
        sox: true,
        iso27001: true,
        pci: true,
      },
    },
    {
      id: "policy-002",
      name: "API Security Standards",
      type: "api_security",
      status: "active",
      severity: "high",
      description: "Security requirements for all API endpoints and integrations",
      requirements: [
        "OAuth 2.0 authentication required",
        "Rate limiting implemented",
        "API key rotation every 60 days",
        "Input validation and sanitization",
        "Security headers implementation"
      ],
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      nextReview: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      owner: "DevOps Team",
      tags: ["api", "security", "authentication"],
      compliance: {
        gdpr: true,
        hipaa: false,
        sox: false,
        iso27001: true,
        pci: true,
      },
    },
    {
      id: "policy-003",
      name: "GDPR Compliance Framework",
      type: "compliance",
      status: "active",
      severity: "critical",
      description: "General Data Protection Regulation compliance requirements",
      requirements: [
        "Data minimization practices",
        "Right to be forgotten implementation",
        "Consent management system",
        "Data breach notification within 72 hours",
        "Privacy by design principles"
      ],
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      nextReview: new Date(Date.now() + 1000 * 60 * 60 * 24 * 80),
      owner: "Legal Team",
      tags: ["gdpr", "privacy", "compliance"],
      compliance: {
        gdpr: true,
        hipaa: false,
        sox: false,
        iso27001: false,
        pci: false,
      },
    },
  ],
  scans: [
    {
      id: "scan-001",
      type: "vulnerability",
      status: "completed",
      severity: "medium",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      duration: 60,
      findings: {
        critical: 0,
        high: 2,
        medium: 5,
        low: 12,
        info: 8,
      },
      summary: "Vulnerability scan completed with 2 high-severity findings that require immediate attention",
      recommendations: [
        "Update outdated SSL certificates",
        "Patch identified security vulnerabilities",
        "Review and strengthen API rate limiting",
        "Implement additional input validation"
      ],
      reportUrl: "/reports/vulnerability-scan-001.pdf",
    },
    {
      id: "scan-002",
      type: "compliance",
      status: "running",
      severity: "low",
      startTime: new Date(Date.now() - 1000 * 60 * 30),
      findings: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
      summary: "GDPR compliance assessment in progress",
      recommendations: [],
    },
    {
      id: "scan-003",
      type: "penetration",
      status: "scheduled",
      severity: "high",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      findings: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
      summary: "Quarterly penetration testing scheduled",
      recommendations: [],
    },
  ],
  frameworks: [
    {
      id: "framework-001",
      name: "ISO 27001",
      version: "2013",
      status: "compliant",
      score: 92,
      requirements: {
        total: 114,
        met: 105,
        pending: 6,
        failed: 3,
      },
      lastAssessment: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      nextAssessment: new Date(Date.now() + 1000 * 60 * 60 * 24 * 320),
      certificationExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      assessor: "External Security Auditor",
      findings: [
        "Strong access control implementation",
        "Comprehensive incident response procedures",
        "Minor gaps in documentation review processes"
      ],
    },
    {
      id: "framework-002",
      name: "GDPR",
      version: "2018",
      status: "partial",
      score: 78,
      requirements: {
        total: 99,
        met: 77,
        pending: 15,
        failed: 7,
      },
      lastAssessment: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      nextAssessment: new Date(Date.now() + 1000 * 60 * 60 * 24 * 70),
      assessor: "Privacy Consultant",
      findings: [
        "Good data minimization practices",
        "Consent management needs improvement",
        "Data breach notification process requires refinement"
      ],
    },
    {
      id: "framework-003",
      name: "SOC 2 Type II",
      version: "2017",
      status: "in_progress",
      score: 65,
      requirements: {
        total: 64,
        met: 42,
        pending: 18,
        failed: 4,
      },
      lastAssessment: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
      nextAssessment: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      assessor: "Accounting Firm",
      findings: [
        "Security controls implementation progressing well",
        "Availability monitoring needs enhancement",
        "Change management documentation incomplete"
      ],
    },
  ],
  encryption: [
    {
      id: "encryption-001",
      type: "data_at_rest",
      algorithm: "AES-256-GCM",
      keySize: 256,
      status: "active",
      lastRotation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      nextRotation: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      rotationInterval: 90,
      description: "Database encryption for all user data and sensitive information",
      scope: ["user_data", "financial_records", "personal_information"],
    },
    {
      id: "encryption-002",
      type: "data_in_transit",
      algorithm: "TLS 1.3",
      keySize: 256,
      status: "active",
      lastRotation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      nextRotation: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      rotationInterval: 90,
      description: "TLS encryption for all API communications and data transfers",
      scope: ["api_communications", "user_sessions", "admin_access"],
    },
    {
      id: "encryption-003",
      type: "api_keys",
      algorithm: "RSA-4096",
      keySize: 4096,
      status: "rotating",
      lastRotation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 55),
      nextRotation: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      rotationInterval: 60,
      description: "API key encryption and secure storage",
      scope: ["integration_keys", "webhook_signatures", "oauth_tokens"],
    },
  ],
  alerts: [
    {
      id: "alert-001",
      type: "vulnerability",
      severity: "high",
      title: "Critical Security Vulnerability Detected",
      description: "High-severity vulnerability found in third-party dependency",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      source: "Dependency Scanner",
      status: "investigating",
      assignee: "Security Team",
      affectedSystems: ["API Gateway", "User Authentication"],
      impact: "high",
      estimatedResolutionTime: 24,
    },
    {
      id: "alert-002",
      type: "policy_violation",
      severity: "medium",
      title: "Data Retention Policy Violation",
      description: "Data older than retention period detected in backup systems",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      source: "Compliance Monitor",
      status: "mitigated",
      assignee: "Data Team",
      affectedSystems: ["Backup Systems"],
      impact: "medium",
      resolution: "Automated cleanup process initiated to remove expired data",
    },
    {
      id: "alert-003",
      type: "suspicious_activity",
      severity: "critical",
      title: "Unusual API Access Pattern",
      description: "Abnormally high API request volume from single IP address",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      source: "API Monitor",
      status: "resolved",
      assignee: "DevOps Team",
      affectedSystems: ["API Gateway", "Rate Limiter"],
      impact: "low",
      resolution: "IP address blocked and rate limiting enhanced",
    },
  ],
  metrics: {
    overallSecurityScore: 87,
    complianceScore: 78,
    vulnerabilities: {
      critical: 0,
      high: 3,
      medium: 8,
      low: 15,
      total: 26,
    },
    incidentResponseTime: 2.4,
    patchingCompliance: 94,
    encryptionCoverage: 98,
    securityTrainingCompletion: 89,
    lastSecurityAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    nextScheduledScan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  },
  settings: {
    automaticScanning: true,
    scanFrequency: "weekly",
    alertNotifications: true,
    complianceReporting: true,
    encryptionRequired: true,
    mfaRequired: true,
    passwordPolicy: {
      minLength: 12,
      requireSpecialChars: true,
      requireNumbers: true,
      expirationDays: 90,
    },
    sessionTimeout: 480, // 8 hours
    failedLoginLockout: 5,
    ipWhitelisting: false,
    dataRetentionPeriod: 2555, // 7 years
  },
};

interface SecurityComplianceTabProps {
  data: SecurityComplianceData;
  onChange: (data: SecurityComplianceData) => void;
}

export default function SecurityComplianceTab({ data, onChange }: SecurityComplianceTabProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [showNewPolicyDialog, setShowNewPolicyDialog] = useState(false);

  // Use data directly from props (controlled component pattern)
  
  const updateSecurityData = (updates: Partial<SecurityComplianceData>) => {
    onChange({ ...data, ...updates });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "compliant":
      case "completed":
      case "resolved": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "partial":
      case "pending":
      case "investigating":
      case "running": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "inactive":
      case "non_compliant":
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
      case "mitigated": return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
      case "compliant":
      case "completed":
      case "resolved": return "default";
      case "partial":
      case "pending":
      case "investigating":
      case "running": return "secondary";
      case "inactive":
      case "non_compliant":
      case "failed": return "destructive";
      case "in_progress":
      case "mitigated": return "outline";
      default: return "secondary";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600";
      case "high": return "text-orange-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 px-2 sm:px-0" style={{ maxWidth: '93vw' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Security & Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Manage security policies, compliance frameworks, and monitoring
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" data-testid="button-run-security-scan" className="flex-1 sm:flex-none">
            <Scan className="w-4 h-4 mr-2" />
            Run Scan
          </Button>
          <Button variant="outline" size="sm" data-testid="button-generate-compliance-report" className="flex-1 sm:flex-none">
            <FileText className="w-4 h-4 mr-2" />
            Compliance Report
          </Button>
        </div>
      </div>

      {/* Security Overview Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-security-score">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className={`text-2xl font-bold ${getComplianceColor(data.metrics.overallSecurityScore)}`} data-testid="text-security-score">
                  {data.metrics.overallSecurityScore}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-compliance-score">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className={`text-2xl font-bold ${getComplianceColor(data.metrics.complianceScore)}`} data-testid="text-compliance-score">
                  {data.metrics.complianceScore}%
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-vulnerabilities">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vulnerabilities</p>
                <p className="text-2xl font-bold text-orange-500" data-testid="text-total-vulnerabilities">
                  {data.metrics.vulnerabilities.total}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-encryption-coverage">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Encryption Coverage</p>
                <p className="text-2xl font-bold text-green-500" data-testid="text-encryption-coverage">
                  {data.metrics.encryptionCoverage}%
                </p>
              </div>
              <Lock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview" data-testid="tab-security-overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="policies" data-testid="tab-security-policies" className="text-sm">Policies</TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance-frameworks" className="text-sm">Compliance</TabsTrigger>
          <TabsTrigger value="encryption" data-testid="tab-encryption-management" className="text-sm">Encryption</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-security-settings" className="text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Security Alerts */}
            <Card data-testid="card-recent-alerts">
              <CardHeader>
                <CardTitle>Recent Security Alerts</CardTitle>
                <CardDescription>
                  Latest security incidents and policy violations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-3 space-y-2" data-testid={`card-alert-${alert.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                          <div>
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            <p className="text-xs pt-2 md:pt-0 text-muted-foreground">{alert.description}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(alert.status)}>
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="text-xs pt-2 md:pt-0 text-muted-foreground">
                        {alert.timestamp.toLocaleString()} • {alert.source}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vulnerability Breakdown */}
            <Card data-testid="card-vulnerability-breakdown">
              <CardHeader>
                <CardTitle>Vulnerability Breakdown</CardTitle>
                <CardDescription>
                  Current security vulnerabilities by severity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Critical</span>
                    </div>
                    <Badge variant="destructive" data-testid="badge-critical-vulnerabilities">
                      {data.metrics.vulnerabilities.critical}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">High</span>
                    </div>
                    <Badge variant="secondary" data-testid="badge-high-vulnerabilities">
                      {data.metrics.vulnerabilities.high}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Medium</span>
                    </div>
                    <Badge variant="secondary" data-testid="badge-medium-vulnerabilities">
                      {data.metrics.vulnerabilities.medium}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Low</span>
                    </div>
                    <Badge variant="outline" data-testid="badge-low-vulnerabilities">
                      {data.metrics.vulnerabilities.low}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Scans */}
          <Card data-testid="card-security-scans">
            <CardHeader>
              <CardTitle>Security Scans</CardTitle>
              <CardDescription>
                Recent and scheduled security assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-w-full min-w-0 mx-2 sm:mx-0" style={{ maxWidth: 'calc(100% - 1rem)' }}>
                <div className="text-xs text-muted-foreground mb-2 sm:hidden">
                  ← Scroll horizontally to see all columns →
                </div>
                <Table data-testid="table-security-scans" className="min-w-[600px] sm:min-w-[800px] table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[25%]">Type</TableHead>
                      <TableHead className="w-[20%]">Status</TableHead>
                      <TableHead className="w-[25%]">Findings</TableHead>
                      <TableHead className="w-[15%]">Duration</TableHead>
                      <TableHead className="w-[15%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {data.scans.map((scan) => (
                    <TableRow key={scan.id} data-testid={`row-scan-${scan.id}`}>
                      <TableCell>
                        <div className="font-medium capitalize">{scan.type.replace('_', ' ')}</div>
                        <div className=" text-xs sm:text-sm text-muted-foreground">{scan.summary}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(scan.status)}>
                          {getStatusIcon(scan.status)}
                          <span className="ml-1 capitalize">{scan.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {scan.status === "completed" ? (
                          <div className="text-sm space-y-1">
                            <div className="text-red-600">Critical: {scan.findings.critical}</div>
                            <div className="text-orange-500">High: {scan.findings.high}</div>
                            <div className="text-yellow-500">Medium: {scan.findings.medium}</div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">—</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {scan.duration ? `${scan.duration} min` : "—"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" data-testid={`button-view-scan-${scan.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card data-testid="card-security-policies">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0 sm:items-center justify-between">
                <div>
                  <CardTitle>Security Policies</CardTitle>
                  <CardDescription>
                    Manage and monitor security policy compliance
                  </CardDescription>
                </div>
                <Button onClick={() => setShowNewPolicyDialog(true)} data-testid="button-add-policy">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Policy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.policies.map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-0 md:p-4 gap-3 md:gap-0 space-y-3" data-testid={`card-policy-${policy.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{policy.name}</h4>
                          <Badge variant={getStatusBadgeVariant(policy.status)}>
                            {policy.status}
                          </Badge>
                          <Badge variant="outline" className={getSeverityColor(policy.severity)}>
                            {policy.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {policy.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-policy-menu-${policy.id}`}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem data-testid={`button-edit-policy-${policy.id}`}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Policy
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid={`button-duplicate-policy-${policy.id}`}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" data-testid={`button-delete-policy-${policy.id}`}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Owner:</span> {policy.owner}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Updated:</span> {policy.lastUpdated.toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Review:</span> {policy.nextReview.toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requirements:</span> {policy.requirements.length}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Compliance Frameworks</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(policy.compliance).map(([framework, compliant]) => (
                          compliant && (
                            <Badge key={framework} variant="outline" className="text-xs">
                              {framework.toUpperCase()}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card data-testid="card-compliance-frameworks">
            <CardHeader>
              <CardTitle>Compliance Frameworks</CardTitle>
              <CardDescription>
                Monitor compliance status across industry standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.frameworks.map((framework) => (
                  <div key={framework.id} className="border rounded-lg p-0 md:p-4  space-y-4" data-testid={`card-framework-${framework.id}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{framework.name}</h4>
                          <Badge variant="secondary">{framework.version}</Badge>
                          <Badge variant={getStatusBadgeVariant(framework.status)}>
                            {framework.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Score: <span className={`font-medium ${getComplianceColor(framework.score)}`}>{framework.score}%</span></span>
                          <span>Assessor: {framework.assessor}</span>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" data-testid={`button-view-framework-${framework.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compliance Progress</span>
                        <span className="text-sm text-muted-foreground">{framework.requirements.met}/{framework.requirements.total}</span>
                      </div>
                      <Progress value={(framework.requirements.met / framework.requirements.total) * 100} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4  gap-4 text-sm">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
                        <div className="font-medium text-green-600">{framework.requirements.met}</div>
                        <div className="text-green-600">Met</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                        <div className="font-medium text-yellow-600">{framework.requirements.pending}</div>
                        <div className="text-yellow-600">Pending</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded">
                        <div className="font-medium text-red-600">{framework.requirements.failed}</div>
                        <div className="text-red-600">Failed</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                        <div className="font-medium text-blue-600">{framework.requirements.total}</div>
                        <div className="text-blue-600">Total</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last Assessment:</span> {framework.lastAssessment.toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Assessment:</span> {framework.nextAssessment.toLocaleDateString()}
                      </div>
                      {framework.certificationExpiry && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Certification Expires:</span> {framework.certificationExpiry.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Key Findings</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {framework.findings.map((finding, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="w-3 h-3 mt-0.5 text-blue-500" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Card data-testid="card-encryption-management">
            <CardHeader>
              <CardTitle>Encryption Management</CardTitle>
              <CardDescription>
                Monitor and manage encryption configurations and key rotation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.encryption.map((config) => (
                  <div key={config.id} className="border rounded-lg p-4 space-y-3" data-testid={`card-encryption-${config.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium capitalize">{config.type.replace('_', ' ')}</h4>
                          <Badge variant={getStatusBadgeVariant(config.status)}>
                            {getStatusIcon(config.status)}
                            <span className="ml-1">{config.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-encryption-menu-${config.id}`}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem data-testid={`button-rotate-keys-${config.id}`}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Rotate Keys
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid={`button-view-encryption-${config.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem data-testid={`button-edit-encryption-${config.id}`}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Configuration
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Algorithm:</span> {config.algorithm}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Key Size:</span> {config.keySize} bits
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Rotation:</span> {config.lastRotation.toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Rotation:</span> {config.nextRotation.toLocaleDateString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Scope</p>
                      <div className="flex flex-wrap gap-1">
                        {config.scope.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rotation Interval: {config.rotationInterval} days</span>
                      {config.status === "rotating" && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Rotating keys...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card data-testid="card-security-settings-config">
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Configure global security and compliance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Scanning & Monitoring</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Automatic Security Scanning</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically run security scans at regular intervals
                      </p>
                    </div>
                    <Switch
                      checked={data.settings.automaticScanning}
                      onCheckedChange={(automaticScanning) => 
                        updateSecurityData({
                          settings: { ...data.settings, automaticScanning }
                        })
                      }
                      data-testid="switch-automatic-scanning"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scan-frequency">Scan Frequency</Label>
                    <Select 
                      value={data.settings.scanFrequency} 
                      onValueChange={(scanFrequency: any) => 
                        updateSecurityData({
                          settings: { ...data.settings, scanFrequency }
                        })
                      }
                    >
                      <SelectTrigger data-testid="select-scan-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Alert Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Send notifications for security alerts and incidents
                      </p>
                    </div>
                    <Switch
                      checked={data.settings.alertNotifications}
                      onCheckedChange={(alertNotifications) => 
                        updateSecurityData({
                          settings: { ...data.settings, alertNotifications }
                        })
                      }
                      data-testid="switch-alert-notifications"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Authentication & Access</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Require Multi-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">
                        Enforce MFA for all user accounts
                      </p>
                    </div>
                    <Switch
                      checked={data.settings.mfaRequired}
                      onCheckedChange={(mfaRequired) => 
                        updateSecurityData({
                          settings: { ...data.settings, mfaRequired }
                        })
                      }
                      data-testid="switch-mfa-required"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      min="15"
                      max="1440"
                      value={data.settings.sessionTimeout}
                      onChange={(e) => 
                        updateSecurityData({
                          settings: { 
                            ...data.settings, 
                            sessionTimeout: parseInt(e.target.value) || 480 
                          }
                        })
                      }
                      data-testid="input-session-timeout"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="failed-login-lockout">Failed Login Lockout</Label>
                    <Input
                      id="failed-login-lockout"
                      type="number"
                      min="3"
                      max="20"
                      value={data.settings.failedLoginLockout}
                      onChange={(e) => 
                        updateSecurityData({
                          settings: { 
                            ...data.settings, 
                            failedLoginLockout: parseInt(e.target.value) || 5 
                          }
                        })
                      }
                      data-testid="input-failed-login-lockout"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Protection</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Encryption Required</Label>
                      <p className="text-xs text-muted-foreground">
                        Require encryption for all sensitive data
                      </p>
                    </div>
                    <Switch
                      checked={data.settings.encryptionRequired}
                      onCheckedChange={(encryptionRequired) => 
                        updateSecurityData({
                          settings: { ...data.settings, encryptionRequired }
                        })
                      }
                      data-testid="switch-encryption-required"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data-retention">Data Retention Period (days)</Label>
                    <Input
                      id="data-retention"
                      type="number"
                      min="30"
                      max="3650"
                      value={data.settings.dataRetentionPeriod}
                      onChange={(e) => 
                        updateSecurityData({
                          settings: { 
                            ...data.settings, 
                            dataRetentionPeriod: parseInt(e.target.value) || 2555 
                          }
                        })
                      }
                      data-testid="input-data-retention"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">IP Whitelisting</Label>
                    <p className="text-xs text-muted-foreground">
                      Restrict access to specific IP addresses
                    </p>
                  </div>
                  <Switch
                    checked={data.settings.ipWhitelisting}
                    onCheckedChange={(ipWhitelisting) => 
                      updateSecurityData({
                        settings: { ...data.settings, ipWhitelisting }
                      })
                    }
                    data-testid="switch-ip-whitelisting"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Policy Dialog */}
      <Dialog open={showNewPolicyDialog} onOpenChange={setShowNewPolicyDialog}>
        <DialogContent data-testid="dialog-new-policy">
          <DialogHeader>
            <DialogTitle>Create New Security Policy</DialogTitle>
            <DialogDescription>
              Define a new security policy for your organization
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="policy-name">Policy Name</Label>
              <Input
                id="policy-name"
                placeholder="Enter policy name"
                data-testid="input-policy-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policy-type">Policy Type</Label>
              <Select>
                <SelectTrigger data-testid="select-policy-type">
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_encryption">Data Encryption</SelectItem>
                  <SelectItem value="api_security">API Security</SelectItem>
                  <SelectItem value="access_control">Access Control</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="privacy">Privacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policy-description">Description</Label>
              <Textarea
                id="policy-description"
                placeholder="Describe the policy requirements and objectives"
                data-testid="textarea-policy-description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPolicyDialog(false)}>
              Cancel
            </Button>
            <Button data-testid="button-create-policy">
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}