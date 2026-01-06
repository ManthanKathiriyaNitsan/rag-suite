import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback, useEffect } from 'react';
import { documentAPI, Document, DocumentMetadata, DocumentContent, UploadResponse } from '@/services/api/api';

// 📄 Documents hook - Get all documents
export const useDocuments = () => {
  const queryClient = useQueryClient();

  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  // Get all documents
  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: documentAPI.getDocuments,
    staleTime: 60000, // 60 seconds
    refetchInterval: hasCORBError ? false : 60000, // Refetch every 60 seconds (reduced from 10s), disabled on CORB errors
    refetchOnWindowFocus: false, // Disabled to prevent excessive requests
    retry: 1, // Only retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (documentsQuery.error) {
      const error: any = documentsQuery.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [documentsQuery.error]);

  // Upload document
  const uploadDocumentMutation = useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata?: DocumentMetadata }) =>
      documentAPI.uploadDocument(file, metadata),
    
    onSuccess: (data: UploadResponse) => {
      console.log('✅ Document uploaded successfully:', data);
      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    
    onError: (error) => {
      console.error('❌ Upload document failed:', error);
    },
  });

  // Update document
  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, metadata }: { id: string; metadata: DocumentMetadata }) =>
      documentAPI.updateDocument(id, metadata),
    
    onSuccess: () => {
      console.log('✅ Document updated successfully');
      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    
    onError: (error) => {
      console.error('❌ Update document failed:', error);
    },
  });

  // Delete document
  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => documentAPI.deleteDocument(id),
    
    onSuccess: () => {
      console.log('✅ Document deleted successfully');
      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    
    onError: (error) => {
      console.error('❌ Delete document failed:', error);
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    refetch: documentsQuery.refetch,
    
    // Upload
    uploadDocument: uploadDocumentMutation.mutate,
    uploadDocumentAsync: uploadDocumentMutation.mutateAsync,
    isUploading: uploadDocumentMutation.isPending,
    uploadError: uploadDocumentMutation.error,
    uploadData: uploadDocumentMutation.data,
    
    // Update
    updateDocument: updateDocumentMutation.mutate,
    updateDocumentAsync: updateDocumentMutation.mutateAsync,
    isUpdating: updateDocumentMutation.isPending,
    updateError: updateDocumentMutation.error,
    
    // Delete
    deleteDocument: deleteDocumentMutation.mutate,
    deleteDocumentAsync: deleteDocumentMutation.mutateAsync,
    isDeleting: deleteDocumentMutation.isPending,
    deleteError: deleteDocumentMutation.error,
  };
};

// 📄 Document content hook - Get document content
export const useDocumentContent = (id: string) => {
  const contentQuery = useQuery({
    queryKey: ['document-content', id],
    queryFn: () => documentAPI.getDocumentContent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    content: contentQuery.data,
    isLoading: contentQuery.isLoading,
    error: contentQuery.error,
    refetch: contentQuery.refetch,
  };
};

// 📄 Document statistics hook - Get document statistics
export const useDocumentStats = () => {
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  const statsQuery = useQuery({
    queryKey: ['document-stats'],
    queryFn: async () => {
      // This would be a separate endpoint for statistics
      // For now, we'll calculate from documents data
      const documents = await documentAPI.getDocuments();
      
      // 📊 Memoized expensive calculations
      const indexedDocs = documents.filter((doc: Document) => doc.status === 'indexed');
      const processingDocs = documents.filter((doc: Document) => doc.status === 'processing');
      const failedDocs = documents.filter((doc: Document) => doc.status === 'failed');
      const totalSize = documents.reduce((sum: number, doc: Document) => sum + parseInt(doc.size || '0', 10), 0);
      
      const byCategory = documents.reduce((acc: Record<string, number>, doc: Document) => {
        const category = doc.type || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      
      const byType = documents.reduce((acc: Record<string, number>, doc: Document) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {});
      
      return {
        totalDocuments: documents.length,
        indexedDocuments: indexedDocs.length,
        processingDocuments: processingDocs.length,
        failedDocuments: failedDocs.length,
        totalSize,
        byCategory,
        byType,
      };
    },
    staleTime: 120000, // 2 minutes
    refetchInterval: hasCORBError ? false : 120000, // Refetch every 2 minutes (reduced from 30s), disabled on CORB errors
    refetchOnWindowFocus: false, // Disabled to prevent excessive requests
    retry: 1, // Only retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (statsQuery.error) {
      const error: any = statsQuery.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [statsQuery.error]);

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

// 📄 Document search hook - Search documents
export const useDocumentSearch = (query: string) => {
  const searchQuery = useQuery({
    queryKey: ['document-search', query],
    queryFn: async () => {
      // This would be a separate search endpoint
      // For now, we'll filter the documents list
      const documents = await documentAPI.getDocuments();
      if (!query) return documents;
      
      return documents.filter((doc: Document) =>
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.description?.toLowerCase().includes(query.toLowerCase()) ||
        doc.type?.toLowerCase().includes(query.toLowerCase()) ||
        doc.source?.toLowerCase().includes(query.toLowerCase())
      );
    },
    enabled: !!query,
    staleTime: 30000, // 30 seconds
  });

  return {
    searchResults: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    error: searchQuery.error,
    refetch: searchQuery.refetch,
  };
};
