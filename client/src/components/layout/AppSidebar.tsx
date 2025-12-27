import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  Bot,
  Database,
  FileText,
  Home,
  MessageSquare,
  Search,
  Sliders,
  Puzzle,
  ChevronDown,
  Check,
  Plus,
  Folder,
  List,
  X,
  Trash2,
  Loader2,
  MessageCircle,
  BotIcon,
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
import { useProjects } from "@/hooks/useProjects";
import { Project as APIProject } from "@/services/api/api";
import { useQueryClient } from "@tanstack/react-query";

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
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  // Temporarily hidden
  // {
  //   title: "Feedback",
  //   url: "/feedback",
  //   icon: MessageSquare,
  // },
  // {
  //   title: "Integrations",
  //   url: "/integrations",
  //   icon: Puzzle,
  // },
  {
    title: "Chatbot Configuration",
    url: "/chatbot-configuration",
    icon: BotIcon,
  },
  {
    title: "Search Configuration",
    url: "/search-configuration",
    icon: MessageCircle,
  },
];

const settingsItems = [
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

// Local interface for sidebar compatibility
interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
}

const AppSidebar = React.memo(function AppSidebar() {
  const [location, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<APIProject | null>(null);
  const { orgName, logoDataUrl } = useBranding();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use projects hook
  const {
    projects: apiProjects,
    activeProjectId,
    isLoading: projectsLoading,
    createProjectAsync,
    isCreating,
    deleteProjectAsync,
    isDeleting,
    activateProjectAsync,
  } = useProjects();

  // Convert API projects to local format and find selected project
  // Filter out default/predefined projects like "Main Project" or "Default project"
  const projects = useMemo(() => {
    const defaultProjectNames = ['Main Project', 'Default project', 'Default Project', 'main project', 'default project'];
    return apiProjects
      .filter((p: APIProject) => {
        const projectNameLower = p.name.toLowerCase().trim();
        return !defaultProjectNames.some(defaultName => defaultName.toLowerCase() === projectNameLower);
      })
      .map((p: APIProject) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        isActive: p.id === activeProjectId,
        createdAt: p.created_at,
      }));
  }, [apiProjects, activeProjectId]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.isActive) || projects[0] || null;
  }, [projects]);

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
  const handleProjectSelect = useCallback(async (project: Project) => {
    try {
      await activateProjectAsync(project.id);
      
      // Invalidate all queries to refresh all data
      await queryClient.invalidateQueries();
      
      toast({
        title: "Project Switched",
        description: `Switched to "${project.name}". Refreshing...`,
      });
      
      // Reload the page to refresh the entire application
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to show the toast message
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to switch project. Please try again.",
        variant: "destructive",
      });
    }
  }, [activateProjectAsync, toast, queryClient]);

  // Handle create new project
  const handleCreateProject = useCallback(async (e: React.FormEvent) => {
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

    try {
      await createProjectAsync({
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      });
    
    // Reset form
    setNewProjectName("");
    setNewProjectDescription("");
    setShowCreateDialog(false);
    
    toast({
      title: "Project Created",
        description: `"${newProjectName.trim()}" has been created successfully`,
    });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  }, [newProjectName, newProjectDescription, createProjectAsync, toast]);

  // Handle view all projects - navigate to projects page
  const handleViewAllProjects = useCallback(() => {
    setLocation("/projects");
  }, [setLocation]);

  // Handle delete project
  const handleDeleteProject = useCallback(async (project: APIProject) => {
    // Prevent deleting the active project
    if (project.id === activeProjectId) {
      toast({
        title: "Cannot Delete Active Project",
        description: "Please switch to another project before deleting this one.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteProjectAsync(project.id);
    setProjectToDelete(null);
    
    toast({
      title: "Project Deleted",
      description: `"${project.name}" has been deleted successfully`,
    });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeProjectId, deleteProjectAsync, toast]);

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
              disabled={projectsLoading || !selectedProject}
            >
              <div className="flex items-center gap-3">
                <Folder className="h-4 w-4 text-primary" />
                <div className="text-left">
                  {projectsLoading ? (
                    <>
                      <div className="font-medium text-sm">Loading...</div>
                      <div className="text-xs text-muted-foreground">Please wait</div>
                    </>
                  ) : selectedProject ? (
                    <>
                  <div className="font-medium text-sm">{selectedProject.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedProject.description}
                  </div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium text-sm">No Project</div>
                      <div className="text-xs text-muted-foreground">
                        Create a project to get started
                      </div>
                    </>
                  )}
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
            {projectsLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading projects...
                </div>
              </div>
            ) : top3Projects.length > 0 ? (
              top3Projects.map((project) => (
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
                  {selectedProject && selectedProject.id === project.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
              ))
            ) : (
              <div className="flex items-center justify-center p-4">
                <div className="text-sm text-muted-foreground text-center">
                  No projects found
                </div>
              </div>
            )}
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
                  'Chatbot Configuration': 'nav.chatbot-configuration',
                  'Search Configuration': 'nav.search-configuration',
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
