import type { AuthorProfile } from "@/types";

/** Hero copy — keep in sync with `components/sections/HeroSection.tsx` */
export const RYAN_HERO_BIO_SHORT =
  "Software engineer specializing in backend development, passionate about creating performant, accessible, and maximally usable applications.";

/**
 * Phase 0 author registry until Directus `authors` collection ships.
 * Keyed by slug.
 */
export const authorProfiles: Record<string, AuthorProfile> = {
  "ryan-flynn": {
    id: "ryan-flynn",
    slug: "ryan-flynn",
    first_name: "Ryan",
    last_name: "Flynn",
    emoji: "🪐",
    accent: "violet",
    role: "Software Engineer",
    bio_short: RYAN_HERO_BIO_SHORT,
  },
  gemini: {
    id: "gemini",
    slug: "gemini",
    first_name: "Gemini",
    last_name: "",
    emoji: "🤖",
    bio_short: "AI writing assistant.",
  },
};
