/**
 * Integration Create Page - Original Design
 * Matches the design from the first image with sidebar navigation
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  X,
  Plus,
  Check,
  ChevronsUpDown,
  User as UserIcon,
  Settings,
  Key,
  Globe,
  Sliders,
  Server,
  Webhook,
  History,
  BarChart3,
  TestTube,
  Users,
  FileText,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import actual tab components
import OverviewTab from "@/components/tabs/OverviewTab";
import EmbedKeysTab from "@/components/tabs/EmbedKeysTab";
import DomainsTab from "@/components/tabs/DomainsTab";
import ConfigTab from "@/components/tabs/ConfigTab";
import EnvironmentsTab from "@/components/tabs/EnvironmentsTab";
import WebhooksTab from "@/components/tabs/WebhooksTab";
import VersionsTab from "@/components/tabs/VersionsTab";
import AnalyticsTab from "@/components/tabs/AnalyticsTab";
import ABTestingTab from "@/components/tabs/ABTestingTab";
import PermissionsTab from "@/components/tabs/PermissionsTab";
import AuditLogsTab from "@/components/tabs/AuditLogsTab";
import SecurityComplianceTab from "@/components/tabs/SecurityComplianceTab";

// Mock users for owner selection
const mockUsers: any[] = [
  { id: "user-001", firstName: "John", lastName: "Doe", email: "john@company.com", role: "admin" as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "user-002", firstName: "Jane", lastName: "Smith", email: "jane@company.com", role: "admin" as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "user-003", firstName: "Bob", lastName: "Wilson", email: "bob@company.com", role: "user" as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "user-004", firstName: "Alice", lastName: "Johnson", email: "alice@company.com", role: "user" as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// Sidebar navigation items
const sidebarItems = [
  { id: "overview", label: "Overview", icon: Settings },
  { id: "embed-keys", label: "Embed & Keys", icon: Key },
  { id: "domains", label: "Domains", icon: Globe },
  { id: "config", label: "Config", icon: Sliders },
  { id: "environments", label: "Environments", icon: Server },
  { id: "webhooks", label: "Webhooks & Events", icon: Webhook },
  { id: "versions", label: "Versions", icon: History },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ab-testing", label: "A/B & Canary", icon: TestTube },
  { id: "permissions", label: "Permissions", icon: Users },
  { id: "audit", label: "Audit", icon: FileText },
  { id: "security", label: "Security & Compliance", icon: Shield },
];

interface IntegrationCreatePageProps {
  integrationId?: string;
  mode: "create" | "edit";
  onBack: () => void;
  onSave: (data: any) => void;
}

export default function IntegrationCreatePage({ integrationId, mode, onBack, onSave }: IntegrationCreatePageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
    ownerId: "",
    tags: [] as string[],
    // Embed keys data
    embedKeys: [],
    // Domains data
    domains: [] as any[],
    // Config data
    ragModel: "custom-llm",
    temperature: 0.7,
    maxTokens: 1000,
    topK: 5,
    topP: 0.9,
    contextWindow: 4000,
    retrievalCount: 5,
    similarityThreshold: 0.7,
    enableChat: true,
    enableSearch: true,
    enableSuggestions: true,
    enableCitations: true,
    enableFollowUps: true,
    responseMode: "balanced",
    fallbackResponse: "I'm sorry, I couldn't find relevant information to answer your question.",
    maxResponseLength: 500,
    enableStreaming: true,
    // Environments data
    environments: [],
    // Webhooks data
    webhooks: [],
    // Versions data
    versions: [],
    // Analytics data
    analytics: {
      kpis: {
        totalQueries: 0,
        totalUsers: 0,
        avgResponseTime: 0,
        successRate: 0,
        queriesToday: 0,
        usersToday: 0,
        avgSessionDuration: 0,
        conversionRate: 0,
      },
      chartData: [],
      topQueries: [],
      userEngagement: {
        newUsers: 0,
        returningUsers: 0,
        activeUsers: 0,
        churnRate: 0,
      },
      performance: {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        errorRate: 0,
        uptime: 0,
      },
      timeRange: "7d"
    },
    // A/B Testing data
    experiments: [],
    // Permissions data
    roles: [],
    // Audit logs data
    auditLogs: [],
    // Security data
    security: {}
  });
  const [openOwner, setOpenOwner] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize component safely
  useEffect(() => {
    try {
      // Any initialization logic can go here
      console.log('IntegrationCreatePage initialized');
    } catch (err) {
      console.error('Error initializing IntegrationCreatePage:', err);
      setError('Failed to initialize the integration create page');
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    try {
      setActiveTab(tabId);
    } catch (err) {
      console.error('Error changing tab:', err);
      setError('Failed to switch tabs');
    }
  };

  const handleDataChange = React.useCallback((updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const renderTabContent = () => {

    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            data={formData}
            users={mockUsers}
            onChange={handleDataChange}
          />
        );

      case "embed-keys":
        return (
          <EmbedKeysTab
            data={{
              publicId: formData.slug || "new-integration",
              keys: formData.embedKeys || []
            }}
            onChange={handleDataChange}
          />
        );

      case "domains":
        return (
          <DomainsTab
            data={{ domains: formData.domains || [] }}
            onChange={(domains) => handleDataChange({ domains })}
          />
        );

      case "config":
        return (
          <ConfigTab
            data={{
              ragModel: formData.ragModel,
              temperature: formData.temperature,
              maxTokens: formData.maxTokens,
              topK: formData.topK,
              topP: formData.topP,
              contextWindow: formData.contextWindow,
              retrievalCount: formData.retrievalCount,
              similarityThreshold: formData.similarityThreshold,
              enableChat: formData.enableChat,
              enableSearch: formData.enableSearch,
              enableSuggestions: formData.enableSuggestions,
              enableCitations: formData.enableCitations,
              enableFollowUps: formData.enableFollowUps,
              responseMode: formData.responseMode,
              fallbackResponse: formData.fallbackResponse,
              maxResponseLength: formData.maxResponseLength,
              enableStreaming: formData.enableStreaming,
              customPrompts: {
                system: "You are a helpful AI assistant that provides accurate and relevant information.",
                user: "User question: {question}",
                assistant: "Based on the provided context, here's what I found:",
              },
              filters: {
                dateRange: "all",
                documentTypes: [],
                sources: [],
              },
              caching: {
                enabled: true,
                ttl: 3600,
                maxSize: 1000,
              },
            }}
            onChange={handleDataChange}
          />
        );

      case "environments":
        return (
          <EnvironmentsTab
            data={formData.environments || []}
            onChange={(environments) => handleDataChange({ environments })}
          />
        );

      case "webhooks":
        return (
          <WebhooksTab
            data={formData.webhooks || []}
            onChange={(webhooks) => handleDataChange({ webhooks })}
          />
        );

      case "versions":
        return (
          <VersionsTab
            data={formData.versions || []}
            onChange={(versions) => handleDataChange({ versions })}
          />
        );

      case "analytics":
        return (
          <AnalyticsTab
            data={formData.analytics || {
              kpis: {
                totalQueries: 0,
                totalUsers: 0,
                avgResponseTime: 0,
                successRate: 0,
                queriesToday: 0,
                usersToday: 0,
                avgSessionDuration: 0,
                conversionRate: 0,
              },
              chartData: [],
              topQueries: [],
              userEngagement: {
                newUsers: 0,
                returningUsers: 0,
                activeUsers: 0,
                churnRate: 0,
              },
              performance: {
                avgResponseTime: 0,
                p95ResponseTime: 0,
                errorRate: 0,
                uptime: 0,
              },
            }}
            onChange={(analytics) => handleDataChange({ analytics })}
          />
        );

      case "ab-testing":
        return (
          <ABTestingTab
            data={formData.experiments || []}
            onChange={(experiments) => handleDataChange({ experiments })}
          />
        );

      case "permissions":
        return (
          <PermissionsTab
            data={formData.roles || []}
            users={mockUsers}
            onChange={(roles) => handleDataChange({ roles })}
          />
        );

      case "audit":
        return (
          <AuditLogsTab
            data={formData.auditLogs || []}
            onChange={(auditLogs) => handleDataChange({ auditLogs })}
          />
        );

      case "security":
        return (
          <SecurityComplianceTab
            data={(formData.security && Object.keys(formData.security).length > 0 ? formData.security : {
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
            }) as any}
            onChange={(security) => handleDataChange({ security })}
          />
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-lg font-medium mb-2">{sidebarItems.find(item => item.id === activeTab)?.label}</div>
            <p>This section is coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 flex">
        {/* Desktop Sidebar Navigation */}
        <div className="w-64 bg-background/80 backdrop-blur-sm border-r border-border/50 hidden lg:block">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground mb-2">Integration Settings</div>
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start border border-transparent transition-[background-color,border-color,color]",
                    activeTab === item.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                  )}
                  onClick={() => handleTabChange(item.id)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b bg-background/80 backdrop-blur-sm">
            <div className="px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold">
                    {mode === "create" ? "Create Integration" : "Edit Integration"}
                  </h1>
                  <p className="text-muted-foreground text-sm lg:text-base">Configure your AI chat and search integration</p>
                </div>
                <div className="flex items-center gap-2">
                  {mode === "create" ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log('Saving draft...', formData);
                          // TODO: Implement save draft functionality
                        }}
                        disabled={isLoading}
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Draft
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Publishing...' : 'Publish'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden border-b bg-background/80 backdrop-blur-sm">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="text-sm font-medium text-muted-foreground">Integration Settings</div>
              </div>

              {/* Compact Tab Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 justify-start h-9 text-xs border border-transparent transition-[background-color,border-color,color]",
                      activeTab === item.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground border-[hsl(var(--button-hover-border))]"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))]"
                    )}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <item.icon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-0 pt-3 lg:p-6">
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
            <GlassCard className="w-full">
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">
                  {sidebarItems.find(item => item.id === activeTab)?.label || "Basic Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                {renderTabContent()}
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
