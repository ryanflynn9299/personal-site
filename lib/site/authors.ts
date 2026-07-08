import { authorProfiles } from "@/data/authors";
import {
  authorAccentKeys,
  getAuthorAccentFromSlug,
  getAuthorAccentHex,
  type AuthorAccentKey,
} from "@/constants/theme";
import type {
  AuthorContext,
  AuthorPostSummary,
  AuthorProfile,
  Post,
  PostAuthor,
  ResolvedAuthorProfile,
} from "@/types";

const DEFAULT_EMOJI = "✍️";
const DEFAULT_FIRST_NAME = "Unknown";
const DEFAULT_LAST_NAME = "Author";

export function normalizeAuthorPart(value: string): string {
  return value.trim().toLowerCase();
}

export function authorNameToSlug(firstName: string, lastName: string): string {
  const parts = [firstName, lastName]
    .map((part) =>
      part
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .filter(Boolean);

  return parts.join("-") || "unknown-author";
}

export function formatAuthorDisplayName(
  firstName: string,
  lastName: string
): string {
  const first = firstName.trim();
  const last = lastName.trim();
  if (first && last) {
    return `${first} ${last}`;
  }
  return first || last || "Unknown Author";
}

function authorsMatch(a: PostAuthor, b: PostAuthor): boolean {
  return (
    normalizeAuthorPart(a.first_name) === normalizeAuthorPart(b.first_name) &&
    normalizeAuthorPart(a.last_name) === normalizeAuthorPart(b.last_name)
  );
}

function resolveAccent(
  slug: string,
  override?: AuthorAccentKey
): AuthorAccentKey {
  if (override && authorAccentKeys.includes(override)) {
    return override;
  }
  return getAuthorAccentFromSlug(slug);
}

function mergeProfile(
  partial: PostAuthor,
  slug: string,
  directusProfile?: AuthorProfile | null
): AuthorProfile {
  const staticProfile = authorProfiles[slug];
  const base = directusProfile ?? staticProfile;

  if (base) {
    return {
      ...base,
      first_name: partial.first_name.trim() || base.first_name,
      last_name: partial.last_name.trim() || base.last_name,
    };
  }

  return {
    id: slug,
    slug,
    first_name: partial.first_name.trim() || DEFAULT_FIRST_NAME,
    last_name: partial.last_name.trim() || DEFAULT_LAST_NAME,
    emoji: DEFAULT_EMOJI,
  };
}

/**
 * Resolves CMS author names into a full profile with accent and display name.
 * Optional `directusProfile` merges Directus `authors` collection data when available.
 */
export function resolveAuthor(
  partial: PostAuthor,
  directusProfile?: AuthorProfile | null
): ResolvedAuthorProfile {
  const slug = authorNameToSlug(partial.first_name, partial.last_name);
  const profile = mergeProfile(partial, slug, directusProfile);
  const accent = resolveAccent(slug, profile.accent);

  return {
    ...profile,
    emoji: profile.emoji || DEFAULT_EMOJI,
    display_name: formatAuthorDisplayName(
      profile.first_name,
      profile.last_name
    ),
    accent,
    accent_hex: getAuthorAccentHex(accent),
  };
}

/**
 * Resolves an author for a blog post, preferring Directus `authors` when configured.
 */
export async function resolveAuthorForPost(
  partial: PostAuthor
): Promise<ResolvedAuthorProfile> {
  const slug = authorNameToSlug(partial.first_name, partial.last_name);
  const { getAuthorBySlug } = await import("@/lib/services/directus");
  const { author } = await getAuthorBySlug(slug);
  return resolveAuthor(partial, author);
}

export function postsByAuthor(
  posts: Post[],
  author: ResolvedAuthorProfile
): Post[] {
  return posts.filter((post) =>
    authorsMatch(post.author, {
      first_name: author.first_name,
      last_name: author.last_name,
    })
  );
}

function toPostSummary(post: Post): AuthorPostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    publish_date: post.publish_date,
  };
}

/**
 * Aggregates post stats and recent writing for an author popup/card.
 */
export function buildAuthorContext(
  allPosts: Post[],
  author: ResolvedAuthorProfile,
  options?: {
    currentPostId?: string;
    recentLimit?: number;
  }
): AuthorContext {
  const recentLimit = options?.recentLimit ?? 3;
  const authorPosts = postsByAuthor(allPosts, author);
  const tagSet = new Set<string>();

  for (const post of authorPosts) {
    for (const tag of post.tags) {
      const trimmed = tag?.trim();
      if (trimmed) {
        tagSet.add(trimmed);
      }
    }
  }

  const recent_posts = authorPosts
    .filter((post) => post.id !== options?.currentPostId)
    .slice(0, recentLimit)
    .map(toPostSummary);

  return {
    post_count: authorPosts.length,
    topic_count: tagSet.size,
    top_tags: [...tagSet].slice(0, 8),
    recent_posts,
  };
}

export function formatAuthorPostCount(count: number): string | null {
  if (count <= 0) {
    return null;
  }
  return count === 1 ? "1 post" : `${count} posts`;
}

export function formatAuthorTopicCount(count: number): string | null {
  if (count <= 0) {
    return null;
  }
  return count === 1 ? "1 topic" : `${count} topics`;
}

export function truncateBio(bio: string, maxLength = 140): string {
  const trimmed = bio.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}
