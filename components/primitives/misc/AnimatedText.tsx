"use client";

import { motion, Variants, MotionConfig } from "framer-motion";
import type { AnimatedTextProps } from "@/types/components";

export function AnimatedText({
  text,
  animationType = "stagger-words",
  className,
}: AnimatedTextProps) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatedTextInner
        text={text}
        animationType={animationType}
        className={className}
      />
    </MotionConfig>
  );
}

function AnimatedTextInner({
  text,
  animationType = "stagger-words",
  className,
}: AnimatedTextProps) {
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
        aria-label={text}
      >
        {words.map((word, index) => (
          <motion.span
            variants={child}
            key={`${word}-${index}`}
            className="mr-[0.25em]"
            aria-hidden="true"
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>
    );
  }

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
        aria-label={text}
      >
        {letters.map((letter, index) => (
          <motion.span
            variants={child}
            key={`${index}-${letter}`}
            aria-hidden="true"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </motion.h1>
    );
  }

  if (animationType === "decode") {
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
        {text}
      </motion.h1>
    );
  }

  return <h1 className={className}>{text}</h1>;
}
