/**
 * Analytics Service
 * Centralized analytics tracking and reporting
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      debug: false,
      batchSize: 10,
      flushInterval: 5000, // 5 seconds,
      ...config
    };

    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  // Track Events
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      userId: this.getUserId(),
      sessionId: this.getSessionId()
    };

    this.eventQueue.push(event);

    if (this.config.debug) {
      console.log('📊 Analytics Event:', event);
    }

    // Flush if batch size reached
    if (this.eventQueue.length >= (this.config.batchSize || 10)) {
      this.flush();
    }
  }

  // Page Views
  trackPageView(page: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      page,
      url: window.location.href,
      referrer: document.referrer,
      ...properties
    });
  }

  // User Actions
  trackUserAction(action: string, target?: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      target,
      ...properties
    });
  }

  // Performance Metrics
  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    this.track('performance', {
      metric,
      value,
      ...properties
    });
  }

  // Errors
  trackError(error: Error, properties?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...properties
    });
  }

  // Search Analytics
  trackSearch(query: string, results?: number, properties?: Record<string, any>): void {
    this.track('search', {
      query,
      results_count: results,
      ...properties
    });
  }

  // Integration Analytics
  trackIntegration(action: string, integrationType?: string, properties?: Record<string, any>): void {
    this.track('integration', {
      action,
      integration_type: integrationType,
      ...properties
    });
  }

  // Flush Events
  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.config.endpoint) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events })
      });

      if (!response.ok) {
        throw new Error(`Analytics flush failed: ${response.status}`);
      }

      if (this.config.debug) {
        console.log('📊 Analytics flushed:', events.length, 'events');
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  private getUserId(): string | undefined {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.id || parsed.userId;
      }
    } catch (error) {
      console.warn('Failed to get user ID for analytics:', error);
    }
    return undefined;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  // Configuration
  setConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.enabled === false) {
      this.stopFlushTimer();
    } else if (config.enabled === true && !this.flushTimer) {
      this.startFlushTimer();
    }
  }

  // Cleanup
  destroy(): void {
    this.stopFlushTimer();
    this.flush(); // Final flush
  }
}

export const analyticsService = new AnalyticsService();
