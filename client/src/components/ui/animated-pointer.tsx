import { motion } from "framer-motion"
import { Pointer } from "@/components/ui/pointer"
import { cn } from "@/lib/utils"

interface AnimatedPointerProps {
  emoji?: string
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
  sm: "text-lg",
  md: "text-xl", 
  lg: "text-2xl",
}

export function AnimatedPointer({
  emoji = "👆",
  size = "md",
  animation = "bounce",
  className,
  children,
}: AnimatedPointerProps) {
  return (
    <Pointer className={className}>
      <motion.div
        className={cn(sizes[size], "pointer-events-none select-none")}
        style={{ userSelect: "none" }}
        {...animations[animation]}
      >
        {children || (
          <span className="drop-shadow-lg text-center leading-none">
            {emoji}
          </span>
        )}
      </motion.div>
    </Pointer>
  )
}

// Predefined pointer types for different use cases
export const PointerTypes = {
  // Action pointers
  Click: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="👆" animation="bounce" size="md" className={className} />
  ),
  Send: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="📤" animation="pulse" size="md" className={className} />
  ),
  Download: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⬇️" animation="pulse" size="md" className={className} />
  ),
  Upload: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⬆️" animation="pulse" size="md" className={className} />
  ),
  Add: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="➕" animation="bounce" size="md" className={className} />
  ),
  Edit: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="✏️" animation="sparkle" size="md" className={className} />
  ),
  Delete: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🗑️" animation="pulse" size="md" className={className} />
  ),
  Save: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="💾" animation="heart" size="md" className={className} />
  ),
  Refresh: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🔄" animation="star" size="md" className={className} />
  ),
  
  // Navigation pointers
  Next: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="➡️" animation="wiggle" size="md" className={className} />
  ),
  Back: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⬅️" animation="wiggle" size="md" className={className} />
  ),
  Up: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⬆️" animation="bounce" size="md" className={className} />
  ),
  Down: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⬇️" animation="bounce" size="md" className={className} />
  ),
  
  // Feature pointers
  Search: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🔍" animation="sparkle" size="md" className={className} />
  ),
  Settings: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⚙️" animation="pulse" size="md" className={className} />
  ),
  Chat: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="💬" animation="heart" size="md" className={className} />
  ),
  AI: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🤖" animation="star" size="md" className={className} />
  ),
  Analytics: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="📊" animation="pulse" size="md" className={className} />
  ),
  Documents: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="📄" animation="sparkle" size="md" className={className} />
  ),
  Crawl: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🕷️" animation="wiggle" size="md" className={className} />
  ),
  Integration: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🔗" animation="heart" size="md" className={className} />
  ),
  Filter: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🔽" animation="wiggle" size="md" className={className} />
  ),
  Grid: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⊞" animation="sparkle" size="md" className={className} />
  ),
  List: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="☰" animation="bounce" size="md" className={className} />
  ),
  Time: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⏰" animation="pulse" size="md" className={className} />
  ),
  Notification: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🔔" animation="bounce" size="md" className={className} />
  ),
  Help: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="❓" animation="sparkle" size="md" className={className} />
  ),
  Language: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🌐" animation="heart" size="md" className={className} />
  ),
  User: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="👤" animation="bounce" size="md" className={className} />
  ),
  Theme: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="🌙" animation="star" size="md" className={className} />
  ),
  
  // Special pointers
  Favorite: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="❤️" animation="heart" size="md" className={className} />
  ),
  Star: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⭐" animation="star" size="md" className={className} />
  ),
  Warning: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="⚠️" animation="pulse" size="md" className={className} />
  ),
  Success: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="✅" animation="bounce" size="md" className={className} />
  ),
  Error: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="❌" animation="pulse" size="md" className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
    <AnimatedPointer emoji="ℹ️" animation="sparkle" size="md" className={className} />
  ),
}
