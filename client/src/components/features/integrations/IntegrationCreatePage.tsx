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
  Save, 
  X, 
  Plus, 
  Check, 
  ChevronsUpDown, 
  User as UserIcon,
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
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import actual tab components
import OverviewTab from "@/components/tabs/OverviewTab";
import EmbedKeysTab from "@/components/tabs/EmbedKeysTab";
import DomainsTab from "@/components/tabs/DomainsTab";
import ConfigTab from "@/components/tabs/ConfigTab";
import ThemeTab from "@/components/tabs/ThemeTab";
import EnvironmentsTab from "@/components/tabs/EnvironmentsTab";
import WebhooksTab from "@/components/tabs/WebhooksTab";
import VersionsTab from "@/components/tabs/VersionsTab";
import AnalyticsTab from "@/components/tabs/AnalyticsTab";
import ABTestingTab from "@/components/tabs/ABTestingTab";
import PermissionsTab from "@/components/tabs/PermissionsTab";
import AuditLogsTab from "@/components/tabs/AuditLogsTab";
import SecurityComplianceTab from "@/components/tabs/SecurityComplianceTab";

// Mock users for owner selection
const mockUsers = [
  { id: "user-001", name: "John Doe", email: "john@company.com" },
  { id: "user-002", name: "Jane Smith", email: "jane@company.com" },
  { id: "user-003", name: "Bob Wilson", email: "bob@company.com" },
  { id: "user-004", name: "Alice Johnson", email: "alice@company.com" },
];

// Sidebar navigation items
const sidebarItems = [
  { id: "overview", label: "Overview", icon: Settings },
  { id: "embed-keys", label: "Embed & Keys", icon: Key },
  { id: "domains", label: "Domains", icon: Globe },
  { id: "config", label: "Config", icon: Sliders },
  { id: "theme", label: "Theme", icon: Palette },
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
    tags: [],
    // Theme data
    primaryColor: "#3b82f6",
    secondaryColor: "#6b7280",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    surfaceColor: "#f9fafb",
    cardColor: "#ffffff",
    textPrimary: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    borderColor: "#e5e7eb",
    errorColor: "#ef4444",
    warningColor: "#f59e0b",
    successColor: "#10b981",
    infoColor: "#3b82f6",
    fontFamily: "Inter",
    // Embed keys data
    embedKeys: [],
    // Domains data
    domains: [],
    // Config data
    ragModel: "gpt-3.5-turbo",
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
      kpis: [],
      chartData: [],
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

  const renderTabContent = () => {
    const handleDataChange = (updates: any) => {
      setFormData(prev => ({ ...prev, ...updates }));
    };

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
            data={formData.domains || []}
            onChange={(domains) => handleDataChange({ domains })}
          />
        );
      
      case "config":
        return (
          <ConfigTab 
            data={formData.config || {
              ragModel: "gpt-3.5-turbo",
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
            onChange={(config) => handleDataChange({ config })}
          />
        );
      
      case "theme":
        return (
          <ThemeTab 
            data={formData}
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
            data={formData.security || {
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
            }}
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
    <div className="relative min-h-screen">
      {/* Content */}
      <div className="relative z-10 flex h-screen lg:h-screen min-h-screen">
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
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
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
        <div className="flex-1 flex flex-col lg:h-screen">
          {/* Header */}
          <div className="border-b bg-background/80 backdrop-blur-sm">
            <div className="px-4 lg:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 justify-between">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold">
                    {mode === "create" ? "Create Integration" : "Edit Integration"}
                  </h1>
                  <p className="text-muted-foreground text-sm lg:text-base">Configure your AI chat and search integration</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex items-center gap-2 text-xs lg:text-sm">
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Save Draft</span>
                    <span className="sm:hidden">Draft</span>
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="flex items-center gap-2 text-xs lg:text-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </span>
                    <span className="sm:hidden">
                      {isLoading ? "Saving..." : "Success"}
                    </span>
                  </Button>
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
                    variant={activeTab === item.id ? "secondary" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 justify-start h-9 text-xs"
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
          <div className="flex-1 p-0 pt-3 lg:p-6 lg:overflow-auto">
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
