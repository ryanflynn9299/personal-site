import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => mockLogger),
  log: mockLogger,
  prodLog: mockLogger,
  devLog: mockLogger,
  default: mockLogger,
}));

// Mock the Directus SDK
const mockRequest = vi.fn();
const mockWith = vi.fn(() => ({ request: mockRequest }));
const mockCreateDirectus = vi.fn(() => ({ with: mockWith }));
const mockReadItems = vi.fn();

vi.mock("@directus/sdk", () => ({
  createDirectus: mockCreateDirectus,
  readItems: mockReadItems,
  rest: vi.fn(),
}));

describe("directus.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Default to test mode
    vi.stubEnv("APP_MODE", "test");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isDirectusConfigured", () => {
    it("returns false in test mode (services disabled)", async () => {
      vi.stubEnv("APP_MODE", "test");
      const { isDirectusConfigured } = await import("@/lib/directus");
      expect(isDirectusConfigured()).toBe(false);
    });

    it("returns false in offline-dev mode (services disabled)", async () => {
      vi.stubEnv("APP_MODE", "offline-dev");
      vi.stubEnv("NODE_ENV", "development");
      const { isDirectusConfigured } = await import("@/lib/directus");
      expect(isDirectusConfigured()).toBe(false);
    });

    it("returns false in production when not configured", async () => {
      vi.stubEnv("APP_MODE", "production");
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");
      const { isDirectusConfigured } = await import("@/lib/directus");
      expect(isDirectusConfigured()).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("returns false in live-dev when not configured", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");
      const { isDirectusConfigured } = await import("@/lib/directus");
      expect(isDirectusConfigured()).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("returns false when URLs contain placeholder values", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://your-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "http://your-directus:8055");
      const { isDirectusConfigured } = await import("@/lib/directus");
      expect(isDirectusConfigured()).toBe(false);
    });

    it("returns true when properly configured in production", async () => {
      vi.stubEnv("APP_MODE", "production");
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");
      const { isDirectusConfigured } = await import("@/lib/directus");
      expect(isDirectusConfigured()).toBe(true);
    });

    it("returns true when properly configured in live-dev", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");
      const { isDirectusConfigured } = await import("@/lib/directus");
      expect(isDirectusConfigured()).toBe(true);
    });
  });

  describe("getPublishedPosts", () => {
    it("returns error status in test mode (services disabled)", async () => {
      vi.stubEnv("APP_MODE", "test");
      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();
      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it("returns error status in offline-dev mode (services disabled)", async () => {
      vi.stubEnv("APP_MODE", "offline-dev");
      vi.stubEnv("NODE_ENV", "development");
      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();
      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it("returns error status when Directus is not configured", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");
      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();
      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("returns success with empty array when no posts found", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");
      mockRequest.mockResolvedValueOnce([]);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("success");
      expect(result.posts).toEqual([]);
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("successfully fetches and transforms posts", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const mockPosts = [
        {
          id: "1",
          title: "Test Post",
          summary: "Test summary",
          slug: "test-post",
          status: "published",
          publication_date: "2024-01-01T00:00:00Z",
          content: "Test content",
          author: {
            first_name: "John",
            last_name: "Doe",
          },
          feature_image: "image-id",
          blog_tags: ["tech", "test"],
        },
      ];

      mockRequest.mockResolvedValueOnce(mockPosts);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("success");
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0]).toMatchObject({
        id: "1",
        title: "Test Post",
        summary: "Test summary",
        slug: "test-post",
        status: "published",
        content: "Test content",
        author: {
          first_name: "John",
          last_name: "Doe",
        },
        feature_image: "image-id",
        tags: ["tech", "test"],
      });
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("handles posts with missing optional fields", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const mockPosts = [
        {
          id: "1",
          title: "Test Post",
          slug: "test-post",
          status: "published",
        },
      ];

      mockRequest.mockResolvedValueOnce(mockPosts);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("success");
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].summary).toBe("");
      expect(result.posts[0].content).toBe("");
      expect(result.posts[0].author).toEqual({
        first_name: "Unknown",
        last_name: "Author",
      });
      expect(result.posts[0].feature_image).toBeNull();
      expect(result.posts[0].tags).toEqual([]);
    });

    it("filters out posts with missing required fields", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const mockPosts = [
        {
          id: "1",
          title: "Valid Post",
          slug: "valid-post",
          status: "published",
        },
        {
          id: "2",
          // Missing title
          slug: "invalid-post",
          status: "published",
        },
        {
          id: "3",
          title: "Another Valid Post",
          // Missing slug
          status: "published",
        },
      ];

      mockRequest.mockResolvedValueOnce(mockPosts);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("success");
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe("1");
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("handles posts with partial author information", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const mockPosts = [
        {
          id: "1",
          title: "Test Post",
          slug: "test-post",
          status: "published",
          author: {
            first_name: "John",
            // Missing last_name
          },
        },
      ];

      mockRequest.mockResolvedValueOnce(mockPosts);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("success");
      expect(result.posts[0].author).toEqual({
        first_name: "John",
        last_name: "Author",
      });
    });

    it("handles posts with missing required fields (logs warning)", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const mockPosts = [
        {
          id: "1",
          title: "Test Post",
          slug: "test-post",
          status: "published",
        },
        {
          // Missing required fields - will log warning and be filtered out
          id: null,
          title: null,
          slug: null,
        },
      ];

      mockRequest.mockResolvedValueOnce(mockPosts);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("success");
      expect(result.posts).toHaveLength(1);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("handles transformation errors gracefully (actual exceptions)", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const mockPosts = [
        {
          id: "1",
          title: "Test Post",
          slug: "test-post",
          status: "published",
        },
        {
          // This post will cause an actual exception during transformation
          // by having an author property that throws when accessed
          id: "2",
          title: "Another Post",
          slug: "another-post",
          status: "published",
          get author() {
            throw new Error("Cannot access author");
          },
        },
      ];

      mockRequest.mockResolvedValueOnce(mockPosts);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("success");
      expect(result.posts).toHaveLength(1);
      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          postId: "2",
        }),
        "Error transforming post data"
      );
    });

    it("handles network errors", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const networkError = new Error("fetch failed: ECONNREFUSED");
      mockRequest.mockRejectedValueOnce(networkError);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("handles authentication errors (401)", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const authError = { status: 401, message: "Unauthorized" };
      mockRequest.mockRejectedValueOnce(authError);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("handles not found errors (404)", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const notFoundError = { status: 404, message: "Not Found" };
      mockRequest.mockRejectedValueOnce(notFoundError);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("handles server errors (500)", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const serverError = { status: 500, message: "Internal Server Error" };
      mockRequest.mockRejectedValueOnce(serverError);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("handles validation errors (400)", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const validationError = { status: 400, message: "Bad Request" };
      mockRequest.mockRejectedValueOnce(validationError);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("error");
      expect(result.posts).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("logs critical errors in production mode", async () => {
      vi.stubEnv("APP_MODE", "production");
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const serverError = { status: 500, message: "Internal Server Error" };
      mockRequest.mockRejectedValueOnce(serverError);

      const { getPublishedPosts } = await import("@/lib/directus");
      const result = await getPublishedPosts();

      expect(result.status).toBe("error");
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: "server_error",
        }),
        expect.stringContaining("CRITICAL")
      );
    });
  });

  describe("getPostBySlug", () => {
    it("returns null for invalid slug (empty string)", async () => {
      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("");
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("returns null for invalid slug (whitespace only)", async () => {
      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("   ");
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("returns null for invalid slug (non-string)", async () => {
      const { getPostBySlug } = await import("@/lib/directus");
      // @ts-expect-error - Testing invalid input
      const result = await getPostBySlug(null);
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("returns null in test mode (services disabled)", async () => {
      vi.stubEnv("APP_MODE", "test");
      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");
      expect(result).toBeNull();
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it("returns null when Directus is not configured", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "");
      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("returns null when post is not found", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");
      mockRequest.mockResolvedValueOnce([]);

      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("non-existent-post");

      expect(result).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("successfully fetches and transforms a post by slug", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const mockPost = {
        id: "1",
        title: "Test Post",
        summary: "Test summary",
        slug: "test-post",
        status: "published",
        publication_date: "2024-01-01T00:00:00Z",
        content: "Test content",
        author: {
          first_name: "John",
          last_name: "Doe",
        },
        feature_image: "image-id",
        blog_tags: ["tech", "test"],
      };

      mockRequest.mockResolvedValueOnce([mockPost]);

      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        id: "1",
        title: "Test Post",
        summary: "Test summary",
        slug: "test-post",
        status: "published",
        content: "Test content",
        author: {
          first_name: "John",
          last_name: "Doe",
        },
        feature_image: "image-id",
        tags: ["tech", "test"],
      });
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("returns null when post is missing required fields", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const mockPost = {
        id: "1",
        // Missing title and slug
        status: "published",
      };

      mockRequest.mockResolvedValueOnce([mockPost]);

      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("handles posts with missing optional fields", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const mockPost = {
        id: "1",
        title: "Test Post",
        slug: "test-post",
        status: "published",
      };

      mockRequest.mockResolvedValueOnce([mockPost]);

      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");

      expect(result).not.toBeNull();
      expect(result?.summary).toBe("");
      expect(result?.content).toBe("");
      expect(result?.author).toEqual({
        first_name: "Unknown",
        last_name: "Author",
      });
      expect(result?.feature_image).toBeNull();
      expect(result?.tags).toEqual([]);
    });

    it("handles not found errors gracefully", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const notFoundError = { status: 404, message: "Not Found" };
      mockRequest.mockRejectedValueOnce(notFoundError);

      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");

      expect(result).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("handles other errors and logs them", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const serverError = { status: 500, message: "Internal Server Error" };
      mockRequest.mockRejectedValueOnce(serverError);

      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("handles network errors", async () => {
      vi.stubEnv("APP_MODE", "live-dev");
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const networkError = new Error("fetch failed: ETIMEDOUT");
      mockRequest.mockRejectedValueOnce(networkError);

      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("logs critical errors in production mode", async () => {
      vi.stubEnv("APP_MODE", "production");
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("DIRECTUS_URL_SERVER_SIDE", "http://internal-directus:8055");
      vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

      const serverError = { status: 500, message: "Internal Server Error" };
      mockRequest.mockRejectedValueOnce(serverError);

      const { getPostBySlug } = await import("@/lib/directus");
      const result = await getPostBySlug("test-post");

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: "server_error",
        }),
        expect.stringContaining("CRITICAL")
      );
    });
  });
});
