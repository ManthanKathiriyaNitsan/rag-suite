import { useState, useEffect } from "react";

interface OnboardingState {
  hasSeenTour: boolean;
  completedSteps: string[];
  tourStartedAt?: Date;
  tourCompletedAt?: Date;
  currentProgress: number;
}

const ONBOARDING_STORAGE_KEY = "ragsuite-onboarding";

export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(() => {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          hasSeenTour: false,
          completedSteps: [],
          currentProgress: 0,
        };
      }
    }
    return {
      hasSeenTour: false,
      completedSteps: [],
      currentProgress: 0,
    };
  });

  const [isTourActive, setIsTourActive] = useState(false);

  const updateOnboardingState = (updates: Partial<OnboardingState>) => {
    const newState = { ...onboardingState, ...updates };
    setOnboardingState(newState);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newState));
  };

  const startTour = () => {
    setIsTourActive(true);
    updateOnboardingState({
      tourStartedAt: new Date(),
      currentProgress: 0,
    });
  };

  const completeTour = () => {
    setIsTourActive(false);
    updateOnboardingState({
      hasSeenTour: true,
      tourCompletedAt: new Date(),
      currentProgress: 100,
    });
  };

  const skipTour = () => {
    setIsTourActive(false);
    updateOnboardingState({
      hasSeenTour: true,
      currentProgress: 0,
    });
  };

  const resetOnboarding = () => {
    setOnboardingState({
      hasSeenTour: false,
      completedSteps: [],
      currentProgress: 0,
    });
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  const completeStep = (stepId: string) => {
    if (!onboardingState.completedSteps.includes(stepId)) {
      updateOnboardingState({
        completedSteps: [...onboardingState.completedSteps, stepId],
      });
    }
  };

  // Auto-start tour for new users
  useEffect(() => {
    if (!onboardingState.hasSeenTour && !isTourActive) {
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 1000); // Small delay to let the page load

      return () => clearTimeout(timer);
    }
  }, [onboardingState.hasSeenTour, isTourActive, setIsTourActive]);

  return {
    onboardingState,
    isTourActive,
    startTour,
    completeTour,
    skipTour,
    resetOnboarding,
    completeStep,
    isNewUser: !onboardingState.hasSeenTour,
  };
}
