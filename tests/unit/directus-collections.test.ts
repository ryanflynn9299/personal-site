import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockRequest = vi.fn();
const mockDirectus = {
  request: mockRequest,
  with: vi.fn().mockReturnThis(),
};

vi.mock("@directus/sdk", () => ({
  createDirectus: vi.fn(() => mockDirectus),
  readItems: vi.fn((col, params) => ({ type: "readItems", col, params })),
  createItem: vi.fn((col, data) => ({ type: "createItem", col, data })),
  updateItem: vi.fn((col, id, data) => ({ type: "updateItem", col, id, data })),
  rest: vi.fn(),
}));

vi.mock("@/lib/dev-tooling/logger", () => {
  const mLog = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
  return { createLogger: () => mLog, log: mLog, devLog: mLog, default: mLog };
});

describe("Directus collection handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RUNTIME_MODE", "live-dev");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DIRECTUS_INTERNAL_URL", "http://internal:8055");
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("counters", () => {
    it("getCounterByKey returns success with null when row missing", async () => {
      mockRequest.mockResolvedValueOnce([]);
      const { getCounterByKey } = await import("@/lib/services/directus");
      const result = await getCounterByKey("contact-fun-counter");
      expect(result.status).toBe("success");
      expect(result.counter).toBeNull();
    });

    it("incrementCounterByKey creates row when missing", async () => {
      mockRequest.mockResolvedValueOnce([]).mockResolvedValueOnce({
        id: "c1",
        key: "contact-fun-counter",
        value: 1,
        metadata: { source: "contact-fun-counter" },
      });

      const { incrementCounterByKey } = await import("@/lib/services/directus");
      const result = await incrementCounterByKey("contact-fun-counter");
      expect(result.status).toBe("success");
      expect(result.counter?.value).toBe(1);
    });
  });

  describe("authors", () => {
    it("getPublishedAuthors returns empty list when none found", async () => {
      mockRequest.mockResolvedValueOnce([]);
      const { getPublishedAuthors } = await import("@/lib/services/directus");
      const result = await getPublishedAuthors();
      expect(result.status).toBe("success");
      expect(result.authors).toEqual([]);
    });

    it("getAuthorBySlug transforms a published author", async () => {
      mockRequest.mockResolvedValueOnce([
        {
          id: "a1",
          status: "published",
          slug: "ryan-flynn",
          first_name: "Ryan",
          last_name: "Flynn",
          emoji: "🪐",
          accent: "violet",
          role: "Software Engineer",
          bio_short: "Bio",
        },
      ]);

      const { getAuthorBySlug } = await import("@/lib/services/directus");
      const result = await getAuthorBySlug("ryan-flynn");
      expect(result.status).toBe("success");
      expect(result.author?.slug).toBe("ryan-flynn");
      expect(result.author?.accent).toBe("violet");
    });
  });

  describe("blog_tags", () => {
    it("getPublishedTags returns empty array in offline-dev", async () => {
      vi.stubEnv("RUNTIME_MODE", "offline-dev");
      vi.resetModules();
      const { getPublishedTags } = await import("@/lib/services/directus");
      const result = await getPublishedTags();
      expect(result.status).toBe("error");
      expect(result.tags).toEqual([]);
    });

    it("getPostsByTagSlug filters posts by tag slug", async () => {
      mockRequest
        .mockResolvedValueOnce([
          {
            id: "t1",
            status: "published",
            slug: "typescript",
            label: "TypeScript",
            description: "",
            color: null,
            sort: 1,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: "p1",
            title: "TS Post",
            slug: "ts-post",
            status: "published",
            publication_date: "2024-01-01T00:00:00Z",
            blog_tags: ["TypeScript"],
            author: { first_name: "Ryan", last_name: "Flynn" },
          },
          {
            id: "p2",
            title: "Other",
            slug: "other",
            status: "published",
            publication_date: "2024-01-02T00:00:00Z",
            blog_tags: ["Rust"],
            author: { first_name: "Ryan", last_name: "Flynn" },
          },
        ]);

      const { getPostsByTagSlug } = await import("@/lib/services/directus");
      const result = await getPostsByTagSlug("typescript");
      expect(result.status).toBe("success");
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].slug).toBe("ts-post");
    });
  });

  describe("blog_series", () => {
    it("getSeriesBySlug returns null when not found", async () => {
      mockRequest.mockResolvedValueOnce([]);
      const { getSeriesBySlug } = await import("@/lib/services/directus");
      const result = await getSeriesBySlug("launch-log");
      expect(result.status).toBe("success");
      expect(result.series).toBeNull();
    });
  });

  describe("contact_messages read", () => {
    it("getContactMessages returns empty list when none found", async () => {
      mockRequest.mockResolvedValueOnce({
        data: [],
        meta: { filter_count: 0 },
      });
      const { getContactMessages } = await import("@/lib/services/directus");
      const result = await getContactMessages({ status: "new", limit: 10 });
      expect(result.status).toBe("success");
      expect(result.messages).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("getContactMessages transforms rows", async () => {
      mockRequest.mockResolvedValueOnce([
        {
          id: "m1",
          name: "Ada",
          email: "ada@example.com",
          message: "Hello",
          status: "new",
          date_created: "2024-01-01T00:00:00Z",
        },
      ]);

      const { getContactMessages } = await import("@/lib/services/directus");
      const result = await getContactMessages();
      expect(result.status).toBe("success");
      expect(result.messages[0].name).toBe("Ada");
      expect(result.messages[0].created_at).toBe("2024-01-01T00:00:00Z");
    });
  });
});
