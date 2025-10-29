/**
 * Tab content container for Integration Create/Edit
 * Dynamically renders the appropriate tab component
 */

import { ReactNode } from "react";
import { TabsContent } from "@/components/ui/tabs";
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

interface TabContentProps {
  tabId: string;
  formData: any;
  onUpdate: (updates: any) => void;
  users?: any[];
}

const TAB_COMPONENTS = {
  overview: OverviewTab,
  "embed-keys": EmbedKeysTab,
  domains: DomainsTab,
  config: ConfigTab,
  theme: ThemeTab,
  environments: EnvironmentsTab,
  webhooks: WebhooksTab,
  versions: VersionsTab,
  analytics: AnalyticsTab,
  "ab-testing": ABTestingTab,
  permissions: PermissionsTab,
  "audit-logs": AuditLogsTab,
  security: SecurityComplianceTab,
};

export function IntegrationTabContent({ tabId, formData, onUpdate, users }: TabContentProps) {
  const TabComponent = TAB_COMPONENTS[tabId as keyof typeof TAB_COMPONENTS];

  if (!TabComponent) {
    return (
      <TabsContent value={tabId} className="mt-0">
        <div className="text-center py-8 text-muted-foreground">
          Tab content not found for: {tabId}
        </div>
      </TabsContent>
    );
  }

  // Prepare props for each tab component
  const getTabProps = () => {
    switch (tabId) {
      case "overview":
        return {
          data: {
            name: formData.name || "",
            slug: formData.slug || "",
            description: formData.description || "",
            status: formData.status || "active",
            ownerId: formData.ownerId || "",
            tags: formData.tags || [],
          },
          users: users || [],
          onChange: (data: any) => onUpdate(data),
        };

      case "embed-keys":
        return {
          keys: formData.embedKeys || [],
          onCreateKey: (keyData: any) => onUpdate({ embedKeys: [...(formData.embedKeys || []), keyData] }),
          onUpdateKey: (keyId: string, updates: any) => {
            const updatedKeys = (formData.embedKeys || []).map((key: any) =>
              key.id === keyId ? { ...key, ...updates } : key
            );
            onUpdate({ embedKeys: updatedKeys });
          },
          onDeleteKey: (keyId: string) => {
            const filteredKeys = (formData.embedKeys || []).filter((key: any) => key.id !== keyId);
            onUpdate({ embedKeys: filteredKeys });
          },
        };

      case "domains":
        return {
          domains: formData.domains || [],
          onAddDomain: (domain: any) => onUpdate({ domains: [...(formData.domains || []), domain] }),
          onUpdateDomain: (domainId: string, updates: any) => {
            const updatedDomains = (formData.domains || []).map((domain: any) =>
              domain.id === domainId ? { ...domain, ...updates } : domain
            );
            onUpdate({ domains: updatedDomains });
          },
          onDeleteDomain: (domainId: string) => {
            const filteredDomains = (formData.domains || []).filter((domain: any) => domain.id !== domainId);
            onUpdate({ domains: filteredDomains });
          },
        };

      case "config":
        return {
          data: formData.settings || {},
          onChange: (settings: any) => onUpdate({ settings }),
        };

      case "theme":
        return {
          theme: formData.branding || {},
          typography: formData.typography || {},
          onThemeChange: (theme: any) => onUpdate({ branding: theme }),
          onTypographyChange: (typography: any) => onUpdate({ typography }),
        };

      case "environments":
        return {
          environments: formData.environments || [],
          onEnvironmentChange: (environments: any) => onUpdate({ environments }),
        };

      case "webhooks":
        return {
          webhooks: formData.webhooks || [],
          onCreateWebhook: (webhook: any) => onUpdate({ webhooks: [...(formData.webhooks || []), webhook] }),
          onUpdateWebhook: (webhookId: string, updates: any) => {
            const updatedWebhooks = (formData.webhooks || []).map((webhook: any) =>
              webhook.id === webhookId ? { ...webhook, ...updates } : webhook
            );
            onUpdate({ webhooks: updatedWebhooks });
          },
          onDeleteWebhook: (webhookId: string) => {
            const filteredWebhooks = (formData.webhooks || []).filter((webhook: any) => webhook.id !== webhookId);
            onUpdate({ webhooks: filteredWebhooks });
          },
        };

      case "versions":
        return {
          versions: formData.versions || [],
          onCreateVersion: (version: any) => onUpdate({ versions: [...(formData.versions || []), version] }),
          onDeployVersion: (versionId: string) => {
            // Handle version deployment logic
            console.log("Deploying version:", versionId);
          },
          onRollbackToVersion: (versionId: string) => {
            // Handle version rollback logic
            console.log("Rolling back to version:", versionId);
          },
        };

      case "analytics":
        return {
          kpis: formData.analytics?.kpis || [],
          chartData: formData.analytics?.chartData || [],
          timeRange: formData.analytics?.timeRange || "7d",
          onTimeRangeChange: (range: string) => onUpdate({ 
            analytics: { ...formData.analytics, timeRange: range } 
          }),
        };

      case "ab-testing":
        return {
          experiments: formData.experiments || [],
          onCreateExperiment: (experiment: any) => onUpdate({ 
            experiments: [...(formData.experiments || []), experiment] 
          }),
          onUpdateExperiment: (experimentId: string, updates: any) => {
            const updatedExperiments = (formData.experiments || []).map((exp: any) =>
              exp.id === experimentId ? { ...exp, ...updates } : exp
            );
            onUpdate({ experiments: updatedExperiments });
          },
          onDeleteExperiment: (experimentId: string) => {
            const filteredExperiments = (formData.experiments || []).filter((exp: any) => exp.id !== experimentId);
            onUpdate({ experiments: filteredExperiments });
          },
        };

      case "permissions":
        return {
          users: users || [],
          roles: formData.roles || [],
          onInviteUser: (email: string, role: string) => {
            // Handle user invitation logic
            console.log("Inviting user:", email, "with role:", role);
          },
          onUpdateUserRole: (userId: string, role: string) => {
            // Handle user role update logic
            console.log("Updating user role:", userId, "to:", role);
          },
          onRemoveUser: (userId: string) => {
            // Handle user removal logic
            console.log("Removing user:", userId);
          },
        };

      case "audit-logs":
        return {
          logs: formData.auditLogs || [],
          onFilterChange: (filters: any) => {
            // Handle audit log filtering logic
            console.log("Filtering audit logs:", filters);
          },
        };

      case "security":
        return {
          securitySettings: formData.security || {},
          onSecurityUpdate: (security: any) => onUpdate({ security }),
        };

      default:
        return {};
    }
  };

  return (
    <TabsContent value={tabId} className="mt-0">
      <TabComponent {...getTabProps()} />
    </TabsContent>
  );
}
