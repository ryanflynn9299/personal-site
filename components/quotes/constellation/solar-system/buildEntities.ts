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
  SUN_QUOTE_PERCENTAGE,
} from "./constants";

/**
 * Extract categories and create entities
 */
export function buildEntities(quotes: Quote[]): { entities: Entity[]; sunEntity: Entity | null } {
  const categoryMap = new Map<string, Quote[]>();
  const sunQuotes: Quote[] = [];

  // Redistribute some quotes to the Sun (take ~15% of quotes, prioritizing high priority)
  const quotesForSun = Math.max(1, Math.floor(quotes.length * SUN_QUOTE_PERCENTAGE));
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    return 0;
  });

  const sunQuoteIndices = new Set<number>();
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
      const shapeTypes: Array<"ringed-planet" | "monolith" | "pyramid"> = [
        "ringed-planet",
        "monolith",
        "pyramid",
      ];
      const shape = shapeTypes[idx % shapeTypes.length];
      
      // Deterministic spacing variation: some orbits closer, some more spaced out
      const spacingMultiplier = SPACING_PATTERN[idx % SPACING_PATTERN.length];
      const cumulativeSpacing = Array.from({ length: idx }, (_, i) => 
        BASE_SPACING * SPACING_PATTERN[i % SPACING_PATTERN.length]
      ).reduce((sum, val) => sum + val, 0);
      const orbitRadius = BASE_RADIUS + cumulativeSpacing;
      
      const baseSpeed = BASE_SPEED_MIN + (idx % 3) * BASE_SPEED_VARIATION;
      // Deterministic retrograde pattern: boolean list per planet
      const isRetrograde = RETROGRADE_PATTERN[idx % RETROGRADE_PATTERN.length];
      const orbitSpeed = isRetrograde ? -baseSpeed : baseSpeed;
      const initialAngle = (idx / categoryMap.size) * Math.PI * 2;

      // Deterministic eccentricity: mild variations
      const eccentricity = ECCENTRICITY_PATTERN[idx % ECCENTRICITY_PATTERN.length];

      return {
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        category,
        quotes: quoteList,
        orbitRadius,
        orbitSpeed,
        angle: initialAngle,
        shape,
        color: ENTITY_COLORS[idx % ENTITY_COLORS.length],
        size: 12 + (quoteList.length % 5) * 3,
        eccentricity,
        spacingMultiplier,
      };
    }
  );

  // Create Sun entity if we have quotes for it
  const sunEntity: Entity | null = sunQuotes.length > 0 ? {
    id: "sun",
    name: "Sun",
    category: "sun",
    quotes: sunQuotes,
    orbitRadius: 0, // Sun is at center
    orbitSpeed: 0,
    angle: 0,
    shape: "ringed-planet", // Not used for Sun
    color: SUN_COLOR,
    size: SUN_SIZE,
    eccentricity: 0,
    spacingMultiplier: 1.0,
  } : null;

  return { entities, sunEntity };
}

