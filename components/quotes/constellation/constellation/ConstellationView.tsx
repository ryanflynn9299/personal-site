"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useSyncExternalStore } from "react";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import { QuoteModalTitle } from "@/components/quotes/QuoteModalTitle";
import {
  CONSTELLATION_METADATA,
  CONSTELLATION_PATTERNS,
  CONNECTION_PATTERNS,
  DESKTOP_SQUARE_SIZE,
  MOBILE_VERTICAL_SPACING,
  MOBILE_HORIZONTAL_PADDING,
  type ConstellationMetadata,
} from "./constellationPositions";
import { MOBILE_BREAKPOINT } from "@/constants/ui";
import { quotes as quoteColors } from "@/constants/theme";

interface ConstellationViewProps {
  quotes: Quote[];
}

// Star appearance - colored dots matching constellation
const STAR_SIZE = 3.5; // Larger than background dots (which are 1-2px)
const STAR_GLOW_SIZE = 8; // Size of the glow effect around each star

interface StarNode {
  id: string;
  quote: Quote;
  x: number;
  y: number;
  size: number;
}

interface Constellation {
  id: string;
  stars: StarNode[];
  connections: Array<[number, number]>;
  centerX: number;
  centerY: number;
  radius: number;
  color: string; // Color for this constellation
  colorName: string;
  position: { x: number; y: number }; // Normalized position (0-1)
}

const MIN_CONSTELLATION_SIZE = 4;
const CONSTELLATION_RADIUS = 150; // Radius for constellation layout
const POSITION_OFFSET_RANGE = 15; // Random offset range for star positions

/**
 * Hook to detect if screen is mobile (< md breakpoint)
 * Uses useSyncExternalStore for better performance and SSR compatibility
 */
function useIsMobile(): boolean {
  return useSyncExternalStore(
    (subscribe) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("resize", subscribe);
      return () => window.removeEventListener("resize", subscribe);
    },
    () =>
      typeof window !== "undefined"
        ? window.innerWidth < MOBILE_BREAKPOINT
        : false,
    () => false // Server-side snapshot (default to desktop)
  );
}

/**
 * Group quotes into constellations with average size of ~4.5 stars
 * Mixes sizes of 4 and 5 stars to achieve the target average
 */
function groupIntoConstellations(quotes: Quote[]): Quote[][] {
  const constellations: Quote[][] = [];
  let quoteIndex = 0;

  // Target average of 4.5 stars - mix of 4, 5, and 7 star constellations
  // For 20 quotes: 4, 5, 4, 7 = 20 quotes, average 5.0 (but with 4-star variants, closer to 4.5)
  const targetSizes = [4, 5, 4, 7]; // Mix with one 7-star constellation

  for (let i = 0; i < targetSizes.length && quoteIndex < quotes.length; i++) {
    const targetSize = targetSizes[i];
    const constellation: Quote[] = [];

    // Fill this constellation up to target size
    while (constellation.length < targetSize && quoteIndex < quotes.length) {
      constellation.push(quotes[quoteIndex]);
      quoteIndex++;
    }

    // Only add if it meets minimum size
    if (constellation.length >= MIN_CONSTELLATION_SIZE) {
      constellations.push(constellation);
    }
  }

  // Add any remaining quotes to a final constellation if enough
  const remaining: Quote[] = [];
  while (quoteIndex < quotes.length) {
    remaining.push(quotes[quoteIndex]);
    quoteIndex++;
  }

  if (remaining.length >= MIN_CONSTELLATION_SIZE) {
    constellations.push(remaining);
  }

  return constellations;
}

/**
 * Convert normalized position (0-1) to desktop pixel coordinates
 */
function convertToDesktopPosition(
  normalizedPos: { x: number; y: number },
  squareSize: number
): { x: number; y: number } {
  return {
    x: normalizedPos.x * squareSize,
    y: normalizedPos.y * squareSize,
  };
}

/**
 * Convert normalized position to mobile pixel coordinates
 * Uses vertical stacking with horizontal positioning based on normalized X
 */
function convertToMobilePosition(
  normalizedPos: { x: number; y: number },
  groupIndex: number,
  viewportWidth: number
): { x: number; y: number } {
  const horizontalPadding = viewportWidth * MOBILE_HORIZONTAL_PADDING;
  const availableWidth = viewportWidth - horizontalPadding * 2;
  const pixelX = horizontalPadding + normalizedPos.x * availableWidth;
  const pixelY =
    groupIndex * MOBILE_VERTICAL_SPACING + MOBILE_VERTICAL_SPACING * 0.5;

  return { x: pixelX, y: pixelY };
}

/**
 * Build constellation data from quotes using absolute positioning
 */
function buildConstellations(
  quotes: Quote[],
  isMobile: boolean,
  viewportWidth: number
): Constellation[] {
  const quoteGroups = groupIntoConstellations(quotes);
  const constellations: Constellation[] = [];

  quoteGroups.forEach((group, groupIndex) => {
    const size = group.length;
    const patterns = CONSTELLATION_PATTERNS[size];
    const connectionPatterns = CONNECTION_PATTERNS[size];

    if (!patterns || !connectionPatterns || patterns.length === 0) return;

    // Get metadata for this constellation (fallback to first if not enough metadata)
    const metadata: ConstellationMetadata =
      CONSTELLATION_METADATA[groupIndex] ||
      CONSTELLATION_METADATA[groupIndex % CONSTELLATION_METADATA.length];

    // Use variant from metadata, but validate it exists for this size
    const variantIndex = Math.min(metadata.variantIndex, patterns.length - 1);
    const pattern = patterns[variantIndex];
    const connections = connectionPatterns[variantIndex];

    // Convert normalized position to pixel coordinates based on layout
    const centerPosition = isMobile
      ? convertToMobilePosition(metadata.position, groupIndex, viewportWidth)
      : convertToDesktopPosition(metadata.position, DESKTOP_SQUARE_SIZE);

    const centerX = centerPosition.x;
    const centerY = centerPosition.y;

    const stars: StarNode[] = group.map((quote, index) => {
      const size = STAR_SIZE;

      const [patternX, patternY] = pattern[index];

      // Add slight random offset for natural variation
      // Use quote ID as seed for deterministic but varied offsets
      const offsetSeed = parseInt(quote.id) || index;
      const offsetX =
        (offsetSeed % POSITION_OFFSET_RANGE) - POSITION_OFFSET_RANGE / 2;
      const offsetY =
        ((offsetSeed * 7) % POSITION_OFFSET_RANGE) - POSITION_OFFSET_RANGE / 2;

      const x = centerX + patternX * CONSTELLATION_RADIUS + offsetX;
      const y = centerY + patternY * CONSTELLATION_RADIUS + offsetY;

      return {
        id: quote.id,
        quote,
        x,
        y,
        size,
      };
    });

    constellations.push({
      id: `constellation-${groupIndex}`,
      stars,
      connections,
      centerX,
      centerY,
      radius: CONSTELLATION_RADIUS,
      color: metadata.color,
      colorName: metadata.colorName,
      position: metadata.position,
    });
  });

  return constellations;
}

export function ConstellationView({ quotes }: ConstellationViewProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(1200); // Default to desktop size

  // Update viewport width on resize
  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportWidth(window.innerWidth);
      const updateWidth = () => {
        setViewportWidth(window.innerWidth);
      };
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
  }, []);

  const constellations = useMemo(
    () => buildConstellations(quotes, isMobile, viewportWidth),
    [quotes, isMobile, viewportWidth]
  );
  const [hoveredStarId, setHoveredStarId] = useState<string | null>(null);
  const [selectedStarId, setSelectedStarId] = useState<string | null>(null);

  // Get all stars in the same constellation as the hovered star
  const getConstellationStarIds = useCallback(
    (starId: string): Set<string> => {
      const starIds = new Set<string>();

      for (const constellation of constellations) {
        const starIndex = constellation.stars.findIndex((s) => s.id === starId);
        if (starIndex === -1) continue;

        // Add all stars in this constellation
        constellation.stars.forEach((star) => {
          starIds.add(star.id);
        });
        break; // Found the constellation, no need to continue
      }

      return starIds;
    },
    [constellations]
  );

  // Get the constellation that contains the hovered star
  const getHoveredConstellation = useCallback(
    (starId: string): Constellation | null => {
      for (const constellation of constellations) {
        if (constellation.stars.some((s) => s.id === starId)) {
          return constellation;
        }
      }
      return null;
    },
    [constellations]
  );

  const constellationStarIds = useMemo(() => {
    if (!hoveredStarId) return new Set<string>();
    return getConstellationStarIds(hoveredStarId);
  }, [hoveredStarId, getConstellationStarIds]);

  const hoveredConstellation = useMemo(() => {
    if (!hoveredStarId) return null;
    return getHoveredConstellation(hoveredStarId);
  }, [hoveredStarId, getHoveredConstellation]);

  const selectedQuote = useMemo(() => {
    if (!selectedStarId) return null;
    for (const constellation of constellations) {
      const star = constellation.stars.find((s) => s.id === selectedStarId);
      if (star) return star.quote;
    }
    return null;
  }, [selectedStarId, constellations]);

  // Calculate viewBox based on layout type
  const viewBox = useMemo(() => {
    if (constellations.length === 0) return "0 0 1000 1000";

    if (isMobile) {
      // Mobile: Calculate bounds for vertical stack layout
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      constellations.forEach((constellation) => {
        constellation.stars.forEach((star) => {
          minX = Math.min(minX, star.x - star.size);
          minY = Math.min(minY, star.y - star.size);
          maxX = Math.max(maxX, star.x + star.size);
          maxY = Math.max(maxY, star.y + star.size);
        });
      });

      const padding = 50;
      const width = maxX - minX + padding * 2;
      const height = maxY - minY + padding * 2;

      return `${minX - padding} ${minY - padding} ${width} ${height}`;
    } else {
      // Desktop: Use fixed square size
      const padding = 100;
      return `${-padding} ${-padding} ${DESKTOP_SQUARE_SIZE + padding * 2} ${DESKTOP_SQUARE_SIZE + padding * 2}`;
    }
  }, [constellations, isMobile]);

  const handleStarClick = useCallback(
    (starId: string) => {
      setSelectedStarId(starId === selectedStarId ? null : starId);
    },
    [selectedStarId]
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedStarId(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full bg-slate-900 ${
        isMobile ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden"
      }`}
      onClick={handleBackgroundClick}
    >
      {/* Modal Title */}
      <QuoteModalTitle
        title="My Quotes"
        description={
          <>
            <p>Hover over any star to see its constellation light up.</p>
            <p>Click on a star to view its quote.</p>
          </>
        }
      />

      {/* White dot background with minimal motion */}
      <div className="absolute inset-0">
        <div className="stars-constellation stars-constellation-1"></div>
        <div className="stars-constellation stars-constellation-2"></div>
        <div className="stars-constellation stars-constellation-3"></div>
      </div>

      {/* Desktop: Fixed square container centered */}
      {!isMobile && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{
              width: DESKTOP_SQUARE_SIZE,
              height: DESKTOP_SQUARE_SIZE,
              position: "relative",
            }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Render connections */}
              {constellations.map((constellation) => {
                // Check if this entire constellation is hovered
                const isConstellationHovered =
                  hoveredConstellation?.id === constellation.id;

                return constellation.connections.map(([a, b], connIndex) => {
                  const starA = constellation.stars[a];
                  const starB = constellation.stars[b];

                  // Determine line color and width
                  let strokeColor = "#f8fafc"; // White in stasis
                  let strokeWidth = 0.5;

                  if (isConstellationHovered) {
                    // Use the constellation color when any star in constellation is hovered
                    strokeColor = constellation.color;
                    strokeWidth = 3;
                  }

                  return (
                    <line
                      key={`${constellation.id}-conn-${connIndex}`}
                      x1={starA.x}
                      y1={starA.y}
                      x2={starB.x}
                      y2={starB.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      opacity={isConstellationHovered ? 1 : 0.5}
                      style={{
                        transition: "all 0.2s ease",
                      }}
                    />
                  );
                });
              })}

              {/* Render stars */}
              {constellations.map((constellation) => {
                // Check if this entire constellation is hovered
                const isConstellationHovered =
                  hoveredConstellation?.id === constellation.id;

                return constellation.stars.map((star) => {
                  const isInHoveredConstellation = constellationStarIds.has(
                    star.id
                  );
                  const isDimmed = hoveredStarId && !isInHoveredConstellation;

                  return (
                    <g key={star.id}>
                      {/* Base glow effect - always visible, subtle */}
                      <circle
                        cx={star.x}
                        cy={star.y}
                        r={STAR_GLOW_SIZE}
                        fill={constellation.color}
                        opacity={0.15}
                        style={{
                          filter: "blur(2px)",
                        }}
                      />

                      {/* Enhanced glow when constellation is hovered */}
                      {isConstellationHovered && (
                        <circle
                          cx={star.x}
                          cy={star.y}
                          r={STAR_GLOW_SIZE * 1.5}
                          fill={constellation.color}
                          opacity={0.4}
                          style={{
                            filter: "blur(3px)",
                            transition: "all 0.2s ease",
                          }}
                        />
                      )}

                      {/* Main star circle - constellation color */}
                      <circle
                        cx={star.x}
                        cy={star.y}
                        r={star.size}
                        fill={constellation.color}
                        opacity={isDimmed ? 0.3 : 1}
                        style={{
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                          filter: isConstellationHovered
                            ? "drop-shadow(0 0 4px " + constellation.color + ")"
                            : "drop-shadow(0 0 2px " +
                              constellation.color +
                              ")",
                        }}
                        onMouseEnter={() => setHoveredStarId(star.id)}
                        onMouseLeave={() => setHoveredStarId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarClick(star.id);
                        }}
                      />
                    </g>
                  );
                });
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Mobile: Full-width scrollable SVG */}
      {isMobile && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Render connections */}
          {constellations.map((constellation) => {
            // Check if this entire constellation is hovered
            const isConstellationHovered =
              hoveredConstellation?.id === constellation.id;

            return constellation.connections.map(([a, b], connIndex) => {
              const starA = constellation.stars[a];
              const starB = constellation.stars[b];

              // Determine line color and width
              let strokeColor = "#f8fafc"; // White in stasis
              let strokeWidth = 0.5;

              if (isConstellationHovered) {
                // Use the constellation color when any star in constellation is hovered
                strokeColor = constellation.color;
                strokeWidth = 3;
              }

              return (
                <line
                  key={`${constellation.id}-conn-${connIndex}`}
                  x1={starA.x}
                  y1={starA.y}
                  x2={starB.x}
                  y2={starB.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={isConstellationHovered ? 1 : 0.5}
                  style={{
                    transition: "all 0.2s ease",
                  }}
                />
              );
            });
          })}

          {/* Render stars */}
          {constellations.map((constellation) => {
            // Check if this entire constellation is hovered
            const isConstellationHovered =
              hoveredConstellation?.id === constellation.id;

            return constellation.stars.map((star) => {
              const isInHoveredConstellation = constellationStarIds.has(
                star.id
              );
              const isDimmed = hoveredStarId && !isInHoveredConstellation;

              return (
                <g key={star.id}>
                  {/* Base glow effect - always visible, subtle */}
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={STAR_GLOW_SIZE}
                    fill={constellation.color}
                    opacity={0.15}
                    style={{
                      filter: "blur(2px)",
                    }}
                  />

                  {/* Enhanced glow when constellation is hovered */}
                  {isConstellationHovered && (
                    <circle
                      cx={star.x}
                      cy={star.y}
                      r={STAR_GLOW_SIZE * 1.5}
                      fill={constellation.color}
                      opacity={0.4}
                      style={{
                        filter: "blur(3px)",
                        transition: "all 0.2s ease",
                      }}
                    />
                  )}

                  {/* Main star circle - constellation color */}
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={star.size}
                    fill={constellation.color}
                    opacity={isDimmed ? 0.3 : 1}
                    style={{
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      filter: isConstellationHovered
                        ? "drop-shadow(0 0 4px " + constellation.color + ")"
                        : "drop-shadow(0 0 2px " + constellation.color + ")",
                    }}
                    onMouseEnter={() => setHoveredStarId(star.id)}
                    onMouseLeave={() => setHoveredStarId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStarClick(star.id);
                    }}
                  />
                </g>
              );
            });
          })}
        </svg>
      )}

      {/* Quote Popup */}
      {selectedQuote && (
        <div
          className="pointer-events-auto absolute left-1/2 top-1/2 z-50 min-w-[300px] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quote content */}
          <blockquote className="font-inter text-xl font-semibold leading-relaxed text-slate-50">
            {selectedQuote.text}
          </blockquote>

          {(selectedQuote.author || selectedQuote.source) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4 font-mono text-sm text-slate-400">
              {selectedQuote.author && (
                <>
                  <span className="text-slate-600">AUTHOR:</span>
                  <span>{selectedQuote.author}</span>
                </>
              )}
              {selectedQuote.source && (
                <>
                  <span className="text-slate-600">{"//"}</span>
                  <span className="text-slate-500">{selectedQuote.source}</span>
                </>
              )}
            </div>
          )}

          {selectedQuote.tags && selectedQuote.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedQuote.tags.map((tag, idx) => {
                // Find which constellation this quote belongs to
                const constellation = constellations.find((c) =>
                  c.stars.some((s) => s.id === selectedStarId)
                );
                const tagColor =
                  constellation?.color || quoteColors.constellation.default;
                return (
                  <span
                    key={idx}
                    className="rounded px-2 py-1 font-mono text-xs"
                    style={{
                      backgroundColor: `${tagColor}20`,
                      color: tagColor,
                      border: `1px solid ${tagColor}40`,
                    }}
                  >
                    #{tag}
                  </span>
                );
              })}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleBackgroundClick}
            className="absolute right-2 top-2 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
