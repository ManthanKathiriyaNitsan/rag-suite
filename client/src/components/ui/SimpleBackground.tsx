"use client";

import React from 'react';
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

type SimpleBackgroundProps = {
  className?: string;
};

export function SimpleBackground({
  className,
}: SimpleBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn("fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0", className)}>
      {/* Use theme background variable so it tracks global palette */}
      <div className="absolute inset-0 bg-background" />
    </div>
  );
}

export type { SimpleBackgroundProps };

