import { describe, it, expect } from "vitest";
import packageJson from "../../package.json";
import {
  SITE_VERSION,
  isPreRelease,
  isStableRelease,
  parseVersion,
} from "@/lib/site/version";

describe("SITE_VERSION", () => {
  it("matches package.json version", () => {
    expect(SITE_VERSION).toBe(packageJson.version);
  });

  it("is pre-1.0 under current policy", () => {
    expect(isPreRelease()).toBe(true);
    expect(isStableRelease()).toBe(false);
  });
});

describe("parseVersion", () => {
  it("parses standard semver", () => {
    expect(parseVersion("0.2.0")).toEqual({
      major: 0,
      minor: 2,
      patch: 0,
      prerelease: undefined,
    });
  });

  it("parses prerelease suffix", () => {
    expect(parseVersion("1.0.0-rc.1").prerelease).toBe("rc.1");
  });

  it("throws on invalid version", () => {
    expect(() => parseVersion("not-a-version")).toThrow(/Invalid semver/);
  });
});

describe("isStableRelease", () => {
  it("returns true for 1.0.0", () => {
    expect(isStableRelease("1.0.0")).toBe(true);
  });

  it("returns false for 0.x", () => {
    expect(isStableRelease("0.9.9")).toBe(false);
  });
});
