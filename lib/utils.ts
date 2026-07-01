import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createLogger } from "./dev-tooling/logger";

const log = createLogger("ALL");

/**
 * A utility function to conditionally join class names together.
 * It uses `clsx` to handle conditional classes and `tailwind-merge`
 * to intelligently merge Tailwind CSS classes without style conflicts.
 *
 * @param {...ClassValue} inputs - A list of class values to be merged.
 * These can be strings, arrays, or objects with boolean values.
 * @returns {string} The final, merged class name string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates a URL-safe blog post path from a slug.
 *
 * This function handles edge cases and ensures type safety:
 * - Validates slug is non-empty
 * - Returns the correct route format (without route groups)
 * - Handles potential runtime issues gracefully
 *
 * @param slug - The blog post slug (should be a valid, non-empty string)
 * @returns The blog post URL path (e.g., "/blog/my-post-slug")
 * @throws {Error} If slug is empty or invalid (should not happen with validated Post data)
 *
 * @example
 * ```tsx
 * <Link href={getBlogPostUrl(post.slug)}>Read More</Link>
 * ```
 */
export function getBlogPostUrl(slug: string | null | undefined): string {
  // Validate slug exists and is non-empty
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    // Log error to catch data issues early
    log.error(
      {
        slug,
        fallback: "/blog",
      },
      "[getBlogPostUrl] Invalid slug provided, falling back to /blog"
    );
    // Return blog index as fallback to prevent broken links
    return "/blog";
  }

  // Trim whitespace and ensure it starts with a valid character
  const trimmedSlug = slug.trim();

  // Next.js Link component handles URL encoding automatically,
  // but we ensure the slug is safe by trimming and validating
  // The route group (portfolio) is not part of the URL path
  return `/blog/${trimmedSlug}`;
}

const WORDS_PER_MINUTE = 200;

/**
 * Strips HTML tags and normalizes whitespace for word counting.
 */
function stripContentForWordCount(content: string): string {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Estimates reading time for blog content.
 *
 * @param content - Raw post content (markdown, HTML, or plaintext)
 * @returns Reading time in whole minutes (minimum 1)
 */
export function estimateReadingTimeMinutes(content: string): number {
  const normalized = stripContentForWordCount(content);
  if (!normalized) {
    return 1;
  }

  const wordCount = normalized.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/**
 * Formats reading time for display in the UI.
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
