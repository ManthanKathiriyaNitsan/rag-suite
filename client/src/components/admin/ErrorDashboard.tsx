import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { errorReportingService, ErrorReport } from '@/services/errorReporting';

interface ErrorStats {
  total: number;
  byLevel: Record<string, number>;
  recent: number;
}

export default function ErrorDashboard() {
  const [errorStats, setErrorStats] = useState<ErrorStats>({ total: 0, byLevel: {}, recent: 0 });
  const [recentErrors, setRecentErrors] = useState<ErrorReport[]>([]);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadErrorData();
  }, []);

  const loadErrorData = () => {
    setIsLoading(true);
    try {
      const stats = errorReportingService.getErrorStats();
      const errors = errorReportingService.getStoredErrors();
      
      setErrorStats(stats);
      setRecentErrors(errors.slice(-20).reverse()); // Show 20 most recent errors
    } catch (error) {
      console.error('Failed to load error data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllErrors = () => {
    if (window.confirm('Are you sure you want to clear all stored errors? This action cannot be undone.')) {
      errorReportingService.clearStoredErrors();
      loadErrorData();
    }
  };

  const exportErrors = () => {
    try {
      const errors = errorReportingService.getStoredErrors();
      const dataStr = JSON.stringify(errors, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `error-reports-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export errors:', error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'page': return 'secondary';
      case 'component': return 'outline';
      default: return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading error data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage application errors
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadErrorData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportErrors} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={clearAllErrors} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{errorStats.recent}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {errorStats.byLevel.critical || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Level Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Error Levels</CardTitle>
          <CardDescription>
            Breakdown of errors by severity level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(errorStats.byLevel).map(([level, count]) => (
              <Badge key={level} variant={getLevelColor(level)}>
                {level}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
          <CardDescription>
            Latest errors reported by the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentErrors.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No errors have been reported yet. Great job! 🎉
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {recentErrors.map((error) => (
                  <div
                    key={error.errorId}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedError(error)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getLevelColor(error.level)}>
                          {error.level}
                        </Badge>
                        <span className="text-sm font-mono">{error.errorId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(error.timestamp)}
                        </span>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-red-600 mb-1">
                      {error.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {error.url}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Error Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedError(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Error Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {selectedError.errorId}</div>
                  <div><strong>Level:</strong> <Badge variant={getLevelColor(selectedError.level)}>{selectedError.level}</Badge></div>
                  <div><strong>Message:</strong> {selectedError.message}</div>
                  <div><strong>Timestamp:</strong> {formatTimestamp(selectedError.timestamp)}</div>
                  <div><strong>URL:</strong> {selectedError.url}</div>
                  <div><strong>User ID:</strong> {selectedError.userId || 'Anonymous'}</div>
                  <div><strong>Session ID:</strong> {selectedError.sessionId}</div>
                </div>
              </div>

              {selectedError.stack && (
                <div>
                  <h4 className="font-medium mb-2">Stack Trace</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {selectedError.stack}
                  </pre>
                </div>
              )}

              {selectedError.componentStack && (
                <div>
                  <h4 className="font-medium mb-2">Component Stack</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {selectedError.componentStack}
                  </pre>
                </div>
              )}

              {selectedError.metadata && (
                <div>
                  <h4 className="font-medium mb-2">Metadata</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedError.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
