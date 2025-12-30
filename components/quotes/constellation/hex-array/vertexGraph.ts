/**
 * Vertex Graph System for Data Surge Animation
 *
 * Constructs a navigable graph of vertices and edges from hexagon corners.
 * Treats the narrow gaps between hexagons as navigable paths.
 *
 * Key principle: Only connect vertices that are adjacent along actual hexagon edges
 * or shared between neighboring hexagons. Never create edges that cross through tiles.
 */

import type { HexTile } from "./types";

// Hexagon geometry constants (must match HexArrayView)
const HEX_SIZE = 40;
const HEX_WIDTH = HEX_SIZE * Math.sqrt(3);
const HEX_HEIGHT = HEX_SIZE * 1.5;
const GAP = 2;

/**
 * Represents a vertex (corner point) in the graph
 */
export interface Vertex {
  id: string;
  x: number;
  y: number;
  // Tiles that share this vertex (for debugging/visualization)
  tileIds: Set<string>;
}

/**
 * Represents an edge (connection) between two vertices
 */
export interface Edge {
  from: string; // Vertex ID
  to: string; // Vertex ID
  distance: number; // Euclidean distance
}

/**
 * Complete vertex graph structure
 */
export interface VertexGraph {
  vertices: Map<string, Vertex>;
  edges: Map<string, Edge[]>; // Map from vertex ID to array of edges
  activeTileIds: Set<string>; // Set of active tile IDs for filtering paths
}

/**
 * Calculate the 6 corner positions for a flat-top hexagon
 * Returns corners in order: top, top-right, bottom-right, bottom, bottom-left, top-left
 */
function getHexCorners(
  centerX: number,
  centerY: number,
  size: number
): Array<{ x: number; y: number }> {
  const corners: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // Rotate for flat-top
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    corners.push({ x, y });
  }
  return corners;
}

/**
 * Generate a unique vertex ID from coordinates
 * Uses rounding to handle floating-point precision issues
 */
function getVertexId(x: number, y: number): string {
  // Round to 1 decimal place to handle floating-point precision
  const roundedX = Math.round(x * 10) / 10;
  const roundedY = Math.round(y * 10) / 10;
  return `v_${roundedX}_${roundedY}`;
}

/**
 * Calculate distance between two vertices
 */
function vertexDistance(v1: Vertex, v2: Vertex): number {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two hexagons are neighbors in a flat-top hex grid
 */
function _areHexNeighbors(t1: HexTile, t2: HexTile): boolean {
  const dx = t2.x - t1.x;
  const dy = t2.y - t1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // In a flat-top hex grid, neighbors are at specific distances:
  // - Horizontal neighbors: HEX_WIDTH apart
  // - Diagonal neighbors: sqrt(HEX_WIDTH^2 + HEX_HEIGHT^2) apart
  // - Vertical neighbors: HEX_HEIGHT apart (but offset)
  const neighborDistance = Math.max(HEX_WIDTH, HEX_HEIGHT) * 1.05; // 5% tolerance

  return distance < neighborDistance && distance > 0.1; // Exclude same tile
}

/**
 * Build the vertex graph from hexagon tiles
 *
 * Strategy:
 * 1. Collect all hexagon corners and deduplicate shared corners
 * 2. Connect adjacent corners within each hexagon (forming perimeter)
 * 3. Shared vertices are automatically connected through their hexagon perimeters
 *
 * CRITICAL: We do NOT create edges between non-adjacent vertices from neighboring hexagons.
 * This prevents paths from crossing through tiles.
 */
export function buildVertexGraph(tiles: HexTile[]): VertexGraph {
  const vertices = new Map<string, Vertex>();
  const edges = new Map<string, Edge[]>();

  // Step 1: Collect all corners from all hexagons and deduplicate
  // Use the actual hex size (HEX_SIZE - GAP) for corner positions
  const actualHexSize = HEX_SIZE - GAP;

  for (const tile of tiles) {
    const corners = getHexCorners(tile.x, tile.y, actualHexSize);

    for (const corner of corners) {
      const vertexId = getVertexId(corner.x, corner.y);

      if (!vertices.has(vertexId)) {
        vertices.set(vertexId, {
          id: vertexId,
          x: corner.x,
          y: corner.y,
          tileIds: new Set([tile.id]),
        });
      } else {
        // This corner is shared with another hexagon (neighbors share corners)
        const vertex = vertices.get(vertexId)!;
        vertex.tileIds.add(tile.id);
      }
    }
  }

  // Step 2: Create edges ONLY along hexagon perimeters
  // This connects adjacent corners within each hexagon.
  // Shared vertices are automatically connected through their hexagon perimeters.

  for (const tile of tiles) {
    const corners = getHexCorners(tile.x, tile.y, actualHexSize);
    const cornerVertexIds: string[] = [];

    // Get vertex IDs for this hexagon's corners
    for (const corner of corners) {
      const vertexId = getVertexId(corner.x, corner.y);
      cornerVertexIds.push(vertexId);
    }

    // Connect corners in order (forming hexagon perimeter)
    // Create bidirectional edges for proper pathfinding
    for (let i = 0; i < cornerVertexIds.length; i++) {
      const v1Id = cornerVertexIds[i];
      const v2Id = cornerVertexIds[(i + 1) % cornerVertexIds.length];

      // Skip if vertices don't exist (shouldn't happen, but safety check)
      const v1 = vertices.get(v1Id);
      const v2 = vertices.get(v2Id);
      if (!v1 || !v2) {
        continue;
      }

      const distance = vertexDistance(v1, v2);

      // Add forward edge
      if (!edges.has(v1Id)) {
        edges.set(v1Id, []);
      }
      const v1Edges = edges.get(v1Id)!;
      // Check if edge already exists (might happen for shared vertices)
      if (!v1Edges.some((e) => e.to === v2Id)) {
        v1Edges.push({
          from: v1Id,
          to: v2Id,
          distance,
        });
      }

      // Add reverse edge for bidirectional navigation
      if (!edges.has(v2Id)) {
        edges.set(v2Id, []);
      }
      const v2Edges = edges.get(v2Id)!;
      if (!v2Edges.some((e) => e.to === v1Id)) {
        v2Edges.push({
          from: v2Id,
          to: v1Id,
          distance,
        });
      }
    }
  }

  // That's it! We don't create additional edges between neighboring hexagons
  // because shared vertices are already connected through their hexagon perimeters.
  // This ensures paths only travel along the gutters (hexagon edges), never through tiles.

  // Track which tiles are active
  const activeTileIds = new Set<string>();
  for (const tile of tiles) {
    if (tile.isActive) {
      activeTileIds.add(tile.id);
    }
  }

  return { vertices, edges, activeTileIds };
}

/**
 * Get all vertices that are visible within the viewport
 */
export function getVisibleVertices(
  graph: VertexGraph,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 100
): Vertex[] {
  const visible: Vertex[] = [];

  for (const vertex of graph.vertices.values()) {
    if (
      vertex.x >= -padding &&
      vertex.x <= viewportWidth + padding &&
      vertex.y >= -padding &&
      vertex.y <= viewportHeight + padding
    ) {
      visible.push(vertex);
    }
  }

  return visible;
}

/**
 * Get vertices near a specific tile (for finding source vertices)
 * Only returns vertices that actually belong to this tile
 */
export function getVerticesNearTile(
  graph: VertexGraph,
  tile: HexTile,
  radius: number = HEX_SIZE * 1.5
): Vertex[] {
  const nearby: Vertex[] = [];

  for (const vertex of graph.vertices.values()) {
    // Only consider vertices that belong to this tile
    if (!vertex.tileIds.has(tile.id)) {
      continue;
    }

    const dx = vertex.x - tile.x;
    const dy = vertex.y - tile.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      nearby.push(vertex);
    }
  }

  return nearby;
}

/**
 * Check if a vertex belongs to any active tile
 */
export function isVertexInActiveTile(
  graph: VertexGraph,
  vertexId: string
): boolean {
  const vertex = graph.vertices.get(vertexId);
  if (!vertex) {
    return false;
  }

  for (const tileId of vertex.tileIds) {
    if (graph.activeTileIds.has(tileId)) {
      return true;
    }
  }

  return false;
}

/**
 * Get vertices that are NOT near any active tiles (for finding destinations)
 */
export function getVerticesAwayFromActiveTiles(
  graph: VertexGraph,
  activeTiles: HexTile[],
  minDistance: number = HEX_SIZE * 3
): Vertex[] {
  const awayVertices: Vertex[] = [];

  for (const vertex of graph.vertices.values()) {
    // Check if vertex belongs to any active tile
    let isNearActive = false;
    for (const tileId of vertex.tileIds) {
      if (graph.activeTileIds.has(tileId)) {
        isNearActive = true;
        break;
      }
    }

    if (isNearActive) {
      continue;
    }

    // Check distance from all active tiles
    let minDistToActive = Infinity;
    for (const activeTile of activeTiles) {
      const dx = vertex.x - activeTile.x;
      const dy = vertex.y - activeTile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      minDistToActive = Math.min(minDistToActive, distance);
    }

    if (minDistToActive >= minDistance) {
      awayVertices.push(vertex);
    }
  }

  return awayVertices;
}
