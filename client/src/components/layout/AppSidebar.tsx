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
  List,
  X,
  Trash2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { useBranding } from "@/contexts/BrandingContext";
import { useTranslation } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

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

const STORAGE_KEY = 'ragsuite-projects';

interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string; // ISO timestamp for sorting
}

const defaultProjects: Project[] = [
  {
    id: "main",
    name: "Main Project",
    description: "Primary documentation site",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "support",
    name: "Support Center",
    description: "Customer support docs",
    isActive: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "api",
    name: "API Documentation",
    description: "Developer resources",
    isActive: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
];

// Load projects from localStorage or use defaults
const loadProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Add createdAt to projects that don't have it (for backward compatibility)
      return parsed.map((p: Project) => ({
        ...p,
        createdAt: p.createdAt || new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
  }
  return defaultProjects;
};

// Save projects to localStorage
const saveProjects = (projects: Project[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
};

const AppSidebar = React.memo(function AppSidebar() {
  const [location] = useLocation();
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [selectedProject, setSelectedProject] = useState<Project>(() => {
    const loaded = loadProjects();
    return loaded.find(p => p.isActive) || loaded[0];
  });
  const [isMobile, setIsMobile] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const { orgName, logoDataUrl } = useBranding();
  const { t } = useTranslation();
  const { toast } = useToast();

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
  const handleProjectSelect = useCallback((project: Project) => {
    // Update active status
    const updatedProjects = projects.map(p => ({
      ...p,
      isActive: p.id === project.id
    }));
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setSelectedProject(project);
    setShowAllProjects(false);
  }, [projects]);

  // Handle create new project
  const handleCreateProject = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    if (!newProjectDescription.trim()) {
      toast({
        title: "Error",
        description: "Project description is required",
        variant: "destructive",
      });
      return;
    }

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      isActive: false,
      createdAt: new Date().toISOString(),
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    
    // Reset form
    setNewProjectName("");
    setNewProjectDescription("");
    setShowCreateDialog(false);
    
    toast({
      title: "Project Created",
      description: `"${newProject.name}" has been created successfully`,
    });
  }, [newProjectName, newProjectDescription, projects, toast]);

  // Handle view all projects
  const handleViewAllProjects = useCallback(() => {
    setShowAllProjects(true);
  }, []);

  // Handle delete project
  const handleDeleteProject = useCallback((project: Project) => {
    // Prevent deleting the active project
    if (project.isActive) {
      toast({
        title: "Cannot Delete Active Project",
        description: "Please switch to another project before deleting this one.",
        variant: "destructive",
      });
      return;
    }

    const updatedProjects = projects.filter(p => p.id !== project.id);
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setProjectToDelete(null);
    
    toast({
      title: "Project Deleted",
      description: `"${project.name}" has been deleted successfully`,
    });
  }, [projects, toast]);

  // Get sorted projects (active first, then newest first)
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      // Active project always comes first
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      
      // If both have same active status, sort by creation date (newest first)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [projects]);

  // Get top 3 latest projects
  const top3Projects = useMemo(() => {
    return sortedProjects.slice(0, 3);
  }, [sortedProjects]);

  const { theme } = useTheme();

  return (
    <Sidebar
      collapsible="icon"
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
        <div className="flex  py-[7px] items-center gap-2">
          {logoDataUrl ? (
            <img src={logoDataUrl} alt={`${orgName} logo`} className="h-6 w-6 rounded-sm" />
          ) : (
            <Bot className="h-6 w-6 text-[var(--primary)]" />
          )}
          <span className="font-semibold text-lg transition-[opacity,max-width] duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:overflow-hidden">{orgName || "RAGSuite"}</span>
        </div>
      </SidebarHeader>

      {/* Projects Dropdown */}
      <div className="px-4 py-2 border-t border-b transition-[opacity,height,margin,padding,border-color] duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:m-0 group-data-[collapsible=icon]:border-0" style={{ borderColor: theme === 'dark' ? '#2b2b2b' : '#d8d8d8' }}>
        <DropdownMenu  >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-3 transition-[background-color,border-color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-[hsl(var(--button-hover-border))] active:bg-sidebar-accent active:text-sidebar-accent-foreground active:border-[hsl(var(--button-hover-border))]"
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
            className={cn(
              isMobile ? "w-[calc(100vw-2rem)] max-h-[70vh]" : "w-64 max-h-[60vh]",
              "overflow-y-auto"
            )}
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
            alignOffset={0}
          >
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Switch Project
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {top3Projects.map((project) => (
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
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault();
                setShowCreateDialog(true);
              }}
              className="flex items-center gap-3 p-3 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Create New Project</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault();
                handleViewAllProjects();
              }}
              className="flex items-center gap-3 p-3 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <List className="h-4 w-4" />
              <span className="text-sm">View All Projects</span>
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
                      className="p-5 group-data-[collapsible=icon]:justify-center"
                      isActive={location === item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span className="transition-[opacity,max-width] duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:overflow-hidden">{t(translationKey)}</span>
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
                    className="p-4 group-data-[collapsible=icon]:justify-center"
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="transition-[opacity,max-width] duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:overflow-hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t border-b transition-[opacity,height,margin,padding,border-color] duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:m-0 group-data-[collapsible=icon]:border-0" style={{ borderColor: theme === 'dark' ? '#2b2b2b' : '#d8d8d8' }}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs bg-white dark:bg-card border-none">v1.0.0</Badge>
        </div>
      </SidebarFooter>

      {/* Create New Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className={cn("max-w-md", isMobile && "w-[calc(100vw-2rem)]")}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your documentation and content sources.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., Marketing Docs"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Describe this project..."
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="mt-1"
                rows={3}
                required
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewProjectName("");
                  setNewProjectDescription("");
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View All Projects Dialog */}
      <Dialog open={showAllProjects} onOpenChange={setShowAllProjects}>
        <DialogContent className={cn("max-w-2xl max-h-[85vh] flex flex-col", isMobile && "w-[calc(100vw-2rem)] max-h-[90vh]")}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              All Projects ({projects.length})
            </DialogTitle>
            <DialogDescription>
              Manage and switch between all your projects.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
            {sortedProjects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "group flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors",
                  selectedProject.id === project.id
                    ? "bg-accent border-primary"
                    : "border-border hover:bg-accent"
                )}
              >
                <div
                  onClick={() => handleProjectSelect(project)}
                  className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                >
                  <Folder className={cn(
                    "h-5 w-5 flex-shrink-0",
                    selectedProject.id === project.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {project.name}
                      {selectedProject.id === project.id && (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {project.description}
                    </div>
                  </div>
                  {selectedProject.id === project.id && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                  )}
                </div>
                {!project.isActive && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                    }}
                    className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="pt-3 mt-2 border-t">
            <Button
              type="button"
              onClick={() => {
                setShowAllProjects(false);
                setShowCreateDialog(true);
              }}
              className={cn(
                "w-full justify-start gap-3 p-3 rounded-lg border transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90 border-primary text-left",
                "sm:w-auto sm:justify-center sm:px-4 sm:py-2 sm:rounded-md",
                isMobile && "h-auto"
              )}
            >
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span>Create New Project</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent className={cn(isMobile && "w-[calc(100vw-2rem)]")}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (projectToDelete) {
                  handleDeleteProject(projectToDelete);
                }
              }}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
});

export default AppSidebar;
