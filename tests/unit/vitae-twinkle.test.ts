import { describe, expect, it } from "vitest";
import { vitaeTwinkleConfig } from "@/lib/vitae/twinkle";

describe("vitaeTwinkleConfig", () => {
  it("uses longer delays in production than dev fast mode", () => {
    expect(vitaeTwinkleConfig.production.intervalMinMs).toBeGreaterThan(
      vitaeTwinkleConfig.devFast.intervalMaxMs
    );
  });

  it("keeps twinkle duration brief", () => {
    expect(vitaeTwinkleConfig.durationMs).toBeLessThanOrEqual(600);
  });
});
