import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  position: "top" | "bottom" | "left" | "right" | "center";
  action?: "click" | "hover" | "none";
  actionText?: string;
  optional?: boolean; // Mark steps that may not have elements on all pages
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
    position: "center",
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
    content: "Add and manage your website sources for content crawling. This is where you configure what content to index. Navigate to the Crawl page to see this feature.",
    target: "[data-testid='button-add-source']",
    position: "bottom",
    action: "hover",
    actionText: "Hover to explore",
    optional: true, // Mark as optional so it doesn't block tour
  },
  {
    id: "documents",
    title: "Document Library",
    content: "View and manage all your indexed documents. Upload additional files or browse crawled content. Navigate to the Documents page to see this feature.",
    target: "[data-testid='button-upload-document']",
    position: "left",
    action: "none",
    optional: true, // Mark as optional so it doesn't block tour
  },
  {
    id: "widget-demo",
    title: "Embeddable Widget",
    content: "This is your AI assistant widget that can be embedded on any website. The widget launcher is typically in the bottom-right corner of your screen.",
    target: "[data-testid='button-widget-launcher']",
    position: "left",
    action: "click",
    actionText: "Open widget demo",
    optional: true, // Mark as optional so it doesn't block tour
  },
];

const OnboardingTour = React.memo(function OnboardingTour({ isActive, onComplete, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const [elementNotFound, setElementNotFound] = useState(false);
  const [cardPosition, setCardPosition] = useState<{ top?: number; left?: number; right?: number; bottom?: number }>({});
  const originalStylesRef = useRef<{ position: string; zIndex: string; boxShadow: string; borderRadius: string } | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Filter out optional steps where elements don't exist
  const availableSteps = useMemo(() => {
    return tourSteps.filter(step => {
      if (step.optional) {
        const element = document.querySelector(step.target);
        return element !== null;
      }
      return true;
    });
  }, []);

  const step = useMemo(() => availableSteps[currentStep] || tourSteps[0], [currentStep, availableSteps]);
  const progress = useMemo(() => ((currentStep + 1) / availableSteps.length) * 100, [currentStep, availableSteps.length]);

  // Calculate card position based on element position
  const calculateCardPosition = useCallback((element: HTMLElement, position: string) => {
    const rect = element.getBoundingClientRect();
    const cardWidth = 384; // w-96 = 384px
    const cardHeight = 300; // approximate height
    const spacing = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let cardPos: { top?: number; left?: number; right?: number; bottom?: number } = {};

    switch (position) {
      case "top":
        cardPos.bottom = viewportHeight - rect.top + spacing;
        cardPos.left = Math.max(spacing, Math.min(rect.left + rect.width / 2 - cardWidth / 2, viewportWidth - cardWidth - spacing));
        break;
      case "bottom":
        cardPos.top = rect.bottom + spacing;
        cardPos.left = Math.max(spacing, Math.min(rect.left + rect.width / 2 - cardWidth / 2, viewportWidth - cardWidth - spacing));
        break;
      case "left":
        cardPos.top = Math.max(spacing, Math.min(rect.top + rect.height / 2 - cardHeight / 2, viewportHeight - cardHeight - spacing));
        cardPos.right = viewportWidth - rect.left + spacing;
        break;
      case "right":
        cardPos.top = Math.max(spacing, Math.min(rect.top + rect.height / 2 - cardHeight / 2, viewportHeight - cardHeight - spacing));
        cardPos.left = rect.right + spacing;
        break;
      case "center":
      default:
        cardPos.top = viewportHeight / 2;
        cardPos.left = viewportWidth / 2;
        break;
    }

    return cardPos;
  }, []);

  // Cleanup function to restore element styles
  const restoreElementStyles = useCallback(() => {
    if (highlightElement && originalStylesRef.current) {
      const styles = originalStylesRef.current;
      highlightElement.style.position = styles.position === "static" ? "" : styles.position;
      highlightElement.style.zIndex = styles.zIndex === "auto" || styles.zIndex === "" ? "" : styles.zIndex;
      highlightElement.style.boxShadow = styles.boxShadow === "none" ? "" : styles.boxShadow;
      highlightElement.style.borderRadius = styles.borderRadius === "0px" ? "" : styles.borderRadius;
    }
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setHighlightElement(null);
    originalStylesRef.current = null;
  }, [highlightElement]);

  // Main effect to highlight elements
  useEffect(() => {
    if (!isActive) {
      restoreElementStyles();
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const target = document.querySelector(step.target) as HTMLElement;
      
      if (!target) {
        setElementNotFound(true);
        setHighlightElement(null);
        return;
      }

      setElementNotFound(false);
      setHighlightElement(target);

      // Calculate and set card position
      const pos = calculateCardPosition(target, step.position);
      setCardPosition(pos);

      // Scroll element into view
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

      // Store original styles
      const computed = window.getComputedStyle(target);
      originalStylesRef.current = {
        position: target.style.position || computed.position,
        zIndex: target.style.zIndex || computed.zIndex,
        boxShadow: target.style.boxShadow || computed.boxShadow,
        borderRadius: target.style.borderRadius || computed.borderRadius,
      };

      // Apply highlighting
      target.style.zIndex = "9999";
      target.style.boxShadow = "0 0 0 4px rgb(59 130 246 / 0.5), 0 0 0 8px rgb(59 130 246 / 0.2)";
      if (!computed.borderRadius || computed.borderRadius === "0px") {
        target.style.borderRadius = "8px";
      }

      // Add event listeners for interactions
      const handleHover = () => {
        if (step.action === "hover") {
          setIsStepCompleted(true);
        }
      };

      const handleClick = (e: Event) => {
        if (step.action === "click") {
          // Allow the click to process, then mark as completed
          setTimeout(() => {
            setIsStepCompleted(true);
          }, 300);
        }
      };

      target.addEventListener("mouseenter", handleHover);
      target.addEventListener("click", handleClick, true); // Use capture phase

      cleanupRef.current = () => {
        target.removeEventListener("mouseenter", handleHover);
        target.removeEventListener("click", handleClick, true);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      restoreElementStyles();
    };
  }, [currentStep, step.target, step.action, step.position, isActive, restoreElementStyles, calculateCardPosition]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    restoreElementStyles();
    
    if (currentStep < availableSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsStepCompleted(false);
      setElementNotFound(false);
    } else {
      restoreElementStyles();
      onComplete();
    }
  }, [currentStep, availableSteps.length, onComplete, restoreElementStyles]);

  const handlePrevious = useCallback(() => {
    restoreElementStyles();
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsStepCompleted(false);
      setElementNotFound(false);
    }
  }, [currentStep, restoreElementStyles]);

  const handleSkip = useCallback(() => {
    restoreElementStyles();
    onClose();
  }, [onClose, restoreElementStyles]);

  const handleActionClick = useCallback(() => {
    if (step.action === "click" && highlightElement) {
      // Trigger the actual click
      highlightElement.click();
      // Mark as completed after a short delay to allow the action to process
      setTimeout(() => {
        setIsStepCompleted(true);
      }, 500);
    } else if (step.action === "hover" && highlightElement) {
      // Trigger hover by dispatching mouseenter event
      const hoverEvent = new MouseEvent("mouseenter", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      highlightElement.dispatchEvent(hoverEvent);
      setIsStepCompleted(true);
    }
  }, [step.action, highlightElement]);

  if (!isActive) return null;

  // For center position (welcome step), use centered positioning
  const isCentered = step.position === "center" || elementNotFound;
  const cardStyle = isCentered
    ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    : {
        ...cardPosition,
        transform: undefined,
      };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={handleSkip} />
      
      {/* Tour Card */}
      <Card 
        className="fixed w-96 z-[9999] shadow-2xl"
        style={cardStyle as React.CSSProperties}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Step {currentStep + 1} of {availableSteps.length}
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
          {elementNotFound && step.optional ? (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This feature is available on specific pages. Navigate to see it in action!
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.content}
            </p>
          )}
          
          {step.action && step.action !== "none" && !elementNotFound && (
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
                disabled={step.action && step.action !== "none" && !elementNotFound && !isStepCompleted}
              >
                {currentStep === availableSteps.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
});

export default OnboardingTour;
