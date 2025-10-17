import React from "react"
import { motion } from "framer-motion"
import { Pointer } from "@/components/ui/Pointer"
import { cn } from "@/utils"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { 
  MousePointer, 
  Send, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Settings, 
  MessageSquare, 
  Bot, 
  BarChart3, 
  FileText, 
  Globe, 
  Link, 
  Filter, 
  Grid3X3, 
  List, 
  Clock, 
  Bell, 
  HelpCircle, 
  Languages, 
  User, 
  Moon, 
  Heart, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Play,
  Pause,
  Archive,
  Copy
} from "lucide-react"

interface AnimatedPointerProps {
  icon?: React.ComponentType<{ className?: string }>
  size?: "sm" | "md" | "lg"
  animation?: "bounce" | "pulse" | "wiggle" | "heart" | "star" | "sparkle"
  className?: string
  children?: React.ReactNode
}

const animations = {
  bounce: {
    animate: {
      scale: [1, 1.2, 1],
      y: [0, -10, 0],
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  pulse: {
    animate: {
      scale: [1, 1.3, 1],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  wiggle: {
    animate: {
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
    },
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  heart: {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
    },
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  star: {
    animate: {
      scale: [1, 1.4, 1],
      rotate: [0, 180, 360],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  sparkle: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1],
    },
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5", 
  lg: "h-6 w-6",
}

export function AnimatedPointer({
  icon: Icon = MousePointer,
  size = "md",
  animation = "bounce",
  className,
  children,
}: AnimatedPointerProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  // Function to check if an element has primary color styling
  const hasPrimaryColor = (element: HTMLElement): boolean => {
    // Check for primary color classes - focus on background colors
    const hasPrimaryClass = element.classList.contains('bg-primary') || 
                           (typeof element.className === 'string' && element.className.includes('bg-primary'))
    
    // Check if element has primary color in computed styles
    const computedStyle = window.getComputedStyle(element)
    const backgroundColor = computedStyle.backgroundColor
    
    // Get the actual primary color from CSS custom properties
    const rootStyle = getComputedStyle(document.documentElement)
    const primaryColorValue = rootStyle.getPropertyValue('--primary').trim()
    
    // Convert primary color to a comparable format
    let primaryRgb = ''
    if (primaryColorValue) {
      // Convert HSL to RGB for comparison
      const hslMatch = primaryColorValue.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
      if (hslMatch) {
        const [, h, s, l] = hslMatch
        const hNum = parseInt(h) / 360
        const sNum = parseInt(s) / 100
        const lNum = parseInt(l) / 100
        
        // Simple HSL to RGB conversion
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1/6) return p + (q - p) * 6 * t
          if (t < 1/2) return q
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
          return p
        }
        
        const q = lNum < 0.5 ? lNum * (1 + sNum) : lNum + sNum - lNum * sNum
        const p = 2 * lNum - q
        const r = Math.round(hue2rgb(p, q, hNum + 1/3) * 255)
        const g = Math.round(hue2rgb(p, q, hNum) * 255)
        const b = Math.round(hue2rgb(p, q, hNum - 1/3) * 255)
        
        primaryRgb = `rgb(${r}, ${g}, ${b})`
      }
    }
    
    // Check if background color matches primary color
    const matchesPrimaryColor = primaryRgb && backgroundColor === primaryRgb
    
    // Only return true if we have a clear indication of primary color
    return hasPrimaryClass || matchesPrimaryColor
  }

  // Function to get contrasting color
  const getContrastingColor = (): string => {
    if (!hoveredElement || !isHovered) return 'hsl(var(--primary) / 0.9)'
    
    const hasPrimary = hasPrimaryColor(hoveredElement)
    
    if (hasPrimary) {
      // Return theme-appropriate contrasting color
      // Black for light theme, white for dark theme
      return theme === 'light' ? 'black' : 'white'
    }
    
    // Return primary color for non-primary elements
    return 'hsl(var(--primary) / 0.9)'
  }

  useEffect(() => {
    // Global mouse event listeners to detect hovered elements
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && target !== hoveredElement) {
        setHoveredElement(target)
        setIsHovered(true)
      }
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      setHoveredElement(null)
    }

    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [hoveredElement])

  return (
    <Pointer className={className}>
      <motion.div
        ref={containerRef}
        className={cn("pointer-events-none select-none")}
        style={{ userSelect: "none" }}
        {...animations[animation]}
      >
        {children || (
          <div
            data-pointer-icon
            className={cn(
              sizes[size], 
              "drop-shadow-lg transition-colors inline-block"
            )}
            style={{
              color: isHovered ? getContrastingColor() : 'hsl(var(--primary) / 0.9)'
            }}
          >
            <Icon 
              className="w-full h-full"
            />
          </div>
        )}
      </motion.div>
    </Pointer>
  )
}

// Predefined pointer types for different use cases
export const PointerTypes = {
  // Action pointers
  Click: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={MousePointer} animation="bounce" size="md" className={className} />
  ),
  Send: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Send} animation="pulse" size="md" className={className} />
  ),
  Download: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Download} animation="pulse" size="md" className={className} />
  ),
  Upload: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Upload} animation="pulse" size="md" className={className} />
  ),
  Add: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Plus} animation="bounce" size="md" className={className} />
  ),
  Edit: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Edit} animation="sparkle" size="md" className={className} />
  ),
  Delete: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Trash2} animation="pulse" size="md" className={className} />
  ),
  Save: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Save} animation="heart" size="md" className={className} />
  ),
  Refresh: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={RefreshCw} animation="star" size="md" className={className} />
  ),
  Play: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Play} animation="bounce" size="md" className={className} />
  ),
  Pause: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Pause} animation="pulse" size="md" className={className} />
  ),
  Archive: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Archive} animation="heart" size="md" className={className} />
  ),
  Copy: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Copy} animation="sparkle" size="md" className={className} />
  ),
  
  // Navigation pointers
  Next: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={ChevronRight} animation="wiggle" size="md" className={className} />
  ),
  Back: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={ChevronLeft} animation="wiggle" size="md" className={className} />
  ),
  Up: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={ChevronUp} animation="bounce" size="md" className={className} />
  ),
  Down: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={ChevronDown} animation="bounce" size="md" className={className} />
  ),
  
  // Feature pointers
  Search: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Search} animation="sparkle" size="md" className={className} />
  ),
  Settings: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Settings} animation="pulse" size="md" className={className} />
  ),
  Chat: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={MessageSquare} animation="heart" size="md" className={className} />
  ),
  AI: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Bot} animation="star" size="md" className={className} />
  ),
  Analytics: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={BarChart3} animation="pulse" size="md" className={className} />
  ),
  Documents: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={FileText} animation="sparkle" size="md" className={className} />
  ),
  Crawl: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Globe} animation="wiggle" size="md" className={className} />
  ),
  Integration: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Link} animation="heart" size="md" className={className} />
  ),
  Filter: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Filter} animation="wiggle" size="md" className={className} />
  ),
  Grid: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Grid3X3} animation="sparkle" size="md" className={className} />
  ),
  List: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={List} animation="bounce" size="md" className={className} />
  ),
  Time: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Clock} animation="pulse" size="md" className={className} />
  ),
  Notification: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Bell} animation="bounce" size="md" className={className} />
  ),
  Help: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={HelpCircle} animation="sparkle" size="md" className={className} />
  ),
  Language: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Languages} animation="heart" size="md" className={className} />
  ),
  User: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={User} animation="bounce" size="md" className={className} />
  ),
  Theme: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Moon} animation="star" size="md" className={className} />
  ),
  
  // Special pointers
  Favorite: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Heart} animation="heart" size="md" className={className} />
  ),
  Star: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Star} animation="star" size="md" className={className} />
  ),
  Warning: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={AlertTriangle} animation="pulse" size="md" className={className} />
  ),
  Success: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={CheckCircle} animation="bounce" size="md" className={className} />
  ),
  Error: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={XCircle} animation="pulse" size="md" className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
    <AnimatedPointer icon={Info} animation="sparkle" size="md" className={className} />
  ),
}
