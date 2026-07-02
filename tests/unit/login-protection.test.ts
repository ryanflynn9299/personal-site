import { describe, it, expect, beforeEach } from "vitest";
import {
  isLoginRateLimited,
  registerFailedLogin,
  clearLoginFailures,
  resetLoginRateLimitForTests,
  LOGIN_RATE_LIMIT_MAX,
} from "@/lib/services/login-protection";

describe("login-protection", () => {
  beforeEach(() => {
    resetLoginRateLimitForTests();
  });

  it("does not rate limit clients with no failed attempts", () => {
    expect(isLoginRateLimited("192.168.1.1")).toBe(false);
  });

  it("rate limits after the maximum number of failed attempts", () => {
    const ip = "192.168.1.2";
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i++) {
      expect(isLoginRateLimited(ip)).toBe(false);
      registerFailedLogin(ip);
    }
    expect(isLoginRateLimited(ip)).toBe(true);
  });

  it("tracks unidentified clients in a shared bucket", () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i++) {
      registerFailedLogin(null);
    }
    expect(isLoginRateLimited(null)).toBe(true);
    expect(isLoginRateLimited("unknown")).toBe(true);
    // Identified clients are unaffected
    expect(isLoginRateLimited("192.168.1.3")).toBe(false);
  });

  it("clears failures after a successful login", () => {
    const ip = "192.168.1.4";
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i++) {
      registerFailedLogin(ip);
    }
    expect(isLoginRateLimited(ip)).toBe(true);

    clearLoginFailures(ip);
    expect(isLoginRateLimited(ip)).toBe(false);
  });
});
