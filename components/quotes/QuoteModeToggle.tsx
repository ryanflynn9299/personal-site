"use client";

import React from "react";
import { useQuoteViewStore } from "./store/useQuoteViewStore";
import { quotes } from "@/constants/theme";

const MODAL_STYLES = {
  backgroundColor: quotes.modal.background,
  backdropBlur: "12px",
  borderColor: quotes.modal.border,
  borderWidth: "1px",
  borderRadius: "12px",
  padding: "28px",
  margin: "24px",
  minWidth: "320px",
  maxWidth: "480px",
  titleColor: quotes.modal.title,
  textColor: quotes.modal.text,
  titleSize: "text-2xl",
  textSize: "text-base",
} as const;

export function QuoteModeToggle({ className = "" }: { className?: string }) {
  const { viewMode, setViewMode, isZoomed } = useQuoteViewStore();

  const isNormalMode = viewMode === "normal";

  const handleToggle = () => {
    setViewMode(isNormalMode ? "constellation" : "normal");
  };

  return (
    <div
      className={`pointer-events-auto absolute right-0 top-0 z-[104] ${className}`}
      style={{
        backgroundColor: MODAL_STYLES.backgroundColor,
        backdropFilter: `blur(${MODAL_STYLES.backdropBlur})`,
        WebkitBackdropFilter: `blur(${MODAL_STYLES.backdropBlur})`,
        border: `${MODAL_STYLES.borderWidth} solid ${MODAL_STYLES.borderColor}`,
        borderRadius: MODAL_STYLES.borderRadius,
        padding: MODAL_STYLES.padding,
        margin: MODAL_STYLES.margin,
        opacity: isZoomed ? 0.3 : 1,
        transition: "opacity 0.6s ease-out",
      }}
    >
      <div className="flex items-center justify-end gap-4">
        <span
          className="text-lg font-semibold"
          style={{ color: MODAL_STYLES.titleColor }}
        >
          View Mode
        </span>
        <div
          className="h-8 w-px self-center"
          style={{ backgroundColor: MODAL_STYLES.borderColor }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: MODAL_STYLES.textColor }}
        >
          {isNormalMode ? "Normal" : "Constellation"}
        </span>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            isNormalMode ? "bg-slate-600" : "bg-sky-600"
          }`}
          role="switch"
          aria-checked={!isNormalMode}
          aria-label={`Switch to ${isNormalMode ? "Constellation" : "Normal"} mode`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              isNormalMode ? "translate-x-0.5" : "translate-x-5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
