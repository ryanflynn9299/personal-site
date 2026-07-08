/**
 * Blog Tag Query Functions
 *
 * Directus operations for the `blog_tags` collection.
 * Post-level tag strings on `blogs.blog_tags` remain until M2M migration.
 * UI routes (e.g. `/blog/tag/[slug]`) are not implemented yet — handlers only.
 */

import { readItems } from "@directus/sdk";
import type { BlogTag, Post } from "@/types";
import { createLogger } from "@/lib/dev-tooling/logger";

import { getPublishedPosts } from "./blogs";
import {
  getDirectusQueryContext,
  logDirectusOperationStart,
  logDirectusOperationSuccess,
  logDirectusOperationError,
  directusRequest,
  unwrapListResponse,
} from "./query-context";
import { BLOG_TAG_FIELDS, transformRawBlogTag } from "./transforms";

const log = createLogger("ALL");

export interface BlogTagsResult {
  status: "success" | "error";
  tags: BlogTag[];
}

export interface BlogTagResult {
  status: "success" | "error";
  tag: BlogTag | null;
}

export interface PostsByTagResult {
  status: "success" | "error";
  tag: BlogTag | null;
  posts: Post[];
}

/**
 * Fetches all published blog tags, sorted by `sort` then label.
 */
export async function getPublishedTags(): Promise<BlogTagsResult> {
  const ctx = getDirectusQueryContext("getPublishedTags");
  if (!ctx) {
    return { status: "error", tags: [] };
  }

  const requestStartTime = logDirectusOperationStart(
    "getPublishedTags",
    ctx.directusUrl,
    { filter: "status=published" }
  );

  try {
    const response = await directusRequest(
      ctx.client,
      readItems(
        "blog_tags" as never,
        {
          filter: { status: { _eq: "published" } },
          sort: ["sort", "label"],
          fields: [...BLOG_TAG_FIELDS],
        } as never
      )
    );

    const rows = unwrapListResponse(response);
    logDirectusOperationSuccess(
      "getPublishedTags",
      ctx.directusUrl,
      { count: rows.length },
      requestStartTime
    );

    if (rows.length === 0) {
      log.debug("No published blog tags found in Directus");
      return { status: "success", tags: [] };
    }

    const tags = rows
      .map((raw) =>
        transformRawBlogTag(
          raw as Partial<import("@/types/directus").DirectusBlogTag>
        )
      )
      .filter((tag): tag is BlogTag => tag !== null);

    return { status: "success", tags };
  } catch (error) {
    logDirectusOperationError(
      "getPublishedTags",
      error,
      requestStartTime,
      ctx.directusUrl
    );
    return { status: "error", tags: [] };
  }
}

/**
 * Fetches a single published tag by slug.
 */
export async function getTagBySlug(slug: string): Promise<BlogTagResult> {
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    log.warn({ slug }, "Invalid slug provided to getTagBySlug");
    return { status: "error", tag: null };
  }

  const ctx = getDirectusQueryContext("getTagBySlug");
  if (!ctx) {
    return { status: "error", tag: null };
  }

  const requestStartTime = logDirectusOperationStart(
    "getTagBySlug",
    ctx.directusUrl,
    { slug }
  );

  try {
    const response = await directusRequest(
      ctx.client,
      readItems(
        "blog_tags" as never,
        {
          filter: {
            _and: [{ slug: { _eq: slug } }, { status: { _eq: "published" } }],
          },
          limit: 1,
          fields: [...BLOG_TAG_FIELDS],
        } as never
      )
    );

    const rows = unwrapListResponse(response);
    logDirectusOperationSuccess(
      "getTagBySlug",
      ctx.directusUrl,
      { found: rows.length > 0 },
      requestStartTime
    );

    if (rows.length === 0) {
      log.debug({ slug }, "Blog tag not found in Directus");
      return { status: "success", tag: null };
    }

    const tag = transformRawBlogTag(
      rows[0] as Partial<import("@/types/directus").DirectusBlogTag>
    );
    return { status: tag ? "success" : "error", tag };
  } catch (error) {
    logDirectusOperationError(
      "getTagBySlug",
      error,
      requestStartTime,
      ctx.directusUrl,
      { slug }
    );
    return { status: "error", tag: null };
  }
}

/**
 * Resolves a tag and filters published posts whose `blog_tags` include the slug or label.
 * Works with the current inline tag strings on blog posts.
 */
export async function getPostsByTagSlug(
  slug: string
): Promise<PostsByTagResult> {
  const { status: tagStatus, tag } = await getTagBySlug(slug);
  if (tagStatus === "error") {
    return { status: "error", tag: null, posts: [] };
  }

  const { status, posts } = await getPublishedPosts();
  if (status === "error") {
    return { status: "error", tag, posts: [] };
  }

  if (!tag) {
    log.debug({ slug }, "No tag metadata; cannot filter posts by tag slug");
    return { status: "success", tag: null, posts: [] };
  }

  const matchers = new Set(
    [tag.slug, tag.label].map((value) => value.trim().toLowerCase())
  );

  const filtered = posts.filter((post) =>
    post.tags.some((entry) => matchers.has(entry.trim().toLowerCase()))
  );

  log.debug(
    { slug, matchCount: filtered.length },
    "Filtered published posts by tag slug"
  );

  return { status: "success", tag, posts: filtered };
}
