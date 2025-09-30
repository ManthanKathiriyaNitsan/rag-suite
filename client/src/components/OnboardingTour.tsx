import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for target element
  position: "top" | "bottom" | "left" | "right";
  action?: "click" | "hover" | "none";
  actionText?: string;
}

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to RAGSuite!",
    content: "Let's take a quick tour to get you started with your AI-powered search and chatbot platform.",
    target: "body",
    position: "bottom",
    action: "none",
  },
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    content: "Use the sidebar to navigate between different sections of your platform. You can access all major features from here.",
    target: "[data-testid='sidebar']",
    position: "right",
    action: "none",
  },
  {
    id: "search",
    title: "Global Search",
    content: "Press ⌘K (Ctrl+K) or click here to open the command palette for quick navigation and actions.",
    target: "[data-testid='button-search']",
    position: "bottom",
    action: "click",
    actionText: "Try opening search",
  },
  {
    id: "notifications",
    title: "Notifications",
    content: "Stay updated with system alerts, crawl status updates, and important notifications.",
    target: "[data-testid='button-notifications']",
    position: "bottom",
    action: "click",
    actionText: "View notifications",
  },
  {
    id: "crawl-sources",
    title: "Crawl Sources",
    content: "Add and manage your website sources for content crawling. This is where you configure what content to index.",
    target: "[data-testid='button-add-source']",
    position: "bottom",
    action: "hover",
    actionText: "Hover to explore",
  },
  {
    id: "documents",
    title: "Document Library",
    content: "View and manage all your indexed documents. Upload additional files or browse crawled content.",
    target: "[data-testid='button-upload-document']",
    position: "left",
    action: "none",
  },
  {
    id: "widget-demo",
    title: "Embeddable Widget",
    content: "This is your AI assistant widget that can be embedded on any website. Try chatting with it!",
    target: "[data-testid='button-widget-launcher']",
    position: "left",
    action: "click",
    actionText: "Open widget demo",
  },
];

export function OnboardingTour({ isActive, onComplete, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const [originalStyles, setOriginalStyles] = useState<{
    position: string;
    zIndex: string;
    boxShadow: string;
    borderRadius: string;
  } | null>(null);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  useEffect(() => {
    if (!isActive) return;

    const target = document.querySelector(step.target) as HTMLElement;
    if (target) {
      setHighlightElement(target);
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Store original styles
      const computed = window.getComputedStyle(target);
      const original = {
        position: target.style.position || computed.position,
        zIndex: target.style.zIndex || computed.zIndex,
        boxShadow: target.style.boxShadow || computed.boxShadow,
        borderRadius: target.style.borderRadius || computed.borderRadius,
      };
      setOriginalStyles(original);
      
      // Apply highlighting without breaking layout - preserve original border radius
      target.style.zIndex = "9999";
      target.style.boxShadow = "0 0 0 4px rgb(59 130 246 / 0.5), 0 0 0 8px rgb(59 130 246 / 0.2)";
      // Only apply border radius if none exists, otherwise preserve original
      if (!computed.borderRadius || computed.borderRadius === "0px") {
        target.style.borderRadius = "8px";
      }
      
      // Add event listeners for real user interactions
      const handleHover = () => {
        if (step.action === "hover") {
          setIsStepCompleted(true);
        }
      };
      
      const handleClick = () => {
        if (step.action === "click") {
          setIsStepCompleted(true);
        }
      };
      
      target.addEventListener("mouseenter", handleHover);
      target.addEventListener("click", handleClick);
      
      return () => {
        target.removeEventListener("mouseenter", handleHover);
        target.removeEventListener("click", handleClick);
      };
    }

    return () => {
      // Cleanup function will run in the next useEffect cleanup
    };
  }, [currentStep, step.target, step.action, isActive]);

  // Cleanup effect for restoring styles
  useEffect(() => {
    return () => {
      if (highlightElement && originalStyles) {
        highlightElement.style.position = originalStyles.position === "static" ? "" : originalStyles.position;
        highlightElement.style.zIndex = originalStyles.zIndex === "auto" ? "" : originalStyles.zIndex;
        highlightElement.style.boxShadow = originalStyles.boxShadow === "none" ? "" : originalStyles.boxShadow;
        highlightElement.style.borderRadius = originalStyles.borderRadius === "0px" ? "" : originalStyles.borderRadius;
      }
    };
  }, [highlightElement, originalStyles]);

  const handleNext = () => {
    // Restore styles before moving to next step
    if (highlightElement && originalStyles) {
      highlightElement.style.position = originalStyles.position === "static" ? "" : originalStyles.position;
      highlightElement.style.zIndex = originalStyles.zIndex === "auto" ? "" : originalStyles.zIndex;
      highlightElement.style.boxShadow = originalStyles.boxShadow === "none" ? "" : originalStyles.boxShadow;
      highlightElement.style.borderRadius = originalStyles.borderRadius === "0px" ? "" : originalStyles.borderRadius;
    }
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsStepCompleted(false);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    // Restore styles before moving to previous step
    if (highlightElement && originalStyles) {
      highlightElement.style.position = originalStyles.position === "static" ? "" : originalStyles.position;
      highlightElement.style.zIndex = originalStyles.zIndex === "auto" ? "" : originalStyles.zIndex;
      highlightElement.style.boxShadow = originalStyles.boxShadow === "none" ? "" : originalStyles.boxShadow;
      highlightElement.style.borderRadius = originalStyles.borderRadius === "0px" ? "" : originalStyles.borderRadius;
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsStepCompleted(false);
    }
  };

  const handleSkip = () => {
    // Restore styles before closing
    if (highlightElement && originalStyles) {
      highlightElement.style.position = originalStyles.position === "static" ? "" : originalStyles.position;
      highlightElement.style.zIndex = originalStyles.zIndex === "auto" ? "" : originalStyles.zIndex;
      highlightElement.style.boxShadow = originalStyles.boxShadow === "none" ? "" : originalStyles.boxShadow;
      highlightElement.style.borderRadius = originalStyles.borderRadius === "0px" ? "" : originalStyles.borderRadius;
    }
    onClose();
  };

  const handleActionClick = () => {
    if (step.action === "click" && highlightElement) {
      // Simulate click to trigger the actual functionality
      highlightElement.click();
      setIsStepCompleted(true);
    } else if (step.action === "hover") {
      setIsStepCompleted(true);
    }
  };

  if (!isActive) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" />
      
      {/* Tour Card */}
      <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 z-[9999] shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Step {currentStep + 1} of {tourSteps.length}
              </Badge>
              {isStepCompleted && (
                <Badge variant="default" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-lg">{step.title}</CardTitle>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.content}
          </p>
          
          {step.action && step.action !== "none" && (
            <div className="p-3 bg-secondary rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={handleActionClick}
                disabled={isStepCompleted}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {step.actionText || "Complete action"}
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
              >
                Skip Tour
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                disabled={step.action && step.action !== "none" && !isStepCompleted}
              >
                {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}