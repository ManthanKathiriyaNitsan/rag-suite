import { useCallback } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any | null;
}

interface UseErrorBoundaryReturn {
  captureError: (error: Error, errorInfo?: any) => void;
  resetError: () => void;
  errorState: ErrorBoundaryState;
}

export function useErrorBoundary(): UseErrorBoundaryReturn {
  const captureError = useCallback((error: Error, errorInfo?: any) => {
    // Log error details
    console.error('🚨 useErrorBoundary captured error:', error, errorInfo);
    
    // Log to external service
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: getCurrentUserId(),
        sessionId: getSessionId(),
      };

      // Send to error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData),
      // });

      // Store in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('app-errors') || '[]');
      existingErrors.push(errorData);
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('app-errors', JSON.stringify(recentErrors));
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }, []);

  const resetError = useCallback(() => {
    // Reset error state
    console.log('🔄 Error boundary reset');
  }, []);

  const getCurrentUserId = (): string | null => {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData).id : null;
    } catch {
      return null;
    }
  };

  const getSessionId = (): string => {
    try {
      let sessionId = sessionStorage.getItem('session-id');
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('session-id', sessionId);
      }
      return sessionId;
    } catch {
      return `session-${Date.now()}`;
    }
  };

  return {
    captureError,
    resetError,
    errorState: {
      hasError: false,
      error: null,
      errorInfo: null,
    },
  };
}

// Hook for catching errors in async operations
export function useAsyncError() {
  const { captureError } = useErrorBoundary();
  
  const throwError = useCallback((error: Error) => {
    captureError(error);
    throw error;
  }, [captureError]);

  return throwError;
}
