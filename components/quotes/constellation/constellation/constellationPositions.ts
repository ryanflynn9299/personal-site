/**
 * Constellation metadata constants
 * All metadata for each constellation grouped together
 */

// Desktop layout: Fixed square reference size
export const DESKTOP_SQUARE_SIZE = 1200; // pixels

// Mobile layout configuration
export const MOBILE_VERTICAL_SPACING = 400; // pixels between constellations
export const MOBILE_HORIZONTAL_PADDING = 0.1; // 10% padding on sides

/**
 * Constellation metadata interface
 */
export interface ConstellationMetadata {
  position: { x: number; y: number }; // Normalized coordinates (0-1)
  color: string; // Hex color code
  colorName: string; // Human-readable color name
  size: number; // Number of stars in this constellation
  variantIndex: number; // Which pattern variant to use (0-based)
}

import { quotes } from "@/constants/theme";

/**
 * All constellation metadata grouped together
 * Each entry contains position, color, size, and variant information
 * Positions use normalized coordinates (0-1) relative to desktop square reference
 *   x: 0 = left edge, 1 = right edge
 *   y: 0 = top edge, 1 = bottom edge
 */
export const CONSTELLATION_METADATA: ConstellationMetadata[] = [
  // Constellation 1: 4 stars, square variant, blue
  {
    position: { x: 0.25, y: 0.45 },
    color: quotes.constellation.blue,
    colorName: "Blue",
    size: 4,
    variantIndex: 0, // Square variant
  },

  // Constellation 2: 5 stars, diamond variant, purple
  {
    position: { x: 0.75, y: 0.3 },
    color: quotes.constellation.purple,
    colorName: "Purple",
    size: 5,
    variantIndex: 0, // Diamond variant
  },

  // Constellation 3: 4 stars, L-shape variant, pink
  {
    position: { x: 0.3, y: 0.67 },
    color: quotes.constellation.pink,
    colorName: "Pink",
    size: 4,
    variantIndex: 1, // L-shape variant
  },

  // Constellation 4: 7 stars, default variant, green
  {
    position: { x: 0.7, y: 0.57 },
    color: quotes.constellation.emerald,
    colorName: "Green",
    size: 7,
    variantIndex: 0, // Only one variant for 7 stars
  },
];

/**
 * Constellation shape patterns (normalized coordinates -1 to 1)
 * Different sizes and shapes for visual variety
 * Each size can have multiple variants
 */
export const CONSTELLATION_PATTERNS: {
  [key: number]: Array<Array<[number, number]>>;
} = {
  // 4-star patterns - two variants
  4: [
    // Variant 1: Small compact square
    [
      [-0.25, -0.25],
      [0.25, -0.25],
      [-0.25, 0.25],
      [0.25, 0.25],
    ],
    // Variant 2: L-shape
    [
      [-0.3, -0.3],
      [0.2, -0.3],
      [-0.3, 0.2],
      [-0.3, 0.5],
    ],
  ],
  // 5-star patterns - two variants
  5: [
    // Variant 1: Diamond shape
    [
      [0, -0.35],
      [-0.3, 0],
      [0.3, 0],
      [-0.2, 0.3],
      [0.2, 0.3],
    ],
    // Variant 2: Cross pattern
    [
      [0, -0.4], // Top
      [-0.4, 0], // Left
      [0, 0], // Center
      [0.4, 0], // Right
      [0, 0.4], // Bottom
    ],
  ],
  // 6-star pattern
  6: [
    [
      [0, -0.4],
      [-0.3, -0.15],
      [0.3, -0.15],
      [-0.3, 0.15],
      [0.3, 0.15],
      [0, 0.35],
    ],
  ],
  // 7-star pattern
  7: [
    [
      [0, -0.45],
      [-0.35, -0.2],
      [0.35, -0.2],
      [-0.4, 0.1],
      [0.4, 0.1],
      [-0.25, 0.4],
      [0.25, 0.4],
    ],
  ],
  // 8-star pattern
  8: [
    [
      [-0.4, -0.2],
      [-0.15, -0.3],
      [0.15, -0.3],
      [0.4, -0.2],
      [-0.4, 0.2],
      [-0.15, 0.3],
      [0.15, 0.3],
      [0.4, 0.2],
    ],
  ],
  // 9-star pattern
  9: [
    [
      [0, -0.45],
      [-0.2, -0.3],
      [0.2, -0.3],
      [-0.25, -0.1],
      [0.25, -0.1],
      [-0.25, 0.1],
      [0.25, 0.1],
      [-0.2, 0.3],
      [0.2, 0.3],
    ],
  ],
};

/**
 * Connection patterns - which stars connect to which (by index)
 * Each size can have multiple variants matching the pattern variants
 * Format: [starIndexA, starIndexB] means star A connects to star B
 */
export const CONNECTION_PATTERNS: {
  [key: number]: Array<Array<[number, number]>>;
} = {
  // 4-star connection patterns - two variants
  4: [
    // Variant 1: Square connections
    [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ],
    // Variant 2: L-shape connections
    [
      [0, 1],
      [0, 2],
      [2, 3],
    ],
  ],
  // 5-star connection patterns - two variants
  5: [
    // Variant 1: Diamond connections
    [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 4],
    ],
    // Variant 2: Cross connections (center connects to all arms)
    [
      [0, 2], // Top to center
      [1, 2], // Left to center
      [2, 3], // Center to right
      [2, 4], // Center to bottom
    ],
  ],
  6: [
    [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
      [1, 2],
    ],
  ],
  7: [
    [
      [0, 1],
      [0, 2],
      // [1, 3],
      [2, 4],
      [3, 5],
      [4, 6],
      [5, 6],
      [1, 4],
      [3, 4],
    ],
  ],
  8: [
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [6, 7],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ],
  ],
  9: [
    [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 6],
      [5, 7],
      [6, 8],
      [7, 8],
      [1, 2],
      [3, 4],
      [5, 6],
    ],
  ],
};
