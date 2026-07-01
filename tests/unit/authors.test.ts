import { describe, it, expect } from "vitest";
import {
  authorNameToSlug,
  buildAuthorContext,
  formatAuthorDisplayName,
  formatAuthorPostCount,
  formatAuthorTopicCount,
  resolveAuthor,
  truncateBio,
} from "@/lib/site/authors";
import type { Post } from "@/types";

function makePost(
  overrides: Partial<Post> & Pick<Post, "id" | "title" | "slug">
): Post {
  return {
    status: "published",
    summary: "Summary",
    author: { first_name: "Ryan", last_name: "Flynn" },
    publish_date: "2024-01-01T00:00:00Z",
    feature_image: null,
    content: "Content",
    tags: [],
    ...overrides,
  };
}

describe("resolveAuthor", () => {
  it("applies operator accent override for Ryan Flynn", () => {
    const author = resolveAuthor({ first_name: "Ryan", last_name: "Flynn" });
    expect(author.emoji).toBe("🪐");
    expect(author.accent).toBe("violet");
    expect(author.accent_hex).toBe("#8b5cf6");
    expect(author.bio_short).toContain("backend development");
  });

  it("auto-assigns accent for guest authors without override", () => {
    const author = resolveAuthor({ first_name: "Gemini", last_name: "" });
    expect(author.slug).toBe("gemini");
    expect(author.emoji).toBe("🤖");
    expect(author.accent).toBeTruthy();
  });

  it("uses stable accent for the same slug across calls", () => {
    const first = resolveAuthor({ first_name: "Guest", last_name: "Writer" });
    const second = resolveAuthor({ first_name: "Guest", last_name: "Writer" });
    expect(first.accent).toBe(second.accent);
  });

  it("falls back for unknown authors", () => {
    const author = resolveAuthor({
      first_name: "Mystery",
      last_name: "Person",
    });
    expect(author.display_name).toBe("Mystery Person");
    expect(author.emoji).toBe("✍️");
    expect(author.bio_short).toBeUndefined();
  });

  it("formats display name when last name is empty", () => {
    expect(formatAuthorDisplayName("Gemini", "")).toBe("Gemini");
  });
});

describe("authorNameToSlug", () => {
  it("normalizes names into slugs", () => {
    expect(authorNameToSlug("Ryan", "Flynn")).toBe("ryan-flynn");
    expect(authorNameToSlug("Gemini", "")).toBe("gemini");
  });
});

describe("buildAuthorContext", () => {
  const posts: Post[] = [
    makePost({
      id: "1",
      title: "First",
      slug: "first",
      tags: ["nextjs", "typescript"],
    }),
    makePost({
      id: "2",
      title: "Second",
      slug: "second",
      publish_date: "2024-02-01T00:00:00Z",
      tags: ["nextjs"],
    }),
    makePost({
      id: "3",
      title: "Guest post",
      slug: "guest-post",
      author: { first_name: "Gemini", last_name: "" },
      tags: [],
    }),
  ];

  it("aggregates post and topic counts", () => {
    const author = resolveAuthor({ first_name: "Ryan", last_name: "Flynn" });
    const context = buildAuthorContext(posts, author);

    expect(context.post_count).toBe(2);
    expect(context.topic_count).toBe(2);
    expect(context.top_tags).toEqual(["nextjs", "typescript"]);
  });

  it("excludes the current post from recent posts", () => {
    const author = resolveAuthor({ first_name: "Ryan", last_name: "Flynn" });
    const context = buildAuthorContext(posts, author, {
      currentPostId: "1",
      recentLimit: 3,
    });

    expect(context.recent_posts).toHaveLength(1);
    expect(context.recent_posts[0]?.id).toBe("2");
  });

  it("returns empty context for authors with no posts", () => {
    const author = resolveAuthor({ first_name: "Nobody", last_name: "Here" });
    const context = buildAuthorContext(posts, author);

    expect(context.post_count).toBe(0);
    expect(context.topic_count).toBe(0);
    expect(context.recent_posts).toEqual([]);
  });

  it("limits recent posts to the requested count", () => {
    const manyPosts = Array.from({ length: 5 }, (_, index) =>
      makePost({
        id: String(index + 1),
        title: `Post ${index + 1}`,
        slug: `post-${index + 1}`,
        publish_date: `2024-0${index + 1}-01T00:00:00Z`,
      })
    );
    const author = resolveAuthor({ first_name: "Ryan", last_name: "Flynn" });
    const context = buildAuthorContext(manyPosts, author, { recentLimit: 3 });

    expect(context.recent_posts).toHaveLength(3);
  });
});

describe("formatAuthorPostCount", () => {
  it("returns null for zero posts", () => {
    expect(formatAuthorPostCount(0)).toBeNull();
  });

  it("uses singular copy for one post", () => {
    expect(formatAuthorPostCount(1)).toBe("1 post");
  });

  it("uses plural copy for multiple posts", () => {
    expect(formatAuthorPostCount(3)).toBe("3 posts");
  });
});

describe("formatAuthorTopicCount", () => {
  it("returns null for zero topics", () => {
    expect(formatAuthorTopicCount(0)).toBeNull();
  });

  it("uses singular copy for one topic", () => {
    expect(formatAuthorTopicCount(1)).toBe("1 topic");
  });
});

describe("truncateBio", () => {
  it("returns short bios unchanged", () => {
    expect(truncateBio("Short bio")).toBe("Short bio");
  });

  it("truncates long bios with an ellipsis", () => {
    const longBio = "a".repeat(200);
    expect(truncateBio(longBio, 50)).toMatch(/…$/);
    expect(truncateBio(longBio, 50).length).toBeLessThanOrEqual(50);
  });
});
