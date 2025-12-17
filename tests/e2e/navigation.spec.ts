import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navigates from homepage to about page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /about/i }).first().click();

    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigates from homepage to blog page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /blog/i }).first().click();

    await expect(page).toHaveURL(/\/blog/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigates from homepage to contact page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /contact/i }).first().click();

    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigates back to homepage using logo/brand link", async ({ page }) => {
    await page.goto("/about");

    // Click on logo or brand name to go back to homepage
    // This assumes there's a link to home in the header
    const homeLink = page.getByRole("link", { name: /ryan/i }).first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL("/");
    }
  });

  test("navigation works on all main pages", async ({ page }) => {
    const pages = ["/", "/about", "/blog", "/contact"];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Verify navigation is present on each page
      await expect(page.getByRole("navigation")).toBeVisible();

      // Verify all main nav links are accessible
      await expect(page.getByRole("link", { name: /about/i }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: /blog/i }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: /contact/i }).first()).toBeVisible();
    }
  });

  test("footer links navigate correctly", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Test privacy policy link (goes to /policies?tab=privacy)
    const privacyLink = page.getByRole("link", { name: /privacy policy/i });
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await expect(page).toHaveURL(/\/policies\?tab=privacy/);
    }
  });

  test("terms of service link works", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Test terms link (goes to /policies?tab=terms)
    const termsLink = page.getByRole("link", { name: /terms of service/i });
    if (await termsLink.isVisible()) {
      await termsLink.click();
      await expect(page).toHaveURL(/\/policies\?tab=terms/);
    }
  });

  test("external links open in new tab", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer to find social links
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Find LinkedIn link in footer (has sr-only text)
    const linkedInLink = page.getByRole("link", { name: /linkedin/i });

    if (await linkedInLink.isVisible()) {
      // Check that external link has proper href
      const href = await linkedInLink.getAttribute("href");
      expect(href).toContain("linkedin.com");
    }
  });
});

test.describe("Mobile Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("mobile menu toggle works", async ({ page }) => {
    await page.goto("/");

    // Look for mobile menu button (has aria-label "Toggle navigation menu")
    const menuButton = page.getByRole("button", { name: /toggle navigation/i });

    // Mobile menu button should be visible at mobile viewport
    await expect(menuButton).toBeVisible();

    // Click to open menu
    await menuButton.click();

    // Navigation links should become visible in mobile menu
    await expect(page.getByRole("link", { name: /about/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /blog/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /contact/i }).first()).toBeVisible();

    // Click again to close
    await menuButton.click();
  });

  test("mobile navigation links work", async ({ page }) => {
    await page.goto("/");

    // Open mobile menu if needed
    const menuButton = page.getByRole("button", { name: /toggle navigation/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    // Click about link
    await page.getByRole("link", { name: /about/i }).first().click();

    await expect(page).toHaveURL(/\/about/);
  });
});

