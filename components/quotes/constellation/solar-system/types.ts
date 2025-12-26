import type { Quote } from "@/app/(portfolio)/quotes/config";

/**
 * Entity category type: distinguishes between focal entities (Sun/Planets)
 * and transient entities (Comets)
 */
export type EntityCategory = "focal" | "transient";

/**
 * Planet shape types - CSS-based shapes
 */
export type CSSPlanetShape =
  | "ringed-planet"
  | "cube"
  | "octahedron"
  | "hexagon"
  | "sphere"
  | "gas-giant"
  | "torus"
  | "pentagon"
  | "asteroid"
  | "nebula"
  | "comet"
  | "satellite"
  | "meteor"
  | "planet-ring"
  | "moon"
  | "star"
  | "galaxy"
  | "black-hole";

/**
 * Planet shape types - SVG-based shapes
 * Icons from multiple high-quality icon libraries
 * Type is dynamically generated from available icons
 */
export type SVGPlanetShape = string; // Dynamic type based on enabled libraries

/**
 * All planet shape types
 */
export type PlanetShape = CSSPlanetShape | SVGPlanetShape;

/**
 * Shape rendering mode - toggle between CSS shapes and SVG icons
 */
export type ShapeRenderingMode = "css" | "svg";

export interface Entity {
  id: string;
  name: string;
  category: string; // Legacy field for quote category, kept for compatibility
  entityCategory: EntityCategory; // New field for entity type classification
  quotes: Quote[];
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  shape: PlanetShape;
  color: string;
  size: number;
  eccentricity: number; // Eccentricity of the orbit (0 = circle, higher = more elliptical)
  spacingMultiplier: number; // Multiplier for orbit spacing variation
}

export interface Comet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  quote: Quote | null; // Null in production when no quotes available
  iconType: "rocket" | "asteroid";
  rotation: number; // Fixed rotation in degrees
  color?: string; // Color for rockets (red, blue, green, purple)
  size: "small" | "medium" | "large"; // Comet size
  entityCategory: EntityCategory; // Always "transient" for comets
}

export interface SolarSystemViewProps {
  quotes: Quote[];
}
