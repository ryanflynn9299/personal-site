"use client";

import { useEffect, useState } from "react";
import { useDevControlsStore } from "@/components/common/store/useDevControlsStore";
import {
  getVitaeTwinkleDelayMs,
  vitaeTwinkleConfig,
} from "@/lib/vitae/twinkle";

/**
 * Picks one random timeline bullet to twinkle on an irregular schedule.
 * Respects prefers-reduced-motion. Fast mode comes from dev controls.
 */
export function useVitaeTwinkle(bulletCount: number) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const vitaeTwinkleFastMode = useDevControlsStore(
    (state) => state.vitaeTwinkleFastMode
  );

  useEffect(() => {
    if (bulletCount <= 0) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      return;
    }

    let cancelled = false;
    let waitTimeoutId: ReturnType<typeof setTimeout>;
    let resetTimeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delay = getVitaeTwinkleDelayMs(vitaeTwinkleFastMode);

      waitTimeoutId = setTimeout(() => {
        if (cancelled) {
          return;
        }

        setActiveIndex(Math.floor(Math.random() * bulletCount));

        resetTimeoutId = setTimeout(() => {
          if (cancelled) {
            return;
          }

          setActiveIndex(null);
          scheduleNext();
        }, vitaeTwinkleConfig.durationMs);
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      clearTimeout(waitTimeoutId);
      clearTimeout(resetTimeoutId);
    };
  }, [bulletCount, vitaeTwinkleFastMode]);

  return activeIndex;
}
