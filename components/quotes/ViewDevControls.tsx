"use client";

import { useQuoteViewStore } from "./store/useQuoteViewStore";
import type {
  NormalVariant,
  ConstellationVariant,
} from "@/app/(portfolio)/quotes/config";

export function ViewDevControls() {
  const {
    viewMode,
    activeNormalVariant,
    activeConstellationVariant,
    setViewMode,
    setActiveNormalVariant,
    setActiveConstellationVariant,
  } = useQuoteViewStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-slate-700/50 bg-slate-900/95 p-4 shadow-lg backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">
        View Controls
      </h3>

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
          </label>
          <div className="flex flex-col gap-1">
            {(["mission_control", "tesseract"] as NormalVariant[]).map(
              (variant) => (
                <button
                  key={variant}
                  onClick={() => setActiveNormalVariant(variant)}
                  className={`rounded px-2 py-1 text-left text-xs transition-colors ${
                    activeNormalVariant === variant
                      ? "bg-purple-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {variant.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Constellation Variants */}
      {viewMode === "constellation" && (
        <div>
          <label className="mb-1 block text-xs text-slate-400">
            Constellation Variant
          </label>
          <div className="flex flex-col gap-1">
            {(
              [
                "constellation",
                "solar_system",
                "hex_array",
              ] as ConstellationVariant[]
            ).map((variant) => (
              <button
                key={variant}
                onClick={() => setActiveConstellationVariant(variant)}
                className={`rounded px-2 py-1 text-left text-xs transition-colors ${
                  activeConstellationVariant === variant
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {variant.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
