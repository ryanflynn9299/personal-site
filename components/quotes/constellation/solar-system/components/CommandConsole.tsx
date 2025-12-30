"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
          className="absolute bottom-0 left-0 right-0 z-[120] overflow-hidden rounded-t-2xl border-t-2 border-slate-700 bg-slate-900/95 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()} // Prevent background click from closing when clicking console
          style={{
            top: "280px", // Start below the zoomed entity view (adjusted for increased planet spacing)
            height: "calc(100vh - 280px)", // Fill remaining space
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
              className="group flex items-center rounded-full border border-slate-600 bg-slate-800
                         text-slate-300 transition-colors duration-300 ease-in-out 
                         hover:border-sky-300/50 hover:bg-slate-700
                         w-10 h-10 p-2.5 hover:w-auto hover:pl-3 hover:pr-3 hover:py-2.5"
            >
              <div className="overflow-hidden transition-[max-width] duration-300 ease-in-out group-hover:max-w-[100px] max-w-0">
                <span className="whitespace-nowrap pr-2 font-mono text-sm">
                  Close
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center group-hover:flex-none">
                <X className="h-5 w-5 flex-shrink-0" />
              </div>
            </button>
          </div>

          {/* Masonry Grid of Quotes */}
          <div className="h-[calc(100%-80px)] overflow-y-auto p-6">
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
