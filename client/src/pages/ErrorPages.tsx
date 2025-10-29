import { AlertTriangle, Home, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import ResponsiveDarkVeil from "@/components/ui/ResponsiveDarkVeil";
import { GlassCard } from "@/components/ui/GlassCard";

export function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-0 sm:p-4">
      {/* Theme-aware Background */}
      <ResponsiveDarkVeil />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md text-center">
        <GlassCard className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full" data-testid="button-home">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </GlassCard>
      </div>
    </div>
  );
}

export function PermissionDenied() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-0 sm:p-4">
      {/* Theme-aware Background */}
      <ResponsiveDarkVeil />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md text-center">
        <GlassCard className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full" data-testid="button-home">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              data-testid="button-retry"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </GlassCard>
      </div>
    </div>
  );
}

export function ServerError() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-0 sm:p-4">
      {/* Theme-aware Background */}
      <ResponsiveDarkVeil />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md text-center">
        <GlassCard className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We're experiencing technical difficulties. Please try again in a few moments.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => window.location.reload()}
              data-testid="button-reload"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full" data-testid="button-home">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </GlassCard>
      </div>
    </div>
  );
}

// Empty state components for various contexts
export function EmptyQueries() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No queries yet</h3>
      <p className="text-muted-foreground mb-4">
        Start using your RAG system to see query analytics here.
      </p>
      <Button data-testid="button-test-query">
        <RefreshCw className="h-4 w-4 mr-2" />
        Test a Query
      </Button>
    </div>
  );
}

export function EmptyDocuments() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No documents found</h3>
      <p className="text-muted-foreground mb-4">
        Upload documents or configure crawl sources to get started.
      </p>
      <div className="flex justify-center gap-2">
        <Button data-testid="button-upload-documents">
          Upload Documents
        </Button>
        <Button variant="outline" data-testid="button-add-source">
          Add Crawl Source
        </Button>
      </div>
    </div>
  );
}

export function EmptyFeedback() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
      <p className="text-muted-foreground mb-4">
        User feedback will appear here once people start using your AI assistant.
      </p>
      <Button variant="outline" data-testid="button-view-analytics">
        View Analytics
      </Button>
    </div>
  );
}
