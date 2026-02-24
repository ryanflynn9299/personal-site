import { env } from "@/lib/env";

/**
 * Feature Flag System
 *
 * This module provides a centralized way to manage feature visibility.
 * Features can be in one of three states:
 *
 * 1. production - Feature is fully enabled in all environments
 * 2. dev-only - Feature is only enabled when devModeUI is true (dev environments)
 * 3. hidden - Feature is disabled in all environments (even dev)
 */

export type FeatureStatus = "production" | "dev-only" | "hidden";

// Define available features here
export type FeatureKey = "funCounter" | "offlineDummyBlogs";

// Feature configuration
export const features: Record<FeatureKey, FeatureStatus> = {
  funCounter: "hidden",
  offlineDummyBlogs: "dev-only",
};

/**
 * Checks if a feature should be enabled based on the current environment.
 */
export function isFeatureEnabled(feature: FeatureKey): boolean {
  const status = features[feature];

  // Hidden features are never enabled
  if (status === "hidden") {
    return false;
  }

  // Production features are always enabled
  if (status === "production") {
    return true;
  }

  // Dev-only features depend on the devModeUI setting
  if (status === "dev-only") {
    return env.devModeUI;
  }

  // Default fallback (should not reach here if types are correct)
  return false;
}

/**
 * Checks if the "DEV" indicator badge should be shown for a feature.
 * This is typically true for 'dev-only' features when they are visible.
 */
export function shouldShowDevIndicator(feature: FeatureKey): boolean {
  const status = features[feature];
  return status === "dev-only" && env.devModeUI;
}
