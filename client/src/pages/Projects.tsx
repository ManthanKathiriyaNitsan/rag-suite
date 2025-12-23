import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Search, Plus, Trash2, Edit, Check, Folder, X, Calendar, Loader2, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/contexts/I18nContext";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/services/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export default function Projects() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Use projects hook
  const {
    projects,
    total,
    activeProjectId,
    isLoading,
    isRefetching,
    error,
    refetch,
    createProjectAsync,
    isCreating,
    updateProjectAsync,
    isUpdating,
    deleteProjectAsync,
    isDeleting,
    activateProjectAsync,
    isActivating,
  } = useProjects();

  // Memoized filtered and sorted projects
  const filteredProjects = useMemo(() => {
    // Filter out default/predefined projects like "Main Project" or "Default project"
    const defaultProjectNames = ['Main Project', 'Default project', 'Default Project', 'main project', 'default project'];
    let filtered = projects.filter(project => {
      const projectNameLower = project.name.toLowerCase().trim();
      return !defaultProjectNames.some(defaultName => defaultName.toLowerCase() === projectNameLower);
    });

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => {
        if (statusFilter === "active") return project.is_active;
        if (statusFilter === "inactive") return !project.is_active;
        return true;
      });
    }

    // Apply sorting (keep projects in their original order, don't move active to top)
    filtered.sort((a, b) => {
      // Apply selected sort only
      if (sortBy === "newest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === "oldest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      } else if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return filtered;
  }, [projects, searchQuery, statusFilter, sortBy]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || sortBy !== "newest";

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("newest");
  }, []);

  // Handle project activation/switch
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

  // Handle edit project
  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description);
    setShowCreateDialog(true);
  }, []);

  // Handle update project
  const handleUpdateProject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProject) return;
    
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
      await updateProjectAsync({
        id: editingProject.id,
        payload: {
          name: newProjectName.trim(),
          description: newProjectDescription.trim(),
        },
      });
      
      setNewProjectName("");
      setNewProjectDescription("");
      setEditingProject(null);
      setShowCreateDialog(false);
      
      toast({
        title: "Project Updated",
        description: `"${newProjectName.trim()}" has been updated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  }, [editingProject, newProjectName, newProjectDescription, updateProjectAsync, toast]);

  // Handle delete project
  const handleDeleteProject = useCallback(async (project: Project) => {
    if (project.is_active) {
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
  }, [deleteProjectAsync, toast]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!showCreateDialog) {
      setEditingProject(null);
      setNewProjectName("");
      setNewProjectDescription("");
    }
  }, [showCreateDialog]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "short", 
        day: "numeric" 
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="relative">
      <div className="relative z-10 space-y-6 p-0 sm:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-0 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
            <p className="text-muted-foreground">
              Manage and switch between all your projects ({total} total)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              data-testid="button-refresh-projects"
            >
              <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
            </Button>
            <Button
              onClick={() => {
                setEditingProject(null);
                setNewProjectName("");
                setNewProjectDescription("");
                setShowCreateDialog(true);
              }}
              data-testid="button-create-project"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-0 md:items-center md:justify-between">
          <div className="flex items-center flex-wrap gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:flex-initial min-w-[200px]">
              <Search className="absolute -translate-y-[50%] top-[50%] left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
                data-testid="input-search-projects"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-sort-filter">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading projects...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive mb-2">Failed to load projects</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Projects List */}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <GlassCard>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredProjects.map((project) => {
                  const isActive = project.id === activeProjectId;
                  return (
                    <div
                      key={project.id}
                      className={cn(
                        "flex items-center justify-between p-4 hover-elevate cursor-pointer transition-all",
                        isActive && "bg-primary/10 border-l-4 border-l-primary"
                      )}
                      onClick={() => handleProjectSelect(project)}
                      data-testid={`row-project-${project.id}`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Folder className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium flex items-center gap-2">
                            {project.name}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created {formatDate(project.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isActive && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          data-testid={`button-edit-${project.id}`}
                          disabled={isUpdating}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project);
                            }}
                            data-testid={`button-delete-${project.id}`}
                            className="text-destructive hover:text-destructive"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </GlassCard>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredProjects.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "No projects found matching your filters" 
                  : "No projects found"}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Project Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Create New Project"}
              </DialogTitle>
              <DialogDescription>
                {editingProject 
                  ? "Update project details below."
                  : "Create a new project to organize your documentation and content sources."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="e.g., Marketing Docs"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  className="mt-1"
                  disabled={isCreating || isUpdating}
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
                  disabled={isCreating || isUpdating}
                />
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingProject(null);
                    setNewProjectName("");
                    setNewProjectDescription("");
                  }}
                  className="w-full sm:w-auto"
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingProject ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingProject ? "Update Project" : "Create Project"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Project Confirmation Dialog */}
        <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto" disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (projectToDelete) {
                    handleDeleteProject(projectToDelete);
                  }
                }}
                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
