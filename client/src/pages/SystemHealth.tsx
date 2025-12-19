import React, { useMemo, useCallback } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";
import { GlassCard } from "@/components/ui/GlassCard";

const SystemHealth = React.memo(function SystemHealth() {
  // 📊 Memoized system services data
  const systemServices = useMemo(() => [
    { name: "API Gateway", status: "healthy", lastHeartbeat: new Date(Date.now() - 30 * 1000), uptime: "99.9%" },
    { name: "Redis Cache", status: "healthy", lastHeartbeat: new Date(Date.now() - 45 * 1000), uptime: "99.8%" },
    { name: "Vector Database", status: "degraded", lastHeartbeat: new Date(Date.now() - 2 * 60 * 1000), uptime: "98.5%" },
    { name: "PostgreSQL", status: "healthy", lastHeartbeat: new Date(Date.now() - 15 * 1000), uptime: "99.9%" },
    { name: "OpenAI API", status: "healthy", lastHeartbeat: new Date(Date.now() - 20 * 1000), uptime: "99.7%" },
  ], []);

  const { locale } = useI18n();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "default";
      case "degraded":
        return "secondary";
      case "down":
        return "destructive";
      default:
        return "secondary";
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
        </div>

        {/* System Health Content */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {systemServices.map((service, index) => (
                <GlassCard
                  key={index}
                  data-testid={`service-card-${index}`}
                  noHover={true}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <Badge variant={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Heartbeat</span>
                      <span className="font-medium">
                        {new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
                          Math.floor((service.lastHeartbeat.getTime() - Date.now()) / 1000),
                          "second"
                        )}
                      </span>
                    </div>
                  </CardContent>
                </GlassCard>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-[2px">
              <h4 className="font-medium mb-2">Health Legend</h4>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Healthy</Badge>
                  <span className="text-muted-foreground">Service operating normally</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Degraded</Badge>
                  <span className="text-muted-foreground">Service experiencing issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Down</Badge>
                  <span className="text-muted-foreground">Service unavailable</span>
                </div>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    </div>
  );
});

export default SystemHealth;

