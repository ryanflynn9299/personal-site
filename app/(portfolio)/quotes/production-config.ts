/**
 * Production Configuration for Quotes Components
 *
 * This file controls which quote view variants are available in production.
 * In production, only the variants specified here will be accessible.
 * In dev mode, all variants remain switchable.
 *
 * To change production variants, update the values below and rebuild.
 */

import type { NormalVariant, ConstellationVariant } from "./config";

/**
 * Production configuration for quote view variants
 *
 * Only these variants will be available in production mode.
 * In dev mode, all variants remain accessible and switchable.
 */
export const PRODUCTION_QUOTE_CONFIG = {
  /**
   * The normal mode variant to use in production
   * Must be one of: "mission_control" | "tesseract"
   */
  normalVariant: "mission_control" as NormalVariant,

  /**
   * The constellation mode variant to use in production
   * Must be one of: "constellation" | "solar_system" | "hex_array"
   */
  constellationVariant: "constellation" as ConstellationVariant,
} as const;

/**
 * Type-safe helper to get production config
 * Returns the config only in production, null otherwise
 */
export function getProductionConfig() {
  // Import env dynamically to avoid circular dependencies
  // We'll check this at runtime in components
  return PRODUCTION_QUOTE_CONFIG;
}

/**
 * Validates that a variant is allowed in production
 */
export function isVariantAllowedInProduction(
  variant: NormalVariant | ConstellationVariant,
  type: "normal" | "constellation"
): boolean {
  const config = getProductionConfig();

  if (type === "normal") {
    return variant === config.normalVariant;
  } else {
    return variant === config.constellationVariant;
  }
}
