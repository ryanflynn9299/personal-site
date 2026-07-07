import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/config", async () => {
  const { createDynamicConfigMock } = await import("../mocks/config");
  return createDynamicConfigMock();
});

vi.mock("@/lib/services/email-service", () => ({
  isEmailServiceConfigured: vi.fn(() => false),
}));

import { getContactDeliveryStatus } from "@/lib/site/contact.server";
import { isEmailServiceConfigured } from "@/lib/services/email-service";

describe("lib/site/contact.server", () => {
  beforeEach(() => {
    vi.mocked(isEmailServiceConfigured).mockReturnValue(false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getContactDeliveryStatus", () => {
    it("allows submissions in offline-dev even without services", () => {
      vi.stubEnv("RUNTIME_MODE", "offline-dev");
      const status = getContactDeliveryStatus();
      expect(status.canAcceptSubmissions).toBe(true);
    });

    it("blocks submissions in production without services", () => {
      vi.stubEnv("RUNTIME_MODE", "production");
      vi.mocked(isEmailServiceConfigured).mockReturnValue(false);
      const status = getContactDeliveryStatus();
      expect(status.canAcceptSubmissions).toBe(false);
    });

    it("allows submissions in production when email service is configured", () => {
      vi.stubEnv("RUNTIME_MODE", "production");
      vi.mocked(isEmailServiceConfigured).mockReturnValue(true);
      const status = getContactDeliveryStatus();
      expect(status.canAcceptSubmissions).toBe(true);
    });
  });
});
