import { describe, it, expect } from "vitest";
import {
  shouldShowVariantSection,
  hasVisibleDevControlSections,
} from "@/lib/dev-tooling/dev-controls-utils";
import { hasDevControlsForPathname } from "@/components/common/DevControls";

describe("dev-controls-utils", () => {
  it("hides variant sections with one or fewer options", () => {
    expect(shouldShowVariantSection(0)).toBe(false);
    expect(shouldShowVariantSection(1)).toBe(false);
    expect(shouldShowVariantSection(2)).toBe(true);
  });

  it("detects when any dev control section is visible", () => {
    expect(hasVisibleDevControlSections([false, false])).toBe(false);
    expect(hasVisibleDevControlSections([false, true])).toBe(true);
  });
});

describe("hasDevControlsForPathname", () => {
  it("disables dev controls on home when all sections are single-option", () => {
    expect(hasDevControlsForPathname("/")).toBe(false);
  });

  it("enables dev controls on about and quotes", () => {
    expect(hasDevControlsForPathname("/about")).toBe(true);
    expect(hasDevControlsForPathname("/quotes")).toBe(true);
  });

  it("returns false for routes without dev controls", () => {
    expect(hasDevControlsForPathname("/blog")).toBe(false);
    expect(hasDevControlsForPathname("/contact")).toBe(false);
  });
});
