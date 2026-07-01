/**
 * Directus Data Transformers
 *
 * Converts raw Directus API shapes into clean, frontend-facing types.
 * This module eliminates the duplication that existed when both
 * getPublishedPosts and getPostBySlug had their own inline transformations.
 *
 * @see types/directus.ts for raw API shapes
 * @see types/index.ts for the frontend-facing `Post` type
 */

import type { Post } from "@/types";
import type { DirectusBlogPost } from "@/types/directus";
import { createLogger } from "@/lib/dev-tooling/logger";

const log = createLogger("ALL");

/**
 * Fields to request from the Directus `blogs` collection.
 * Shared by all blog query functions to ensure consistency.
 */
export const BLOG_FIELDS = [
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
] as const;

/**
 * Transforms a raw Directus blog post into the frontend-facing Post type.
 * Returns null if required fields (id, title, slug) are missing, which
 * allows callers to filter out invalid records.
 *
 * @param raw - A raw row from the Directus `blogs` collection
 * @returns The transformed Post, or null if the record is invalid
 */
export function transformRawPost(raw: Partial<DirectusBlogPost>): Post | null {
  try {
    // Validate required fields
    if (!raw.id || !raw.title || !raw.slug) {
      log.warn(
        { postId: raw.id, hasTitle: !!raw.title, hasSlug: !!raw.slug },
        "Skipping post with missing required fields"
      );
      return null;
    }

    // Safely extract author with fallbacks
    const author = raw.author
      ? {
          first_name: raw.author.first_name || "Unknown",
          last_name: raw.author.last_name || "Author",
        }
      : {
          first_name: "Unknown",
          last_name: "Author",
        };

    return {
      id: raw.id,
      title: raw.title,
      summary: raw.summary || "",
      status: raw.status || "published",
      slug: raw.slug,
      author,
      publish_date: raw.publication_date || new Date().toISOString(),
      feature_image: raw.feature_image || null,
      tags: Array.isArray(raw.blog_tags) ? raw.blog_tags : [],
      content: raw.content || "",
    };
  } catch (error) {
    log.error({ error, postId: raw.id }, "Error transforming post data");
    return null;
  }
}
