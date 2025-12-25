"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

/**
 * Hyperspeed transition animation inspired by Star Wars hyperspace jumps.
 * Derived from the hyperspeed component's onClick behavior which:
 * - Zooms FOV from 90 to 150 (simulated with scale)
 * - Increases speed multiplier (simulated with motion blur and streaking)
 * - Creates visual distortion/warping effect
 * 
 * This transition creates the iconic "jump to lightspeed" effect.
 */

export interface HyperspeedTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Animation variants for the hyperspeed transition
 * Mimics the FOV zoom (90 -> 150) and speed increase from hyperspeed component
 * 
 * The transition works as follows:
 * - Exit: Content zooms out and blurs (jumping to hyperspace)
 * - Initial: New content starts from far away (coming out of hyperspace)
 * - Animate: Content zooms in and comes into focus (arriving at destination)
 */
export const hyperspeedVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.4, // Start from far away (reverse of exit) - coming out of hyperspace
    filter: "blur(20px) brightness(1.5)",
    perspective: 2000,
  },
  exit: {
    opacity: 0,
    scale: 2.5, // Simulates FOV zoom from 90 to 150 (150/90 ≈ 1.67, exaggerated for effect)
    filter: "blur(20px) brightness(1.5)",
    perspective: 2000,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth acceleration
    },
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px) brightness(1)",
    perspective: 1000,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * Variants for the streaking stars overlay
 * Creates the iconic "stars streaking past" effect
 */
const starsVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 1,
  },
  exit: {
    opacity: 1,
    scale: 3,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  enter: {
    opacity: 1,
    scale: 0.33,
  },
  animate: {
    opacity: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * Component that wraps content with hyperspeed transition animation
 */
export function HyperspeedTransition({
  children,
  className = "",
}: HyperspeedTransitionProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Streaking stars overlay - creates the tunnel effect */}
      <motion.div
        variants={starsVariants}
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `
            radial-gradient(ellipse at center, 
              transparent 0%,
              rgba(3, 179, 195, 0.15) 15%,
              rgba(216, 86, 191, 0.2) 30%,
              rgba(3, 179, 195, 0.25) 45%,
              rgba(0, 0, 0, 0.9) 100%
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              rgba(3, 179, 195, 0.03) 1px,
              transparent 2px,
              transparent 8px
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              rgba(216, 86, 191, 0.03) 1px,
              transparent 2px,
              transparent 8px
            )
          `,
          mixBlendMode: "screen",
        }}
      />
      
      {/* Main content with hyperspeed transition */}
      <motion.div
        variants={hyperspeedVariants}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

