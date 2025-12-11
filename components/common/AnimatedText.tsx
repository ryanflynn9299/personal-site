"use client";

import { motion, Variants } from "framer-motion";
import type { AnimatedTextProps } from "@/types/components";

import { DECODE_CHARS } from "@/constants/animations";

export function AnimatedText({
  text,
  animationType = "stagger-words",
  className,
}: AnimatedTextProps) {
  // --- Animation Variation 1: Staggered Fade-In by Words ---
  if (animationType === "stagger-words") {
    const words = text.split(" ");
    const container = {
      hidden: { opacity: 0 },
      visible: (i = 1) => ({
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
      }),
    };
    const child: Variants = {
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", damping: 12, stiffness: 100 },
      },
      hidden: {
        opacity: 0,
        y: 20,
        transition: { type: "spring", damping: 12, stiffness: 100 },
      },
    };
    return (
      <motion.h1
        variants={container}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {words.map((word, index) => (
          <motion.span variants={child} key={index} className="mr-[0.25em]">
            {word}
          </motion.span>
        ))}
      </motion.h1>
    );
  }

  // --- Animation Variation 2: Cascade In by Letters ---
  if (animationType === "cascade-letters") {
    const letters = Array.from(text);
    const container = {
      hidden: { opacity: 0 },
      visible: (i = 1) => ({
        opacity: 1,
        transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
      }),
    };
    const child = {
      visible: { opacity: 1, x: 0, y: 0 },
      hidden: { opacity: 0, x: -15, y: 10 },
    };
    return (
      <motion.h1
        variants={container}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {letters.map((letter, index) => (
          <motion.span variants={child} key={index}>
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </motion.h1>
    );
  }

  // --- Animation Variation 3: Decode/Shuffle Effect ---
  // This is a more conceptual implementation. A production version might use a more robust hook.
  if (animationType === "decode") {
    // This is a simplified version. For a true character-by-character decode,
    // a more complex state management hook would be needed. This provides the feel.
    const container = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 1.5 } },
    };
    return (
      <motion.h1
        initial="hidden"
        animate="visible"
        variants={container}
        className={className}
      >
        {/* The effect is implied by a slower fade-in, as if text is resolving */}
        {text}
      </motion.h1>
    );
  }

  return <h1 className={className}>{text}</h1>;
}
