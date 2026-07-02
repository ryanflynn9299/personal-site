/**
 * Blog Query Functions
 *
 * All Directus queries for the `blogs` collection live here. This module
 * owns the data-fetching concern; transformation is delegated to transforms.ts.
 *
 * Exports:
 * - getPublishedPosts — paginated list of published posts
 * - getPostBySlug     — single post lookup by slug
 * - getAdjacentPosts  — prev/next chronological navigation
 */

import { readItems } from "@directus/sdk";
import type { Post } from "@/types";
import { createLogger } from "@/lib/dev-tooling/logger";
import { runtime } from "@/lib/config";
import { isFeatureEnabled } from "@/lib/dev-tooling/features";
import { dummyPosts } from "@/data/dummy-posts";

import {
  isDirectusConfigured,
  getDirectusClient,
  getDirectusUrl,
} from "./client";
import { classifyDirectusError } from "./errors";
import { transformRawPost, BLOG_FIELDS } from "./transforms";

const log = createLogger("ALL");
const devLog = createLogger("DEV");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GetPostsOptions {
  limit?: number;
  page?: number;
  search?: string;
}

// ---------------------------------------------------------------------------
// getPublishedPosts
// ---------------------------------------------------------------------------

/**
 * Fetches published blog posts from Directus with optional pagination and search.
 *
 * Graceful degradation order:
 * 1. If `offlineDummyBlogs` feature flag is on → return dummy data
 * 2. If services are disabled (offline-dev/test) → return error/empty
 * 3. If Directus is not configured → return error/empty (logged in prod)
 * 4. Otherwise → fetch from Directus, transform, and return
 */
export async function getPublishedPosts(options?: GetPostsOptions): Promise<{
  status: "success" | "error";
  posts: Post[];
  total?: number;
}> {
  // 1. Dummy posts feature flag
  if (isFeatureEnabled("offlineDummyBlogs")) {
    log.info("Returning dummy posts based on offlineDummyBlogs feature flag");
    return { status: "success", posts: dummyPosts };
  }

  // 2. Services disabled
  if (!runtime.connectToServices) {
    return { status: "error", posts: [] };
  }

  // 3. Directus not configured
  const client = getDirectusClient();
  if (!isDirectusConfigured() || !client) {
    if (runtime.treatServiceErrorsAsReal) {
      log.error(
        {
          mode: runtime.mode,
          directusConfigured: isDirectusConfigured(),
          directusClientExists: !!client,
        },
        "Failed to fetch posts: Directus not configured in production/live-dev mode"
      );
    } else {
      log.warn("Directus not configured, returning empty posts list");
    }
    return { status: "error", posts: [] };
  }

  // 4. Fetch from Directus
  const directusUrl = getDirectusUrl();
  const requestStartTime = Date.now();

  try {
    const requestParams: Record<string, unknown> = {
      fields: [...BLOG_FIELDS],
      filter: { status: { _eq: "published" } },
      sort: ["-publication_date"],
      meta: ["filter_count"],
    };

    if (options?.limit) {
      requestParams.limit = options.limit;
    }
    if (options?.page) {
      requestParams.page = options.page;
    }
    if (options?.search) {
      requestParams.search = options.search;
    }

    devLog.info(
      {
        service: "Directus",
        operation: "getPublishedPosts",
        url: directusUrl,
        request: requestParams,
      },
      "Initiating Directus service call: getPublishedPosts"
    );

    const response = await (
      client as unknown as { request: (cmd: unknown) => Promise<unknown> }
    ).request(readItems("blogs" as never, requestParams as never));

    const requestDuration = Date.now() - requestStartTime;

    devLog.info(
      {
        service: "Directus",
        operation: "getPublishedPosts",
        url: directusUrl,
        response: {
          status: "success",
          postCount: Array.isArray(response) ? response.length : 0,
          durationMs: requestDuration,
        },
      },
      "Directus service call completed: getPublishedPosts"
    );

    // The SDK may return an array or { data, meta } depending on configuration
    const isResponseArray = Array.isArray(response);
    const resultPosts = isResponseArray
      ? response
      : (response as Record<string, unknown>)?.data || [];
    const filterCount = isResponseArray
      ? null
      : ((response as Record<string, unknown>)?.meta as Record<string, unknown>)
          ?.filter_count;

    if (!resultPosts || (resultPosts as unknown[]).length === 0) {
      log.debug("No published posts found in Directus");
      return {
        status: "success",
        posts: [],
        total: filterCount ? Number(filterCount) : 0,
      };
    }

    // Transform with shared transformer, filter out invalid records
    const transformedPosts = (resultPosts as Record<string, unknown>[])
      .map((raw) =>
        transformRawPost(
          raw as Partial<import("@/types/directus").DirectusBlogPost>
        )
      )
      .filter((post): post is Post => post !== null);

    log.debug(
      {
        count: transformedPosts.length,
        total: (resultPosts as unknown[]).length,
      },
      "Successfully fetched and transformed posts"
    );

    return {
      status: "success",
      posts: transformedPosts,
      total: filterCount ? Number(filterCount) : transformedPosts.length,
    };
  } catch (error) {
    return handleBlogQueryError(
      "getPublishedPosts",
      error,
      requestStartTime,
      directusUrl
    );
  }
}

// ---------------------------------------------------------------------------
// getPostBySlug
// ---------------------------------------------------------------------------

/**
 * Fetches a single published post by its unique slug.
 *
 * Security: Filters for `status: 'published'` to prevent accessing drafts via URL.
 * Returns null for missing posts so the calling page can render a 404.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Input validation
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    log.warn({ slug }, "Invalid slug provided to getPostBySlug");
    return null;
  }

  // Dummy posts feature flag
  if (isFeatureEnabled("offlineDummyBlogs")) {
    const post = dummyPosts.find((p) => p.slug === slug);
    if (post) {
      log.info(
        { slug },
        "Returning dummy post based on offlineDummyBlogs feature flag"
      );
      return post;
    }
  }

  // Services disabled
  if (!runtime.connectToServices) {
    return null;
  }

  // Directus not configured
  const client = getDirectusClient();
  if (!isDirectusConfigured() || !client) {
    if (runtime.treatServiceErrorsAsReal) {
      log.error(
        {
          mode: runtime.mode,
          slug,
          directusConfigured: isDirectusConfigured(),
          directusClientExists: !!client,
        },
        "Failed to fetch post by slug: Directus not configured in production/live-dev mode"
      );
    } else {
      log.warn("Directus not configured, cannot fetch post by slug");
    }
    return null;
  }

  const directusUrl = getDirectusUrl();
  const requestStartTime = Date.now();

  try {
    const requestParams = {
      filter: {
        _and: [{ slug: { _eq: slug } }, { status: { _eq: "published" } }],
      },
      limit: 1,
      fields: [...BLOG_FIELDS],
    };

    devLog.info(
      {
        service: "Directus",
        operation: "getPostBySlug",
        url: directusUrl,
        request: { ...requestParams, slug },
      },
      "Initiating Directus service call: getPostBySlug"
    );

    const posts = await (
      client as unknown as { request: (cmd: unknown) => Promise<unknown[]> }
    ).request(readItems("blogs" as never, requestParams as never));

    const requestDuration = Date.now() - requestStartTime;

    devLog.info(
      {
        service: "Directus",
        operation: "getPostBySlug",
        url: directusUrl,
        response: {
          status: posts && posts.length > 0 ? "found" : "not_found",
          postCount: posts?.length || 0,
          durationMs: requestDuration,
        },
        slug,
      },
      "Directus service call completed: getPostBySlug"
    );

    if (!posts || posts.length === 0) {
      log.debug({ slug }, "Post not found or not published");
      return null;
    }

    const transformedPost = transformRawPost(
      posts[0] as Partial<import("@/types/directus").DirectusBlogPost>
    );

    if (!transformedPost) {
      log.error(
        { slug, postId: (posts[0] as Record<string, unknown>).id },
        "Post found but transformation failed"
      );
      return null;
    }

    // Override status since our filter guarantees it's published
    transformedPost.status = "published";

    log.debug(
      { slug, postId: transformedPost.id },
      "Successfully fetched post by slug"
    );
    return transformedPost;
  } catch (error) {
    const errorInfo = classifyDirectusError(error);

    // 404 is expected (post doesn't exist) — not an error
    if (errorInfo.type === "not_found") {
      log.debug(
        { slug, errorType: errorInfo.type },
        "Post not found in Directus"
      );
      return null;
    }

    handleBlogQueryError(
      "getPostBySlug",
      error,
      requestStartTime,
      directusUrl,
      { slug }
    );
    return null;
  }
}

// ---------------------------------------------------------------------------
// getAdjacentPosts
// ---------------------------------------------------------------------------

/**
 * Resolves chronological prev/next posts from an already-fetched post list.
 */
export function resolveAdjacentPosts(
  posts: Post[],
  currentPostDate: string,
  currentPostId: string
): { prev: Post | null; next: Post | null } {
  if (!posts || posts.length === 0) {
    return { prev: null, next: null };
  }

  const sortedPosts = [...posts].sort((a, b) => {
    const timeDiff =
      new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return b.id.localeCompare(a.id);
  });

  const currentIndex = sortedPosts.findIndex((p) => p.id === currentPostId);
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prevPost =
    currentIndex < sortedPosts.length - 1
      ? sortedPosts[currentIndex + 1]
      : null;
  const nextPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;

  return { prev: prevPost, next: nextPost };
}

/**
 * Fetches published posts and resolves prev/next for a given post.
 */
export async function getAdjacentPosts(
  currentPostDate: string,
  currentPostId: string
): Promise<{ prev: Post | null; next: Post | null }> {
  const { status, posts } = await getPublishedPosts();

  if (status === "error" || !posts || posts.length === 0) {
    return { prev: null, next: null };
  }

  return resolveAdjacentPosts(posts, currentPostDate, currentPostId);
}

// ---------------------------------------------------------------------------
// Shared Error Handler
// ---------------------------------------------------------------------------

/**
 * Consistent error logging for blog query failures.
 * Returns an error result for getPublishedPosts; getPostBySlug handles its own return.
 */
function handleBlogQueryError(
  operation: string,
  error: unknown,
  requestStartTime: number,
  directusUrl: string | null,
  context?: Record<string, unknown>
): { status: "error"; posts: Post[] } {
  const errorInfo = classifyDirectusError(error);
  const requestDuration = Date.now() - requestStartTime;

  devLog.error(
    {
      service: "Directus",
      operation,
      url: directusUrl,
      error: {
        type: errorInfo.type,
        message: errorInfo.message,
        statusCode: errorInfo.statusCode,
        durationMs: requestDuration,
      },
      ...context,
    },
    `Directus service call failed: ${operation}`
  );

  if (runtime.treatServiceErrorsAsReal) {
    log.error(
      {
        error: errorInfo.originalError,
        errorType: errorInfo.type,
        statusCode: errorInfo.statusCode,
        message: errorInfo.message,
        mode: runtime.mode,
        ...context,
      },
      `CRITICAL: Failed ${operation} in production/live-dev mode`
    );
  } else {
    log.error(
      {
        error: errorInfo.originalError,
        errorType: errorInfo.type,
        statusCode: errorInfo.statusCode,
        message: errorInfo.message,
        ...context,
      },
      `Failed ${operation}`
    );
  }

  return { status: "error", posts: [] };
}
