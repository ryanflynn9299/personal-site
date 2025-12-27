/**
 * useSurgeSpawner Hook
 *
 * Manages a limited pool of concurrent Data Surge animations (max 5).
 * Periodically selects a random Active Tile as source and a random visible
 * vertex as destination, then calculates a path using A* algorithm.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { HexTile } from "./types";
import type { VertexGraph, Vertex } from "./vertexGraph";
import { findPath, pathToSVGPath } from "./pathfinding";
import {
  getVerticesNearTile,
  getVisibleVertices,
  getVerticesAwayFromActiveTiles,
} from "./vertexGraph";
import { ACTIVE_COLORS } from "./constants";

// Configuration constants
const MAX_CONCURRENT_SURGES = 5;
const SURGE_SPAWN_INTERVAL = 3000; // Spawn a new surge every 3 seconds (slower to reduce load)
const SURGE_DURATION_MIN = 1.5; // Minimum duration in seconds
const SURGE_DURATION_MAX = 3.0; // Maximum duration in seconds
const SURGE_INITIAL_DELAY = 2000; // Initial delay before first surge
const MAX_PATHFINDING_ATTEMPTS = 10; // Max attempts to find a valid path before giving up
const MIN_PATH_LENGTH = 5; // Minimum number of edges in path

export interface DataSurge {
  id: string;
  path: string; // SVG path string
  color: string; // Color inherited from source tile
  duration: number; // Animation duration in seconds
  startTime: number; // Timestamp when surge started
}

export interface UseSurgeSpawnerResult {
  surges: DataSurge[];
  triggerSurge: () => void;
}

/**
 * Custom hook that manages Data Surge animations
 */
export function useSurgeSpawner(
  activeTiles: HexTile[],
  graph: VertexGraph | null,
  viewportWidth: number,
  viewportHeight: number,
  enabled: boolean = true
): UseSurgeSpawnerResult {
  const [surges, setSurges] = useState<DataSurge[]>([]);
  const surgeIdCounter = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const isSpawningRef = useRef(false); // Prevent concurrent spawn attempts
  const activeTilesRef = useRef(activeTiles);
  const graphRef = useRef(graph);
  const destinationVerticesRef = useRef<Vertex[]>([]);

  // Helper to schedule next spawn with proper cleanup
  const scheduleNextSpawn = (callback: () => void, delay: number) => {
    if (!isMountedRef.current) {return;}
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        callback();
      }
    }, delay);
  };

  // Get visible vertices (memoized)
  const visibleVertices = useMemo(() => {
    if (!graph || viewportWidth === 0 || viewportHeight === 0) {
      return [];
    }
    return getVisibleVertices(graph, viewportWidth, viewportHeight);
  }, [graph, viewportWidth, viewportHeight]);

  // Keep refs updated
  useEffect(() => {
    activeTilesRef.current = activeTiles;
    graphRef.current = graph;
  }, [activeTiles, graph]);

  // Get vertices away from active tiles (for destinations)
  const destinationVertices = useMemo(() => {
    if (
      !graph ||
      activeTiles.length === 0 ||
      viewportWidth === 0 ||
      viewportHeight === 0
    ) {
      return [];
    }
    const awayVertices = getVerticesAwayFromActiveTiles(graph, activeTiles);
    // Filter to only visible vertices
    const filtered = awayVertices.filter((v) => {
      const padding = 100;
      return (
        v.x >= -padding &&
        v.x <= viewportWidth + padding &&
        v.y >= -padding &&
        v.y <= viewportHeight + padding
      );
    });
    destinationVerticesRef.current = filtered;
    return filtered;
  }, [graph, activeTiles, viewportWidth, viewportHeight]);

  // Cleanup function
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, []);

  // Clean up completed surges periodically
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {return;}

      setSurges((currentSurges) => {
        const now = Date.now();
        // Remove surges that have completed their animation
        // Add small buffer (100ms) to ensure animation fully completes
        const active = currentSurges.filter(
          (surge) => now - surge.startTime < surge.duration * 1000 + 100
        );
        return active;
      });
    }, 500); // Check every 500ms for smoother cleanup

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, []);

  // Spawn a single surge (extracted for reuse)
  const spawnSurge = useCallback(() => {
    // Prevent concurrent spawn attempts
    if (isSpawningRef.current || !isMountedRef.current) {
      return;
    }

    const currentGraph = graphRef.current;
    const currentActiveTiles = activeTilesRef.current;
    const currentDestinationVertices = destinationVerticesRef.current;

    if (
      !currentGraph ||
      currentActiveTiles.length === 0 ||
      currentDestinationVertices.length === 0
    ) {
      return;
    }

    isSpawningRef.current = true;

    // Use functional update to get current state
    setSurges((currentSurges) => {
      // Clean up completed surges first
      const now = Date.now();
      const activeSurges = currentSurges.filter(
        (surge) => now - surge.startTime < surge.duration * 1000 + 100
      );

      // Check if we can spawn a new surge (max concurrent limit)
      if (activeSurges.length >= MAX_CONCURRENT_SURGES) {
        isSpawningRef.current = false;
        return activeSurges;
      }

      // Select random active tile as source
      const sourceTile =
        currentActiveTiles[
          Math.floor(Math.random() * currentActiveTiles.length)
        ];
      if (!sourceTile || !sourceTile.color) {
        isSpawningRef.current = false;
        return activeSurges;
      }

      // Get vertices near the source tile (only vertices belonging to this tile)
      const sourceVertices = getVerticesNearTile(currentGraph, sourceTile);
      if (sourceVertices.length === 0) {
        isSpawningRef.current = false;
        return activeSurges;
      }

      // Select random source vertex
      const sourceVertex =
        sourceVertices[Math.floor(Math.random() * sourceVertices.length)];

      // Try to find a valid path (with retry limit to prevent infinite loops)
      let path: string[] | null = null;
      let attempts = 0;

      while (!path && attempts < MAX_PATHFINDING_ATTEMPTS) {
        // Select random destination vertex (away from active tiles)
        const destinationVertex =
          currentDestinationVertices[
            Math.floor(Math.random() * currentDestinationVertices.length)
          ];

        // Skip if source and destination are the same
        if (sourceVertex.id === destinationVertex.id) {
          attempts++;
          continue;
        }

        // Calculate path using A*
        path = findPath(currentGraph, sourceVertex.id, destinationVertex.id);

        // Validate path: must be at least MIN_PATH_LENGTH edges
        // (path length is number of vertices, so edges = vertices - 1)
        if (path && path.length >= MIN_PATH_LENGTH + 1) {
          // Convert path to SVG path string
          const svgPath = pathToSVGPath(currentGraph, path);

          // Get color from source tile
          const color = ACTIVE_COLORS[sourceTile.color];

          // Calculate duration based on path length
          const pathLength = path.length;
          const baseDuration = SURGE_DURATION_MIN;
          const lengthMultiplier = Math.min(pathLength / 15, 1); // Scale based on path length
          const duration =
            baseDuration +
            (SURGE_DURATION_MAX - baseDuration) * lengthMultiplier;

          // Create new surge
          const newSurge: DataSurge = {
            id: `surge-${surgeIdCounter.current++}`,
            path: svgPath,
            color,
            duration,
            startTime: Date.now(),
          };

          isSpawningRef.current = false;
          return [...activeSurges, newSurge];
        }

        attempts++;
      }

      // Failed to find a valid path after max attempts
      isSpawningRef.current = false;
      return activeSurges;
    });
  }, []);

  // Expose trigger function
  const triggerSurge = useCallback(() => {
    spawnSurge();
  }, [spawnSurge]);

  // Spawn new surges automatically (when enabled)
  useEffect(() => {
    if (
      !graph ||
      activeTiles.length === 0 ||
      destinationVertices.length === 0 ||
      !enabled
    ) {
      // Clear timeout if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const scheduleNext = () => {
      if (!isMountedRef.current || !enabled) {return;}
      spawnSurge();
      scheduleNextSpawn(scheduleNext, SURGE_SPAWN_INTERVAL);
    };

    // Start spawning after initial delay
    scheduleNextSpawn(scheduleNext, SURGE_INITIAL_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      isSpawningRef.current = false;
    };
  }, [
    graph,
    activeTiles,
    visibleVertices,
    enabled,
    destinationVertices,
    spawnSurge,
  ]);

  return {
    surges,
    triggerSurge,
  };
}
