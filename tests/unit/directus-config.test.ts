import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock logger to avoid issues with tracingChannel and console output
vi.mock("@/lib/dev-tooling/logger", () => {
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

// Mock the config module to allow it to be dynamic for tests
vi.mock("@/lib/config", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/config")>("@/lib/config");

  const mockedConfig = {
    ...actual.config,
    get directus() {
      return {
        publicUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL,
      };
    },
    get runtimeMode() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (process.env.RUNTIME_MODE as any) || actual.config.runtimeMode;
    },
  };

  const mockedRuntime = {
    get mode() {
      return process.env.RUNTIME_MODE || "offline-dev";
    },
    get isProduction() {
      return process.env.RUNTIME_MODE === "production";
    },
    get isDevelopment() {
      return (
        process.env.RUNTIME_MODE === "live-dev" ||
        process.env.RUNTIME_MODE === "offline-dev"
      );
    },
    get isLiveDev() {
      return process.env.RUNTIME_MODE === "live-dev";
    },
    get isOfflineDev() {
      return process.env.RUNTIME_MODE === "offline-dev";
    },
    get isTest() {
      return process.env.RUNTIME_MODE === "test";
    },
    get connectToServices() {
      return (
        process.env.RUNTIME_MODE === "production" ||
        process.env.RUNTIME_MODE === "live-dev"
      );
    },
    get treatServiceErrorsAsReal() {
      return (
        process.env.RUNTIME_MODE === "production" ||
        process.env.RUNTIME_MODE === "live-dev"
      );
    },
    get previewFeatures() {
      return process.env.ENABLE_PREVIEW_FEATURES === "true";
    },
  };

  return {
    ...actual,
    config: mockedConfig,
    runtime: mockedRuntime,
    isServiceUrlConfigured: (url: string | undefined) => {
      if (!url || url.trim() === "") {
        return false;
      }
      const placeholders = [
        "your-",
        "example.com",
        "DISABLED",
        "ps-directus:8055",
        "localhost:8055",
      ];
      return !placeholders.some((p) => url.includes(p));
    },
    isDirectusConfigured: () => {
      if (!mockedRuntime.connectToServices) {
        return false;
      }
      const url = mockedConfig.directus.publicUrl;
      if (!url || url.trim() === "") {
        return false;
      }
      const placeholders = [
        "your-",
        "example.com",
        "DISABLED",
        "ps-directus:8055",
        "localhost:8055",
      ];
      return !placeholders.some((p) => url.includes(p));
    },
  };
});

describe("isDirectusConfigured", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set to live-dev mode to enable service checks
    vi.stubEnv("RUNTIME_MODE", "live-dev");
    // Ensure NODE_ENV is set (not production to avoid production mode)
    vi.stubEnv("NODE_ENV", "development");
    // Reset modules to ensure config is re-evaluated with new RUNTIME_MODE
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when no environment variables are set", async () => {
    vi.stubEnv("DIRECTUS_INTERNAL_URL", "");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");

    const { isDirectusConfigured } = await import("@/lib/services/directus");
    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns false when URLs contain placeholder values", async () => {
    vi.stubEnv("DIRECTUS_INTERNAL_URL", "http://your-directus:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "http://your-directus:8055");

    const { isDirectusConfigured } = await import("@/lib/services/directus");
    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns false when URLs are default placeholders", async () => {
    vi.stubEnv("DIRECTUS_INTERNAL_URL", "http://ps-directus:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "http://localhost:8055");

    const { isDirectusConfigured } = await import("@/lib/services/directus");
    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns false when URLs are empty strings", async () => {
    vi.stubEnv("DIRECTUS_INTERNAL_URL", "");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");

    const { isDirectusConfigured } = await import("@/lib/services/directus");
    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns true when both URLs are properly configured", async () => {
    // Use non-placeholder URLs (not example.com which is rejected)
    vi.stubEnv("DIRECTUS_INTERNAL_URL", "http://internal-directus:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

    const { isDirectusConfigured } = await import("@/lib/services/directus");
    expect(isDirectusConfigured()).toBe(true);
  });

  it("handles URLs with different protocols", async () => {
    // Use valid URL format (with proper hostname)
    vi.stubEnv("DIRECTUS_INTERNAL_URL", "http://directus-internal:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://public.testdomain.com");

    const { isDirectusConfigured } = await import("@/lib/services/directus");
    expect(isDirectusConfigured()).toBe(true);
  });
});
