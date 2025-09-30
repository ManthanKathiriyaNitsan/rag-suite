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
import { SearchBar } from "@/components/SearchBar";
import { ChatMessage } from "@/components/ChatMessage";

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">RAGSuite</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to RAGSuite!</h1>
          <p className="text-muted-foreground">
            Let's get your AI-powered search and chat system set up in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${currentStep > step.id 
                        ? 'bg-primary text-primary-foreground' 
                        : currentStep === step.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'}
                    `}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3 text-left">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      ml-8 w-16 h-0.5
                      ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Panel - Form */}
            <Card>
              <CardHeader>
                <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      <div className="mt-2 flex items-center gap-4">
                        <div className="h-16 w-16 bg-secondary rounded-lg flex items-center justify-center">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <Button variant="outline" data-testid="button-upload-logo">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <div
                          className="h-10 w-20 rounded border"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <Input
                          id="primary-color"
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-20"
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
                      <div className="space-y-0.5">
                        <Label htmlFor="headless-mode">Headless Browser Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable for JavaScript-heavy sites
                        </p>
                      </div>
                      <Switch
                        id="headless-mode"
                        checked={headlessMode}
                        onCheckedChange={setHeadlessMode}
                        data-testid="switch-headless-mode"
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
                      <div className="flex flex-wrap gap-2">
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
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    data-testid="button-back"
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
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinish}
                      data-testid="button-finish"
                    >
                      Finish Setup
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Panel - Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-secondary rounded flex items-center justify-center">
                          <Upload className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">{orgName || "Your Organization"}</span>
                      </div>
                      <Button style={{ backgroundColor: primaryColor }} className="text-white mb-4">
                        Primary Button
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        This is how your branding will appear in the admin interface and embeddable widget.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Crawl Configuration</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">URL:</span>
                          <span className="font-mono break-all">{sourceUrl || "Not set"}</span>
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
                          <Badge variant={headlessMode ? "default" : "outline"}>
                            {headlessMode ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">System Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Organization configured</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Data source added</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">AI model ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Vector database initialized</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}