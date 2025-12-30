import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { submitContactForm } from "@/app/actions/contact";
import * as emailService from "@/lib/email-service";

// Mock the email service module to avoid delays in tests
vi.mock("@/lib/email-service", () => ({
  isEmailServiceConfigured: vi.fn(),
  sendEmail: vi.fn().mockImplementation(async () => {
    // Return immediately without delay for tests
    return {
      success: true,
      messageId: `test-message-${Date.now()}`,
    };
  }),
}));

// Mock the delay function to ensure no delays in tests
vi.mock("@/lib/delay", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}));

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NODE_ENV to test using Vitest's stubEnv utility
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    // Restore original NODE_ENV after each test
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

  it("handles missing email service in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(false);

    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("email", "test@example.com");
    formData.set("message", "Hello world");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(false);
    expect(result.message).toContain("Email service is not configured");
  });

  it("handles missing email service in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(false);

    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("email", "test@example.com");
    formData.set("message", "Hello world");

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(false);
    expect(result.message).toContain("Email service is currently unavailable");
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
});
