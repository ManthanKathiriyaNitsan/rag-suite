import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Bot, Upload, Globe, CheckCircle, ArrowLeft, ArrowRight, Folder, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useOnboardingAPI } from "@/hooks/useOnboardingAPI";
import { useSettingsAPI } from "@/hooks/useSettingsAPI";
import { queryClient } from "@/services/queryClient";
import { onboardingAPI, crawlAPI } from "@/services/api/api";
import { useToast } from "@/hooks/useToast";

const steps = [
  { id: 1, title: "Branding", description: "Customize your organization", key: "branding" },
  { id: 2, title: "Create Project", description: "Set up your first project", key: "project" },
  { id: 3, title: "Data Source", description: "Add your first content source", key: "data_source" },
  { id: 4, title: "Quick Test", description: "Test your RAG system", key: "test" },
];

// Map step keys to step numbers
const stepKeyToNumber: Record<string, number> = {
  branding: 1,
  project: 2,
  data_source: 3,
  test: 4,
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1F6FEB");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [crawlDepth, setCrawlDepth] = useState(1);
  const [cadence, setCadence] = useState("daily");
  const [headlessMode, setHeadlessMode] = useState(false);
  const [testQuery, setTestQuery] = useState("");
  const [testResponse, setTestResponse] = useState<any>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [dataSourceId, setDataSourceId] = useState<string | null>(null);
  const [isCrawlStarting, setIsCrawlStarting] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState<string>("");
  const [isCrawlComplete, setIsCrawlComplete] = useState(false);
  const [hasStartedCrawl, setHasStartedCrawl] = useState(false);
  const [isCreatingDataSourceLocal, setIsCreatingDataSourceLocal] = useState(false);

  const {
    status,
    isLoadingStatus,
    refetchStatus,
    branding,
    isLoadingBranding,
    refetchBranding,
    saveBrandingAsync,
    isSavingBranding,
    createProjectAsync,
    isCreatingProject,
    createDataSourceAsync,
    isCreatingDataSource: isCreatingDataSourceFromHook,
    testQueryAsync,
    isTestingQuery,
    testQueryData,
    suggestions,
    isLoadingSuggestions,
    completeOnboardingAsync,
    isCompletingOnboarding,
  } = useOnboardingAPI();
  
  // Also use settings API to save branding persistently
  const { saveSettingsAsync } = useSettingsAPI();
  const { toast } = useToast();

  // Track if onboarding is being completed to prevent status sync
  const [isCompleting, setIsCompleting] = useState(false);
  // Track if user is manually navigating to prevent status sync from overriding
  // Use ref instead of state to avoid triggering re-renders that might cause the effect to run
  const isManualNavigationRef = useRef(false);

  // Handle starting crawl (separate from Next button)
  const handleStartCrawl = useCallback(async () => {
    if (!sourceUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a website URL first',
        variant: 'destructive',
      });
      return;
    }
    if (!projectId) {
      console.error("No project ID available");
      toast({
        title: 'Error',
        description: 'No project available. Please go back and create a project first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreatingDataSourceLocal(true);
      
      // Create data source first if not already created
      let dataSource;
      if (!dataSourceId) {
        dataSource = await createDataSourceAsync({
          base_url: sourceUrl.trim(),
          depth: crawlDepth,
          cadence: cadence,
          headless_mode: headlessMode,
        });
        setDataSourceId(dataSource.id);
        queryClient.invalidateQueries({ queryKey: ['crawl', 'sites'] });
      } else {
        // If data source already exists, use it
        dataSource = { id: dataSourceId };
      }
      
      // Start the crawl
      setHasStartedCrawl(true);
      setIsCrawlStarting(true);
      setIsCrawlComplete(false);
      
      try {
        await crawlAPI.startCrawl(dataSource.id);
        console.log('Crawl started for data source:', dataSource.id);
      } catch (error) {
        console.error('Failed to start crawl:', error);
        toast({
          title: 'Error',
          description: 'Failed to start crawl. Please try again.',
          variant: 'destructive',
        });
        setIsCrawlStarting(false);
        setHasStartedCrawl(false);
      } finally {
        setIsCreatingDataSourceLocal(false);
      }
    } catch (error) {
      setIsCreatingDataSourceLocal(false);
      // Error handled by hook
    }
  }, [sourceUrl, projectId, crawlDepth, cadence, headlessMode, dataSourceId, createDataSourceAsync, queryClient, toast]);

  // Poll crawl status when crawl is starting
  useEffect(() => {
    if (!isCrawlStarting || !dataSourceId || isCrawlComplete) return;

    const pollCrawlStatus = async () => {
      try {
        const status = await onboardingAPI.getCrawlStatus();
        setCrawlStatus(status);
        
        // Check if crawl is complete (you may need to adjust this based on your backend response)
        // Check for various completion indicators
        const statusLower = status?.toLowerCase() || '';
        const isComplete = statusLower.includes('complete') || 
                          statusLower.includes('done') || 
                          statusLower === 'completed' ||
                          statusLower === 'success' ||
                          statusLower.includes('finished') ||
                          statusLower.includes('successful');
        
        if (status && isComplete) {
          console.log('✅ Crawl completed! Status:', status);
          setIsCrawlComplete(true);
          setIsCrawlStarting(false);
          // Don't auto-advance - let user click Next button manually
        } else {
          console.log('⏳ Crawl still in progress. Status:', status);
        }
      } catch (error) {
        console.error('Error checking crawl status:', error);
        // Continue polling on error
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(pollCrawlStatus, 3000);
    
    // Initial check
    pollCrawlStatus();
    
    return () => clearInterval(interval);
  }, [isCrawlStarting, dataSourceId, isCrawlComplete]);

  // Load status on mount and sync current step (but not if we're completing, actively crawling, or manually navigating)
  useEffect(() => {
    // Don't sync step if:
    // 1. We're completing onboarding
    // 2. We're in step 3 and actively creating/starting a crawl (to prevent auto-advance)
    // 3. We're in step 3 and crawl has completed but user hasn't clicked Next yet (prevent auto-advance)
    // 4. User is manually navigating (clicking Back/Next buttons)
    const isActivelyCrawling = currentStep === 3 && (isCreatingDataSourceLocal || isCreatingDataSourceFromHook || isCrawlStarting);
    // Prevent auto-advance from step 3 after crawl completes - user must click Next manually
    const isCrawlCompleteWaitingForUser = currentStep === 3 && isCrawlComplete && hasStartedCrawl;
    
    if (status && !isCompleting && !isActivelyCrawling && !isCrawlCompleteWaitingForUser && !isManualNavigationRef.current) {
      const stepNumber = stepKeyToNumber[status.current_step] || 1;
      // Only update if the step is different to avoid unnecessary re-renders
      if (stepNumber !== currentStep) {
        console.log('🔄 Status sync: Updating step from', currentStep, 'to', stepNumber, 'based on API status');
        setCurrentStep(stepNumber);
      }
      if (status.project_id) {
        setProjectId(status.project_id);
      }
    } else {
      if (isManualNavigationRef.current) {
        console.log('⏸️ Status sync paused: Manual navigation in progress');
      } else if (isCrawlCompleteWaitingForUser) {
        console.log('⏸️ Status sync paused: Crawl completed in step 3, waiting for user to click Next');
      }
    }
  }, [status, isCompleting, currentStep, isCreatingDataSourceLocal, isCreatingDataSourceFromHook, isCrawlStarting, isCrawlComplete, hasStartedCrawl]);

  // Load branding from API on mount
  useEffect(() => {
    if (branding) {
      if (branding.org_name) {
        setOrgName(branding.org_name);
      }
      if (branding.primary_color) {
        setPrimaryColor(branding.primary_color);
      }
      if (branding.logo_data_url) {
        setLogoDataUrl(branding.logo_data_url);
    }
    }
  }, [branding]);

  // Fetch branding when component mounts
  useEffect(() => {
    refetchBranding();
  }, [refetchBranding]);
    
  // Handle logo upload
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);
    
  const handleNext = useCallback(async () => {
    if (currentStep === 1) {
      // Save branding
      if (!orgName.trim()) return;
      try {
        await saveBrandingAsync({
          org_name: orgName.trim(),
          logo_data_url: logoDataUrl,
          primary_color: primaryColor,
        });
        // Refresh branding data after save
        await refetchBranding();
        isManualNavigationRef.current = true;
        setCurrentStep(2);
        setTimeout(() => {
          isManualNavigationRef.current = false;
        }, 2000);
      } catch (error) {
        // Error handled by hook
      }
    } else if (currentStep === 2) {
      // Create project
      if (!projectName.trim() || !projectDescription.trim()) return;
      try {
        const project = await createProjectAsync({
      name: projectName.trim(),
      description: projectDescription.trim(),
        });
        setProjectId(project.id);
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        isManualNavigationRef.current = true;
        setCurrentStep(3);
        setTimeout(() => {
          isManualNavigationRef.current = false;
        }, 2000);
      } catch (error) {
        // Error handled by hook
      }
    } else if (currentStep === 3) {
      // In step 3, Next button only works if crawl is complete
      // The crawl is started via a separate "Start Crawl" button
      console.log('🔍 Step 3 Next clicked. isCrawlComplete:', isCrawlComplete, 'isCrawlStarting:', isCrawlStarting);
      if (isCrawlComplete) {
        console.log('✅ Moving to step 4');
        isManualNavigationRef.current = true;
        setCurrentStep(4);
        setTimeout(() => {
          isManualNavigationRef.current = false;
        }, 2000);
      } else {
        console.log('❌ Crawl not complete yet. Cannot proceed.');
        toast({
          title: 'Crawl in Progress',
          description: 'Please wait for the crawl to complete before proceeding.',
          variant: 'warning',
        });
      }
    } else if (currentStep < 4) {
      isManualNavigationRef.current = true;
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        isManualNavigationRef.current = false;
      }, 2000);
    }
  }, [
    currentStep,
    orgName,
    logoDataUrl,
    primaryColor,
    projectName,
    projectDescription,
    sourceUrl,
    crawlDepth,
    cadence,
    headlessMode,
    projectId,
    isCrawlComplete,
    saveBrandingAsync,
    createProjectAsync,
    createDataSourceAsync,
    toast,
  ]);

  const handleBack = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      console.log('🔙 Back button clicked. Moving from step', currentStep, 'to step', newStep);
      // Set flag first to prevent status sync from overriding
      isManualNavigationRef.current = true;
      // Use functional update to ensure we're using the latest currentStep value
      setCurrentStep(newStep);
      // Reset the flag after a longer delay to ensure status sync doesn't interfere
      setTimeout(() => {
        console.log('✅ Resetting manual navigation flag');
        isManualNavigationRef.current = false;
      }, 2000); // Increased to 2 seconds to be safe
    }
  };

  const handleFinish = useCallback(async () => {
    console.log("Completing onboarding...");
    setIsCompleting(true); // Prevent status sync from resetting step
    try {
      const result = await completeOnboardingAsync();
      console.log("Onboarding completed successfully:", result);
      
      // Invalidate all queries to refresh data
      await queryClient.invalidateQueries();
      
      // Refetch critical data including branding (but don't wait for onboarding status)
      await queryClient.refetchQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['crawl', 'sites'] });
      await queryClient.refetchQueries({ queryKey: ['settings'] });
      
      // Redirect immediately without waiting for status refetch
      // This prevents the status sync from resetting the step
    setLocation("/");
    } catch (error) {
      // Error handled by hook (toast notification)
      console.error("Failed to complete onboarding:", error);
      setIsCompleting(false); // Reset flag on error
    }
  }, [completeOnboardingAsync, setLocation, queryClient]);

  const handleTestQuery = useCallback(async (query: string) => {
    if (!projectId) {
      console.error("No project ID available for test query");
      return;
    }

    setTestQuery(query);
    setTestResponse(null);

    try {
      const result = await testQueryAsync({
        project_id: projectId,
        query: query,
      });

      // Format response for ChatMessage component
      setTestResponse({
        type: "assistant" as const,
        content: result.answer || "No response received",
        citations: [], // API doesn't return citations in test query response
        timestamp: new Date(),
      });
    } catch (error) {
      // Error handled by hook
      setTestResponse({
      type: "assistant" as const,
        content: "Sorry, I couldn't process your query. Please try again.",
        citations: [],
        timestamp: new Date(),
      });
    }
  }, [projectId, testQueryAsync]);

  // Determine which steps are completed
  const completedSteps = status?.completed_steps || [];
  const isStepCompleted = (stepKey: string) => completedSteps.includes(stepKey);

  // Use API suggestions or fallback to default examples
  const exampleQueries = suggestions.length > 0 
    ? suggestions 
    : [
        "How do I get started?",
        "What are the API endpoints?",
        "How to configure authentication?",
        "What are the system requirements?",
      ];

  if (isLoadingStatus) {
    return (
      <div className="relative min-h-screen">
        <BackgroundWrapper />
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading onboarding status...</span>
          </div>
        </div>
      </div>
    );
  }

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
            {steps.map((step, index) => {
              const isCompleted = isStepCompleted(step.key);
              const isCurrent = currentStep === step.id;
              return (
              <div key={step.id} className="flex items-center min-w-0 flex-shrink-0">
                <div className="flex items-center">
                  <div
                    className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                        ${isCompleted || isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'}
                    `}
                  >
                      {isCompleted ? (
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
                        ${isCompleted ? 'bg-primary' : 'bg-muted'}
                    `}
                  />
                )}
              </div>
              );
            })}
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
                        {logoDataUrl ? (
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden border flex-shrink-0">
                            <img src={logoDataUrl} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                        </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <input
                            type="file"
                            id="logo-upload-input"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('logo-upload-input')?.click()}
                            data-testid="button-upload-logo"
                            className="w-full sm:w-auto"
                          >
                          <Upload className="h-4 w-4 mr-2" />
                            {logoDataUrl ? "Change Logo" : "Upload Logo"}
                          </Button>
                          {logoDataUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLogoDataUrl(null)}
                              className="w-full sm:w-auto text-destructive"
                            >
                              Remove Logo
                        </Button>
                          )}
                        </div>
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

                    <div>
                      <Label>Theme Presets</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryColor("#1F5AAD")}
                          data-testid="button-preset-default"
                          className="p-0 w-[70px]"
                        >
                          <div className="w-[100%] bg-[#1F5AAD] h-[100%] p-0 m-0" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryColor("#EE8433")}
                          data-testid="button-preset-1"
                          className="p-0 w-[70px]"
                        >
                          <div className="w-[100%] bg-[#EE8433] h-[100%] p-0 m-0" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryColor("#4D4D4D")}
                          data-testid="button-preset-2"
                          className="p-0 w-[70px]"
                        >
                          <div className="w-[100%] bg-[#4D4D4D] h-[100%] p-0 m-0" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryColor("#D04038")}
                          data-testid="button-preset-3"
                          className="p-0 w-[70px]"
                        >
                          <div className="w-[100%] bg-[#D04038] h-[100%] p-0 m-0" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Create Project */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="My First Project"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        data-testid="input-project-name"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Give your project a descriptive name
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="project-description">Project Description</Label>
                      <Textarea
                        id="project-description"
                        placeholder="Describe what this project is for..."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="mt-1"
                        rows={4}
                        data-testid="textarea-project-description"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Provide a brief description of your project
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Data Source */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="source-url">Website URL</Label>
                      <div className="flex gap-2">
                      <Input
                        id="source-url"
                        placeholder="https://docs.yourcompany.com"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        data-testid="input-source-url"
                          className="flex-1"
                      />
                        <Button
                          type="button"
                          onClick={handleStartCrawl}
                          disabled={!sourceUrl.trim() || isCreatingDataSourceLocal || isCreatingDataSourceFromHook || isCrawlStarting || isCrawlComplete}
                          className="shrink-0"
                          data-testid="button-start-crawl"
                        >
                          {isCreatingDataSourceLocal || isCreatingDataSourceFromHook ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : isCrawlStarting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Crawling...
                            </>
                          ) : isCrawlComplete ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Done
                            </>
                          ) : (
                            <>
                              <Globe className="h-4 w-4 mr-2" />
                              Start Crawl
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter the URL of your documentation or content site
                      </p>
                    </div>

                    {/* Show crawl status if crawl is in progress */}
                    {isCrawlStarting && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm font-medium">Crawling in progress...</span>
                        </div>
                        {crawlStatus && (
                          <p className="text-xs text-muted-foreground mt-1">Status: {crawlStatus}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Please wait while we crawl your website. You'll be able to proceed to the next step once crawling is complete.
                        </p>
                      </div>
                    )}

                    {/* Show success message when crawl completes */}
                    {isCrawlComplete && !isCrawlStarting && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-500">Crawl completed successfully!</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          You can now proceed to the next step by clicking the "Next" button.
                        </p>
                        {crawlStatus && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">Status: {crawlStatus}</p>
                        )}
                      </div>
                    )}

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
                  </div>
                )}

                {/* Step 4: Quick Test */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Test Your RAG System</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ask a question to see how your AI assistant will respond using your configured data source.
                      </p>
                      <div className="relative">
                      <SearchBar
                        placeholder="Ask about your documentation..."
                        onSearch={handleTestQuery}
                        showSendButton
                        data-testid="test-query-input"
                      />
                        {(isTestingQuery || !projectId) && (
                          <div className="absolute inset-0 bg-background/50 rounded-md flex items-center justify-center">
                            {isTestingQuery ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <span className="text-xs text-muted-foreground">No project available</span>
                            )}
                          </div>
                        )}
                      </div>
                      {isTestingQuery && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processing your query...</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Example Queries:</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {isLoadingSuggestions ? (
                          <div className="col-span-2 flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Loading suggestions...</span>
                          </div>
                        ) : (
                          exampleQueries.map((query, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestQuery(query)}
                            data-testid={`example-query-${index}`}
                            className="text-left justify-start h-auto py-2 px-3"
                              disabled={isTestingQuery || !projectId}
                          >
                            {query}
                          </Button>
                          ))
                        )}
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
                    disabled={currentStep === 1 || isSavingBranding || isCreatingProject || isCreatingDataSourceFromHook || isCreatingDataSourceLocal}
                    data-testid="button-back"
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (currentStep === 1 && (!orgName.trim() || isSavingBranding)) ||
                        (currentStep === 2 && ((!projectName.trim() || !projectDescription.trim()) || isCreatingProject)) ||
                        (currentStep === 3 && (!sourceUrl.trim() || isCreatingDataSourceFromHook || isCreatingDataSourceLocal || isCrawlStarting || !isCrawlComplete))
                      }
                      data-testid="button-next"
                      className="w-full sm:w-auto group"
                    >
                      {isSavingBranding || isCreatingProject || isCreatingDataSourceFromHook || isCreatingDataSourceLocal || isCrawlStarting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isCrawlStarting ? "Crawling..." : "Processing..."}
                        </>
                      ) : (
                        <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinish}
                      data-testid="button-finish"
                      className="w-full sm:w-auto group"
                      disabled={isCompletingOnboarding}
                    >
                      {isCompletingOnboarding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                      Finish Setup
                      <CheckCircle className="h-4 w-4 ml-2" />
                        </>
                      )}
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
                        {logoDataUrl ? (
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded overflow-hidden flex-shrink-0">
                            <img src={logoDataUrl} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        )}
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
                      <div className="flex items-center gap-3 mb-3">
                        <Folder className="h-5 w-5 text-primary" />
                        <h4 className="font-medium text-sm sm:text-base">Project Preview</h4>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs sm:text-sm text-muted-foreground">Project Name:</span>
                          <p className="font-medium text-sm sm:text-base mt-1">
                            {projectName || "Your Project Name"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm text-muted-foreground">Description:</span>
                          <p className="text-sm sm:text-base mt-1 text-muted-foreground">
                            {projectDescription || "Project description will appear here"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t">
                        <Badge variant="secondary" className="text-xs">
                          This will be your active project
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
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

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="p-3 sm:p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">System Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${isStepCompleted('branding') ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <span className="text-xs sm:text-sm">Organization configured</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${isStepCompleted('project') ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <span className="text-xs sm:text-sm">Project created</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${isStepCompleted('data_source') ? 'text-green-500' : 'text-muted-foreground'}`} />
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
