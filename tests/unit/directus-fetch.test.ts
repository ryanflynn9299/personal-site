import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock @directus/sdk
const mockRequest = vi.fn();
const mockDirectus = {
  request: mockRequest,
  with: vi.fn().mockReturnThis(),
};

vi.mock("@directus/sdk", () => ({
  createDirectus: vi.fn(() => mockDirectus),
  readItems: vi.fn((col, params) => ({ type: "readItems", col, params })),
  rest: vi.fn(),
}));

// Mock logger
vi.mock("@/lib/dev-tooling/logger", () => {
  const mLog = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  return { createLogger: () => mLog, log: mLog, devLog: mLog, default: mLog };
});

// We need to manage the features flag so we can test both the dummy route and real route
vi.mock("@/lib/dev-tooling/features", () => {
  const offlineMap: Record<string, boolean> = { offlineDummyBlogs: false };
  return {
    isFeatureEnabled: (key: string) => offlineMap[key] || false,
    _setFeature: (key: string, val: boolean) => {
      offlineMap[key] = val;
    },
  };
});

// Import dynamically so it picks up the latest env variables
describe("Directus Fetch Methods", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubEnv("RUNTIME_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");

    // Stub valid directus URLs
    vi.stubEnv("DIRECTUS_INTERNAL_URL", "http://internal:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");
    vi.resetModules();

    // Default feature off
    const feat = await import("@/lib/dev-tooling/features");
    (
      feat as unknown as { _setFeature: (k: string, v: boolean) => void }
    )._setFeature("offlineDummyBlogs", false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getPublishedPosts", () => {
    it("returns dummy posts if offlineDummyBlogs feature is enabled", async () => {
      const feat = await import("@/lib/dev-tooling/features");
      (
        feat as unknown as { _setFeature: (k: string, v: boolean) => void }
      )._setFeature("offlineDummyBlogs", true);

      const { getPublishedPosts } = await import("@/lib/services/directus");
      const res = await getPublishedPosts();

      expect(res.status).toBe("success");
      expect(res.posts.length).toBeGreaterThan(0);
      expect(res.posts[0].id).toContain("uuid-dummy");
    });

    it("returns error empty array if offline-dev mode", async () => {
      vi.stubEnv("RUNTIME_MODE", "offline-dev");
      vi.resetModules();

      const { getPublishedPosts } = await import("@/lib/services/directus");
      const res = await getPublishedPosts();

      expect(res.status).toBe("error");
      expect(res.posts).toEqual([]);
    });

    it("fetches and transforms real posts gracefully", async () => {
      vi.resetModules();

      // Mock the response from directus request
      mockRequest.mockResolvedValueOnce([
        {
          id: "1",
          title: "Test",
          slug: "test",
          status: "published",
          publication_date: "2024-01-01T00:00:00Z",
          author: { first_name: "John", last_name: "Doe" },
        },
      ]);

      const { getPublishedPosts } = await import("@/lib/services/directus");
      const res = await getPublishedPosts();

      expect(res.status).toBe("success");
      expect(res.posts).toHaveLength(1);
      expect(res.posts[0].title).toBe("Test");
      expect(res.posts[0].author.first_name).toBe("John");
    });

    it("skips posts with missing required fields to prevent frontend crash", async () => {
      vi.resetModules();

      mockRequest.mockResolvedValueOnce([
        { id: "1", title: "Test", slug: "test" }, // Valid
        { id: "2", title: "Missing Slug" }, // Invalid
        { id: "3", slug: "missing-title" }, // Invalid
      ]);

      const { getPublishedPosts } = await import("@/lib/services/directus");
      const res = await getPublishedPosts();

      expect(res.status).toBe("success");
      expect(res.posts).toHaveLength(1);
      expect(res.posts[0].id).toBe("1");
    });
  });

  describe("getPostBySlug", () => {
    it("fetches single post successfully", async () => {
      vi.resetModules();

      mockRequest.mockResolvedValueOnce([
        { id: "1", title: "Foo", slug: "foo", status: "published" },
      ]);

      const { getPostBySlug } = await import("@/lib/services/directus");
      const post = await getPostBySlug("foo");

      expect(post).not.toBeNull();
      expect(post?.title).toBe("Foo");
    });

    it("returns null if not found", async () => {
      vi.resetModules();

      mockRequest.mockResolvedValueOnce([]); // Empty array = no match
      const { getPostBySlug } = await import("@/lib/services/directus");
      const post = await getPostBySlug("fake-slug");
      expect(post).toBeNull();
    });
  });

  describe("getAdjacentPosts", () => {
    it("returns correct prev and next based on publication date and id sorting", async () => {
      vi.resetModules();

      mockRequest.mockResolvedValueOnce([
        {
          id: "3",
          title: "P3",
          slug: "p3",
          publication_date: "2024-03-01T00:00:00Z",
        },
        {
          id: "1",
          title: "P1",
          slug: "p1",
          publication_date: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          title: "P2",
          slug: "p2",
          publication_date: "2024-02-01T00:00:00Z",
        },
      ]);

      const { getAdjacentPosts } = await import("@/lib/services/directus");
      const { prev, next } = await getAdjacentPosts(
        "2024-02-01T00:00:00Z",
        "2"
      );

      // Sorted by date desc
      // 1. id: 3 (March)
      // 2. id: 2 (Feb)
      // 3. id: 1 (Jan)
      // Array is [3, 2, 1]
      // Current index of '2' is 1
      // Prev post (older in time, next in array) -> id: 1
      // Next post (newer in time, previous in array) -> id: 3

      expect(prev?.id).toBe("1");
      expect(next?.id).toBe("3");
    });

    it("handles the edge of the array correctly", async () => {
      vi.resetModules();

      mockRequest.mockResolvedValueOnce([
        {
          id: "2",
          title: "P2",
          slug: "p2",
          publication_date: "2024-02-01T00:00:00Z",
        },
        {
          id: "1",
          title: "P1",
          slug: "p1",
          publication_date: "2024-01-01T00:00:00Z",
        },
      ]);

      const { getAdjacentPosts } = await import("@/lib/services/directus");
      const { prev, next } = await getAdjacentPosts(
        "2024-02-01T00:00:00Z",
        "2"
      );

      // Sorted: [2, 1]
      // Index of '2' is 0
      // Next is index -1 (null)
      // Prev is index 1

      expect(prev?.id).toBe("1");
      expect(next).toBeNull();
    });
  });
});
