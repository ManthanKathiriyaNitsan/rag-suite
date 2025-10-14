interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string | null;
  sessionId: string;
  level: 'critical' | 'page' | 'component';
  errorId: string;
  metadata?: Record<string, any>;
}

class ErrorReportingService {
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Process queued errors on page load
    this.processErrorQueue();
  }

  async reportError(errorReport: ErrorReport): Promise<void> {
    try {
      // Add to queue for offline handling
      this.errorQueue.push(errorReport);

      // Try to send immediately if online
      if (this.isOnline) {
        await this.sendErrorReport(errorReport);
        // Remove from queue if successfully sent
        this.errorQueue = this.errorQueue.filter(
          (queued) => queued.errorId !== errorReport.errorId
        );
      }

      // Store in localStorage for persistence
      this.storeErrorLocally(errorReport);
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  }

  private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
    try {
      // In a real application, you would send this to your error reporting service
      // Examples: Sentry, LogRocket, Bugsnag, or your own backend
      
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Error reported successfully:', errorReport.errorId);
    } catch (error) {
      console.error('❌ Failed to send error report:', error);
      throw error;
    }
  }

  private async processErrorQueue(): Promise<void> {
    if (!this.isOnline || this.errorQueue.length === 0) {
      return;
    }

    const errorsToProcess = [...this.errorQueue];
    this.errorQueue = [];

    for (const errorReport of errorsToProcess) {
      try {
        await this.sendErrorReport(errorReport);
      } catch (error) {
        // Re-add to queue if sending failed
        this.errorQueue.push(errorReport);
      }
    }
  }

  private storeErrorLocally(errorReport: ErrorReport): void {
    try {
      const existingErrors = this.getStoredErrors();
      existingErrors.push(errorReport);
      
      // Keep only last 50 errors
      const recentErrors = existingErrors.slice(-50);
      
      localStorage.setItem('app-errors', JSON.stringify(recentErrors));
    } catch (error) {
      console.error('Failed to store error locally:', error);
    }
  }

  getStoredErrors(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('app-errors') || '[]');
    } catch {
      return [];
    }
  }

  clearStoredErrors(): void {
    try {
      localStorage.removeItem('app-errors');
    } catch (error) {
      console.error('Failed to clear stored errors:', error);
    }
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byLevel: Record<string, number>;
    recent: number; // Last 24 hours
  } {
    const errors = this.getStoredErrors();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const stats = {
      total: errors.length,
      byLevel: {} as Record<string, number>,
      recent: 0,
    };

    errors.forEach((error) => {
      // Count by level
      stats.byLevel[error.level] = (stats.byLevel[error.level] || 0) + 1;

      // Count recent errors
      const errorTime = new Date(error.timestamp).getTime();
      if (errorTime > oneDayAgo) {
        stats.recent++;
      }
    });

    return stats;
  }
}

// Create singleton instance
export const errorReportingService = new ErrorReportingService();

// Export types
export type { ErrorReport };
