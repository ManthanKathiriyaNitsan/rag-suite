import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import ThemeAwareDarkVeil from './ThemeAwareDarkVeil';

interface HeroSectionProps {
  children: ReactNode;
  className?: string;
  height?: 'screen' | 'auto' | string;
  showBackground?: boolean;
}

export function HeroSection({ 
  children, 
  className = "",
  height = 'screen',
  showBackground = true
}: HeroSectionProps) {
  const heightClass = height === 'screen' ? 'min-h-screen' : 
                     height === 'auto' ? 'min-h-auto' : height;

  return (
    <div className={cn("relative overflow-hidden", heightClass, className)}>
      {showBackground && (
        <div className="absolute inset-0 -z-10">
          <ThemeAwareDarkVeil 
            className="w-full h-full"
          />
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
