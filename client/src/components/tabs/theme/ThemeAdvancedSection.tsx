import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdvanced } from '@/contexts/AdvancedContext';
import { 
  Settings, 
  Code, 
  Shield, 
  Monitor,
  Smartphone,
  Tablet,
  Info,
  AlertTriangle
} from 'lucide-react';

export default function ThemeAdvancedSection() {
  const advancedContext = useAdvanced();
  const { setAdvanced, resetAdvanced } = advancedContext;

  const handleCustomCSSChange = (value: string) => {
    setAdvanced({ customCSS: value });
  };

  const handleAccessibilityChange = (key: keyof typeof advancedContext.accessibility, value: boolean) => {
    setAdvanced({
      accessibility: {
        ...advancedContext.accessibility,
        [key]: value
      }
    });
  };

  const handleResponsiveChange = (key: keyof typeof advancedContext.responsive.breakpoints, value: number) => {
    setAdvanced({
      responsive: {
        ...advancedContext.responsive,
        breakpoints: {
          ...advancedContext.responsive.breakpoints,
          [key]: value
        }
      }
    });
  };

  const handleReset = () => {
    resetAdvanced();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Advanced Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure custom CSS, accessibility, and responsive settings
        </p>
      </div>

      <Alert className="bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
        <Info className="h-4 w-4 text-blue-700 dark:text-blue-300" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          Advanced settings control custom styling, accessibility features, and responsive behavior.
          Changes are applied globally and automatically saved to localStorage.
        </AlertDescription>
      </Alert>

      {/* Custom CSS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Custom CSS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-css">Custom CSS Code</Label>
            <Textarea
              id="custom-css"
              placeholder="/* Enter your custom CSS here */&#10;.custom-class {&#10;  color: red;&#10;}"
              value={advancedContext.customCSS}
              onChange={(e) => handleCustomCSSChange(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleCustomCSSChange('')} size="sm">
              Clear CSS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Accessibility Settings
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Respect user's motion preferences
              </p>
            </div>
            <Switch
              checked={advancedContext.accessibility.reducedMotion}
              onCheckedChange={(value) => handleAccessibilityChange('reducedMotion', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={advancedContext.accessibility.highContrast}
              onCheckedChange={(value) => handleAccessibilityChange('highContrast', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Focus Visible</Label>
              <p className="text-sm text-muted-foreground">
                Show focus indicators for keyboard navigation
              </p>
            </div>
            <Switch
              checked={advancedContext.accessibility.focusVisible}
              onCheckedChange={(value) => handleAccessibilityChange('focusVisible', value)}
            />
          </div>
        </CardContent>
      </Card>


      {/* Responsive Breakpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Responsive Breakpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile
              </Label>
              <Input
                type="number"
                value={advancedContext.responsive.breakpoints.mobile}
                onChange={(e) => handleResponsiveChange('mobile', Number(e.target.value))}
                placeholder="768"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tablet className="h-4 w-4" />
                Tablet
              </Label>
              <Input
                type="number"
                value={advancedContext.responsive.breakpoints.tablet}
                onChange={(e) => handleResponsiveChange('tablet', Number(e.target.value))}
                placeholder="1024"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop
              </Label>
              <Input
                type="number"
                value={advancedContext.responsive.breakpoints.desktop}
                onChange={(e) => handleResponsiveChange('desktop', Number(e.target.value))}
                placeholder="1280"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700">
        <AlertTriangle className="h-4 w-4 text-orange-700 dark:text-orange-300" />
        <AlertDescription className="text-orange-900 dark:text-orange-100">
          <strong>Advanced Settings Tip:</strong> Use custom CSS for specific styling needs and accessibility settings for better user experience.
          Responsive breakpoints help define when your layout adapts to different screen sizes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
