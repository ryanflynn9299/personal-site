import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/dev-tooling/logger", () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
  return {
    createLogger: vi.fn(() => mockLogger),
  };
});

vi.mock("@/lib/config", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/config")>("@/lib/config");

  return {
    ...actual,
    getDirectusUrl: vi.fn(() => "https://cms.example.com"),
  };
});

describe("getAssetUrl", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when file id is missing", async () => {
    const { getAssetUrl } = await import("@/lib/services/directus/client");
    expect(getAssetUrl(null)).toBeNull();
    expect(getAssetUrl(undefined)).toBeNull();
    expect(getAssetUrl("")).toBeNull();
  });

  it("builds a public asset URL when Directus is configured", async () => {
    const { getAssetUrl } = await import("@/lib/services/directus/client");
    expect(getAssetUrl("abc-123")).toBe(
      "https://cms.example.com/assets/abc-123"
    );
  });
});
