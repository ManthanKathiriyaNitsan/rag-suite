import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Separator } from "@/components/ui/Separator";
import { 
  Settings, 
  Brain, 
  Shield, 
  MessageSquare, 
  Search, 
  Clock,
  User,
  Globe,
  Lock,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

import { ConfigData, ConfigTabProps } from "@/types/components";

export default function ConfigTab({ data, onChange }: ConfigTabProps) {
  const [config, setConfig] = useState<ConfigData>(data);
  const [newBlockedTerm, setNewBlockedTerm] = useState("");
  const { toast } = useToast();

  // Sync local state when parent data changes (for edit mode)
  useEffect(() => {
    setConfig(data);
  }, [data, setConfig]);

  // Update parent state when config changes
  useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  const updateConfig = (updates: Partial<ConfigData>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addBlockedTerm = () => {
    if (!newBlockedTerm.trim()) return;
    
    updateConfig({
      blockedTerms: [...config.blockedTerms, newBlockedTerm.trim()]
    });
    setNewBlockedTerm("");
    
    toast({
      title: "Term added",
      description: "Blocked term has been added to the filter list",
    });
  };

  const removeBlockedTerm = (term: string) => {
    updateConfig({
      blockedTerms: config.blockedTerms.filter(t => t !== term)
    });
    
    toast({
      title: "Term removed",
      description: "Blocked term has been removed from the filter list",
    });
  };

  const resetToDefaults = () => {
    const defaultConfig: ConfigData = {
      // RAG Settings
      ragModel: "gpt-4-turbo",
      temperature: 0.7,
      maxTokens: 2048,
      topK: 40,
      topP: 0.9,
      contextWindow: 16000,
      retrievalCount: 5,
      similarityThreshold: 0.75,
      
      // Behavior Settings
      enableChat: true,
      enableSearch: true,
      enableSuggestions: true,
      enableCitations: true,
      enableFollowUps: true,
      
      // Response Behavior
      responseMode: "balanced",
      fallbackResponse: "I apologize, but I don't have enough information to answer that question accurately. Please try rephrasing your question or contact support for additional help.",
      maxResponseLength: 1000,
      enableStreaming: true,
      
      // Privacy & Security
      logConversations: true,
      retainData: true,
      dataRetentionDays: 90,
      allowAnonymous: true,
      requireAuth: false,
      allowedDomains: [],
      
      // Rate Limiting
      rateLimitPerUser: 100,
      rateLimitWindow: 60,
      
      // Content Filtering
      enableProfanityFilter: true,
      contentModerationLevel: "moderate",
      blockedTerms: [],
    };
    
    setConfig(defaultConfig);
    toast({
      title: "Settings reset",
      description: "All configuration settings have been reset to defaults",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Configuration Settings</h2>
        </div>
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          data-testid="button-reset-config"
        >
          Reset to Defaults
        </Button>
      </div>

      {/* RAG Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            RAG Model Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rag-model">AI Model</Label>
              <Select 
                value={config.ragModel} 
                onValueChange={(value) => updateConfig({ ragModel: value })}
              >
                <SelectTrigger id="rag-model" data-testid="select-rag-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context-window">Context Window</Label>
              <Select 
                value={config.contextWindow.toString()} 
                onValueChange={(value) => updateConfig({ contextWindow: parseInt(value) })}
              >
                <SelectTrigger id="context-window" data-testid="select-context-window">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4000">4K tokens</SelectItem>
                  <SelectItem value="8000">8K tokens</SelectItem>
                  <SelectItem value="16000">16K tokens</SelectItem>
                  <SelectItem value="32000">32K tokens</SelectItem>
                  <SelectItem value="128000">128K tokens</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Temperature</Label>
                <Badge variant="secondary" data-testid="badge-temperature">{config.temperature}</Badge>
              </div>
              <Slider
                value={[config.temperature]}
                onValueChange={(value) => updateConfig({ temperature: value[0] })}
                max={2}
                min={0}
                step={0.1}
                data-testid="slider-temperature"
              />
              <p className="text-sm text-muted-foreground">
                Controls randomness. Lower = more focused, Higher = more creative
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Max Tokens</Label>
                <Badge variant="secondary" data-testid="badge-max-tokens">{config.maxTokens}</Badge>
              </div>
              <Slider
                value={[config.maxTokens]}
                onValueChange={(value) => updateConfig({ maxTokens: value[0] })}
                max={4096}
                min={256}
                step={256}
                data-testid="slider-max-tokens"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Retrieval Count</Label>
                <Badge variant="secondary" data-testid="badge-retrieval-count">{config.retrievalCount}</Badge>
              </div>
              <Slider
                value={[config.retrievalCount]}
                onValueChange={(value) => updateConfig({ retrievalCount: value[0] })}
                max={20}
                min={1}
                step={1}
                data-testid="slider-retrieval-count"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Top K</Label>
                <Badge variant="secondary" data-testid="badge-top-k">{config.topK}</Badge>
              </div>
              <Slider
                value={[config.topK]}
                onValueChange={(value) => updateConfig({ topK: value[0] })}
                max={100}
                min={1}
                step={1}
                data-testid="slider-top-k"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Similarity Threshold</Label>
                <Badge variant="secondary" data-testid="badge-similarity">{config.similarityThreshold}</Badge>
              </div>
              <Slider
                value={[config.similarityThreshold]}
                onValueChange={(value) => updateConfig({ similarityThreshold: value[0] })}
                max={1}
                min={0}
                step={0.05}
                data-testid="slider-similarity"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Behavior Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-chat">Enable Chat Interface</Label>
                  <p className="text-sm text-muted-foreground">Allow users to have conversations</p>
                </div>
                <Switch
                  id="enable-chat"
                  checked={config.enableChat}
                  onCheckedChange={(checked) => updateConfig({ enableChat: checked })}
                  data-testid="switch-enable-chat"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-search">Enable Search Interface</Label>
                  <p className="text-sm text-muted-foreground">Allow direct search queries</p>
                </div>
                <Switch
                  id="enable-search"
                  checked={config.enableSearch}
                  onCheckedChange={(checked) => updateConfig({ enableSearch: checked })}
                  data-testid="switch-enable-search"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-citations">Show Citations</Label>
                  <p className="text-sm text-muted-foreground">Display source references</p>
                </div>
                <Switch
                  id="enable-citations"
                  checked={config.enableCitations}
                  onCheckedChange={(checked) => updateConfig({ enableCitations: checked })}
                  data-testid="switch-enable-citations"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-suggestions">Auto Suggestions</Label>
                  <p className="text-sm text-muted-foreground">Suggest related questions</p>
                </div>
                <Switch
                  id="enable-suggestions"
                  checked={config.enableSuggestions}
                  onCheckedChange={(checked) => updateConfig({ enableSuggestions: checked })}
                  data-testid="switch-enable-suggestions"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-followups">Follow-up Questions</Label>
                  <p className="text-sm text-muted-foreground">Generate conversation starters</p>
                </div>
                <Switch
                  id="enable-followups"
                  checked={config.enableFollowUps}
                  onCheckedChange={(checked) => updateConfig({ enableFollowUps: checked })}
                  data-testid="switch-enable-followups"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-streaming">Streaming Responses</Label>
                  <p className="text-sm text-muted-foreground">Stream responses as they generate</p>
                </div>
                <Switch
                  id="enable-streaming"
                  checked={config.enableStreaming}
                  onCheckedChange={(checked) => updateConfig({ enableStreaming: checked })}
                  data-testid="switch-enable-streaming"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="response-mode">Response Mode</Label>
                <Select 
                  value={config.responseMode} 
                  onValueChange={(value: "precise" | "balanced" | "creative") => updateConfig({ responseMode: value })}
                >
                  <SelectTrigger id="response-mode" data-testid="select-response-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="precise">Precise - Focus on accuracy</SelectItem>
                    <SelectItem value="balanced">Balanced - Mix of accuracy and creativity</SelectItem>
                    <SelectItem value="creative">Creative - More conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Max Response Length</Label>
                  <Badge variant="secondary" data-testid="badge-response-length">{config.maxResponseLength} chars</Badge>
                </div>
                <Slider
                  value={[config.maxResponseLength]}
                  onValueChange={(value) => updateConfig({ maxResponseLength: value[0] })}
                  max={3000}
                  min={100}
                  step={100}
                  data-testid="slider-response-length"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fallback-response">Fallback Response</Label>
              <Textarea
                id="fallback-response"
                value={config.fallbackResponse}
                onChange={(e) => updateConfig({ fallbackResponse: e.target.value })}
                placeholder="Message shown when AI cannot answer"
                rows={3}
                data-testid="textarea-fallback-response"
              />
              <p className="text-sm text-muted-foreground">
                This message is shown when the AI cannot find relevant information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="log-conversations">Log Conversations</Label>
                  <p className="text-sm text-muted-foreground">Store chat history for analytics</p>
                </div>
                <Switch
                  id="log-conversations"
                  checked={config.logConversations}
                  onCheckedChange={(checked) => updateConfig({ logConversations: checked })}
                  data-testid="switch-log-conversations"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="retain-data">Retain User Data</Label>
                  <p className="text-sm text-muted-foreground">Keep data for specified period</p>
                </div>
                <Switch
                  id="retain-data"
                  checked={config.retainData}
                  onCheckedChange={(checked) => updateConfig({ retainData: checked })}
                  data-testid="switch-retain-data"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-anonymous">Allow Anonymous Users</Label>
                  <p className="text-sm text-muted-foreground">No login required</p>
                </div>
                <Switch
                  id="allow-anonymous"
                  checked={config.allowAnonymous}
                  onCheckedChange={(checked) => updateConfig({ allowAnonymous: checked })}
                  data-testid="switch-allow-anonymous"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention (days)</Label>
                <Input
                  id="data-retention"
                  type="number"
                  value={config.dataRetentionDays}
                  onChange={(e) => updateConfig({ dataRetentionDays: parseInt(e.target.value) || 0 })}
                  disabled={!config.retainData}
                  data-testid="input-data-retention"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Rate Limit (per user/hour)</Label>
                  <Badge variant="secondary" data-testid="badge-rate-limit">{config.rateLimitPerUser}</Badge>
                </div>
                <Slider
                  value={[config.rateLimitPerUser]}
                  onValueChange={(value) => updateConfig({ rateLimitPerUser: value[0] })}
                  max={1000}
                  min={10}
                  step={10}
                  data-testid="slider-rate-limit"
                />
              </div>
            </div>
          </div>

          {!config.allowAnonymous && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Anonymous access is disabled. Users will need to authenticate before using the chat.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Content Filtering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Content Filtering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profanity-filter">Profanity Filter</Label>
                  <p className="text-sm text-muted-foreground">Block inappropriate language</p>
                </div>
                <Switch
                  id="profanity-filter"
                  checked={config.enableProfanityFilter}
                  onCheckedChange={(checked) => updateConfig({ enableProfanityFilter: checked })}
                  data-testid="switch-profanity-filter"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moderation-level">Content Moderation Level</Label>
              <Select 
                value={config.contentModerationLevel} 
                onValueChange={(value: "strict" | "moderate" | "relaxed") => updateConfig({ contentModerationLevel: value })}
              >
                <SelectTrigger id="moderation-level" data-testid="select-moderation-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict - Block all potentially harmful content</SelectItem>
                  <SelectItem value="moderate">Moderate - Block clearly inappropriate content</SelectItem>
                  <SelectItem value="relaxed">Relaxed - Minimal content filtering</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blocked-terms">Blocked Terms</Label>
              <div className="flex gap-2">
                <Input
                  id="blocked-terms"
                  value={newBlockedTerm}
                  onChange={(e) => setNewBlockedTerm(e.target.value)}
                  placeholder="Add term to block"
                  data-testid="input-blocked-term"
                />
                <Button 
                  onClick={addBlockedTerm}
                  disabled={!newBlockedTerm.trim()}
                  data-testid="button-add-blocked-term"
                >
                  Add
                </Button>
              </div>
            </div>

            {config.blockedTerms.length > 0 && (
              <div className="space-y-2">
                <Label>Current Blocked Terms</Label>
                <div className="flex flex-wrap gap-2">
                  {config.blockedTerms.map((term, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover-elevate"
                      onClick={() => removeBlockedTerm(term)}
                      data-testid={`badge-blocked-term-${index}`}
                    >
                      {term} ✕
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Click on a term to remove it
                </p>
              </div>
            )}
          </div>

          {config.enableProfanityFilter && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Profanity filtering is enabled. Messages containing inappropriate content will be blocked.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
