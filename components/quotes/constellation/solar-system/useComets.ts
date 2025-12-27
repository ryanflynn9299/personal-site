import { useState, useEffect, useRef, useCallback } from "react";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import type { Comet } from "./types";
import {
  ROCKET_COLORS,
  COMET_INITIAL_COUNT,
  COMET_MAX_COUNT,
  COMET_SPAWN_CHANCE,
  COMET_SPAWN_INTERVAL,
  COMET_OFFSCREEN_MARGIN,
  COMET_SPEED_MEAN,
  COMET_SPEED_STD_DEV,
  COMET_SPEED_MIN,
  COMET_SPEED_MAX,
  COMET_ICON_TYPE_CHANCE,
  ASTEROID_SIZE_WEIGHTS,
} from "./constants";

export function useComets(
  quotes: Quote[],
  containerRef: React.RefObject<HTMLDivElement | null>,
  isZoomed: boolean,
  setCometTriggerCallback: (callback: (() => void) | null) => void
) {
  const [comets, setComets] = useState<Comet[]>([]);
  const cometIdRef = useRef(0);
  const cometsRef = useRef<Comet[]>([]);

  // Function to update comets state from ref
  const updateCometsFromRef = useCallback(() => {
    setComets([...cometsRef.current]);
  }, []);

  /**
   * Generate a random number from a normal distribution using Box-Muller transform
   * @param mean - Mean of the distribution
   * @param stdDev - Standard deviation of the distribution
   * @returns Random number from normal distribution
   */
  const generateNormalRandom = useCallback(
    (mean: number, stdDev: number): number => {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return z0 * stdDev + mean;
    },
    []
  );

  /**
   * Generate speed from normal distribution with min/max clamping
   * @returns Speed value clamped between COMET_SPEED_MIN and COMET_SPEED_MAX
   */
  const generateSpeed = useCallback((): number => {
    let speed = generateNormalRandom(COMET_SPEED_MEAN, COMET_SPEED_STD_DEV);
    // Clamp to min/max bounds
    speed = Math.max(COMET_SPEED_MIN, Math.min(COMET_SPEED_MAX, speed));
    return speed;
  }, [generateNormalRandom]);

  // Generate comet function
  const generateComet = useCallback((): Comet => {
    if (!containerRef.current) {
      return {
        id: `comet-${cometIdRef.current++}`,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        quote:
          process.env.NODE_ENV === "development"
            ? { id: "default", text: "No quotes available" }
            : null,
        iconType: "rocket" as const,
        rotation: 0,
        color: "blue",
        size: "medium" as const,
        entityCategory: "transient" as const, // Comets are transient entities
      };
    }

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Random start position on one edge of the screen
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let startX = 0;
    let startY = 0;
    let vx = 0;
    let vy = 0;

    // Generate speed from normal distribution with min/max clamping
    const speed = generateSpeed();
    const angle = Math.random() * Math.PI * 2; // Random direction

    if (side === 0) {
      // Top edge
      startX = Math.random() * width;
      startY = -20;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else if (side === 1) {
      // Right edge
      startX = width + 20;
      startY = Math.random() * height;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else if (side === 2) {
      // Bottom edge
      startX = Math.random() * width;
      startY = height + 20;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else {
      // Left edge
      startX = -20;
      startY = Math.random() * height;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    // Pick a random quote, or use default if none available (only in dev mode)
    const randomQuote =
      quotes.length > 0
        ? quotes[Math.floor(Math.random() * quotes.length)]
        : process.env.NODE_ENV === "development"
          ? { id: "default", text: "No quotes available" }
          : null; // No quote in production

    // Random icon type based on configured chance
    const iconType =
      Math.random() < COMET_ICON_TYPE_CHANCE ? "rocket" : "asteroid";

    // Calculate rotation based on velocity direction (pointing in direction of travel)
    const rotation = Math.atan2(vy, vx) * (180 / Math.PI) + 45;

    // Random color for rockets
    const color =
      iconType === "rocket"
        ? ROCKET_COLORS[Math.floor(Math.random() * ROCKET_COLORS.length)]
        : undefined;

    // Size: rockets are always large, asteroids have weighted distribution
    const size: "small" | "medium" | "large" =
      iconType === "rocket"
        ? "large"
        : (() => {
            // Weighted distribution for asteroids based on ASTEROID_SIZE_WEIGHTS
            const sizeRandom = Math.random();
            if (sizeRandom < ASTEROID_SIZE_WEIGHTS.medium) {return "medium";}
            if (
              sizeRandom <
              ASTEROID_SIZE_WEIGHTS.medium + ASTEROID_SIZE_WEIGHTS.small
            )
              {return "small";}
            return "large";
          })();

    return {
      id: `comet-${cometIdRef.current++}`,
      x: startX,
      y: startY,
      vx,
      vy,
      quote: randomQuote,
      iconType,
      rotation,
      color,
      size,
      entityCategory: "transient" as const, // Comets are transient entities
    };
  }, [quotes, containerRef, generateSpeed]);

  // Generate comets periodically
  useEffect(() => {
    if (isZoomed) {return;}

    // Generate initial comets
    const initialComets: Comet[] = [];
    for (let i = 0; i < COMET_INITIAL_COUNT; i++) {
      initialComets.push(generateComet());
    }
    setComets(initialComets);
    cometsRef.current = initialComets;

    // Generate new comets periodically
    const cometInterval = setInterval(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {return;}

      // Remove comets that are off-screen
      cometsRef.current = cometsRef.current.filter((comet) => {
        return (
          comet.x > -COMET_OFFSCREEN_MARGIN &&
          comet.x < rect.width + COMET_OFFSCREEN_MARGIN &&
          comet.y > -COMET_OFFSCREEN_MARGIN &&
          comet.y < rect.height + COMET_OFFSCREEN_MARGIN
        );
      });

      // Add a new comet occasionally
      if (
        Math.random() < COMET_SPAWN_CHANCE &&
        cometsRef.current.length < COMET_MAX_COUNT
      ) {
        cometsRef.current.push(generateComet());
      }

      updateCometsFromRef();
    }, COMET_SPAWN_INTERVAL);

    return () => clearInterval(cometInterval);
  }, [isZoomed, generateComet, updateCometsFromRef, containerRef]);

  // Register comet trigger callback
  useEffect(() => {
    const triggerComet = () => {
      if (isZoomed) {return;}
      const newComet = generateComet();
      cometsRef.current.push(newComet);
      updateCometsFromRef();
    };

    setCometTriggerCallback(() => triggerComet);
    return () => setCometTriggerCallback(null);
  }, [isZoomed, generateComet, setCometTriggerCallback, updateCometsFromRef]);

  // Animation loop for comet movement
  useEffect(() => {
    if (isZoomed) {return;}

    const animate = () => {
      // Update comet positions
      cometsRef.current = cometsRef.current.map((comet) => ({
        ...comet,
        x: comet.x + comet.vx,
        y: comet.y + comet.vy,
      }));

      updateCometsFromRef();
      requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isZoomed, updateCometsFromRef]);

  return { comets, cometsRef };
}
