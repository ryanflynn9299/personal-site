/**
 * Centralized Theme Colors
 *
 * This is the single source of truth for all colors used across the site.
 * All color values should be imported from here rather than hardcoded.
 *
 * For raw hex codes needed in specific contexts (SVG, inline styles, etc.),
 * use the hex values from this file.
 *
 * For Tailwind classes, use the Tailwind color system which references
 * these values via tailwind.config.ts
 */

// ============================================================================
// CORE THEME COLORS
// ============================================================================

/**
 * Core background and foreground colors
 */
export const core = {
  // Background colors
  background: {
    primary: "#0f172a", // slate-900 - Main background
    secondary: "#1e293b", // slate-800 - Secondary background (gradients)
    dark: "#060010", // Very dark background for special components
    darkest: "#020617", // slate-950
  },

  // Foreground/text colors
  foreground: {
    primary: "#f8fafc", // slate-50 - Primary text
    secondary: "#e2e8f0", // slate-200 - Secondary text
    tertiary: "#cbd5e1", // slate-300 - Tertiary text
    muted: "#94a3b8", // slate-400 - Muted text
  },

  // Border colors
  border: {
    default: "#334155", // slate-700
    light: "#475569", // slate-600
    muted: "#64748b", // slate-500
  },
} as const;

// ============================================================================
// TAILWIND COLOR PALETTE
// ============================================================================

/**
 * Slate color scale (primary neutral palette)
 */
export const slate = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
  950: "#020617",
} as const;

/**
 * Sky color scale (primary accent)
 */
export const sky = {
  200: "#bae6fd", // sky-200
  300: "#7dd3fc", // sky-300
  400: "#38bdf8", // sky-400 - Primary link color
  500: "#0ea5e9", // sky-500
  600: "#0284c7", // sky-600
  700: "#0369a1", // sky-700
} as const;

/**
 * Purple color scale (secondary accent)
 */
export const purple = {
  300: "#c4b5fd", // purple-300
  400: "#a78bfa", // purple-400
  500: "#8b5cf6", // purple-500
  600: "#9333ea", // purple-600
} as const;

// ============================================================================
// ACCENT COLORS
// ============================================================================

/**
 * Primary accent colors used across the site
 */
export const accents = {
  // Primary accent (sky blue)
  primary: sky[400], // "#38bdf8"
  primaryHover: sky[300], // "#7dd3fc"
  primaryLight: sky[200], // "#bae6fd"

  // Secondary accent (purple)
  secondary: purple[400], // "#a78bfa"
  secondaryHover: purple[300], // "#c4b5fd"

  // Special accent colors
  cyan: "#06b6d4", // cyan-500
  teal: "#03b3c3", // Custom teal (used in projects)
  amber: "#f59e0b", // amber-500
  emerald: "#10b981", // emerald-500
  fuchsia: "#d946ef", // fuchsia-500
  indigo: "#818cf8", // indigo-400
  orange: "#f97316", // orange-500
  pink: "#ec4899", // pink-500
  blue: "#3b82f6", // blue-500
  violet: "#8b5cf6", // violet-500 (same as purple-500)
  yellow: "#fbbf24", // amber-400 / yellow
} as const;

// ============================================================================
// COMPONENT-SPECIFIC COLORS
// ============================================================================

/**
 * Quote view colors
 */
export const quotes = {
  // Modal colors
  modal: {
    background: "rgba(30, 41, 59, 0.25)", // slate-800 with opacity
    border: "rgba(81, 125, 132, 0.25)", // sky-300 with opacity
    title: sky[400], // "#38bdf8"
    text: sky[200], // "#bae6fd"
  },

  // Entity/planet colors (solar system view)
  entities: [
    accents.blue, // "#3b82f6" - blue
    accents.violet, // "#8b5cf6" - purple
    accents.pink, // "#ec4899" - pink
    accents.amber, // "#f59e0b" - amber
    accents.emerald, // "#10b981" - emerald
    accents.cyan, // "#06b6d4" - cyan
    accents.orange, // "#f97316" - orange
    accents.indigo, // "#6366f1" - indigo
  ] as const,

  // Sun color
  sun: accents.yellow, // "#fbbf24"

  // Hex array active colors
  hexArray: {
    cyan: accents.cyan, // "#06b6d4"
    amber: accents.amber, // "#f59e0b"
    violet: accents.violet, // "#8b5cf6"
  } as const,

  // Constellation colors
  constellation: {
    blue: "#60a5fa", // blue-400
    purple: purple[400], // "#a78bfa"
    pink: "#f472b6", // pink-400
    emerald: "#34d399", // emerald-400
    default: slate[400], // "#94a3b8"
  } as const,
} as const;

/**
 * Project category colors
 */
export const projects = {
  webDev: sky[500], // "#0ea5e9" - sky-500
  mlAi: accents.fuchsia, // "#d946ef" - fuchsia-500
  systems: accents.yellow, // "#fbbf24" - amber-400
  tools: accents.emerald, // "#10b981" - emerald-500
  other: accents.indigo, // "#818cf8" - indigo-400
  default: accents.teal, // "#03b3c3" - Custom teal
} as const;

/**
 * MagicBento component colors
 */
export const magicBento = {
  glow: {
    color: "132, 0, 255", // RGB values for rgba() usage
    hex: "#8400ff", // Purple glow
  },
  card: {
    background: core.background.dark, // "#060010"
    border: "#392e4e", // Custom purple border
  },
  purple: {
    primary: "rgba(132, 0, 255, 1)",
    glow: "rgba(132, 0, 255, 0.2)",
    border: "rgba(132, 0, 255, 0.8)",
  },
} as const;

/**
 * Folder component colors
 */
export const folder = {
  default: "#5227FF", // Purple folder color
  paper: {
    light: "#ffffff",
    dark1: "#f5f5f5", // darkenColor('#ffffff', 0.1)
    dark2: "#fafafa", // darkenColor('#ffffff', 0.05)
  },
} as const;

/**
 * Particle colors
 */
export const particles = {
  default: ["#ffffff", "#ffffff", "#ffffff"], // White particles
} as const;

// ============================================================================
// SPECIAL EFFECTS COLORS
// ============================================================================

/**
 * Star field colors (used in background animations)
 */
export const stars = {
  bright: slate[50], // "#f8fafc" - Brightest stars
  medium: slate[200], // "#e2e8f0" - Medium stars
  dim: slate[400], // "#94a3b8" - Dim stars
  white: "#ffffff", // Pure white
  transparent: "rgba(0, 0, 0, 0)", // Transparent
} as const;

/**
 * Toast notification colors
 */
export const toast = {
  success: {
    border: "rgba(34, 197, 94, 0.5)", // green-500/50
    background: "rgba(34, 197, 94, 0.1)", // green-500/10
    text: "#86efac", // green-200
  },
  error: {
    border: "rgba(239, 68, 68, 0.5)", // red-500/50
    background: "rgba(239, 68, 68, 0.1)", // red-500/10
    text: "#fca5a5", // red-200
  },
  info: {
    border: "rgba(14, 165, 233, 0.5)", // sky-500/50
    background: "rgba(14, 165, 233, 0.1)", // sky-500/10
    text: sky[200], // "#bae6fd"
  },
} as const;

/**
 * Comet/Rocket colors
 */
export const comets = {
  red: "rgba(239, 68, 68, 0.7)", // red-500
  blue: "rgba(59, 130, 246, 0.7)", // blue-500
  green: "rgba(34, 197, 94, 0.7)", // emerald-500
  purple: "rgba(168, 85, 247, 0.7)", // purple-500
  default: "rgba(148, 163, 184, 0.6)", // slate-400
} as const;

// ============================================================================
// GRADIENT COLORS
// ============================================================================

/**
 * Common gradient colors
 */
export const gradients = {
  background: {
    primary: `radial-gradient(ellipse at top, ${core.background.secondary}, ${core.background.primary})`,
  },
  quotes: {
    overlay: [
      "rgba(3, 179, 195, 0.15)", // teal
      "rgba(216, 86, 191, 0.2)", // fuchsia
      "rgba(3, 179, 195, 0.25)", // teal
      "rgba(0, 0, 0, 0.9)", // black
    ] as const,
    grid: [
      "rgba(3, 179, 195, 0.03)", // teal
      "rgba(216, 86, 191, 0.03)", // fuchsia
    ] as const,
  },
} as const;

// ============================================================================
// UTILITY COLORS
// ============================================================================

/**
 * Utility colors for special cases
 */
export const utils = {
  black: "#000000",
  white: "#ffffff",
  transparent: "transparent",

  // SEO/Theme colors
  seo: {
    light: "#ffffff",
    dark: core.background.primary, // "#0f172a"
  },

  // Entity shape background
  entityBackground: "#000000",

  // Tesseract view colors (same as entity colors)
  tesseract: quotes.entities,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Type for all theme colors
 */
export type ThemeColors = typeof core &
  typeof slate &
  typeof sky &
  typeof purple &
  typeof accents &
  typeof quotes &
  typeof projects &
  typeof magicBento &
  typeof folder &
  typeof particles &
  typeof stars &
  typeof toast &
  typeof comets &
  typeof gradients &
  typeof utils;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get RGB values from hex color
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Get rgba string from hex and opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {return hex;}
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}
