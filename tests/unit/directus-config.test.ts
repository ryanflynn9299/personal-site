import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock logger to avoid issues with tracingChannel and console output
vi.mock("@/lib/logger", () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
  return {
    createLogger: vi.fn(() => mockLogger),
    log: mockLogger,
    prodLog: mockLogger,
    devLog: mockLogger,
    default: mockLogger,
  };
});

describe("isDirectusConfigured", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set to live-dev mode to enable service checks
    vi.stubEnv("APP_MODE", "live-dev");
    // Ensure NODE_ENV is set (not production to avoid production mode)
    vi.stubEnv("NODE_ENV", "development");
    // Reset modules to ensure env is re-evaluated with new APP_MODE
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when no environment variables are set", async () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");

    const { isDirectusConfigured } = await import("@/lib/directus");
    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns false when URLs contain placeholder values", async () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://your-directus:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "http://your-directus:8055");

    const { isDirectusConfigured } = await import("@/lib/directus");
    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns false when URLs are default placeholders", async () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://ps-directus:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "http://localhost:8055");

    const { isDirectusConfigured } = await import("@/lib/directus");
    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns false when URLs are empty strings", async () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");

    const { isDirectusConfigured } = await import("@/lib/directus");
    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns true when both URLs are properly configured", async () => {
    // Use non-placeholder URLs (not example.com which is rejected)
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

    const { isDirectusConfigured } = await import("@/lib/directus");
    expect(isDirectusConfigured()).toBe(true);
  });

  it("handles URLs with different protocols", async () => {
    // Use valid URL format (with proper hostname)
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://directus-internal:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://public.testdomain.com");

    const { isDirectusConfigured } = await import("@/lib/directus");
    expect(isDirectusConfigured()).toBe(true);
  });
});
