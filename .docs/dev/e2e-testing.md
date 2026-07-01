# E2E Testing Strategy

This document serves as the single source of truth for the project's End-to-End (E2E) testing practices, using [Playwright](https://playwright.dev/).

## 1. Core Principles

- **Pnpm Completion**: The `test:e2e` command must execute and exit with the appropriate status code. The `webServer` configuration in Playwright handles starting and stopping the application during test execution.
- **Zero Hard Delays**: Use Playwright's auto-waiting features.
  - **NO**: `await page.waitForTimeout(1000)`
  - **YES**: `await expect(page.locator('.element')).toBeVisible()`
- **Infrastructure over Content**: Test that components render correctly, navigation works, and services interact as expected. Avoid testing static text content that is subject to frequent changes.
- **Environment Agnostic**: Tests should not fail if `.env` variables are missing. Use service mocking (e.g., Playwright's `page.route` or MSW) to simulate service responses.

## 2. Browser Configuration

- **Local Development**: All browsers (Chromium, Firefox, Webkit) are enabled to ensure cross-browser compatibility before code is committed.
- **CI Environment**: Only **Chromium** is enabled to optimize execution time and resource usage.

## 3. Flakiness Mitigation

To root out and eliminate flaky tests, follow this process:

1.  **Repeat Each**: Use the `--repeat-each` flag to run a suspected flaky test multiple times locally.
    ```bash
    pnpm playwright test tests/e2e/contact.spec.ts --repeat-each 20
    ```
2.  **Trace Inspection**: Analyze traces generated during failures (`trace: 'on-first-retry'`). Look for timing issues, race conditions, or intermittent service failures.
3.  **Isolation**: Ensure tests are independent and do not rely on side effects from previous tests. Use `beforeEach` to set the browser state appropriately.
4.  **Retries**: In CI, we use `retries: 2` to account for transient infrastructure issues. Persistent failures across retries must be investigated as bugs.

## 4. Test Execution

- **Standard Run**: `pnpm run test:e2e`
- **Interactive Mode**: `pnpm run test:e2e:ui`
- **CI Mode Simulation**: `CI=true pnpm run test:e2e`

## 5. Production-Ready File Inventory (New Tests Needed)

The following areas are considered production-ready and require comprehensive E2E test coverage:

| Feature / Path                 | Status                                           | Priority |
| :----------------------------- | :----------------------------------------------- | :------- |
| `app/(portfolio)/blog/[slug]`  | Lacks full post interaction testing              | High     |
| `app/(portfolio)/projects`     | Lacks filters/search testing if applicable       | Medium   |
| `app/(portfolio)/contact`      | Lacks robust service failure mocking             | High     |
| `app/(portfolio)/about`        | Only basic rendering check exists                | Low      |
| `app/(admin)`                  | Lacks any E2E coverage for management interfaces | Medium   |
| `components/common/Navigation` | Responsive menu (hamburger) interaction          | High     |

## 6. Service Mocking

Service responses (e.g., from Directus) should be intercepted in tests to ensure deterministic results.

```typescript
test("intercept news service", async ({ page }) => {
  await page.route("**/api/v1/news", async (route) => {
    const json = { items: [{ id: 1, title: "Test News" }] };
    await route.fulfill({ json });
  });
  await page.goto("/news");
  await expect(page.getByText("Test News")).toBeVisible();
});
```
