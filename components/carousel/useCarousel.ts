import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";
import { CarouselBreakpoints } from "./types";

const DEFAULT_BREAKPOINTS: CarouselBreakpoints = {
  mobile: 1,
  desktop: 3,
};

const MOBILE_BREAKPOINT = 768;
const BUTTON_SPACE = 128; // Navigation buttons + gaps
const GAP_PX = 16; // Gap between cards
const HYSTERESIS_BUFFER = 40; // Prevents rapid switching
const DEFAULT_MIN_CARD_WIDTH = 400; // Ensures buttons remain visible

export interface UseCarouselOptions {
  breakpoints?: CarouselBreakpoints;
  minCardWidth?: number;
  maxCardWidth?: number;
}

interface CarouselState {
  cardWidth: string;
  cardsPerView: number;
  selectedIndex: number;
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
}

export function useCarousel<T>(
  items: T[],
  options?: EmblaOptionsType,
  carouselOptions: UseCarouselOptions = {}
) {
  const { breakpoints = DEFAULT_BREAKPOINTS, minCardWidth, maxCardWidth } = carouselOptions;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  
  const [state, setState] = useState<CarouselState>({
    cardWidth: "100%",
    cardsPerView: 3,
    selectedIndex: 0,
    prevBtnDisabled: true,
    nextBtnDisabled: true,
  });

  // Navigation handlers
  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        emblaApi?.scrollTo(index);
      }
    },
    [emblaApi, items.length]
  );

  // Update state from Embla API
  const updateCarouselState = useCallback(() => {
    if (!emblaApi) return;

    setState((prev) => ({
      ...prev,
      selectedIndex: emblaApi.selectedScrollSnap(),
      prevBtnDisabled: !emblaApi.canScrollPrev(),
      nextBtnDisabled: !emblaApi.canScrollNext(),
    }));
  }, [emblaApi]);

  // Initialize Embla event listeners
  useEffect(() => {
    if (!emblaApi) return;

    updateCarouselState();
    emblaApi.on("select", updateCarouselState);
    emblaApi.on("reInit", updateCarouselState);

    return () => {
      emblaApi.off("select", updateCarouselState);
      emblaApi.off("reInit", updateCarouselState);
    };
  }, [emblaApi, updateCarouselState]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!emblaApi || !carouselContainerRef.current?.contains(document.activeElement)) {
        return;
      }

      const handlers: Record<string, () => void> = {
        ArrowLeft: () => {
          event.preventDefault();
          scrollPrev();
        },
        ArrowRight: () => {
          event.preventDefault();
          scrollNext();
        },
        Home: () => {
          event.preventDefault();
          scrollTo(0);
        },
        End: () => {
          event.preventDefault();
          scrollTo(items.length - 1);
        },
      };

      handlers[event.key]?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [emblaApi, scrollPrev, scrollNext, scrollTo, items.length]);

  // Responsive card width calculation
  useEffect(() => {
    const calculateCardWidth = () => {
      if (!carouselContainerRef.current) return;

      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < MOBILE_BREAKPOINT;

      if (isMobile) {
        setState((prev) => ({ ...prev, cardsPerView: 1, cardWidth: "100%" }));
        return;
      }

      const flexContainer = carouselContainerRef.current.parentElement;
      if (!flexContainer) return;

      const availableWidth = flexContainer.offsetWidth - BUTTON_SPACE;
      if (availableWidth <= 0) return;

      const minWidth = minCardWidth ?? DEFAULT_MIN_CARD_WIDTH;
      const threshold3To1 = minWidth * 3 + GAP_PX * 2;
      const threshold1To3 = threshold3To1 + HYSTERESIS_BUFFER;

      setState((prev) => {
        let newCardsPerView = prev.cardsPerView;
        
        if (prev.cardsPerView === 3 && availableWidth < threshold3To1) {
          newCardsPerView = 1;
        } else if (prev.cardsPerView === 1 && availableWidth >= threshold1To3) {
          newCardsPerView = 3;
        }

        let newCardWidth: string;
        if (newCardsPerView === 3) {
          newCardWidth = "33.333%";
        } else if (maxCardWidth) {
          const maxWidthPercent = (maxCardWidth / availableWidth) * 100;
          newCardWidth = `${Math.min(maxWidthPercent, 100)}%`;
        } else {
          newCardWidth = "33.333%";
        }

        return {
          ...prev,
          cardsPerView: newCardsPerView,
          cardWidth: newCardWidth,
        };
      });
    };

    // ResizeObserver for container changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateCardWidth);
    });

    const flexContainer = carouselContainerRef.current?.parentElement;
    if (flexContainer) {
      resizeObserver.observe(flexContainer);
    }

    // Window resize fallback with throttling
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateCardWidth, 16);
    };

    window.addEventListener("resize", handleResize);
    calculateCardWidth();

    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [minCardWidth, maxCardWidth]);

  return {
    emblaRef,
    emblaApi,
    carouselContainerRef,
    cardWidth: state.cardWidth,
    selectedIndex: state.selectedIndex,
    prevBtnDisabled: state.prevBtnDisabled,
    nextBtnDisabled: state.nextBtnDisabled,
    scrollPrev,
    scrollNext,
    scrollTo,
  };
}
