/**
 * SurgePath Component
 * 
 * Renders an animated Data Surge path with a "comet" effect.
 * Uses framer-motion to animate strokeDasharray and strokeDashoffset
 * to create a glowing head segment that trails off into transparency.
 */

"use client";

import { motion } from "framer-motion";
import type { DataSurge } from "./useSurgeSpawner";

interface SurgePathProps {
  surge: DataSurge;
}

// Visual constants for the comet effect
const STROKE_WIDTH = 2.5;
const HEAD_LENGTH = 25; // Length of the glowing head segment
const TAIL_LENGTH = 50; // Length of the trailing tail
const GAP_LENGTH = 200; // Gap after tail before next head

/**
 * SurgePath component renders a single animated surge path
 * 
 * The comet effect is achieved by:
 * 1. Using strokeDasharray to create a pattern: [head, tail, gap]
 * 2. Animating strokeDashoffset to move the pattern along the path
 * 3. Using a filter to create the glow effect
 */
export function SurgePath({ surge }: SurgePathProps) {
  // Create dash pattern: head (bright), tail (fading), gap (invisible)
  const dashArray = `${HEAD_LENGTH} ${TAIL_LENGTH} ${GAP_LENGTH}`;
  
  // Total length of one complete dash pattern cycle
  const patternLength = HEAD_LENGTH + TAIL_LENGTH + GAP_LENGTH;
  
  // Estimate path length (we'll animate offset to move the pattern along)
  // Use a large offset to ensure the pattern travels the full path
  const maxOffset = 2000; // Large enough to cover most paths

  return (
    <g>
      {/* Glow filter definition */}
      <defs>
        <filter 
          id={`glow-${surge.id}`} 
          x="-50%" 
          y="-50%" 
          width="200%" 
          height="200%"
        >
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Animated path with comet effect */}
      <motion.path
        d={surge.path}
        fill="none"
        stroke={surge.color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${surge.id})`}
        initial={{
          strokeDasharray: dashArray,
          strokeDashoffset: 0,
          opacity: 0,
        }}
        animate={{
          strokeDashoffset: -maxOffset,
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: surge.duration,
          ease: "linear",
          opacity: {
            times: [0, 0.05, 0.95, 1],
            duration: surge.duration,
          },
        }}
        style={{
          vectorEffect: "non-scaling-stroke",
        }}
      />
      
      {/* Additional bright head segment for stronger glow */}
      <motion.path
        d={surge.path}
        fill="none"
        stroke={surge.color}
        strokeWidth={STROKE_WIDTH * 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
        initial={{
          strokeDasharray: `${HEAD_LENGTH} ${patternLength}`,
          strokeDashoffset: 0,
          opacity: 0,
        }}
        animate={{
          strokeDashoffset: -maxOffset,
          opacity: [0, 0.6, 0.6, 0],
        }}
        transition={{
          duration: surge.duration,
          ease: "linear",
          opacity: {
            times: [0, 0.05, 0.95, 1],
            duration: surge.duration,
          },
        }}
        style={{
          vectorEffect: "non-scaling-stroke",
          filter: `url(#glow-${surge.id})`,
        }}
      />
    </g>
  );
}

