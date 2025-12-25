"use client";

import { motion } from "framer-motion";
import {
  PULSE_ANIMATION_DURATION,
  PULSE_STROKE_WIDTH,
  PULSE_OPACITY_KEYFRAMES,
  PULSE_SCALE_KEYFRAMES,
  PULSE_TIMING_KEYFRAMES,
  PULSE_EASE,
  PULSE_DROP_SHADOW_BLUR,
} from "./pulseConstants";

interface HexPulseProps {
  x: number;
  y: number;
  color: string;
}

// Hexagon size constant (matches HexArrayView)
const HEX_SIZE = 40;

/**
 * Generate hexagon path points for flat-top hexagon
 * Flat-top hexagons have a point at the top
 */
function getHexPath(size: number): string {
  const points: string[] = [];
  // Start from top point (angle = -PI/2 for flat-top)
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // Rotate for flat-top
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return `M ${points[0]} L ${points.slice(1).join(" L ")} Z`;
}

/**
 * HexPulse component renders a single pulse animation around a hex tile
 * Implements exact animation spec from document:
 * - Opacity: [0, 0.4, 0.4, 0]
 * - Scale: [0.95, 1.15, 1.2, 1.2]
 * - Times: [0, 0.2, 0.6, 1]
 * - Duration: 1 second
 */
export function HexPulse({ x, y, color }: HexPulseProps) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <motion.path
        d={getHexPath(HEX_SIZE + 2)} // Smaller end radius - closer to tile
        fill="none"
        stroke={color}
        strokeWidth={PULSE_STROKE_WIDTH} // Thicker stroke
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: PULSE_SCALE_KEYFRAMES[0] }}
        animate={{
          opacity: [...PULSE_OPACITY_KEYFRAMES], // Less opaque, fades out completely
          scale: [...PULSE_SCALE_KEYFRAMES], // Smaller expansion - doesn't radiate as far
        }}
        transition={{
          duration: PULSE_ANIMATION_DURATION,
          times: [...PULSE_TIMING_KEYFRAMES], // Fade in quickly, hold briefly, fade out at end
          ease: [...PULSE_EASE], // Smooth ease out
        }}
        style={{
          filter: `drop-shadow(0 0 ${PULSE_DROP_SHADOW_BLUR}px ${color})`,
          transformOrigin: "center center",
        }}
      />
    </g>
  );
}

