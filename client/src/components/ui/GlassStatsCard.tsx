import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from './Badge';

interface GlassStatsCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  className?: string;
}

export function GlassStatsCard({
  title,
  value,
  description,
  trend,
  icon,
  className = ""
}: GlassStatsCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div 
      className={cn(
        "rounded-lg border backdrop-blur-md transition-all duration-300",
        "hover:shadow-lg hover:shadow-black/5 p-6",
        isDark 
          ? "glass-card-dark text-white" 
          : "glass-card-light text-black",
        className
      )}
    >
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium leading-none tracking-tight">
          {title}
        </h3>
        {icon && (
          <div className={cn(
            "h-4 w-4",
            isDark ? "text-white/70" : "text-black/80"
          )}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className={cn(
            "text-xs mt-1",
            isDark ? "text-white/60" : "text-black/70"
          )}>
            {description}
          </p>
        )}
        {trend && (
          <div className="mt-2">
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              {trend.isPositive ? " from yesterday" : " avg response time"}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
