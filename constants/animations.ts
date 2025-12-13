// Animation variants and configurations

import { Variants } from "framer-motion";

// Character set for decode animation effect
export const DECODE_CHARS = "!<>-_\\/[]{}—=+*^?#________";

// Animation variants for About page
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // This creates the sequential delay
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};
