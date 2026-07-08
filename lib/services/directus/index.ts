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
 *   counters.ts    → Site counter read/increment
 *   authors.ts     → Author profile queries
 *   blog-tags.ts   → Blog tag taxonomy queries
 *   blog-series.ts → Blog series/collection queries
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
  type GetPostsOptions,
} from "./blogs";

// Contact Messages
export {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  type ContactMessageInput,
  type GetContactMessagesOptions,
  type ContactMessagesResult,
} from "./contact";

// Counters
export {
  getCounterByKey,
  incrementCounterByKey,
  type CounterResult,
} from "./counters";

// Authors
export {
  getPublishedAuthors,
  getAuthorBySlug,
  type AuthorsResult,
  type AuthorResult,
} from "./authors";

// Blog tags
export {
  getPublishedTags,
  getTagBySlug,
  getPostsByTagSlug,
  type BlogTagsResult,
  type BlogTagResult,
  type PostsByTagResult,
} from "./blog-tags";

// Blog series
export {
  getPublishedSeries,
  getSeriesBySlug,
  getPostsInSeries,
  type BlogSeriesListResult,
  type BlogSeriesResult,
  type SeriesPostsResult,
} from "./blog-series";

// Constants
export { FUN_COUNTER_KEY } from "./constants";

// Error Types (for consumers that need structured error handling)
export { type DirectusErrorType, type DirectusErrorInfo } from "./errors";
