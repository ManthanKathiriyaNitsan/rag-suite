import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Textarea } from "@/components/ui/Textarea";
import { Progress } from "@/components/ui/Progress";
import { Separator } from "@/components/ui/Separator";
import { 
  Play, 
  Pause, 
  BarChart3, 
  Target, 
  Users, 
  TrendingUp, 
  Trophy, 
  AlertTriangle,
  Plus,
  Trash2,
  Settings,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Activity
} from "lucide-react";

// A/B Testing data interfaces
interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  configVersionId?: string;
  trafficWeight: number;
  isControl: boolean;
  isActive: boolean;
  metrics: {
    visitors: number;
    conversions: number;
    conversionRate: number;
    confidenceInterval: [number, number];
    significance: number;
    isWinner: boolean;
    liftOverControl: number;
  };
}

interface ABTestExperiment {
  id: string;
  name: string;
  description: string;
  status: "draft" | "running" | "paused" | "completed" | "archived";
  hypothesis: string;
  successMetric: string;
  targetAudience: string;
  sampleSize: number;
  confidenceLevel: number;
  startDate?: string;
  endDate?: string;
  duration: number; // days
  variants: ABTestVariant[];
  results: {
    totalVisitors: number;
    totalConversions: number;
    overallConversionRate: number;
    statisticalPower: number;
    pValue: number;
    winner?: string;
    liftAmount: number;
    liftPercentage: number;
  };
}

interface ABTestingSettings {
  enableTestingFramework: boolean;
  defaultConfidenceLevel: number;
  defaultTestDuration: number;
  autoPromoteWinners: boolean;
  minSampleSize: number;
  maxConcurrentTests: number;
  trackingEvents: string[];
  advancedSegmentation: boolean;
  multiVariateEnabled: boolean;
}

interface ABTestingData {
  experiments: ABTestExperiment[];
  settings: ABTestingSettings;
  templates: {
    id: string;
    name: string;
    description: string;
    defaultHypothesis: string;
    suggestedMetrics: string[];
  }[];
}

// Default A/B testing data with enterprise-grade examples
const defaultABTestingData: ABTestingData = {
  experiments: [
    {
      id: "exp-1",
      name: "Search Result Layout Optimization",
      description: "Testing different layout styles for search results to improve user engagement",
      status: "running",
      hypothesis: "A card-based layout will increase click-through rates by 15% compared to the current list layout",
      successMetric: "Click-through Rate",
      targetAudience: "All users",
      sampleSize: 10000,
      confidenceLevel: 95,
      startDate: "2024-09-15",
      duration: 14,
      variants: [
        {
          id: "var-control",
          name: "Control (Current List)",
          description: "Current list-based search results layout",
          trafficWeight: 50,
          isControl: true,
          isActive: true,
          metrics: {
            visitors: 4247,
            conversions: 892,
            conversionRate: 21.0,
            confidenceInterval: [19.8, 22.2],
            significance: 95.2,
            isWinner: false,
            liftOverControl: 0
          }
        },
        {
          id: "var-cards",
          name: "Card Layout",
          description: "New card-based search results with enhanced visuals",
          trafficWeight: 50,
          isControl: false,
          isActive: true,
          metrics: {
            visitors: 4183,
            conversions: 1046,
            conversionRate: 25.0,
            confidenceInterval: [23.7, 26.3],
            significance: 97.8,
            isWinner: true,
            liftOverControl: 19.0
          }
        }
      ],
      results: {
        totalVisitors: 8430,
        totalConversions: 1938,
        overallConversionRate: 23.0,
        statisticalPower: 97.8,
        pValue: 0.022,
        winner: "var-cards",
        liftAmount: 154,
        liftPercentage: 19.0
      }
    },
    {
      id: "exp-2",
      name: "Response Generation Speed Test",
      description: "Testing different AI model configurations for response generation speed vs quality",
      status: "completed",
      hypothesis: "Faster response times will improve user satisfaction even with slight quality reduction",
      successMetric: "User Satisfaction Score",
      targetAudience: "Enterprise users",
      sampleSize: 5000,
      confidenceLevel: 95,
      startDate: "2024-09-01",
      endDate: "2024-09-14",
      duration: 14,
      variants: [
        {
          id: "var-quality",
          name: "High Quality (Control)",
          description: "Current high-quality model with 3s avg response time",
          trafficWeight: 33,
          isControl: true,
          isActive: false,
          metrics: {
            visitors: 1647,
            conversions: 1394,
            conversionRate: 84.6,
            confidenceInterval: [82.8, 86.4],
            significance: 95.0,
            isWinner: false,
            liftOverControl: 0
          }
        },
        {
          id: "var-balanced",
          name: "Balanced",
          description: "Balanced model with 1.5s avg response time",
          trafficWeight: 33,
          isControl: false,
          isActive: false,
          metrics: {
            visitors: 1663,
            conversions: 1429,
            conversionRate: 85.9,
            confidenceInterval: [84.2, 87.6],
            significance: 92.1,
            isWinner: true,
            liftOverControl: 1.5
          }
        },
        {
          id: "var-fast",
          name: "Fast Response",
          description: "Optimized for speed with 0.8s avg response time",
          trafficWeight: 34,
          isControl: false,
          isActive: false,
          metrics: {
            visitors: 1690,
            conversions: 1370,
            conversionRate: 81.1,
            confidenceInterval: [79.2, 83.0],
            significance: 78.4,
            isWinner: false,
            liftOverControl: -4.1
          }
        }
      ],
      results: {
        totalVisitors: 5000,
        totalConversions: 4193,
        overallConversionRate: 83.9,
        statisticalPower: 92.1,
        pValue: 0.041,
        winner: "var-balanced",
        liftAmount: 35,
        liftPercentage: 1.5
      }
    }
  ],
  settings: {
    enableTestingFramework: true,
    defaultConfidenceLevel: 95,
    defaultTestDuration: 14,
    autoPromoteWinners: false,
    minSampleSize: 1000,
    maxConcurrentTests: 5,
    trackingEvents: ["search_query", "result_click", "session_end", "conversion"],
    advancedSegmentation: true,
    multiVariateEnabled: true
  },
  templates: [
    {
      id: "template-layout",
      name: "UI Layout Test",
      description: "Test different user interface layouts and designs",
      defaultHypothesis: "The new layout will improve user engagement metrics",
      suggestedMetrics: ["Click-through Rate", "Time on Page", "Bounce Rate"]
    },
    {
      id: "template-performance",
      name: "Performance Optimization",
      description: "Test different performance optimizations and their impact",
      defaultHypothesis: "Faster response times will improve user satisfaction",
      suggestedMetrics: ["User Satisfaction", "Task Completion Rate", "Session Duration"]
    },
    {
      id: "template-content",
      name: "Content Strategy Test",
      description: "Test different content presentation strategies",
      defaultHypothesis: "Enhanced content presentation will increase engagement",
      suggestedMetrics: ["Engagement Rate", "Content Interaction", "Conversion Rate"]
    }
  ]
};

interface ABTestingTabProps {
  data: ABTestingData;
  onChange: (data: ABTestingData) => void;
}

export default function ABTestingTab({ data, onChange }: ABTestingTabProps) {
  const [activeTab, setActiveTab] = useState("experiments");
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Use data directly from props (controlled component pattern)
  
  const updateABTesting = (updates: Partial<ABTestingData>) => {
    onChange({ ...data, ...updates });
  };

  const createExperiment = () => {
    const newExperiment: ABTestExperiment = {
      id: `exp-${Date.now()}`,
      name: "New Experiment",
      description: "",
      status: "draft",
      hypothesis: "",
      successMetric: "Conversion Rate",
      targetAudience: "All users",
      sampleSize: 1000,
      confidenceLevel: 95,
      duration: 14,
      variants: [
        {
          id: "control",
          name: "Control",
          description: "Current version",
          trafficWeight: 50,
          isControl: true,
          isActive: true,
          metrics: {
            visitors: 0,
            conversions: 0,
            conversionRate: 0,
            confidenceInterval: [0, 0],
            significance: 0,
            isWinner: false,
            liftOverControl: 0
          }
        },
        {
          id: "variant-a",
          name: "Variant A",
          description: "Test version",
          trafficWeight: 50,
          isControl: false,
          isActive: true,
          metrics: {
            visitors: 0,
            conversions: 0,
            conversionRate: 0,
            confidenceInterval: [0, 0],
            significance: 0,
            isWinner: false,
            liftOverControl: 0
          }
        }
      ],
      results: {
        totalVisitors: 0,
        totalConversions: 0,
        overallConversionRate: 0,
        statisticalPower: 0,
        pValue: 1.0,
        liftAmount: 0,
        liftPercentage: 0
      }
    };
    
    updateABTesting({
      experiments: [...data.experiments, newExperiment]
    });
    setSelectedExperiment(newExperiment.id);
    setShowCreateForm(true);
  };

  const updateExperiment = (experimentId: string, updates: Partial<ABTestExperiment>) => {
    const experiments = data.experiments.map(exp => 
      exp.id === experimentId ? { ...exp, ...updates } : exp
    );
    updateABTesting({ experiments });
  };

  const deleteExperiment = (experimentId: string) => {
    const experiments = data.experiments.filter(exp => exp.id !== experimentId);
    updateABTesting({ experiments });
    if (selectedExperiment === experimentId) {
      setSelectedExperiment(null);
    }
  };

  const updateSettings = (updates: Partial<ABTestingSettings>) => {
    updateABTesting({
      settings: { ...data.settings, ...updates }
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "running": return "default";
      case "completed": return "secondary";
      case "paused": return "outline";
      case "draft": return "secondary";
      case "archived": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Play className="w-3 h-3" />;
      case "completed": return <CheckCircle2 className="w-3 h-3" />;
      case "paused": return <Pause className="w-3 h-3" />;
      case "draft": return <Clock className="w-3 h-3" />;
      case "archived": return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start gap-3 lg:gap-0 lg:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">A/B Testing & Experiments</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage experiments to optimize user experience and performance
          </p>
        </div>
        <Button onClick={createExperiment} data-testid="button-create-experiment">
          <Plus className="w-4 h-4 mr-2" />
          New Experiment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="experiments" data-testid="tab-experiments">Experiments</TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">Results</TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="space-y-4">
          <div className="grid gap-4">
            {data.experiments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No experiments created yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first A/B test to start optimizing your integration
                  </p>
                  <Button onClick={createExperiment} data-testid="button-create-first-experiment">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Experiment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              data.experiments.map((experiment) => (
                <Card key={experiment.id} className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{experiment.name}</CardTitle>
                          <Badge variant={getStatusBadgeVariant(experiment.status)}>
                            {getStatusIcon(experiment.status)}
                            <span className="ml-1 capitalize">{experiment.status}</span>
                          </Badge>
                        </div>
                        <CardDescription>{experiment.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedExperiment(experiment.id)}
                          data-testid={`button-edit-experiment-${experiment.id}`}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteExperiment(experiment.id)}
                          data-testid={`button-delete-experiment-${experiment.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Success Metric</p>
                        <p className="font-medium">{experiment.successMetric}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target Audience</p>
                        <p className="font-medium">{experiment.targetAudience}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sample Size</p>
                        <p className="font-medium">{experiment.sampleSize.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{experiment.duration} days</p>
                      </div>
                    </div>
                    
                    {experiment.status === "running" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{Math.round((experiment.results.totalVisitors / experiment.sampleSize) * 100)}%</span>
                        </div>
                        <Progress value={(experiment.results.totalVisitors / experiment.sampleSize) * 100} className="h-2" />
                      </div>
                    )}

                    {experiment.results.winner && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <Trophy className="w-4 h-4" />
                          <span className="font-medium">Winner Determined</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {experiment.variants.find(v => v.id === experiment.results.winner)?.name} shows {experiment.results.liftPercentage}% improvement
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {experiment.variants.map((variant) => (
                        <div key={variant.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{variant.name}</h4>
                            {variant.metrics.isWinner && <Trophy className="w-3 h-3 text-yellow-500" />}
                          </div>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Traffic</span>
                              <span>{variant.trafficWeight}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Visitors</span>
                              <span>{variant.metrics.visitors.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Conv. Rate</span>
                              <span>{variant.metrics.conversionRate}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Experiments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-active-experiments">
                  {data.experiments.filter(e => e.status === "running").length}
                </div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-total-visitors">
                  {data.experiments.reduce((sum, exp) => sum + exp.results.totalVisitors, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Across all experiments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-avg-conversion">
                  {data.experiments.length > 0 
                    ? (data.experiments.reduce((sum, exp) => sum + exp.results.overallConversionRate, 0) / data.experiments.length).toFixed(1)
                    : "0"
                  }%
                </div>
                <p className="text-xs text-muted-foreground">Average across experiments</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Experiment Results Summary</CardTitle>
              <CardDescription>Overview of all completed and running experiments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.experiments.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No experiment results to display</p>
                  </div>
                ) : (
                  data.experiments.map((experiment) => (
                    <div key={experiment.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{experiment.name}</h4>
                        <Badge variant={getStatusBadgeVariant(experiment.status)}>
                          {experiment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Visitors</p>
                          <p className="font-medium">{experiment.results.totalVisitors.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversions</p>
                          <p className="font-medium">{experiment.results.totalConversions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion Rate</p>
                          <p className="font-medium">{experiment.results.overallConversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Statistical Power</p>
                          <p className="font-medium">{experiment.results.statisticalPower}%</p>
                        </div>
                      </div>

                      {experiment.results.winner && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <Trophy className="w-4 h-4" />
                            <span className="font-medium">
                              Winner: {experiment.variants.find(v => v.id === experiment.results.winner)?.name}
                            </span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            {experiment.results.liftPercentage > 0 ? '+' : ''}{experiment.results.liftPercentage}% lift over control
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Experiment Templates</CardTitle>
              <CardDescription>
                Pre-configured experiment templates to get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {data.templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-use-template-${template.id}`}
                      >
                        Use Template
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Default Hypothesis</p>
                        <p className="text-sm">{template.defaultHypothesis}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Suggested Metrics</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.suggestedMetrics.map((metric) => (
                            <Badge key={metric} variant="secondary" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing Settings</CardTitle>
              <CardDescription>
                Configure global settings for your A/B testing framework
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enable A/B Testing Framework</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable the entire A/B testing system
                  </p>
                </div>
                <Switch
                  checked={data.settings.enableTestingFramework}
                  onCheckedChange={(checked) => updateSettings({ enableTestingFramework: checked })}
                  data-testid="switch-enable-testing"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="confidence-level">Default Confidence Level (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      id="confidence-level"
                      min={80}
                      max={99}
                      step={1}
                      value={[data.settings.defaultConfidenceLevel]}
                      onValueChange={(value) => updateSettings({ defaultConfidenceLevel: value[0] })}
                      data-testid="slider-confidence-level"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>80%</span>
                      <span>{data.settings.defaultConfidenceLevel}%</span>
                      <span>99%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-duration">Default Test Duration (days)</Label>
                  <Input
                    id="test-duration"
                    type="number"
                    min="1"
                    max="90"
                    value={data.settings.defaultTestDuration}
                    onChange={(e) => updateSettings({ defaultTestDuration: parseInt(e.target.value) || 14 })}
                    data-testid="input-test-duration"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-sample-size">Minimum Sample Size</Label>
                  <Input
                    id="min-sample-size"
                    type="number"
                    min="100"
                    value={data.settings.minSampleSize}
                    onChange={(e) => updateSettings({ minSampleSize: parseInt(e.target.value) || 1000 })}
                    data-testid="input-min-sample-size"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tests">Max Concurrent Tests</Label>
                  <Input
                    id="max-tests"
                    type="number"
                    min="1"
                    max="20"
                    value={data.settings.maxConcurrentTests}
                    onChange={(e) => updateSettings({ maxConcurrentTests: parseInt(e.target.value) || 5 })}
                    data-testid="input-max-tests"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Auto-promote Winners</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically promote winning variants when statistical significance is reached
                    </p>
                  </div>
                  <Switch
                    checked={data.settings.autoPromoteWinners}
                    onCheckedChange={(checked) => updateSettings({ autoPromoteWinners: checked })}
                    data-testid="switch-auto-promote"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Advanced Segmentation</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable advanced user segmentation and targeting options
                    </p>
                  </div>
                  <Switch
                    checked={data.settings.advancedSegmentation}
                    onCheckedChange={(checked) => updateSettings({ advancedSegmentation: checked })}
                    data-testid="switch-advanced-segmentation"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Multivariate Testing</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable testing multiple elements simultaneously (requires larger sample sizes)
                    </p>
                  </div>
                  <Switch
                    checked={data.settings.multiVariateEnabled}
                    onCheckedChange={(checked) => updateSettings({ multiVariateEnabled: checked })}
                    data-testid="switch-multivariate"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Tracking Events</Label>
                <p className="text-xs text-muted-foreground">
                  Events that will be tracked for A/B testing analysis
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.settings.trackingEvents.map((event) => (
                    <Badge key={event} variant="secondary">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
