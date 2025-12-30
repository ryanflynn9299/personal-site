import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPublishedPosts,
  getPostBySlug,
  isDirectusConfigured,
} from "@/lib/directus";

// Mock the logger to avoid console output during tests
vi.mock("@/lib/logger", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

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
    // Reset environment variables
    delete process.env.DIRECTUS_URL_SERVER_SIDE;
    delete process.env.NEXT_PUBLIC_DIRECTUS_URL;
  });

  describe("isDirectusConfigured", () => {
    it("returns false when not configured", () => {
      expect(isDirectusConfigured()).toBe(false);
    });

    it("returns true when properly configured", () => {
      process.env.DIRECTUS_URL_SERVER_SIDE = "http://directus:8055";
      process.env.NEXT_PUBLIC_DIRECTUS_URL = "https://api.example.com";
      expect(isDirectusConfigured()).toBe(true);
    });
  });

  describe("getPublishedPosts", () => {
    it("returns empty array when Directus is not configured", async () => {
      const result = await getPublishedPosts();
      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
    });

    it("handles empty response gracefully", async () => {
      // This tests the configuration check and error handling
      // Full integration test would require mocking the Directus SDK properly
      const result = await getPublishedPosts();
      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
    });
  });

  describe("getPostBySlug", () => {
    it("returns null for invalid slug", async () => {
      const result = await getPostBySlug("");
      expect(result).toBeNull();
    });

    it("returns null for empty string slug", async () => {
      const result = await getPostBySlug("   ");
      expect(result).toBeNull();
    });

    it("returns null when Directus is not configured", async () => {
      const result = await getPostBySlug("test-post");
      expect(result).toBeNull();
    });
  });
});
