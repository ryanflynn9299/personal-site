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
    log: mockLogger,
    devLog: mockLogger,
  };
});

vi.mock("@/lib/dev-tooling/delay", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}));

describe("Email Service - sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RUNTIME_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");

    // Stub valid SMTP env
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should block sending in offline-dev mode", async () => {
    vi.stubEnv("RUNTIME_MODE", "offline-dev");
    vi.resetModules();
    const { sendEmail } = await import("@/lib/services/email-service");

    const result = await sendEmail({
      from: "a@b.com",
      to: "c@d.com",
      subject: "Test",
      text: "Test",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/disabled in offline-dev/);
  });

  it("should block sending if service is not configured correctly in live-dev", async () => {
    vi.stubEnv("SMTP_HOST", ""); // Break the config
    vi.resetModules();
    const { sendEmail } = await import("@/lib/services/email-service");

    const result = await sendEmail({
      from: "a@b.com",
      to: "c@d.com",
      subject: "Test",
      text: "Test",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not configured/);
  });

  it("refuses mock send when SMTP is configured in live-dev/production", async () => {
    const { sendEmail } = await import("@/lib/services/email-service");

    const result = await sendEmail({
      from: "a@b.com",
      to: "c@d.com",
      subject: "Test",
      text: "Test",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not yet implemented/);
    expect(result.messageId).toBeUndefined();
  });
});
