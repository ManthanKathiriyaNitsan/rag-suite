import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  Bot,
  Database,
  FileText,
  Home,
  MessageSquare,
  Search,
  Settings,
  Sliders,
  Puzzle,
  ChevronDown,
  Check,
  Plus,
  Folder,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/contexts/BrandingContext";
import { useTranslation } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Overview",
    url: "/",
    icon: Home,
  },
  {
    title: "Crawl",
    url: "/crawl",
    icon: Search,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
  {
    title: "RAG Tuning",
    url: "/rag-tuning",
    icon: Bot,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Feedback",
    url: "/feedback",
    icon: MessageSquare,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Puzzle,
  },
];

const settingsItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "API Keys",
    url: "/api-keys",
    icon: Database,
  },
  {
    title: "System Health",
    url: "/system-health",
    icon: Sliders,
  },
];

const projects = [
  {
    id: "main",
    name: "Main Project",
    description: "Primary documentation site",
    isActive: true,
  },
  {
    id: "support",
    name: "Support Center",
    description: "Customer support docs",
    isActive: false,
  },
  {
    id: "api",
    name: "API Documentation",
    description: "Developer resources",
    isActive: false,
  },
];

const AppSidebar = React.memo(function AppSidebar() {
  const [location] = useLocation();
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [isMobile, setIsMobile] = useState(false);
  const { orgName, logoDataUrl } = useBranding();
  const { t } = useTranslation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 🚀 Memoize navigation items to prevent unnecessary re-renders
  const memoizedMenuItems = useMemo(() => menuItems, []);

  // 🚀 Memoize project selection handler
  const handleProjectSelect = useCallback((project: any) => {
    setSelectedProject(project);
  }, []);

  const { theme } = useTheme();
  
  return (
    <Sidebar 
      className={cn(
        "backdrop-blur-xl transition-all duration-300",
        theme === 'dark' 
          ? "glass-sidebar-dark" 
          : "glass-sidebar-light"
      )}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <SidebarHeader 
        className={cn(
          "p-4 transition-all duration-300",
          theme === 'dark' 
            ? "glass-navbar-dark" 
            : "glass-navbar-light"
        )}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex px-2 py-[7px] items-center gap-2">
          {logoDataUrl ? (
            <img src={logoDataUrl} alt={`${orgName} logo`} className="h-6 w-6 rounded-sm" />
          ) : (
            <Bot className="h-6 w-6 text-[var(--primary)]" />
          )}
          <span className="font-semibold text-lg">{orgName || "RAGSuite"}</span>
        </div>
      </SidebarHeader>

      {/* Projects Dropdown */}
      <div className="px-4 py-2 border-t border-b" style={{ borderColor: theme === 'dark' ? '#2b2b2b' : '#d8d8d8' }}>
        <DropdownMenu  >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-3 border border-transparent transition-colors hover:bg-sidebar-accent hover:border-[hsl(var(--button-hover-border))]"
              data-testid="dropdown-projects"
            >
              <div className="flex items-center gap-3">
                <Folder className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <div className="font-medium text-sm">{selectedProject.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedProject.description}
                  </div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className={isMobile ? "w-[calc(100vw-2rem)]" : "w-64"} 
            align="start" 
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
            alignOffset={0}
          >
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Switch Project
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                className="flex items-center gap-3 p-3 cursor-pointer"
                data-testid={`project-${project.id}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Folder className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-sm">{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {project.description}
                    </div>
                  </div>
                </div>
                {selectedProject.id === project.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer text-muted-foreground">
              <Plus className="h-4 w-4" />
              <span className="text-sm">Create New Project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {memoizedMenuItems.map((item) => {
                // Map menu titles to translation keys
                const translationMap: Record<string, string> = {
                  'Overview': 'nav.overview',
                  'Crawl': 'nav.crawl',
                  'Documents': 'nav.documents',
                  'RAG Tuning': 'nav.rag-tuning',
                  'Analytics': 'nav.analytics',
                  'Feedback': 'nav.feedback',
                  'Integrations': 'nav.integrations',
                  'Settings': 'nav.settings'
                };
                const translationKey = translationMap[item.title] || `nav.${item.title.toLowerCase().replace(' ', '-')}`;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="p-5"
                      isActive={location === item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{t(translationKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="p-4"
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t border-b" style={{ borderColor: theme === 'dark' ? '#2b2b2b' : '#d8d8d8' }}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs bg-white dark:bg-card border-none">v1.0.0</Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
});

export default AppSidebar;
