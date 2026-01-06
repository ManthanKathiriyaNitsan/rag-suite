import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { 
  projectAPI, 
  Project, 
  ProjectsResponse, 
  CreateProjectPayload, 
  UpdateProjectPayload 
} from '@/services/api/api';

// 📁 Projects hook - Get all projects
export const useProjects = () => {
  const queryClient = useQueryClient();

  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  // Get all projects
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectAPI.getProjects,
    staleTime: 60000, // 60 seconds
    refetchInterval: hasCORBError ? false : 60000, // Refetch every 60 seconds (reduced from 10s), disabled on CORB errors
    refetchOnWindowFocus: false, // Disabled to prevent excessive requests
    retry: 1, // Only retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (projectsQuery.error) {
      const error: any = projectsQuery.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [projectsQuery.error]);

  // Create project
  const createProjectMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectAPI.createProject(payload),
    
    onSuccess: () => {
      console.log('✅ Project created successfully');
      // Refresh projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    
    onError: (error) => {
      console.error('❌ Create project failed:', error);
    },
  });

  // Update project
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      projectAPI.updateProject(id, payload),
    
    onSuccess: () => {
      console.log('✅ Project updated successfully');
      // Refresh projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    
    onError: (error) => {
      console.error('❌ Update project failed:', error);
    },
  });

  // Delete project
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectAPI.deleteProject(id),
    
    onSuccess: () => {
      console.log('✅ Project deleted successfully');
      // Refresh projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    
    onError: (error) => {
      console.error('❌ Delete project failed:', error);
    },
  });

  // Activate project
  const activateProjectMutation = useMutation({
    mutationFn: (id: string) => projectAPI.activateProject(id),
    
    onSuccess: () => {
      console.log('✅ Project activated successfully');
      // Refresh projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    
    onError: (error) => {
      console.error('❌ Activate project failed:', error);
    },
  });

  return {
    // Query data
    projects: projectsQuery.data?.projects || [],
    total: projectsQuery.data?.total || 0,
    activeProjectId: projectsQuery.data?.active_project_id || '',
    isLoading: projectsQuery.isLoading,
    isRefetching: projectsQuery.isRefetching,
    error: projectsQuery.error,
    refetch: projectsQuery.refetch,
    
    // Create
    createProject: createProjectMutation.mutate,
    createProjectAsync: createProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    createError: createProjectMutation.error,
    
    // Update
    updateProject: updateProjectMutation.mutate,
    updateProjectAsync: updateProjectMutation.mutateAsync,
    isUpdating: updateProjectMutation.isPending,
    updateError: updateProjectMutation.error,
    
    // Delete
    deleteProject: deleteProjectMutation.mutate,
    deleteProjectAsync: deleteProjectMutation.mutateAsync,
    isDeleting: deleteProjectMutation.isPending,
    deleteError: deleteProjectMutation.error,
    
    // Activate
    activateProject: activateProjectMutation.mutate,
    activateProjectAsync: activateProjectMutation.mutateAsync,
    isActivating: activateProjectMutation.isPending,
    activateError: activateProjectMutation.error,
  };
};

// 📁 Single project hook - Get single project
export const useProject = (projectId: string) => {
  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectAPI.getProject(projectId),
    enabled: !!projectId, // Only fetch if projectId is provided
    staleTime: 30000,
  });

  return {
    project: projectQuery.data,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error,
    refetch: projectQuery.refetch,
  };
};

