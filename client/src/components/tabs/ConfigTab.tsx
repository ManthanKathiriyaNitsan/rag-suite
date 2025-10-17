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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import {
  Sliders,
  Brain,
  Zap,
  Target,
  Clock,
  Shield,
  MessageSquare,
  Search,
  Lightbulb,
  Quote,
  Settings,
  Save,
  RefreshCw,
} from "lucide-react";

interface ConfigData {
  // RAG Settings
  ragModel: string;
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  contextWindow: number;
  retrievalCount: number;
  similarityThreshold: number;
  
  // Feature Toggles
  enableChat: boolean;
  enableSearch: boolean;
  enableSuggestions: boolean;
  enableCitations: boolean;
  enableFollowUps: boolean;
  
  // Response Settings
  responseMode: string;
  fallbackResponse: string;
  maxResponseLength: number;
  enableStreaming: boolean;
  
  // Advanced Settings
  customPrompts: {
    system: string;
    user: string;
    assistant: string;
  };
  filters: {
    dateRange: string;
    documentTypes: string[];
    sources: string[];
  };
  caching: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
}

interface ConfigTabProps {
  data: ConfigData;
  onChange: (config: ConfigData) => void;
}

export default function ConfigTab({ data, onChange }: ConfigTabProps) {
  const [config, setConfig] = useState<ConfigData>(data || {
    ragModel: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 1000,
    topK: 5,
    topP: 0.9,
    contextWindow: 4000,
    retrievalCount: 5,
    similarityThreshold: 0.7,
    enableChat: true,
    enableSearch: true,
    enableSuggestions: true,
    enableCitations: true,
    enableFollowUps: true,
    responseMode: "balanced",
    fallbackResponse: "I'm sorry, I couldn't find relevant information to answer your question.",
    maxResponseLength: 500,
    enableStreaming: true,
    customPrompts: {
      system: "You are a helpful AI assistant that provides accurate and relevant information.",
      user: "User question: {question}",
      assistant: "Based on the provided context, here's what I found:",
    },
    filters: {
      dateRange: "all",
      documentTypes: [],
      sources: [],
    },
    caching: {
      enabled: true,
      ttl: 3600,
      maxSize: 1000,
    },
  });

  useEffect(() => {
    setConfig(data || config);
  }, [data]);

  const handleConfigChange = (field: string, value: any) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
    onChange(updated);
  };

  const handleNestedConfigChange = (path: string, value: any) => {
    const keys = path.split('.');
    const updated = { ...config };
    let current = updated;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setConfig(updated);
    onChange(updated);
  };

  const formatTemperature = (value: number) => {
    return value.toFixed(1);
  };

  const formatSimilarity = (value: number) => {
    return (value * 100).toFixed(0) + '%';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure RAG model settings, features, and advanced options
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rag" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rag">RAG Settings</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="rag" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-5 w-5" />
                RAG Model Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rag-model">RAG Model</Label>
                  <Select
                    value={config.ragModel}
                    onValueChange={(value) => handleConfigChange('ragModel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                    min="100"
                    max="4000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="temperature">Temperature: {formatTemperature(config.temperature)}</Label>
                <Slider
                  value={[config.temperature]}
                  onValueChange={(value) => handleConfigChange('temperature', value[0])}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>More Focused</span>
                  <span>More Creative</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="top-k">Top K</Label>
                  <Input
                    id="top-k"
                    type="number"
                    value={config.topK}
                    onChange={(e) => handleConfigChange('topK', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <Label htmlFor="top-p">Top P</Label>
                  <Input
                    id="top-p"
                    type="number"
                    value={config.topP}
                    onChange={(e) => handleConfigChange('topP', parseFloat(e.target.value))}
                    min="0"
                    max="1"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="context-window">Context Window</Label>
                  <Input
                    id="context-window"
                    type="number"
                    value={config.contextWindow}
                    onChange={(e) => handleConfigChange('contextWindow', parseInt(e.target.value))}
                    min="1000"
                    max="32000"
                  />
                </div>
                <div>
                  <Label htmlFor="retrieval-count">Retrieval Count</Label>
                  <Input
                    id="retrieval-count"
                    type="number"
                    value={config.retrievalCount}
                    onChange={(e) => handleConfigChange('retrievalCount', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="similarity-threshold">Similarity Threshold: {formatSimilarity(config.similarityThreshold)}</Label>
                <Slider
                  value={[config.similarityThreshold]}
                  onValueChange={(value) => handleConfigChange('similarityThreshold', value[0])}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Less Strict</span>
                  <span>More Strict</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label htmlFor="enable-chat">Chat Interface</Label>
                      <p className="text-sm text-muted-foreground">Enable conversational chat functionality</p>
                    </div>
                  </div>
                  <Switch
                    id="enable-chat"
                    checked={config.enableChat}
                    onCheckedChange={(checked) => handleConfigChange('enableChat', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-green-500" />
                    <div>
                      <Label htmlFor="enable-search">Search Functionality</Label>
                      <p className="text-sm text-muted-foreground">Enable document search and retrieval</p>
                    </div>
                  </div>
                  <Switch
                    id="enable-search"
                    checked={config.enableSearch}
                    onCheckedChange={(checked) => handleConfigChange('enableSearch', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <div>
                      <Label htmlFor="enable-suggestions">Smart Suggestions</Label>
                      <p className="text-sm text-muted-foreground">Provide intelligent response suggestions</p>
                    </div>
                  </div>
                  <Switch
                    id="enable-suggestions"
                    checked={config.enableSuggestions}
                    onCheckedChange={(checked) => handleConfigChange('enableSuggestions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Quote className="h-5 w-5 text-purple-500" />
                    <div>
                      <Label htmlFor="enable-citations">Citations</Label>
                      <p className="text-sm text-muted-foreground">Include source citations in responses</p>
                    </div>
                  </div>
                  <Switch
                    id="enable-citations"
                    checked={config.enableCitations}
                    onCheckedChange={(checked) => handleConfigChange('enableCitations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-orange-500" />
                    <div>
                      <Label htmlFor="enable-follow-ups">Follow-up Questions</Label>
                      <p className="text-sm text-muted-foreground">Enable follow-up question suggestions</p>
                    </div>
                  </div>
                  <Switch
                    id="enable-follow-ups"
                    checked={config.enableFollowUps}
                    onCheckedChange={(checked) => handleConfigChange('enableFollowUps', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Response Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="response-mode">Response Mode</Label>
                <Select
                  value={config.responseMode}
                  onValueChange={(value) => handleConfigChange('responseMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fallback-response">Fallback Response</Label>
                <Textarea
                  id="fallback-response"
                  value={config.fallbackResponse}
                  onChange={(e) => handleConfigChange('fallbackResponse', e.target.value)}
                  placeholder="Default response when no relevant information is found"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-response-length">Max Response Length</Label>
                  <Input
                    id="max-response-length"
                    type="number"
                    value={config.maxResponseLength}
                    onChange={(e) => handleConfigChange('maxResponseLength', parseInt(e.target.value))}
                    min="100"
                    max="2000"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-streaming">Streaming Responses</Label>
                    <p className="text-sm text-muted-foreground">Enable real-time response streaming</p>
                  </div>
                  <Switch
                    id="enable-streaming"
                    checked={config.enableStreaming}
                    onCheckedChange={(checked) => handleConfigChange('enableStreaming', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={config.customPrompts.system}
                  onChange={(e) => handleNestedConfigChange('customPrompts.system', e.target.value)}
                  placeholder="System instructions for the AI model"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="user-prompt">User Prompt Template</Label>
                <Textarea
                  id="user-prompt"
                  value={config.customPrompts.user}
                  onChange={(e) => handleNestedConfigChange('customPrompts.user', e.target.value)}
                  placeholder="Template for user questions"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="assistant-prompt">Assistant Prompt Template</Label>
                <Textarea
                  id="assistant-prompt"
                  value={config.customPrompts.assistant}
                  onChange={(e) => handleNestedConfigChange('customPrompts.assistant', e.target.value)}
                  placeholder="Template for assistant responses"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cache-ttl">Cache TTL (seconds)</Label>
                  <Input
                    id="cache-ttl"
                    type="number"
                    value={config.caching.ttl}
                    onChange={(e) => handleNestedConfigChange('caching.ttl', parseInt(e.target.value))}
                    min="60"
                    max="86400"
                  />
                </div>
                <div>
                  <Label htmlFor="cache-max-size">Cache Max Size</Label>
                  <Input
                    id="cache-max-size"
                    type="number"
                    value={config.caching.maxSize}
                    onChange={(e) => handleNestedConfigChange('caching.maxSize', parseInt(e.target.value))}
                    min="100"
                    max="10000"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-caching">Enable Caching</Label>
                  <p className="text-sm text-muted-foreground">Cache responses for improved performance</p>
                </div>
                <Switch
                  id="enable-caching"
                  checked={config.caching.enabled}
                  onCheckedChange={(checked) => handleNestedConfigChange('caching.enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}