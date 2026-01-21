"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { CarouselNavigationProps } from "./types";

/**
 * Carousel navigation buttons component
 * Provides previous/next navigation with proper accessibility
 */
export function CarouselNavigation({
  prevDisabled,
  nextDisabled,
  onPrevious,
  onNext,
  labels,
  className = "",
}: CarouselNavigationProps) {
  const prevLabel = labels?.previous || "Previous slide";
  const nextLabel = labels?.next || "Next slide";

  return (
    <>
      <Button
        onClick={onPrevious}
        variant="ghost"
        size="icon"
        className={`flex-shrink-0 h-12 w-12 rounded-full bg-slate-800/50 hover:bg-slate-700 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 transition-opacity duration-300 z-10 ${className}`}
        disabled={prevDisabled}
        aria-label={prevLabel}
        type="button"
      >
        <ArrowLeft className="h-6 w-6" aria-hidden="true" />
      </Button>
      <Button
        onClick={onNext}
        variant="ghost"
        size="icon"
        className={`flex-shrink-0 h-12 w-12 rounded-full bg-slate-800/50 hover:bg-slate-700 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 transition-opacity duration-300 z-10 ${className}`}
        disabled={nextDisabled}
        aria-label={nextLabel}
        type="button"
      >
        <ArrowRight className="h-6 w-6" aria-hidden="true" />
      </Button>
    </>
  );
}
