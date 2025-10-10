import { useState } from "react";
import { TrendingUp, Download, Clock, Users, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/I18nContext";
import { PointerTypes } from "@/components/ui/animated-pointer";
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

const sourceCoverage = [
  { name: "docs.company.com", value: 45, color: "#1F6FEB" },
  { name: "help.company.com", value: 25, color: "#22C55E" },
  { name: "api.company.com", value: 20, color: "#F59E0B" },
  { name: "blog.company.com", value: 10, color: "#EF4444" },
];

const popularQueries = [
  { query: "How to configure SSL certificates?", count: 342, satisfaction: 94 },
  { query: "API rate limiting documentation", count: 298, satisfaction: 87 },
  { query: "Deployment troubleshooting guide", count: 276, satisfaction: 91 },
  { query: "Database backup procedures", count: 234, satisfaction: 89 },
  { query: "User authentication setup", count: 198, satisfaction: 85 },
  { query: "Error code explanations", count: 187, satisfaction: 82 },
  { query: "Performance optimization tips", count: 165, satisfaction: 88 },
  { query: "Security best practices", count: 143, satisfaction: 92 },
];

const hardQueries = [
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
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const { t } = useTranslation();

  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 90) return "default";
    if (satisfaction >= 70) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 px-2 sm:px-0" style={{ maxWidth: '93vw' }}>
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
              <SelectTrigger className="w-full sm:w-32" data-testid="select-time-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
            <PointerTypes.Time className="absolute inset-0" />
          </div>
          <div className="relative">
            <Button variant="outline" data-testid="button-export" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <PointerTypes.Download className="absolute inset-0" />
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,777</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency (p95)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">259ms</div>
            <p className="text-xs text-muted-foreground">
              -5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              +3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">254</div>
            <p className="text-xs text-muted-foreground">
              queries per day
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Query Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={queryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Line type="monotone" dataKey="queries" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Latency Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Response Latency</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Satisfaction Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Source Coverage */}
        <Card>
          <CardHeader>
            <CardTitle>Source Coverage</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Popular Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularQueries.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg border hover-elevate"
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
          </CardContent>
        </Card>

        {/* Hard Queries */}
        <Card className="" >
          <CardHeader>
            <CardTitle>Hard Queries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Queries with low satisfaction scores that need attention
            </p>
          </CardHeader  >
          <CardContent>
            <div className="space-y-3">
              {hardQueries.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border hover-elevate cursor-pointer"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}