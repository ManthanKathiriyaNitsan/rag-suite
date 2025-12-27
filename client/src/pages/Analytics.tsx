import React, { useState, useMemo, useCallback } from "react";
import { TrendingUp, Download, Clock, Users, ThumbsUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/I18nContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { 
  useAnalyticsDashboard, 
  useAnalyticsSourceCoverage, 
  useAnalyticsPopularQueries, 
  useAnalyticsHardQueries 
} from "@/hooks/useAnalytics";
import { analyticsAPI } from "@/services/api/api";
import { useToast } from "@/hooks/useToast";

const Analytics = React.memo(function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const { t } = useTranslation();
  const { toast } = useToast();

  // 📊 Fetch all analytics data
  const { data: dashboardData, isLoading: isLoadingDashboard, error: dashboardError } = useAnalyticsDashboard(timeRange);
  const { data: sourceCoverageData, isLoading: isLoadingSourceCoverage } = useAnalyticsSourceCoverage();
  const { data: popularQueriesData, isLoading: isLoadingPopularQueries } = useAnalyticsPopularQueries(timeRange);
  const { data: hardQueriesData, isLoading: isLoadingHardQueries } = useAnalyticsHardQueries(timeRange);

  // 📊 Memoized metrics from dashboard
  const metrics = useMemo(() => {
    const defaultMetrics = {
      totalQueries: 0,
      totalQueriesChange: 0,
      avgLatencyP95: 0,
      avgLatencyP95Change: 0,
      satisfactionRate: 0,
      satisfactionRateChange: 0,
      dailyAverage: 0,
    };
    
    if (!dashboardData?.metrics) return defaultMetrics;
    
    return {
      totalQueries: dashboardData.metrics.totalQueries ?? 0,
      totalQueriesChange: dashboardData.metrics.totalQueriesChange ?? 0,
      avgLatencyP95: dashboardData.metrics.avgLatencyP95 ?? 0,
      avgLatencyP95Change: dashboardData.metrics.avgLatencyP95Change ?? 0,
      satisfactionRate: dashboardData.metrics.satisfactionRate ?? 0,
      satisfactionRateChange: dashboardData.metrics.satisfactionRateChange ?? 0,
      dailyAverage: dashboardData.metrics.dailyAverage ?? 0,
    };
  }, [dashboardData]);

  // 📊 Memoized chart data from dashboard
  const dailyQueriesData = useMemo(() => {
    if (!dashboardData?.dailyQueries) return [];
    return dashboardData.dailyQueries.map(item => ({
      date: item.date,
      queries: item.queries,
    }));
  }, [dashboardData]);

  const latencyData = useMemo(() => {
    if (!dashboardData?.latencyData) return [];
    return dashboardData.latencyData.map(item => ({
      date: item.date,
      p95: item.p95,
      p50: item.p50,
    }));
  }, [dashboardData]);

  const satisfactionData = useMemo(() => {
    if (!dashboardData?.satisfactionData) return [];
    return dashboardData.satisfactionData.map(item => ({
      date: item.date,
      satisfaction: item.satisfaction,
    }));
  }, [dashboardData]);

  // 📊 Memoized source coverage data
  const sourceCoverage = useMemo(() => {
    if (!sourceCoverageData?.sources) return [];
    return sourceCoverageData.sources;
  }, [sourceCoverageData]);

  // 📊 Memoized popular queries data
  const popularQueries = useMemo(() => {
    if (!popularQueriesData?.queries) return [];
    return popularQueriesData.queries;
  }, [popularQueriesData]);

  // 📊 Memoized hard queries data
  const hardQueries = useMemo(() => {
    if (!hardQueriesData?.queries) return [];
    return hardQueriesData.queries;
  }, [hardQueriesData]);

  // 🎨 Memoized satisfaction color function
  const getSatisfactionColor = useCallback((satisfaction: number) => {
    if (satisfaction >= 90) return "default";
    if (satisfaction >= 70) return "secondary";
    return "destructive";
  }, []);

  // 📥 Handle export
  const handleExport = useCallback(async () => {
    try {
      const exportData = await analyticsAPI.export({ time_range: timeRange });
      // Create a blob and download
      const blob = new Blob([exportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export Successful",
        description: "Analytics data has been exported successfully.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    }
  }, [timeRange, toast]);

  // 🔄 Format change percentage
  const formatChange = useCallback((change: number | null | undefined) => {
    if (change === null || change === undefined) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }, []);

  // 🔄 Format number with commas
  const formatNumber = useCallback((num: number | null | undefined) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  }, []);

  // 🔄 Format latency
  const formatLatency = useCallback((ms: number | null | undefined) => {
    if (ms === null || ms === undefined) return '0ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }, []);

  // Loading state
  const isLoading = isLoadingDashboard || isLoadingSourceCoverage || isLoadingPopularQueries || isLoadingHardQueries;

  // Error state
  if (dashboardError) {
    return (
      <div className="relative">
        <div className="relative z-10 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 p-0 sm:p-6" style={{ maxWidth: '93vw' }}>
          <GlassCard>
            <div className="p-6 text-center">
              <p className="text-destructive">Failed to load analytics data. Please try again later.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 p-0 sm:p-6" style={{ maxWidth: '93vw' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('analytics.title')}</h1>
            <p className="text-muted-foreground">
              {t('analytics.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full " data-testid="select-time-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              data-testid="button-export" 
              className="w-full sm:w-auto"
              onClick={handleExport}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Key Metrics Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <GlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Total Queries</h3>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{formatNumber(metrics.totalQueries)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatChange(metrics.totalQueriesChange)} from last period
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Avg Latency (p95)</h3>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{formatLatency(metrics.avgLatencyP95)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatChange(metrics.avgLatencyP95Change)} from last period
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Satisfaction Rate</h3>
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.satisfactionRate !== null && metrics.satisfactionRate !== undefined 
                      ? `${metrics.satisfactionRate.toFixed(1)}%` 
                      : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatChange(metrics.satisfactionRateChange)} from last period
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Daily Average</h3>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{formatNumber(metrics.dailyAverage)}</div>
                  <p className="text-xs text-muted-foreground">
                    queries per day
                  </p>
                </div>
              </GlassCard>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Query Volume Chart */}
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Daily Queries</h3>
                  {dailyQueriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={dailyQueriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                        <Line type="monotone" dataKey="queries" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Latency Chart */}
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Response Latency</h3>
                  {latencyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={latencyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value, name) => [`${value}ms`, name === 'p95' ? 'p95' : 'p50']}
                        />
                        <Line type="monotone" dataKey="p95" stroke="hsl(var(--chart-1))" strokeWidth={2} name="p95" />
                        <Line type="monotone" dataKey="p50" stroke="hsl(var(--chart-2))" strokeWidth={2} name="p50" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Satisfaction Rate Chart */}
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">User Satisfaction</h3>
                  {satisfactionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={satisfactionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value) => [`${value}%`, 'Satisfaction']}
                        />
                        <Line type="monotone" dataKey="satisfaction" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Source Coverage */}
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Source Coverage</h3>
                  {sourceCoverage.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={sourceCoverage}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {sourceCoverage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Popular Queries */}
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Popular Queries</h3>
                  {popularQueries.length > 0 ? (
                    <div className="space-y-3">
                      {popularQueries.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border hover-elevate bg-background/30 backdrop-blur-sm shadow-sm"
                          style={{ borderRadius: 'var(--component-cardRadius, 2px)' }}
                          data-testid={`popular-query-${index}`}
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1 break-words">{item.query}</p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <span className="text-xs text-muted-foreground">{item.count} queries</span>
                              <Badge variant={getSatisfactionColor(item.satisfaction)} className="text-xs">
                                {item.satisfaction}% satisfaction
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No popular queries data available
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Hard Queries */}
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Hard Queries</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Queries with low satisfaction scores that need attention
                  </p>
                  {hardQueries.length > 0 ? (
                    <div className="space-y-3">
                      {hardQueries.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 border hover-elevate cursor-pointer bg-background/30 backdrop-blur-sm shadow-sm"
                          style={{ borderRadius: 'var(--component-cardRadius, 2px)' }}
                          data-testid={`hard-query-${index}`}
                        >
                          <div className="space-y-2">
                            <p className="font-medium text-sm line-clamp-2">{item.query}</p>
                            <div className="flex  flex-col md:flex-row md:items-center gap-3 md:gap-0  md:justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">{item.attempts} attempts</span>
                                <Badge variant="destructive" className="text-xs">
                                  {item.satisfaction}% satisfaction
                                </Badge>
                                <span className="text-muted-foreground">{item.avgLatency} avg</span>
                              </div>
                              <span className="text-muted-foreground text-end md:text-start ">{item.lastAttempt}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No hard queries data available
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default Analytics;
