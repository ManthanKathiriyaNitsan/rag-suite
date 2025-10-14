import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  HTMLMotionProps,
  motion,
  useMotionValue,
} from "motion/react"
import { createPortal } from "react-dom"

import { cn } from "@/utils"

/**
 * A custom pointer component that displays an animated cursor.
 * Add this as a child to any component to enable a custom pointer when hovering.
 * You can pass custom children to render as the pointer.
 *
 * @component
 * @param {HTMLMotionProps<"div">} props - The component props
 */
export function Pointer({
  className,
  style,
  children,
  ...props
}: HTMLMotionProps<"div">): React.ReactNode {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check screen size and hide pointers on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024) // lg breakpoint
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [setIsDesktop])

  useEffect(() => {
    // Don't initialize pointers on mobile/tablet
    if (!isDesktop) return

    if (typeof window !== "undefined" && containerRef.current) {
      // Get the parent element directly from the ref
      const parentElement = containerRef.current.parentElement

      if (parentElement) {
        // Add cursor-none to parent and all children
        parentElement.style.cursor = "none !important"
        const allElements = parentElement.querySelectorAll('*')
        allElements.forEach(el => {
          (el as HTMLElement).style.setProperty('cursor', 'none', 'important')
        })

        // Add event listeners to parent
        const handleMouseMove = (e: MouseEvent) => {
          x.set(e.clientX)
          y.set(e.clientY)
        }

        const handleMouseEnter = (e: MouseEvent) => {
          x.set(e.clientX)
          y.set(e.clientY)
          setIsActive(true)
          parentElement.setAttribute('data-pointer-active', 'true')
        }

        const handleMouseLeave = () => {
          setIsActive(false)
          parentElement.removeAttribute('data-pointer-active')
        }

        parentElement.addEventListener("mousemove", handleMouseMove)
        parentElement.addEventListener("mouseenter", handleMouseEnter)
        parentElement.addEventListener("mouseleave", handleMouseLeave)

        return () => {
          parentElement.style.cursor = ""
          parentElement.removeAttribute('data-pointer-active')
          const allElements = parentElement.querySelectorAll('*')
          allElements.forEach(el => {
            (el as HTMLElement).style.removeProperty('cursor')
          })
          parentElement.removeEventListener("mousemove", handleMouseMove)
          parentElement.removeEventListener("mouseenter", handleMouseEnter)
          parentElement.removeEventListener("mouseleave", handleMouseLeave)
        }
      }
    }
  }, [x, y, isDesktop])

  // Don't render pointers on mobile/tablet
  if (!isDesktop) return null

  return (
    <>
      <div ref={containerRef} />
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="pointer-events-none fixed"
              style={{
                top: y,
                left: x,
                transform: "translate(-50%, -50%)",
                zIndex: 99999,
                ...style,
              }}
              initial={{
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0,
                opacity: 0,
              }}
              {...props}
            >
              {children || (
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="1"
                  viewBox="0 0 16 16"
                  height="24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn(
                    "rotate-[-70deg] stroke-white text-black",
                    className
                  )}
                >
                  <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
