"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useQuoteViewStore } from "./store/useQuoteViewStore";
import { QuoteViewRenderer } from "./QuoteViewRenderer";
import { QuoteModeToggle } from "./QuoteModeToggle";
import { dummyQuotes } from "@/data/quotes";

export function QuotesPageClient() {
  const { viewMode, activeNormalVariant, activeConstellationVariant } =
    useQuoteViewStore();

  // Create a unique key that changes whenever the view changes
  // This ensures the transition triggers on both mode and variant changes
  const viewKey = `${viewMode}-${
    viewMode === "normal" ? activeNormalVariant : activeConstellationVariant
  }`;

  return (
    <div className="relative min-h-screen">
      <QuoteModeToggle />
      <AnimatePresence mode="wait">
        <motion.div
          key={viewKey}
          initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <QuoteViewRenderer quotes={dummyQuotes} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
