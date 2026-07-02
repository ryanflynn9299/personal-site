import { describe, it, expect } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  secretsEqual,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session-token";

const SECRET = "unit-test-secret-0123456789abcdef0123456789";

describe("session-token", () => {
  it("verifies a freshly created token", async () => {
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(SECRET, token)).toBe(true);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken(
      "another-secret-abcdef0123456789abcdef"
    );
    expect(await verifySessionToken(SECRET, token)).toBe(false);
  });

  it("rejects an expired token", async () => {
    const issuedInThePast = Date.now() - (SESSION_MAX_AGE_SECONDS + 60) * 1000;
    const token = await createSessionToken(SECRET, issuedInThePast);
    expect(await verifySessionToken(SECRET, token)).toBe(false);
  });

  it("rejects a token with a tampered expiry", async () => {
    const token = await createSessionToken(SECRET);
    const [, signature] = token.split(".");
    const tampered = `${Date.now() + 10 * 365 * 24 * 3600 * 1000}.${signature}`;
    expect(await verifySessionToken(SECRET, tampered)).toBe(false);
  });

  it("rejects missing or malformed tokens", async () => {
    expect(await verifySessionToken(SECRET, undefined)).toBe(false);
    expect(await verifySessionToken(SECRET, "")).toBe(false);
    expect(await verifySessionToken(SECRET, "not-a-token")).toBe(false);
    expect(await verifySessionToken(SECRET, ".signature-only")).toBe(false);
    expect(await verifySessionToken(undefined, "123.abc")).toBe(false);
  });

  it("compares secrets in constant time regardless of length", async () => {
    expect(await secretsEqual("passcode", "passcode")).toBe(true);
    expect(await secretsEqual("passcode", "passcodX")).toBe(false);
    expect(await secretsEqual("short", "much-longer-value")).toBe(false);
  });
});
