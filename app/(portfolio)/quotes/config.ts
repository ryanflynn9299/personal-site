/**
 * Configuration types for the Quotes page modular view architecture.
 * Defines all available variants for A/B testing.
 */

export type NormalVariant = "mission_control" | "tesseract";

export type ConstellationVariant =
  | "constellation"
  | "solar_system"
  | "hex_array";

export type ViewMode = "normal" | "constellation";

/**
 * Quote data structure
 */
export interface Quote {
  id: string;
  text: string;
  author?: string;
  source?: string;
  tags?: string[];
}
