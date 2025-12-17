import React, { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Bot, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackgroundWrapper } from "@/components/common/BackgroundWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

const ForgotPassword = React.memo(function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      if (!email) {
        setError("Please enter your email address");
        return;
      }

      try {
        setIsSubmitting(true);

        // TODO: Integrate with real backend forgot-password endpoint when available.
        // For now, simulate a request so the UX feels complete.
        await new Promise((resolve) => setTimeout(resolve, 800));

        setSuccess(
          "If an account exists for this email, a password reset link has been sent."
        );
      } catch (err) {
        console.error("Forgot password error:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email]
  );

  const handleBackToLogin = useCallback(() => {
    setLocation("/login");
  }, [setLocation]);

  return (
    <div className="relative min-h-screen flex">
      {/* Theme-aware Background */}
      <BackgroundWrapper />

      {/* Content */}
      <div className="relative z-10 w-full flex">
        {/* Left Panel - Branding & Features (match Login layout) */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 relative overflow-hidden">
          <div className="flex flex-col justify-center px-12 py-16 w-full relative z-10">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">RAGSuite</h1>
                  <p className="text-sm text-muted-foreground">
                    Enterprise AI Platform
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Reset your password securely
              </h2>
              <p className="text-muted-foreground mb-8">
                Enter the email associated with your account and we&apos;ll send
                you a link to reset your password. You can always return to the
                login page once you&apos;re ready to sign in again.
              </p>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary rounded-full blur-3xl" />
          </div>
        </div>

        {/* Right Panel - Forgot Password Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">RAGSuite</span>
            </div>

            <GlassCard className="border-0 shadow-lg">
              <CardHeader className="space-y-4 pb-6">
                <div className="text-center">
                  <CardTitle className="text-2xl font-semibold">
                    Forgot password
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Enter your email address and we&apos;ll send you a reset
                    link.
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert variant="default">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-forgot-email"
                      className="h-11"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 group"
                    data-testid="button-forgot-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </form>

                <div className="flex items-center justify-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-sm p-0 h-auto flex items-center gap-2"
                    onClick={handleBackToLogin}
                    data-testid="button-back-to-login"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Button>
                </div>
              </CardContent>
            </GlassCard>

            <div className="text-center mt-8">
              <p className="text-xs text-muted-foreground">
                © 2024 RAGSuite. Enterprise AI Platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ForgotPassword;

