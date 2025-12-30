import { describe, it, expect, vi } from "vitest";
import { delay } from "@/lib/delay";

describe("delay", () => {
  it("resolves immediately in test environment", async () => {
    const start = Date.now();
    await delay(500);
    const elapsed = Date.now() - start;

    // Should resolve immediately (or very quickly) in test environment
    // This makes tests much faster than waiting 500ms
    expect(elapsed).toBeLessThan(100);
  });

  it("accepts custom delay duration", async () => {
    // Even though it resolves immediately in test, it should accept the parameter
    await expect(delay(1000)).resolves.toBeUndefined();
    await expect(delay(2000)).resolves.toBeUndefined();
  });

  it("uses default delay of 500ms when no parameter provided", async () => {
    await expect(delay()).resolves.toBeUndefined();
  });

  it("returns a promise", () => {
    const result = delay(100);
    expect(result).toBeInstanceOf(Promise);
  });

  it("actually delays in non-test environment", async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalVitest = process.env.VITEST;

    // Temporarily set to production to test actual delay
    // Use vi.stubEnv which is the proper way to modify env in tests
    vi.stubEnv("NODE_ENV", "production");
    if (originalVitest) {
      vi.stubEnv("VITEST", undefined);
    }

    const start = Date.now();
    await delay(50); // Short delay for test speed
    const elapsed = Date.now() - start;

    // Should have actually delayed (with some tolerance)
    expect(elapsed).toBeGreaterThanOrEqual(45);
    expect(elapsed).toBeLessThan(200); // Should complete reasonably quickly

    // Restore environment
    vi.stubEnv("NODE_ENV", originalEnv || "test");
    if (originalVitest) {
      vi.stubEnv("VITEST", originalVitest);
    }
  });
});
