"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

type ElegantShapeProps = {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  isDark?: boolean;
};

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
  isDark = true,
}: ElegantShapeProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            isDark 
              ? "backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
              : "backdrop-blur-[2px] border-2 border-black/[0.15] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            isDark
              ? "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
              : "after:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

type HeroGeometricProps = {
  className?: string;
};

export function HeroGeometric({
  className,
}: HeroGeometricProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  const bgColor = isDark ? "#030303" : "#ffffff";
  const gradientFrom = isDark ? "from-indigo-500/[0.05]" : "from-indigo-500/[0.03]";
  const gradientTo = isDark ? "to-rose-500/[0.05]" : "to-rose-500/[0.03]";
  const overlayGradient = isDark 
    ? "from-[#030303] via-transparent to-[#030303]/80" 
    : "from-[#ffffff] via-transparent to-[#ffffff]/80";

  return (
    <div className={cn("fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0", className)}>
      <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradientFrom, "via-transparent", gradientTo, "blur-3xl")} />
      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient={isDark ? "from-indigo-500/[0.15]" : "from-indigo-500/[0.08]"}
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
          isDark={isDark}
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient={isDark ? "from-rose-500/[0.15]" : "from-rose-500/[0.08]"}
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
          isDark={isDark}
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient={isDark ? "from-violet-500/[0.15]" : "from-violet-500/[0.08]"}
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
          isDark={isDark}
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient={isDark ? "from-amber-500/[0.15]" : "from-amber-500/[0.08]"}
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
          isDark={isDark}
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient={isDark ? "from-cyan-500/[0.15]" : "from-cyan-500/[0.08]"}
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
          isDark={isDark}
        />
      </div>
      <div className={cn("absolute inset-0 bg-gradient-to-t", overlayGradient, "pointer-events-none")} />
    </div>
  );
}

export type { HeroGeometricProps };

