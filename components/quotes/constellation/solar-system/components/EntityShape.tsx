import type { Entity } from "../types";
import { getIconByName } from "../iconLibrary";
import { utils } from "@/constants/theme";

interface EntityShapeProps {
  entity: Entity;
  isSelected: boolean;
}

/**
 * Shared shadow/glow styles for all shapes
 */
const getGlowStyle = (color: string, isSelected: boolean) => ({
  boxShadow: isSelected
    ? `0 0 20px ${color}`
    : `0 0 10px ${color}80`,
  willChange: "box-shadow" as const,
  backfaceVisibility: "hidden" as const,
});

/**
 * Entity Shape Component - Renders CSS-based shapes and library SVG icons
 */
export function EntityShape({ entity, isSelected }: EntityShapeProps) {
  const size = entity.size;
  const glowStyle = getGlowStyle(entity.color, isSelected);

  // ========== SVG LIBRARY ICONS ==========
  const iconEntry = getIconByName(entity.shape);
  if (iconEntry) {
    const IconComponent = iconEntry.component;
    return (
      <IconComponent
        className="w-full h-full"
        style={{ 
          color: entity.color, 
          width: size, 
          height: size,
          filter: isSelected 
            ? `drop-shadow(0 0 8px ${entity.color})` 
            : `drop-shadow(0 0 4px ${entity.color}80)`,
        }}
        strokeWidth={iconEntry.library === "lucide" || iconEntry.library === "tabler" ? 1.5 : undefined}
      />
    );
  }

  // ========== CSS SHAPES ==========

  if (entity.shape === "ringed-planet") {
    return (
      <div className="relative">
        {/* Single Ring */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.8,
            height: size * 0.4,
            borderColor: entity.color,
            transform: "translate(-50%, -50%) rotate(45deg)",
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
            ...glowStyle,
          }}
        />
      </div>
    );
  }


  if (entity.shape === "cube") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Front face */}
        <div
          className="absolute border-2"
          style={{
            width: size,
            height: size,
            backgroundColor: entity.color,
            borderColor: entity.color,
            transform: "translateZ(0)",
            ...glowStyle,
          }}
        />
        {/* Top face */}
        <div
          className="absolute border-2"
          style={{
            width: size,
            height: size * 0.5,
            backgroundColor: entity.color,
            borderColor: entity.color,
            transform: "rotateX(-45deg) translateY(-50%)",
            transformOrigin: "bottom",
            opacity: 0.7,
          }}
        />
        {/* Right face */}
        <div
          className="absolute border-2"
          style={{
            width: size * 0.5,
            height: size,
            backgroundColor: entity.color,
            borderColor: entity.color,
            transform: "rotateY(45deg) translateX(50%)",
            transformOrigin: "left",
            opacity: 0.5,
          }}
        />
      </div>
    );
  }

  if (entity.shape === "octahedron") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Top pyramid */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size * 0.5}px solid transparent`,
            borderRight: `${size * 0.5}px solid transparent`,
            borderBottom: `${size * 0.5}px solid ${entity.color}`,
            filter: isSelected
              ? `drop-shadow(0 0 20px ${entity.color})`
              : `drop-shadow(0 0 10px ${entity.color}80)`,
          }}
        />
        {/* Bottom pyramid (inverted) */}
        <div
          className="absolute top-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size * 0.5}px solid transparent`,
            borderRight: `${size * 0.5}px solid transparent`,
            borderTop: `${size * 0.5}px solid ${entity.color}`,
            opacity: 0.7,
          }}
        />
      </div>
    );
  }

  if (entity.shape === "hexagon") {
    const hexSize = size * 0.866; // Hexagon height
    return (
      <div
        className="border-2"
        style={{
          width: size,
          height: hexSize,
          backgroundColor: entity.color,
          borderColor: entity.color,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          ...glowStyle,
        }}
      />
    );
  }


  if (entity.shape === "sphere") {
    return (
      <div
        className="rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: entity.color,
          background: `radial-gradient(circle at 30% 30%, ${entity.color}CC, ${entity.color}80)`,
          ...glowStyle,
        }}
      />
    );
  }

  if (entity.shape === "gas-giant") {
    return (
      <div className="relative">
        {/* Planet with bands */}
        <div
          className="rounded-full border-2"
          style={{
            width: size,
            height: size,
            backgroundColor: entity.color,
            borderColor: entity.color,
            ...glowStyle,
          }}
        />
        {/* Horizontal bands */}
        <div
          className="absolute left-0 top-1/4 w-full border-t-2"
          style={{ borderColor: `${entity.color}CC` }}
        />
        <div
          className="absolute left-0 top-1/2 w-full border-t-2"
          style={{ borderColor: `${entity.color}CC` }}
        />
        <div
          className="absolute left-0 top-3/4 w-full border-t-2"
          style={{ borderColor: `${entity.color}CC` }}
        />
      </div>
    );
  }

  if (entity.shape === "torus") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer ring */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.2,
            height: size * 1.2,
            borderColor: entity.color,
            ...glowStyle,
          }}
        />
        {/* Inner ring (hole) */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.6,
            height: size * 0.6,
            backgroundColor: "transparent",
            border: `2px solid ${entity.color}40`,
          }}
        />
      </div>
    );
  }

  if (entity.shape === "pentagon") {
    return (
      <div
        className="border-2"
        style={{
          width: size,
          height: size,
          backgroundColor: entity.color,
          borderColor: entity.color,
          clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
          ...glowStyle,
        }}
      />
    );
  }

  if (entity.shape === "asteroid") {
    return (
      <div
        className="border-2"
        style={{
          width: size * 0.9,
          height: size * 0.85,
          backgroundColor: entity.color,
          borderColor: entity.color,
          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
          transform: "rotate(22.5deg)",
          ...glowStyle,
        }}
      />
    );
  }

  if (entity.shape === "nebula") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Main cloud shape */}
        <div
          className="rounded-full border-2"
          style={{
            width: size,
            height: size,
            borderColor: entity.color,
            backgroundColor: entity.color,
            opacity: 0.8,
            filter: "blur(2px)",
            ...glowStyle,
          }}
        />
        {/* Secondary cloud */}
        <div
          className="absolute left-1/4 top-1/4 rounded-full"
          style={{
            width: size * 0.6,
            height: size * 0.6,
            backgroundColor: `${entity.color}CC`,
            filter: "blur(1px)",
          }}
        />
        {/* Tertiary cloud */}
        <div
          className="absolute right-1/4 bottom-1/4 rounded-full"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            backgroundColor: `${entity.color}AA`,
            filter: "blur(1px)",
          }}
        />
      </div>
    );
  }

  if (entity.shape === "comet") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Comet head */}
        <div
          className="rounded-full border-2"
          style={{
            width: size * 0.6,
            height: size * 0.6,
            borderColor: entity.color,
            backgroundColor: entity.color,
            ...glowStyle,
          }}
        />
        {/* Comet tail */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: size * 0.3,
            height: size * 1.2,
            backgroundColor: `${entity.color}66`,
            clipPath: "polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)",
            transform: "translate(-50%, -50%) rotate(45deg)",
            filter: "blur(1px)",
          }}
        />
      </div>
    );
  }

  if (entity.shape === "satellite") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Main body */}
        <div
          className="border-2"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            backgroundColor: entity.color,
            borderColor: entity.color,
            transform: "rotate(45deg)",
            ...glowStyle,
          }}
        />
        {/* Solar panels */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2"
          style={{
            width: size * 0.2,
            height: size * 0.8,
            backgroundColor: `${entity.color}CC`,
            borderColor: entity.color,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2"
          style={{
            width: size * 0.8,
            height: size * 0.2,
            backgroundColor: `${entity.color}CC`,
            borderColor: entity.color,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    );
  }

  if (entity.shape === "meteor") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Meteor body */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size * 0.3}px solid transparent`,
            borderRight: `${size * 0.3}px solid transparent`,
            borderBottom: `${size * 0.8}px solid ${entity.color}`,
            filter: isSelected
              ? `drop-shadow(0 0 20px ${entity.color})`
              : `drop-shadow(0 0 10px ${entity.color}80)`,
            transform: "rotate(45deg)",
          }}
        />
        {/* Trail */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: size * 0.2,
            height: size * 1.0,
            background: `linear-gradient(to bottom, ${entity.color}80, transparent)`,
            transform: "translate(-50%, -50%) rotate(45deg)",
            filter: "blur(2px)",
          }}
        />
      </div>
    );
  }

  if (entity.shape === "planet-ring") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer ring */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.5,
            height: size * 0.4,
            borderColor: entity.color,
            transform: "translate(-50%, -50%) rotate(45deg)",
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.3,
            height: size * 0.35,
            borderColor: `${entity.color}CC`,
            transform: "translate(-50%, -50%) rotate(45deg)",
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.1,
            height: size * 0.3,
            borderColor: `${entity.color}99`,
            transform: "translate(-50%, -50%) rotate(45deg)",
          }}
        />
      </div>
    );
  }

  if (entity.shape === "moon") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Moon body */}
        <div
          className="rounded-full border-2"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            borderColor: entity.color,
            backgroundColor: entity.color,
            ...glowStyle,
          }}
        />
        {/* Craters */}
        <div
          className="absolute left-1/4 top-1/3 rounded-full"
          style={{
            width: size * 0.15,
            height: size * 0.15,
            backgroundColor: `${entity.color}66`,
          }}
        />
        <div
          className="absolute right-1/4 top-2/3 rounded-full"
          style={{
            width: size * 0.12,
            height: size * 0.12,
            backgroundColor: `${entity.color}66`,
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.1,
            height: size * 0.1,
            backgroundColor: `${entity.color}66`,
          }}
        />
      </div>
    );
  }

  if (entity.shape === "star") {
    return (
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          backgroundColor: entity.color,
          ...glowStyle,
        }}
      />
    );
  }

  if (entity.shape === "galaxy") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Spiral arms */}
        <svg width={size} height={size} className="absolute" style={{ transform: "rotate(45deg)" }}>
          <path
            d={`M ${size / 2} ${size / 2} 
                A ${size * 0.2} ${size * 0.2} 0 1 1 ${size * 0.6} ${size * 0.4}
                A ${size * 0.3} ${size * 0.3} 0 1 0 ${size * 0.4} ${size * 0.6}
                A ${size * 0.4} ${size * 0.4} 0 1 1 ${size * 0.7} ${size * 0.3}
                A ${size * 0.5} ${size * 0.5} 0 1 0 ${size * 0.3} ${size * 0.7}`}
            fill="none"
            stroke={entity.color}
            strokeWidth="2"
            style={{
              filter: isSelected
                ? `drop-shadow(0 0 10px ${entity.color})`
                : `drop-shadow(0 0 5px ${entity.color}80)`,
            }}
          />
        </svg>
        {/* Center bulge */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: entity.color,
            ...glowStyle,
          }}
        />
      </div>
    );
  }

  if (entity.shape === "black-hole") {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Accretion disk - outer */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.2,
            height: size * 0.3,
            borderColor: entity.color,
            transform: "translate(-50%, -50%) rotate(45deg)",
            opacity: 0.8,
          }}
        />
        {/* Accretion disk - middle */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.0,
            height: size * 0.25,
            borderColor: `${entity.color}CC`,
            transform: "translate(-50%, -50%) rotate(45deg)",
            opacity: 0.6,
          }}
        />
        {/* Event horizon / Black hole center */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.4,
            height: size * 0.4,
            backgroundColor: utils.entityBackground,
            border: `2px solid ${entity.color}66`,
            boxShadow: `0 0 20px ${entity.color}40, inset 0 0 10px ${entity.color}20`,
          }}
        />
      </div>
    );
  }

  // Default fallback (should not reach here)
  return (
    <div
      className="rounded-full border-2"
      style={{
        width: size,
        height: size,
        backgroundColor: entity.color,
        borderColor: entity.color,
        ...glowStyle,
      }}
    />
  );
}
