import type { Entity } from "../types";

interface EntityShapeProps {
  entity: Entity;
  isSelected: boolean;
}

/**
 * Entity Shape Component - Renders different abstract shapes
 */
export function EntityShape({ entity, isSelected }: EntityShapeProps) {
  const size = entity.size;

  if (entity.shape === "ringed-planet") {
    return (
      <div className="relative">
        {/* Rings */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.8,
            height: size * 0.4,
            borderColor: entity.color,
            transform: "translate(-50%, -50%) rotate(45deg)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.8,
            height: size * 0.4,
            borderColor: entity.color,
            transform: "translate(-50%, -50%) rotate(-45deg)",
          }}
        />
        {/* Planet */}
        <div
          className="rounded-full border-2"
          style={{
            width: size,
            height: size,
            backgroundColor: entity.color,
            borderColor: entity.color,
            boxShadow: isSelected
              ? `0 0 20px ${entity.color}`
              : `0 0 10px ${entity.color}80`,
          }}
        />
      </div>
    );
  }

  if (entity.shape === "monolith") {
    return (
      <div
        className="border-2"
        style={{
          width: size * 0.6,
          height: size * 1.5,
          backgroundColor: entity.color,
          borderColor: entity.color,
          boxShadow: isSelected
            ? `0 0 20px ${entity.color}`
            : `0 0 10px ${entity.color}80`,
        }}
      />
    );
  }

  // Pyramid
  return (
    <div className="relative">
      <div
        className="border-2"
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size * 0.5}px solid transparent`,
          borderRight: `${size * 0.5}px solid transparent`,
          borderBottom: `${size}px solid ${entity.color}`,
          filter: isSelected
            ? `drop-shadow(0 0 20px ${entity.color})`
            : `drop-shadow(0 0 10px ${entity.color}80)`,
        }}
      />
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 border-2"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          backgroundColor: entity.color,
          borderColor: entity.color,
        }}
      />
    </div>
  );
}

