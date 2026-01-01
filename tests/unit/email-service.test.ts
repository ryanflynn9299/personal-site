import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("isEmailServiceConfigured", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set to live-dev mode to enable service checks
    vi.stubEnv("APP_MODE", "live-dev");
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

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false when required variables are missing", async () => {
    // Use non-placeholder host
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    // Missing SMTP_FROM and SMTP_TO

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false when variables contain placeholder values", async () => {
    vi.stubEnv("SMTP_HOST", "your-smtp-host");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "your-email@example.com");
    vi.stubEnv("SMTP_TO", "your-email@example.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false when port is invalid", async () => {
    // Use non-placeholder host
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "invalid");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false when email addresses are invalid", async () => {
    // Use non-placeholder host
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "not-an-email");
    vi.stubEnv("SMTP_TO", "also-not-an-email");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns true when all required variables are properly configured", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.gmail.com");
    vi.stubEnv("SMTP_PORT", "587");
    // Email addresses with example.com are fine (only specific placeholders are rejected)
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
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
