import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { mkdirSync } from "fs";
import { join } from "path";

// Ensure output directory exists
const outputDir = join(process.cwd(), "output");
try {
  mkdirSync(outputDir, { recursive: true });
} catch (error) {
  // Directory might already exist, ignore
}

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.tsx"],
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", ".next", "out", "tests/e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "output/coverage",
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/**",
        ".next/**",
        "tests/e2e/**",
        "playwright.config.ts",
        "vitest.config.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
