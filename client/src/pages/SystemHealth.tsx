import React, { useMemo } from "react";
import { Activity, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const SystemHealth = React.memo(function SystemHealth() {
  const { systemHealth, isLoading, isError, error, refetch } = useSystemHealth();
  const { locale } = useI18n();

  // Convert services object to array
  const services = useMemo(() => {
    if (!systemHealth?.services) return [];
    return Object.entries(systemHealth.services).map(([name, health]) => ({
      name,
      ...health,
    }));
  }, [systemHealth]);

  // Get status color variant
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "healthy" || statusLower === "ok") {
      return "default";
    }
    if (statusLower === "degraded" || statusLower === "warning") {
      return "secondary";
    }
    if (statusLower === "down" || statusLower === "error" || statusLower === "critical") {
      return "destructive";
    }
    return "secondary";
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "healthy" || statusLower === "ok") {
      return <CheckCircle2 className="h-4 w-4" />;
    }
    if (statusLower === "degraded" || statusLower === "warning") {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (statusLower === "down" || statusLower === "error" || statusLower === "critical") {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  // Format last heartbeat
  const formatLastHeartbeat = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.floor(seconds)}s ago`;
    }
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ago`;
    }
    if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)}h ago`;
    }
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Format predicted failure
  const formatPredictedFailure = (minutes: number) => {
    if (minutes === 0) return "N/A";
    if (minutes < 60) {
      return `~${Math.floor(minutes)}m`;
    }
    if (minutes < 1440) {
      return `~${Math.floor(minutes / 60)}h`;
    }
    return `~${Math.floor(minutes / 1440)}d`;
  };

  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 p-0 sm:p-6" style={{ maxWidth: '93vw' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7" />
              System Health
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor the status and performance of system services
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Overall Health Summary */}
        {systemHealth && (
          <GlassCard>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Overall System Health
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Last updated: {formatTimestamp(systemHealth.timestamp)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      <span className={getHealthScoreColor(systemHealth.overall_health_score)}>
                        {systemHealth.overall_health_score.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-lg">/100</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Health Score</div>
                  </div>
                  <Badge variant={getStatusColor(systemHealth.overall_status)} className="text-sm px-3 py-1">
                    <span className="flex items-center gap-1.5">
                      {getStatusIcon(systemHealth.overall_status)}
                      {systemHealth.overall_status}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress 
                value={systemHealth.overall_health_score} 
                className="h-2"
              />
            </CardContent>
          </GlassCard>
        )}

        {/* Error State */}
        {isError && (
          <GlassCard>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to Load System Health</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : "An unknown error occurred"}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </GlassCard>
        )}

        {/* Loading State */}
        {isLoading && !systemHealth && (
          <GlassCard>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading system health data...</p>
              </div>
            </CardContent>
          </GlassCard>
        )}

        {/* Services Grid */}
        {systemHealth && services.length > 0 && (
          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Service Status
              </CardTitle>
              <CardDescription>
                Individual service health metrics and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                  <GlassCard
                    key={index}
                    data-testid={`service-card-${index}`}
                    noHover={true}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <Badge variant={getStatusColor(service.status)} className="flex items-center gap-1">
                          {getStatusIcon(service.status)}
                          {service.status}
                        </Badge>
                      </div>
                      {/* Health Score Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Health Score</span>
                          <span className={cn("font-medium", getHealthScoreColor(service.health_score))}>
                            {service.health_score.toFixed(1)}/100
                          </span>
                        </div>
                        <Progress value={service.health_score} className="h-1.5" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{service.uptime_percent.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Heartbeat</span>
                        <span className="font-medium">{formatLastHeartbeat(service.last_heartbeat_seconds)}</span>
                      </div>
                      {service.predicted_failure_minutes > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Predicted Failure</span>
                          <span className="font-medium text-yellow-600 dark:text-yellow-400">
                            {formatPredictedFailure(service.predicted_failure_minutes)}
                          </span>
                        </div>
                      )}
                      {service.reason && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground mb-1">Reason</div>
                          <div className="text-sm font-medium">{service.reason}</div>
                        </div>
                      )}
                    </CardContent>
                  </GlassCard>
                ))}
              </div>
            </CardContent>
          </GlassCard>
        )}

        {/* Health Legend */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Health Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Healthy
                </Badge>
                <span className="text-muted-foreground">Service operating normally</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Degraded
                </Badge>
                <span className="text-muted-foreground">Service experiencing issues</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Down
                </Badge>
                <span className="text-muted-foreground">Service unavailable</span>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    </div>
  );
});

export default SystemHealth;
