import { getIconsFromLibraries, type IconLibrary } from "./iconLibrary";

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

// Elliptical orbit compression factor (simulates 50deg tilt for more pronounced ellipse)
export const ELLIPSE_COMPRESSION = Math.cos((50 * Math.PI) / 180);

// Deterministic patterns for orbit properties
// Increased variance in spacing pattern for more varied ring spacing
export const SPACING_PATTERN = [1.0, 0.75, 1.35, 0.85, 1.25, 0.9, 1.15, 1.05, 0.8, 1.3, 0.95, 1.1];
export const RETROGRADE_PATTERN = [false, false, true, false, false, false, false, true];
export const ECCENTRICITY_PATTERN = [0.1, 0.15, 0.08, 0.2, 0.12, 0.18, 0.1, 0.22];

// Orbit configuration
// Increased by ~25% to make solar system 20-30% bigger overall
export const BASE_RADIUS = 88; // Increased from 70 (25% increase)
export const BASE_SPACING = 50; // Increased from 40 (25% increase)
export const BASE_SPEED_MIN = 0.3;
export const BASE_SPEED_VARIATION = 0.1;

// Sun configuration
export const SUN_COLOR = "#fbbf24"; // Yellow/gold color for sun
export const SUN_SIZE = 48; // Sun size (h-12 w-12 = 48px)
export const SUN_QUOTE_PERCENTAGE = 0.15; // 15% of quotes go to Sun

// Comet/Rocket configuration
// ========================
// Spawning configuration
export const COMET_INITIAL_COUNT = 3; // Number of comets spawned on initial load
export const COMET_MAX_COUNT = 5; // Maximum concurrent comets on screen
export const COMET_SPAWN_CHANCE = 0.3; // Probability of spawning new comet (0.0 - 1.0)
export const COMET_SPAWN_INTERVAL = 2000; // Interval between spawn checks (ms)
export const COMET_OFFSCREEN_MARGIN = 100; // Margin for off-screen cleanup (px)

// Speed configuration (normal distribution)
export const COMET_SPEED_MEAN = 0.5; // Mean speed for normal distribution
export const COMET_SPEED_STD_DEV = 0.15; // Standard deviation for normal distribution
export const COMET_SPEED_MIN = 0.2; // Minimum speed (clamped)
export const COMET_SPEED_MAX = 0.8; // Maximum speed (clamped)

// Visual configuration
export const ROCKET_COLORS = ["red", "blue", "green", "purple"] as const;
export const COMET_ICON_TYPE_CHANCE = 0.5; // Probability of rocket vs asteroid (0.0 - 1.0)

// Size distribution (for asteroids only - rockets are always large)
export const ASTEROID_SIZE_WEIGHTS = {
  medium: 0.55, // 55% chance
  small: 0.30,  // 30% chance (cumulative: 85%)
  large: 0.15,  // 15% chance (cumulative: 100%)
} as const;

// Tooltip configuration
export const TOOLTIP_HIDE_DELAY = 400; // ms - delay before hiding tooltip after mouse leaves

// Planet Shape Configuration
// ===========================
// Shape rendering mode: "css" | "svg"
// Toggle between CSS shapes and SVG icons
export const PLANET_SHAPE_MODE: "css" | "svg" = "svg";

// CSS Shape Options (for CSS mode)
export const CSS_SHAPE_OPTIONS = [
  "ringed-planet",
  "cube",
  "octahedron",
  "hexagon",
  "sphere",
  "gas-giant",
  "torus",
  "pentagon",
  "asteroid",
  "nebula",
  "comet",
  "satellite",
  "meteor",
  "planet-ring",
  "moon",
  "star",
  "galaxy",
  "black-hole",
] as const;

// Icon Library Configuration
// ===========================
// Set the active icon library to use for SVG shapes
// Change this value to test different icon collections:
//   "lucide" | "heroicons" | "tabler" | "phosphor" | "radix"
export const ACTIVE_ICON_LIBRARY: IconLibrary = "lucide";

// User Preferences (preserved):
// - lucide: ALL icons kept (liked overall) ✅
// - react-icons: REMOVED (don't like the icons themselves) ❌
// - heroicons: Only stars/sparkles kept (for background features - dull and small otherwise) ⭐
// - tabler: planet, star, moon, satellite kept (kind of like, unsure) ❓
// - phosphor: Only planet kept (quite like phosphor's planet) ✅
// - fontawesome: REMOVED (don't like) ❌
// - radix: KEPT - Only circle and dot (dot is dormant) ✅



// SVG Shape Options (for SVG mode)
// Icons from the active icon library
export const SVG_SHAPE_OPTIONS = (() => {
  const icons = getIconsFromLibraries(new Set([ACTIVE_ICON_LIBRARY]));
  return icons.map((icon) => icon.name);
})() as readonly string[];


