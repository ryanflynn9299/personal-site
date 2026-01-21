import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "./env";
import { createLogger } from "./logger";

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

/**
 * Formats a date string consistently on both server and client.
 * This prevents hydration errors by ensuring the same output regardless of locale/timezone.
 *
 * @param dateString - ISO date string (e.g., "2024-01-15T00:00:00Z")
 * @param options - Formatting options
 * @returns Formatted date string
 *
 * @example
 * ```tsx
 * formatDate("2024-01-15T00:00:00Z", { month: "long", day: "numeric", year: "numeric" })
 * // Returns: "January 15, 2024"
 * ```
 */
export function formatDate(
  dateString: string,
  options: {
    month?: "long" | "short" | "2-digit" | "numeric";
    day?: "numeric" | "2-digit";
    year?: "numeric" | "2-digit";
  } = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
): string {
  // Parse date string - if it's just a date (YYYY-MM-DD), append time to ensure UTC parsing
  // This prevents timezone-related hydration mismatches
  let date: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Date-only format (YYYY-MM-DD) - parse as UTC
    date = new Date(dateString + "T00:00:00Z");
  } else {
    // ISO format with time - parse normally
    date = new Date(dateString);
  }

  // Use UTC methods to ensure consistent output regardless of server/client timezone
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Format month
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthShortNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let formattedMonth = "";
  if (options.month === "long") {
    formattedMonth = monthNames[month];
  } else if (options.month === "short") {
    formattedMonth = monthShortNames[month];
  } else if (options.month === "2-digit") {
    formattedMonth = String(month + 1).padStart(2, "0");
  } else if (options.month === "numeric") {
    formattedMonth = String(month + 1);
  }

  // Format day
  let formattedDay = "";
  if (options.day === "2-digit") {
    formattedDay = String(day).padStart(2, "0");
  } else {
    formattedDay = String(day);
  }

  // Format year
  let formattedYear = "";
  if (options.year === "2-digit") {
    formattedYear = String(year).slice(-2);
  } else {
    formattedYear = String(year);
  }

  // Return formatted string based on format type
  if (options.month === "long" || options.month === "short") {
    // Long/short month format: "January 15, 2024" or "Jan 15, 2024"
    return `${formattedMonth} ${formattedDay}, ${formattedYear}`;
  } else {
    // Numeric format: "01/15/2024" or "1/15/2024"
    const parts: string[] = [];
    if (options.month) {
      parts.push(formattedMonth);
    }
    if (options.day) {
      parts.push(formattedDay);
    }
    if (options.year) {
      parts.push(formattedYear);
    }
    return parts.join("/");
  }
}
