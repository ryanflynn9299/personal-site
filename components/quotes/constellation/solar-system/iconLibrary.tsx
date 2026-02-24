/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Icon Library Configuration
 * Curated space-themed icons from multiple high-quality icon libraries
 *
 * Based on user preferences:
 * - lucide: ALL (liked overall)
 * - react-icons: REMOVED (don't like the icons themselves)
 * - heroicons: Only stars/sparkles (for background features)
 * - tabler: planet, star, moon, satellite (kind of like, unsure)
 * - phosphor: Only planet (quite like)
 * - fontawesome: REMOVED (don't like)
 */

import { Orbit, CircleDot, Satellite, Star, Moon } from "lucide-react";

// Heroicons - Only stars/sparkles for background features
import { SparklesIcon } from "@heroicons/react/24/outline";
import { StarIcon as HeroStarIcon } from "@heroicons/react/24/solid";

// Tabler Icons - planet, star, moon, satellite (kind of like, unsure)
import {
  IconPlanet,
  IconStar,
  IconMoon,
  IconSatellite,
} from "@tabler/icons-react";

// Phosphor Icons - Only planet (quite like)
import { Planet as PhosphorPlanet } from "phosphor-react";

// Radix Icons - Clean minimal icons
import {
  CircleIcon as RadixCircleIcon,
  DotFilledIcon as RadixDotFilledIcon,
} from "@radix-ui/react-icons";

import React from "react";

/**
 * Icon library types
 */
export type IconLibrary =
  | "lucide"
  | "heroicons"
  | "tabler"
  | "phosphor"
  | "radix";

/**
 * Icon entry with library information
 */
export interface IconEntry {
  name: string;
  library: IconLibrary;
  component: React.ComponentType<any>;
  category: "celestial" | "spacecraft" | "astronomy" | "abstract";
  notes?: string; // Optional notes about user preferences
}

/**
 * Curated space-themed icons organized by library
 * Preserving user's preferred icons with notes
 */
export const ICON_LIBRARIES: Record<IconLibrary, IconEntry[]> = {
  // LIKED: Selected lucide icons (user likes lucide overall)
  lucide: [
    {
      name: "orbit",
      library: "lucide",
      component: Orbit,
      category: "astronomy",
      notes: "Liked - lucide overall",
    },
    {
      name: "planet",
      library: "lucide",
      component: CircleDot,
      category: "celestial",
      notes: "Liked - lucide overall",
    },
    {
      name: "star",
      library: "lucide",
      component: Star,
      category: "celestial",
      notes: "Dormant - reserved for future testing",
    },
    {
      name: "satellite",
      library: "lucide",
      component: Satellite,
      category: "spacecraft",
      notes: "Dormant - reserved for future testing",
    },
    {
      name: "moon",
      library: "lucide",
      component: Moon,
      category: "celestial",
      notes: "Dormant - reserved for future testing",
    },
  ],

  // LIKED: Only stars/sparkles for background features (heroicons are dull and small)
  heroicons: [
    {
      name: "star-hero",
      library: "heroicons",
      component: HeroStarIcon,
      category: "celestial",
      notes: "Liked - stars as possible background features",
    },
    {
      name: "sparkles-hero",
      library: "heroicons",
      component: SparklesIcon,
      category: "abstract",
      notes: "Liked - stars as possible background features",
    },
  ],

  // KINDA LIKE (UNSURE): planet, star, moon, satellite
  tabler: [
    {
      name: "planet-tabler",
      library: "tabler",
      component: IconPlanet,
      category: "celestial",
      notes: "Kinda like - nice planet shape, unsure",
    },
    {
      name: "star-tabler",
      library: "tabler",
      component: IconStar,
      category: "celestial",
      notes: "Kinda like - unsure",
    },
    {
      name: "moon-tabler",
      library: "tabler",
      component: IconMoon,
      category: "celestial",
      notes: "Kinda like - unsure",
    },
    {
      name: "satellite-tabler",
      library: "tabler",
      component: IconSatellite,
      category: "spacecraft",
      notes: "Kinda like - unsure",
    },
  ],

  // LIKED: Only planet (quite like phosphor's planet)
  phosphor: [
    {
      name: "planet-phosphor",
      library: "phosphor",
      component: PhosphorPlanet,
      category: "celestial",
      notes: "Liked - quite like phosphor's planet",
    },
  ],

  // KEPT: Radix Icons - Circle and dot only (dot is dormant)
  radix: [
    {
      name: "circle-radix",
      library: "radix",
      component: RadixCircleIcon,
      category: "celestial",
      notes: "Kept - clean minimal style, could work as planet",
    },
    {
      name: "dot-radix",
      library: "radix",
      component: RadixDotFilledIcon,
      category: "celestial",
      notes: "Kept (dormant) - minimal dot, could work as star/planet",
    },
  ],
};

/**
 * Get all icons from enabled libraries
 */
export function getIconsFromLibraries(
  enabledLibraries: Set<IconLibrary>
): IconEntry[] {
  const icons: IconEntry[] = [];
  for (const library of enabledLibraries) {
    if (ICON_LIBRARIES[library]) {
      icons.push(...ICON_LIBRARIES[library]);
    }
  }
  return icons;
}

/**
 * Get icon by name
 */
export function getIconByName(name: string): IconEntry | undefined {
  for (const library of Object.values(ICON_LIBRARIES)) {
    const icon = library.find((i) => i.name === name);
    if (icon) {
      return icon;
    }
  }
  return undefined;
}

/**
 * Get all available icon names
 */
export function getAllIconNames(): string[] {
  const names: string[] = [];
  for (const library of Object.values(ICON_LIBRARIES)) {
    names.push(...library.map((i) => i.name));
  }
  return names;
}
