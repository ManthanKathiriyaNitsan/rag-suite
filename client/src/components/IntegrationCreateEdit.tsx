import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Key, 
  Globe, 
  Sliders, 
  Palette, 
  Server, 
  Webhook, 
  History, 
  BarChart3, 
  TestTube, 
  Users, 
  FileText,
  Save,
  Eye,
  ArrowLeft,
  Shield
} from "lucide-react";
import OverviewTab from "./tabs/OverviewTab";
import EmbedKeysTab from "./tabs/EmbedKeysTab";
import DomainsTab from "./tabs/DomainsTab";
import ConfigTab from "./tabs/ConfigTab";
import ThemeTab from "./tabs/ThemeTab";
import EnvironmentsTab from "./tabs/EnvironmentsTab";
import WebhooksTab from "./tabs/WebhooksTab";
import VersionsTab from "./tabs/VersionsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import ABTestingTab from "./tabs/ABTestingTab";
import PermissionsTab from "./tabs/PermissionsTab";
import AuditLogsTab from "./tabs/AuditLogsTab";
import SecurityComplianceTab from "./tabs/SecurityComplianceTab";

interface IntegrationCreateEditProps {
  integrationId?: string;
  mode: "create" | "edit";
  onBack: () => void;
  onSave: (data: any) => void;
}

// Mock users for now - replace with real API call
const mockUsers = [
  { id: "user-001", name: "John Doe", email: "john@company.com" },
  { id: "user-002", name: "Jane Smith", email: "jane@company.com" },
  { id: "user-003", name: "Bob Wilson", email: "bob@company.com" },
  { id: "user-004", name: "Alice Johnson", email: "alice@company.com" },
];

export default function IntegrationCreateEdit({ 
  integrationId, 
  mode, 
  onBack, 
  onSave 
}: IntegrationCreateEditProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    overview: {
      name: "",
      slug: "",
      description: "",
      status: "active",
      ownerId: "",
      tags: [],
    },
    embedKeys: {
      publicId: "",
      keys: [],
    },
    domains: {
      domains: [],
    },
    config: {
      // RAG Settings
      ragModel: "gpt-4-turbo",
      temperature: 0.7,
      maxTokens: 2048,
      topK: 40,
      topP: 0.9,
      contextWindow: 16000,
      retrievalCount: 5,
      similarityThreshold: 0.75,
      
      // Behavior Settings
      enableChat: true,
      enableSearch: true,
      enableSuggestions: true,
      enableCitations: true,
      enableFollowUps: true,
      
      // Response Behavior
      responseMode: "balanced" as const,
      fallbackResponse: "I apologize, but I don't have enough information to answer that question accurately. Please try rephrasing your question or contact support for additional help.",
      maxResponseLength: 1000,
      enableStreaming: true,
      
      // Privacy & Security
      logConversations: true,
      retainData: true,
      dataRetentionDays: 90,
      allowAnonymous: true,
      requireAuth: false,
      allowedDomains: [],
      
      // Rate Limiting
      rateLimitPerUser: 100,
      rateLimitWindow: 60,
      
      // Content Filtering
      enableProfanityFilter: true,
      contentModerationLevel: "moderate" as const,
      blockedTerms: [],
    },
    theme: {
      // Brand Colors
      primaryColor: "#1F6FEB",
      secondaryColor: "#6C757D", 
      accentColor: "#7C3AED",
      
      // Background Colors
      backgroundColor: "#FFFFFF",
      surfaceColor: "#F8FAFC",
      cardColor: "#FFFFFF",
      
      // Text Colors
      textPrimary: "#1F2937",
      textSecondary: "#6B7280", 
      textMuted: "#9CA3AF",
      
      // State Colors
      successColor: "#22C55E",
      warningColor: "#F59E0B",
      errorColor: "#EF4444",
      infoColor: "#38BDF8",
      
      // Border & Divider
      borderColor: "#E5E7EB",
      dividerColor: "#F3F4F6",
      
      // Theme Settings
      darkModeEnabled: true,
      defaultMode: "system" as const,
      
      // Typography
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem", 
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      
      // Layout
      borderRadius: {
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
      },
      
      // Spacing
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem", 
        lg: "1.5rem",
        xl: "2rem",
      },
      
      // Advanced
      customCSS: "",
      enableCustomCSS: false,
      
      // Widget Appearance
      chatBubbleStyle: "rounded" as const,
      avatarStyle: "circle" as const,
      animationsEnabled: true,
    },
    environments: {
      environments: [
        {
          id: "staging",
          name: "Staging",
          type: "staging" as const,
          status: "active" as const,
          url: "https://staging-widget.example.com",
          lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          version: "v1.24.0",
          uptime: 99.2,
          responseTime: 145,
          requestsPerMinute: 250,
          errorRate: 0.1,
          autoDeployEnabled: true,
          maintenanceMode: false,
          deploymentBranch: "develop",
          rateLimitRpm: 1000,
          maxConcurrentUsers: 500,
          environmentVars: [
            { key: "API_BASE_URL", value: "https://api-staging.example.com", isSecret: false },
            { key: "DATABASE_URL", value: "postgres://staging-db...", isSecret: true },
            { key: "LOG_LEVEL", value: "debug", isSecret: false },
          ],
        },
        {
          id: "production", 
          name: "Production",
          type: "production" as const,
          status: "active" as const,
          url: "https://widget.example.com",
          lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          version: "v1.23.0",
          uptime: 99.9,
          responseTime: 98,
          requestsPerMinute: 1250,
          errorRate: 0.02,
          autoDeployEnabled: false,
          maintenanceMode: false,
          deploymentBranch: "main",
          rateLimitRpm: 5000,
          maxConcurrentUsers: 2000,
          environmentVars: [
            { key: "API_BASE_URL", value: "https://api.example.com", isSecret: false },
            { key: "DATABASE_URL", value: "postgres://prod-db...", isSecret: true },
            { key: "LOG_LEVEL", value: "info", isSecret: false },
          ],
        },
      ],
      defaultEnvironment: "production",
      autoPromotionEnabled: false,
      deploymentNotifications: true,
    },
    webhooks: {
      endpoints: [
        {
          id: "webhook-1",
          name: "User Activity Webhook",
          url: "https://api.example.com/webhooks/user-activity",
          events: ["user.query", "user.feedback", "chat.started"],
          isActive: true,
          secret: "wh_secret_key_123",
          retryCount: 3,
          timeoutMs: 5000,
          customHeaders: [
            { key: "Authorization", value: "Bearer token123" },
            { key: "X-Source", value: "ai-search-platform" }
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
          lastTriggered: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          successCount: 1247,
          failureCount: 23,
        },
        {
          id: "webhook-2", 
          name: "Analytics Webhook",
          url: "https://analytics.example.com/events",
          events: ["search.completed", "document.indexed", "integration.updated"],
          isActive: false,
          secret: "",
          retryCount: 5,
          timeoutMs: 3000,
          customHeaders: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          successCount: 456,
          failureCount: 7,
        },
      ],
      eventTypes: [
        "user.query",
        "user.feedback", 
        "chat.started",
        "chat.ended",
        "search.completed",
        "document.indexed",
        "integration.created",
        "integration.updated",
        "integration.deleted",
        "deployment.success",
        "deployment.failed",
        "error.occurred"
      ],
      globalRetryEnabled: true,
      globalTimeoutMs: 5000,
      eventLogs: [
        {
          id: "log-1",
          webhookId: "webhook-1",
          webhookName: "User Activity Webhook",
          event: "user.query",
          payload: { 
            userId: "user123",
            query: "How to implement RAG?",
            timestamp: new Date().toISOString(),
            sessionId: "session-456"
          },
          response: {
            status: 200,
            body: "OK",
            headers: { "content-type": "application/json" }
          },
          attempts: 1,
          status: "success" as const,
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          duration: 234,
        },
        {
          id: "log-2",
          webhookId: "webhook-1", 
          webhookName: "User Activity Webhook",
          event: "user.feedback",
          payload: {
            userId: "user789",
            rating: 5,
            comment: "Very helpful response",
            queryId: "query-123"
          },
          response: {
            status: 500,
            body: "Internal Server Error",
            headers: { "content-type": "text/plain" }
          },
          attempts: 2,
          status: "failed" as const,
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          duration: 5000,
          nextRetry: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes from now
        },
      ],
      testMode: false,
    },
    versions: {
      versions: [
        {
          id: "version-3",
          version: "v1.3.0",
          status: "published" as const,
          publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          createdBy: "john.doe",
          releaseNotes: "Added advanced analytics tracking and improved search performance",
          tags: ["analytics", "performance", "major"],
          changes: [
            {
              field: "config.searchSettings.maxResults",
              oldValue: 50,
              newValue: 100,
              type: "modified" as const
            },
            {
              field: "config.analytics.trackingEnabled",
              oldValue: null,
              newValue: true,
              type: "added" as const
            },
            {
              field: "theme.primaryColor",
              oldValue: "#1F6FEB",
              newValue: "#2563EB",
              type: "modified" as const
            }
          ],
          config: {},
          approvedBy: "jane.smith",
          approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
        },
        {
          id: "version-2",
          version: "v1.2.1",
          status: "archived" as const,
          publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 - 1000 * 60 * 30), // 2 days + 30 min ago
          createdBy: "alice.johnson",
          releaseNotes: "Bug fixes and security improvements",
          tags: ["bugfix", "security", "patch"],
          changes: [
            {
              field: "config.security.rateLimitEnabled",
              oldValue: false,
              newValue: true,
              type: "modified" as const
            }
          ],
          config: {},
          approvedBy: "john.doe",
          approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        },
        {
          id: "version-4",
          version: "v1.4.0",
          status: "draft" as const,
          publishedAt: null,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          createdBy: "current-user",
          releaseNotes: "New theme customization options and webhook improvements",
          tags: ["theme", "webhooks", "feature"],
          changes: [
            {
              field: "theme.customCSS",
              oldValue: null,
              newValue: "/* Custom styles */",
              type: "added" as const
            },
            {
              field: "webhooks.globalRetryEnabled",
              oldValue: false,
              newValue: true,
              type: "modified" as const
            }
          ],
          config: {},
        },
      ],
      currentVersion: "version-3",
      draftVersion: "version-4",
      approvalWorkflow: {
        enabled: true,
        requiredApprovers: 1,
        approvers: ["john.doe", "jane.smith", "alice.johnson"],
        autoPublishOnApproval: false,
      },
      retentionDays: 90,
      autoVersioning: true,
    },
    analytics: {
      kpis: [
        {
          id: "total-queries",
          name: "Total Queries",
          value: 15847,
          unit: "",
          change: 12.5,
          trend: "up" as const,
          target: 20000
        },
        {
          id: "active-users",
          name: "Active Users",
          value: 2341,
          unit: "",
          change: 8.3,
          trend: "up" as const,
          target: 3000
        },
        {
          id: "avg-response-time",
          name: "Avg Response Time",
          value: 245,
          unit: "ms",
          change: -5.2,
          trend: "up" as const,
          target: 200
        },
        {
          id: "satisfaction-score",
          name: "Satisfaction Score",
          value: 0.92,
          unit: "",
          change: 2.1,
          trend: "up" as const,
          target: 0.95
        }
      ],
      chartData: {
        queries: [],
        users: [],
        satisfaction: [],
        responseTime: []
      },
      topQueries: [
        {
          id: "query-1",
          query: "How do I implement RAG with OpenAI?",
          count: 1247,
          averageResponseTime: 234,
          satisfactionScore: 4.8,
          lastAsked: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
        },
        {
          id: "query-2",
          query: "What are the best practices for vector databases?",
          count: 892,
          averageResponseTime: 189,
          satisfactionScore: 4.6,
          lastAsked: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        },
        {
          id: "query-3",
          query: "How to optimize search relevance?",
          count: 756,
          averageResponseTime: 267,
          satisfactionScore: 4.4,
          lastAsked: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
        },
        {
          id: "query-4",
          query: "Integration with existing documentation?",
          count: 634,
          averageResponseTime: 198,
          satisfactionScore: 4.7,
          lastAsked: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
        },
        {
          id: "query-5",
          query: "API rate limits and usage quotas",
          count: 523,
          averageResponseTime: 156,
          satisfactionScore: 4.5,
          lastAsked: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
        }
      ],
      topSources: [
        {
          id: "source-1",
          domain: "docs.company.com",
          url: "https://docs.company.com/ai-search",
          visits: 8934,
          conversions: 456,
          conversionRate: 0.051,
          averageSessionTime: 245
        },
        {
          id: "source-2", 
          domain: "blog.example.com",
          url: "https://blog.example.com/ai-integration",
          visits: 5621,
          conversions: 234,
          conversionRate: 0.042,
          averageSessionTime: 189
        },
        {
          id: "source-3",
          domain: "stackoverflow.com",
          url: "https://stackoverflow.com/questions/tagged/rag",
          visits: 3487,
          conversions: 145,
          conversionRate: 0.042,
          averageSessionTime: 123
        },
        {
          id: "source-4",
          domain: "github.com",
          url: "https://github.com/company/ai-search-examples",
          visits: 2156,
          conversions: 167,
          conversionRate: 0.077,
          averageSessionTime: 298
        }
      ],
      performance: [
        {
          id: "response-time",
          name: "Average Response Time",
          value: 245,
          unit: "ms",
          status: "good" as const,
          threshold: 500
        },
        {
          id: "error-rate",
          name: "Error Rate",
          value: 0.8,
          unit: "%",
          status: "good" as const,
          threshold: 5
        },
        {
          id: "uptime",
          name: "System Uptime",
          value: 99.9,
          unit: "%",
          status: "good" as const,
          threshold: 99
        },
        {
          id: "memory-usage",
          name: "Memory Usage",
          value: 78,
          unit: "%",
          status: "warning" as const,
          threshold: 80
        },
        {
          id: "cpu-usage",
          name: "CPU Usage",
          value: 45,
          unit: "%",
          status: "good" as const,
          threshold: 70
        }
      ],
      dataRetentionDays: 90,
      realTimeUpdates: true,
      anonymizeData: true,
      trackingEnabled: true
    },
    abTesting: {
      experiments: [
        {
          id: "exp-1",
          name: "Search Result Layout Optimization",
          description: "Testing different layout styles for search results to improve user engagement",
          status: "running" as const,
          hypothesis: "A card-based layout will increase click-through rates by 15% compared to the current list layout",
          successMetric: "Click-through Rate",
          targetAudience: "All users",
          sampleSize: 10000,
          confidenceLevel: 95,
          startDate: "2024-09-15",
          duration: 14,
          variants: [
            {
              id: "var-control",
              name: "Control (Current List)",
              description: "Current list-based search results layout",
              trafficWeight: 50,
              isControl: true,
              isActive: true,
              metrics: {
                visitors: 4247,
                conversions: 892,
                conversionRate: 21.0,
                confidenceInterval: [19.8, 22.2] as [number, number],
                significance: 95.2,
                isWinner: false,
                liftOverControl: 0
              }
            },
            {
              id: "var-cards",
              name: "Card Layout",
              description: "New card-based search results with enhanced visuals",
              trafficWeight: 50,
              isControl: false,
              isActive: true,
              metrics: {
                visitors: 4183,
                conversions: 1046,
                conversionRate: 25.0,
                confidenceInterval: [23.7, 26.3] as [number, number],
                significance: 97.8,
                isWinner: true,
                liftOverControl: 19.0
              }
            }
          ],
          results: {
            totalVisitors: 8430,
            totalConversions: 1938,
            overallConversionRate: 23.0,
            statisticalPower: 97.8,
            pValue: 0.022,
            winner: "var-cards",
            liftAmount: 154,
            liftPercentage: 19.0
          }
        }
      ],
      settings: {
        enableTestingFramework: true,
        defaultConfidenceLevel: 95,
        defaultTestDuration: 14,
        autoPromoteWinners: false,
        minSampleSize: 1000,
        maxConcurrentTests: 5,
        trackingEvents: ["search_query", "result_click", "session_end", "conversion"],
        advancedSegmentation: true,
        multiVariateEnabled: true
      },
      templates: [
        {
          id: "template-layout",
          name: "UI Layout Test",
          description: "Test different user interface layouts and designs",
          defaultHypothesis: "The new layout will improve user engagement metrics",
          suggestedMetrics: ["Click-through Rate", "Time on Page", "Bounce Rate"]
        },
        {
          id: "template-performance",
          name: "Performance Optimization",
          description: "Test different performance optimizations and their impact",
          defaultHypothesis: "Faster response times will improve user satisfaction",
          suggestedMetrics: ["User Satisfaction", "Task Completion Rate", "Session Duration"]
        }
      ]
    },
    permissions: {
      users: [
        {
          id: "user-001",
          name: "John Doe",
          email: "john@company.com",
          role: "owner" as const,
          status: "active" as const,
          lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          permissions: ["*"], // All permissions
        },
        {
          id: "user-002", 
          name: "Jane Smith",
          email: "jane@company.com",
          role: "admin" as const,
          status: "active" as const,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          permissions: ["integration:read", "integration:write", "integration:admin", "users:read", "users:write"],
        },
      ],
      roles: [
        {
          id: "role-owner",
          name: "Owner",
          description: "Full access to all features and settings",
          permissions: ["*"],
          isSystem: true,
          userCount: 1,
          color: "#DC2626",
        },
        {
          id: "role-admin",
          name: "Administrator", 
          description: "Manage integrations, users, and most settings",
          permissions: ["integration:*", "users:*", "analytics:*", "settings:read"],
          isSystem: true,
          userCount: 1,
          color: "#EA580C",
        },
      ],
      permissionGroups: [
        {
          id: "group-integration",
          name: "Integration Management",
          description: "Permissions for managing integrations",
          permissions: [
            {
              id: "integration:read",
              name: "View Integrations",
              description: "View integration configurations and settings",
              category: "integration",
              isSystem: true,
            },
            {
              id: "integration:write",
              name: "Edit Integrations", 
              description: "Create, update, and configure integrations",
              category: "integration",
              isSystem: true,
            },
          ],
        },
      ],
      accessRules: [
        {
          id: "rule-001",
          name: "Office IP Whitelist",
          description: "Restrict access to office IP addresses",
          type: "ip_whitelist" as const,
          enabled: true,
          configuration: {
            allowedIPs: ["192.168.1.0/24", "10.0.0.0/8"],
            blockByDefault: true,
          },
          appliesTo: ["role-admin", "role-owner"],
        },
      ],
      settings: {
        requireTwoFactor: true,
        sessionTimeout: 480, // 8 hours in minutes
        maxFailedLogins: 5,
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          expirationDays: 90,
        },
        auditRetentionDays: 365,
        autoSuspendInactiveUsers: true,
        inactiveUserDays: 90,
      },
    },
    auditLogs: {
      logs: [
        {
          id: "log-001",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          userId: "user-001",
          userName: "John Doe",
          userEmail: "john@company.com",
          action: "integration.update",
          category: "integration" as const,
          severity: "medium" as const,
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
          outcome: "success" as const,
          changes: {
            before: { enableAnalytics: false },
            after: { enableAnalytics: true }
          }
        },
      ],
      securityAlerts: [
        {
          id: "alert-001",
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          type: "failed_login" as const,
          severity: "high" as const,
          title: "Multiple Failed Login Attempts",
          description: "User account bob@company.com has 5 failed login attempts in the last 10 minutes",
          affected: {
            userId: "user-003",
            ipAddress: "203.0.113.45",
            count: 5
          },
          status: "investigating" as const,
          assignee: "security-team",
          relatedLogIds: ["log-003"]
        },
      ],
      complianceReports: [
        {
          id: "report-001",
          type: "access_report" as const,
          title: "Monthly User Access Report",
          description: "Comprehensive report of all user access activities for August 2024",
          generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          generatedBy: "system-automated",
          period: {
            start: new Date("2024-08-01"),
            end: new Date("2024-08-31")
          },
          status: "ready" as const,
          downloadUrl: "/downloads/access-report-aug-2024.pdf",
          fileSize: "4.2 MB",
          recordCount: 1542,
          filters: {
            includeSystemUsers: false,
            minimumSeverity: "low"
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
          frequency: "monthly" as const,
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
    },
    securityCompliance: {
      policies: [
        {
          id: "policy-001",
          name: "Data Encryption Policy",
          type: "data_encryption" as const,
          status: "active" as const,
          severity: "critical" as const,
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
      ],
      scans: [
        {
          id: "scan-001",
          type: "vulnerability" as const,
          status: "completed" as const,
          severity: "medium" as const,
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
      ],
      frameworks: [
        {
          id: "framework-001",
          name: "ISO 27001",
          version: "2013",
          status: "compliant" as const,
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
      ],
      encryption: [
        {
          id: "encryption-001",
          type: "data_at_rest" as const,
          algorithm: "AES-256-GCM",
          keySize: 256,
          status: "active" as const,
          lastRotation: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
          nextRotation: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
          rotationInterval: 90,
          description: "Database encryption for all user data and sensitive information",
          scope: ["user_data", "financial_records", "personal_information"],
        },
      ],
      alerts: [
        {
          id: "alert-001",
          type: "vulnerability" as const,
          severity: "high" as const,
          title: "Critical Security Vulnerability Detected",
          description: "High-severity vulnerability found in third-party dependency",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          source: "Dependency Scanner",
          status: "investigating" as const,
          assignee: "Security Team",
          affectedSystems: ["API Gateway", "User Authentication"],
          impact: "high" as const,
          estimatedResolutionTime: 24,
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
        scanFrequency: "weekly" as const,
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
    },
    // Add other tab data here as we build them
  });

  const handleOverviewChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      overview: data
    }));
  }, []);

  const handleEmbedKeysChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      embedKeys: data
    }));
  }, []);

  const handleDomainsChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      domains: data
    }));
  }, []);

  const handleConfigChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      config: data
    }));
  }, []);

  const handleThemeChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      theme: data
    }));
  }, []);

  const handleEnvironmentsChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      environments: data
    }));
  }, []);

  const handleWebhooksChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      webhooks: data
    }));
  }, []);

  const handleVersionsChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      versions: data
    }));
  }, []);

  const handleAnalyticsChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      analytics: data
    }));
  }, []);

  const handleABTestingChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      abTesting: data
    }));
  }, []);

  const handlePermissionsChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      permissions: data
    }));
  }, []);

  const handleAuditLogsChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      auditLogs: data
    }));
  }, []);

  const handleSecurityComplianceChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      securityCompliance: data
    }));
  }, []);
  
  const handleSave = () => {
    setIsDraftSaved(true);
    console.log("Saving draft...");
    // TODO: Implement save logic
  };

  const handlePublish = () => {
    console.log("Publishing integration...");
    // TODO: Implement publish logic
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Settings },
    { id: "embed-keys", label: "Embed & Keys", icon: Key },
    { id: "domains", label: "Domains", icon: Globe },
    { id: "config", label: "Config", icon: Sliders },
    { id: "theme", label: "Theme", icon: Palette },
    { id: "environments", label: "Environments", icon: Server },
    { id: "webhooks", label: "Webhooks & Events", icon: Webhook },
    { id: "versions", label: "Versions", icon: History },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "ab-canary", label: "A/B & Canary", icon: TestTube },
    { id: "permissions", label: "Permissions", icon: Users },
    { id: "audit", label: "Audit", icon: FileText },
    { id: "security", label: "Security & Compliance", icon: Shield },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex flex-col lg:flex-row items-start gap-5 lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {mode === "create" ? "Create Integration" : "Edit Integration"}
              </h1>
              <p className="text-muted-foreground">
                Configure your AI chat and search integration
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {isDraftSaved && (
              <Badge variant="outline" className="  text-orange-600 border-orange-200">
                Draft Saved
              </Badge>
            )}
            <Button variant="outline" onClick={handleSave} data-testid="button-save-draft">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} data-testid="button-publish">
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1  flex">
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full  h-full flex flex-col lg:flex-row ">
          {/* Vertical Tab Sidebar */}
          <div className="lg:w-72 w-full border-r bg-muted/30">
            <div className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Integration Settings</h3>
              <TabsList className="flex flex-col h-auto w-full bg-transparent gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="w-full justify-start gap-3 p-3 text-left data-[state=active]:bg-background data-[state=active]:shadow-sm hover-elevate"
                      data-testid={`tab-${tab.id}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto lg:px-2 px-0 py-6 lg:p-6">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab 
                  data={formData.overview}
                  users={mockUsers}
                  onChange={handleOverviewChange}
                />
              </TabsContent>

              <TabsContent value="embed-keys" className="mt-0">
                <EmbedKeysTab 
                  data={formData.embedKeys}
                  onChange={handleEmbedKeysChange}
                />
              </TabsContent>

              <TabsContent value="domains" className="mt-0">
                <DomainsTab 
                  data={formData.domains}
                  onChange={handleDomainsChange}
                />
              </TabsContent>

              <TabsContent value="config" className="mt-0">
                <ConfigTab 
                  data={formData.config}
                  onChange={handleConfigChange}
                />
              </TabsContent>

              <TabsContent value="theme" className="mt-0">
                <ThemeTab 
                  data={formData.theme}
                  onChange={handleThemeChange}
                />
              </TabsContent>

              <TabsContent value="environments" className="mt-0">
                <EnvironmentsTab 
                  data={formData.environments}
                  onChange={handleEnvironmentsChange}
                />
              </TabsContent>

              <TabsContent value="webhooks" className="mt-0">
                <WebhooksTab 
                  data={formData.webhooks}
                  onChange={handleWebhooksChange}
                />
              </TabsContent>

              <TabsContent value="versions" className="mt-0">
                <VersionsTab 
                  data={formData.versions}
                  onChange={handleVersionsChange}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <AnalyticsTab 
                  data={formData.analytics}
                  onChange={handleAnalyticsChange}
                />
              </TabsContent>

              <TabsContent value="ab-canary" className="mt-0">
                <ABTestingTab 
                  data={formData.abTesting}
                  onChange={handleABTestingChange}
                />
              </TabsContent>

              <TabsContent value="permissions" className="mt-0">
                <PermissionsTab 
                  data={formData.permissions}
                  onChange={handlePermissionsChange}
                />
              </TabsContent>

              <TabsContent value="audit" className="mt-0">
                <AuditLogsTab 
                  data={formData.auditLogs}
                  onChange={handleAuditLogsChange}
                />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecurityComplianceTab 
                  data={formData.securityCompliance}
                  onChange={handleSecurityComplianceChange}
                />
              </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}