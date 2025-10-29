"use client";

import React from 'react';
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

type AnotherBackgroundProps = {
  className?: string;
};

export function AnotherBackground({
  className,
}: AnotherBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? "#1a1a2e" : "#ffffff";
  const gradientFrom = isDark ? "from-[#1a1a2e]" : "from-white";
  const gradientVia = isDark ? "via-[#16213e]" : "via-gray-50";
  const gradientTo = isDark ? "to-[#0f3460]" : "to-gray-100";

  return (
    <div className={cn("fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0", className)}>
      <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradientFrom, gradientVia, gradientTo)} />
      {/* Subtle overlay for depth */}
      <div className={cn(
        "absolute inset-0",
        isDark 
          ? "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"
          : "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.02),transparent_50%)]"
      )} />
    </div>
  );
}

export type { AnotherBackgroundProps };

