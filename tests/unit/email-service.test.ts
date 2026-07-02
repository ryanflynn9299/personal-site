import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@/lib/dev-tooling/logger", async () => {
  const { loggerModuleMock } = await import("../mocks/logger");
  return loggerModuleMock;
});

vi.mock("@/lib/config", async () => {
  const { createDynamicConfigMock } = await import("../mocks/config");
  return createDynamicConfigMock();
});

vi.mock("@/lib/config/server", async () => {
  const { createDynamicServerConfigMock } = await import("../mocks/config");
  return createDynamicServerConfigMock();
});

describe("isEmailServiceConfigured", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RUNTIME_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
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
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");

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
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import(
      "@/lib/services/email-service"
    );
    expect(isEmailServiceConfigured()).toBe(true);
  });
});
