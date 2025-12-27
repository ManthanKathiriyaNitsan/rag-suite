import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { EmbeddableWidget } from '@/components/common/EmbeddableWidget';

interface StickyLivePreviewProps {
  isWidgetOpen: boolean;
  onWidgetToggle: () => void;
  settingsSubTab: string;
  title?: string | null;
  previewOverrides: {
    widgetLogoUrl?: string | null;
    widgetAvatar?: string;
    widgetAvatarSize?: number;
    widgetChatbotColor?: string;
    widgetShowLogo?: boolean;
    widgetShowDateTime?: boolean;
    widgetBottomSpace?: number;
    widgetFontSize?: number;
    widgetTriggerBorderRadius?: number;
    widgetPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | string;
    widgetZIndex?: number;
    widgetOffsetX?: number;
    widgetOffsetY?: number;
    orgName?: string;
    chatbotTitle?: string | null;
    bubbleMessage?: string | null;
    welcomeMessage?: string | null;
  };
  minHeight?: number;
}

export const StickyLivePreview: React.FC<StickyLivePreviewProps> = ({
  isWidgetOpen,
  onWidgetToggle,
  settingsSubTab,
  title,
  previewOverrides,
  minHeight = 650,
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const previewTitle = title || previewOverrides.orgName || previewOverrides.chatbotTitle || "RAGSuite Demo";
  
  // Ensure previewOverrides match EmbeddableWidget's expected types (convert null to undefined)
  const safePreviewOverrides = {
    ...previewOverrides,
    widgetLogoUrl: previewOverrides.widgetLogoUrl ?? undefined,
    widgetPosition: previewOverrides.widgetPosition as "bottom-right" | "bottom-left" | "top-right" | "top-left" | undefined,
    chatbotTitle: previewOverrides.chatbotTitle ?? undefined,
    bubbleMessage: previewOverrides.bubbleMessage ?? undefined,
    welcomeMessage: previewOverrides.welcomeMessage ?? undefined,
  };
  
  return (
    <div
      style={{
        position: isLargeScreen ? 'sticky' : 'relative',
        top: isLargeScreen ? '24px' : 'auto',
        alignSelf: 'flex-start',
        width: '100%',
        overflow: 'visible',
        zIndex: isLargeScreen ? 10 : 'auto',
        height: isLargeScreen ? 'fit-content' : 'auto',
        maxHeight: isLargeScreen ? 'calc(100vh - 48px)' : 'none',
      }}
      className="sticky-live-preview-wrapper"
    >
      <GlassCard className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            Preview for widget customization not AI response
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border rounded-lg p-4 bg-background relative overflow-hidden widget-preview-container"
            style={{
              minHeight: `${minHeight}px`,
              maxHeight: `${minHeight}px`,
              scrollMargin: 0,
              scrollPadding: 0,
              contain: 'layout style paint',
            }}
          >
            <EmbeddableWidget
              key={`preview-${settingsSubTab}`}
              isOpen={isWidgetOpen}
              onToggle={onWidgetToggle}
              title={previewTitle}
              isPreviewMode={true}
              previewOverrides={safePreviewOverrides}
            />
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
};

