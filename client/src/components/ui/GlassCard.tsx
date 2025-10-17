import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
}

export function GlassCard({ 
  children, 
  className = "",
  variant = 'auto'
}: GlassCardProps) {
  const { theme } = useTheme();
  
  const getVariant = () => {
    if (variant === 'auto') {
      return theme === 'dark' ? 'dark' : 'light';
    }
    return variant;
  };

  const currentVariant = getVariant();

  return (
    <div 
      className={cn(
        "rounded-lg border backdrop-blur-md transition-all duration-300",
        "hover:shadow-lg hover:shadow-black/5",
        currentVariant === 'dark' 
          ? "glass-card-dark text-white" 
          : "glass-card-light text-black",
        className
      )}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  );
}
