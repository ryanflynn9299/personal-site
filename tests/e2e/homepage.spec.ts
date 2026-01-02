import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads and displays main content", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Ryan Flynn/i);

    // Check hero section has a main heading
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
  });

  test("displays navigation header", async ({ page }) => {
    // Check navigation is visible
    await expect(page.getByRole("navigation")).toBeVisible();

    // Check navigation links are visible (use first() to handle duplicates in footer)
    await expect(
      page.getByRole("link", { name: /about/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /blog/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /contact/i }).first()
    ).toBeVisible();
  });

  test("displays footer with links", async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer is visible
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Check for common footer elements
    await expect(footer.getByRole("link", { name: /privacy/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /terms/i })).toBeVisible();
  });

  test("has responsive layout on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still load
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Mobile menu button should be visible (if implemented)
    // Navigation should adapt to mobile
  });

  test("has responsive layout on tablet", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Page should still load
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Also check for failed network requests
    page.on("requestfailed", (request) => {
      const url = request.url();
      const failure = request.failure();
      if (failure) {
        failedRequests.push(`${failure.errorText}: ${url}`);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known acceptable errors (e.g., favicon, analytics, 404s for optional resources, fonts)
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("favicon") &&
        !error.includes("analytics") &&
        !error.includes("matomo") &&
        !error.includes("404") &&
        !error.includes("downloadable font") &&
        !error.includes("__nextjs_font") &&
        !error.includes("geist") &&
        !error.includes("woff2")
    );

    // Filter out acceptable 404s and Next.js internal resources that may fail in test environments
    const criticalFailedRequests = failedRequests.filter(
      (failure) =>
        !failure.includes("favicon") &&
        !failure.includes("apple-touch-icon") &&
        !failure.includes("manifest") &&
        !failure.includes("robots.txt") &&
        !failure.includes("sitemap") &&
        !failure.includes("__nextjs_original-stack-frames") &&
        !failure.includes("__nextjs_font") &&
        !failure.includes("geist") &&
        !failure.includes("woff2") &&
        !failure.includes("ERR_ABORTED")
    );

    expect(criticalErrors).toHaveLength(0);
    expect(criticalFailedRequests).toHaveLength(0);
  });
});
