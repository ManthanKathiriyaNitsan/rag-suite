import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  noHover?: boolean;
  onClick?: () => void;
  [key: string]: any; // Allow other props like data-testid, etc.
}

export function GlassCard({ 
  children, 
  className = "",
  variant = 'auto',
  noHover = false,
  onClick,
  ...props
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
        "border backdrop-blur-md transition-all duration-300",
        currentVariant === 'dark' 
          ? "glass-card-dark text-white" 
          : "glass-card-light text-black",
        className
      )}
      style={{
        borderRadius: 'var(--component-cardRadius, 2px)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0px 1px 5px -1px rgba(0, 0, 0, 0.2)'
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
