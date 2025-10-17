import React from 'react';
import { useCursor } from '@/contexts/CursorContext';
import { PointerTypes } from './AnimatedPointer';

interface ConditionalPointerProps {
  type: keyof typeof PointerTypes;
  className?: string;
}

export function ConditionalPointer({ type, className }: ConditionalPointerProps) {
  const { pointerIconsEnabled } = useCursor();
  
  if (!pointerIconsEnabled) {
    return null;
  }
  
  const PointerComponent = PointerTypes[type];
  return <PointerComponent className={className} />;
}

// Export all pointer types as conditional components
export const ConditionalPointerTypes = {
  Click: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Click" className={className} />
  ),
  Send: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Send" className={className} />
  ),
  Download: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Download" className={className} />
  ),
  Upload: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Upload" className={className} />
  ),
  Add: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Add" className={className} />
  ),
  Edit: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Edit" className={className} />
  ),
  Delete: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Delete" className={className} />
  ),
  Save: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Save" className={className} />
  ),
  Refresh: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Refresh" className={className} />
  ),
  Play: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Play" className={className} />
  ),
  Pause: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Pause" className={className} />
  ),
  Archive: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Archive" className={className} />
  ),
  Copy: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Copy" className={className} />
  ),
  Next: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Next" className={className} />
  ),
  Back: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Back" className={className} />
  ),
  Up: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Up" className={className} />
  ),
  Down: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Down" className={className} />
  ),
  Search: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Search" className={className} />
  ),
  Settings: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Settings" className={className} />
  ),
  Chat: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Chat" className={className} />
  ),
  AI: ({ className }: { className?: string }) => (
    <ConditionalPointer type="AI" className={className} />
  ),
  Analytics: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Analytics" className={className} />
  ),
  Documents: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Documents" className={className} />
  ),
  Crawl: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Crawl" className={className} />
  ),
  Integration: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Integration" className={className} />
  ),
  Filter: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Filter" className={className} />
  ),
  Grid: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Grid" className={className} />
  ),
  List: ({ className }: { className?: string }) => (
    <ConditionalPointer type="List" className={className} />
  ),
  Time: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Time" className={className} />
  ),
  Notification: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Notification" className={className} />
  ),
  Help: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Help" className={className} />
  ),
  Language: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Language" className={className} />
  ),
  User: ({ className }: { className?: string }) => (
    <ConditionalPointer type="User" className={className} />
  ),
  Theme: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Theme" className={className} />
  ),
  Favorite: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Favorite" className={className} />
  ),
  Star: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Star" className={className} />
  ),
  Warning: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Warning" className={className} />
  ),
  Success: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Success" className={className} />
  ),
  Error: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Error" className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
    <ConditionalPointer type="Info" className={className} />
  ),
};
