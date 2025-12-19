import { useState } from "react";
import { Bot, Upload, Globe, Search, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchBar } from "@/components/common/SearchBar";
import ChatMessage from "@/components/common/ChatMessage";
import { BackgroundWrapper } from "@/components/common/BackgroundWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

const steps = [
  { id: 1, title: "Branding", description: "Customize your organization" },
  { id: 2, title: "Data Source", description: "Add your first content source" },
  { id: 3, title: "Quick Test", description: "Test your RAG system" },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1F6FEB");
  const [sourceUrl, setSourceUrl] = useState("");
  const [crawlDepth, setCrawlDepth] = useState(2);
  const [cadence, setCadence] = useState("daily");
  const [headlessMode, setHeadlessMode] = useState(false);
  const [testQuery, setTestQuery] = useState("");
  const [testResponse, setTestResponse] = useState<any>(null);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    console.log("Onboarding completed, redirecting to dashboard");
    // In real app, would redirect to overview
  };

  const handleTestQuery = (query: string) => {
    setTestQuery(query);

    // Simulate streaming response
    const response = {
      type: "assistant" as const,
      content: `Based on your query "${query}", here's what I found from your newly configured data source:

This is a simulated response showing how your RAG system will work with the content from ${sourceUrl}. The system has successfully:

✅ Crawled your specified URL with depth ${crawlDepth}
✅ Processed and indexed the content  
✅ Generated relevant responses using AI

Your RAG system is ready to help users find information from your documentation!`,
      citations: [
        { title: "Getting Started Guide", url: sourceUrl, snippet: "Initial setup and configuration..." },
        { title: "API Reference", url: `${sourceUrl}/api`, snippet: "Complete API documentation..." },
      ],
      timestamp: new Date(),
    };

    setTestResponse(response);
    console.log("Test query:", query);
  };

  return (
    <div className="relative min-h-screen">
      {/* Theme-aware Background */}
      <BackgroundWrapper />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-0 sm:px-3 md:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold">RAGSuite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome to RAGSuite!</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Let's get your AI-powered search and chat system set up in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center min-w-0 flex-shrink-0">
                <div className="flex items-center">
                  <div
                    className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                      ${currentStep > step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'}
                    `}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <span className="font-medium text-sm sm:text-base">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-2 sm:ml-3 text-left hidden sm:block">
                    <p className="font-medium text-sm sm:text-base">{step.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      ml-4 sm:ml-8 w-8 sm:w-16 h-0.5
                      ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
            {/* Left Panel - Form */}
            <GlassCard className="order-2 lg:order-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Step 1: Branding */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input
                        id="org-name"
                        placeholder="Enter your organization name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        data-testid="input-org-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="logo-upload">Logo Upload (Optional)</Label>
                      <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                        </div>
                        <Button variant="outline" data-testid="button-upload-logo" className="w-full sm:w-auto">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="mt-2 flex items-center gap-3 sm:gap-4">
                        <div
                          className="h-8 w-16 sm:h-10 sm:w-20 rounded border flex-shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <Input
                          id="primary-color"
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-16 sm:w-20"
                          data-testid="input-primary-color"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Data Source */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="source-url">Website URL</Label>
                      <Input
                        id="source-url"
                        placeholder="https://docs.yourcompany.com"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        data-testid="input-source-url"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter the URL of your documentation or content site
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="crawl-depth">Crawl Depth</Label>
                      <Select value={crawlDepth.toString()} onValueChange={(value) => setCrawlDepth(parseInt(value))}>
                        <SelectTrigger data-testid="select-crawl-depth">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 level (homepage only)</SelectItem>
                          <SelectItem value="2">2 levels (recommended)</SelectItem>
                          <SelectItem value="3">3 levels</SelectItem>
                          <SelectItem value="4">4 levels</SelectItem>
                          <SelectItem value="5">5 levels (deep crawl)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cadence">Crawl Frequency</Label>
                      <Select value={cadence} onValueChange={setCadence}>
                        <SelectTrigger data-testid="select-cadence">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Daily (recommended)</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1 pr-4">
                        <Label htmlFor="headless-mode">Headless Browser Mode</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Enable for JavaScript-heavy sites
                        </p>
                      </div>
                      <Switch
                        id="headless-mode"
                        checked={headlessMode}
                        onCheckedChange={setHeadlessMode}
                        data-testid="switch-headless-mode"
                        className="flex-shrink-0"
                      />
                    </div>

                    <Button variant="outline" className="w-full" data-testid="button-preview-render">
                      <Globe className="h-4 w-4 mr-2" />
                      Preview Render
                    </Button>
                  </div>
                )}

                {/* Step 3: Quick Test */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Test Your RAG System</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ask a question to see how your AI assistant will respond using your configured data source.
                      </p>
                      <SearchBar
                        placeholder="Ask about your documentation..."
                        onSearch={handleTestQuery}
                        showSendButton
                        data-testid="test-query-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Example Queries:</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          "How do I get started?",
                          "What are the API endpoints?",
                          "How to configure authentication?",
                          "What are the system requirements?",
                        ].map((query, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestQuery(query)}
                            data-testid={`example-query-${index}`}
                            className="text-left justify-start h-auto py-2 px-3"
                          >
                            {query}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {testResponse && (
                      <div className="mt-6">
                        <Label className="mb-2 block">AI Response:</Label>
                        <div className="border rounded-lg p-4">
                          <ChatMessage
                            type={testResponse.type}
                            content={testResponse.content}
                            citations={testResponse.citations}
                            timestamp={testResponse.timestamp}
                            showFeedback={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 sm:pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    data-testid="button-back"
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (currentStep === 1 && !orgName) ||
                        (currentStep === 2 && !sourceUrl)
                      }
                      data-testid="button-next"
                      className="w-full sm:w-auto group"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinish}
                      data-testid="button-finish"
                      className="w-full sm:w-auto group"
                    >
                      Finish Setup
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </GlassCard>

            {/* Right Panel - Live Preview */}
            <GlassCard className="order-1 lg:order-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        <span className="font-semibold text-sm sm:text-base truncate">{orgName || "Your Organization"}</span>
                      </div>
                      <Button style={{ backgroundColor: primaryColor }} className="text-white mb-3 sm:mb-4 w-full sm:w-auto">
                        Primary Button
                      </Button>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        This is how your branding will appear in the admin interface and embeddable widget.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-3 sm:p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Crawl Configuration</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-muted-foreground">URL:</span>
                          <span className="font-mono break-all text-right">{sourceUrl || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Depth:</span>
                          <span>{crawlDepth} levels</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Frequency:</span>
                          <span className="capitalize">{cadence}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Headless:</span>
                          <Badge variant={headlessMode ? "default" : "outline"} className="text-xs">
                            {headlessMode ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-3 sm:p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">System Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">Organization configured</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">Data source added</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">AI model ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">Vector database initialized</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
