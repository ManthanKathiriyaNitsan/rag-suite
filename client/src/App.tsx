import React, { useEffect, useState, Suspense, lazy } from "react";

import { Switch, Route, useLocation } from "wouter";

import { AnimatePresence, motion } from "framer-motion";

import { queryClient } from "./services/queryClient";

import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";

import { TooltipProvider } from "@/components/ui/tooltip";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { ThemeProvider } from "@/contexts/ThemeContext";

import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";

import { RAGSettingsProvider } from "@/contexts/RAGSettingsContext";

import { useOnboarding } from "@/hooks/useOnboarding";

import { Bell, HelpCircle, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { PageErrorBoundary } from "@/components/error";

import { BrandingProvider } from "@/contexts/BrandingContext";

import { TypographyProvider } from "@/contexts/TypographyContext";

import { LayoutProvider } from "@/contexts/LayoutContext";

import { AdvancedProvider } from "@/contexts/AdvancedContext";

import { I18nProvider } from "@/contexts/I18nContext";

import { CitationFormattingProvider } from "@/contexts/CitationFormattingContext";

import { BackgroundProvider } from "@/contexts/BackgroundContext";

import { BackgroundWrapper } from "@/components/common/BackgroundWrapper";

import { useTranslation } from "@/contexts/I18nContext";

import { GlassNavbar } from "@/components/ui/GlassNavbar";

import { useTheme } from "@/contexts/ThemeContext";

import Lenis from "lenis";



// Typography is now handled by TypographyProvider



// 🚀 Lazy load all pages for optimal performance

const Overview = lazy(() => import("@/pages/Overview"));

const Crawl = lazy(() => import("@/pages/Crawl"));

const Documents = lazy(() => import("@/pages/Documents"));

const Analytics = lazy(() => import("@/pages/Analytics"));

const Feedback = lazy(() => import("@/pages/Feedback"));

const RAGTuning = lazy(() => import("@/pages/RAGTuning"));

const Settings = lazy(() => import("@/pages/Settings"));

const ApiKeys = lazy(() => import("@/pages/ApiKeys"));

const SystemHealth = lazy(() => import("@/pages/SystemHealth"));

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

  // Use AuthContext instead of checking localStorage directly

  // This ensures we're using the same auth state as the rest of the app

  const { isAuthenticated, isLoading } = useAuthContext();



  if (isLoading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="flex items-center gap-2">

          <Loader2 className="h-6 w-6 animate-spin" />

          <span>Just a moment...</span>

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

  const { t } = useTranslation();

  const { theme } = useTheme();

  const mainRef = React.useRef<HTMLDivElement | null>(null);

  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const lenisRef = React.useRef<Lenis | null>(null);

  

  useEffect(() => {

    setWidgetOpen(false);

  }, []); // Empty dependency array - runs only on mount

  

  // Initialize Lenis on the main scroll container

  useEffect(() => {

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return;

    

    if (!mainRef.current) return;

    // Ensure a content node exists for Lenis custom wrapper mode

    const wrapperEl = mainRef.current;

    const contentEl = contentRef.current ?? wrapperEl;



    // Allow native scrolling inside nested scroll containers (chat boxes, tab panes, modals, etc.)

    const isPotentialScrollable = (el: Element) => {

      if (!(el instanceof HTMLElement)) return false;

      if (el === wrapperEl || el === contentEl) return false;

      const style = getComputedStyle(el);

      const overflowY = style.overflowY;

      const hasScrollableOverflow = overflowY === 'auto' || overflowY === 'scroll' || el.classList.contains('overflow-auto') || el.classList.contains('overflow-y-auto') || el.hasAttribute('data-scrollable') || el.classList.contains('scrollable');

      if (!hasScrollableOverflow) return false;

      // Consider it scrollable only if content actually exceeds bounds

      return el.scrollHeight > el.clientHeight + 1;

    };



    // Optional: add smoothness to inner scroll containers using lightweight Lenis instances

    const innerLenisMap = new Map<HTMLElement, { lenis: Lenis; rafId: number }>();



    const initInnerLenis = (el: HTMLElement) => {

      if (innerLenisMap.has(el)) return; // already initialized

      if (el.tagName.toLowerCase() === 'textarea') return;

      if (el.clientHeight < 120) return; // ignore tiny boxes

      const content = (el.firstElementChild as HTMLElement) ?? el;

      try {

        const inner = new Lenis({

          wrapper: el,

          content,

          duration: 1.3,

          smoothWheel: true,

          lerp: 0.1,

          autoResize: true,

        });

        let rafId = 0;

        const raf = (time: number) => {

          inner.raf(time);

          rafId = requestAnimationFrame(raf);

        };

        rafId = requestAnimationFrame(raf);

        innerLenisMap.set(el, { lenis: inner, rafId });

        el.setAttribute('data-lenis-inner', '');

      } catch (_) {

        // fallback to native scroll if init fails

      }

    };



    const destroyInnerLenis = (el: HTMLElement) => {

      const inst = innerLenisMap.get(el);

      if (!inst) return;

      cancelAnimationFrame(inst.rafId);

      inst.lenis.destroy();

      innerLenisMap.delete(el);

      el.removeAttribute('data-lenis-inner');

    };



    const markScrollableChildren = () => {

      // Fast pass: common selectors

      const quickCandidates = wrapperEl.querySelectorAll('.overflow-auto, .overflow-y-auto, [data-scrollable], .scrollable, textarea, [role="dialog"], [data-radix-popper-content-wrapper], [data-radix-scroll-area-viewport]');

      quickCandidates.forEach((el) => {

        if (isPotentialScrollable(el)) {

          (el as HTMLElement).setAttribute('data-lenis-prevent', '');

          initInnerLenis(el as HTMLElement);

        } else if (el instanceof HTMLElement && el.hasAttribute('data-lenis-inner')) {

          destroyInnerLenis(el);

        }

      });



      // Thorough pass: scan all descendants but keep simple checks

      const all = wrapperEl.querySelectorAll('*');

      all.forEach((el) => {

        if (isPotentialScrollable(el)) {

          (el as HTMLElement).setAttribute('data-lenis-prevent', '');

          initInnerLenis(el as HTMLElement);

        } else if (el instanceof HTMLElement && el.hasAttribute('data-lenis-inner')) {

          destroyInnerLenis(el);

        }

      });

    };

    markScrollableChildren();

    const mutationObserver = new MutationObserver(() => markScrollableChildren());

    mutationObserver.observe(wrapperEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

    const onResize = () => markScrollableChildren();

    window.addEventListener('resize', onResize, { passive: true });



    const lenis = new Lenis({

      wrapper: wrapperEl,

      content: contentEl,

      duration: 1.4,

      smoothWheel: true,

      lerp: 0.1,

      autoResize: true,

    });

    lenisRef.current = lenis;

    // expose for Router scroll-restoration

    // @ts-ignore

    window.__lenisInstance = lenis;



    let rafId = 0;

    const raf = (time: number) => {

      lenis.raf(time);

      rafId = requestAnimationFrame(raf);

    };

    rafId = requestAnimationFrame(raf);



    return () => {

      cancelAnimationFrame(rafId);

      lenis.destroy();

      lenisRef.current = null;

      mutationObserver.disconnect();

      window.removeEventListener('resize', onResize);

      // Destroy all inner Lenis instances

      innerLenisMap.forEach((inst, el) => {

        cancelAnimationFrame(inst.rafId);

        inst.lenis.destroy();

        el.removeAttribute('data-lenis-inner');

      });

    };

  }, []);

  

  const style = {

    "--sidebar-width": "20rem",

    "--sidebar-width-icon": "4rem",

  };



  return (

    <SidebarProvider style={style as React.CSSProperties}>

      {/* Global Background */}

      <BackgroundWrapper />

      <div className="flex h-screen w-full relative z-10">

        <AppSidebar data-testid="sidebar" />

        <div className="flex flex-col flex-1">

          <GlassNavbar variant={theme === 'dark' ? 'dark' : 'light'}>

            <div className="flex items-center gap-2 ">

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

            <div className="flex items-center gap-1">

              <Button

                variant="ghost"

                size="sm"

                onClick={() => setNotificationsOpen(true)}

                data-testid="button-notifications"

                className="relative h-auto px-3 py-2"

              >

                <Bell className="h-4 w-4" />

                <Badge

                  variant="destructive"

                  className="absolute -top-[2px] -right-[1px] h-[18px] w-[18px] min-w-auto text-[10px] font-semibold flex items-center justify-center rounded-full !p-0"

                  style={{ borderRadius: '9999px' }}

                >

                  3

                </Badge>

              </Button>

              <Button

                variant="ghost"

                size="sm"

                onClick={() => setHelpOpen(true)}

                data-testid="button-help"

                className="h-auto px-3 py-2"

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

          <main ref={mainRef} className={`flex-1 overflow-auto md:p-6 p-3 bg-transparent min-w-0 ${widgetOpen ? 'main-content-blur' : ''}`}>

            <div ref={contentRef} className="">

              {children}

            </div>

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

        onOpenCommandPalette={() => setCommandPaletteOpen(true)}

        onOpenNotifications={() => setNotificationsOpen(true)}

        onNavigate={(path: string) => {

          window.location.href = path;

        }}

        onOpenWidget={() => setWidgetOpen(true)}

      />

    </SidebarProvider>

  );

}



// Page transition wrapper component

function PageTransitionWrapper({ children, pageName }: { children: React.ReactNode; pageName: string }) {

  return (

    <motion.div

      initial={{ opacity: 0, y: 10 }}

      animate={{ opacity: 1, y: 0 }}

      exit={{ opacity: 0, y: -10 }}

      transition={{ duration: 0.2, ease: "easeInOut" }}

      key={pageName}

    >

      {children}

    </motion.div>

  );

}



function Router() {

  const [location] = useLocation();

  const lenisRef = React.useRef<Lenis | null>(null);



  // Access Lenis instance created in DashboardLayout (if available) via a global symbol fallback

  // Alternatively, try to find it on the window for route change scroll restoration

  useEffect(() => {

    // try to capture instance if DashboardLayout already set it

    // @ts-ignore

    if (window.__lenisInstance) {

      // @ts-ignore

      lenisRef.current = window.__lenisInstance as Lenis;

    }

  }, []);



  // Scroll to top on route changes for consistent UX

  useEffect(() => {

    const lenis = lenisRef.current;

    if (lenis) {

      lenis.scrollTo(0, { immediate: false });

    } else {

      // Fallback: scroll the main container if Lenis not ready yet

      const main = document.querySelector('main.flex-1');

      if (main) (main as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });

    }

  }, [location]);



  return (

    <AnimatePresence mode="wait" initial={false}>

      <Switch key={location}>

        <Route path="/login">

          <PageErrorBoundary pageName="Login">

            <PageTransitionWrapper pageName="Login">

              <Login />

            </PageTransitionWrapper>

          </PageErrorBoundary>

        </Route>

        <Route path="/signup">

          <PageErrorBoundary pageName="Signup">

            <PageTransitionWrapper pageName="Signup">

              <Signup />

            </PageTransitionWrapper>

          </PageErrorBoundary>

        </Route>

        <Route path="/onboarding">

          <PageErrorBoundary pageName="Onboarding">

            <PageTransitionWrapper pageName="Onboarding">

              <Onboarding />

            </PageTransitionWrapper>

          </PageErrorBoundary>

        </Route>

        <Route path="/" nest>

          <ProtectedRoute>

            <DashboardLayout>

              <Switch key={location}>

                <Route path="/">

                  <PageErrorBoundary pageName="Overview">

                    <PageTransitionWrapper pageName="Overview">

                      <Overview />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/crawl">

                  <PageErrorBoundary pageName="Crawl">

                    <PageTransitionWrapper pageName="Crawl">

                      <Crawl />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/rag-tuning">

                  <PageErrorBoundary pageName="RAG Tuning">

                    <PageTransitionWrapper pageName="RAG Tuning">

                      <RAGTuning />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/documents">

                  <PageErrorBoundary pageName="Documents">

                    <PageTransitionWrapper pageName="Documents">

                      <Documents />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/analytics">

                  <PageErrorBoundary pageName="Analytics">

                    <PageTransitionWrapper pageName="Analytics">

                      <Analytics />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/feedback">

                  <PageErrorBoundary pageName="Feedback">

                    <PageTransitionWrapper pageName="Feedback">

                      <Feedback />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/integrations">

                  <PageErrorBoundary pageName="Integrations">

                    <PageTransitionWrapper pageName="Integrations">

                      <Integrations />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/profile">

                  <PageErrorBoundary pageName="Profile">

                    <PageTransitionWrapper pageName="Profile">

                      <Profile />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/settings">

                  <PageErrorBoundary pageName="Settings">

                    <PageTransitionWrapper pageName="Settings">

                      <Settings />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/api-keys">

                  <PageErrorBoundary pageName="API Keys">

                    <PageTransitionWrapper pageName="API Keys">

                      <ApiKeys />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route path="/system-health">

                  <PageErrorBoundary pageName="System Health">

                    <PageTransitionWrapper pageName="System Health">

                      <SystemHealth />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

                <Route>

                  <PageErrorBoundary pageName="Not Found">

                    <PageTransitionWrapper pageName="Not Found">

                      <NotFound />

                    </PageTransitionWrapper>

                  </PageErrorBoundary>

                </Route>

              </Switch>

            </DashboardLayout>

          </ProtectedRoute>

        </Route>

        <Route>

          <PageErrorBoundary pageName="Login">

            <PageTransitionWrapper pageName="Login">

              <Login />

            </PageTransitionWrapper>

          </PageErrorBoundary>

        </Route>

      </Switch>

    </AnimatePresence>

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

                      <BackgroundProvider>

                        <TooltipProvider>

                          <I18nProvider>

                            <Suspense fallback={

                              <div className="min-h-screen flex items-center justify-center">

                                <div className="flex items-center gap-2">

                                  <Loader2 className="h-6 w-6 animate-spin" />

                                  <span>Loading...</span>

                                </div>

                              </div>

                            }>

                              <Router />

                              <Toaster />

                            </Suspense>

                          </I18nProvider>

                        </TooltipProvider>

                      </BackgroundProvider>

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