"use client";

import { motion } from "framer-motion";
import type { Entity as EntityType } from "../types";
import { EntityShape } from "./EntityShape";

interface EntityProps {
  entity: EntityType;
  position: { x: number; y: number };
  isSelected: boolean;
  onClick: (entity: EntityType) => void;
  onHover: () => void;
  onHoverEnd: () => void;
}

export function Entity({
  entity,
  position,
  isSelected,
  onClick,
  onHover,
  onHoverEnd,
}: EntityProps) {
  return (
    <div
      key={entity.id}
      className="absolute cursor-pointer z-20"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        willChange: "transform",
      }}
      onClick={() => onClick(entity)}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      {/* Planet visual - z-10 ensures it's above background */}
      <motion.div
        className="relative z-10"
        style={{
          transformOrigin: "center center",
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0 }}
      >
        <EntityShape entity={entity} isSelected={isSelected} />
      </motion.div>
    </div>
  );
}
