import {
  isPrivateIP,
  getClientIP,
  isInternalRequest,
} from "../../lib/dev-tooling/ip-validation";
import { describe, it, expect, vi, afterEach } from "vitest";

describe("IP Validation Utilities", () => {
  describe("isPrivateIP", () => {
    it("should return true for localhost (127.0.0.0/8)", () => {
      expect(isPrivateIP("127.0.0.1")).toBe(true);
      expect(isPrivateIP("127.100.200.5")).toBe(true);
      // Handles ports
      expect(isPrivateIP("127.0.0.1:3000")).toBe(true);
    });

    it("should return true for class A private IPs (10.0.0.0/8)", () => {
      expect(isPrivateIP("10.0.0.1")).toBe(true);
      expect(isPrivateIP("10.255.255.254")).toBe(true);
    });

    it("should return true for class B private IPs (172.16.0.0/12)", () => {
      expect(isPrivateIP("172.16.0.1")).toBe(true);
      expect(isPrivateIP("172.31.255.255")).toBe(true);
    });

    it("should return false for outside class B private range", () => {
      expect(isPrivateIP("172.15.255.255")).toBe(false);
      expect(isPrivateIP("172.32.0.1")).toBe(false);
    });

    it("should return true for class C private IPs (192.168.0.0/16)", () => {
      expect(isPrivateIP("192.168.0.1")).toBe(true);
      expect(isPrivateIP("192.168.255.255")).toBe(true);
    });

    it("should return true for IPv6 private ranges", () => {
      expect(isPrivateIP("::1")).toBe(true);
      expect(isPrivateIP("fc00::1")).toBe(true);
      expect(isPrivateIP("fd12:3456:789a:1::1")).toBe(true);
      expect(isPrivateIP("::ffff:127.0.0.1")).toBe(true);
      expect(isPrivateIP("::ffff:192.168.1.1")).toBe(true);
    });

    it("should return false for public IPs", () => {
      expect(isPrivateIP("8.8.8.8")).toBe(false);
      expect(isPrivateIP("1.1.1.1")).toBe(false);
      // Public IPv6
      expect(isPrivateIP("2001:4860:4860::8888")).toBe(false);
    });

    it("should handle edge cases and invalid formats gracefully", () => {
      expect(isPrivateIP("")).toBe(false);
      expect(isPrivateIP("invalid-ip")).toBe(false);
      expect(isPrivateIP("256.256.256.256")).toBe(false);
      expect(isPrivateIP("127.0.0")).toBe(false); // only 3 octets
      expect(isPrivateIP("10.-1.0.1")).toBe(false);
    });
  });

  describe("getClientIP", () => {
    const createReq = (headers: Record<string, string>) =>
      new Request("http://localhost", { headers: new Headers(headers) });

    it("should extract IP from x-forwarded-for header", () => {
      const req = createReq({ "x-forwarded-for": "192.168.1.5" });
      expect(getClientIP(req)).toBe("192.168.1.5");
    });

    it("should take the first IP from a comma-separated x-forwarded-for chain", () => {
      const req = createReq({
        "x-forwarded-for": "10.0.0.5, 1.1.1.1, 8.8.8.8",
      });
      expect(getClientIP(req)).toBe("10.0.0.5");
    });

    it("should fallback to x-real-ip if x-forwarded-for is missing", () => {
      const req = createReq({ "x-real-ip": "172.16.5.1" });
      expect(getClientIP(req)).toBe("172.16.5.1");
    });

    it("should fallback to cf-connecting-ip if others are missing", () => {
      const req = createReq({ "cf-connecting-ip": "8.8.8.8" });
      expect(getClientIP(req)).toBe("8.8.8.8");
    });

    it("should prioritize x-forwarded-for over others", () => {
      const req = createReq({
        "x-forwarded-for": "10.0.0.1",
        "x-real-ip": "10.0.0.2",
        "cf-connecting-ip": "10.0.0.3",
      });
      expect(getClientIP(req)).toBe("10.0.0.1");
    });

    it("should strip IPv6 brackets", () => {
      const req = createReq({ "x-real-ip": "[::1]" });
      expect(getClientIP(req)).toBe("::1");
    });

    it("should ignore excessively long IPs pointing to potential attacks", () => {
      const payload = "192.168.1.1" + "a".repeat(100);
      const req = createReq({ "x-forwarded-for": payload });
      expect(getClientIP(req)).toBeNull(); // Because length > MAX_IP_LENGTH
    });

    it("should return null when no IP headers exist", () => {
      const req = createReq({});
      expect(getClientIP(req)).toBeNull();
    });
  });

  describe("isInternalRequest", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should permit requests with private headers", () => {
      const req = new Request("http://localhost", {
        headers: new Headers({ "x-real-ip": "192.168.1.5" }),
      });
      expect(isInternalRequest(req)).toBe(true);
    });

    it("should reject requests with explicit public IP headers despite internal host", () => {
      const req = new Request("http://localhost", {
        headers: new Headers({
          "x-real-ip": "8.8.8.8",
          host: "localhost:3000",
        }),
      });
      expect(isInternalRequest(req)).toBe(false);
    });

    it("should allow headerless requests in production if host implies internal (e.g. docker config)", () => {
      vi.stubEnv("NODE_ENV", "production");
      const req = new Request("http://ps-frontend:3000", {
        headers: new Headers({
          host: "ps-frontend:3000",
        }),
      });
      expect(isInternalRequest(req)).toBe(true);
    });

    it("should reject headerless requests in production if host DOES NOT imply internal", () => {
      vi.stubEnv("NODE_ENV", "production");
      const req = new Request("http://my-public-domain.com", {
        headers: new Headers({
          host: "my-public-domain.com",
        }),
      });
      expect(isInternalRequest(req)).toBe(false);
    });

    it("should allow headerless localhost requests in development", () => {
      vi.stubEnv("NODE_ENV", "development");
      const req = new Request("http://127.0.0.1:3000", {
        headers: new Headers({
          host: "127.0.0.1:3000",
        }),
      });
      expect(isInternalRequest(req)).toBe(true);
    });

    it("should deny default headerless requests without matching hosts", () => {
      vi.stubEnv("NODE_ENV", "development");
      const req = new Request("http://some-external", {
        headers: new Headers({}), // Missing host mostly falls back to standard false
      });
      expect(isInternalRequest(req)).toBe(false);
    });
  });
});
