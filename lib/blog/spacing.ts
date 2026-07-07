/**
 * Blog spacing tokens (Tailwind class strings).
 *
 * Single source of truth for vertical rhythm on `/blog` and post pages.
 * Grounded in Laws of UX (Proximity, Common Region, Prägnanz) — see
 * `.docs/dev/BLOG.md` § Spacing system.
 */
export const blogSpacing = {
  /** Page shell — index (`max-w-7xl`) and post (`max-w-4xl`) */
  pagePaddingY: "py-16",
  pagePaddingX: "px-4 sm:px-6 lg:px-8",

  /**
   * Law of Proximity — tight spacing inside one perceived group
   * (breadcrumb → title, title → byline, ToC label → links)
   */
  groupTight: "mt-4",
  groupStack: "gap-4",
  groupInner: "mt-2",
  groupRelated: "mt-3",
  groupSubsection: "mt-6",

  /** Law of Similarity — equal gaps between peer items (cards, grid cells) */
  peerGapLg: "gap-8",
  peerGapXl: "gap-12",

  /**
   * Law of Common Region — separate major regions on a page
   * (index intro → grid; post header block → article body when no ToC exit)
   */
  regionMajor: "mt-12",
  regionContent: "mt-8",

  /**
   * Section break — rule + padding signals a new functional region
   * (prev/next nav, pagination bar)
   */
  sectionBreak: "mt-12 border-t border-slate-700 pt-8",
  sectionBreakSoft: "border-t border-slate-800/80 pt-8",

  /** Breadcrumb trail ends before the page title */
  breadcrumbToTitle: "mb-4",

  /** ToC exit — centered rule inside fixed-height whitespace before main content */
  tocExitZone: "relative h-20 sm:h-24",
  tocExitRule:
    "absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-slate-700 to-transparent",

  /** Post-card innards */
  cardBodyPadding: "p-6",
  cardTitleToSummary: "mt-3",
  cardSummaryToMeta: "mt-6",
} as const;

export type BlogSpacingToken = keyof typeof blogSpacing;
