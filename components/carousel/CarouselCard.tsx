"use client";

import { ReactNode } from "react";

export interface CarouselCardProps {
  /** Card content */
  children: ReactNode;
  /** Card width (calculated by carousel) */
  width: string;
  /** Custom className */
  className?: string;
  /** Gap between cards */
  gap?: string;
}

/**
 * Carousel card wrapper component
 * Handles card sizing and spacing within the carousel
 */
export function CarouselCard({
  children,
  width,
  className = "",
  gap = "0.5rem",
}: CarouselCardProps) {
  return (
    <div
      className={className}
      style={{
        flexBasis: width,
        flexShrink: 0,
        flexGrow: 0,
        minWidth: 0,
        width: width,
        padding: `0 ${gap}`,
        boxSizing: "border-box", // Include padding in width calculation
        transition: "width 0.3s ease-in-out", // Smooth width transitions
      }}
    >
      {children}
    </div>
  );
}
