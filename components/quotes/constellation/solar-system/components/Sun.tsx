"use client";

import { motion } from "framer-motion";
import type { Entity } from "../types";

interface SunProps {
  sunEntity: Entity;
  onClick: (entity: Entity) => void;
  onHover: () => void;
  onHoverEnd: () => void;
}

export function Sun({ sunEntity, onClick, onHover, onHoverEnd }: SunProps) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
      onClick={() => onClick(sunEntity)}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      {/* Sun visual - z-10 ensures it's above background */}
      <motion.div
        className="relative z-10 h-12 w-12"
        style={{
          transformOrigin: "center center",
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="h-full w-full rounded-full border-2 border-yellow-400 bg-yellow-300" />
        <div className="absolute inset-0 animate-pulse rounded-full border-2 border-yellow-500/50" />
      </motion.div>
    </div>
  );
}
