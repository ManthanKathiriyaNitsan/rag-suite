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
  navigateTo?: string; // Path to navigate to for this step (deprecated - use sidebarHighlight instead)
  sidebarHighlight?: string; // Path to highlight in sidebar instead of navigating
}

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
  onClose: () => void;
  onOpenCommandPalette?: () => void;
  onOpenNotifications?: () => void;
  onNavigate?: (path: string) => void;
  onOpenWidget?: () => void;
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
    target: "[data-testid='sidebar'], nav",
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
    target: "a[href='/crawl'], [data-testid='link-crawl']",
    position: "right",
    action: "none",
    sidebarHighlight: "/crawl",
  },
  {
    id: "documents",
    title: "Document Library",
    content: "View and manage all your indexed documents. Upload additional files or browse crawled content.",
    target: "a[href='/documents'], [data-testid='link-documents']",
    position: "right",
    action: "none",
    sidebarHighlight: "/documents",
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

const OnboardingTour = React.memo(function OnboardingTour({ isActive, onComplete, onClose, onOpenCommandPalette, onOpenNotifications, onNavigate, onOpenWidget }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const [elementNotFound, setElementNotFound] = useState(false);
  const [cardPosition, setCardPosition] = useState<{ top?: number; left?: number; right?: number; bottom?: number }>({});
  const originalStylesRef = useRef<{
    position: string;
    zIndex: string;
    boxShadow: string;
    borderRadius: string;
    backgroundColor?: string;
    border?: string;
    borderLeft?: string;
    transform?: string;
    transition?: string;
  } | null>(null);
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
    const cardWidth = window.innerWidth < 640 ? Math.min(384, window.innerWidth - 32) : 384; // Responsive width
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
        // Ensure card doesn't go off screen
        if (cardPos.top + cardHeight > viewportHeight - spacing) {
          cardPos.top = viewportHeight - cardHeight - spacing;
        }
        cardPos.left = Math.max(spacing, Math.min(rect.left + rect.width / 2 - cardWidth / 2, viewportWidth - cardWidth - spacing));
        break;
      case "left":
        cardPos.top = Math.max(spacing, Math.min(rect.top + rect.height / 2 - cardHeight / 2, viewportHeight - cardHeight - spacing));
        cardPos.right = viewportWidth - rect.left + spacing;
        break;
      case "right":
        cardPos.top = Math.max(spacing, Math.min(rect.top + rect.height / 2 - cardHeight / 2, viewportHeight - cardHeight - spacing));
        cardPos.left = rect.right + spacing;
        // Ensure card doesn't go off screen on mobile
        if (cardPos.left + cardWidth > viewportWidth - spacing) {
          cardPos.left = viewportWidth - cardWidth - spacing;
        }
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
    // Restore current highlighted element
    if (highlightElement && originalStylesRef.current) {
      const styles = originalStylesRef.current;
      highlightElement.style.position = styles.position === "static" ? "" : styles.position;
      highlightElement.style.zIndex = styles.zIndex === "auto" || styles.zIndex === "" ? "" : styles.zIndex;
      highlightElement.style.boxShadow = styles.boxShadow === "none" ? "" : styles.boxShadow;
      highlightElement.style.borderRadius = styles.borderRadius === "0px" ? "" : styles.borderRadius;
      highlightElement.style.pointerEvents = "";
      highlightElement.style.backgroundColor = styles.backgroundColor || "";
      highlightElement.style.border = styles.border || "";
      highlightElement.style.borderLeft = styles.borderLeft || "";
      highlightElement.style.transform = styles.transform || "";
      highlightElement.style.transition = styles.transition || "";
      highlightElement.removeAttribute('data-tour-highlighted');
    }
    
    // Also restore ALL elements that might have been highlighted (in case tour was skipped/completed)
    const allHighlighted = document.querySelectorAll('[data-tour-highlighted]');
    allHighlighted.forEach((el) => {
      const element = el as HTMLElement;
      element.style.position = "";
      element.style.zIndex = "";
      element.style.boxShadow = "";
      element.style.borderRadius = "";
      element.style.pointerEvents = "";
      element.style.backgroundColor = "";
      element.style.border = "";
      element.style.borderLeft = "";
      element.style.transform = "";
      element.style.transition = "";
      element.removeAttribute('data-tour-highlighted');
    });
    
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
      // When tour is no longer active, restore all highlighted elements
      restoreElementStyles();
      // Additional cleanup to ensure all elements are restored
      const allHighlighted = document.querySelectorAll('[data-tour-highlighted]');
      allHighlighted.forEach((el) => {
        const element = el as HTMLElement;
        element.style.position = "";
        element.style.zIndex = "";
        element.style.boxShadow = "";
        element.style.borderRadius = "";
        element.style.pointerEvents = "";
        element.style.backgroundColor = "";
        element.style.border = "";
        element.style.borderLeft = "";
        element.style.transform = "";
        element.style.transition = "";
        element.removeAttribute('data-tour-highlighted');
      });
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Handle sidebar highlight steps (no navigation, just highlight sidebar item)
      if (step.sidebarHighlight) {
        const sidebarLink = document.querySelector(`a[href='${step.sidebarHighlight}']`) as HTMLElement;
        if (sidebarLink) {
          // Find the parent menu item container
          const menuItem = sidebarLink.closest('[role="menuitem"], .sidebar-menu-item, li') || sidebarLink.parentElement;
          const target = (menuItem as HTMLElement) || sidebarLink;
          
          setElementNotFound(false);
          setHighlightElement(target);
          
          // Store original styles
          const computed = window.getComputedStyle(target);
          originalStylesRef.current = {
            position: target.style.position || computed.position,
            zIndex: target.style.zIndex || computed.zIndex,
            boxShadow: target.style.boxShadow || computed.boxShadow,
            borderRadius: target.style.borderRadius || computed.borderRadius,
            backgroundColor: target.style.backgroundColor || computed.backgroundColor,
            border: target.style.border || computed.border,
            borderLeft: target.style.borderLeft || computed.borderLeft,
            transform: target.style.transform || computed.transform,
            transition: target.style.transition || computed.transition,
          };
          
          // Apply active/highlighted styling with constant, prominent highlight
          target.style.zIndex = "9999";
          target.style.position = computed.position === "static" ? "relative" : computed.position;
          target.style.pointerEvents = "auto";
          target.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 0 8px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)";
          target.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
          target.style.borderLeft = "4px solid rgb(59, 130, 246)";
          if (!computed.borderRadius || computed.borderRadius === "0px") {
            target.style.borderRadius = "8px";
          }
          // No transition - keep it constant
          target.setAttribute('data-tour-highlighted', 'true');
          target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
        return;
      }
      
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
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

      // Store original styles
      const computed = window.getComputedStyle(target);
      originalStylesRef.current = {
        position: target.style.position || computed.position,
        zIndex: target.style.zIndex || computed.zIndex,
        boxShadow: target.style.boxShadow || computed.boxShadow,
        borderRadius: target.style.borderRadius || computed.borderRadius,
        backgroundColor: target.style.backgroundColor || computed.backgroundColor,
        border: target.style.border || computed.border,
        borderLeft: target.style.borderLeft || computed.borderLeft,
        transform: target.style.transform || computed.transform,
        transition: target.style.transition || computed.transition,
      };

      // Apply highlighting - ensure element is clickable with constant, prominent highlight
      target.style.zIndex = "9999";
      target.style.position = computed.position === "static" ? "relative" : computed.position;
      target.style.pointerEvents = "auto";
      
      // Apply active styling for interactive elements (search bar, notifications, buttons)
      const isSearchBar = target.closest('[data-testid="button-search"]') || target.closest('[data-testid="search-bar-container"]');
      const isNotificationButton = target.closest('[data-testid="button-notifications"]');
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      const isSidebarItem = target.closest('[data-testid^="link-"]') || target.closest('a[href]');
      
      if (isSearchBar || isNotificationButton || isButton) {
        // Make buttons/search/notifications look active with constant highlight
        target.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
        target.style.border = "3px solid rgb(59, 130, 246)";
        target.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 0 8px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)";
        target.style.borderRadius = computed.borderRadius || "8px";
        // No transform or transition - keep it constant
      } else if (isSidebarItem) {
        // Make sidebar items look active with constant highlight
        const sidebarItem = target.closest('a') || target;
        sidebarItem.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
        sidebarItem.style.borderLeft = "4px solid rgb(59, 130, 246)";
        sidebarItem.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 0 8px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)";
        sidebarItem.style.borderRadius = computed.borderRadius || "8px";
        // No transition - keep it constant
      } else {
        // For other elements, apply constant highlight
        target.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 0 8px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)";
        target.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
        if (!computed.borderRadius || computed.borderRadius === "0px") {
          target.style.borderRadius = "8px";
        }
      }
      
      // Make sure the element is above overlay
      target.setAttribute('data-tour-highlighted', 'true');

      // Add event listeners for interactions
      const handleHover = () => {
        if (step.action === "hover") {
          setIsStepCompleted(true);
        }
      };

      const handleClick = (e: Event) => {
        if (step.action === "click") {
          // Don't prevent default - let the click happen naturally
          // Mark as completed after the click processes
          setTimeout(() => {
            setIsStepCompleted(true);
          }, 300);
        }
      };

      // Add event listeners for interactions
      target.addEventListener("mouseenter", handleHover);
      target.addEventListener("click", handleClick, true); // Use capture phase to catch early
      
      // Also listen on document level to catch clicks that might bubble up
      const handleClickCapture = (e: Event) => {
        if (step.action === "click" && (e.target === target || target.contains(e.target as Node))) {
          // Allow event to propagate normally
          setTimeout(() => {
            setIsStepCompleted(true);
          }, 300);
        }
      };
      
      document.addEventListener("click", handleClickCapture, true);

      cleanupRef.current = () => {
        target.removeEventListener("mouseenter", handleHover);
        target.removeEventListener("click", handleClick, true);
        document.removeEventListener("click", handleClickCapture, true);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      restoreElementStyles();
    };
   }, [currentStep, step.target, step.action, step.position, step.navigateTo, step.sidebarHighlight, isActive, restoreElementStyles, calculateCardPosition, onNavigate]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    restoreElementStyles();
    
    if (currentStep < availableSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsStepCompleted(false);
      setElementNotFound(false);
    } else {
      // Final cleanup when completing tour
      restoreElementStyles();
      // Additional cleanup to ensure all elements are restored
      setTimeout(() => {
        const allHighlighted = document.querySelectorAll('[data-tour-highlighted]');
        allHighlighted.forEach((el) => {
          const element = el as HTMLElement;
          element.style.position = "";
          element.style.zIndex = "";
          element.style.boxShadow = "";
          element.style.borderRadius = "";
          element.style.pointerEvents = "";
          element.removeAttribute('data-tour-highlighted');
        });
      }, 100);
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
    // Additional cleanup to ensure all elements are restored when skipping
    setTimeout(() => {
      const allHighlighted = document.querySelectorAll('[data-tour-highlighted]');
      allHighlighted.forEach((el) => {
        const element = el as HTMLElement;
        element.style.position = "";
        element.style.zIndex = "";
        element.style.boxShadow = "";
        element.style.borderRadius = "";
        element.style.pointerEvents = "";
        element.removeAttribute('data-tour-highlighted');
      });
    }, 100);
    onClose();
  }, [onClose, restoreElementStyles]);

  const handleActionClick = useCallback(() => {
    // Special handling for search/command palette step - always open command palette
    if (step.id === "search") {
      if (onOpenCommandPalette) {
        onOpenCommandPalette();
      } else {
        // Fallback: try to find and click the search button
        const searchButton = document.querySelector("[data-testid='button-search']") as HTMLElement;
        if (searchButton) {
          searchButton.click();
        }
      }
      setIsStepCompleted(true);
      return;
    }
    
    // Special handling for notifications step - always open notifications
    if (step.id === "notifications") {
      if (onOpenNotifications) {
        onOpenNotifications();
      } else {
        // Fallback: try to find and click the notifications button
        const notificationsButton = document.querySelector("[data-testid='button-notifications']") as HTMLElement;
        if (notificationsButton) {
          notificationsButton.click();
        }
      }
      setIsStepCompleted(true);
      return;
    }
    
    // Special handling for widget step - open widget
    if (step.id === "widget-demo") {
      if (onOpenWidget) {
        onOpenWidget();
      } else {
        // Fallback: try to find and click the widget launcher
        const widgetButton = document.querySelector("[data-testid='button-widget-launcher']") as HTMLElement;
        if (widgetButton) {
          widgetButton.click();
        }
      }
      setIsStepCompleted(true);
      return;
    }
    
      // Handle sidebar highlight steps (no actual navigation)
      if (step.sidebarHighlight) {
        // Just mark as completed - we're just highlighting, not navigating
        setIsStepCompleted(true);
        return;
      }
      
      // Handle navigation steps (deprecated - use sidebarHighlight instead)
      if (step.navigateTo && onNavigate) {
        onNavigate(step.navigateTo);
        setIsStepCompleted(true);
        return;
      }
    
    if (step.action === "click" && highlightElement) {
      // Find the actual button element (might be nested)
      const button = highlightElement.querySelector('button') || highlightElement;
      
      // Create and dispatch a proper click event
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        detail: 1,
      });
      
      // Try to trigger the click on the button
      button.dispatchEvent(clickEvent);
      
      // Also try native click as fallback
      if (typeof (button as HTMLElement).click === 'function') {
        (button as HTMLElement).click();
      }
      
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
   }, [step.action, step.id, step.navigateTo, step.sidebarHighlight, highlightElement, onOpenCommandPalette, onOpenNotifications, onNavigate, onOpenWidget]);

  if (!isActive) return null;

  // Always center the onboarding card
  const cardStyle = { 
    top: "50%", 
    left: "50%", 
    transform: "translate(-50%, -50%)",
    position: "fixed" as const
  };

  return (
    <>
      {/* Overlay - with cutout for highlighted element */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]" 
        onClick={(e) => {
          // Only skip if clicking on the overlay itself, not on highlighted elements or tour card
          const target = e.target as HTMLElement;
          if (target === e.currentTarget && !target.closest('[data-tour-highlighted]') && !target.closest('.tour-card')) {
            handleSkip();
          }
        }}
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Tour Card - Always centered */}
      <Card 
        className="fixed w-96 max-w-[calc(100vw-2rem)] md:w-96 z-[10000] shadow-2xl pointer-events-auto tour-card"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          position: "fixed"
        }}
        onClick={(e) => e.stopPropagation()}
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
          
          {step.action && step.action !== "none" && (
            <div className="p-3 bg-secondary rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleActionClick();
                }}
                className="w-full"
                type="button"
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
