"use client";

import { CarouselDotsProps } from "./types";

/**
 * Carousel dot indicators component
 * Provides visual pagination with keyboard and mouse support
 */
export function CarouselDots({
  count,
  selectedIndex,
  onDotClick,
  className = "",
}: CarouselDotsProps) {
  return (
    <div
      className={`flex justify-center gap-2 ${className}`}
      role="tablist"
      aria-label="Carousel pagination"
    >
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === selectedIndex
              ? "w-4 bg-sky-300"
              : "w-2 bg-slate-600 hover:bg-slate-500"
          }`}
          aria-label={`Go to slide ${index + 1}`}
          aria-selected={index === selectedIndex}
          role="tab"
          type="button"
        />
      ))}
    </div>
  );
}
