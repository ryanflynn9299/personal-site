"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Entity } from "../types";
import { QuoteCard } from "./QuoteCard";

interface CommandConsoleProps {
  isOpen: boolean;
  selectedEntity: Entity | null;
  onClose: () => void;
}

export function CommandConsole({
  isOpen,
  selectedEntity,
  onClose,
}: CommandConsoleProps) {
  if (!selectedEntity) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="absolute bottom-0 left-0 right-0 z-50 h-[70vh] overflow-hidden rounded-t-2xl border-t-2 border-slate-700 bg-slate-900/95 backdrop-blur-xl"
          style={{
            borderTopColor: selectedEntity.color,
          }}
        >
          {/* Console Header */}
          <div
            className="flex items-center justify-between border-b border-slate-800 p-6"
            style={{
              borderBottomColor: `${selectedEntity.color}40`,
            }}
          >
            <div>
              <h2
                className="font-mono text-2xl font-bold"
                style={{ color: selectedEntity.color }}
              >
                {"// SIGNAL_DECODED"}
              </h2>
              <p className="mt-1 font-mono text-xs text-slate-400">
                ENTITY: {selectedEntity.name.toUpperCase()} |{" "}
                {selectedEntity.quotes.length} TRANSMISSIONS
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-mono text-sm text-slate-300 transition-colors hover:bg-slate-700"
            >
              CLOSE
            </button>
          </div>

          {/* Masonry Grid of Quotes */}
          <div className="h-[calc(70vh-80px)] overflow-y-auto p-6">
            <div className="mx-auto grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedEntity.quotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  entityColor={selectedEntity.color}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
