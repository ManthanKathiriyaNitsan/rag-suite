import React, { useState, useCallback, useMemo } from "react";
import { HelpCircle, Book, ExternalLink, PlayCircle, CheckCircle, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";
import { Progress } from "@/components/ui/Progress";

interface HelpGuide {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    completed?: boolean;
  }>;
  videoUrl?: string;
  docsUrl?: string;
}

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
}

// todo: remove mock functionality
const gettingStartedGuides: HelpGuide[] = [
  {
    id: "setup-first-source",
    title: "Set Up Your First Crawl Source",
    description: "Learn how to add and configure your first website for crawling and indexing.",
    duration: "5 minutes",
    difficulty: "beginner",
    category: "Setup",
    steps: [
      {
        id: "step-1",
        title: "Navigate to Crawl Sources",
        description: "Go to the Crawl section in the sidebar and click on Sources.",
        completed: true,
      },
      {
        id: "step-2",
        title: "Add New Source",
        description: "Click the 'Add Source' button and enter your website URL.",
        completed: true,
      },
      {
        id: "step-3",
        title: "Configure Settings",
        description: "Set crawl depth, frequency, and any URL patterns.",
        completed: false,
      },
      {
        id: "step-4",
        title: "Start Initial Crawl",
        description: "Save your source and trigger the first crawl job.",
        completed: false,
      },
    ],
    videoUrl: "https://youtu.be/example-setup-video",
    docsUrl: "https://docs.ragsuite.com/getting-started/first-source",
  },
  {
    id: "configure-rag-settings",
    title: "Configure RAG Settings",
    description: "Optimize your AI responses by tuning RAG parameters in the playground.",
    duration: "8 minutes",
    difficulty: "intermediate",
    category: "Configuration",
    steps: [
      {
        id: "step-1",
        title: "Open RAG Tuning",
        description: "Navigate to the RAG Tuning page from the sidebar.",
      },
      {
        id: "step-2",
        title: "Understand Parameters",
        description: "Learn about top-K, similarity threshold, and temperature settings.",
      },
      {
        id: "step-3",
        title: "Test Queries",
        description: "Run test queries to see how different settings affect responses.",
      },
      {
        id: "step-4",
        title: "Save Optimal Settings",
        description: "Apply the best performing configuration to your integration.",
      },
    ],
    docsUrl: "https://docs.ragsuite.com/rag-tuning/configuration",
  },
  {
    id: "embed-widget",
    title: "Embed Widget on Your Website",
    description: "Add the AI chat widget to your website or application.",
    duration: "10 minutes",
    difficulty: "beginner",
    category: "Integration",
    steps: [
      {
        id: "step-1",
        title: "Create Integration",
        description: "Set up a new integration in the Integrations section.",
      },
      {
        id: "step-2",
        title: "Generate API Key",
        description: "Create an API key for your website integration.",
      },
      {
        id: "step-3",
        title: "Copy Embed Code",
        description: "Get the HTML/JavaScript code snippet for your site.",
      },
      {
        id: "step-4",
        title: "Add to Website",
        description: "Paste the code into your website's HTML.",
      },
      {
        id: "step-5",
        title: "Test & Customize",
        description: "Verify the widget works and customize its appearance.",
      },
    ],
    videoUrl: "https://youtu.be/example-embed-video",
    docsUrl: "https://docs.ragsuite.com/integrations/embed-widget",
  },
];

const helpTopics: HelpTopic[] = [
  {
    id: "api-reference",
    title: "API Reference",
    description: "Complete documentation for the RAGSuite REST API",
    url: "https://docs.ragsuite.com/api",
    category: "API",
  },
  {
    id: "webhook-setup",
    title: "Webhook Configuration",
    description: "Set up webhooks to receive real-time updates",
    url: "https://docs.ragsuite.com/webhooks",
    category: "Integration",
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting Guide",
    description: "Common issues and their solutions",
    url: "https://docs.ragsuite.com/troubleshooting",
    category: "Support",
  },
  {
    id: "security-best-practices",
    title: "Security Best Practices",
    description: "Keep your RAG system secure and compliant",
    url: "https://docs.ragsuite.com/security",
    category: "Security",
  },
  {
    id: "performance-optimization",
    title: "Performance Optimization",
    description: "Tips to improve response times and accuracy",
    url: "https://docs.ragsuite.com/optimization",
    category: "Performance",
  },
];

interface HelpSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HelpSystem = React.memo(function HelpSystem({ open, onOpenChange }: HelpSystemProps) {
  const [selectedGuide, setSelectedGuide] = useState<HelpGuide | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // 🚀 Memoize difficulty color function
  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "default";
      case "intermediate":
        return "secondary";
      case "advanced":
        return "destructive";
      default:
        return "outline";
    }
  }, []);

  // 🚀 Memoize progress calculation
  const getProgressPercentage = useCallback((guide: HelpGuide) => {
    const completedCount = guide.steps.filter(step => 
      step.completed || completedSteps.has(step.id)
    ).length;
    return (completedCount / guide.steps.length) * 100;
  }, [completedSteps]);

  // 🚀 Memoize step completion handler
  const markStepCompleted = useCallback((stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl  py-6 px-2 md:p-6 max-h-[100vh]  overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Documentation
          </DialogTitle>
          <DialogDescription>
            Get started quickly with guides, tutorials, and comprehensive documentation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid  gap-6 lg:grid-cols-2">
          {/* Getting Started Guides */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Getting Started</h3>
            {gettingStartedGuides.map((guide) => (
              <Card key={guide.id} className="cursor-pointer hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{guide.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                    </div>
                    <Badge variant={getDifficultyColor(guide.difficulty)} className="text-xs">
                      {guide.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {guide.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {guide.steps.filter(s => s.completed || completedSteps.has(s.id)).length}/{guide.steps.length} steps
                    </div>
                  </div>
                  
                  <Progress value={getProgressPercentage(guide)} className="h-2" />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGuide(guide)}
                      data-testid={`button-start-guide-${guide.id}`}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      {getProgressPercentage(guide) > 0 ? "Continue" : "Start"}
                    </Button>
                    {guide.videoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(guide.videoUrl, "_blank")}
                        data-testid={`button-video-${guide.id}`}
                      >
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Video
                      </Button>
                    )}
                    {guide.docsUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(guide.docsUrl, "_blank")}
                        data-testid={`button-docs-${guide.id}`}
                      >
                        <Book className="h-4 w-4 mr-1" />
                        Docs
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Documentation Topics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentation</h3>
            <div className="space-y-2">
              {helpTopics.map((topic) => (
                <Card key={topic.id} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{topic.title}</h4>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {topic.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(topic.url, "_blank")}
                        data-testid={`button-topic-${topic.id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="font-medium">Quick Links</h4>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open("https://docs.ragsuite.com", "_blank")}
                  data-testid="button-full-docs"
                >
                  <Book className="h-4 w-4 mr-2" />
                  Complete Documentation
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open("https://community.ragsuite.com", "_blank")}
                  data-testid="button-community"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Community Forum
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open("mailto:support@ragsuite.com", "_blank")}
                  data-testid="button-support"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Guide Detail Modal */}
        {selectedGuide && (
          <Dialog open={!!selectedGuide} onOpenChange={() => setSelectedGuide(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedGuide.title}</DialogTitle>
                <DialogDescription>{selectedGuide.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant={getDifficultyColor(selectedGuide.difficulty)}>
                    {selectedGuide.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedGuide.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {selectedGuide.steps.filter(s => s.completed || completedSteps.has(s.id)).length}/{selectedGuide.steps.length} completed
                  </div>
                </div>

                <Progress value={getProgressPercentage(selectedGuide)} className="h-2" />

                <div className="space-y-2">
                  {selectedGuide.steps.map((step, index) => {
                    const isCompleted = step.completed || completedSteps.has(step.id);
                    return (
                      <Collapsible key={step.id}>
                        <CollapsibleTrigger className="flex items-center gap-3 w-full p-3 text-left rounded-lg border hover-elevate">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{step.title}</p>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-9 pr-3 pb-3">
                          <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                          {!isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => markStepCompleted(step.id)}
                              data-testid={`button-complete-step-${step.id}`}
                            >
                              Mark as Complete
                            </Button>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {selectedGuide.videoUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedGuide.videoUrl, "_blank")}
                      data-testid="button-guide-video"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Watch Video
                    </Button>
                  )}
                  {selectedGuide.docsUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedGuide.docsUrl, "_blank")}
                      data-testid="button-guide-docs"
                    >
                      <Book className="h-4 w-4 mr-2" />
                      Read Docs
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default HelpSystem;
