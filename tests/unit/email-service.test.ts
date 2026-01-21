import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => mockLogger),
  log: mockLogger,
  prodLog: mockLogger,
  devLog: mockLogger,
  default: mockLogger,
}));

// Mock delay to avoid actual delays in tests
const mockDelay = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/delay", () => ({
  delay: mockDelay,
}));

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

  it("returns true even without optional authentication variables", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");
    // SMTP_USER and SMTP_PASS are optional

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(true);
  });

  it("returns false in test mode (services disabled)", async () => {
    vi.stubEnv("APP_MODE", "test");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false in offline-dev mode (services disabled)", async () => {
    vi.stubEnv("APP_MODE", "offline-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("returns false in production when not configured and logs error", async () => {
    vi.stubEnv("APP_MODE", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_FROM", "");
    vi.stubEnv("SMTP_TO", "");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it("returns false in live-dev when not configured and logs error", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_FROM", "");
    vi.stubEnv("SMTP_TO", "");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it("returns true in production when properly configured", async () => {
    vi.stubEnv("APP_MODE", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(true);
  });

  it("handles different valid port numbers", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "465");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(true);
  });

  it("handles port as string number", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "2525");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(true);
  });

  it("rejects port zero", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "0");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
  });

  it("rejects negative port", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "-1");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { isEmailServiceConfigured } = await import("@/lib/email-service");
    expect(isEmailServiceConfigured()).toBe(false);
  });
});

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Reset delay mock to default behavior
    mockDelay.mockResolvedValue(undefined);
    // Default to test mode
    vi.stubEnv("APP_MODE", "test");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_FROM", "");
    vi.stubEnv("SMTP_TO", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const validEmailMessage = {
    from: "sender@testdomain.com",
    to: "recipient@testdomain.com",
    subject: "Test Subject",
    text: "Test email body",
    html: "<p>Test email body</p>",
  };

  it("returns error in test mode (services disabled)", async () => {
    vi.stubEnv("APP_MODE", "test");
    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Email service is disabled in offline-dev/test mode"
    );
    expect(mockLogger.info).not.toHaveBeenCalled();
  });

  it("returns error in offline-dev mode (services disabled)", async () => {
    vi.stubEnv("APP_MODE", "offline-dev");
    vi.stubEnv("NODE_ENV", "development");
    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Email service is disabled in offline-dev/test mode"
    );
    expect(mockLogger.info).not.toHaveBeenCalled();
  });

  it("returns error when email service is not configured", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_FROM", "");
    vi.stubEnv("SMTP_TO", "");

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email service is not configured");
  });

  it("logs critical error in production when service not configured", async () => {
    vi.stubEnv("APP_MODE", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_FROM", "");
    vi.stubEnv("SMTP_TO", "");

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    expect(result.success).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "production",
        messageTo: validEmailMessage.to,
        messageSubject: validEmailMessage.subject,
      }),
      expect.stringContaining("CRITICAL")
    );
  });

  it("logs critical error in live-dev when service not configured", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_FROM", "");
    vi.stubEnv("SMTP_TO", "");

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    expect(result.success).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "live-dev",
        messageTo: validEmailMessage.to,
        messageSubject: validEmailMessage.subject,
      }),
      expect.stringContaining("CRITICAL")
    );
  });

  it("successfully sends email when configured", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(result.messageId).toMatch(/^mock-\d+$/);
    expect(result.error).toBeUndefined();
  });

  it("logs service call initiation in dev mode", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { sendEmail } = await import("@/lib/email-service");
    await sendEmail(validEmailMessage);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "Email",
        operation: "sendEmail",
        request: expect.objectContaining({
          to: validEmailMessage.to,
          from: validEmailMessage.from,
          subject: validEmailMessage.subject,
          hasHtml: true,
          textLength: validEmailMessage.text.length,
        }),
      }),
      "Initiating email service call: sendEmail"
    );
  });

  it("logs successful service call completion in dev mode", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "Email",
        operation: "sendEmail",
        response: expect.objectContaining({
          status: "success",
          messageId: result.messageId,
          durationMs: expect.any(Number),
        }),
      }),
      "Email service call completed: sendEmail"
    );
  });

  it("handles email without HTML content", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const messageWithoutHtml = {
      ...validEmailMessage,
      html: undefined,
    };

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(messageWithoutHtml);

    expect(result.success).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          hasHtml: false,
        }),
      }),
      expect.any(String)
    );
  });

  it("handles email with empty text", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const messageWithEmptyText = {
      ...validEmailMessage,
      text: "",
    };

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(messageWithEmptyText);

    expect(result.success).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          textLength: 0,
        }),
      }),
      expect.any(String)
    );
  });

  it("handles errors during email sending", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    // Mock delay to throw an error
    mockDelay.mockRejectedValueOnce(new Error("SMTP connection failed"));

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    expect(result.success).toBe(false);
    expect(result.error).toBe("SMTP connection failed");
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "Email",
        operation: "sendEmail",
        error: expect.objectContaining({
          message: "SMTP connection failed",
          durationMs: expect.any(Number),
        }),
      }),
      "Email service call failed: sendEmail"
    );

    // Reset mock for other tests
    mockDelay.mockResolvedValue(undefined);
  });

  it("handles non-Error exceptions during email sending", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    // Mock delay to throw a non-Error exception
    mockDelay.mockRejectedValueOnce("String error");

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unknown error occurred while sending email");
    expect(mockLogger.error).toHaveBeenCalled();

    // Reset mock for other tests
    mockDelay.mockResolvedValue(undefined);
  });

  it("generates unique message IDs", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    // Mock Date.now() to return different values for each call
    const originalDateNow = Date.now;
    let callCount = 0;
    Date.now = vi.fn(() => {
      callCount++;
      // Return different timestamps for each call
      return 1000000000000 + callCount * 1000;
    });

    try {
      const { sendEmail } = await import("@/lib/email-service");

      const result1 = await sendEmail(validEmailMessage);
      const result2 = await sendEmail(validEmailMessage);

      expect(result1.messageId).toBeDefined();
      expect(result2.messageId).toBeDefined();
      // Message IDs should be different (based on timestamp)
      expect(result1.messageId).not.toBe(result2.messageId);
      expect(result1.messageId).toMatch(/^mock-\d+$/);
      expect(result2.messageId).toMatch(/^mock-\d+$/);
    } finally {
      // Restore original Date.now
      Date.now = originalDateNow;
    }
  });

  it("successfully sends email in production mode", async () => {
    vi.stubEnv("APP_MODE", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(validEmailMessage);

    // In production, email should be sent successfully
    // Note: devLog logging behavior is tested in logger.test.ts
    // Here we verify the core functionality works in production
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it("handles long email text", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const longText = "a".repeat(10000);
    const messageWithLongText = {
      ...validEmailMessage,
      text: longText,
    };

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(messageWithLongText);

    expect(result.success).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          textLength: 10000,
        }),
      }),
      expect.any(String)
    );
  });

  it("handles special characters in email subject", async () => {
    vi.stubEnv("APP_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_HOST", "smtp.testdomain.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_FROM", "sender@testdomain.com");
    vi.stubEnv("SMTP_TO", "recipient@testdomain.com");

    const messageWithSpecialChars = {
      ...validEmailMessage,
      subject: "Test Subject with Special Chars: !@#$%^&*()",
    };

    const { sendEmail } = await import("@/lib/email-service");
    const result = await sendEmail(messageWithSpecialChars);

    expect(result.success).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          subject: messageWithSpecialChars.subject,
        }),
      }),
      expect.any(String)
    );
  });
});
