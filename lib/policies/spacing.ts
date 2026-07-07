/**
 * Policy viewer spacing tokens (Tailwind class strings).
 *
 * Single source of truth for `/policies` layout rhythm.
 * See `.docs/dev/POLICIES.md` § Spacing system.
 */
export const policySpacing = {
  pagePaddingY: "py-8",
  pagePaddingX: "px-4 sm:px-6 lg:px-8",

  /** Sidebar title → tab list */
  sidebarTitleToTabs: "mb-4",

  /** Document chrome header → scrollable body */
  documentHeaderToBody: "px-6 py-8",

  /** Tab rail gap (horizontal mobile / vertical desktop) */
  tabGap: "gap-2",

  /** Main two-column layout */
  layoutGap: "gap-6",

  /** Document panel inner header padding */
  documentHeaderPadding: "px-6 py-4",

  /** Metadata line under document title */
  documentMetaTop: "mt-1",
} as const;

export type PolicySpacingToken = keyof typeof policySpacing;
