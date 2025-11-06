import React, { useState, useMemo, useCallback } from "react";
import { TrendingUp, Download, Clock, Users, ThumbsUp } from "lucide-react";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const queryData = [
  { date: "2024-01-01", queries: 145, p95: 245, p50: 180, satisfaction: 89 },
  { date: "2024-01-02", queries: 210, p95: 267, p50: 195, satisfaction: 91 },
  { date: "2024-01-03", queries: 189, p95: 234, p50: 178, satisfaction: 87 },
  { date: "2024-01-04", queries: 267, p95: 289, p50: 203, satisfaction: 93 },
  { date: "2024-01-05", queries: 312, p95: 301, p50: 215, satisfaction: 89 },
  { date: "2024-01-06", queries: 198, p95: 256, p50: 187, satisfaction: 85 },
  { date: "2024-01-07", queries: 156, p95: 223, p50: 165, satisfaction: 88 },
];

const Analytics = React.memo(function Analytics() {
  // 📊 Memoized source coverage data
  const sourceCoverage = useMemo(() => [
    { name: "docs.company.com", value: 45, color: "#1F6FEB" },
    { name: "help.company.com", value: 25, color: "#22C55E" },
    { name: "api.company.com", value: 20, color: "#F59E0B" },
    { name: "blog.company.com", value: 10, color: "#EF4444" },
  ], []);

  // 📊 Memoized popular queries data
  const popularQueries = useMemo(() => [
    { query: "How to configure SSL certificates?", count: 342, satisfaction: 94 },
    { query: "API rate limiting documentation", count: 298, satisfaction: 87 },
    { query: "Deployment troubleshooting guide", count: 276, satisfaction: 91 },
    { query: "Database backup procedures", count: 234, satisfaction: 89 },
    { query: "User authentication setup", count: 198, satisfaction: 85 },
    { query: "Error code explanations", count: 187, satisfaction: 82 },
    { query: "Performance optimization tips", count: 165, satisfaction: 88 },
    { query: "Security best practices", count: 143, satisfaction: 92 },
  ], []);

  // 📊 Memoized hard queries data
  const hardQueries = useMemo(() => [
    {
      query: "How to configure advanced load balancer settings with custom headers?",
      attempts: 45,
      satisfaction: 34,
      avgLatency: "4.2s",
      lastAttempt: "2 hours ago",
    },
    {
      query: "Integration with legacy SAML providers using custom attributes",
      attempts: 38,
      satisfaction: 28,
      avgLatency: "3.8s",
      lastAttempt: "4 hours ago",
    },
    {
      query: "Custom webhook payload validation for third-party services",
      attempts: 32,
      satisfaction: 41,
      avgLatency: "3.1s",
      lastAttempt: "6 hours ago",
    },
    {
      query: "Advanced database sharding configuration for high throughput",
      attempts: 29,
      satisfaction: 35,
      avgLatency: "4.7s",
      lastAttempt: "8 hours ago",
    },
  ], []);
  const [timeRange, setTimeRange] = useState("7d");
  const { t } = useTranslation();

  // 🎨 Memoized satisfaction color function
  const getSatisfactionColor = useCallback((satisfaction: number) => {
    if (satisfaction >= 90) return "default";
    if (satisfaction >= 70) return "secondary";
    return "destructive";
  }, []);

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
          <Button variant="outline" data-testid="button-export" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Total Queries</h3>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">1,777</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Avg Latency (p95)</h3>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">259ms</div>
            <p className="text-xs text-muted-foreground">
              -5% from last period
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Satisfaction Rate</h3>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              +3% from last period
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Daily Average</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">254</div>
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
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={queryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Line type="monotone" dataKey="queries" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Latency Chart */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Response Latency</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={queryData}>
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
          </div>
        </GlassCard>

        {/* Satisfaction Rate Chart */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Satisfaction</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={queryData}>
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
          </div>
        </GlassCard>

        {/* Source Coverage */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Source Coverage</h3>
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
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Popular Queries */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Popular Queries</h3>
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
          </div>
        </GlassCard>

        {/* Hard Queries */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hard Queries</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Queries with low satisfaction scores that need attention
            </p>
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
          </div>
        </GlassCard>
      </div>
      </div>
    </div>
  );
});

export default Analytics;
