import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Bot, Eye, EyeOff, Shield, Zap, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { PointerTypes } from "@/components/ui/AnimatedPointer";
import { mockLogin } from "@/utils/mockAuth";
import ResponsiveDarkVeil from "@/components/ui/ResponsiveDarkVeil";
import { GlassCard } from "@/components/ui/GlassCard";
const Login = React.memo(function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username && password) {
      try {
        // Authenticate with server
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          // Store real authentication tokens
          localStorage.setItem('auth_token', data.access_token || data.token);
          localStorage.setItem('user_data', JSON.stringify({
            id: data.user?.id || 1,
            username: username,
            email: data.user?.email || username + '@example.com',
            name: data.user?.name || username
          }));
          localStorage.setItem('token_expires', data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
          
          console.log('✅ Real authentication successful');
          console.log('🔐 Stored auth data:', {
            token: data.access_token || data.token,
            user: data.user,
            expiresAt: data.expiresAt
          });
          // Force page reload to update authentication state
          window.location.href = "/";
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.warn('🔐 Real authentication failed, using mock authentication for development');
        console.warn('💡 This allows development to continue without real server authentication');
        
        // Use mock authentication system
        try {
          const mockData = await mockLogin(username, password);
          localStorage.setItem('auth_token', mockData.token);
          localStorage.setItem('user_data', JSON.stringify(mockData.user));
          localStorage.setItem('token_expires', mockData.expiresAt);
          localStorage.setItem('mock-mode', 'true'); // Flag that we're in mock mode
          
          console.log('✅ Mock authentication successful');
          // Force page reload to update authentication state
          window.location.href = "/";
        } catch (mockError) {
          console.error('❌ Mock authentication also failed:', mockError);
          alert('Authentication failed. Please try again.');
        }
      }
    } else {
      alert('Please enter both username and password');
    }
  }, [username, password, setLocation]);

  return (
    <div className="relative min-h-screen flex">
      {/* Theme-aware Background */}
      <div className="fixed inset-0 -z-10">
        <ResponsiveDarkVeil 
          className="w-full h-full"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full flex">
      {/* Left Panel - Branding & Features */}
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

      {/* Right Panel - Login Form */}
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
                <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Sign in to access your admin dashboard
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
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
                
                <div className="flex items-center justify-between">
                  <Link href="/forgot-password">
                    <Button variant="ghost" size="sm" className="text-sm p-0 h-auto" data-testid="link-forgot-password">
                      Forgot password?
                    </Button>
                  </Link>
                </div>
                
                <div className="relative">
                  <Button
                    type="submit"
                    className="w-full h-11 group"
                    data-testid="button-sign-in"
                  >
                    Sign in
                  </Button>
                  <PointerTypes.Click className="absolute inset-0" />
                </div>
              </form>
              
              <div className="pt-4 border-t">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Demo Account</p>
                  <p className="text-sm font-mono text-foreground">admin / demo1234</p>
                </div>
              </div>

              <div className="text-sm p-0 h-auto text-center">
              Don't have an account?{" "}
                  <Link href="/signup">
                    <Button variant="ghost" size="sm" className="text-sm text-blue-500 p-0 h-auto" data-testid="link-forgot-password">
                    Sign up
                    </Button>
                  </Link>
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

export default Login;
