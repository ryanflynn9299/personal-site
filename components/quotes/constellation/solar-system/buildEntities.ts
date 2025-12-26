import type { Quote } from "@/app/(portfolio)/quotes/config";
import type { Entity } from "./types";
import {
  ENTITY_COLORS,
  BASE_RADIUS,
  BASE_SPACING,
  BASE_SPEED_MIN,
  BASE_SPEED_VARIATION,
  SPACING_PATTERN,
  RETROGRADE_PATTERN,
  ECCENTRICITY_PATTERN,
  SUN_COLOR,
  SUN_SIZE,
} from "./constants";
import { getShapeByIndex } from "./shapeUtils";

/**
 * Extract categories and create entities
 * Returns entities, a set of quote IDs that are assigned to planets/sun, and unused quotes for comets
 */
export function buildEntities(quotes: Quote[]): {
  entities: Entity[];
  sunEntity: Entity | null;
  usedQuoteIds: Set<string>; // Quote IDs assigned to planets/sun for filtering comets
  quoteBank: Quote[]; // Leftover quotes for comets/rockets
} {
  const usedQuoteIds = new Set<string>();
  const categoryMap = new Map<string, Quote[]>();
  const sunQuotes: Quote[] = [];
  const MAX_QUOTES_PER_ENTITY = 3;

  // Redistribute some quotes to the Sun (take up to 3 quotes, prioritizing high priority)
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    return 0;
  });

  const sunQuoteIndices = new Set<number>();
  const quotesForSun = Math.min(MAX_QUOTES_PER_ENTITY, sortedQuotes.length);
  for (let i = 0; i < quotesForSun && i < sortedQuotes.length; i++) {
    const originalIndex = quotes.indexOf(sortedQuotes[i]);
    sunQuoteIndices.add(originalIndex);
    sunQuotes.push(sortedQuotes[i]);
  }

  // Process remaining quotes for regular entities
  quotes.forEach((quote, idx) => {
    if (sunQuoteIndices.has(idx)) return; // Skip quotes assigned to Sun

    if (quote.tags && quote.tags.length > 0) {
      quote.tags.forEach((tag) => {
        const normalized = tag.toLowerCase();
        if (!categoryMap.has(normalized)) {
          categoryMap.set(normalized, []);
        }
        categoryMap.get(normalized)!.push(quote);
      });
    } else {
      if (!categoryMap.has("uncategorized")) {
        categoryMap.set("uncategorized", []);
      }
      categoryMap.get("uncategorized")!.push(quote);
    }
  });

  const entities: Entity[] = Array.from(categoryMap.entries()).map(
    ([category, quoteList], idx) => {
      // Limit quotes to MAX_QUOTES_PER_ENTITY per entity
      const limitedQuotes = quoteList.slice(0, MAX_QUOTES_PER_ENTITY);

      // Track quotes assigned to this planet
      limitedQuotes.forEach((quote) => usedQuoteIds.add(quote.id));

      // Get shape based on configuration (mode-aware)
      const shape = getShapeByIndex(idx);

      // Deterministic spacing variation: some orbits closer, some more spaced out
      const spacingMultiplier = SPACING_PATTERN[idx % SPACING_PATTERN.length];
      const cumulativeSpacing = Array.from(
        { length: idx },
        (_, i) => BASE_SPACING * SPACING_PATTERN[i % SPACING_PATTERN.length]
      ).reduce((sum, val) => sum + val, 0);
      const orbitRadius = BASE_RADIUS + cumulativeSpacing;

      const baseSpeed = BASE_SPEED_MIN + (idx % 3) * BASE_SPEED_VARIATION;
      // Deterministic retrograde pattern: boolean list per planet
      const isRetrograde = RETROGRADE_PATTERN[idx % RETROGRADE_PATTERN.length];
      const orbitSpeed = isRetrograde ? -baseSpeed : baseSpeed;
      const initialAngle = (idx / categoryMap.size) * Math.PI * 2;

      // Deterministic eccentricity: mild variations
      const eccentricity =
        ECCENTRICITY_PATTERN[idx % ECCENTRICITY_PATTERN.length];

      return {
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        category,
        entityCategory: "focal" as const, // Planets are focal entities
        quotes: limitedQuotes, // Use limited quotes
        orbitRadius,
        orbitSpeed,
        angle: initialAngle,
        shape,
        color: ENTITY_COLORS[idx % ENTITY_COLORS.length],
        size: 12 + (limitedQuotes.length % 5) * 3,
        eccentricity,
        spacingMultiplier,
      };
    }
  );

  // Create Sun entity if we have quotes for it (limit to MAX_QUOTES_PER_ENTITY)
  const limitedSunQuotes = sunQuotes.slice(0, MAX_QUOTES_PER_ENTITY);
  const sunEntity: Entity | null =
    limitedSunQuotes.length > 0
      ? (() => {
          // Track quotes assigned to sun
          limitedSunQuotes.forEach((quote) => usedQuoteIds.add(quote.id));

          return {
            id: "sun",
            name: "Sun",
            category: "sun",
            entityCategory: "focal" as const, // Sun is a focal entity
            quotes: limitedSunQuotes, // Use limited quotes
            orbitRadius: 0, // Sun is at center
            orbitSpeed: 0,
            angle: 0,
            shape: "ringed-planet" as const, // Not used for Sun
            color: SUN_COLOR,
            size: SUN_SIZE,
            eccentricity: 0,
            spacingMultiplier: 1.0,
          };
        })()
      : null;

  // Collect all unused quotes into a bank for comets/rockets
  const quoteBank = quotes.filter((quote) => !usedQuoteIds.has(quote.id));

  return { entities, sunEntity, usedQuoteIds, quoteBank };
}
