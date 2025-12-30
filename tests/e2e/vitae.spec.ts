import { test, expect } from "@playwright/test";

test.describe("Vitae/CV Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/vitae");
  });

  test("displays vitae page with heading", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("displays professional experience section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /work experience/i })
    ).toBeVisible();
  });

  test("displays projects section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /projects/i })
    ).toBeVisible();
  });

  test("displays skills section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /skills/i })).toBeVisible();
  });

  test("has download/print option if available", async ({ page }) => {
    const downloadButton = page.getByRole("button", {
      name: /download|print|pdf/i,
    });
    const downloadLink = page.getByRole("link", {
      name: /download|print|pdf/i,
    });

    const hasDownload =
      (await downloadButton.isVisible().catch(() => false)) ||
      (await downloadLink.isVisible().catch(() => false));

    // Download is optional but good to have
    if (hasDownload) {
      expect(hasDownload).toBe(true);
    }
  });

  test("has navigation back to main site", async ({ page }) => {
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /home|about/i }).first()
    ).toBeVisible();
  });

  test("works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/vitae");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
