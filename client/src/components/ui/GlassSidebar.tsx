import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassSidebarProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
}

export function GlassSidebar({ 
  children, 
  className = "",
  variant = 'auto'
}: GlassSidebarProps) {
  const { theme } = useTheme();
  
  const getVariant = () => {
    if (variant === 'auto') {
      return theme === 'dark' ? 'dark' : 'light';
    }
    return variant;
  };

  const currentVariant = getVariant();

  return (
    <aside 
      className={cn(
        "flex h-screen w-80 flex-col border-r backdrop-blur-xl transition-all duration-300",
        currentVariant === 'dark' 
          ? "glass-dark" 
          : "glass-light",
        className
      )}
    >
      {children}
    </aside>
  );
}
