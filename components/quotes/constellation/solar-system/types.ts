import type { Quote } from "@/app/(portfolio)/quotes/config";

export interface Entity {
  id: string;
  name: string;
  category: string;
  quotes: Quote[];
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  shape: "ringed-planet" | "monolith" | "pyramid";
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
  quote: Quote;
  iconType: "rocket" | "asteroid";
  rotation: number; // Fixed rotation in degrees
  color?: string; // Color for rockets (red, blue, green, purple)
  size: "small" | "medium" | "large"; // Comet size
}

export interface SolarSystemViewProps {
  quotes: Quote[];
}

