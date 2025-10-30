import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLayout } from "@/contexts/LayoutContext";
import { 
  Layout,
  Info,
  AlertTriangle
} from "lucide-react";

export default function ThemeLayoutSection() {
  const layoutContext = useLayout();
  const { setLayout, resetLayout } = layoutContext;


  const handleComponentChange = (key: keyof typeof layoutContext.components, value: string) => {
    console.log(`Layout: Changing ${key} to ${value}`);
    setLayout({
      components: {
        ...layoutContext.components,
        [key]: value
      }
    });
  };

  const handleReset = () => {
    resetLayout();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Component Styling
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure border radius for buttons, inputs, cards, and modals
        </p>
      </div>

      <Alert className="bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
        <Info className="h-4 w-4 text-blue-700 dark:text-blue-300" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          Component styling settings control the border radius of UI elements.
          Changes are applied globally and automatically saved to localStorage.
        </AlertDescription>
      </Alert>


      {/* Component Styling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Component Styling
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
            >
              Reset to Default
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(layoutContext.components).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`component-${key}`} className="text-xs">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <Input
                  id={`component-${key}`}
                  value={value}
                  onChange={(e) => handleComponentChange(key as keyof typeof layoutContext.components, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="2px"
                />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Component Preview:</p>
            <div className="space-y-3">
              <Button style={{ borderRadius: layoutContext.components.buttonRadius }}>
                Button with custom radius
              </Button>
              <Input 
                placeholder="Input with custom radius"
                style={{ borderRadius: layoutContext.components.inputRadius }}
              />
              <div 
                className="p-3 bg-card border"
                style={{ borderRadius: layoutContext.components.cardRadius }}
              >
                Card with custom radius
              </div>
              <div 
                className="p-3 bg-background border border-dashed"
                style={{ borderRadius: layoutContext.components.modalRadius }}
              >
                Modal with custom radius
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      <Alert className="bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700">
        <AlertTriangle className="h-4 w-4 text-green-700 dark:text-green-300" />
        <AlertDescription className="text-green-900 dark:text-green-100">
          <strong>Design System Tip:</strong> Use consistent border radius values throughout your application.
          Consider using CSS custom properties for better maintainability and theming support.
        </AlertDescription>
      </Alert>
    </div>
  );
}
