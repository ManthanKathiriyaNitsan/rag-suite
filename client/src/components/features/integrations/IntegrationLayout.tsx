/**
 * Layout component for Integration Create/Edit pages
 * Handles the overall structure and navigation
 */

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";

interface IntegrationLayoutProps {
  mode: "create" | "edit";
  integrationId?: string;
  isDraftSaved: boolean;
  onBack: () => void;
  onSave: () => void;
  children: ReactNode;
}

export function IntegrationLayout({
  mode,
  integrationId,
  isDraftSaved,
  onBack,
  onSave,
  children,
}: IntegrationLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {mode === "create" ? "Create Integration" : "Edit Integration"}
                </h1>
                {integrationId && (
                  <Badge variant="outline" className="text-xs">
                    ID: {integrationId}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isDraftSaved && (
                <Badge variant="secondary" className="text-xs">
                  Draft Saved
                </Badge>
              )}
              <Button
                onClick={onSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {mode === "create" ? "Create" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Integration Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
