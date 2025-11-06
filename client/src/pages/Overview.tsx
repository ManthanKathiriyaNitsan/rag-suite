import React, { useMemo, useCallback } from "react";
import { Activity, Search, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/features/analytics/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/contexts/I18nContext";
import { HeroSection } from "@/components/ui/HeroSection";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassStatsCard } from "@/components/ui/GlassStatsCard";

const chartData = [
  { name: "Mon", queries: 145 },
  { name: "Tue", queries: 210 },
  { name: "Wed", queries: 189 },
  { name: "Thu", queries: 267 },
  { name: "Fri", queries: 312 },
  { name: "Sat", queries: 198 },
  { name: "Sun", queries: 156 },
];

const Overview = React.memo(function Overview() {
  // 📊 Memoized top sources data
  const topSources = useMemo(() => [
    { url: "docs.company.com", docs: 245, lastCrawl: "2 hours ago", errors: 0 },
    { url: "help.company.com", docs: 89, lastCrawl: "6 hours ago", errors: 0 },
    { url: "blog.company.com", docs: 156, lastCrawl: "1 day ago", errors: 3 },
    { url: "api.company.com", docs: 67, lastCrawl: "3 hours ago", errors: 1 },
  ], []);

  // 📊 Memoized latest feedback data
  const latestFeedback = useMemo(() => [
    { query: "How to configure SSL?", vote: "up", reason: "helpful", time: "5 min ago" },
    { query: "API rate limits", vote: "down", reason: "outdated", time: "12 min ago" },
    { query: "Deployment guide", vote: "up", reason: "accurate", time: "25 min ago" },
    { query: "Database backup", vote: "up", reason: "complete", time: "1 hour ago" },
  ], []);
  const { t } = useTranslation();
  
  return (
    <div className="relative">
      {/* Content */}
      <div className="relative z-10 space-y-6 p-0 sm:p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('nav.overview')}</h1>
          <p className="text-muted-foreground">
            {t('overview.description')}
          </p>
        </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassStatsCard
          title="Queries Today"
          value="1,234"
          description="from yesterday"
          trend={{ value: 12, isPositive: true }}
          icon={<Search className="h-4 w-4" />}
        
        />
        <GlassStatsCard
          title="p95 Latency"
          value="245ms"
          description="avg response time"
          trend={{ value: 5, isPositive: false }}
          icon={<Activity className="h-4 w-4" />}
        />
        <GlassStatsCard
          title="Thumbs-up Rate"
          value="89%"
          description="user satisfaction"
          trend={{ value: 3, isPositive: true }}
          icon={<Users className="h-4 w-4" />}
        />
        <GlassStatsCard
          title="Crawl Errors"
          value="3"
          description="need attention"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Queries Chart */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Queries Over Time</h3>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="queries" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* Top Sources */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Sources</h3>
            <div className="space-y-3">
              {topSources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border hover-elevate bg-background/30 backdrop-blur-sm shadow-sm"
                  style={{ borderRadius: 'var(--component-cardRadius, 2px)' }}
                  data-testid={`source-${index}`}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{source.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {source.docs} docs • Last crawl: {source.lastCrawl}
                    </p>
                  </div>
                  {source.errors > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {source.errors} errors
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Latest Feedback */}
      <GlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Latest Feedback</h3>
          <div className="space-y-3">
            {latestFeedback.map((feedback, index) => (
              <div
                key={index}
                 className="flex items-center justify-between p-3 border hover-elevate bg-background/30 backdrop-blur-sm shadow-sm"
                 style={{ borderRadius: 'var(--component-cardRadius, 2px)' }}
                data-testid={`feedback-${index}`}
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{feedback.query}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={feedback.vote === "up" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {feedback.vote === "up" ? "👍" : "👎"} {feedback.vote}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {feedback.reason}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{feedback.time}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
      </div>
    </div>
  );
});

export default Overview;


