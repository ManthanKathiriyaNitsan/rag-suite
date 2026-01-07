import React, { useState, useCallback, useMemo } from "react";
import { HelpCircle, Book, ExternalLink, PlayCircle, CheckCircle, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

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

// Getting Started Guides - Real functional guides
const gettingStartedGuides: HelpGuide[] = [
  {
    id: "setup-first-crawl-source",
    title: "Set Up Your First Crawl Source",
    description: "Learn how to add and configure your first website for crawling and indexing.",
    duration: "5 minutes",
    difficulty: "beginner",
    category: "Setup",
    steps: [
      {
        id: "step-1",
        title: "Navigate to Crawl Sources",
        description: "Go to the Crawl section in the sidebar and click on Sources tab.",
        completed: false,
      },
      {
        id: "step-2",
        title: "Add New Source",
        description: "Click the 'Add Source' button and enter your website URL.",
        completed: false,
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
    videoUrl: "https://docs.ragsuite.com/getting-started/first-crawl-source",
    docsUrl: "https://docs.ragsuite.com/getting-started/first-crawl-source",
  },
  {
    id: "setup-first-document-source",
    title: "Set Up Your First Document Source",
    description: "Learn how to upload and manage documents in your knowledge base.",
    duration: "5 minutes",
    difficulty: "beginner",
    category: "Setup",
    steps: [
      {
        id: "step-1",
        title: "Navigate to Documents",
        description: "Go to the Crawl section in the sidebar and click on Documents tab.",
        completed: false,
      },
      {
        id: "step-2",
        title: "Upload Document",
        description: "Click the 'Upload Document' button and select your file.",
        completed: false,
      },
      {
        id: "step-3",
        title: "Configure Metadata",
        description: "Add title, description, and tags to your document.",
        completed: false,
      },
      {
        id: "step-4",
        title: "Process Document",
        description: "Wait for the document to be processed and indexed.",
        completed: false,
      },
    ],
    videoUrl: "https://docs.ragsuite.com/getting-started/first-document-source",
    docsUrl: "https://docs.ragsuite.com/getting-started/first-document-source",
  },
  {
    id: "configure-chatbot",
    title: "Configure your Chatbot",
    description: "Customize your chatbot widget appearance, behavior, and AI settings.",
    duration: "10 minutes",
    difficulty: "beginner",
    category: "Configuration",
    steps: [
      {
        id: "step-1",
        title: "Navigate to Chatbot Configuration",
        description: "Go to Chatbot Configuration from the sidebar.",
        completed: false,
      },
      {
        id: "step-2",
        title: "Configure Appearance",
        description: "Customize colors, fonts, position, and trigger button settings.",
        completed: false,
      },
      {
        id: "step-3",
        title: "Set Up AI Model",
        description: "Choose your AI provider and configure model settings.",
        completed: false,
      },
      {
        id: "step-4",
        title: "Test Your Chatbot",
        description: "Use the preview to test your chatbot configuration.",
        completed: false,
      },
      {
        id: "step-5",
        title: "Get Embed Code",
        description: "Copy the integration code and add it to your website.",
        completed: false,
      },
    ],
    videoUrl: "https://docs.ragsuite.com/chatbot/configuration",
    docsUrl: "https://docs.ragsuite.com/chatbot/configuration",
  },
  {
    id: "configure-search",
    title: "Configure your Search",
    description: "Set up and customize your search widget with AI-powered search capabilities.",
    duration: "10 minutes",
    difficulty: "beginner",
    category: "Configuration",
    steps: [
      {
        id: "step-1",
        title: "Navigate to Search Configuration",
        description: "Go to Search Configuration from the sidebar.",
        completed: false,
      },
      {
        id: "step-2",
        title: "Configure Search Settings",
        description: "Set up search title, placeholder, suggestions, and appearance.",
        completed: false,
      },
      {
        id: "step-3",
        title: "Set Up AI Model",
        description: "Choose your AI provider and configure model settings for search.",
        completed: false,
      },
      {
        id: "step-4",
        title: "Test Your Search",
        description: "Use the Search Test tab to test your search configuration.",
        completed: false,
      },
      {
        id: "step-5",
        title: "Get Embed Code",
        description: "Copy the integration code and add it to your website.",
        completed: false,
      },
    ],
    videoUrl: "https://docs.ragsuite.com/search/configuration",
    docsUrl: "https://docs.ragsuite.com/search/configuration",
  },
];

interface HelpSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HelpSystem = React.memo(function HelpSystem({ open, onOpenChange }: HelpSystemProps) {
  const [selectedGuide, setSelectedGuide] = useState<HelpGuide | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();

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

  // 🚀 Handle guide start/continue - Just open the guide modal without redirecting
  const handleStartGuide = useCallback((guide: HelpGuide) => {
    // Just open the guide detail modal - don't redirect or close the help dialog
    setSelectedGuide(guide);
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

        <div className="space-y-6">
          {/* Getting Started Guides - Grid Layout */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Getting Started</h3>
            <div className="grid gap-4 md:grid-cols-2">
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
                        onClick={() => handleStartGuide(guide)}
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
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://nitsan.ai/contact/", "_blank")}
                data-testid="button-full-docs"
              >
              <ExternalLink className="h-4 w-4 mr-2" />
               NITSAN AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://t3planet.de/en/", "_blank")}
                data-testid="button-community"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
               T3Planet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://accesstive.com/", "_blank")}
                data-testid="button-support"
              >
        <ExternalLink className="h-4 w-4 mr-2" />
               Accesstive
              </Button>
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
