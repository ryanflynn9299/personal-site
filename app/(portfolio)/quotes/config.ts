/**
 * Configuration types for the Quotes page modular view architecture.
 * Defines all available variants for A/B testing.
 */

export type NormalVariant = 'mission_control' | 'hyper_compass';

export type ConstellationVariant = 'constellation' | 'solar_system' | 'hex_grid';

export type ViewMode = 'normal' | 'constellation';

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

