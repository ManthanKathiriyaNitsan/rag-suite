import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { RAGSettingsProvider } from "@/contexts/RAGSettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { EmbeddableWidget } from "@/components/EmbeddableWidget";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationInbox } from "@/components/NotificationInbox";
import { HelpSystem } from "@/components/HelpSystem";
import { OnboardingTour } from "@/components/OnboardingTour";
import { UserDropdown } from "@/components/UserDropdown";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Bell, HelpCircle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotFound } from "@/pages/ErrorPages";
import Overview from "@/pages/Overview";
import Crawl from "@/pages/Crawl";
import Documents from "@/pages/Documents";
import Analytics from "@/pages/Analytics";
import Feedback from "@/pages/Feedback";
import RAGTuning from "@/pages/RAGTuning";
import Settings from "@/pages/Settings";
import Integrations from "@/pages/Integrations";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import { useState } from "react";
import Signup from "./pages/Signup";
import { BrandingProvider } from "@/contexts/BrandingContext";
// import { useBranding } from "@/contexts/BrandingContext";
import { I18nProvider } from "@/contexts/I18nContext";

// 🔐 Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

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
  const { isTourActive, completeTour, skipTour } = useOnboarding();
  
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen manthan w-full">
        <AppSidebar data-testid="sidebar" />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                <span className="hidden sm:inline">Search</span>
                <kbd className="ml-2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsOpen(true)}
                data-testid="button-notifications"
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHelpOpen(true)}
                data-testid="button-help"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <UserDropdown />
            </div>
          </header>
          <main className="flex-1 overflow-auto md:p-6 p-3 bg-background">
            {children}
          </main>
        </div>
      </div>
      
      {/* Demo Widget - shows the embeddable widget */}
      <EmbeddableWidget
        isOpen={widgetOpen}
        onToggle={() => setWidgetOpen(!widgetOpen)}
        title="RAGSuite Assistant"
        showPoweredBy={true}
      />
      
      {/* Global Components */}
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
      
      {/* Onboarding Tour */}
      <OnboardingTour
        isActive={isTourActive}
        onComplete={completeTour}
        onClose={skipTour}
      />
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/" nest>
        <ProtectedRoute>
          <DashboardLayout>
            <Switch>
              <Route path="/" component={Overview} />
              <Route path="/crawl" component={Crawl} />
              <Route path="/rag-tuning" component={RAGTuning} />
              <Route path="/documents" component={Documents} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/feedback" component={Feedback} />
              <Route path="/integrations" component={Integrations} />
              <Route path="/profile" component={Profile} />
              <Route path="/settings" component={Settings} />
              <Route path="/api-keys" component={Settings} />
              <Route path="/system-health" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      {/* Default route ensures redirect to login when no match */}
      <Route component={Login} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandingProvider>
          <RAGSettingsProvider>
            <ThemeProvider>
              <TooltipProvider>
                <I18nProvider>
                  <Router />
                  <Toaster />
                </I18nProvider>
              </TooltipProvider>
            </ThemeProvider>
          </RAGSettingsProvider>
        </BrandingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;