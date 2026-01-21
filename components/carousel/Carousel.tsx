"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { CarouselProps } from "./types";
import { useCarousel } from "./useCarousel";
import { CarouselDots } from "./CarouselDots";
import { CarouselCard } from "./CarouselCard";

const DEFAULT_OPTIONS = { loop: true };

/**
 * Generic, reusable Carousel component
 * 
 * A fully-featured, production-ready carousel component that is:
 * - **Content-agnostic**: Works with any data type via render props
 * - **Responsive**: Automatically adjusts cards per view based on breakpoints
 * - **Accessible**: Full ARIA support, keyboard navigation, and screen reader friendly
 * - **Composable**: Navigation buttons and dots can be toggled independently
 * - **Flexible**: Customizable rendering, styling, spacing, and behavior
 * - **Type-safe**: Full TypeScript support with generics
 * 
 * @example
 * ```tsx
 * <Carousel
 *   items={myItems}
 *   renderCard={(item, index) => <MyCard item={item} />}
 *   breakpoints={{ mobile: 1, tablet: 2, desktop: 3 }}
 *   showNavigation={true}
 *   showDots={true}
 * />
 * ```
 * 
 * @template T - The type of items in the carousel
 */
export function Carousel<T>({
  items,
  renderCard,
  options = DEFAULT_OPTIONS,
  breakpoints,
  className = "",
  showNavigation = true,
  showDots = true,
  navigationLabels,
  ariaLabel = "Carousel",
  cardGap = "0.5rem",
  minCardWidth,
  maxCardWidth,
}: CarouselProps<T>) {
  const {
    emblaRef,
    carouselContainerRef,
    cardWidth,
    selectedIndex,
    prevBtnDisabled,
    nextBtnDisabled,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useCarousel(items, options, {
    breakpoints,
    minCardWidth,
    maxCardWidth,
  });

  return (
    <div className={`relative group ${className}`} role="region" aria-label={ariaLabel}>
      <div className="flex items-center gap-4">
        {/* Left Navigation Button */}
        {showNavigation && (
          <Button
            onClick={scrollPrev}
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-800/50 hover:bg-slate-700 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 transition-opacity duration-300 z-10"
            disabled={prevBtnDisabled}
            aria-label={navigationLabels?.previous || "Previous slide"}
            type="button"
          >
            <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          </Button>
        )}

        {/* Carousel Container */}
        <div
          className="flex-1 min-w-0 relative"
          ref={carouselContainerRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
        >
          <div className="overflow-hidden w-full" ref={emblaRef}>
            <div className="flex">
              {items.map((item, index) => (
                <CarouselCard key={index} width={cardWidth} gap={cardGap}>
                  {renderCard(item, index)}
                </CarouselCard>
              ))}
            </div>
          </div>
        </div>

        {/* Right Navigation Button */}
        {showNavigation && (
          <Button
            onClick={scrollNext}
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-800/50 hover:bg-slate-700 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 transition-opacity duration-300 z-10"
            disabled={nextBtnDisabled}
            aria-label={navigationLabels?.next || "Next slide"}
            type="button"
          >
            <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Dot Indicators */}
      {showDots && items.length > 1 && (
        <CarouselDots
          count={items.length}
          selectedIndex={selectedIndex}
          onDotClick={scrollTo}
          className="mt-6"
        />
      )}
    </div>
  );
}
