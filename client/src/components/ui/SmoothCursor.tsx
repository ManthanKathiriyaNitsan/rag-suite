import { FC, useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { useTheme } from "@/contexts/ThemeContext"

interface Position {
  x: number
  y: number
}

export interface SmoothCursorProps {
  cursor?: React.ReactNode
  springConfig?: {
    damping: number
    stiffness: number
    mass: number
    restDelta: number
  }
}

const DefaultCursorSVG: FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 50 54"
      fill="none"
      style={{ scale: 0.8 }}
    >
      <g filter="url(#filter0_d_91_7928)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill={isDark ? "white" : "black"}
        />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke={isDark ? "black" : "white"}
          strokeWidth={2.25825}
        />
      </g>
      <defs>
        <filter
          id="filter0_d_91_7928"
          x={0.602397}
          y={0.952444}
          width={49.0584}
          height={52.428}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={2.25825} />
          <feGaussianBlur stdDeviation={2.25825} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_91_7928"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_91_7928"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  )
}

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
  springConfig = {
    damping: 25,
    stiffness: 300,
    mass: 0.5,
    restDelta: 0.001,
  },
}: SmoothCursorProps) {
  const [isMoving, setIsMoving] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [isPointerActive, setIsPointerActive] = useState(false)
  
  // Apply immediate cursor hiding on component mount (before useEffect)
  if (typeof window !== 'undefined' && isDesktop) {
    document.body.style.cursor = "none"
    document.body.classList.add('smooth-cursor-active')
    document.documentElement.classList.add('smooth-cursor-active')
  }
  const lastMousePos = useRef<Position>({ x: 0, y: 0 })
  const velocity = useRef<Position>({ x: 0, y: 0 })
  const lastUpdateTime = useRef(Date.now())
  const previousAngle = useRef(0)
  const accumulatedRotation = useRef(0)

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const rotation = useMotionValue(0)
  const scale = useMotionValue(1)
  
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)
  const springRotation = useSpring(rotation, {
    damping: 20,
    stiffness: 200,
    mass: 0.3,
  })
  const springScale = useSpring(scale, {
    damping: 15,
    stiffness: 400,
    mass: 0.2,
  })

  // Check screen size and hide cursor on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024) // lg breakpoint
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, []) // Empty dependency array - runs only on mount

  // Monitor for active pointers and hide SmoothCursor when they're active
  useEffect(() => {
    const checkForActivePointers = () => {
      const activePointer = document.querySelector('[data-pointer-active="true"]')
      setIsPointerActive(!!activePointer)
    }

    // Check initially
    checkForActivePointers()

    // Use MutationObserver to watch for data-pointer-active attribute changes
    const observer = new MutationObserver(checkForActivePointers)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-pointer-active'],
      subtree: true
    })

    return () => observer.disconnect()
  }, []) // Empty dependency array - runs only on mount

  // Apply cursor hiding immediately when component mounts
  useEffect(() => {
    // Don't initialize cursor on mobile/tablet
    if (!isDesktop) return

    // IMMEDIATELY hide cursor on body and all elements
    document.body.style.cursor = "none"
    document.body.classList.add('smooth-cursor-active')
    
    // Simplified CSS injection for better performance
    const style = document.createElement('style')
    style.id = 'smooth-cursor-hide'
    style.textContent = `
      html.smooth-cursor-active *,
      body.smooth-cursor-active * {
        cursor: none !important;
      }
    `
    document.head.appendChild(style)
    document.documentElement.classList.add('smooth-cursor-active')
    
    const updateVelocity = (currentPos: Position) => {
      const currentTime = performance.now()
      const deltaTime = currentTime - lastUpdateTime.current

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        }
      }

      lastUpdateTime.current = currentTime
      lastMousePos.current = currentPos
    }

    const smoothMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY }
      updateVelocity(currentPos)

      // Simplified speed calculation for better performance
      const speed = Math.abs(velocity.current.x) + Math.abs(velocity.current.y)

      cursorX.set(currentPos.x)
      cursorY.set(currentPos.y)

      if (speed > 0.1) {
        const currentAngle =
          Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) +
          90

        let angleDiff = currentAngle - previousAngle.current
        if (angleDiff > 180) angleDiff -= 360
        if (angleDiff < -180) angleDiff += 360
        accumulatedRotation.current += angleDiff
        rotation.set(accumulatedRotation.current)
        previousAngle.current = currentAngle

        scale.set(0.95)
        setIsMoving(true)

        const timeout = setTimeout(() => {
          scale.set(1)
          setIsMoving(false)
        }, 50)

        return () => clearTimeout(timeout)
      }
    }

    let rafId: number
    let lastMouseEvent: MouseEvent | null = null
    
    const throttledMouseMove = (e: MouseEvent) => {
      lastMouseEvent = e
      
      if (rafId) return

      rafId = requestAnimationFrame(() => {
        if (lastMouseEvent) {
          smoothMouseMove(lastMouseEvent)
          lastMouseEvent = null
        }
        rafId = 0
      })
    }

    // Set cursor none on body and all elements
    document.body.style.cursor = "none"
    
    window.addEventListener("mousemove", throttledMouseMove)

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove)
      document.body.classList.remove('smooth-cursor-active')
      document.documentElement.classList.remove('smooth-cursor-active')
      document.body.style.cursor = "auto"
      
      // Remove the custom cursor hiding styles
      const existingStyle = document.getElementById('smooth-cursor-hide')
      if (existingStyle) {
        existingStyle.remove()
      }
      
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isDesktop, isPointerActive]) // Only depend on values that affect rendering

  // Don't render cursor on mobile/tablet or when pointers are active
  if (!isDesktop || isPointerActive) return null

  return (
    <motion.div
      style={{
        position: "fixed",
        left: springX,
        top: springY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: springRotation,
        scale: springScale,
        zIndex: 99999,
        pointerEvents: "none",
        willChange: "transform",
        transform: "translateZ(0)", // Force hardware acceleration
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
        mass: 0.3,
      }}
    >
      {cursor}
    </motion.div>
  )
}
