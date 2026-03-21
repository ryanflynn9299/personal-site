import { describe, it, expect, vi } from "vitest";

// Mock logger to avoid console output during tests
vi.mock("@/lib/dev-tooling/logger", () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
  return {
    createLogger: vi.fn(() => mockLogger),
  };
});

import {
  transformRawPost,
  BLOG_FIELDS,
} from "@/lib/services/directus/transforms";
import type { DirectusBlogPost } from "@/types/directus";

describe("transformRawPost", () => {
  // -----------------------------------------------------------------------
  // Valid Records
  // -----------------------------------------------------------------------

  describe("valid records", () => {
    it("transforms a fully populated record", () => {
      const raw: DirectusBlogPost = {
        id: "abc-123",
        status: "published",
        title: "My Post",
        summary: "A summary",
        slug: "my-post",
        publication_date: "2024-06-15T12:00:00Z",
        content: "# Hello\nWorld",
        feature_image: { id: 42, filename: "cover.jpg" },
        blog_tags: ["typescript", "react"],
        author: { first_name: "Ryan", last_name: "Flynn" },
      };

      const result = transformRawPost(raw);

      expect(result).not.toBeNull();
      expect(result!.id).toBe("abc-123");
      expect(result!.title).toBe("My Post");
      expect(result!.summary).toBe("A summary");
      expect(result!.slug).toBe("my-post");
      expect(result!.status).toBe("published");
      expect(result!.publish_date).toBe("2024-06-15T12:00:00Z");
      expect(result!.content).toBe("# Hello\nWorld");
      expect(result!.feature_image).toEqual({ id: 42, filename: "cover.jpg" });
      expect(result!.tags).toEqual(["typescript", "react"]);
      expect(result!.author).toEqual({
        first_name: "Ryan",
        last_name: "Flynn",
      });
    });

    it("maps publication_date to publish_date", () => {
      const result = transformRawPost({
        id: "1",
        title: "T",
        slug: "t",
        publication_date: "2024-01-01T00:00:00Z",
      });
      expect(result!.publish_date).toBe("2024-01-01T00:00:00Z");
    });

    it("maps blog_tags to tags", () => {
      const result = transformRawPost({
        id: "1",
        title: "T",
        slug: "t",
        blog_tags: ["a", "b"],
      });
      expect(result!.tags).toEqual(["a", "b"]);
    });
  });

  // -----------------------------------------------------------------------
  // Missing Optional Fields (Fallbacks)
  // -----------------------------------------------------------------------

  describe("missing optional fields", () => {
    it("defaults summary to empty string", () => {
      const result = transformRawPost({ id: "1", title: "T", slug: "s" });
      expect(result!.summary).toBe("");
    });

    it("defaults content to empty string", () => {
      const result = transformRawPost({ id: "1", title: "T", slug: "s" });
      expect(result!.content).toBe("");
    });

    it("defaults feature_image to null", () => {
      const result = transformRawPost({ id: "1", title: "T", slug: "s" });
      expect(result!.feature_image).toBeNull();
    });

    it("defaults tags to empty array when blog_tags is missing", () => {
      const result = transformRawPost({ id: "1", title: "T", slug: "s" });
      expect(result!.tags).toEqual([]);
    });

    it("defaults tags to empty array when blog_tags is not an array", () => {
      const result = transformRawPost({
        id: "1",
        title: "T",
        slug: "s",
        blog_tags: "not-an-array" as unknown as string[],
      });
      expect(result!.tags).toEqual([]);
    });

    it("defaults status to 'published' when missing", () => {
      const result = transformRawPost({ id: "1", title: "T", slug: "s" });
      expect(result!.status).toBe("published");
    });

    it("provides a fallback publish_date when publication_date is missing", () => {
      const before = new Date().toISOString();
      const result = transformRawPost({ id: "1", title: "T", slug: "s" });
      const after = new Date().toISOString();

      // Should be a valid ISO date between before and after
      expect(result!.publish_date >= before).toBe(true);
      expect(result!.publish_date <= after).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Author Fallbacks
  // -----------------------------------------------------------------------

  describe("author fallbacks", () => {
    it("defaults to 'Unknown Author' when author is null", () => {
      const result = transformRawPost({
        id: "1",
        title: "T",
        slug: "s",
        author: null,
      });
      expect(result!.author).toEqual({
        first_name: "Unknown",
        last_name: "Author",
      });
    });

    it("defaults to 'Unknown Author' when author is undefined", () => {
      const result = transformRawPost({ id: "1", title: "T", slug: "s" });
      expect(result!.author).toEqual({
        first_name: "Unknown",
        last_name: "Author",
      });
    });

    it("defaults first_name when empty", () => {
      const result = transformRawPost({
        id: "1",
        title: "T",
        slug: "s",
        author: { first_name: "", last_name: "Smith" },
      });
      expect(result!.author.first_name).toBe("Unknown");
    });

    it("defaults last_name when empty", () => {
      const result = transformRawPost({
        id: "1",
        title: "T",
        slug: "s",
        author: { first_name: "John", last_name: "" },
      });
      expect(result!.author.last_name).toBe("Author");
    });
  });

  // -----------------------------------------------------------------------
  // Missing Required Fields (Returns null)
  // -----------------------------------------------------------------------

  describe("missing required fields", () => {
    it("returns null when id is missing", () => {
      const result = transformRawPost({
        title: "T",
        slug: "s",
      } as Partial<DirectusBlogPost>);
      expect(result).toBeNull();
    });

    it("returns null when title is missing", () => {
      const result = transformRawPost({
        id: "1",
        slug: "s",
      } as Partial<DirectusBlogPost>);
      expect(result).toBeNull();
    });

    it("returns null when slug is missing", () => {
      const result = transformRawPost({
        id: "1",
        title: "T",
      } as Partial<DirectusBlogPost>);
      expect(result).toBeNull();
    });
  });
});

// -----------------------------------------------------------------------
// BLOG_FIELDS Constant
// -----------------------------------------------------------------------

describe("BLOG_FIELDS", () => {
  it("includes all required fields for blog queries", () => {
    expect(BLOG_FIELDS).toContain("id");
    expect(BLOG_FIELDS).toContain("title");
    expect(BLOG_FIELDS).toContain("slug");
    expect(BLOG_FIELDS).toContain("content");
    expect(BLOG_FIELDS).toContain("publication_date");
    expect(BLOG_FIELDS).toContain("blog_tags");
    expect(BLOG_FIELDS).toContain("author.first_name");
    expect(BLOG_FIELDS).toContain("author.last_name");
  });
});
