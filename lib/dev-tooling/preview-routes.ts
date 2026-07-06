/**
 * Preview-only routes — blocked in production unless ENABLE_PREVIEW_FEATURES=true.
 *
 * Single source of truth for middleware, robots, footer, and tests.
 * @see middleware.ts
 * @see .docs/dev/RELEASE_READINESS.md
 */

export const PREVIEW_QUOTES_ROUTE = "/quotes";
export const PREVIEW_PROJECTS_CABINET_ROUTE = "/projects-cabinet";
/** Dev-only harness for UnderConstructionPage — not for production feature pages. */
export const PREVIEW_UNDER_CONSTRUCTION_ROUTE = "/preview/under-construction";
/** Dev-only route that throws to exercise app/error.tsx. */
export const PREVIEW_TRIGGER_ERROR_ROUTE = "/preview/trigger-error";

export const PREVIEW_ONLY_ROUTES = [
  PREVIEW_QUOTES_ROUTE,
  PREVIEW_PROJECTS_CABINET_ROUTE,
  PREVIEW_UNDER_CONSTRUCTION_ROUTE,
  PREVIEW_TRIGGER_ERROR_ROUTE,
] as const;

export type PreviewOnlyRoute = (typeof PREVIEW_ONLY_ROUTES)[number];

export function isPreviewOnlyPathname(pathname: string): boolean {
  return PREVIEW_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
