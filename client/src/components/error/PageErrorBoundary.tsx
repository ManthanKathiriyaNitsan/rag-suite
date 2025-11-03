import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { errorReportingService } from '@/services/errorReporting';

interface Props {
  children: ReactNode;
  pageName?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
  showBackButton?: boolean;
  customMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

export class PageErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `page-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 PageErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

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
      level: 'page',
      errorId: this.state.errorId,
      metadata: {
        pageName: this.props.pageName,
        retryCount: this.state.retryCount,
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
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        retryCount: prevState.retryCount + 1,
      }));

      // Call custom retry handler if provided
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    const { hasError, error, errorId, retryCount } = this.state;
    const { children, pageName, showRetryButton = true, showBackButton = true, customMessage } = this.props;

    if (hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const canRetry = retryCount < this.maxRetries;

      return (
        <div className="min-h-[500px] flex items-center justify-center p-8">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-xl text-orange-800 dark:text-orange-200">
                {customMessage || `${pageName ? pageName + ' ' : ''}Page Error`}
              </CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-400">
                {customMessage 
                  ? 'An unexpected error occurred on this page.'
                  : `Something went wrong while loading the ${pageName || 'page'}. Please try again or go back to the previous page.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {showRetryButton && canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="hover:!bg-primary"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again {retryCount > 0 && `(${this.maxRetries - retryCount} attempts left)`}
                  </Button>
                )}
                
                {showBackButton && (
                  <Button
                    onClick={this.handleGoBack}
                    variant="outline"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                )}
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>

              {!canRetry && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    Maximum retry attempts reached. Please refresh the page or contact support.
                  </AlertDescription>
                </Alert>
              )}

              {isDevelopment && (
                <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <div className="space-y-2">
                      <div><strong>Error ID:</strong> {errorId}</div>
                      <div><strong>Error:</strong> {error?.message}</div>
                      <div><strong>Retry Count:</strong> {retryCount}/{this.maxRetries}</div>
                      {error?.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-300">Stack Trace</summary>
                          <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900 p-2 rounded overflow-auto text-red-900 dark:text-red-100">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default PageErrorBoundary;
