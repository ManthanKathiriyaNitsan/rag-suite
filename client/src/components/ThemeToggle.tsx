import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const ref = useRef<HTMLButtonElement>(null);

  // Sync with theme context
  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const handleToggleTheme = async (checked: boolean) => {
    /**
     * Return early if View Transition API is not supported
     * or user prefers reduced motion
     */
    if (
        !ref.current ||
        !document.startViewTransition ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsDarkMode(checked);
      toggleTheme();
      return;
    }

    try {
      await document.startViewTransition(() => {
        flushSync(() => {
          setIsDarkMode(checked);
          toggleTheme();
        });
      }).ready;

      const { top, left, width, height } = ref.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const right = window.innerWidth - left;
      const bottom = window.innerHeight - top;
      const maxRadius = Math.hypot(
        Math.max(left, right),
        Math.max(top, bottom),
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    } catch (error) {
      // Fallback if view transition fails
      console.warn('View transition failed, falling back to normal toggle:', error);
      setIsDarkMode(checked);
      toggleTheme();
    }
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={() => handleToggleTheme(!isDarkMode)}
      data-testid="button-theme-toggle"
      className="hover-elevate relative overflow-hidden transition-all duration-200"
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        <Sun 
          className={`absolute h-4 w-4 transition-all duration-300 ${
            isDarkMode 
              ? 'rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
          }`} 
        />
        <Moon 
          className={`absolute h-4 w-4 transition-all duration-300 ${
            isDarkMode 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}