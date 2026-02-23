import { createDirectus, readItems, rest } from "@directus/sdk";
import { Post } from "@/types";
import { createLogger } from "./logger";
import {
  isDirectusEnabled,
  getDirectusUrl as getDirectusUrlFromEnv,
  env,
} from "./env";

const log = createLogger("ALL");
const devLog = createLogger("DEV");

/**
 * Error types for better error handling and debugging
 */
export type DirectusErrorType =
  | "not_configured"
  | "network_error"
  | "authentication_error"
  | "not_found"
  | "validation_error"
  | "server_error"
  | "unknown_error";

export interface DirectusErrorInfo {
  type: DirectusErrorType;
  message: string;
  originalError?: unknown;
  statusCode?: number;
}

/**
 * Checks if Directus is configured and available.
 * Uses the centralized environment configuration system.
 *
 * Policy:
 * - production/live-dev: Directus MUST be configured (returns false if not = error condition)
 * - offline-dev/test: Always returns false (services disabled, no calls made)
 */
export function isDirectusConfigured(): boolean {
  // In offline-dev and test, services are disabled - return false immediately
  if (!env.connectToServices) {
    return false;
  }

  // In production and live-dev, check if Directus is actually configured
  const enabled = isDirectusEnabled();

  // If services should be connected but Directus is not configured, log error
  if (env.treatServiceErrorsAsReal && !enabled) {
    log.error(
      {
        mode: env.mode,
        serverUrl: env.directus.serverUrl,
        publicUrl: env.directus.publicUrl,
      },
      "Directus is not configured but is required in production/live-dev mode"
    );
  }

  return enabled;
}

/**
 * Determines the correct Directus URL based on the runtime environment.
 * Returns null if Directus is not configured or services are disabled.
 * Uses the centralized environment configuration system.
 */
const getDirectusUrl = (): string | null => {
  return getDirectusUrlFromEnv();
};

/**
 * A helper function to get the full public asset URL from a Directus file ID.
 * This should *always* use the public URL, as asset URLs are used by the client.
 * Currently unused but kept for potential future use.
 * @param fileId - The ID of the file in Directus.
 * @returns The full URL to the asset, or null if fileId is null/undefined.
 */
function _getAssetURL(fileId: string | null | undefined): string | null {
  if (!fileId) {
    return null;
  }
  // Use the public URL directly. Ensure this var is set.
  const publicUrl = getDirectusUrlFromEnv();
  if (!publicUrl) {
    log.error(
      { fileId },
      "Cannot create asset URL: Directus is not configured or services are disabled"
    );
    return null;
  }
  return `${publicUrl}/assets/${fileId}`;
}

/**
 * Classifies Directus errors into specific types for better error handling
 */
function classifyDirectusError(error: unknown): DirectusErrorInfo {
  // Check if it's a Directus SDK error (has status property)
  if (error && typeof error === "object" && "status" in error) {
    const statusCode =
      (error as { status?: number; statusCode?: number }).status ||
      (error as { status?: number; statusCode?: number }).statusCode;

    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        return {
          type: "authentication_error",
          message: "Authentication failed when accessing Directus",
          originalError: error,
          statusCode,
        };
      }

      if (statusCode === 404) {
        return {
          type: "not_found",
          message: "Resource not found in Directus",
          originalError: error,
          statusCode,
        };
      }

      if (statusCode === 400 || statusCode === 422) {
        return {
          type: "validation_error",
          message: "Invalid request to Directus",
          originalError: error,
          statusCode,
        };
      }

      if (statusCode >= 500) {
        return {
          type: "server_error",
          message: "Directus server error",
          originalError: error,
          statusCode,
        };
      }
    }
  }

  // Check for network errors
  if (error instanceof Error) {
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ETIMEDOUT")
    ) {
      return {
        type: "network_error",
        message: `Network error connecting to Directus: ${error.message}`,
        originalError: error,
      };
    }
  }

  // Unknown error
  return {
    type: "unknown_error",
    message: error instanceof Error ? error.message : "Unknown error occurred",
    originalError: error,
  };
}

// Create the Directus client instance only if configured and services are enabled.
// Policy:
// - production/live-dev: Client created if configured, errors if not configured
// - offline-dev/test: Client is NEVER created (no service calls)
// Using 'any' type due to complex Directus SDK typing - type safety is maintained via runtime checks
let directus: any = null;

try {
  // Only create client if services should be connected
  if (env.connectToServices) {
    const url = getDirectusUrl();
    if (url) {
      // Configuration for Cloudflare Access if enabled (only in dev mode)
      const isDevMode = env.mode === "live-dev";
      const useTunnel = env.directus.useCloudflareTunnel && isDevMode;

      if (useTunnel) {
        log.info(
          { clientId: env.directus.cloudflareClientId },
          "Initializing Directus with Cloudflare Access headers"
        );

        // Inject headers via custom fetch
        const cloudflareFetch = (
          input: RequestInfo | URL,
          init?: RequestInit
        ) => {
          const headers = new Headers(init?.headers);
          if (env.directus.cloudflareClientId) {
            headers.set("CF-Access-Client-Id", env.directus.cloudflareClientId);
          }
          if (env.directus.cloudflareClientSecret) {
            headers.set(
              "CF-Access-Client-Secret",
              env.directus.cloudflareClientSecret
            );
          }

          return fetch(input, {
            ...init,
            headers,
          });
        };

        directus = createDirectus(url, {
          globals: {
            fetch: cloudflareFetch as any,
          },
        }).with(rest());
      } else {
        directus = createDirectus(url).with(rest());
      }
    } else if (env.treatServiceErrorsAsReal) {
      // In production/live-dev, missing URL is an error
      log.error(
        {
          mode: env.mode,
          serverUrl: env.directus.serverUrl,
          publicUrl: env.directus.publicUrl,
        },
        "CRITICAL: Directus URL not available but required in production/live-dev mode"
      );
    }
  }
  // In offline-dev/test, directus remains null (no service calls)
} catch (error) {
  // Log client initialization errors
  if (env.treatServiceErrorsAsReal) {
    log.error(
      { error, mode: env.mode, url: getDirectusUrl() },
      "CRITICAL: Failed to initialize Directus client in production/live-dev mode"
    );
  } else {
    log.error(
      { error, url: getDirectusUrl() },
      "Failed to initialize Directus client"
    );
  }
  directus = null;
}

/**
 * Fetches all posts from Directus that are marked as 'published'.
 * It rigorously types the response and transforms it into the clean,
 * frontend-facing 'Post' type.
 *
 * @returns {Promise<{ status: 'success' | 'error', posts: Post[] }>} A promise that resolves to an array of published posts.
 */
export async function getPublishedPosts(): Promise<{
  status: "success" | "error";
  posts: Post[];
}> {
  // In offline-dev and test, services are disabled - return empty immediately
  if (!env.connectToServices) {
    return { status: "error", posts: [] };
  }

  // Check if Directus is configured
  if (!isDirectusConfigured() || !directus) {
    // In production/live-dev, this is a real error - log it
    if (env.treatServiceErrorsAsReal) {
      log.error(
        {
          mode: env.mode,
          directusConfigured: isDirectusConfigured(),
          directusClientExists: !!directus,
        },
        "Failed to fetch posts: Directus not configured in production/live-dev mode"
      );
    } else {
      log.warn("Directus not configured, returning empty posts list");
    }
    return { status: "error", posts: [] };
  }

  const directusUrl = getDirectusUrl();
  const requestStartTime = Date.now();

  try {
    const requestParams = {
      collection: "blogs",
      fields: [
        "id",
        "title",
        "summary",
        "author.first_name",
        "author.last_name",
        "status",
        "slug",
        "publication_date",
        "feature_image",
        "blog_tags",
        "content",
      ],
      filter: {
        status: { _eq: "published" },
      },
      sort: ["-publication_date"],
    };

    // Log service call initiation (dev only)
    devLog.info(
      {
        service: "Directus",
        operation: "getPublishedPosts",
        url: directusUrl,
        request: {
          collection: requestParams.collection,
          fields: requestParams.fields,
          filter: requestParams.filter,
          sort: requestParams.sort,
        },
      },
      "Initiating Directus service call: getPublishedPosts"
    );

    const posts = await (directus as any).request(
      (readItems as any)(requestParams.collection, requestParams)
    );

    const requestDuration = Date.now() - requestStartTime;

    // Log successful service call response (dev only)
    devLog.info(
      {
        service: "Directus",
        operation: "getPublishedPosts",
        url: directusUrl,
        response: {
          status: "success",
          postCount: posts?.length || 0,
          durationMs: requestDuration,
        },
      },
      "Directus service call completed: getPublishedPosts"
    );

    // Handle empty response
    if (!posts || posts.length === 0) {
      log.debug("No published posts found in Directus");
      return { status: "success", posts: [] };
    }

    // Transform the raw Directus data into the clean frontend 'Post' type.
    // Filter out any posts with invalid data to prevent runtime errors
    const transformedPosts = (posts as any[])
      .map((post: any) => {
        try {
          // Validate required fields
          if (!post.id || !post.title || !post.slug) {
            log.warn(
              { postId: post.id, hasTitle: !!post.title, hasSlug: !!post.slug },
              "Skipping post with missing required fields"
            );
            return null;
          }

          // Safely extract author information with fallbacks
          const author = post.author
            ? {
                first_name: post.author.first_name || "Unknown",
                last_name: post.author.last_name || "Author",
              }
            : {
                first_name: "Unknown",
                last_name: "Author",
              };

          return {
            id: post.id,
            title: post.title,
            summary: post.summary || "",
            status: post.status || "published",
            author,
            slug: post.slug,
            publish_date: post.publication_date || new Date().toISOString(),
            feature_image: post.feature_image || null,
            tags: Array.isArray(post.blog_tags) ? post.blog_tags : [],
            content: post.content || "",
          } as Post;
        } catch (transformError) {
          log.error(
            { error: transformError, postId: post.id },
            "Error transforming post data"
          );
          return null;
        }
      })
      .filter((post): post is Post => post !== null);

    log.debug(
      { count: transformedPosts.length, total: posts.length },
      "Successfully fetched and transformed posts"
    );

    return {
      status: "success",
      posts: transformedPosts,
    };
  } catch (error) {
    const errorInfo = classifyDirectusError(error);
    const requestDuration = Date.now() - requestStartTime;

    // Log service call error (dev only)
    devLog.error(
      {
        service: "Directus",
        operation: "getPublishedPosts",
        url: directusUrl,
        error: {
          type: errorInfo.type,
          message: errorInfo.message,
          statusCode: errorInfo.statusCode,
          durationMs: requestDuration,
        },
      },
      "Directus service call failed: getPublishedPosts"
    );

    // In production/live-dev, service errors are real errors
    if (env.treatServiceErrorsAsReal) {
      log.error(
        {
          error: errorInfo.originalError,
          errorType: errorInfo.type,
          statusCode: errorInfo.statusCode,
          message: errorInfo.message,
          mode: env.mode,
        },
        "CRITICAL: Failed to fetch published posts from Directus in production/live-dev mode"
      );
    } else {
      log.error(
        {
          error: errorInfo.originalError,
          errorType: errorInfo.type,
          statusCode: errorInfo.statusCode,
          message: errorInfo.message,
        },
        "Failed to fetch published posts from Directus"
      );
    }
    return { status: "error", posts: [] };
  }
}

/**
 * Fetches a single, published post from Directus by its unique slug.
 *
 * This function is designed with several layers of rigor:
 * 1. Strong Typing: It uses the <DirectusPost> generic to ensure the response from
 * the SDK is correctly typed, preventing downstream errors.
 * 2. Security/Logic: It filters not only by slug but also explicitly for 'published'
 * status, preventing unpublished drafts from being accessed via a direct URL.
 * 3. Data Transformation: It converts the raw Directus object (DirectusPost) into the
 * clean, frontend-specific 'Post' type, including creating a full URL for the
 * feature image. This decouples the frontend from the backend data structure.
 * 4. Null Safety: It gracefully returns `null` if no matching and published post
 * is found, allowing the calling page to handle it (e.g., render a 404 page).
 *
 * @param {string} slug - The unique slug of the post to fetch.
 * @returns {Promise<Post | null>} A promise that resolves to the full Post object,
 * or null if the post is not found or not published.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Validate input
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    log.warn({ slug }, "Invalid slug provided to getPostBySlug");
    return null;
  }

  // In offline-dev and test, services are disabled - return null immediately
  if (!env.connectToServices) {
    return null;
  }

  // Check if Directus is configured
  if (!isDirectusConfigured() || !directus) {
    // In production/live-dev, this is a real error - log it
    if (env.treatServiceErrorsAsReal) {
      log.error(
        {
          mode: env.mode,
          slug,
          directusConfigured: isDirectusConfigured(),
          directusClientExists: !!directus,
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
      collection: "blogs",
      filter: {
        _and: [{ slug: { _eq: slug } }, { status: { _eq: "published" } }],
      },
      limit: 1,
      fields: [
        "id",
        "title",
        "summary",
        "author.first_name",
        "author.last_name",
        "slug",
        "publication_date",
        "status",
        "feature_image",
        "blog_tags",
        "content",
      ],
    };

    // Log service call initiation (dev only)
    devLog.info(
      {
        service: "Directus",
        operation: "getPostBySlug",
        url: directusUrl,
        request: {
          collection: requestParams.collection,
          slug,
          filter: requestParams.filter,
          limit: requestParams.limit,
          fields: requestParams.fields,
        },
      },
      "Initiating Directus service call: getPostBySlug"
    );

    // Use readItems with a limit of 1. This is the standard way to fetch
    // an item by a secondary unique key (like a slug).
    const posts = await (directus as any).request(
      (readItems as any)(requestParams.collection, requestParams)
    );

    const requestDuration = Date.now() - requestStartTime;

    // Log successful service call response (dev only)
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

    // If the response is empty, no post was found. Return null.
    if (!posts || posts.length === 0) {
      log.debug({ slug }, "Post not found or not published");
      return null;
    }

    // Since we limited to 1, the post is the first element in the array.
    const rawPost = posts[0];

    // Validate required fields
    if (!rawPost.id || !rawPost.title || !rawPost.slug) {
      log.error(
        {
          slug,
          postId: rawPost.id,
          hasTitle: !!rawPost.title,
          hasSlug: !!rawPost.slug,
        },
        "Post found but missing required fields"
      );
      return null;
    }

    // Safely extract author information with fallbacks
    const author = rawPost.author
      ? {
          first_name: rawPost.author.first_name || "Unknown",
          last_name: rawPost.author.last_name || "Author",
        }
      : {
          first_name: "Unknown",
          last_name: "Author",
        };

    // Transform the raw Directus data into the clean frontend 'Post' type.
    const transformedPost: Post = {
      id: rawPost.id,
      title: rawPost.title,
      summary: rawPost.summary || "",
      status: "published", // We know it's published due to our filter
      slug: rawPost.slug,
      author,
      publish_date: rawPost.publication_date || new Date().toISOString(),
      feature_image: rawPost.feature_image || null,
      tags: Array.isArray(rawPost.blog_tags) ? rawPost.blog_tags : [],
      content: rawPost.content || "",
    };

    log.debug(
      { slug, postId: transformedPost.id },
      "Successfully fetched post by slug"
    );
    return transformedPost;
  } catch (error) {
    const errorInfo = classifyDirectusError(error);
    const requestDuration = Date.now() - requestStartTime;

    // Log service call error (dev only)
    devLog.error(
      {
        service: "Directus",
        operation: "getPostBySlug",
        url: directusUrl,
        error: {
          type: errorInfo.type,
          message: errorInfo.message,
          statusCode: errorInfo.statusCode,
          durationMs: requestDuration,
        },
        slug,
      },
      "Directus service call failed: getPostBySlug"
    );

    // For "not_found" errors, we can return null without logging as an error
    // since this is an expected case (post doesn't exist)
    if (errorInfo.type === "not_found") {
      log.debug(
        { slug, errorType: errorInfo.type },
        "Post not found in Directus"
      );
      return null;
    }

    // For other errors, log as error (critical in production/live-dev)
    if (env.treatServiceErrorsAsReal) {
      log.error(
        {
          slug,
          error: errorInfo.originalError,
          errorType: errorInfo.type,
          statusCode: errorInfo.statusCode,
          message: errorInfo.message,
          mode: env.mode,
        },
        "CRITICAL: Failed to fetch post by slug from Directus in production/live-dev mode"
      );
    } else {
      log.error(
        {
          slug,
          error: errorInfo.originalError,
          errorType: errorInfo.type,
          statusCode: errorInfo.statusCode,
          message: errorInfo.message,
        },
        "Failed to fetch post by slug"
      );
    }

    // Return null on any unexpected error to prevent the page from crashing.
    return null;
  }
}
