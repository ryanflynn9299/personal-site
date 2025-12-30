/**
 * Policy Color Mapping
 *
 * Maps each policy ID to a specific color theme from the palette.
 * Colors are applied to thematic elements (tabs, icons, links) while
 * keeping background and viewport unchanged.
 */

import type { PolicyColorTheme } from "@/types/policies";
import { colorThemes } from "@/data/policy-colors";

/**
 * Get color theme for a policy ID
 * @param policyId - The policy ID (e.g., "privacy-policy")
 * @returns Color theme object with Tailwind classes
 */
export function getPolicyColorTheme(policyId: string): PolicyColorTheme {
  return colorThemes[policyId] || colorThemes["privacy-policy"]; // Default to blue
}

/**
 * Map tab query parameter to policy ID
 * @param tabParam - Query parameter value (e.g., "privacy")
 * @returns Policy ID (e.g., "privacy-policy")
 */
export function mapTabToPolicyId(tabParam: string | null): string {
  const mapping: Record<string, string> = {
    privacy: "privacy-policy",
    terms: "terms-of-service",
  };

  return mapping[tabParam || ""] || "privacy-policy"; // Default to first policy
}
