import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentAPI, Document, DocumentMetadata, DocumentContent, UploadResponse } from '@/lib/api';

// 📄 Documents hook - Get all documents
export const useDocuments = () => {
  const queryClient = useQueryClient();

  // Get all documents
  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: documentAPI.getDocuments,
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });

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
  const statsQuery = useQuery({
    queryKey: ['document-stats'],
    queryFn: async () => {
      // This would be a separate endpoint for statistics
      // For now, we'll calculate from documents data
      const documents = await documentAPI.getDocuments();
      return {
        totalDocuments: documents.length,
        indexedDocuments: documents.filter((doc: Document) => doc.status === 'indexed').length,
        processingDocuments: documents.filter((doc: Document) => doc.status === 'processing').length,
        failedDocuments: documents.filter((doc: Document) => doc.status === 'failed').length,
        totalSize: documents.reduce((sum: number, doc: Document) => sum + doc.fileSize, 0),
        byCategory: documents.reduce((acc: Record<string, number>, doc: Document) => {
          const category = doc.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {}),
        byType: documents.reduce((acc: Record<string, number>, doc: Document) => {
          acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
          return acc;
        }, {}),
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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
        doc.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        doc.author?.toLowerCase().includes(query.toLowerCase())
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
