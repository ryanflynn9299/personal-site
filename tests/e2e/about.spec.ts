import { test, expect } from "@playwright/test";

test.describe("About Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("loads main content and sections properly", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "About Me" })).toBeVisible();

    const mainArea = page.locator("main, .container").first();
    await expect(mainArea).toBeVisible();

    // The text sections use Framer Motion whileInView, so we scroll to ensure they render
    const philHeading = page.getByRole("heading", { name: "My Philosophy" });
    await philHeading.scrollIntoViewIfNeeded();
    await expect(philHeading).toBeVisible();

    // Check Project Work section
    const projHeading = page.getByRole("heading", { name: "Project Work" });
    await projHeading.scrollIntoViewIfNeeded();
    await expect(projHeading).toBeVisible();
  });

  test("renders the Core Values Grid", async ({ page }) => {
    const firstValueHeading = page
      .locator("h3.font-heading:has-text('Craftsmanship')")
      .first();
    await firstValueHeading.scrollIntoViewIfNeeded();
    await expect(firstValueHeading).toBeVisible();
  });

  test("renders the Call-to-Action section correctly", async ({ page }) => {
    // Vitae Link
    const vitaeCTA = page.getByRole("link", {
      name: /Read Vitae|View My Vitae/i,
    });
    await vitaeCTA.scrollIntoViewIfNeeded();
    await expect(vitaeCTA).toBeVisible();

    // Contact Link
    const contactCTA = page.getByRole("link", {
      name: /Contact Me|Get in Touch/i,
    });
    await contactCTA.scrollIntoViewIfNeeded();
    await expect(contactCTA).toBeVisible();
  });

  test("CTA interactions navigate users successfully", async ({ page }) => {
    const contactCTA = page.getByRole("link", {
      name: /Contact Me|Get in Touch/i,
    });
    await contactCTA.scrollIntoViewIfNeeded();
    await contactCTA.click();
    await expect(page).toHaveURL(/\/contact/);
  });
});
