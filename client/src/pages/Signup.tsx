import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bot, Eye, EyeOff, Shield, Zap, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PointerTypes } from "@/components/ui/AnimatedPointer";
import { BackgroundWrapper } from "@/components/common/BackgroundWrapper";
import { GlassCard } from "@/components/ui/GlassCard";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!email || !username || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🚀 Making signup request with:", { email, username, password: "***" });
      
      const response = await fetch("http://192.168.0.103:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          username, 
          password 
        }),
      });

      console.log("📡 Signup response status:", response.status);
      const data = await response.json();
      console.log("📦 Signup response data:", data);

      if (response.ok) {
        console.log("✅ Signup successful, redirecting to login");
        // Successful signup - redirect to login page
        setLocation("/login");
      } else {
        console.log("❌ Signup failed:", data.detail || data.message);
        setError(data.detail || data.message || "Signup failed");
      }
    } catch (error) {
      console.error("🚨 Signup network error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Theme-aware Background */}
      <BackgroundWrapper />
      
      {/* Content */}
      <div className="relative z-10 w-full flex">

  {/* Left Panel - Branding & Features */}
     
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
                <CardTitle className="text-2xl font-semibold">Create your account</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Sign up to get started with RAGSuite
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" data-testid="error-alert">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    data-testid="input-username"
                    className="h-11"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-password"
                      className="h-11 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm p-0 h-auto ">
                Already have an account?{" "}
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-sm text-blue-500 p-0 h-auto" data-testid="link-login">
                      Sign in
                    </Button>
                  </Link>
                </div>
                
                <div className="relative">
                  <Button
                    type="submit"
                    className="w-full h-11 group"
                    disabled={isLoading}
                    data-testid="button-signup"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  <PointerTypes.Add className="absolute inset-0" />
                </div>
              </form>
              
              <div className="pt-4 border-t">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Demo Account</p>
                  <p className="text-sm font-mono text-foreground">admin@ragsuite.com / demo123</p>
                </div>
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

     {/* Right Panel - Login Form */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 relative overflow-hidden">
        <div className="flex flex-col justify-center px-12 py-16 w-full relative z-10">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">RAGSuite</h1>
                <p className="text-sm text-muted-foreground">Enterprise AI Platform</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Intelligent Search & AI Chat for Your Enterprise
            </h2>
            <p className="text-muted-foreground mb-8">
              Deploy powerful RAG-powered AI assistants that understand your business data. 
              Manage content, configure integrations, and analyze performance from one unified dashboard.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Enterprise Security</h3>
                  <p className="text-sm text-muted-foreground">SOC 2 compliant with advanced permissions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Rapid Deployment</h3>
                  <p className="text-sm text-muted-foreground">Embeddable widgets with zero configuration</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Advanced Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track usage, performance, and user satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
        </div>
      </div>
      </div>

    </div>
  );
}
