import React, { useState, useEffect, useMemo } from "react";
import { Activity, Search, Users, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/features/analytics/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/contexts/I18nContext";
import { HeroSection } from "@/components/ui/HeroSection";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassStatsCard } from "@/components/ui/GlassStatsCard";
import { overviewAPI, OverviewData, QueryOverTime, LatestFeedback, ThumbsUpRate, P95Latency, CrawlError, TopSource } from "@/services/api/api";

const Overview = React.memo(function Overview() {
  const { t } = useTranslation();
  
  // State for all API data
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [queriesOverTime, setQueriesOverTime] = useState<QueryOverTime[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<LatestFeedback[]>([]);
  const [thumbsUpRate, setThumbsUpRate] = useState<ThumbsUpRate | null>(null);
  const [p95Latency, setP95Latency] = useState<P95Latency | null>(null);
  const [crawlErrors, setCrawlErrors] = useState<CrawlError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all overview data on mount
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all endpoints in parallel
        const [
          overview,
          queriesTime,
          feedback,
          thumbsRate,
          latency,
          errors
        ] = await Promise.all([
          overviewAPI.getOverview().catch(err => {
            console.error('Failed to fetch overview:', err);
            return null;
          }),
          overviewAPI.getQueriesOverTime().catch(err => {
            console.error('Failed to fetch queries over time:', err);
            return [];
          }),
          overviewAPI.getLatestFeedback().catch(err => {
            console.error('Failed to fetch latest feedback:', err);
            return [];
          }),
          overviewAPI.getThumbsUpRate().catch(err => {
            console.error('Failed to fetch thumbs-up rate:', err);
            return null;
          }),
          overviewAPI.getP95Latency().catch(err => {
            console.error('Failed to fetch P95 latency:', err);
            return null;
          }),
          overviewAPI.getCrawlErrors().catch(err => {
            console.error('Failed to fetch crawl errors:', err);
            return [];
          }),
        ]);

        if (overview) setOverviewData(overview);
        setQueriesOverTime(queriesTime || []);
        setLatestFeedback(feedback || []);
        if (thumbsRate) setThumbsUpRate(thumbsRate);
        if (latency) setP95Latency(latency);
        setCrawlErrors(errors || []);
      } catch (err: any) {
        console.error('Error fetching overview data:', err);
        setError(err.message || 'Failed to load overview data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  // Format queries over time data for chart
  const chartData = useMemo(() => {
    if (!queriesOverTime || queriesOverTime.length === 0) {
      return [];
    }
    return queriesOverTime.map((item) => {
      // Format date - try to extract day name or use date directly
      const date = new Date(item.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        name: dayName || item.date,
        queries: item.queries || 0,
      };
    });
  }, [queriesOverTime]);

  // Calculate trend for queries today
  const queriesTrend = useMemo(() => {
    if (!overviewData) return null;
    const today = overviewData.queriesToday || 0;
    const yesterday = overviewData.queriesYesterday || 0;
    if (yesterday === 0) return null;
    const diff = ((today - yesterday) / yesterday) * 100;
    return {
      value: Math.abs(Math.round(diff)),
      isPositive: diff >= 0,
    };
  }, [overviewData]);

  // Format time ago for feedback
  const formatTimeAgo = (timestamp?: string): string => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return timestamp;
    }
  };

  // Format number with commas
  const formatNumber = (num: number | undefined | null): string => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  // Format percentage
  const formatPercentage = (num: number | undefined | null): string => {
    if (num === null || num === undefined) return '0%';
    return `${Math.round(num)}%`;
  };

  // Format latency
  const formatLatency = (latency: number | undefined | null): string => {
    if (latency === null || latency === undefined) return '0ms';
    return `${Math.round(latency)}ms`;
  };

  // Top sources from API - use overviewData.topSources if available, otherwise fallback to crawl errors
  const topSources = useMemo(() => {
    // First, try to use topSources from the API response
    if (overviewData?.topSources && Array.isArray(overviewData.topSources) && overviewData.topSources.length > 0) {
      console.log('✅ Using topSources from API:', overviewData.topSources);
      return overviewData.topSources;
    }
    
    // Fallback: calculate from crawl errors if API data not available
    console.log('⚠️ No topSources from API, calculating from crawl errors');
    const errorMap = new Map<string, number>();
    crawlErrors.forEach(error => {
      const url = error.source || error.url || 'Unknown';
      errorMap.set(url, (errorMap.get(url) || 0) + 1);
    });
    
    return Array.from(errorMap.entries())
      .map(([url, errors]) => ({
        url,
        errors,
        docs: 0, // We don't have this data from crawl errors
        lastCrawl: 'N/A', // We don't have this data from crawl errors
      }))
      .slice(0, 4); // Top 4 sources with errors
  }, [overviewData, crawlErrors]);
  
  if (loading) {
    return (
      <div className="relative">
        <div className="relative z-10 space-y-6 p-0 sm:p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('nav.overview')}</h1>
            <p className="text-muted-foreground">
              {t('overview.description')}
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="relative z-10 space-y-6 p-0 sm:p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('nav.overview')}</h1>
            <p className="text-muted-foreground">
              {t('overview.description')}
            </p>
          </div>
          <GlassCard>
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-lg font-semibold mb-2">Error loading overview</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

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
          value={formatNumber(overviewData?.queriesToday)}
          description={queriesTrend ? `from yesterday` : "from today"}
          trend={queriesTrend || undefined}
          icon={<Search className="h-4 w-4" />}
        />
        <GlassStatsCard
          title="p95 Latency"
          value={formatLatency(p95Latency?.latency || overviewData?.p95Latency)}
          description="avg response time"
          icon={<Activity className="h-4 w-4" />}
        />
        <GlassStatsCard
          title="Thumbs-up Rate"
          value={formatPercentage(thumbsUpRate?.rate || overviewData?.thumbsUpRate)}
          description="user satisfaction"
          icon={<Users className="h-4 w-4" />}
        />
        <GlassStatsCard
          title="Crawl Errors"
          value={formatNumber(crawlErrors.length || overviewData?.crawlErrors)}
          description="need attention"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

        {/* Queries Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Queries Over Time</h3>
            </div>
            <div>
              {chartData.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Top Sources */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Crawl Sources</h3>
            <div className="space-y-3">
              {topSources.length > 0 ? (
                topSources.slice(0, 4).map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border hover-elevate bg-background/30 backdrop-blur-sm shadow-sm"
                    style={{ borderRadius: 'var(--component-cardRadius, 2px)' }}
                    data-testid={`source-${index}`}
                  >
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">{source.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.docs > 0 ? `${source.docs.toLocaleString()} docs` : '0 docs'} • 
                        {source.lastCrawl && source.lastCrawl !== 'N/A' ? ` Last crawl: ${source.lastCrawl}` : ' Never crawled'}
                        {source.errors > 0 ? ` • ${source.errors} error${source.errors > 1 ? 's' : ''}` : ''}
                      </p>
                    </div>
                    {source.errors > 0 && (
                      <Badge variant="destructive" className="text-xs ml-2">
                        {source.errors} error{source.errors > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No crawl sources found
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Latest Feedback */}
      <GlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Latest Feedback</h3>
          <div className="space-y-3">
            {latestFeedback.length > 0 ? (
              latestFeedback.slice(0, 4).map((feedback, index) => {
                const vote = feedback.vote || (feedback as any).feedback;
                const isUp = vote === 'up' || vote === 'positive' || vote === true;
                const isDown = vote === 'down' || vote === 'negative' || vote === false;
                const timeAgo = feedback.time || formatTimeAgo(feedback.timestamp);
                
                return (
                  <div
                    key={feedback.id || index}
                    className="flex items-center justify-between p-3 border hover-elevate bg-background/30 backdrop-blur-sm shadow-sm"
                    style={{ borderRadius: 'var(--component-cardRadius, 2px)' }}
                    data-testid={`feedback-${index}`}
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{feedback.query}</p>
                      <div className="flex items-center gap-2">
                        {(isUp || isDown) && (
                          <Badge
                            variant={isUp ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {isUp ? "👍" : "👎"} {isUp ? "up" : "down"}
                          </Badge>
                        )}
                        {feedback.reason && (
                          <Badge variant="outline" className="text-xs">
                            {feedback.reason}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No feedback available
              </div>
            )}
          </div>
        </div>
      </GlassCard>
      </div>
    </div>
  );
});

export default Overview;


