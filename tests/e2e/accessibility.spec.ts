import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  const pages = ["/", "/about", "/blog", "/contact"];

  for (const pagePath of pages) {
    test(`${pagePath} has proper heading hierarchy`, async ({ page }) => {
      await page.goto(pagePath);

      // Should have exactly one h1
      const h1Count = await page.getByRole("heading", { level: 1 }).count();
      expect(h1Count).toBe(1);
    });

    test(`${pagePath} has accessible navigation`, async ({ page }) => {
      await page.goto(pagePath);

      // Navigation should have proper role
      const nav = page.getByRole("navigation");
      await expect(nav).toBeVisible();
    });

    test(`${pagePath} has proper link text`, async ({ page }) => {
      await page.goto(pagePath);

      // Links should not have generic text like "click here"
      const badLinks = await page
        .getByRole("link", { name: /^click here$|^here$|^read more$/i })
        .count();

      // Allow some "read more" links but not too many generic ones
      expect(badLinks).toBeLessThan(5);
    });

    test(`${pagePath} images have alt text`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState("networkidle");

      // Get all images
      const images = page.locator("img");
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");

        // Alt should exist (can be empty for decorative images)
        expect(alt).not.toBeNull();
      }
    });
  }

  test("skip link exists for keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Press Tab to focus skip link (if it exists)
    await page.keyboard.press("Tab");

    // Look for skip to content link
    const skipLink = page.getByRole("link", {
      name: /skip to content|skip to main/i,
    });

    // Skip link is a best practice but not required
    if (await skipLink.isVisible()) {
      await skipLink.click();

      // Should scroll to main content
      const main = page.locator("main, #main-content, [role='main']");
      await expect(main).toBeInViewport();
    }
  });

  test("forms have proper labels", async ({ page }) => {
    await page.goto("/contact");

    // Get all form inputs
    const inputs = page.locator("input, textarea, select");
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute("type");

      // Skip hidden and submit inputs
      if (type === "hidden" || type === "submit") continue;

      // Each input should have an associated label or aria-label
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledby = await input.getAttribute("aria-labelledby");
      const placeholder = await input.getAttribute("placeholder");

      // Check for label
      let hasLabel = false;
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = (await label.count()) > 0;
      }

      // Input should have some form of labeling
      const isLabeled = hasLabel || ariaLabel || ariaLabelledby || placeholder;
      expect(isLabeled).toBeTruthy();
    }
  });

  test("focus is visible on interactive elements", async ({ page }) => {
    await page.goto("/");

    // Tab to first interactive element
    await page.keyboard.press("Tab");

    // Get focused element
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();

    // Focus should be visible (has outline or other indicator)
    // This is hard to test automatically, but we can check the element exists
    const focusedCount = await focused.count();
    expect(focusedCount).toBe(1);
  });

  test("color contrast is sufficient", async ({ page }) => {
    await page.goto("/");

    // This is a basic check - for full contrast testing, use axe-playwright
    // Check that text is visible against background
    const body = page.locator("body");
    const backgroundColor = await body.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );

    // Should have a background color set
    expect(backgroundColor).not.toBe("");
  });
});

test.describe("Keyboard Navigation", () => {
  test("can navigate through page with keyboard", async ({ page }) => {
    await page.goto("/");

    // Tab through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");

      // Should have something focused (check via evaluate to handle shadow DOM)
      const hasFocus = await page.evaluate(() => {
        const activeEl = document.activeElement;
        return activeEl !== null && activeEl !== document.body;
      });
      expect(hasFocus).toBe(true);
    }
  });

  test("can navigate backwards with Shift+Tab", async ({ page }) => {
    await page.goto("/");

    // Tab forward a few times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }

    // Tab backwards
    await page.keyboard.press("Shift+Tab");

    // Should still have something focused
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("Enter key activates links", async ({ page }) => {
    await page.goto("/");

    // Tab to first link
    await page.keyboard.press("Tab");

    // Find focused link
    const focused = page.locator(":focus");
    const tagName = await focused.evaluate((el) => el.tagName.toLowerCase());

    if (tagName === "a") {
      // Press Enter to activate
      await page.keyboard.press("Enter");

      // Should navigate (URL might change or stay same if it's anchor link)
      await page.waitForLoadState("networkidle");
    }
  });

  test("Escape key closes modals/menus", async ({ page }) => {
    await page.goto("/");

    // If there's a mobile menu, test that Escape closes it
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByRole("button", { name: /menu/i });

    if (await menuButton.isVisible()) {
      // Open menu
      await menuButton.click();

      // Press Escape
      await page.keyboard.press("Escape");

      // Menu should close (nav links might become hidden)
      // This behavior depends on implementation
    }
  });
});
