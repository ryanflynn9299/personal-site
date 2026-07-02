/**
 * Directus Service Layer — Public API
 *
 * Barrel re-export for the Directus service module. Consumers should ONLY
 * import from this file (`@/lib/services/directus`), never from internal modules.
 *
 * Architecture:
 *   client.ts      → Client initialization, configuration checks, asset URLs
 *   errors.ts      → Error classification types and utilities
 *   blogs.ts       → Blog collection queries (published posts, by slug, adjacent)
 *   contact.ts     → Contact message write operations
 *   transforms.ts  → Raw Directus → frontend type transformers (internal)
 *
 * @see .docs/DIRECTUS.md for full architecture docs
 */

// Client & Configuration
export { isDirectusConfigured, getDirectusClient, getAssetUrl } from "./client";

// Blog Queries
export {
  getPublishedPosts,
  getPostBySlug,
  getAdjacentPosts,
  resolveAdjacentPosts,
  type GetPostsOptions,
} from "./blogs";

// Contact Messages
export { createContactMessage, type ContactMessageInput } from "./contact";

// Error Types (for consumers that need structured error handling)
export { type DirectusErrorType, type DirectusErrorInfo } from "./errors";
