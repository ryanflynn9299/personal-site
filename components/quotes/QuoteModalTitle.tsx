import React from "react";
import { quotes } from "@/constants/theme";

interface QuoteModalTitleProps {
  title: string;
  description?: string | React.ReactNode;
  className?: string;
}

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

export function QuoteModalTitle({
  title,
  description,
  className = "",
}: QuoteModalTitleProps) {
  return (
    <div
      className={`pointer-events-auto absolute left-0 top-0 z-40 ${className}`}
      style={{
        backgroundColor: MODAL_STYLES.backgroundColor,
        backdropFilter: `blur(${MODAL_STYLES.backdropBlur})`,
        WebkitBackdropFilter: `blur(${MODAL_STYLES.backdropBlur})`,
        border: `${MODAL_STYLES.borderWidth} solid ${MODAL_STYLES.borderColor}`,
        borderRadius: MODAL_STYLES.borderRadius,
        padding: MODAL_STYLES.padding,
        margin: MODAL_STYLES.margin,
        minWidth: MODAL_STYLES.minWidth,
        maxWidth: MODAL_STYLES.maxWidth,
        width: "auto",
      }}
    >
      <h2
        className={`${MODAL_STYLES.titleSize} font-semibold mb-3`}
        style={{ color: MODAL_STYLES.titleColor }}
      >
        {title}
      </h2>
      {description && (
        <div
          className={`${MODAL_STYLES.textSize} space-y-2 leading-relaxed`}
          style={{ color: MODAL_STYLES.textColor }}
        >
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
      )}
    </div>
  );
}
