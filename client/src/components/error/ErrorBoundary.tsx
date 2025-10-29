import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/Alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service (e.g., Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);

    // Auto-reset after 30 seconds for non-critical errors
    if (this.props.level !== 'critical') {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary();
      }, 30000);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (prevProps.resetKeys && resetKeys) {
        const hasResetKeyChanged = prevProps.resetKeys.some((key, index) => 
          key !== resetKeys[index]
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }

    // Reset error boundary when props change (if enabled)
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Enhanced error logging
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      level: this.props.level || 'component',
      errorId: this.state.errorId,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // Send to external error reporting service
    try {
      // Example: Send to your error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData),
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app-errors') || '[]');
      existingErrors.push({
        ...errorData,
        id: this.state.errorId,
      });
      
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('app-errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      console.error('Failed to store error in localStorage:', storageError);
    }
  };

  private getCurrentUserId = (): string | null => {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData).id : null;
    } catch {
      return null;
    }
  };

  private getSessionId = (): string => {
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

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  render() {
    const { hasError, error, errorId } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Render appropriate error UI based on level
      return this.renderErrorUI(error, errorId, level);
    }

    return children;
  }

  private renderErrorUI = (error: Error | null, errorId: string, level: string) => {
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (level === 'critical') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950">
          <Card className="w-full max-w-md mx-4 border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-800 dark:text-red-200">
                Critical Application Error
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                A critical error has occurred. Please refresh the page or contact support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Application
                </Button>
              </div>
              {isDevelopment && (
                <Alert className="mt-4">
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error ID:</strong> {errorId}
                    <br />
                    <strong>Error:</strong> {error?.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (level === 'page') {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-orange-800 dark:text-orange-200">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-400">
                This page encountered an error. You can try refreshing or go back to the home page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={this.resetErrorBoundary}
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
              {isDevelopment && (
                <Alert className="mt-4">
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error ID:</strong> {errorId}
                    <br />
                    <strong>Error:</strong> {error?.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // Component level error
    return (
      <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Component Error
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              This component encountered an error and couldn't render properly.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={this.resetErrorBoundary}
                size="sm"
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
            {isDevelopment && (
              <div className="mt-3 text-xs text-red-500 dark:text-red-400">
                <strong>Error ID:</strong> {errorId}
                <br />
                <strong>Error:</strong> {error?.message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
}

export default ErrorBoundary;
