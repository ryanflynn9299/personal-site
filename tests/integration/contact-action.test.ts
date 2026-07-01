import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { submitContactForm } from "@/app/actions/contact";
import * as emailService from "@/lib/services/email-service";
import * as directusService from "@/lib/services/directus";
import { resetContactRateLimitForTests } from "@/lib/services/contact-protection";

vi.mock("@/lib/dev-tooling/logger", async () => {
  const { loggerModuleMock } = await import("../mocks/logger");
  return loggerModuleMock;
});

// Mock the email service module to avoid delays in tests
vi.mock("@/lib/services/email-service", () => ({
  isEmailServiceConfigured: vi.fn(),
  sendEmail: vi.fn().mockImplementation(async () => {
    // Return immediately without delay for tests
    return {
      success: true,
      messageId: `test-message-${Date.now()}`,
    };
  }),
}));

// Mock the config module to allow it to be dynamic for tests
vi.mock("@/lib/config", async () => {
  const { createDynamicConfigMock } = await import("../mocks/config");
  return createDynamicConfigMock();
});

// Mock the delay function to ensure no delays in tests
vi.mock("@/lib/dev-tooling/delay", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/services/contact-client-ip", () => ({
  getContactClientIp: vi.fn().mockResolvedValue("127.0.0.1"),
}));

vi.mock("@/lib/services/directus", () => ({
  isDirectusConfigured: vi.fn().mockReturnValue(false),
  createContactMessage: vi.fn().mockResolvedValue(false),
}));

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetContactRateLimitForTests();
    vi.mocked(emailService.sendEmail).mockResolvedValue({
      success: true,
      messageId: `test-message-${Date.now()}`,
    });
    vi.mocked(directusService.isDirectusConfigured).mockReturnValue(false);
    vi.mocked(directusService.createContactMessage).mockResolvedValue(false);
    // Set test mode - services are disabled in test mode
    vi.stubEnv("RUNTIME_MODE", "test");
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    // Restore original environment after each test
    vi.unstubAllEnvs();
  });

  it("validates that all fields are required", async () => {
    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", "test@example.com");
    formData.set("message", "Hello");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("All fields are required");
  });

  it("validates email format", async () => {
    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("email", "invalid-email");
    formData.set("message", "Hello world");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Please enter a valid email address");
  });

  it("accepts valid email formats", async () => {
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(true);

    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("email", "test@example.com");
    formData.set("message", "Hello world");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
  });

  it("handles missing email service in offline-dev mode", async () => {
    vi.stubEnv("RUNTIME_MODE", "offline-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(false);

    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("email", "test@example.com");
    formData.set("message", "Hello world");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(false);
    expect(result.message).toContain("Development Mode: Submission received");
  });

  it("handles missing email service in production (returns error)", async () => {
    vi.stubEnv("RUNTIME_MODE", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(false);

    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("email", "test@example.com");
    formData.set("message", "Hello world");

    const result = await submitContactForm(formData);

    // In production, missing service is a real error
    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to process your message");
  });

  it("returns stored-only success when Directus saves but email fails in production", async () => {
    vi.stubEnv("RUNTIME_MODE", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(true);
    vi.mocked(emailService.sendEmail).mockResolvedValue({
      success: false,
      error: "SMTP delivery is not yet implemented",
    });
    vi.mocked(directusService.isDirectusConfigured).mockReturnValue(true);
    vi.mocked(directusService.createContactMessage).mockResolvedValue(true);

    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("email", "test@example.com");
    formData.set("message", "Hello world");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(false);
    expect(result.messageStored).toBe(true);
    expect(result.message).toMatch(/received and saved/i);
  });

  it("returns success when email service is configured", async () => {
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(true);

    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("email", "test@example.com");
    formData.set("message", "Hello world");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(true);
    expect(result.message).toContain("Thank you");
  });

  it("handles various valid email formats", async () => {
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(true);

    const validEmails = [
      "user@example.com",
      "user.name@example.com",
      "user+tag@example.co.uk",
      "user_name@example-domain.com",
    ];

    for (const email of validEmails) {
      const formData = new FormData();
      formData.set("name", "Test User");
      formData.set("email", email);
      formData.set("message", "Test message");

      const result = await submitContactForm(formData);
      expect(result.success).toBe(true);
    }
  });

  it("silently accepts honeypot submissions", async () => {
    const formData = new FormData();
    formData.set("name", "Bot");
    formData.set("email", "bot@example.com");
    formData.set("message", "spam");
    formData.set("website", "https://spam.example.com");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.message).toContain("Thank you");
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });

  it("rejects submissions when rate limit exceeded", async () => {
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(true);

    for (let i = 0; i < 5; i++) {
      const formData = new FormData();
      formData.set("name", "User");
      formData.set("email", "test@example.com");
      formData.set("message", `Message ${i}`);
      await submitContactForm(formData);
    }

    const formData = new FormData();
    formData.set("name", "User");
    formData.set("email", "test@example.com");
    formData.set("message", "One too many");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Too many messages");
  });
});
