"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useQuoteViewStore } from "./store/useQuoteViewStore";
import { QuoteViewRenderer } from "./QuoteViewRenderer";
import { QuoteModeToggle } from "./QuoteModeToggle";
import { dummyQuotes } from "@/data/quotes";
import { hyperspeedVariants } from "@/components/primitives/misc/hyperspeed-transition";

export function QuotesPageClient() {
  const { viewMode, activeNormalVariant, activeConstellationVariant } =
    useQuoteViewStore();

  // Create a unique key that changes whenever the view changes
  // This ensures the transition triggers on both mode and variant changes
  const viewKey = `${viewMode}-${
    viewMode === "normal" ? activeNormalVariant : activeConstellationVariant
  }`;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <QuoteModeToggle />
      <AnimatePresence mode="wait">
        <motion.div
          key={viewKey}
          variants={hyperspeedVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative"
        >
          {/* Streaking stars overlay - creates the hyperspace tunnel effect */}
          <motion.div
            variants={{
              initial: { opacity: 0, scale: 1 },
              exit: {
                opacity: 1,
                scale: 3,
                transition: {
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              },
              animate: {
                opacity: 0,
                scale: 1,
                transition: {
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              },
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: `
                radial-gradient(ellipse at center, 
                  transparent 0%,
                  rgba(3, 179, 195, 0.15) 15%,
                  rgba(216, 86, 191, 0.2) 30%,
                  rgba(3, 179, 195, 0.25) 45%,
                  rgba(0, 0, 0, 0.9) 100%
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  rgba(3, 179, 195, 0.03) 1px,
                  transparent 2px,
                  transparent 8px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent 0px,
                  rgba(216, 86, 191, 0.03) 1px,
                  transparent 2px,
                  transparent 8px
                )
              `,
              mixBlendMode: "screen",
          }}
          />
          <QuoteViewRenderer quotes={dummyQuotes} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
