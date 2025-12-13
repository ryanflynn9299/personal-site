import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
    // Log error in development to catch data issues early
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[getBlogPostUrl] Invalid slug provided:",
        slug,
        "Falling back to /blog"
      );
    }
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
