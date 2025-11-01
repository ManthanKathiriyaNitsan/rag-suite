import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from "@/contexts/ThemeContext";
import "@theme-toggles/react/css/Classic.css";
import { Classic } from "@theme-toggles/react";

const ThemeToggle = React.memo(function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const ref = useRef<HTMLDivElement>(null);

  // Sync with theme context
  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const handleToggle = useCallback(async (newToggled: boolean) => {
    /**
     * Return early if View Transition API is not supported
     * or user prefers reduced motion
     */
    if (
        !ref.current ||
        !document.startViewTransition ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsDarkMode(newToggled);
      toggleTheme();
      return;
    }

    try {
      await document.startViewTransition(() => {
        flushSync(() => {
          setIsDarkMode(newToggled);
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
      setIsDarkMode(newToggled);
      toggleTheme();
    }
  }, [toggleTheme]);

  // Wrapper to handle state updates from the toggle prop
  const toggleHandler: React.Dispatch<React.SetStateAction<boolean>> = useCallback(
    (value) => {
      const newValue = typeof value === 'function' ? value(isDarkMode) : value;
      if (newValue !== isDarkMode) {
        handleToggle(newValue);
      }
    },
    [isDarkMode, handleToggle]
  );

  return (
    <div className="relative theme-toggle-wrapper" ref={ref}>
      {/* @ts-ignore - TypeScript issue with @theme-toggles/react Pick type */}
      <Classic 
        duration={750} 
        toggled={isDarkMode} 
        toggle={toggleHandler}
        data-testid="button-theme-toggle"
      />
    </div>
  );
});

export default ThemeToggle;
