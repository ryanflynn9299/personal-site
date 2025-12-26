/**
 * Pulse animation constants for hex array view
 * Defines timing, visual properties, and animation keyframes
 */

// Scheduler timing constants
export const PULSE_INITIAL_DELAY = 1000; // 1 second delay before first pulse (ms)
export const PULSE_INTERVAL = 3000; // 3 seconds between pulses (ms)

// Animation timing constants
export const PULSE_ANIMATION_DURATION = 1.2; // 1 second animation duration

// Visual constants
export const PULSE_STROKE_WIDTH = 3.5; // Thicker stroke
export const PULSE_MAX_OPACITY = 0.4; // Less opaque (maximum 0.4 opacity)
export const PULSE_SCALE_START = 0.95; // Initial scale
export const PULSE_SCALE_END = 1.2; // Final scale (20% expansion)

// Animation keyframe arrays - more granular for smoother animation
// 8 keyframes for fluid transitions
export const PULSE_OPACITY_KEYFRAMES = [
  0, 0.3, 0.37, 0.4, 0.37, 0.3, 0.2, 0,
] as const;
export const PULSE_SCALE_KEYFRAMES = [
  0.95, 0.99, 1.02, 1.06, 1.09, 1.12, 1.16, 1.2,
] as const;
export const PULSE_TIMING_KEYFRAMES = [
  0, 0.1, 0.2, 0.3, 0.5, 0.65, 0.8, 1,
] as const; // Smooth fade in, hold, fade out

// Easing function
export const PULSE_EASE = [0.4, 0, 0.2, 1] as const; // Smooth ease out

// Drop shadow filter
export const PULSE_DROP_SHADOW_BLUR = 4; // px
