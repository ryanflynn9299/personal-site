import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock pino logger to avoid issues with tracingChannel
vi.mock("@/lib/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { isDirectusConfigured } from "@/lib/directus";

describe("isDirectusConfigured", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when no environment variables are set", () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");

    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns false when URLs contain placeholder values", () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://your-directus:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "http://your-directus:8055");

    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns false when URLs are default placeholders", () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://ps-directus:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "http://localhost:8055");

    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns false when URLs are empty strings", () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");

    expect(isDirectusConfigured()).toBe(false);
  });

  it("returns true when both URLs are properly configured", () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://directus:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.example.com");

    expect(isDirectusConfigured()).toBe(true);
  });

  it("handles URLs with different protocols", () => {
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://public.example.com");

    expect(isDirectusConfigured()).toBe(true);
  });
});
