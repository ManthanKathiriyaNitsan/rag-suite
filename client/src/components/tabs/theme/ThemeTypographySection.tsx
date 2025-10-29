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

  const handleBaseFontSizeChange = (value: number) => {
    const minSize = 16; // Minimum 16px
    const adjustedValue = Math.max(minSize, value);
    typography.setTypography({ 
      baseFontSize: adjustedValue,
      fontSizeScale: {
        ...typography.fontSizeScale,
        base: adjustedValue
      }
    });
  };

  const handleFontSizeScaleChange = (size: keyof typeof typography.fontSizeScale, value: number) => {
    const minSize = size === 'base' ? 16 : 8; // Minimum 16px for base, 8px for others
    const adjustedValue = Math.max(minSize, value);
    
    const newFontSizeScale = {
      ...typography.fontSizeScale,
      [size]: adjustedValue,
    };
    
    typography.setTypography({ fontSizeScale: newFontSizeScale });
    
    // If base size is being changed, update baseFontSize too
    if (size === 'base') {
      typography.setTypography({ baseFontSize: adjustedValue });
    }
  };

  const handleLineHeightChange = (value: number) => {
    typography.setTypography({ lineHeight: value });
  };

  const handleFontWeightChange = (value: string) => {
    typography.setTypography({ fontWeight: value });
  };

  const handleLetterSpacingChange = (value: number) => {
    typography.setTypography({ letterSpacing: value });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              className="p-4 border rounded-lg bg-muted/50"
              style={{ 
                fontFamily: `${typography.fontFamily}, system-ui, sans-serif`,
                color: 'inherit',
                minHeight: '80px'
              }}
            >
              <p className="text-lg font-medium" style={{ color: 'inherit', margin: '0 0 8px 0' }}>Sample Text</p>
              <p className="text-sm" style={{ color: 'inherit', margin: 0 }}>The quick brown fox jumps over the lazy dog.</p>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.6)', margin: '8px 0 0 0' }}>
                Font: {typography.fontFamily}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Base Font Size */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Base Font Size</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="base-font-size">Base Size</Label>
                <Badge variant="outline">{typography.baseFontSize}px</Badge>
              </div>
              <Slider
                id="base-font-size"
                value={[typography.baseFontSize]}
                onValueChange={(value) => handleBaseFontSizeChange(value[0])}
                min={16}
                max={32}
                step={1}
                className="w-full"
              />
            </div>

            {/* Size Preview */}
            <div 
              className="p-4 border rounded-lg bg-muted/50"
              style={{ 
                fontSize: `${typography.baseFontSize}px`,
                fontFamily: `${typography.fontFamily}, system-ui, sans-serif`,
                color: 'inherit'
              }}
            >
              <p style={{ margin: 0 }}>Base font size preview</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Font Size Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font Size Scale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(typography.fontSizeScale).map(([size, value]) => (
              <div key={size} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{size.toUpperCase()}</Label>
                  <Badge variant="outline">{value as number}px</Badge>
                </div>
                <Slider
                  value={[value as number]}
                  onValueChange={(sliderValue) => handleFontSizeScaleChange(size as keyof typeof typography.fontSizeScale, sliderValue[0] as number)}
                  min={size === 'base' ? 16 : 8}
                  max={48}
                  step={1}
                  className="w-full"
                />
                <div 
                  className="text-xs p-2 border rounded bg-muted/30"
                  style={{ 
                    fontSize: `${value}px`, 
                    fontFamily: `${typography.fontFamily}, system-ui, sans-serif`,
                    color: 'inherit'
                  }}
                >
                  Sample text
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                <Badge variant="outline">{typography.lineHeight}</Badge>
              </div>
              <Slider
                id="line-height"
                value={[typography.lineHeight]}
                onValueChange={(value) => handleLineHeightChange(value[0])}
                min={1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <Label htmlFor="font-weight">Font Weight</Label>
              <Select value={typography.fontWeight} onValueChange={handleFontWeightChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select font weight" />
                </SelectTrigger>
                <SelectContent>
                  {fontWeights.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      <span style={{ fontWeight: weight.value === 'light' ? 300 : weight.value === 'normal' ? 400 : weight.value === 'medium' ? 500 : weight.value === 'semibold' ? 600 : weight.value === 'bold' ? 700 : 800 }}>
                        {weight.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="letter-spacing">Letter Spacing</Label>
                <Badge variant="outline">{typography.letterSpacing}px</Badge>
              </div>
              <Slider
                id="letter-spacing"
                value={[typography.letterSpacing]}
                onValueChange={(value) => handleLetterSpacingChange(value[0])}
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
              className="p-4 border rounded-lg bg-muted/50"
              style={{
                fontFamily: `${typography.fontFamily}, system-ui, sans-serif`,
                fontSize: `${typography.baseFontSize}px`,
                lineHeight: typography.lineHeight,
                fontWeight: typography.fontWeight,
                letterSpacing: `${typography.letterSpacing}px`,
                textAlign: typography.textAlign as any,
                color: 'inherit'
              }}
            >
              <p style={{ margin: '0 0 8px 0' }}>This text demonstrates the current alignment setting.</p>
              <p style={{ margin: 0 }}>Multiple lines show how the alignment affects paragraph layout.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="p-6 border rounded-lg bg-muted/50 space-y-4"
            style={{
              fontFamily: `${typography.fontFamily}, system-ui, sans-serif`,
              fontSize: `${typography.baseFontSize}px`,
              lineHeight: typography.lineHeight,
              fontWeight: typography.fontWeight,
              letterSpacing: `${typography.letterSpacing}px`,
              textAlign: typography.textAlign as any,
              color: 'inherit'
            }}
          >
            <h1 style={{ fontSize: `${typography.fontSizeScale['2xl']}px`, fontWeight: 'bold', margin: 0 }}>
              Heading 1 - Large Title
            </h1>
            <h2 style={{ fontSize: `${typography.fontSizeScale.xl}px`, fontWeight: 'semibold', margin: 0 }}>
              Heading 2 - Section Title
            </h2>
            <h3 style={{ fontSize: `${typography.fontSizeScale.lg}px`, fontWeight: 'medium', margin: 0 }}>
              Heading 3 - Subsection
            </h3>
            <p style={{ fontSize: `${typography.fontSizeScale.base}px`, margin: 0 }}>
              This is a paragraph with the base font size. The quick brown fox jumps over the lazy dog. 
              This demonstrates how your typography settings will look across the application.
            </p>
            <p style={{ fontSize: `${typography.fontSizeScale.sm}px`, color: '#6b7280', margin: 0 }}>
              This is smaller text for captions or secondary information.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleReset} className="flex-1">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
