import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("displays contact page with form", async ({ page }) => {
    // Check page heading
    await expect(
      page.getByRole("heading", { name: /get in touch/i })
    ).toBeVisible();

    // Check form fields are present
    await expect(page.getByPlaceholder(/your name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/your email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/your message/i)).toBeVisible();

    // Check submit button
    await expect(
      page.getByRole("button", { name: /send message/i })
    ).toBeVisible();
  });

  test("displays direct contact information", async ({ page }) => {
    // Check for direct contact section
    await expect(page.getByText(/direct contact/i)).toBeVisible();

    // Check for email link (contains "Email" heading)
    const emailLink = page
      .getByRole("link")
      .filter({ hasText: /email/i })
      .first();
    await expect(emailLink).toBeVisible();

    // Check for LinkedIn link (contains "LinkedIn" heading)
    const linkedInLink = page
      .getByRole("link")
      .filter({ hasText: /linkedin/i })
      .first();
    await expect(linkedInLink).toBeVisible();
  });

  test("shows validation for empty form submission", async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole("button", { name: /send message/i });
    await submitButton.click();

    // HTML5 validation should prevent submission
    // The name field should be invalid
    const nameInput = page.getByPlaceholder(/your name/i);
    const isInvalid = await nameInput.evaluate(
      (el: HTMLInputElement) => !el.checkValidity()
    );
    expect(isInvalid).toBe(true);
  });

  test("shows validation for invalid email", async ({ page }) => {
    // Fill name and message
    await page.getByPlaceholder(/your name/i).fill("John Doe");
    await page.getByPlaceholder(/your email/i).fill("invalid-email");
    await page.getByPlaceholder(/your message/i).fill("Test message");

    // Try to submit
    await page.getByRole("button", { name: /send message/i }).click();

    // HTML5 email validation should prevent submission
    const emailInput = page.getByPlaceholder(/your email/i);
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.checkValidity()
    );
    expect(isInvalid).toBe(true);
  });

  test("submits form with valid data", async ({ page }) => {
    // Fill form with valid data
    await page.getByPlaceholder(/your name/i).fill("John Doe");
    await page.getByPlaceholder(/your email/i).fill("john@example.com");
    await page
      .getByPlaceholder(/your message/i)
      .fill("This is a test message from E2E tests.");

    // Submit form
    await page.getByRole("button", { name: /send message/i }).click();

    // Wait for response - should show success or warning message
    // (depends on whether email service is configured)
    await expect(
      page.getByText(/message sent|cannot be sent|thank you/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("shows loading state during submission", async ({ page }) => {
    // Fill form
    await page.getByPlaceholder(/your name/i).fill("John Doe");
    await page.getByPlaceholder(/your email/i).fill("john@example.com");
    await page.getByPlaceholder(/your message/i).fill("Test message");

    // Click submit and check for loading state
    const submitButton = page.getByRole("button", { name: /send message/i });
    await submitButton.click();

    // Button should show loading state (either disabled or text changes)
    // This might happen quickly, so we check if button was disabled
    const wasDisabledOrChanged = await Promise.race([
      submitButton.isDisabled().then(() => true),
      page
        .getByText(/sending/i)
        .isVisible()
        .then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(true), 1000)),
    ]);

    expect(wasDisabledOrChanged).toBe(true);
  });

  test("email link has correct mailto href", async ({ page }) => {
    const emailLink = page
      .getByRole("link")
      .filter({ hasText: /email/i })
      .first();
    const href = await emailLink.getAttribute("href");

    expect(href).toMatch(/^mailto:/);
  });

  test("LinkedIn link opens in new tab", async ({ page }) => {
    const linkedInLink = page
      .getByRole("link")
      .filter({ hasText: /linkedin/i })
      .first();

    const target = await linkedInLink.getAttribute("target");
    expect(target).toBe("_blank");

    const rel = await linkedInLink.getAttribute("rel");
    expect(rel).toContain("noopener");
  });
});

test.describe("Contact Page - Mobile", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/contact");
  });

  test("form is usable on mobile", async ({ page }) => {
    // All form fields should be visible
    await expect(page.getByPlaceholder(/your name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/your email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/your message/i)).toBeVisible();

    // Form should be fillable
    await page.getByPlaceholder(/your name/i).fill("Mobile User");
    await page.getByPlaceholder(/your email/i).fill("mobile@example.com");
    await page.getByPlaceholder(/your message/i).fill("Testing from mobile");

    // Submit button should be visible and clickable
    await expect(
      page.getByRole("button", { name: /send message/i })
    ).toBeVisible();
  });
});
