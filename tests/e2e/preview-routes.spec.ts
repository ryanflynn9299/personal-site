import { test, expect } from "@playwright/test";
import { PREVIEW_UNDER_CONSTRUCTION_ROUTE } from "../../lib/dev-tooling/preview-routes";

const previewFeaturesEnabled = process.env.ENABLE_PREVIEW_FEATURES === "true";

test.describe("Preview under construction page", () => {
  test.skip(
    !previewFeaturesEnabled,
    "Under construction preview is dev-only; set ENABLE_PREVIEW_FEATURES=true"
  );

  test("renders galactic dust placeholder", async ({ page }) => {
    await page.goto(PREVIEW_UNDER_CONSTRUCTION_ROUTE);

    await expect(
      page.getByRole("heading", { name: "Pardon our galactic dust" })
    ).toBeVisible();
    await expect(page.getByText(/under construction/i)).toBeVisible();
  });
});

test.describe("Preview trigger error route", () => {
  test.skip(
    !previewFeaturesEnabled,
    "Trigger error preview is dev-only; set ENABLE_PREVIEW_FEATURES=true"
  );

  test("shows error boundary, then recovers on navigation", async ({
    page,
  }) => {
    await page.goto("/preview/trigger-error");

    await expect(
      page.getByRole("heading", { name: /oops! something went wrong/i })
    ).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /oops! something went wrong/i })
    ).not.toBeVisible();
  });
});
