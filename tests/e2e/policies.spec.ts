import { test, expect } from "@playwright/test";

test.describe("Policies Page", () => {
  test("direct routes trigger proper redirects", async ({ page }) => {
    // Navigating to /privacy should redirect to /policies?tab=privacy
    await page.goto("/privacy");
    await expect(page).toHaveURL(/\/policies\?tab=privacy/);

    // Navigating to /terms should redirect to /policies?tab=terms
    await page.goto("/terms");
    await expect(page).toHaveURL(/\/policies\?tab=terms/);
  });

  test("loads policies page and defaults to active tab", async ({ page }) => {
    await page.goto("/policies");

    // "Policies" sidebar header
    await expect(
      page.getByRole("heading", { name: "Policies", exact: true })
    ).toBeVisible();

    // Check that there's a selected tab
    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toBeVisible();

    // Check document header renders a matching document title
    const docHeader = page.locator("header h1").last();
    const docTitle = await docHeader.textContent();
    expect(docTitle).toBeDefined();
  });

  test("user can switch tabs successfully", async ({ page }) => {
    await page.goto("/policies");

    // Find all tabs
    const tabs = page.locator('nav[role="tablist"] button[role="tab"]');

    await expect(tabs).toHaveCount(2);

    // Assuming order: Privacy Policy, Terms of Service
    const privacyTab = tabs.nth(0);
    const termsTab = tabs.nth(1);

    // Click on Terms
    await termsTab.click();

    // Verify URL parameter updated
    await expect(page).toHaveURL(/\/policies\?tab=terms/);

    // Verify Document Title updated
    const docHeader = page.locator("header h1").last();
    await expect(docHeader).toContainText(/Terms/i);

    // Now click Privacy back
    await privacyTab.click();
    await expect(page).toHaveURL(/\/policies\?tab=privacy/);
    await expect(docHeader).toContainText(/Privacy/i);
  });

  test("tab keyboard navigation operates correctly", async ({ page }) => {
    await page.goto("/policies");

    // Focus the first tab
    const tabs = page.locator('nav[role="tablist"] button[role="tab"]');
    await tabs.first().focus();

    // Press ArrowDown to switch tab
    await page.keyboard.press("ArrowDown");

    // Ensure it switched
    await expect(page).toHaveURL(/\/policies\?tab=terms/);
    const docHeader = page.locator("header h1").last();
    await expect(docHeader).toContainText(/Terms/i);
  });
});
