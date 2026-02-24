"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { Entity } from "../types";
import { EntityShape } from "./EntityShape";

interface ZoomedEntityViewProps {
  entity: Entity | null;
  isVisible: boolean;
  initialPosition: { x: number; y: number } | null;
}

/**
 * Displays the selected entity at the center top of the zoomed view.
 * Animates the planet flying from its original position to the top center.
 */
export function ZoomedEntityView({
  entity,
  isVisible,
  initialPosition,
}: ZoomedEntityViewProps) {
  const xBase = useMotionValue(0);
  const yBase = useMotionValue(0);
  const scaleBase = useMotionValue(1);
  const opacityBase = useMotionValue(0);

  const x = useSpring(xBase, { stiffness: 200, damping: 25 });
  const y = useSpring(yBase, { stiffness: 200, damping: 25 });
  const scale = useSpring(scaleBase, { stiffness: 200, damping: 25 });
  const opacity = useSpring(opacityBase, { stiffness: 200, damping: 25 });

  useEffect(() => {
    if (isVisible && entity && initialPosition) {
      // Calculate target position: center top of viewport
      const TARGET_X =
        typeof window !== "undefined" ? window.innerWidth / 2 : 0;
      const TARGET_Y = 140; // Space from top (increased from 80)
      const TARGET_SCALE = 1.8; // Scale up for zoomed view (20% bigger than 1.5)

      // Set initial values from the entity's current screen position
      xBase.set(initialPosition.x);
      yBase.set(initialPosition.y);
      scaleBase.set(1);
      opacityBase.set(1);

      // Animate to target position - springs will handle the animation
      xBase.set(TARGET_X);
      yBase.set(TARGET_Y);
      scaleBase.set(TARGET_SCALE);
    } else if (!isVisible && entity && initialPosition) {
      // Reverse animation - fly back to original position
      xBase.set(initialPosition.x);
      yBase.set(initialPosition.y);
      scaleBase.set(1);
      opacityBase.set(0);
    }
  }, [
    isVisible,
    entity,
    initialPosition,
    xBase,
    yBase,
    scaleBase,
    opacityBase,
  ]);

  // Show component during both opening and closing animations
  if (!entity || !initialPosition) {
    return null;
  }

  return (
    <motion.div
      className="absolute z-[110] pointer-events-none"
      style={{
        left: x,
        top: y,
        x: "-50%", // Center the entity
        y: "-50%",
        scale: scale,
        opacity: opacity,
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Entity visual - scale is handled by motion value */}
        <motion.div
          className="relative"
          style={{
            transformOrigin: "center center",
          }}
          animate={{
            scale: isVisible ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 3,
            repeat: isVisible ? Infinity : 0,
            ease: "easeInOut",
            delay: 0.8, // Start pulsing after fly-in completes
          }}
        >
          <EntityShape entity={entity} isSelected={true} />
        </motion.div>

        {/* Entity name label - fades in after planet arrives, fades out when closing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : 10,
          }}
          transition={{
            delay: isVisible ? 0.8 : 0, // Appear after planet arrives, disappear immediately when closing
            duration: 0.4,
            ease: "easeOut",
          }}
          className="text-center"
        >
          <h3
            className="font-mono text-lg font-bold"
            style={{ color: entity.color }}
          >
            {entity.name.toUpperCase()}
          </h3>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {entity.quotes.length} TRANSMISSIONS
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
