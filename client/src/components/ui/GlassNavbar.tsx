import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassNavbarProps {
  children: ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

export function GlassNavbar({ 
  children, 
  className = "",
  variant = 'dark'
}: GlassNavbarProps) {
  return (
    <nav 
      className={cn(
        "w-full",
        "backdrop-blur-md border-b",
        "transition-all duration-300",
        variant === 'dark' 
          ? "glass-navbar-dark" 
          : "glass-navbar-light",
        className
      )}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between p-4 min-w-0">
        {children}
      </div>
    </nav>
  );
}
