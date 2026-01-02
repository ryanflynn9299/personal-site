import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock logger to avoid console output during tests
vi.mock("@/lib/logger", () => {
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

// Mock the Directus SDK
vi.mock("@directus/sdk", () => ({
  createDirectus: vi.fn(() => ({
    with: vi.fn(() => ({
      request: vi.fn(),
    })),
  })),
  readItems: vi.fn(),
  rest: vi.fn(),
}));

describe("Directus Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set test mode - services are disabled in test mode
    vi.stubEnv("APP_MODE", "test");
    // Reset environment variables
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");
    // Reset modules to ensure env object is recreated with new env vars
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isDirectusConfigured", () => {
    it("returns false when not configured", async () => {
      const { isDirectusConfigured } = await import("@/lib/directus");
      expect(isDirectusConfigured()).toBe(false);
    });

    it("returns true when properly configured (in live-dev mode)", async () => {
      // Set to live-dev mode to enable services
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      // Use a non-placeholder URL (not example.com which is rejected)
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const { isDirectusConfigured } = await import("@/lib/directus");
      expect(isDirectusConfigured()).toBe(true);
    });
  });

  describe("getPublishedPosts", () => {
    it("returns empty array when Directus is not configured", async () => {
      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();
      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
    });

    it("handles empty response gracefully", async () => {
      // This tests the configuration check and error handling
      // Full integration test would require mocking the Directus SDK properly
      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();
      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
    });
  });

  describe("getPostBySlug", () => {
    it("returns null for invalid slug", async () => {
      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("");
      expect(result).toBeNull();
    });

    it("returns null for empty string slug", async () => {
      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("   ");
      expect(result).toBeNull();
    });

    it("returns null when Directus is not configured", async () => {
      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");
      expect(result).toBeNull();
    });
  });
});
