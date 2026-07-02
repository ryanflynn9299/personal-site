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

import type {
  Post,
  AuthorProfile,
  SiteCounter,
  ContactMessage,
  BlogTag,
  BlogSeries,
} from "@/types";
import type {
  DirectusBlogPost,
  DirectusCounter,
  DirectusAuthor,
  DirectusContactMessage,
  DirectusBlogTag,
  DirectusBlogSeries,
} from "@/types/directus";
import type { AuthorAccentKey } from "@/types";
import { authorAccentKeys } from "@/constants/theme";
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

export const COUNTER_FIELDS = [
  "id",
  "key",
  "value",
  "metadata",
  "date_updated",
] as const;

export const AUTHOR_FIELDS = [
  "id",
  "status",
  "slug",
  "first_name",
  "last_name",
  "emoji",
  "accent",
  "role",
  "bio_short",
] as const;

export const BLOG_TAG_FIELDS = [
  "id",
  "status",
  "slug",
  "label",
  "description",
  "color",
  "sort",
] as const;

export const BLOG_SERIES_FIELDS = [
  "id",
  "status",
  "slug",
  "title",
  "description",
  "cover_image",
  "sort_order",
] as const;

export const CONTACT_MESSAGE_READ_FIELDS = [
  "id",
  "name",
  "email",
  "message",
  "status",
  "date_created",
] as const;

export function transformRawCounter(
  raw: Partial<DirectusCounter>
): SiteCounter | null {
  if (!raw.id || !raw.key || typeof raw.value !== "number") {
    log.warn(
      { counterId: raw.id, key: raw.key },
      "Skipping counter with missing required fields"
    );
    return null;
  }

  return {
    id: raw.id,
    key: raw.key,
    value: raw.value,
    metadata: raw.metadata ?? null,
    updated_at: raw.date_updated || new Date().toISOString(),
  };
}

function parseAuthorAccent(
  value: string | null | undefined
): AuthorAccentKey | undefined {
  if (!value) {
    return undefined;
  }
  return authorAccentKeys.includes(value as AuthorAccentKey)
    ? (value as AuthorAccentKey)
    : undefined;
}

export function transformRawAuthor(
  raw: Partial<DirectusAuthor>
): AuthorProfile | null {
  if (!raw.id || !raw.slug || !raw.first_name) {
    log.warn(
      { authorId: raw.id, slug: raw.slug },
      "Skipping author with missing required fields"
    );
    return null;
  }

  return {
    id: raw.id,
    slug: raw.slug,
    first_name: raw.first_name,
    last_name: raw.last_name || "",
    emoji: raw.emoji || "✍️",
    accent: parseAuthorAccent(raw.accent),
    role: raw.role || undefined,
    bio_short: raw.bio_short || undefined,
  };
}

export function transformRawBlogTag(
  raw: Partial<DirectusBlogTag>
): BlogTag | null {
  if (!raw.id || !raw.slug || !raw.label) {
    log.warn(
      { tagId: raw.id, slug: raw.slug },
      "Skipping blog tag with missing required fields"
    );
    return null;
  }

  return {
    id: raw.id,
    slug: raw.slug,
    label: raw.label,
    description: raw.description || "",
    color: raw.color ?? null,
    sort: typeof raw.sort === "number" ? raw.sort : 0,
  };
}

export function transformRawBlogSeries(
  raw: Partial<DirectusBlogSeries>
): BlogSeries | null {
  if (!raw.id || !raw.slug || !raw.title) {
    log.warn(
      { seriesId: raw.id, slug: raw.slug },
      "Skipping blog series with missing required fields"
    );
    return null;
  }

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description || "",
    sort_order: typeof raw.sort_order === "number" ? raw.sort_order : 0,
    cover_image: raw.cover_image ?? null,
  };
}

export function transformRawContactMessage(
  raw: Partial<DirectusContactMessage>
): ContactMessage | null {
  if (!raw.id || !raw.name || !raw.email || !raw.message) {
    log.warn(
      { messageId: raw.id },
      "Skipping contact message with missing required fields"
    );
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    message: raw.message,
    status: raw.status || "new",
    created_at: raw.date_created || new Date().toISOString(),
  };
}
