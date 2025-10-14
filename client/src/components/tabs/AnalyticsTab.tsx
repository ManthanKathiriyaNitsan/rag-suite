import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Progress } from "@/components/ui/Progress";
import { Separator } from "@/components/ui/Separator";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Search, 
  MessageSquare,
  Clock, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Globe,
  FileText,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change
  trend: "up" | "down" | "neutral";
  target?: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TopQuery {
  id: string;
  query: string;
  count: number;
  averageResponseTime: number;
  satisfactionScore: number;
  lastAsked: Date;
}

interface TopSource {
  id: string;
  domain: string;
  url: string;
  visits: number;
  conversions: number;
  conversionRate: number;
  averageSessionTime: number;
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  threshold: number;
}

interface AnalyticsData {
  kpis: KPIMetric[];
  chartData: {
    queries: ChartDataPoint[];
    users: ChartDataPoint[];
    satisfaction: ChartDataPoint[];
    responseTime: ChartDataPoint[];
  };
  topQueries: TopQuery[];
  topSources: TopSource[];
  performance: PerformanceMetric[];
  
  // Settings
  dataRetentionDays: number;
  realTimeUpdates: boolean;
  anonymizeData: boolean;
  trackingEnabled: boolean;
}

interface AnalyticsTabProps {
  data: AnalyticsData;
  onChange: (data: AnalyticsData) => void;
}

export default function AnalyticsTab({ data, onChange }: AnalyticsTabProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use data directly from props (controlled component pattern)

  const updateAnalytics = (updates: Partial<AnalyticsData>) => {
    onChange({ ...data, ...updates });
  };

  const refreshData = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      // In real implementation, this would fetch fresh data
    }, 2000);
  };

  const exportData = () => {
    // Simulate data export
    const exportData = {
      kpis: data.kpis,
      dateRange,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPerformanceStatus = (status: string) => {
    switch (status) {
      case "good":
        return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: "text-green-500" };
      case "warning":
        return { icon: <AlertCircle className="h-4 w-4 text-yellow-500" />, color: "text-yellow-500" };
      case "critical":
        return { icon: <AlertCircle className="h-4 w-4 text-red-500" />, color: "text-red-500" };
      default:
        return { icon: <Activity className="h-4 w-4 text-gray-500" />, color: "text-gray-500" };
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case "1d": return "Last 24 hours";
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "90d": return "Last 90 days";
      default: return "Last 7 days";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden min-w-0 px-2 sm:px-0" style={{ maxWidth: '93vw' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Analytics & Performance</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
            data-testid="button-refresh-data"
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportData}
            data-testid="button-export-data"
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Data Range Info */}
      <Card className="w-full overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Showing data for</p>
              <p className="text-lg font-medium">{getDateRangeLabel(dateRange)}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">
                  {data.kpis.find(k => k.id === "total-queries")?.value || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Queries</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">
                  {data.kpis.find(k => k.id === "active-users")?.value || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">
                  {((data.kpis.find(k => k.id === "satisfaction-score")?.value || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full  grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" data-testid="tab-overview" className="text-sm flex items-center ">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Over</span>
          </TabsTrigger>
          <TabsTrigger value="queries" data-testid="tab-queries" className="text-sm flex items-center ">
            <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Top Queries</span>
            <span className="sm:hidden">Query</span>
          </TabsTrigger>
          <TabsTrigger value="sources" data-testid="tab-sources" className="text-sm flex items-center ">
            <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Traffic Sources</span>
            <span className="sm:hidden">Source</span>
          </TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance" className="text-sm flex items-center ">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Performance</span>
            <span className="sm:hidden">Perf</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {data.kpis.map((kpi) => (
              <Card key={kpi.id} className="hover-elevate" data-testid={`kpi-card-${kpi.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.name}
                    </CardTitle>
                    {getTrendIcon(kpi.trend)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold" data-testid={`kpi-value-${kpi.id}`}>
                      {formatNumber(kpi.value)}{kpi.unit}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                      </span>
                      <span className="text-sm text-muted-foreground">vs previous period</span>
                    </div>
                    {kpi.target && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Target: {formatNumber(kpi.target)}{kpi.unit}</span>
                          <span>{((kpi.value / kpi.target) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={(kpi.value / kpi.target) * 100} 
                          className="h-1"
                          data-testid={`kpi-progress-${kpi.id}`}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Query Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Query volume chart would render here</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">Peak Hour</p>
                      <p className="text-muted-foreground">2:00 PM</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Avg/Hour</p>
                      <p className="text-muted-foreground">124</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Growth</p>
                      <p className="text-green-600">+12.5%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">User engagement chart would render here</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">Session Time</p>
                      <p className="text-muted-foreground">4.2 min</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Return Rate</p>
                      <p className="text-muted-foreground">68%</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Bounce Rate</p>
                      <p className="text-red-600">22%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600" data-testid="realtime-active-users">
                    23
                  </p>
                  <p className="text-sm text-muted-foreground">Users online now</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600" data-testid="realtime-queries">
                    8
                  </p>
                  <p className="text-sm text-muted-foreground">Queries last minute</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600" data-testid="realtime-response-time">
                    245ms
                  </p>
                  <p className="text-sm text-muted-foreground">Avg response time</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600" data-testid="realtime-satisfaction">
                    92%
                  </p>
                  <p className="text-sm text-muted-foreground">Satisfaction rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Queries Tab */}
        <TabsContent value="queries" className="space-y-4 sm:space-y-6">
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle>Most Popular Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {data.topQueries.map((query, index) => (
                    <div 
                      key={query.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-0 lg:p-4 border rounded-lg hover-elevate"
                      data-testid={`query-item-${query.id}`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="text-center min-w-8 flex-shrink-0">
                          <Badge variant="outline" className="rounded-full w-8 h-8 p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm break-words">{query.query}</p>
                          <p className="text-xs text-muted-foreground">
                            Last asked: {query.lastAsked.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 text-sm w-full sm:w-auto">
                        <div className="text-center flex-1 sm:flex-none">
                          <p className="font-medium" data-testid={`query-count-${query.id}`}>{query.count}</p>
                          <p className="text-muted-foreground">times</p>
                        </div>
                        <div className="text-center flex-1 sm:flex-none">
                          <p className="font-medium">{formatDuration(query.averageResponseTime)}</p>
                          <p className="text-muted-foreground">response</p>
                        </div>
                        <div className="text-center flex-1 sm:flex-none">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="font-medium">{query.satisfactionScore.toFixed(1)}</span>
                          </div>
                          <p className="text-muted-foreground">rating</p>
                        </div>
                        <div className="flex items-center gap-1 flex-1 sm:flex-none justify-center">
                          <Button variant="ghost" size="sm" data-testid={`button-view-query-${query.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Query Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Query Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Technical Questions</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={65} className="flex-1" />
                    <span className="text-sm font-medium">65%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Product Information</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={25} className="flex-1" />
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">General Support</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={10} className="flex-1" />
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="sources" className="space-y-4 sm:space-y-6">
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle>Top Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {data.topSources.map((source, index) => (
                    <div 
                      key={source.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-0 lg:p-4 border rounded-lg hover-elevate"
                      data-testid={`source-item-${source.id}`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="text-center min-w-8 flex-shrink-0">
                          <Badge variant="outline" className="rounded-full w-8 h-8 p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm break-words">{source.domain}</p>
                          <p className="text-xs text-muted-foreground font-mono break-all">{source.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 text-sm w-full sm:w-auto">
                        <div className="text-center flex-1 sm:flex-none">
                          <p className="font-medium" data-testid={`source-visits-${source.id}`}>{formatNumber(source.visits)}</p>
                          <p className="text-muted-foreground">visits</p>
                        </div>
                        <div className="text-center flex-1 sm:flex-none">
                          <p className="font-medium">{source.conversions}</p>
                          <p className="text-muted-foreground">conversions</p>
                        </div>
                        <div className="text-center flex-1 sm:flex-none">
                          <p className="font-medium">{(source.conversionRate * 100).toFixed(1)}%</p>
                          <p className="text-muted-foreground">rate</p>
                        </div>
                        <div className="text-center flex-1 sm:flex-none">
                          <p className="font-medium">{formatDuration(source.averageSessionTime * 1000)}</p>
                          <p className="text-muted-foreground">session</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" data-testid={`button-view-source-${source.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Referral Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-blue-600">45%</p>
                  <p className="text-sm text-muted-foreground">Direct</p>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-green-600">30%</p>
                  <p className="text-sm text-muted-foreground">Search</p>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-purple-600">15%</p>
                  <p className="text-sm text-muted-foreground">Social</p>
                  <Progress value={15} className="h-2" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-orange-600">10%</p>
                  <p className="text-sm text-muted-foreground">Referral</p>
                  <Progress value={10} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4 sm:space-y-6">
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle>System Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.performance.map((metric) => {
                  const status = getPerformanceStatus(metric.status);
                  return (
                    <div 
                      key={metric.id} 
                      className="flex :flex-row items-start items-center justify-between gap-4 p-0 lg:p-4 border rounded-lg"
                      data-testid={`performance-metric-${metric.id}`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {status.icon}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium break-words">{metric.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Threshold: {metric.threshold}{metric.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className={`text-lg font-bold ${status.color}`} data-testid={`performance-value-${metric.id}`}>
                          {metric.value}{metric.unit}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {metric.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle>Analytics Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="retention-days">Data Retention (days)</Label>
                    <input
                      id="retention-days"
                      type="number"
                      value={data.dataRetentionDays}
                      onChange={(e) => updateAnalytics({ dataRetentionDays: parseInt(e.target.value) || 90 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      data-testid="input-retention-days"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="real-time">Real-time Updates</Label>
                      <p className="text-sm text-muted-foreground">Update metrics in real-time</p>
                    </div>
                    <input
                      id="real-time"
                      type="checkbox"
                      checked={data.realTimeUpdates}
                      onChange={(e) => updateAnalytics({ realTimeUpdates: e.target.checked })}
                      data-testid="checkbox-real-time"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="anonymize">Anonymize Data</Label>
                      <p className="text-sm text-muted-foreground">Remove personal identifiers</p>
                    </div>
                    <input
                      id="anonymize"
                      type="checkbox"
                      checked={data.anonymizeData}
                      onChange={(e) => updateAnalytics({ anonymizeData: e.target.checked })}
                      data-testid="checkbox-anonymize"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="tracking">Enable Tracking</Label>
                      <p className="text-sm text-muted-foreground">Collect analytics data</p>
                    </div>
                    <input
                      id="tracking"
                      type="checkbox"
                      checked={data.trackingEnabled}
                      onChange={(e) => updateAnalytics({ trackingEnabled: e.target.checked })}
                      data-testid="checkbox-tracking"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
