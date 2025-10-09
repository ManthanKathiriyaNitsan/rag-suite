import { Activity, Search, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/contexts/I18nContext";

const chartData = [
  { name: "Mon", queries: 145 },
  { name: "Tue", queries: 210 },
  { name: "Wed", queries: 189 },
  { name: "Thu", queries: 267 },
  { name: "Fri", queries: 312 },
  { name: "Sat", queries: 198 },
  { name: "Sun", queries: 156 },
];

const topSources = [
  { url: "docs.company.com", docs: 245, lastCrawl: "2 hours ago", errors: 0 },
  { url: "help.company.com", docs: 89, lastCrawl: "6 hours ago", errors: 0 },
  { url: "blog.company.com", docs: 156, lastCrawl: "1 day ago", errors: 3 },
  { url: "api.company.com", docs: 67, lastCrawl: "3 hours ago", errors: 1 },
];

const latestFeedback = [
  { query: "How to configure SSL?", vote: "up", reason: "helpful", time: "5 min ago" },
  { query: "API rate limits", vote: "down", reason: "outdated", time: "12 min ago" },
  { query: "Deployment guide", vote: "up", reason: "accurate", time: "25 min ago" },
  { query: "Database backup", vote: "up", reason: "complete", time: "1 hour ago" },
];

export default function Overview() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.overview')}</h1>
        <p className="text-muted-foreground">
          {t('overview.description')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Queries Today"
          value="1,234"
          description="from yesterday"
          trend={{ value: 12, isPositive: true }}
          icon={<Search className="h-4 w-4" />}
        />
        <StatsCard
          title="p95 Latency"
          value="245ms"
          description="avg response time"
          trend={{ value: 5, isPositive: false }}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatsCard
          title="Thumbs-up Rate"
          value="89%"
          description="user satisfaction"
          trend={{ value: 3, isPositive: true }}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Crawl Errors"
          value="3"
          description="need attention"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Queries Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Queries Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Top Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Top Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
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
          </CardContent>
        </Card>
      </div>

      {/* Latest Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latestFeedback.map((feedback, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
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
        </CardContent>
      </Card>
    </div>
  );
}