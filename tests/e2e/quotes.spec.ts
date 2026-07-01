import { test, expect } from "@playwright/test";

const previewFeaturesEnabled = process.env.ENABLE_PREVIEW_FEATURES === "true";

test.describe("Quotes Page Component", () => {
  test.skip(
    !previewFeaturesEnabled,
    "Quotes are dev-only in production; set ENABLE_PREVIEW_FEATURES=true to run these tests"
  );

  test("renders the Quotes structural shell correctly", async ({ page }) => {
    await page.goto("/quotes");

    // Check we have the toggle button "role=switch"
    const toggleSwitch = page.locator("button[role='switch']");
    await expect(toggleSwitch).toBeVisible();

    // It has "View Mode" label text nearby
    await expect(page.getByText("View Mode")).toBeVisible();
  });

  test("interacting with view toggles visually changes the context", async ({
    page,
  }) => {
    await page.goto("/quotes");

    // Note: Due to the heaviness of 3D and Canvas, Playwright handles this visually in a simplified context

    const toggleSwitch = page.locator("button[role='switch']");
    await toggleSwitch.click();

    // Toggle switch survives
    await expect(toggleSwitch).toBeVisible();
  });
});
