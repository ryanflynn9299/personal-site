import { createDirectus, readItems, rest } from "@directus/sdk";
import { Post } from "@/types";
import log from "./logger";

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
 * Returns true if both required environment variables are set with non-placeholder values.
 * 
 * In dev mode without .env file, these will be undefined or use placeholder values.
 */
export function isDirectusConfigured(): boolean {
  const serverUrl = process.env.DIRECTUS_URL_SERVER_SIDE;
  const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  
  // Check if both URLs are set, not empty, and not placeholder values
  const hasServerUrl = serverUrl && 
                       serverUrl.trim() !== "" && 
                       !serverUrl.includes("your-") && // Exclude placeholder text
                       serverUrl !== "http://ps-directus:8055"; // Default from .env.example
  
  const hasPublicUrl = publicUrl && 
                       publicUrl.trim() !== "" && 
                       !publicUrl.includes("your-") && // Exclude placeholder text
                       publicUrl !== "http://localhost:8055"; // Default from .env.example
  
  return !!(hasServerUrl && hasPublicUrl);
}

/**
 * Determines the correct Directus URL based on the runtime environment.
 * Returns null if Directus is not configured (graceful degradation).
 */
const getDirectusUrl = (): string | null => {
  // Check if we are on the server-side (e.g., SSR, API Routes, getStaticProps).
  if (typeof window === "undefined") {
    const serverUrl = process.env.DIRECTUS_URL_SERVER_SIDE;
    // Use default placeholder if not set (for dev mode)
    if (!serverUrl || serverUrl === "http://ps-directus:8055") {
      return null;
    }
    return serverUrl;
  }

  // We are on the client (browser). This MUST be a NEXT_PUBLIC_ variable.
  const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  // Use default placeholder if not set (for dev mode)
  if (!publicUrl || publicUrl === "http://localhost:8055") {
    return null;
  }
  return publicUrl;
};

/**
 * A helper function to get the full public asset URL from a Directus file ID.
 * This should *always* use the public URL, as asset URLs are used by the client.
 * @param fileId - The ID of the file in Directus.
 * @returns The full URL to the asset, or null if fileId is null/undefined.
 */
function getAssetURL(fileId: string | null | undefined): string | null {
  if (!fileId) return null;
  // Use the public URL directly. Ensure this var is set.
  const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!publicUrl) {
    log.error(
      { fileId },
      "Cannot create asset URL: NEXT_PUBLIC_DIRECTUS_URL is not set"
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
    const statusCode = (error as { status?: number; statusCode?: number }).status || 
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

// Create the Directus client instance only if configured.
// This module will be loaded *separately* by the server and the client.
// - On the server, getDirectusUrl() will return the internal URL.
// - On the client, getDirectusUrl() will return the public URL.
// If not configured, directus will be null and functions will return error status.
// Using 'any' type due to complex Directus SDK typing - type safety is maintained via runtime checks
let directus: any = null;

try {
  const url = getDirectusUrl();
  if (url) {
    directus = createDirectus(url).with(rest());
  }
} catch (error) {
  // Log client initialization errors for debugging
  log.error(
    { error, url: getDirectusUrl() },
    "Failed to initialize Directus client"
  );
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
  // Check if Directus is configured
  if (!isDirectusConfigured() || !directus) {
    log.warn("Directus not configured, returning empty posts list");
    return { status: "error", posts: [] };
  }

  try {
    const posts = await (directus as any).request(
      (readItems as any)("blogs", {
        fields: [
          "id",
          "title",
          "summary",
          "author",
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
      })
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
    log.error(
      {
        error: errorInfo.originalError,
        errorType: errorInfo.type,
        statusCode: errorInfo.statusCode,
        message: errorInfo.message,
      },
      "Failed to fetch published posts from Directus"
    );
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

  // Check if Directus is configured
  if (!isDirectusConfigured() || !directus) {
    log.warn("Directus not configured, cannot fetch post by slug");
    return null;
  }

  try {
    // Use readItems with a limit of 1. This is the standard way to fetch
    // an item by a secondary unique key (like a slug).
    const posts = await (directus as any).request(
      (readItems as any)("blogs", {
        // We use a logical AND to ensure both conditions are met.
        filter: {
          _and: [{ slug: { _eq: slug } }, { status: { _eq: "published" } }],
        },
        // We only need the first result that matches.
        limit: 1,
        // Specify all fields needed for the full 'Post' type.
        fields: [
          "id",
          "title",
          "summary",
          "author",
          "slug",
          "publication_date",
          "status",
          "feature_image",
          "blog_tags",
          "content",
        ],
      })
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

    log.debug({ slug, postId: transformedPost.id }, "Successfully fetched post by slug");
    return transformedPost;
  } catch (error) {
    const errorInfo = classifyDirectusError(error);
    
    // For "not_found" errors, we can return null without logging as an error
    // since this is an expected case (post doesn't exist)
    if (errorInfo.type === "not_found") {
      log.debug({ slug, errorType: errorInfo.type }, "Post not found in Directus");
      return null;
    }

    // For other errors, log as error
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

    // Return null on any unexpected error to prevent the page from crashing.
    return null;
  }
}
