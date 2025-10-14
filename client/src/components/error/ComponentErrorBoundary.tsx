import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { errorReportingService } from '@/services/errorReporting';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetryButton?: boolean;
  showDismissButton?: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  isDismissed: boolean;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isDismissed: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `component-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isDismissed: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ComponentErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to service
    errorReportingService.reportError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      level: 'component',
      errorId: this.state.errorId,
      metadata: {
        componentName: this.props.componentName,
        size: this.props.size,
      },
    });
  }

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

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isDismissed: false,
    });
  };

  handleDismiss = () => {
    this.setState({ isDismissed: true });
  };

  render() {
    const { hasError, error, errorId, isDismissed } = this.state;
    const { children, fallback, componentName, showRetryButton = true, showDismissButton = true, size = 'medium' } = this.props;

    if (hasError && !isDismissed) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';

      // Render different sizes
      if (size === 'small') {
        return (
          <div className="p-2 border border-red-200 dark:border-red-800 rounded bg-red-50 dark:bg-red-950">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-800 dark:text-red-200 flex-1">
                {componentName || 'Component'} error
              </span>
              {showRetryButton && (
                <Button
                  onClick={this.handleRetry}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
              {showDismissButton && (
                <Button
                  onClick={this.handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            {isDevelopment && (
              <div className="mt-2 text-xs text-red-500 dark:text-red-400">
                <strong>ID:</strong> {errorId}
                <br />
                <strong>Error:</strong> {error?.message}
              </div>
            )}
          </div>
        );
      }

      if (size === 'large') {
        return (
          <div className="p-6 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  {componentName || 'Component'} Error
                </h3>
                <p className="text-red-600 dark:text-red-400 mt-2">
                  This component encountered an error and couldn't render properly.
                </p>
                <div className="mt-4 flex gap-3">
                  {showRetryButton && (
                    <Button
                      onClick={this.handleRetry}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  )}
                  {showDismissButton && (
                    <Button
                      onClick={this.handleDismiss}
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                  )}
                </div>
                {isDevelopment && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div><strong>Error ID:</strong> {errorId}</div>
                        <div><strong>Error:</strong> {error?.message}</div>
                        {error?.stack && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-medium">Stack Trace</summary>
                            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Medium size (default)
      return (
        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {componentName || 'Component'} Error
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                This component encountered an error and couldn't render properly.
              </p>
              <div className="mt-3 flex gap-2">
                {showRetryButton && (
                  <Button
                    onClick={this.handleRetry}
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                )}
                {showDismissButton && (
                  <Button
                    onClick={this.handleDismiss}
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Dismiss
                  </Button>
                )}
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
    }

    if (isDismissed) {
      return (
        <div className="p-2 text-center text-gray-500 dark:text-gray-400 text-sm">
          Component error dismissed
        </div>
      );
    }

    return children;
  }
}

export default ComponentErrorBoundary;
