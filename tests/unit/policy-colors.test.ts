import { describe, it, expect } from "vitest";
import {
  getPolicyColorTheme,
  mapTabToPolicyId,
} from "@/lib/policy-colors";

describe("getPolicyColorTheme", () => {
  it("returns privacy-policy theme for privacy-policy id", () => {
    const theme = getPolicyColorTheme("privacy-policy");
    expect(theme).toBeDefined();
    expect(theme.text).toBe("text-sky-400");
    expect(theme.icon).toBe("text-sky-400");
    expect(theme.linkColor).toBe("#38bdf8");
  });

  it("returns terms-of-service theme for terms-of-service id", () => {
    const theme = getPolicyColorTheme("terms-of-service");
    expect(theme).toBeDefined();
    expect(theme.text).toBe("text-purple-400");
    expect(theme.icon).toBe("text-purple-400");
    expect(theme.linkColor).toBe("#a78bfa");
  });

  it("returns default theme (privacy-policy) for unknown policy id", () => {
    const theme = getPolicyColorTheme("unknown-policy");
    expect(theme).toBeDefined();
    expect(theme.text).toBe("text-sky-400"); // Default to privacy-policy
  });

  it("returns theme with all required properties", () => {
    const theme = getPolicyColorTheme("privacy-policy");
    
    // Check all required theme properties exist
    expect(theme.text).toBeDefined();
    expect(theme.textHover).toBeDefined();
    expect(theme.bg).toBeDefined();
    expect(theme.border).toBeDefined();
    expect(theme.shadow).toBeDefined();
    expect(theme.focusRing).toBeDefined();
    expect(theme.icon).toBeDefined();
    expect(theme.link).toBeDefined();
    expect(theme.linkHover).toBeDefined();
    expect(theme.codeBorder).toBeDefined();
    expect(theme.blockquoteBorder).toBeDefined();
    expect(theme.constellation).toBeDefined();
    expect(theme.linkColor).toBeDefined();
    expect(theme.linkHoverColor).toBeDefined();
  });
});

describe("mapTabToPolicyId", () => {
  it("maps 'privacy' to 'privacy-policy'", () => {
    expect(mapTabToPolicyId("privacy")).toBe("privacy-policy");
  });

  it("maps 'terms' to 'terms-of-service'", () => {
    expect(mapTabToPolicyId("terms")).toBe("terms-of-service");
  });

  it("returns default 'privacy-policy' for null", () => {
    expect(mapTabToPolicyId(null)).toBe("privacy-policy");
  });

  it("returns default 'privacy-policy' for unknown tab", () => {
    expect(mapTabToPolicyId("unknown")).toBe("privacy-policy");
  });

  it("returns default 'privacy-policy' for empty string", () => {
    expect(mapTabToPolicyId("")).toBe("privacy-policy");
  });
});

