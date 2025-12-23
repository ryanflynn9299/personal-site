/**
 * Shared types for hex array components
 */

import type { Quote } from "@/app/(portfolio)/quotes/config";

export interface HexTile {
  id: string;
  x: number;
  y: number;
  isActive: boolean;
  quote?: Quote;
  color?: "cyan" | "amber" | "violet";
  icon?: "satellite" | "planet" | "star" | "rocket";
}

export interface DataSurge {
  id: string;
  path: string; // SVG path string
  color: string; // Color inherited from source tile
  duration: number; // Animation duration in seconds
  startTime: number; // Timestamp when surge started
}

