import { test, expect } from "@playwright/test";

const previewFeaturesEnabled = process.env.ENABLE_PREVIEW_FEATURES === "true";

test.describe("Project File Cabinet Page", () => {
  test.skip(
    !previewFeaturesEnabled,
    "Projects cabinet is dev-only in production; set ENABLE_PREVIEW_FEATURES=true to run these tests"
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/projects-cabinet");
  });

  test("loads the main cabinet interface", async ({ page }) => {
    // Check main heading is visible
    await expect(
      page.getByRole("heading", { name: "Project File Cabinet" })
    ).toBeVisible();

    // Verify folders are rendered
    const folders = page.locator(
      "h3:has-text('Web Development'), h3:has-text('ML/AI'), h3:has-text('Systems'), h3:has-text('Tools & Automation')"
    );
    await expect(folders.first()).toBeVisible();

    // There should be multiple items rendered
    const projectCountTxt = page.locator("p:has-text('project')").first();
    await expect(projectCountTxt).toBeVisible();
    const txt = await projectCountTxt.textContent();
    expect(txt?.trim()).toBeTruthy();
  });

  test("clicking a project paper opens the project modal", async ({ page }) => {
    // First, click a folder to expose its papers properly
    const firstFolder = page.locator("[aria-label*='folder']").first();
    await firstFolder.scrollIntoViewIfNeeded();
    await firstFolder.click({ force: true });

    // Now find the papers
    const papers = page.locator("[role='button'][aria-label$='project']");
    await expect(papers.first()).toBeVisible();

    // Click the first one without forcing, adjust scroll to compensate for sticky header
    await papers.first().scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -150));
    await papers.first().click();

    // The modal should open up with a "Close modal" button
    const closeBtn = page.getByRole("button", { name: "Close modal" });
    await expect(closeBtn).toBeVisible();
    // Verify the modal title exists
    const modalTitle = page.locator(".pointer-events-auto h2");
    await expect(modalTitle).toBeVisible();

    // Verify closing the modal
    await closeBtn.click();
    await expect(closeBtn).not.toBeVisible();
  });

  test("keyboard navigation allows interaction with project papers", async ({
    page,
  }) => {
    // First, focus and open a folder
    const firstFolder = page.locator("[aria-label*='folder']").first();
    await firstFolder.focus();
    await page.keyboard.press("Enter");

    const papers = page.locator("[role='button'][aria-label$='project']");
    await expect(papers.first()).toBeVisible();

    const firstPaper = papers.first();
    await firstPaper.focus();

    // Use Enter key to trigger the click event handler bound via `onKeyDown`
    await page.keyboard.press("Enter");

    // The modal should open
    const closeBtn = page.getByRole("button", { name: "Close modal" });
    await expect(closeBtn).toBeVisible();
  });
});
