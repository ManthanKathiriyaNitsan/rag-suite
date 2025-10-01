import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatAPI, ChatResponse, ChatSession } from '@/lib/api';

// 💬 Chat hook for sending messages
export const useChat = () => {
  const queryClient = useQueryClient();

  // Send a chat message
  const sendMessageMutation = useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
      chatAPI.sendMessage(message, sessionId),
    
    onSuccess: (data: ChatResponse) => {
      console.log('✅ Chat message sent successfully:', data);
      // Refresh sessions after sending message
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
    
    onError: (error) => {
      console.error('❌ Chat message failed:', error);
    },
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    chatData: sendMessageMutation.data,
    chatError: sendMessageMutation.error,
  };
};

// 📋 Chat sessions hook
export const useChatSessions = () => {
  // Get all chat sessions
  const sessionsQuery = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: chatAPI.getSessions,
    staleTime: 30000, // 30 seconds
  });

  // Delete a session
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => chatAPI.deleteSession(sessionId),
    
    onSuccess: () => {
      console.log('✅ Session deleted successfully');
      // Refresh sessions after deletion
      sessionsQuery.refetch();
    },
    
    onError: (error) => {
      console.error('❌ Delete session failed:', error);
    },
  });

  return {
    sessions: sessionsQuery.data || [],
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,
    deleteSession: deleteSessionMutation.mutate,
    isDeleting: deleteSessionMutation.isPending,
    refetch: sessionsQuery.refetch,
  };
};

// 👍 Feedback hook
export const useChatFeedback = () => {
  const feedbackMutation = useMutation({
    mutationFn: ({ messageId, feedback }: { messageId: string; feedback: 'positive' | 'negative' }) =>
      chatAPI.submitFeedback(messageId, feedback),
    
    onSuccess: (data) => {
      console.log('✅ Feedback submitted successfully:', data);
    },
    
    onError: (error) => {
      console.error('❌ Feedback submission failed:', error);
    },
  });

  return {
    submitFeedback: feedbackMutation.mutate,
    isSubmitting: feedbackMutation.isPending,
    feedbackData: feedbackMutation.data,
    feedbackError: feedbackMutation.error,
  };
};
