"use client";

import { useState, useEffect } from "react";
import { useQuoteViewStore } from "./store/useQuoteViewStore";
import { env } from "@/lib/env";
import type {
  NormalVariant,
  ConstellationVariant,
} from "@/app/(portfolio)/quotes/config";
import { PRODUCTION_QUOTE_CONFIG } from "@/app/(portfolio)/quotes/production-config";

export function ViewDevControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    viewMode,
    activeNormalVariant,
    activeConstellationVariant,
    hexSurgeEnabled,
    triggerHexSurge,
    setViewMode,
    setActiveNormalVariant,
    setActiveConstellationVariant,
    setHexSurgeEnabled,
  } = useQuoteViewStore();

  const isProduction = env.isProduction;
  const isHexArraySelected =
    viewMode === "constellation" && activeConstellationVariant === "hex_array";

  // Notify ShapeTestControls when this expands/collapses
  // Must be called before any early returns to satisfy React Hooks rules
  useEffect(() => {
    // Only dispatch event if not in production (component won't render anyway)
    if (!isProduction) {
      window.dispatchEvent(
        new CustomEvent("viewDevControlsExpanded", { detail: { isExpanded } })
      );
    }
  }, [isExpanded, isProduction]);

  // Hide dev controls in production
  if (isProduction) {
    return null;
  }

  const collapsedHeight = 60; // Approximate collapsed height

  return (
    <div
      className="fixed bottom-4 right-4 z-[104] rounded-lg border border-slate-700/50 bg-slate-900/95 shadow-lg backdrop-blur-sm transition-all duration-300"
      style={{
        height: isExpanded ? "auto" : `${collapsedHeight}px`,
        padding: isExpanded ? "1.5rem" : "0.625rem 1rem",
        overflow: "hidden",
      }}
    >
      {isExpanded ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              View Controls
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            >
              −
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="mb-4">
            <label className="mb-1 block text-xs text-slate-400">Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("normal")}
                className={`rounded px-3 py-1 text-xs transition-colors ${
                  viewMode === "normal"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setViewMode("constellation")}
                className={`rounded px-3 py-1 text-xs transition-colors ${
                  viewMode === "constellation"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Constellation
              </button>
            </div>
          </div>

          {/* Normal Variants */}
          {viewMode === "normal" && (
            <div className="mb-4">
              <label className="mb-1 block text-xs text-slate-400">
                Normal Variant
                {isProduction && (
                  <span className="ml-2 text-xs text-amber-400">
                    (Production: {PRODUCTION_QUOTE_CONFIG.normalVariant})
                  </span>
                )}
              </label>
              <div className="flex flex-col gap-1">
                {(["mission_control", "tesseract"] as NormalVariant[]).map(
                  (variant) => {
                    const isProductionVariant =
                      isProduction &&
                      variant === PRODUCTION_QUOTE_CONFIG.normalVariant;
                    return (
                      <button
                        key={variant}
                        onClick={() => setActiveNormalVariant(variant)}
                        disabled={isProduction && !isProductionVariant}
                        className={`rounded px-2 py-1 text-left text-xs transition-colors ${
                          activeNormalVariant === variant
                            ? "bg-purple-600 text-white"
                            : isProduction && !isProductionVariant
                              ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {variant.replace("_", " ")}
                        {isProductionVariant && (
                          <span className="ml-2 text-xs text-amber-400">
                            (Prod)
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Constellation Variants */}
          {viewMode === "constellation" && (
            <div className="mb-4">
              <label className="mb-1 block text-xs text-slate-400">
                Constellation Variant
                {isProduction && (
                  <span className="ml-2 text-xs text-amber-400">
                    (Production: {PRODUCTION_QUOTE_CONFIG.constellationVariant})
                  </span>
                )}
              </label>
              <div className="flex flex-col gap-1">
                {(
                  [
                    "constellation",
                    "solar_system",
                    "hex_array",
                  ] as ConstellationVariant[]
                ).map((variant) => {
                  const isProductionVariant =
                    isProduction &&
                    variant === PRODUCTION_QUOTE_CONFIG.constellationVariant;
                  return (
                    <button
                      key={variant}
                      onClick={() => setActiveConstellationVariant(variant)}
                      disabled={isProduction && !isProductionVariant}
                      className={`rounded px-2 py-1 text-left text-xs transition-colors ${
                        activeConstellationVariant === variant
                          ? "bg-purple-600 text-white"
                          : isProduction && !isProductionVariant
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {variant.replace("_", " ")}
                      {isProductionVariant && (
                        <span className="ml-2 text-xs text-amber-400">
                          (Prod)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hex Surge Controls - Only show when hex_array is selected */}
          {isHexArraySelected && (
            <div className="mt-4 border-t border-slate-700/50 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hex-surge-enabled"
                  checked={hexSurgeEnabled}
                  onChange={(e) => setHexSurgeEnabled(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                />
                <label
                  htmlFor="hex-surge-enabled"
                  className="cursor-pointer text-xs font-medium text-slate-300"
                >
                  Enable hex surge
                </label>
              </div>
              <button
                onClick={triggerHexSurge}
                disabled={!hexSurgeEnabled}
                className={`w-full rounded px-3 py-2 text-xs font-medium transition-all ${
                  hexSurgeEnabled
                    ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                    : "cursor-not-allowed bg-slate-700 text-slate-500 opacity-50"
                }`}
              >
                Trigger Surge
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex w-full items-center justify-between text-slate-300 transition-colors hover:bg-slate-800/50 rounded"
        >
          <span className="text-xs font-medium">View Controls</span>
          <span className="text-slate-400">+</span>
        </button>
      )}
    </div>
  );
}
