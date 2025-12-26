import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { incrementCounter } from "@/app/actions/counter";

describe("incrementCounter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a number between 1000 and 9999", async () => {
    const promise = incrementCounter();
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeGreaterThanOrEqual(1000);
    expect(result).toBeLessThan(10000);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("simulates delay before returning", async () => {
    const promise = incrementCounter();

    // Advance timers to trigger the delay
    await vi.advanceTimersByTimeAsync(300);
    const result = await promise;

    expect(result).toBeGreaterThanOrEqual(1000);
    expect(result).toBeLessThan(10000);
  });

  it("returns different values on multiple calls", async () => {
    const promise1 = incrementCounter();
    const promise2 = incrementCounter();
    const promise3 = incrementCounter();

    await vi.runAllTimersAsync();

    const results = await Promise.all([promise1, promise2, promise3]);

    // At least one should be different (very high probability)
    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBeGreaterThan(1);
  });
});
