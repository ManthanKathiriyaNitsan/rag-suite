import React, { useEffect, useState, Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./services/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/Toaster";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { RAGSettingsProvider } from "@/contexts/RAGSettingsContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Bell, HelpCircle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageErrorBoundary } from "@/components/error";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { TypographyProvider } from "@/contexts/TypographyContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { AdvancedProvider } from "@/contexts/AdvancedContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { CitationFormattingProvider } from "@/contexts/CitationFormattingContext";
import { CursorProvider, useCursor } from "@/contexts/CursorContext";
import { useTranslation } from "@/contexts/I18nContext";
import { SmoothCursor } from "@/components/ui/SmoothCursor";
import { ConditionalPointerTypes } from "@/components/ui/ConditionalPointer";
import { GlassNavbar } from "@/components/ui/GlassNavbar";
import { useTheme } from "@/contexts/ThemeContext";

// Typography is now handled by TypographyProvider

// 🚀 Lazy load all pages for optimal performance
const Overview = lazy(() => import("@/pages/Overview"));
const Crawl = lazy(() => import("@/pages/Crawl"));
const Documents = lazy(() => import("@/pages/Documents"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Feedback = lazy(() => import("@/pages/Feedback"));
const RAGTuning = lazy(() => import("@/pages/RAGTuning"));
const Settings = lazy(() => import("@/pages/Settings"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const Login = lazy(() => import("@/pages/Login"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Profile = lazy(() => import("@/pages/Profile"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("@/pages/ErrorPages").then(module => ({ default: module.NotFound })));

// 🚀 Direct imports (temporarily disabled lazy loading to bypass React error)
import ThemeToggle from "@/components/common/ThemeToggle";
import AppSidebar from "@/components/layout/AppSidebar";
import { EmbeddableWidget } from "@/components/common/EmbeddableWidget";
import CommandPalette from "@/components/common/CommandPalette";
import NotificationInbox from "@/components/common/NotificationInbox";
import HelpSystem from "@/components/common/HelpSystem";
import OnboardingTour from "@/components/common/OnboardingTour";
import UserDropdown from "@/components/common/UserDropdown";
import LanguageSelector from "@/components/common/LanguageSelector";

// 🔐 Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user_data');
      
      console.log('🔐 ProtectedRoute - Checking auth:', {
        hasToken: !!token,
        hasUser: !!user,
        token: token ? 'present' : 'missing',
        user: user ? 'present' : 'missing'
      });
      
      if (token && user) {
        setIsAuthenticated(true);
        console.log('✅ ProtectedRoute - User authenticated');
      } else {
        setIsAuthenticated(false);
        console.log('❌ ProtectedRoute - User not authenticated');
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user_data' || e.key === 'token_expires') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Empty dependency array - runs only on mount

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { customCursorEnabled } = useCursor();
  const { isTourActive, completeTour, skipTour } = useOnboarding();
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  useEffect(() => {
    setWidgetOpen(false);
  }, []); // Empty dependency array - runs only on mount
  
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar data-testid="sidebar" />
        <div className="flex flex-col flex-1">
          <GlassNavbar variant={theme === 'dark' ? 'dark' : 'light'}>
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandPaletteOpen(true)}
                data-testid="button-search"
                className="text-muted-foreground"
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t('common.search')}</span>
                <kbd className="ml-2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsOpen(true)}
                data-testid="button-notifications"
                className="relative h-8 w-8 md:h-9 md:w-9 p-0"
              >
                <Bell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 min-w-4 text-[10px] px-0 py-0 font-semibold flex items-center justify-center rounded-md border border-background/20"
                >
                  3
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHelpOpen(true)}
                data-testid="button-help"
                className="h-8 w-8 md:h-9 md:w-9 p-0"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <div className="hidden md:block">
                <LanguageSelector />
              </div>
              <ThemeToggle />
              <UserDropdown />
            </div>
          </GlassNavbar>
          <main className={`flex-1 overflow-auto md:p-6 p-3 bg-transparent min-w-0 ${widgetOpen ? 'main-content-blur' : ''}`}>
            {children}
          </main>
        </div>
      </div>
      
      <EmbeddableWidget
        isOpen={widgetOpen}
        onToggle={() => setWidgetOpen(!widgetOpen)}
        title="RAGSuite Assistant"
        showPoweredBy={true}
      />
      
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
      <NotificationInbox
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <HelpSystem
        open={helpOpen}
        onOpenChange={setHelpOpen}
      />
      
      <OnboardingTour
        isActive={isTourActive}
        onComplete={completeTour}
        onClose={skipTour}
      />
      
      {/* Smooth Cursor - conditionally rendered */}
      {customCursorEnabled && <SmoothCursor />}
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <PageErrorBoundary pageName="Login">
          <Login />
        </PageErrorBoundary>
      </Route>
      <Route path="/signup">
        <PageErrorBoundary pageName="Signup">
          <Signup />
        </PageErrorBoundary>
      </Route>
      <Route path="/onboarding">
        <PageErrorBoundary pageName="Onboarding">
          <Onboarding />
        </PageErrorBoundary>
      </Route>
      <Route path="/" nest>
        <ProtectedRoute>
          <DashboardLayout>
            <Switch>
              <Route path="/">
                <PageErrorBoundary pageName="Overview">
                  <Overview />
                </PageErrorBoundary>
              </Route>
              <Route path="/crawl">
                <PageErrorBoundary pageName="Crawl">
                  <Crawl />
                </PageErrorBoundary>
              </Route>
              <Route path="/rag-tuning">
                <PageErrorBoundary pageName="RAG Tuning">
                  <RAGTuning />
                </PageErrorBoundary>
              </Route>
              <Route path="/documents">
                <PageErrorBoundary pageName="Documents">
                  <Documents />
                </PageErrorBoundary>
              </Route>
              <Route path="/analytics">
                <PageErrorBoundary pageName="Analytics">
                  <Analytics />
                </PageErrorBoundary>
              </Route>
              <Route path="/feedback">
                <PageErrorBoundary pageName="Feedback">
                  <Feedback />
                </PageErrorBoundary>
              </Route>
              <Route path="/integrations">
                <PageErrorBoundary pageName="Integrations">
                  <Integrations />
                </PageErrorBoundary>
              </Route>
              <Route path="/profile">
                <PageErrorBoundary pageName="Profile">
                  <Profile />
                </PageErrorBoundary>
              </Route>
              <Route path="/settings">
                <PageErrorBoundary pageName="Settings">
                  <Settings />
                </PageErrorBoundary>
              </Route>
              <Route path="/api-keys">
                <PageErrorBoundary pageName="API Keys">
                  <Settings />
                </PageErrorBoundary>
              </Route>
              <Route path="/system-health">
                <PageErrorBoundary pageName="System Health">
                  <Settings />
                </PageErrorBoundary>
              </Route>
              <Route>
                <PageErrorBoundary pageName="Not Found">
                  <NotFound />
                </PageErrorBoundary>
              </Route>
            </Switch>
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route>
        <PageErrorBoundary pageName="Login">
          <Login />
        </PageErrorBoundary>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandingProvider>
          <TypographyProvider>
            <LayoutProvider>
              <AdvancedProvider>
                <RAGSettingsProvider>
                  <CitationFormattingProvider>
                    <ThemeProvider>
                      <CursorProvider>
                        <TooltipProvider>
                          <I18nProvider>
                            <Router />
                            <Toaster />
                          </I18nProvider>
                        </TooltipProvider>
                      </CursorProvider>
                    </ThemeProvider>
                  </CitationFormattingProvider>
                </RAGSettingsProvider>
              </AdvancedProvider>
            </LayoutProvider>
          </TypographyProvider>
        </BrandingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
