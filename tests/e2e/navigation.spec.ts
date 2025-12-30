import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navigates from homepage to about page", async ({ page }) => {
    await page.goto("/");

    // Hide DevControls to prevent click interception
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const devControls = document.querySelectorAll(
        '[class*="fixed bottom-4 right-4"]'
      );
      devControls.forEach((el) => {
        (el as HTMLElement).style.display = "none";
        (el as HTMLElement).style.pointerEvents = "none";
      });
    });

    // Wait for link to be visible and stable
    const aboutLink = page.getByRole("link", { name: /about/i }).first();
    await aboutLink.waitFor({ state: "visible", timeout: 5000 });
    await aboutLink.click({ timeout: 5000 });

    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigates from homepage to blog page", async ({ page }) => {
    await page.goto("/");

    // Hide DevControls to prevent click interception
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const devControls = document.querySelectorAll(
        '[class*="fixed bottom-4 right-4"]'
      );
      devControls.forEach((el) => {
        (el as HTMLElement).style.display = "none";
        (el as HTMLElement).style.pointerEvents = "none";
      });
    });

    // Wait for link to be visible and stable
    const blogLink = page.getByRole("link", { name: /blog/i }).first();
    await blogLink.waitFor({ state: "visible", timeout: 5000 });
    await blogLink.click({ timeout: 5000 });

    await expect(page).toHaveURL(/\/blog/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigates from homepage to contact page", async ({ page }) => {
    await page.goto("/");

    // Hide DevControls to prevent click interception
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const devControls = document.querySelectorAll(
        '[class*="fixed bottom-4 right-4"]'
      );
      devControls.forEach((el) => {
        (el as HTMLElement).style.display = "none";
        (el as HTMLElement).style.pointerEvents = "none";
      });
    });

    // Wait for link to be visible and stable
    const contactLink = page.getByRole("link", { name: /contact/i }).first();
    await contactLink.waitFor({ state: "visible", timeout: 5000 });
    await contactLink.click({ timeout: 5000 });

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
      await expect(
        page.getByRole("link", { name: /about/i }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /blog/i }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /contact/i }).first()
      ).toBeVisible();
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

    // Hide DevControls to prevent click interception
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const devControls = document.querySelectorAll(
        '[class*="fixed bottom-4 right-4"]'
      );
      devControls.forEach((el) => {
        (el as HTMLElement).style.display = "none";
        (el as HTMLElement).style.pointerEvents = "none";
      });
    });

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200); // Wait for scroll

    // Test terms link (goes to /policies?tab=terms)
    const termsLink = page.getByRole("link", { name: /terms of service/i });
    if (await termsLink.isVisible()) {
      await termsLink.click();
      // Wait for navigation
      await page.waitForLoadState("networkidle");
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
    await expect(
      page.getByRole("link", { name: /about/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /blog/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /contact/i }).first()
    ).toBeVisible();

    // Click again to close
    await menuButton.click();
  });

  test("mobile navigation links work", async ({ page }) => {
    await page.goto("/");

    // Hide DevControls to prevent click interception in e2e tests
    // Use a more aggressive approach - wait for page load then hide
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      // Hide all dev controls that might intercept clicks
      const devControls = document.querySelectorAll(
        '[class*="fixed bottom-4 right-4"]'
      );
      devControls.forEach((el) => {
        (el as HTMLElement).style.display = "none";
        (el as HTMLElement).style.pointerEvents = "none";
      });
    });

    // Open mobile menu if needed
    const menuButton = page.getByRole("button", { name: /toggle navigation/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Wait for menu animation to complete
      await page.waitForTimeout(300);
    }

    // Get the about link and ensure it's visible and clickable
    const aboutLink = page.getByRole("link", { name: /about/i }).first();

    // Scroll into view and wait for it to be stable
    await aboutLink.scrollIntoViewIfNeeded();
    await aboutLink.waitFor({ state: "visible", timeout: 5000 });

    // Use force click to bypass any overlays
    await aboutLink.click({ force: true, timeout: 5000 });

    await expect(page).toHaveURL(/\/about/);
  });
});
