import { EmblaOptionsType } from "embla-carousel";
import { ReactNode } from "react";

/**
 * Configuration for carousel breakpoints
 */
export interface CarouselBreakpoints {
  /** Cards per view on mobile (< 768px) */
  mobile?: number;
  /** Cards per view on tablet (768px - 1023px) */
  tablet?: number;
  /** Cards per view on desktop (>= 1024px) */
  desktop?: number;
}

/**
 * Carousel component props
 */
export interface CarouselProps<T = unknown> {
  /** Array of items to display in the carousel */
  items: T[];
  /** Function to render each item as a card */
  renderCard: (item: T, index: number) => ReactNode;
  /** Optional carousel options for Embla */
  options?: EmblaOptionsType;
  /** Breakpoint configuration for responsive card sizing */
  breakpoints?: CarouselBreakpoints;
  /** Custom className for the carousel container */
  className?: string;
  /** Whether to show navigation buttons */
  showNavigation?: boolean;
  /** Whether to show dot indicators */
  showDots?: boolean;
  /** Custom navigation button labels for accessibility */
  navigationLabels?: {
    previous?: string;
    next?: string;
  };
  /** Custom aria label for the carousel */
  ariaLabel?: string;
  /** Gap between cards */
  cardGap?: string;
  /** 
   * Minimum card width in pixels (for 3-card view)
   * Determines when to switch from 3 cards to 1 card on desktop
   * Default: 240px
   */
  minCardWidth?: number;
  /** 
   * Maximum card width in pixels (for single card view on desktop)
   * If provided, limits the single card width to this value
   * If not provided, single card matches the size of cards in 3-card view (33.333%)
   */
  maxCardWidth?: number;
}

/**
 * Carousel navigation button props
 */
export interface CarouselNavigationProps {
  /** Whether the previous button is disabled */
  prevDisabled: boolean;
  /** Whether the next button is disabled */
  nextDisabled: boolean;
  /** Handler for previous button click */
  onPrevious: () => void;
  /** Handler for next button click */
  onNext: () => void;
  /** Custom labels for accessibility */
  labels?: {
    previous?: string;
    next?: string;
  };
  /** Custom className */
  className?: string;
}

/**
 * Carousel dots indicator props
 */
export interface CarouselDotsProps {
  /** Total number of items */
  count: number;
  /** Currently selected index */
  selectedIndex: number;
  /** Handler for dot click */
  onDotClick: (index: number) => void;
  /** Custom className */
  className?: string;
}
