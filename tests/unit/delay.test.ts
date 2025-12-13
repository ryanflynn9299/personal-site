import { describe, it, expect } from "vitest";
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
});
