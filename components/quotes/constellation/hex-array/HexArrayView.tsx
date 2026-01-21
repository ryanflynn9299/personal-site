"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import { HEX_ARRAY_CONFIG } from "@/app/(portfolio)/quotes/config";
import {
  SatelliteIcon,
  PlanetIcon,
  StarIcon,
  RocketIcon,
} from "@/components/common/SpaceMarkdownIcons";
import { usePulseScheduler } from "./usePulseScheduler";
import { HexPulse } from "./HexPulse";
import type { DataSurge, HexTile } from "./types";
import { buildVertexGraph } from "./vertexGraph";
import { useSurgeSpawner } from "./useSurgeSpawner";
import { SurgePath } from "./SurgePath";
import { ACTIVE_COLORS } from "./constants";
import { useQuoteViewStore } from "../../store/useQuoteViewStore";
import { quotes as quoteColors, core, accents } from "@/constants/theme";

interface HexArrayViewProps {
  quotes: Quote[];
}

// Hexagon geometry constants
const HEX_SIZE = 40; // Radius of hexagon (distance from center to vertex)
const HEX_WIDTH = HEX_SIZE * Math.sqrt(3); // Horizontal spacing between hex centers
const HEX_HEIGHT = HEX_SIZE * 1.5; // Vertical spacing between hex centers (flat-top hex)
const GAP = 2; // Gap between hexagons

// Space icons mapping
const SPACE_ICONS = {
  satellite: SatelliteIcon,
  planet: PlanetIcon,
  star: StarIcon,
  rocket: RocketIcon,
};

/**
 * Simple hash function for deterministic pseudo-randomness
 * Incorporates seed for different distributions
 */
function hash(str: string, seed: string = ""): number {
  const combined = seed + str;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculate distance between two tiles (in grid units)
 * Accounts for hexagonal grid structure
 */
function tileDistance(index1: number, index2: number, cols: number): number {
  const row1 = Math.floor(index1 / cols);
  const col1 = index1 % cols;
  const row2 = Math.floor(index2 / cols);
  const col2 = index2 % cols;

  // Account for hex grid offset (every other row is shifted)
  const offset1 = row1 % 2 === 0 ? 0 : 0.5;
  const offset2 = row2 % 2 === 0 ? 0 : 0.5;

  const dx = col1 + offset1 - (col2 + offset2);
  const dy = (row1 - row2) * 0.866; // Vertical spacing in hex grid (sqrt(3)/2)

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get quadrant for a tile (0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right)
 */
function getQuadrant(
  tileIndex: number,
  rows: number,
  cols: number,
  edgeRows: number,
  edgeCols: number
): number {
  const row = Math.floor(tileIndex / cols);
  const col = tileIndex % cols;

  const visibleRows = rows - edgeRows * 2;
  const visibleCols = cols - edgeCols * 2;
  const midRow = edgeRows + Math.floor(visibleRows / 2);
  const midCol = edgeCols + Math.floor(visibleCols / 2);

  const isTop = row < midRow;
  const isLeft = col < midCol;

  if (isTop && isLeft) {
    return 0;
  } // Top-left
  if (isTop && !isLeft) {
    return 1;
  } // Top-right
  if (!isTop && isLeft) {
    return 2;
  } // Bottom-left
  return 3; // Bottom-right
}

/**
 * Calculate modal exclusion zone in grid coordinates
 * Modal is positioned at top-left with:
 * - margin: 24px
 * - width: ~400px (average of min 320px and max 480px)
 * - height: ~180px (estimated: title + text + padding)
 *
 * Grid starts at (-HEX_WIDTH, -HEX_HEIGHT) and tiles are positioned at:
 * - x = startX + col * HEX_WIDTH + (row % 2 === 0 ? 0 : HEX_WIDTH / 2)
 * - y = startY + row * HEX_HEIGHT
 *
 * We calculate which grid tiles would overlap the modal area
 */
function getModalExclusionZone(
  rows: number,
  cols: number,
  hexWidth: number,
  hexHeight: number,
  edgeRows: number,
  edgeCols: number
): Set<number> {
  const excluded = new Set<number>();

  // Modal dimensions (in pixels) - calculated beforehand
  const MODAL_MARGIN = 24; // margin from viewport edge
  const MODAL_WIDTH = 400; // average width (between 320-480px)
  const MODAL_HEIGHT = 180; // estimated height (title + 2 lines of text + padding)

  // Modal bounds in viewport pixels
  const modalStartX = MODAL_MARGIN;
  const modalEndX = modalStartX + MODAL_WIDTH;
  const modalStartY = MODAL_MARGIN;
  const modalEndY = modalStartY + MODAL_HEIGHT;

  // Grid starting position (from generateHexGrid)
  const gridStartX = -hexWidth;
  const gridStartY = -hexHeight;

  // Add buffer to ensure no tiles are placed near modal (1 tile buffer)
  const buffer = 1.5; // tiles

  // Calculate which grid tiles overlap modal area
  for (let row = edgeRows; row < rows - edgeRows; row++) {
    // Calculate tile Y position in viewport coordinates
    const tileY = gridStartY + row * hexHeight;

    // Check if tile Y is within modal bounds (with buffer)
    // Tiles are centered at their Y position, so check if center is in range
    if (
      tileY >= modalStartY - hexHeight * buffer &&
      tileY <= modalEndY + hexHeight * buffer
    ) {
      for (let col = edgeCols; col < cols - edgeCols; col++) {
        // Calculate tile X position (accounting for hex grid row offset)
        const rowOffset = row % 2 === 0 ? 0 : hexWidth / 2;
        const tileX = gridStartX + col * hexWidth + rowOffset;

        // Check if tile X is within modal bounds (with buffer)
        if (
          tileX >= modalStartX - hexWidth * buffer &&
          tileX <= modalEndX + hexWidth * buffer
        ) {
          const tileIndex = row * cols + col;
          excluded.add(tileIndex);
        }
      }
    }
  }

  return excluded;
}

/**
 * Deterministically select scattered but balanced tiles for active nodes
 * Ensures tiles are not touching and stay away from edges
 * First 4 tiles are guaranteed to be in different quadrants
 * Excludes tiles behind the modal
 */
function selectActiveTiles(
  totalTiles: number,
  numQuotes: number,
  rows: number,
  cols: number,
  seed: string,
  hexWidth: number,
  hexHeight: number
): Set<number> {
  const activeIndices = new Set<number>();
  const numActive = Math.min(numQuotes, totalTiles);

  if (numActive === 0) {
    return activeIndices;
  }

  // Larger edge buffer to avoid partial tiles and edge proximity
  const edgeRows = 4;
  const edgeCols = 4;

  // Minimum distance between active tiles (in grid units)
  // 2.5 ensures tiles are not touching (adjacent tiles are ~1.73 units apart)
  const minDistance = 2.5;

  // Calculate modal exclusion zone
  const modalExclusion = getModalExclusionZone(
    rows,
    cols,
    hexWidth,
    hexHeight,
    edgeRows,
    edgeCols
  );

  // Create candidate pool from safe visible area (fully visible tiles only)
  // Exclude tiles in modal area
  const candidates: number[] = [];
  for (let row = edgeRows; row < rows - edgeRows; row++) {
    for (let col = edgeCols; col < cols - edgeCols; col++) {
      const tileIndex = row * cols + col;
      if (tileIndex < totalTiles && !modalExclusion.has(tileIndex)) {
        candidates.push(tileIndex);
      }
    }
  }

  // Organize candidates by quadrant
  const candidatesByQuadrant: number[][] = [[], [], [], []];
  for (const candidate of candidates) {
    const quadrant = getQuadrant(candidate, rows, cols, edgeRows, edgeCols);
    candidatesByQuadrant[quadrant].push(candidate);
  }

  // Shuffle candidates in each quadrant deterministically
  const shuffledByQuadrant = candidatesByQuadrant.map(
    (quadCandidates, quadIdx) => {
      return [...quadCandidates].sort((a, b) => {
        const hashA = hash(`quadrant-${quadIdx}-candidate-${a}`, seed);
        const hashB = hash(`quadrant-${quadIdx}-candidate-${b}`, seed);
        return hashA - hashB;
      });
    }
  );

  // Select tiles ensuring minimum distance between them
  const selected: number[] = [];
  const usedQuadrants = new Set<number>();

  for (let quoteIdx = 0; quoteIdx < numActive; quoteIdx++) {
    let found = false;
    let attempts = 0;
    const maxAttempts = candidates.length * 2;

    // For first 4 quotes, ensure one per quadrant
    if (quoteIdx < 4) {
      const targetQuadrant = quoteIdx % 4;
      const quadCandidates = shuffledByQuadrant[targetQuadrant];

      // Try to find a valid tile in the target quadrant
      for (
        let attempt = 0;
        attempt < quadCandidates.length && !found;
        attempt++
      ) {
        const candidateHash = hash(
          `quote-${quoteIdx}-quadrant-${targetQuadrant}-attempt-${attempt}`,
          seed
        );
        const candidateIndex = candidateHash % quadCandidates.length;
        const candidate = quadCandidates[candidateIndex];

        // Check if this candidate is far enough from all selected tiles
        let isValid = true;
        for (const selectedTile of selected) {
          const distance = tileDistance(candidate, selectedTile, cols);
          if (distance < minDistance) {
            isValid = false;
            break;
          }
        }

        if (isValid) {
          selected.push(candidate);
          activeIndices.add(candidate);
          usedQuadrants.add(targetQuadrant);
          // Remove from all candidate pools
          shuffledByQuadrant[targetQuadrant].splice(candidateIndex, 1);
          found = true;
        }
      }

      // If we couldn't find a valid tile in target quadrant, try other quadrants
      if (!found) {
        for (let quadIdx = 0; quadIdx < 4 && !found; quadIdx++) {
          const quadCandidates = shuffledByQuadrant[quadIdx];
          for (
            let attempt = 0;
            attempt < quadCandidates.length && !found;
            attempt++
          ) {
            const candidateHash = hash(
              `quote-${quoteIdx}-fallback-quadrant-${quadIdx}-attempt-${attempt}`,
              seed
            );
            const candidateIndex = candidateHash % quadCandidates.length;
            const candidate = quadCandidates[candidateIndex];

            let isValid = true;
            for (const selectedTile of selected) {
              const distance = tileDistance(candidate, selectedTile, cols);
              if (distance < minDistance) {
                isValid = false;
                break;
              }
            }

            if (isValid) {
              selected.push(candidate);
              activeIndices.add(candidate);
              usedQuadrants.add(quadIdx);
              shuffledByQuadrant[quadIdx].splice(candidateIndex, 1);
              found = true;
            }
          }
        }
      }
    } else {
      // For remaining quotes, use balanced pseudo-random selection
      // Create a combined shuffled list from all quadrants
      const allCandidates: number[] = [];
      for (const quadCandidates of shuffledByQuadrant) {
        allCandidates.push(...quadCandidates);
      }

      // Shuffle all candidates deterministically
      const shuffledAll = [...allCandidates].sort((a, b) => {
        const hashA = hash(`quote-${quoteIdx}-candidate-${a}`, seed);
        const hashB = hash(`quote-${quoteIdx}-candidate-${b}`, seed);
        return hashA - hashB;
      });

      // Try to find a valid tile
      while (!found && attempts < maxAttempts && shuffledAll.length > 0) {
        const candidateHash = hash(
          `quote-${quoteIdx}-attempt-${attempts}`,
          seed
        );
        const candidateIndex = candidateHash % shuffledAll.length;
        const candidate = shuffledAll[candidateIndex];

        // Check if this candidate is far enough from all selected tiles
        let isValid = true;
        for (const selectedTile of selected) {
          const distance = tileDistance(candidate, selectedTile, cols);
          if (distance < minDistance) {
            isValid = false;
            break;
          }
        }

        if (isValid) {
          selected.push(candidate);
          activeIndices.add(candidate);
          // Remove from all candidate pools
          shuffledAll.splice(candidateIndex, 1);
          // Also remove from quadrant-specific pools
          for (const quadCandidates of shuffledByQuadrant) {
            const idx = quadCandidates.indexOf(candidate);
            if (idx !== -1) {
              quadCandidates.splice(idx, 1);
              break;
            }
          }
          found = true;
        } else {
          attempts++;
        }
      }
    }

    // If we couldn't find a valid tile after many attempts, relax constraints slightly
    if (!found && attempts >= maxAttempts) {
      const relaxedDistance = minDistance * 0.8;
      // Try all remaining candidates
      const allRemaining: number[] = [];
      for (const quadCandidates of shuffledByQuadrant) {
        allRemaining.push(...quadCandidates);
      }

      for (const candidate of allRemaining) {
        if (selected.includes(candidate)) {
          continue;
        }

        let isValid = true;
        for (const selectedTile of selected) {
          const distance = tileDistance(candidate, selectedTile, cols);
          if (distance < relaxedDistance) {
            isValid = false;
            break;
          }
        }

        if (isValid) {
          selected.push(candidate);
          activeIndices.add(candidate);
          // Remove from quadrant pools
          for (const quadCandidates of shuffledByQuadrant) {
            const idx = quadCandidates.indexOf(candidate);
            if (idx !== -1) {
              quadCandidates.splice(idx, 1);
              break;
            }
          }
          found = true;
          break;
        }
      }
    }
  }

  return activeIndices;
}

/**
 * Generate hex grid covering the viewport
 * Creates a properly aligned hexagonal grid with flat-top orientation
 */
function generateHexGrid(
  width: number,
  height: number,
  quotes: Quote[],
  seed: string
): HexTile[] {
  const tiles: HexTile[] = [];

  // Calculate number of rows and columns needed to cover viewport
  // Add extra rows/cols to ensure full coverage
  const rows = Math.ceil(height / HEX_HEIGHT) + 4;
  const cols = Math.ceil(width / HEX_WIDTH) + 4;

  // Calculate starting offset to center the grid or start from visible area
  const startX = -HEX_WIDTH; // Start slightly off-screen to ensure coverage
  const startY = -HEX_HEIGHT; // Start slightly off-screen to ensure coverage

  const colorKeys: Array<"cyan" | "amber" | "violet"> = [
    "cyan",
    "amber",
    "violet",
  ];
  const iconKeys: Array<"satellite" | "planet" | "star" | "rocket"> = [
    "satellite",
    "planet",
    "star",
    "rocket",
  ];

  // First, generate all tiles
  for (let row = 0; row < rows; row++) {
    // Offset every other row for hexagonal packing
    const offsetX = row % 2 === 0 ? 0 : HEX_WIDTH / 2;

    for (let col = 0; col < cols; col++) {
      // Calculate hex center position
      const x = startX + col * HEX_WIDTH + offsetX;
      const y = startY + row * HEX_HEIGHT;

      tiles.push({
        id: `hex-${row}-${col}`,
        x,
        y,
        isActive: false,
        quote: undefined,
        color: undefined,
        icon: undefined,
      });
    }
  }

  // Deterministically select active tiles for even distribution
  const numQuotes = quotes.length;
  const activeIndices = selectActiveTiles(
    tiles.length,
    numQuotes,
    rows,
    cols,
    seed,
    HEX_WIDTH,
    HEX_HEIGHT
  );

  // Assign quotes to active tiles
  let quoteIndex = 0;
  activeIndices.forEach((tileIndex) => {
    if (quoteIndex < numQuotes) {
      const tile = tiles[tileIndex];
      tile.isActive = true;
      tile.quote = quotes[quoteIndex];
      tile.color = colorKeys[quoteIndex % colorKeys.length];
      tile.icon = iconKeys[quoteIndex % iconKeys.length];
      quoteIndex++;
    }
  });

  return tiles;
}

/**
 * Generate data surge paths through gaps
 */
function _generateDataSurges(
  width: number,
  height: number,
  count: number = 5
): DataSurge[] {
  const surges: DataSurge[] = [];

  for (let i = 0; i < count; i++) {
    // Random start and end points in gaps
    const startX = Math.random() * width;
    const startY = Math.random() * height;
    const endX = Math.random() * width;
    const endY = Math.random() * height;

    // Create path through gaps (horizontal, vertical, or diagonal)
    const path = `M ${startX} ${startY} L ${endX} ${endY}`;

    const delay = Math.random() * 3; // Random delay up to 3 seconds
    surges.push({
      id: `surge-${i}`,
      path,
      duration: 0.5 + Math.random() * 1.5, // 0.5-2 seconds
      startTime: Date.now() + delay * 1000, // Convert delay to milliseconds and add to current time
      color: Math.random() > 0.5 ? "white" : "cyan",
    });
  }

  return surges;
}

/**
 * Generate hexagon path points for flat-top hexagon
 * Flat-top hexagons have a point at the top
 */
function getHexPath(size: number): string {
  const points: string[] = [];
  // Start from top point (angle = -PI/2 for flat-top)
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // Rotate for flat-top
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return `M ${points[0]} L ${points.slice(1).join(" L ")} Z`;
}

export function HexArrayView({ quotes }: HexArrayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedTile, setSelectedTile] = useState<HexTile | null>(null);
  const [modalPosition, setModalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Get hex surge controls from store
  const hexSurgeEnabled = useQuoteViewStore((state) => state.hexSurgeEnabled);
  const setHexSurgeTriggerCallback = useQuoteViewStore(
    (state) => state.setHexSurgeTriggerCallback
  );

  // Track mount state to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Generate hex grid
  const hexGrid = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return [];
    }
    return generateHexGrid(
      dimensions.width,
      dimensions.height,
      quotes,
      HEX_ARRAY_CONFIG.seed
    );
  }, [dimensions, quotes]);

  // Get active tiles for pulse scheduler
  const activeTiles = useMemo(() => {
    return hexGrid.filter((tile) => tile.isActive);
  }, [hexGrid]);

  // Global pulse scheduler - one pulse per 3 seconds across all active tiles
  const pulsingTileId = usePulseScheduler(activeTiles, hexSurgeEnabled);

  // Build vertex graph for Data Surge animations
  const vertexGraph = useMemo(() => {
    if (hexGrid.length === 0) {
      return null;
    }
    return buildVertexGraph(hexGrid);
  }, [hexGrid]);

  // Use surge spawner to manage Data Surge animations
  const { surges: dataSurges, triggerSurge } = useSurgeSpawner(
    activeTiles,
    vertexGraph,
    dimensions.width,
    dimensions.height,
    hexSurgeEnabled
  );

  // Register trigger function with store
  useEffect(() => {
    setHexSurgeTriggerCallback(triggerSurge);
    return () => {
      setHexSurgeTriggerCallback(null);
    };
  }, [triggerSurge, setHexSurgeTriggerCallback]);

  // Handle tile click - Holo-Projection
  const handleTileClick = (tile: HexTile, _event: React.MouseEvent) => {
    if (!tile.isActive || !tile.quote) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    // Calculate tile center position relative to viewport
    const tileCenterX = rect.left + tile.x;
    const tileCenterY = rect.top + tile.y;

    setSelectedTile(tile);
    setModalPosition({ x: tileCenterX, y: tileCenterY });
  };

  // Handle close
  const handleClose = () => {
    setSelectedTile(null);
    setModalPosition(null);
  };

  // Calculate modal position - place close to tile, never off-screen
  // Use useMemo to prevent hydration mismatches by only calculating on client after mount
  const modalStyle = useMemo((): React.CSSProperties => {
    if (!modalPosition || !isMounted || typeof window === "undefined") {
      return { display: "none" };
    }

    const modalWidth = 500;
    const modalHeight = 300;
    const margin = 20;
    const spacing = 20; // Space between modal and tile

    const tileX = modalPosition.x;
    const tileY = modalPosition.y;

    // Start by positioning modal to the right and slightly below tile
    let modalX = tileX + HEX_SIZE + spacing;
    let modalY = tileY - modalHeight / 2;

    // If modal would go off right edge, try left side
    if (modalX + modalWidth > window.innerWidth - margin) {
      modalX = tileX - modalWidth - HEX_SIZE - spacing;
    }

    // If modal would go off left edge, center horizontally on tile
    if (modalX < margin) {
      modalX = tileX - modalWidth / 2;
    }

    // If modal would go off bottom edge, move up
    if (modalY + modalHeight > window.innerHeight - margin) {
      modalY = window.innerHeight - modalHeight - margin;
    }

    // If modal would go off top edge, move down
    if (modalY < margin) {
      modalY = margin;
    }

    // Final clamp to ensure modal stays within viewport
    modalX = Math.max(
      margin,
      Math.min(window.innerWidth - modalWidth - margin, modalX)
    );
    modalY = Math.max(
      margin,
      Math.min(window.innerHeight - modalHeight - margin, modalY)
    );

    return {
      position: "fixed",
      left: `${modalX}px`,
      top: `${modalY}px`,
    };
  }, [modalPosition, isMounted]);

  // Hex path with gap accounted for - hex size reduced to create gap between tiles
  const hexPath = getHexPath(HEX_SIZE - GAP);

  // Styling constants - easy to tweak
  const MODAL_STYLES = {
    backgroundColor: quoteColors.modal.background,
    backdropBlur: "12px",
    borderColor: quoteColors.modal.border,
    borderWidth: "1px",
    borderRadius: "12px",
    padding: "28px",
    margin: "24px",
    minWidth: "320px",
    maxWidth: "480px",
    titleColor: quoteColors.modal.title,
    textColor: quoteColors.modal.text,
    titleSize: "text-2xl",
    textSize: "text-base",
  } as const;

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-slate-950"
      onClick={handleClose}
    >
      {/* Floating Instructions Modal */}
      <div
        className="pointer-events-auto absolute left-0 top-0 z-10"
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
          My Quotes
        </h2>
        <div
          className={`${MODAL_STYLES.textSize} space-y-2 leading-relaxed`}
          style={{ color: MODAL_STYLES.textColor }}
        >
          <p>Click on any colored hex tile to view its quote.</p>
          <p>
            Tiles are scattered across the grid—explore to discover different
            quotes.
          </p>
        </div>
      </div>
      {/* SVG Grid Container */}
      <svg
        className="absolute inset-0 h-full w-full"
        width={dimensions.width || "100%"}
        height={dimensions.height || "100%"}
        viewBox={`0 0 ${dimensions.width || 1920} ${dimensions.height || 1080}`}
        preserveAspectRatio="none"
      >
        {/* Background hexagons - opaque slate-800 with gaps */}
        {/* Only render non-active tiles as background */}
        {hexGrid
          .filter((tile) => !tile.isActive)
          .map((tile) => (
            <g key={tile.id}>
              <path
                d={hexPath}
                transform={`translate(${tile.x}, ${tile.y})`}
                fill={core.background.secondary}
                stroke="none"
              />
            </g>
          ))}

        {/* Active nodes - evenly distributed, replacing background tiles */}
        {hexGrid
          .filter((tile) => tile.isActive)
          .map((tile) => {
            const IconComponent = tile.icon ? SPACE_ICONS[tile.icon] : null;
            const color = tile.color ? ACTIVE_COLORS[tile.color] : accents.cyan;

            return (
              <g key={tile.id}>
                <path
                  d={hexPath}
                  transform={`translate(${tile.x}, ${tile.y})`}
                  fill={color}
                  stroke={core.background.primary}
                  strokeWidth="2"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTileClick(tile, e as any);
                  }}
                />
                {IconComponent && (
                  <foreignObject
                    x={tile.x - 12}
                    y={tile.y - 12}
                    width="24"
                    height="24"
                    className="pointer-events-none"
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <IconComponent className="h-6 w-6 text-slate-950" />
                    </div>
                  </foreignObject>
                )}

                {/* Pulsing hexagon around active tile - only when this tile is pulsing */}
                {pulsingTileId === tile.id && (
                  <HexPulse x={tile.x} y={tile.y} color={color} />
                )}
              </g>
            );
          })}

        {/* Data Surge paths - rendered on top of hexagons */}
        {dataSurges.map((surge) => (
          <SurgePath key={surge.id} surge={surge} />
        ))}
      </svg>

      {/* Holo-Projection Modal */}
      <AnimatePresence>
        {selectedTile && selectedTile.quote && modalPosition && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="pointer-events-auto z-50 min-w-[400px] max-w-[600px] rounded-lg border-2 border-slate-700 bg-slate-900/95 backdrop-blur-xl p-8 shadow-2xl"
            style={{
              ...modalStyle,
              borderColor: selectedTile.color
                ? ACTIVE_COLORS[selectedTile.color]
                : accents.cyan,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Holo-projection indicator */}
            <div className="mb-4 flex items-center gap-2 font-mono text-xs text-slate-500">
              <span
                style={{
                  color: selectedTile.color
                    ? ACTIVE_COLORS[selectedTile.color]
                    : accents.cyan,
                }}
              >
                {"// HOLO_PROJECTION_ACTIVE"}
              </span>
            </div>

            {/* Quote content */}
            <blockquote className="font-inter text-2xl font-semibold leading-relaxed text-slate-50">
              {selectedTile.quote.text}
            </blockquote>

            {(selectedTile.quote.author || selectedTile.quote.source) && (
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-800 pt-4 font-mono text-sm text-slate-400">
                {selectedTile.quote.author && (
                  <>
                    <span className="text-slate-600">AUTHOR:</span>
                    <span>{selectedTile.quote.author}</span>
                  </>
                )}
                {selectedTile.quote.source && (
                  <>
                    <span className="text-slate-600">{"//"}</span>
                    <span className="text-slate-500">
                      {selectedTile.quote.source}
                    </span>
                  </>
                )}
              </div>
            )}

            {selectedTile.quote.tags && selectedTile.quote.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedTile.quote.tags.map((tag, idx) => (
                  <span key={idx} className="font-mono text-xs text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
