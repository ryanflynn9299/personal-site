import { test, expect } from "@playwright/test";

test.describe("Error Pages", () => {
  test("displays 404 page for non-existent routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-12345");

    // Should show 404 message
    await expect(
      page.getByText(/not found|404|page doesn't exist/i)
    ).toBeVisible();
  });

  test("404 page has navigation back to home", async ({ page }) => {
    await page.goto("/non-existent-page");

    // Should have a way to get back to home ("Return to Home Base" button)
    const homeLink = page.getByRole("link", {
      name: /return to home|home base/i,
    });

    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL("/");
  });

  test("404 page maintains site styling", async ({ page }) => {
    await page.goto("/non-existent-page");

    // Header should still be visible
    await expect(page.getByRole("navigation")).toBeVisible();

    // Footer should still be visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("deeply nested non-existent route shows 404", async ({ page }) => {
    await page.goto("/this/is/a/deeply/nested/non-existent/route");

    // Should show 404 message
    await expect(
      page.getByText(/not found|404|page doesn't exist/i)
    ).toBeVisible();
  });
});

test.describe("Policy Pages", () => {
  test("privacy policy page loads (redirects to /policies)", async ({
    page,
  }) => {
    await page.goto("/privacy");

    // Should redirect to /policies?tab=privacy
    await expect(page).toHaveURL(/\/policies\?tab=privacy/);
    // Page should have loaded with privacy policy content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("terms of service page loads (redirects to /policies)", async ({
    page,
  }) => {
    await page.goto("/terms");

    // Should redirect to /policies?tab=terms
    await expect(page).toHaveURL(/\/policies\?tab=terms/);
    // Page should have loaded with terms content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("policies page loads directly", async ({ page }) => {
    await page.goto("/policies");

    // Should show policy content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("About Page", () => {
  test("about page loads correctly", async ({ page }) => {
    await page.goto("/about");

    // Should have heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("about page has content", async ({ page }) => {
    await page.goto("/about");

    // Should have some content
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Content should not be empty
    const textContent = await mainContent.textContent();
    expect(textContent?.length).toBeGreaterThan(100);
  });
});

test.describe("Vitae/CV Page", () => {
  test("vitae page loads if it exists", async ({ page }) => {
    const response = await page.goto("/vitae");

    // Page might exist or redirect
    if (response?.status() === 200) {
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    } else if (response?.status() === 404) {
      // 404 is acceptable if page doesn't exist
      await expect(page.getByText(/not found|404/i)).toBeVisible();
    }
  });
});
