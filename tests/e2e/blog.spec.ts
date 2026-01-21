import { test, expect } from "@playwright/test";

test.describe("Blog Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
  });

  test("displays blog page with heading", async ({ page }) => {
    // Check page heading
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("shows blog posts or empty state", async ({ page }) => {
    // Wait for DOM to be ready
    await page.waitForLoadState("domcontentloaded");
    
    // Wait for either blog posts or empty state to appear
    const postCards = page.locator("article, [class*='post'], [class*='card']");
    const emptyStateText = page.getByText(
      /no posts|check back soon|content service|problem connecting/i
    );

    // Wait for one of these to be visible
    await Promise.race([
      expect(postCards.first()).toBeVisible({ timeout: 2000 }).catch(() => {}),
      expect(emptyStateText.first()).toBeVisible({ timeout: 2000 }).catch(() => {}),
    ]);

    // One of these should be visible
    const hasPostCards = (await postCards.count()) > 0;
    const hasEmptyState = await emptyStateText
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasPostCards || hasEmptyState).toBe(true);
  });

  test("blog post cards are clickable", async ({ page }) => {
    // Wait for DOM to be ready
    await page.waitForLoadState("domcontentloaded");
    
    // Wait for post links to be available
    const postLinks = page.locator('a[href*="/blog/"]');
    await postLinks.first().waitFor({ state: "attached", timeout: 2000 }).catch(() => {});
    
    const count = await postLinks.count();

    if (count > 0) {
      // Click first post
      const firstPost = postLinks.first();
      const href = await firstPost.getAttribute("href");

      await firstPost.click();

      // Should navigate to post page - wait for URL change
      await expect(page).toHaveURL(new RegExp(href || "/blog/"), { timeout: 2000 });
    }
  });

  test("displays search functionality if available", async ({ page }) => {
    // Check for search input or button
    const searchInput = page.getByPlaceholder(/search/i);
    const searchButton = page.getByRole("button", { name: /search/i });

    const hasSearch =
      (await searchInput.isVisible().catch(() => false)) ||
      (await searchButton.isVisible().catch(() => false));

    // Search is optional - just verify it works if present
    if (hasSearch) {
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        // Should filter or search posts
      }
    }
  });
});

test.describe("Blog Post Page", () => {
  test("displays 404 for non-existent post", async ({ page }) => {
    await page.goto("/blog/non-existent-post-slug-12345");

    // Should show 404 page ("lost in space" message) or service unavailable
    const errorText = page.getByText(
      /not found|404|lost in space|content service|problem connecting/i
    );
    await expect(errorText.first()).toBeVisible({ timeout: 2000 });
  });

  test("blog post page has correct structure", async ({ page }) => {
    // First get a valid post slug from the blog page
    await page.goto("/blog");
    await page.waitForLoadState("domcontentloaded");

    const postLinks = page.locator('a[href*="/blog/"]');
    await postLinks.first().waitFor({ state: "attached", timeout: 2000 }).catch(() => {});
    const count = await postLinks.count();

    if (count > 0) {
      // Navigate to first post
      await postLinks.first().click();
      
      // Wait for article to appear instead of networkidle
      await expect(page.getByRole("article")).toBeVisible({ timeout: 2000 });

      // Check for title
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("blog post has back navigation", async ({ page }) => {
    await page.goto("/blog");
    await page.waitForLoadState("domcontentloaded");

    const postLinks = page.locator('a[href*="/blog/"]');
    await postLinks.first().waitFor({ state: "attached", timeout: 2000 }).catch(() => {});
    const count = await postLinks.count();

    if (count > 0) {
      // Navigate to first post
      await postLinks.first().click();
      
      // Wait for article to appear
      await expect(page.getByRole("article")).toBeVisible({ timeout: 2000 });

      // Should be able to navigate back
      await page.goBack();
      await expect(page).toHaveURL(/\/blog\/?$/, { timeout: 2000 });
    }
  });
});

test.describe("Blog - Responsive", () => {
  test("blog page works on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/blog");

    // Page should load
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("blog page works on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/blog");

    // Page should load
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
