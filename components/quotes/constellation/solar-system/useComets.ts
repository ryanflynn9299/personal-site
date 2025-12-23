import { useState, useEffect, useRef, useCallback } from "react";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import type { Comet } from "./types";
import { ROCKET_COLORS, COMET_INITIAL_COUNT, COMET_MAX_COUNT, COMET_SPAWN_CHANCE, COMET_SPAWN_INTERVAL } from "./constants";

export function useComets(
  quotes: Quote[],
  containerRef: React.RefObject<HTMLDivElement>,
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

  // Generate comet function
  const generateComet = useCallback((): Comet => {
    if (!containerRef.current || quotes.length === 0) {
      return {
        id: `comet-${cometIdRef.current++}`,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        quote: { id: "default", text: "" },
        iconType: "rocket" as const,
        rotation: 0,
        color: "blue",
        size: "medium" as const,
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

    const speed = 0.3 + Math.random() * 0.4; // Random speed between 0.3 and 0.7
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

    // Pick a random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Random icon type
    const iconType = Math.random() > 0.5 ? "rocket" : "asteroid";
    
    // Calculate rotation based on velocity direction (pointing in direction of travel)
    const rotation = (Math.atan2(vy, vx) * (180 / Math.PI)) + 45;
    
    // Random color for rockets
    const color = iconType === "rocket" 
      ? ROCKET_COLORS[Math.floor(Math.random() * ROCKET_COLORS.length)]
      : undefined;

    // Size: rockets are always large, asteroids have weighted distribution
    const size: "small" | "medium" | "large" = iconType === "rocket" 
      ? "large"
      : (() => {
          // Random size with weighted distribution for asteroids: medium (55%) > small (30%) > large (15%)
          const sizeRandom = Math.random();
          return sizeRandom < 0.55 ? "medium" : 
                 sizeRandom < 0.85 ? "small" : 
                 "large";
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
    };
  }, [quotes, containerRef]);

  // Generate comets periodically
  useEffect(() => {
    if (isZoomed) return;

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
      if (!rect) return;

      // Remove comets that are off-screen
      const margin = 100;
      cometsRef.current = cometsRef.current.filter((comet) => {
        return (
          comet.x > -margin &&
          comet.x < rect.width + margin &&
          comet.y > -margin &&
          comet.y < rect.height + margin
        );
      });

      // Add a new comet occasionally
      if (Math.random() < COMET_SPAWN_CHANCE && cometsRef.current.length < COMET_MAX_COUNT) {
        cometsRef.current.push(generateComet());
      }

      updateCometsFromRef();
    }, COMET_SPAWN_INTERVAL);

    return () => clearInterval(cometInterval);
  }, [isZoomed, generateComet, updateCometsFromRef]);

  // Register comet trigger callback
  useEffect(() => {
    const triggerComet = () => {
      if (isZoomed) return;
      const newComet = generateComet();
      cometsRef.current.push(newComet);
      updateCometsFromRef();
    };

    setCometTriggerCallback(() => triggerComet);
    return () => setCometTriggerCallback(null);
  }, [isZoomed, generateComet, setCometTriggerCallback, updateCometsFromRef]);

  // Animation loop for comet movement
  useEffect(() => {
    if (isZoomed) return;

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

