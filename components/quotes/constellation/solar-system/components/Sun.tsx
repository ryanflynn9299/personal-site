"use client";

import { motion } from "framer-motion";
import type { Entity } from "../types";

interface SunProps {
  sunEntity: Entity;
  onClick: (entity: Entity) => void;
}

export function Sun({ sunEntity, onClick }: SunProps) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
      onClick={() => onClick(sunEntity)}
    >
      {/* Sun tooltip on hover */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900/95 border-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl"
        style={{
          borderColor: sunEntity.color,
        }}
      >
        <p
          className="text-sm font-semibold text-slate-50 mb-2"
          style={{
            color: sunEntity.color,
          }}
        >
          {sunEntity.name}
        </p>
        <p className="text-xs text-slate-400 font-mono mb-2">
          0.0 AU
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          Click to explore more quotes
        </p>
      </div>
      <motion.div
        className="relative h-12 w-12"
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

