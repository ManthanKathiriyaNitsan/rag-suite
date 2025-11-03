import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Zap,
  Target,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface AnalyticsData {
  kpis: {
    totalQueries: number;
    totalUsers: number;
    avgResponseTime: number;
    successRate: number;
    queriesToday: number;
    usersToday: number;
    avgSessionDuration: number;
    conversionRate: number;
  };
  chartData: {
    date: string;
    queries: number;
    users: number;
    responseTime: number;
  }[];
  topQueries: {
    query: string;
    count: number;
    successRate: number;
  }[];
  userEngagement: {
    newUsers: number;
    returningUsers: number;
    activeUsers: number;
    churnRate: number;
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

interface AnalyticsTabProps {
  data: AnalyticsData;
  onChange: (analytics: AnalyticsData) => void;
}

export default function AnalyticsTab({ data, onChange }: AnalyticsTabProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(data || {
    kpis: {
      totalQueries: 0,
      totalUsers: 0,
      avgResponseTime: 0,
      successRate: 0,
      queriesToday: 0,
      usersToday: 0,
      avgSessionDuration: 0,
      conversionRate: 0,
    },
    chartData: [],
    topQueries: [],
    userEngagement: {
      newUsers: 0,
      returningUsers: 0,
      activeUsers: 0,
      churnRate: 0,
    },
    performance: {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      uptime: 0,
    },
  });
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAnalytics(data || analytics);
  }, [data]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) {
      return "text-green-500";
    } else if (current < previous) {
      return "text-red-500";
    } else {
      return "text-gray-500";
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatPercentage = (num: number | undefined) => {
    if (num === undefined || num === null) return '0.0%';
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (ms: number | undefined) => {
    if (ms === undefined || ms === null) return '0ms';
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${ms.toFixed(0)}ms`;
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Monitor integration performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:glass-navbar-dark" style={{ boxShadow: '0px 1px 5px -1px rgba(0,0,0,0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Queries</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.kpis?.totalQueries)}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(analytics.kpis?.queriesToday, 0)}
              <span className={`text-sm ${getTrendColor(analytics.kpis?.queriesToday, 0)}`}>
                {formatNumber(analytics.kpis?.queriesToday)} today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:glass-navbar-dark" style={{ boxShadow: '0px 1px 5px -1px rgba(0,0,0,0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.kpis?.totalUsers)}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(analytics.kpis?.usersToday, 0)}
              <span className={`text-sm ${getTrendColor(analytics.kpis?.usersToday, 0)}`}>
                {formatNumber(analytics.kpis?.usersToday)} today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:glass-navbar-dark" style={{ boxShadow: '0px 1px 5px -1px rgba(0,0,0,0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{formatDuration(analytics.kpis?.avgResponseTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-muted-foreground">
                P95: {formatDuration(analytics.performance?.p95ResponseTime)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:glass-navbar-dark" style={{ boxShadow: '0px 1px 5px -1px rgba(0,0,0,0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(analytics.kpis?.successRate)}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-muted-foreground">
                Error rate: {formatPercentage(analytics.performance?.errorRate)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="queries" className="text-xs sm:text-sm">Queries</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Users</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(analytics.userEngagement?.newUsers)}</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">+12%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Returning Users</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(analytics.userEngagement?.returningUsers)}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">+8%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(analytics.userEngagement?.activeUsers)}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">+5%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Churn Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatPercentage(analytics.userEngagement?.churnRate)}</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">-2%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-medium">{formatDuration(analytics.performance?.avgResponseTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">P95 Response Time</span>
                    <span className="font-medium">{formatDuration(analytics.performance?.p95ResponseTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium">{formatPercentage(analytics.performance?.errorRate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium">{formatPercentage(analytics.performance?.uptime)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Queries</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topQueries?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>No query data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Success Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.topQueries?.map((query, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium break-all">{query.query}</TableCell>
                          <TableCell>{formatNumber(query.count)}</TableCell>
                          <TableCell>
                            <Badge variant={query.successRate > 90 ? "default" : "destructive"}>
                              {formatPercentage(query.successRate)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New Users</p>
                    <p className="text-2xl font-bold">{formatNumber(analytics.userEngagement?.newUsers)}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Returning Users</p>
                    <p className="text-2xl font-bold">{formatNumber(analytics.userEngagement?.returningUsers)}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{formatNumber(analytics.userEngagement?.activeUsers)}</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average</span>
                    <span className="font-medium">{formatDuration(analytics.performance?.avgResponseTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">P95</span>
                    <span className="font-medium">{formatDuration(analytics.performance?.p95ResponseTime)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reliability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium">{formatPercentage(analytics.performance?.uptime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium">{formatPercentage(analytics.performance?.errorRate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
