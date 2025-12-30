"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BlurredBackgroundProps {
  isVisible: boolean;
  color?: string;
  animationDelay?: number;
  onClose?: () => void;
}

/**
 * Provides a blurred background overlay that fades in when the view is zoomed.
 * Creates depth and focus on the selected entity.
 * Fades in behind the planet as it flies to position.
 */
export function BlurredBackground({
  isVisible,
  color,
  animationDelay = 0,
  onClose,
}: BlurredBackgroundProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            delay: animationDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="absolute inset-0 z-[105] cursor-pointer"
          onClick={onClose}
          style={{
            background: color
              ? `radial-gradient(ellipse at center top, ${color}15 0%, ${color}08 30%, transparent 70%)`
              : "radial-gradient(ellipse at center top, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 30%, transparent 70%)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
