import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { submitContactForm } from "@/app/actions/contact";
import * as emailService from "@/lib/services/email-service";

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

// Mock the delay function to ensure no delays in tests
vi.mock("@/lib/dev-tooling/delay", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}));

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
