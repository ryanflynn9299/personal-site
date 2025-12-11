/**
 * Policy Color Mapping
 * 
 * Maps each policy ID to a specific color theme from the palette.
 * Colors are applied to thematic elements (tabs, icons, links) while
 * keeping background and viewport unchanged.
 */

export type PolicyColorTheme = {
  // Tailwind color classes (must be full class names, not dynamic)
  text: string; // text-{color}-400
  textHover: string; // text-{color}-300
  bg: string; // bg-{color}-600/20
  border: string; // border-{color}-500/50
  shadow: string; // shadow-{color}-500/20
  focusRing: string; // focus:ring-{color}-500 for focus states
  icon: string; // text-{color}-400
  link: string; // text-{color}-400
  linkHover: string; // text-{color}-300 (for hover: prefix)
  codeBorder: string; // border-{color}-500/30
  blockquoteBorder: string; // border-{color}-500/50
  constellation: string; // text-{color}-400/50
  // CSS variable values for dynamic hover states
  linkColor: string; // CSS color value for links
  linkHoverColor: string; // CSS color value for link hover
};

const colorThemes: Record<string, PolicyColorTheme> = {
  "privacy-policy": {
    text: "text-sky-400",
    textHover: "text-sky-300",
    bg: "bg-sky-600/20",
    border: "border-sky-500/50",
    shadow: "shadow-sky-500/20",
    focusRing: "focus:ring-sky-500",
    icon: "text-sky-400",
    link: "text-sky-400",
    linkHover: "hover:text-sky-300",
    codeBorder: "border-sky-500/30",
    blockquoteBorder: "border-sky-500/50",
    constellation: "text-sky-400/50",
    linkColor: "#38bdf8", // sky-400
    linkHoverColor: "#7dd3fc", // sky-300
  },
  "terms-of-service": {
    text: "text-purple-400",
    textHover: "text-purple-300",
    bg: "bg-purple-600/20",
    border: "border-purple-500/50",
    shadow: "shadow-purple-500/20",
    focusRing: "focus:ring-purple-500",
    icon: "text-purple-400",
    link: "text-purple-400",
    linkHover: "hover:text-purple-300",
    codeBorder: "border-purple-500/30",
    blockquoteBorder: "border-purple-500/50",
    constellation: "text-purple-400/50",
    linkColor: "#a78bfa", // purple-400
    linkHoverColor: "#c4b5fd", // purple-300
  },
  // Future policies can use these colors:
  // rose-500, amber-400, teal-400, indigo-400, lime-400, fuchsia-500, emerald-500
};

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

