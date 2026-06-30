import { describe, it, expect, beforeEach } from "vitest";
import {
  isHoneypotTriggered,
  checkContactRateLimit,
  validateContactSubmission,
  resetContactRateLimitForTests,
  CONTACT_RATE_LIMIT_MAX,
} from "@/lib/services/contact-protection";

describe("contact-protection", () => {
  beforeEach(() => {
    resetContactRateLimitForTests();
  });

  describe("isHoneypotTriggered", () => {
    it("returns false when honeypot is empty", () => {
      const formData = new FormData();
      formData.set("website", "");
      expect(isHoneypotTriggered(formData)).toBe(false);
    });

    it("returns false when honeypot is absent", () => {
      const formData = new FormData();
      expect(isHoneypotTriggered(formData)).toBe(false);
    });

    it("returns true when honeypot has a value", () => {
      const formData = new FormData();
      formData.set("website", "https://spam.example.com");
      expect(isHoneypotTriggered(formData)).toBe(true);
    });
  });

  describe("checkContactRateLimit", () => {
    it("allows requests under the limit", () => {
      const ip = "192.168.1.1";
      for (let i = 0; i < CONTACT_RATE_LIMIT_MAX; i++) {
        expect(checkContactRateLimit(ip)).toBe(true);
      }
    });

    it("blocks requests over the limit", () => {
      const ip = "192.168.1.2";
      for (let i = 0; i < CONTACT_RATE_LIMIT_MAX; i++) {
        checkContactRateLimit(ip);
      }
      expect(checkContactRateLimit(ip)).toBe(false);
    });

    it("rejects unknown IPs conservatively", () => {
      expect(checkContactRateLimit(null)).toBe(false);
      expect(checkContactRateLimit("unknown")).toBe(false);
    });
  });

  describe("validateContactSubmission", () => {
    it("rejects honeypot triggers", () => {
      const formData = new FormData();
      formData.set("website", "bot");
      expect(validateContactSubmission(formData, "1.2.3.4")).toEqual({
        allowed: false,
        reason: "honeypot",
      });
    });

    it("allows valid submissions", () => {
      const formData = new FormData();
      expect(validateContactSubmission(formData, "1.2.3.4")).toEqual({
        allowed: true,
      });
    });
  });
});
