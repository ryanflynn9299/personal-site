import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/config", async () => {
  const { createDynamicConfigMock } = await import("../mocks/config");
  return createDynamicConfigMock();
});

import {
  getContactEmail,
  getContactMailtoHref,
  getContactUnavailableMessage,
  getContactStatusTooltip,
} from "@/lib/site/contact";

describe("lib/site/contact", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getContactEmail", () => {
    it("returns configured email when valid", () => {
      vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "ryan.flynn001@gmail.com");
      expect(getContactEmail()).toBe("ryan.flynn001@gmail.com");
    });

    it("returns null for placeholder values", () => {
      vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "your-email@example.com");
      expect(getContactEmail()).toBeNull();
    });

    it("returns null for invalid email format", () => {
      vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "not-an-email");
      expect(getContactEmail()).toBeNull();
    });
  });

  describe("getContactMailtoHref", () => {
    it("builds mailto href from contact email", () => {
      vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "ryan.flynn001@gmail.com");
      expect(getContactMailtoHref()).toBe("mailto:ryan.flynn001@gmail.com");
    });

    it("returns null when email is unavailable", () => {
      vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
      expect(getContactMailtoHref()).toBeNull();
    });
  });

  describe("getContactUnavailableMessage", () => {
    it("returns offline-dev notice", () => {
      vi.stubEnv("RUNTIME_MODE", "offline-dev");
      const message = getContactUnavailableMessage({
        contactEmail: "ryan.flynn001@gmail.com",
        directusAvailable: false,
        emailServiceAvailable: false,
        canAcceptSubmissions: true,
      });
      expect(message).toContain("Development mode");
    });

    it("suggests direct email when form unavailable but email is configured", () => {
      vi.stubEnv("RUNTIME_MODE", "production");
      const message = getContactUnavailableMessage({
        contactEmail: "ryan.flynn001@gmail.com",
        directusAvailable: false,
        emailServiceAvailable: false,
        canAcceptSubmissions: false,
      });
      expect(message).toContain("email directly");
    });
  });

  describe("getContactStatusTooltip", () => {
    it("avoids env variable names in production", () => {
      vi.stubEnv("RUNTIME_MODE", "production");
      const tooltip = getContactStatusTooltip();
      expect(tooltip).not.toMatch(/SMTP|NEXT_PUBLIC|environment variable/i);
      expect(tooltip).toContain("temporarily unavailable");
    });

    it("describes offline dev mode in development", () => {
      vi.stubEnv("RUNTIME_MODE", "offline-dev");
      vi.stubEnv("NODE_ENV", "development");
      const tooltip = getContactStatusTooltip();
      expect(tooltip).toContain("Development mode");
    });

    it("describes live-dev without env names", () => {
      vi.stubEnv("RUNTIME_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      const tooltip = getContactStatusTooltip();
      expect(tooltip).not.toMatch(/SMTP|NEXT_PUBLIC/i);
      expect(tooltip).toContain("not configured");
    });
  });
});
