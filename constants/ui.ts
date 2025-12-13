// UI constants (breakpoints, default values, component constants)

// MagicBento component defaults
export const DEFAULT_PARTICLE_COUNT = 12;
export const DEFAULT_SPOTLIGHT_RADIUS = 300;
export const DEFAULT_GLOW_COLOR = "132, 0, 255";
export const MOBILE_BREAKPOINT = 768;

// Toast component constants
export const toastBaseClasses =
  "relative w-full overflow-hidden rounded-lg border p-4 shadow-lg backdrop-blur-md";

export const toastTypeClasses = {
  success: "border-green-500/50 bg-green-500/10 text-green-200",
  error: "border-red-500/50 bg-red-500/10 text-red-200",
  info: "border-sky-500/50 bg-sky-500/10 text-sky-200",
};
