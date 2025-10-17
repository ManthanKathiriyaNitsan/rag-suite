/**
 * Tab navigation component for Integration Create/Edit
 * Handles tab switching and state management
 */

import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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
  Shield
} from "lucide-react";

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  disabled?: boolean;
}

interface IntegrationTabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: TabConfig[];
  children: ReactNode;
}

export function IntegrationTabNavigation({
  activeTab,
  onTabChange,
  tabs,
  children,
}: IntegrationTabNavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="border-b px-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 h-auto p-0 bg-transparent">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {children}
    </Tabs>
  );
}

// Default tab configuration
export const DEFAULT_TABS: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Settings,
    component: () => null, // Will be imported dynamically
  },
  {
    id: "embed-keys",
    label: "Embed Keys",
    icon: Key,
    component: () => null,
  },
  {
    id: "domains",
    label: "Domains",
    icon: Globe,
    component: () => null,
  },
  {
    id: "config",
    label: "Config",
    icon: Sliders,
    component: () => null,
  },
  {
    id: "theme",
    label: "Theme",
    icon: Palette,
    component: () => null,
  },
  {
    id: "environments",
    label: "Environments",
    icon: Server,
    component: () => null,
  },
  {
    id: "webhooks",
    label: "Webhooks",
    icon: Webhook,
    component: () => null,
  },
  {
    id: "versions",
    label: "Versions",
    icon: History,
    component: () => null,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    component: () => null,
  },
  {
    id: "ab-testing",
    label: "A/B Testing",
    icon: TestTube,
    component: () => null,
  },
  {
    id: "permissions",
    label: "Permissions",
    icon: Users,
    component: () => null,
  },
  {
    id: "audit-logs",
    label: "Audit",
    icon: FileText,
    component: () => null,
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    component: () => null,
  },
];
