import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTypography } from '@/contexts/TypographyContext';
import { Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Eye } from 'lucide-react';

interface ThemeTypographySectionProps {
  theme?: any;
  onUpdateTheme?: (updates: any) => void;
}

export default function ThemeTypographySection({ theme, onUpdateTheme }: ThemeTypographySectionProps = {}) {
  const typography = useTypography();

  // Internal temp state for drag-control, separate from context for performance
  const [lineHeightTemp, setLineHeightTemp] = useState(typography.lineHeight);
  const [letterSpacingTemp, setLetterSpacingTemp] = useState(typography.letterSpacing);

  // Sync temp state on mount/context change
  React.useEffect(() => {
    setLineHeightTemp(typography.lineHeight);
  }, [typography.lineHeight]);
  React.useEffect(() => {
    setLetterSpacingTemp(typography.letterSpacing);
  }, [typography.letterSpacing]);

  const fontFamilies = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Fira Sans', label: 'Fira Sans' },
    { value: 'IBM Plex Sans', label: 'IBM Plex Sans' },
    { value: 'system-ui', label: 'System UI' },
    { value: 'sans-serif', label: 'Sans Serif' },
  ];

  const fontWeights = [
    { value: 'light', label: 'Light (300)' },
    { value: 'normal', label: 'Normal (400)' },
    { value: 'medium', label: 'Medium (500)' },
    { value: 'semibold', label: 'Semibold (600)' },
    { value: 'bold', label: 'Bold (700)' },
    { value: 'extrabold', label: 'Extrabold (800)' },
  ];

  const textAlignments = [
    { value: 'left', label: 'Left', icon: AlignLeft },
    { value: 'center', label: 'Center', icon: AlignCenter },
    { value: 'right', label: 'Right', icon: AlignRight },
    { value: 'justify', label: 'Justify', icon: AlignJustify },
  ];

  const handleFontFamilyChange = (value: string) => {
    typography.setTypography({ fontFamily: value });
  };

  const handleFontWeightChange = (value: string) => {
    typography.setTypography({ fontWeight: value });
  };

  // For line height, update local state while dragging, and only set context on release.
  const handleLineHeightChange = (value: number[]) => {
    setLineHeightTemp(value[0]);
  };
  const handleLineHeightCommit = (value: number[]) => {
    typography.setTypography({ lineHeight: value[0] });
  };

  // For letter spacing
  const handleLetterSpacingChange = (value: number[]) => {
    setLetterSpacingTemp(value[0]);
  };
  const handleLetterSpacingCommit = (value: number[]) => {
    typography.setTypography({ letterSpacing: value[0] });
  };

  const handleTextAlignChange = (value: string) => {
    typography.setTypography({ textAlign: value });
  };

  const handleReset = () => {
    typography.resetTypography();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Customize fonts, sizes, and text styling globally
          </p>
        </div>
      </div>

      <div className="grid ">
        {/* Font Family */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Font Family</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={typography.fontFamily} onValueChange={handleFontFamilyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: `${font.value}, system-ui, sans-serif` }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Font Preview */}
            <div 
              className="p-4 border bg-muted/50"
              style={{ 
                borderRadius: 'var(--component-cardRadius, 2px)',
                fontFamily: `${typography.fontFamily}, system-ui, sans-serif`,
                color: 'inherit',
                minHeight: '80px',
                fontWeight: typography.fontWeight,
                lineHeight: lineHeightTemp,
                letterSpacing: `${letterSpacingTemp}px`,
                textAlign: typography.textAlign as React.CSSProperties["textAlign"],
              }}
            >
              <p className="text-lg font-medium" style={{ color: 'inherit', margin: '0 0 8px 0' }}>Sample Text</p>
              <p className="text-sm" style={{ color: 'inherit', margin: 0 }}>The quick brown fox jumps over the lazy dog.</p>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)', margin: '8px 0 0 0' }}>
                Font: {typography.fontFamily} | Weight: {typography.fontWeight} | LH: {lineHeightTemp} | LS: {letterSpacingTemp}px
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Text Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Height & Font Weight */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Text Styling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Line Height */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="line-height">Line Height</Label>
                <Badge variant="outline">{lineHeightTemp}</Badge>
              </div>
              <Slider
                id="line-height"
                value={[lineHeightTemp]}
                onValueChange={handleLineHeightChange}
                onValueCommit={handleLineHeightCommit}
                min={1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
   
            {/* Letter Spacing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="letter-spacing">Letter Spacing</Label>
                <Badge variant="outline">{letterSpacingTemp}px</Badge>
              </div>
              <Slider
                id="letter-spacing"
                value={[letterSpacingTemp]}
                onValueChange={handleLetterSpacingChange}
                onValueCommit={handleLetterSpacingCommit}
                min={-2}
                max={5}
                step={0.5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
        {/* Text Alignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Text Alignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {textAlignments.map((alignment) => {
                const Icon = alignment.icon;
                return (
                  <Button
                    key={alignment.value}
                    variant={typography.textAlign === alignment.value ? 'default' : 'outline'}
                    onClick={() => handleTextAlignChange(alignment.value)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {alignment.label}
                  </Button>
                );
              })}
            </div>
            {/* Alignment Preview */}
            <div 
              className="p-4 border bg-muted/50"
              style={{
                borderRadius: 'var(--component-cardRadius, 2px)',
                fontFamily: `${typography.fontFamily}, system-ui, sans-serif`,
                fontSize: 'inherit',
                lineHeight: lineHeightTemp,
                fontWeight: typography.fontWeight,
                letterSpacing: `${letterSpacingTemp}px`,
                textAlign: typography.textAlign as React.CSSProperties["textAlign"],
                color: 'inherit'
              }}
            >
              <p style={{ margin: '0 0 8px 0' }}>This text demonstrates the current alignment setting.</p>
              <p style={{ margin: 0 }}>Multiple lines show how the alignment affects paragraph layout.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleReset} className="flex-1">
          Reset
        </Button>
      </div>
    </div>
  );
}
