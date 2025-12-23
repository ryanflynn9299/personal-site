import type { Entity } from "../types";
import { ELLIPSE_COMPRESSION } from "../constants";

interface OrbitLineProps {
  entity: Entity;
}

export function OrbitLine({ entity }: OrbitLineProps) {
  // Elliptical orbits with eccentricity and tilted perspective
  const a = entity.orbitRadius; // Semi-major axis
  const e = entity.eccentricity;
  const b = a * Math.sqrt(1 - e * e); // Semi-minor axis
  const ellipseRx = a;
  const ellipseRy = b * ELLIPSE_COMPRESSION;

  return (
    <svg
      key={`orbit-${entity.id}`}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        width: entity.orbitRadius * 2,
        height: entity.orbitRadius * 2,
      }}
    >
      <ellipse
        cx={entity.orbitRadius}
        cy={entity.orbitRadius}
        rx={ellipseRx}
        ry={ellipseRy}
        fill="none"
        stroke={entity.color}
        strokeWidth="2"
        strokeDasharray="8 4"
        opacity="0.3"
      />
    </svg>
  );
}

