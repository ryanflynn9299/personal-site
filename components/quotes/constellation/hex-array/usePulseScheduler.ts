import { useState, useEffect } from "react";
import { PULSE_INITIAL_DELAY, PULSE_INTERVAL } from "./pulseConstants";
import type { HexTile } from "./types";

/**
 * Custom hook that manages global pulse scheduling
 * - One pulse scheduled globally every 3 seconds across all active tiles
 * - Initial delay of 1 second before first pulse
 * - Randomly selects one active tile from all active tiles for each pulse
 * - Only one tile pulses at a time (not all tiles independently)
 */
export function usePulseScheduler(
  activeTiles: HexTile[],
  enabled: boolean = true
): string | null {
  const [pulsingTileId, setPulsingTileId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTiles.length === 0 || !enabled) {
      setPulsingTileId(null);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const scheduleNextPulse = () => {
      if (!isMounted || !enabled) return;

      // Randomly select one active tile to pulse
      const randomTile =
        activeTiles[Math.floor(Math.random() * activeTiles.length)];
      setPulsingTileId(randomTile.id);

      // Schedule next pulse in exactly 3 seconds
      timeoutId = setTimeout(scheduleNextPulse, PULSE_INTERVAL);
    };

    // Start first pulse after 1 second delay
    timeoutId = setTimeout(scheduleNextPulse, PULSE_INITIAL_DELAY);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeTiles, enabled]);

  return pulsingTileId;
}

