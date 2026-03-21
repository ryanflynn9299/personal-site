import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock logger to avoid console output during tests
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

// Mock the config modules to allow them to be dynamic for tests
vi.mock("@/lib/config", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/config")>("@/lib/config");
  return {
    ...actual,
    config: {
      ...actual.config,
      get runtimeMode() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (process.env.RUNTIME_MODE as any) || actual.config.runtimeMode;
      },
    },
    runtime: {
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
    },
  };
});

vi.mock("@/lib/config/server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/config/server")>(
    "@/lib/config/server"
  );
  return {
    ...actual,
    serverConfig: {
      ...actual.serverConfig,
      get smtp() {
        return {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          from: process.env.SMTP_FROM,
          to: process.env.SMTP_TO,
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        };
      },
    },
  };
});

describe("isEmailServiceConfigured", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set to live-dev mode to enable service checks
    vi.stubEnv("RUNTIME_MODE", "live-dev");
    // Ensure NODE_ENV is set (not production to avoid production mode)
    vi.stubEnv("NODE_ENV", "development");
    // Reset modules to ensure env object is recreated with new env vars
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when no environment variables are set", async () => {
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_FROM", "");
    vi.stubEnv("SMTP_TO", "");

    const { isEmailServiceConfigured } = await import(
      "@/lib/services/email-service"
    );
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false when required variables are missing", async () => {
    // Use non-placeholder host
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    // Missing SMTP_FROM and SMTP_TO

    const { isEmailServiceConfigured } = await import(
      "@/lib/services/email-service"
    );
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false when variables contain placeholder values", async () => {
    vi.stubEnv("SMTP_HOST", "your-smtp-host");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "your-email@example.com");
    vi.stubEnv("SMTP_TO", "your-email@example.com");

    const { isEmailServiceConfigured } = await import(
      "@/lib/services/email-service"
    );
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false when port is invalid", async () => {
    // Use non-placeholder host
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "invalid");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import(
      "@/lib/services/email-service"
    );
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false when email addresses are invalid", async () => {
    // Use non-placeholder host
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "not-an-email");
    vi.stubEnv("SMTP_TO", "also-not-an-email");

    const { isEmailServiceConfigured } = await import(
      "@/lib/services/email-service"
    );
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns true when all required variables are properly configured", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.gmail.com");
    vi.stubEnv("SMTP_PORT", "587");
    // Email addresses with example.com are fine (only specific placeholders are rejected)
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import(
      "@/lib/services/email-service"
    );
    expect(isEmailServiceConfigured()).toBe(true);
  });

  // it("returns true even without optional authentication variables", () => {
  //   process.env.SMTP_HOST = "smtp.example.com";
  //   process.env.SMTP_PORT = "587";
  //   process.env.SMTP_FROM = "sender@example.com";
  //   process.env.SMTP_TO = "recipient@example.com";
  //   // SMTP_USER and SMTP_PASS are optional
  //
  //   expect(isEmailServiceConfigured()).toBe(true);
  // });
});
