"use client";

import { motion } from "framer-motion";
import type { Entity as EntityType } from "../types";
import { EntityShape } from "./EntityShape";
import { EntityTooltip } from "./EntityTooltip";

interface EntityProps {
  entity: EntityType;
  position: { x: number; y: number };
  isSelected: boolean;
  onClick: (entity: EntityType) => void;
}

export function Entity({ entity, position, isSelected, onClick }: EntityProps) {
  // Calculate rough AU distance from orbit radius
  const auDistance = (entity.orbitRadius / 15).toFixed(1);

  return (
    <div
      key={entity.id}
      className="absolute cursor-pointer group"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
      onClick={() => onClick(entity)}
    >
      {/* Entity tooltip on hover */}
      <EntityTooltip entity={entity} auDistance={auDistance} />
      
      <motion.div
        style={{
          transformOrigin: "center center",
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <EntityShape entity={entity} isSelected={isSelected} />
      </motion.div>
    </div>
  );
}

