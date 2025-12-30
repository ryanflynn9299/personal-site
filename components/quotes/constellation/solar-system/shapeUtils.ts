import type { PlanetShape } from "./types";
import {
  PLANET_SHAPE_MODE,
  CSS_SHAPE_OPTIONS,
  SVG_SHAPE_OPTIONS,
} from "./constants";

/**
 * Get available shapes based on the current rendering mode
 */
export function getAvailableShapes(): PlanetShape[] {
  switch (PLANET_SHAPE_MODE) {
    case "css":
      return [...CSS_SHAPE_OPTIONS] as PlanetShape[];
    case "svg":
      return [...SVG_SHAPE_OPTIONS] as PlanetShape[];
    default:
      return [...CSS_SHAPE_OPTIONS] as PlanetShape[];
  }
}

/**
 * Get a random shape from available options
 */
export function getRandomShape(): PlanetShape {
  const available = getAvailableShapes();
  if (available.length === 0) {
    // Fallback to first CSS shape if no shapes available
    return CSS_SHAPE_OPTIONS[0] as PlanetShape;
  }
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get a shape by index (for deterministic assignment)
 */
export function getShapeByIndex(index: number): PlanetShape {
  const available = getAvailableShapes();
  if (available.length === 0) {
    // Fallback to first CSS shape if no shapes available
    return CSS_SHAPE_OPTIONS[0] as PlanetShape;
  }
  return available[index % available.length];
}
