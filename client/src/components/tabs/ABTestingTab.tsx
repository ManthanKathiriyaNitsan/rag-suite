import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { 
  Plus,
  TestTube,
  Play, 
  Pause, 
  Square,
  Settings,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trophy,
  Target, 
  Users, 
  TrendingUp, 
  BarChart3,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: "draft" | "running" | "paused" | "completed";
  startDate: string;
  endDate?: string;
  trafficSplit: number; // Percentage of traffic to send to variant
  variants: {
  id: string;
  name: string;
  description: string;
    traffic: number;
    isControl: boolean;
  }[];
  metrics: {
    primary: string;
    secondary: string[];
  };
  results?: {
    winner?: string;
    confidence: number;
    improvement: number;
    significance: boolean;
  };
  audience: {
    type: "all" | "segment";
    criteria: Record<string, any>;
  };
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface ABTestingTabProps {
  data: Experiment[];
  onChange: (experiments: Experiment[]) => void;
}

export default function ABTestingTab({ data, onChange }: ABTestingTabProps) {
  const [experiments, setExperiments] = useState<Experiment[]>(data || []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);
  const [newExperiment, setNewExperiment] = useState<Partial<Experiment>>({
    name: "",
    description: "",
    trafficSplit: 50,
      variants: [
      { id: "control", name: "Control", description: "Current version", traffic: 50, isControl: true },
      { id: "variant", name: "Variant A", description: "New version", traffic: 50, isControl: false },
    ],
          metrics: {
      primary: "click_through_rate",
      secondary: ["conversion_rate", "engagement_time"],
    },
    audience: {
      type: "all",
      criteria: {},
    },
  });

  useEffect(() => {
    setExperiments(data || []);
  }, [data]);

  const handleCreateExperiment = () => {
    if (!newExperiment.name || !newExperiment.description) return;

    const experiment: Experiment = {
      id: `exp-${Date.now()}`,
      name: newExperiment.name,
      description: newExperiment.description,
      status: "draft",
      startDate: new Date().toISOString(),
      trafficSplit: newExperiment.trafficSplit || 50,
      variants: newExperiment.variants || [],
      metrics: newExperiment.metrics || {
        primary: "click_through_rate",
        secondary: [],
      },
      audience: newExperiment.audience || {
        type: "all",
        criteria: {},
      },
      createdAt: new Date().toISOString(),
      createdBy: {
        id: "current-user",
        name: "Current User",
        email: "user@example.com",
      },
    };

    const updated = [...experiments, experiment];
    setExperiments(updated);
    onChange(updated);
    setIsCreateOpen(false);
    setNewExperiment({
      name: "",
      description: "",
      trafficSplit: 50,
      variants: [
        { id: "control", name: "Control", description: "Current version", traffic: 50, isControl: true },
        { id: "variant", name: "Variant A", description: "New version", traffic: 50, isControl: false },
      ],
          metrics: {
        primary: "click_through_rate",
        secondary: [],
      },
      audience: {
        type: "all",
        criteria: {},
      },
    });
  };

  const handleUpdateExperiment = (id: string, updates: Partial<Experiment>) => {
    const updated = experiments.map(experiment =>
      experiment.id === id ? { ...experiment, ...updates } : experiment
    );
    setExperiments(updated);
    onChange(updated);
  };

  const handleDeleteExperiment = (id: string) => {
    const updated = experiments.filter(experiment => experiment.id !== id);
    setExperiments(updated);
    onChange(updated);
  };

  const handleStartExperiment = (id: string) => {
    handleUpdateExperiment(id, {
      status: "running",
      startDate: new Date().toISOString(),
    });
  };

  const handlePauseExperiment = (id: string) => {
    handleUpdateExperiment(id, { status: "paused" });
  };

  const handleStopExperiment = (id: string) => {
    handleUpdateExperiment(id, {
      status: "completed",
      endDate: new Date().toISOString(),
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-4 w-4 text-green-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "draft":
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge variant="default" className="bg-green-500">Running</Badge>;
      case "paused":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Paused</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getMetricName = (metric: string) => {
    const names: Record<string, string> = {
      click_through_rate: "Click-through Rate",
      conversion_rate: "Conversion Rate",
      engagement_time: "Engagement Time",
      bounce_rate: "Bounce Rate",
      revenue: "Revenue",
    };
    return names[metric] || metric;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">A/B Testing & Experiments</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage experiments to optimize user experience and performance
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
          New Experiment
        </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Experiment</DialogTitle>
              <DialogDescription>
                Set up a new A/B test to optimize your integration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exp-name">Experiment Name</Label>
                  <Input
                    id="exp-name"
                    value={newExperiment.name || ""}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Search Result Layout Optimization"
                  />
                </div>
                <div>
                  <Label htmlFor="exp-traffic">Traffic Split (%)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[newExperiment.trafficSplit || 50]}
                      onValueChange={(value) => setNewExperiment(prev => ({ ...prev, trafficSplit: value[0] }))}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{newExperiment.trafficSplit || 50}%</span>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="exp-description">Description</Label>
                <Textarea
                  id="exp-description"
                  value={newExperiment.description || ""}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What are you testing?"
                />
              </div>
              <div>
                <Label>Primary Metric</Label>
                <Select
                  value={newExperiment.metrics?.primary || "click_through_rate"}
                  onValueChange={(value) => setNewExperiment(prev => ({
                    ...prev,
                    metrics: { ...prev.metrics!, primary: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="click_through_rate">Click-through Rate</SelectItem>
                    <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                    <SelectItem value="engagement_time">Engagement Time</SelectItem>
                    <SelectItem value="bounce_rate">Bounce Rate</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateExperiment}>
                Create Experiment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experiments List */}
      {experiments.length === 0 ? (
              <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Experiments</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first experiment to start optimizing your integration
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Experiment
                  </Button>
                </CardContent>
              </Card>
            ) : (
        <div className="space-y-4">
          {experiments.map((experiment) => (
            <Card key={experiment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TestTube className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                      <CardTitle className="text-base">{experiment.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{experiment.description}</p>
                      </div>
                    </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(experiment.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingExperiment(experiment)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        {experiment.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleStartExperiment(experiment.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </DropdownMenuItem>
                        )}
                    {experiment.status === "running" && (
                          <DropdownMenuItem onClick={() => handlePauseExperiment(experiment.id)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {experiment.status === "paused" && (
                          <DropdownMenuItem onClick={() => handleStartExperiment(experiment.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        {(experiment.status === "running" || experiment.status === "paused") && (
                          <DropdownMenuItem onClick={() => handleStopExperiment(experiment.id)}>
                            <Square className="h-4 w-4 mr-2" />
                            Stop
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteExperiment(experiment.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                          </div>
                        </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                    <Label className="text-xs text-muted-foreground">Primary Metric</Label>
                    <p className="text-sm font-medium mt-1">
                      {getMetricName(experiment.metrics.primary)}
                    </p>
                        </div>
                        <div>
                    <Label className="text-xs text-muted-foreground">Traffic Split</Label>
                    <p className="text-sm font-medium mt-1">
                      {experiment.trafficSplit}% to variant
                    </p>
                        </div>
                        <div>
                    <Label className="text-xs text-muted-foreground">Created</Label>
                    <p className="text-sm mt-1">
                      {new Date(experiment.createdAt).toLocaleDateString()}
                    </p>
                        </div>
                      </div>

                {experiment.variants.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-xs text-muted-foreground">Variants</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {experiment.variants.map((variant) => (
                        <div key={variant.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="text-sm font-medium">{variant.name}</span>
                            {variant.isControl && (
                              <Badge variant="outline" className="ml-2 text-xs">Control</Badge>
                      )}
                    </div>
                          <span className="text-sm text-muted-foreground">{variant.traffic}%</span>
                      </div>
                          ))}
                        </div>
                      </div>
                )}

                {experiment.results && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Winner Determined: {experiment.results.winner} shows {experiment.results.improvement}% improvement
                      </span>
                </div>
                    <div className="text-xs text-green-700">
                      Confidence: {experiment.results.confidence}% • 
                      Significance: {experiment.results.significance ? "Yes" : "No"}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">4,247</div>
                    <div className="text-xs text-muted-foreground">Control Visitors</div>
                </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">4,183</div>
                    <div className="text-xs text-muted-foreground">Variant Visitors</div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}
