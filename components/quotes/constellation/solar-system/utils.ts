import type { Entity } from "./types";
import { ELLIPSE_COMPRESSION } from "./constants";

/**
 * Calculate entity positions using elliptical orbits with eccentricity
 */
export function getEntityPosition(
  entity: Entity,
  containerRef: React.RefObject<HTMLDivElement>
): { x: number; y: number } {
  if (!containerRef.current) return { x: 0, y: 0 };
  const rect = containerRef.current.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Elliptical orbit: rx is full radius, ry is compressed to simulate tilt
  // Calculate semi-major and semi-minor axes with eccentricity
  const a = entity.orbitRadius;
  const e = entity.eccentricity;
  const b = a * Math.sqrt(1 - e * e);
  
  // Apply tilt compression on top of eccentricity
  const rx = a; // Semi-major axis (horizontal)
  const ry = b * ELLIPSE_COMPRESSION; // Semi-minor axis compressed by tilt
  
  // Calculate position on elliptical orbit
  const baseX = centerX + Math.cos(entity.angle) * rx;
  const baseY = centerY + Math.sin(entity.angle) * ry;

  return { x: baseX, y: baseY };
}

/**
 * Calculate entity position for click handler (with eccentricity)
 */
export function getEntityClickPosition(
  entity: Entity,
  containerRef: React.RefObject<HTMLDivElement>
): { x: number; y: number } {
  if (!containerRef.current) return { x: 0, y: 0 };
  const rect = containerRef.current.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const a = entity.orbitRadius;
  const e = entity.eccentricity;
  const b = a * Math.sqrt(1 - e * e);
  const rx = a;
  const ry = b * ELLIPSE_COMPRESSION;
  const entityX = centerX + Math.cos(entity.angle) * rx;
  const entityY = centerY + Math.sin(entity.angle) * ry;

  return { x: entityX, y: entityY };
}

