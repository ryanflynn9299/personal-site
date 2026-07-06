import { describe, it, expect } from "vitest";
import {
  shouldShowVariantSection,
  hasVisibleDevControlSections,
} from "@/lib/dev-tooling/dev-controls-utils";
import { hasDevControlsForPathname } from "@/components/common/DevControls";
import {
  isPreviewOnlyPathname,
  PREVIEW_ONLY_ROUTES,
  PREVIEW_UNDER_CONSTRUCTION_ROUTE,
  PREVIEW_TRIGGER_ERROR_ROUTE,
} from "@/lib/dev-tooling/preview-routes";

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
  it("enables dev controls on public routes including home", () => {
    expect(hasDevControlsForPathname("/")).toBe(true);
    expect(hasDevControlsForPathname("/about")).toBe(true);
    expect(hasDevControlsForPathname("/blog")).toBe(true);
  });

  it("disables dev controls on admin routes", () => {
    expect(hasDevControlsForPathname("/admin/dashboard")).toBe(false);
  });
});

describe("preview-routes", () => {
  it("lists all preview-only routes", () => {
    expect(PREVIEW_ONLY_ROUTES).toContain(PREVIEW_UNDER_CONSTRUCTION_ROUTE);
    expect(PREVIEW_ONLY_ROUTES).toContain(PREVIEW_TRIGGER_ERROR_ROUTE);
  });

  it("matches preview paths including nested segments", () => {
    expect(isPreviewOnlyPathname(PREVIEW_UNDER_CONSTRUCTION_ROUTE)).toBe(true);
    expect(isPreviewOnlyPathname(PREVIEW_TRIGGER_ERROR_ROUTE)).toBe(true);
    expect(isPreviewOnlyPathname("/blog")).toBe(false);
  });
});
