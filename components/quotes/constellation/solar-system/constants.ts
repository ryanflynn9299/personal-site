// Color palette for entities
export const ENTITY_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
];

// Elliptical orbit compression factor (simulates 35deg tilt)
export const ELLIPSE_COMPRESSION = Math.cos((35 * Math.PI) / 180);

// Deterministic patterns for orbit properties
export const SPACING_PATTERN = [1.0, 0.85, 1.15, 0.9, 1.1, 0.95, 1.05, 1.0];
export const RETROGRADE_PATTERN = [false, false, true, false, false, false, false, true];
export const ECCENTRICITY_PATTERN = [0.1, 0.15, 0.08, 0.2, 0.12, 0.18, 0.1, 0.22];

// Orbit configuration
export const BASE_RADIUS = 70;
export const BASE_SPACING = 40;
export const BASE_SPEED_MIN = 0.3;
export const BASE_SPEED_VARIATION = 0.1;

// Sun configuration
export const SUN_COLOR = "#fbbf24"; // Yellow/gold color for sun
export const SUN_SIZE = 48; // Sun size (h-12 w-12 = 48px)
export const SUN_QUOTE_PERCENTAGE = 0.15; // 15% of quotes go to Sun

// Comet configuration
export const ROCKET_COLORS = ["red", "blue", "green", "purple"] as const;
export const COMET_INITIAL_COUNT = 3;
export const COMET_MAX_COUNT = 5;
export const COMET_SPAWN_CHANCE = 0.3;
export const COMET_SPAWN_INTERVAL = 2000; // ms

