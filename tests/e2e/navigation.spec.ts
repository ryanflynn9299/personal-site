import { test, expect } from "@playwright/test";

/**
 * Navigation E2E Tests
 *
 * Validates that all site routes exist and are accessible.
 * Intentionally avoids testing page content (headings, text, etc.)
 * since those details are covered by page-specific spec files.
 *
 * This test should be one of the most reliable in the suite —
 * it only asserts on HTTP status codes and redirect destinations,
 * which are stable unless the site structure changes.
 */

// Public pages that should return 200 in production
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/vitae",
  "/blog",
  "/contact",
  "/policies",
];

// Preview-only pages blocked in production (see middleware.ts)
const PREVIEW_ONLY_ROUTES = [
  "/quotes",
  "/projects-cabinet",
  "/preview/under-construction",
  "/preview/trigger-error",
];

// Routes that should redirect (301/302/307/308) to another location
const REDIRECT_ROUTES = [
  { from: "/privacy", toPattern: /\/policies\?tab=privacy/ },
  { from: "/terms", toPattern: /\/policies\?tab=terms/ },
];

test.describe("Navigation — Route Accessibility", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} returns a successful response`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "commit" });

      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);
    });
  }

  for (const route of PREVIEW_ONLY_ROUTES) {
    test(`${route} is blocked in production (404)`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "commit" });

      expect(response).not.toBeNull();
      expect(response!.status()).toBe(404);
    });
  }
});

test.describe("Navigation — Redirects", () => {
  for (const { from, toPattern } of REDIRECT_ROUTES) {
    test(`${from} redirects correctly`, async ({ page }) => {
      const response = await page.goto(from, { waitUntil: "commit" });

      expect(response).not.toBeNull();
      // The final response after redirect should be 200
      expect(response!.status()).toBe(200);
      // URL should match the expected redirect destination
      await expect(page).toHaveURL(toPattern);
    });
  }
});

test.describe("Navigation — Invalid Routes", () => {
  test("non-existent route returns 404", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist", {
      waitUntil: "commit",
    });

    expect(response).not.toBeNull();
    expect(response!.status()).toBe(404);
  });
});
