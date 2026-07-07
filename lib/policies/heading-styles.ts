import type { PolicyColorTheme } from "@/types/policies";
import { cn } from "@/lib/utils";

export type PolicyHeadingLevel = "h1" | "h2" | "h3" | "h4";

/** One outline tier — 24px column aligned to h2 → h3 → h4 depth. */
export const POLICY_OUTLINE_STEP = "w-6 shrink-0";

/** Neutral ancestor guides (structure); accent rails stay on the heading. */
export const POLICY_OUTLINE_GUIDE =
  "border-l border-slate-600/40 border-y-0 border-r-0 border-t-0 border-b-0";

/** h4 branch column: vertical guide + horizontal tick at cap height. */
export const POLICY_OUTLINE_BRANCH = cn(
  POLICY_OUTLINE_GUIDE,
  "relative",
  "before:absolute before:left-0 before:top-[0.55em] before:h-px before:w-full before:bg-slate-600/40"
);

/** Keep accent rail on left edge only — theme.border sets color. */
const RAIL_SIDES = "border-y-0 border-r-0 border-t-0 border-b-0";

export function getPolicyHeadingWrapperClassName(
  level: Extract<PolicyHeadingLevel, "h3" | "h4">
): string {
  return cn("flex scroll-mt-28", level === "h3" ? "mt-8 mb-3" : "mt-6 mb-2");
}

/**
 * Policy heading outline:
 *
 * - h1: document title band (full width, bottom rule)
 * - h2: primary accent rail at column 0
 * - h3: one 24px guide column, then accent rail (nested under h2)
 * - h4: two guide columns (ancestor + branch tick), then accent rail —
 *       the gutter shows measured intent instead of a floating thin bar
 */
export function getPolicyHeadingClassName(
  level: PolicyHeadingLevel,
  theme: PolicyColorTheme
): string {
  switch (level) {
    case "h1":
      return cn(
        "scroll-mt-28",
        "font-heading text-3xl font-bold leading-tight text-slate-50",
        "mt-8 mb-6 pb-4",
        "border-b border-slate-600/70"
      );
    case "h2":
      return cn(
        "scroll-mt-28",
        "font-heading text-2xl font-semibold leading-snug text-slate-100",
        "mt-10 mb-4 pl-5",
        "border-l-4",
        RAIL_SIDES,
        theme.border
      );
    case "h3":
      return cn(
        "min-w-0 flex-1",
        "font-heading text-xl font-semibold leading-snug text-slate-200",
        "pl-5",
        "border-l-2",
        RAIL_SIDES,
        theme.border
      );
    case "h4":
      return cn(
        "min-w-0 flex-1",
        "font-heading text-lg font-semibold leading-snug text-slate-300",
        "pl-5",
        "border-l",
        RAIL_SIDES,
        theme.border
      );
  }
}
