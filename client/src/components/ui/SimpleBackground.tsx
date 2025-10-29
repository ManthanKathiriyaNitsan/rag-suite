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

  const bgColor = isDark ? "#020617" : "#e2e8f0";
  const gradientFrom = isDark ? "from-[#020617]" : "from-slate-300";
  const gradientTo = isDark ? "to-[#0a0f1a]" : "to-slate-400";

  return (
    <div className={cn("fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0", className)}>
      <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradientFrom, "via-transparent", gradientTo)} />
    </div>
  );
}

export type { SimpleBackgroundProps };

