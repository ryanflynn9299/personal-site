/**
 * Type declarations for Vitest test environment
 *
 * This file extends the Node.js ProcessEnv interface to allow
 * environment variable manipulation in tests using Vitest's stubEnv utility.
 */

import "@vitest/globals";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Allow NODE_ENV to be set in test environment via vi.stubEnv()
      // Note: Direct assignment (process.env.NODE_ENV = "test") is not allowed
      // Use vi.stubEnv("NODE_ENV", "test") instead
      NODE_ENV?: "development" | "production" | "test";

      // Add other environment variables that may be stubbed in tests
      [key: string]: string | undefined;
    }
  }
}

export {};
