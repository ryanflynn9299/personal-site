import { defineConfig, devices } from "@playwright/test";
import { mkdirSync } from "fs";
import { join } from "path";

// Ensure output directory exists
const outputDir = join(process.cwd(), "output");
try {
  mkdirSync(outputDir, { recursive: true });
} catch (error) {
  // Directory might already exist, ignore
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "output/playwright-report" }], ["list"]],
  outputDir: "output/test-results",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    // Use wrapper script to filter non-critical ECONNRESET errors
    command: "node scripts/dev-server-e2e.js",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for server to start
    stdout: "ignore", // Suppress stdout to reduce noise
    stderr: "pipe", // Keep stderr for actual errors (filtered by wrapper script)
    env: {
      // Suppress noisy warnings during E2E tests
      PLAYWRIGHT_TEST_BASE_URL: "http://localhost:3000",
      // Hide DevControls in e2e tests (server-side)
      PLAYWRIGHT_TEST: "true",
      // Hide DevControls in e2e tests (client-side - NEXT_PUBLIC_ prefix required)
      NEXT_PUBLIC_PLAYWRIGHT_TEST: "true",
    },
  },
});
