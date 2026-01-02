import { Post } from "@/types";
import { SITE_URL, SITE_AUTHOR, ENABLE_BLOG_SEO } from "@/lib/seo";
import { env } from "@/lib/env";

interface JsonLdProps {
  post: Post;
}

/**
 * Enhanced JSON-LD Structured Data Component for Blog Posts
 *
 * This component generates comprehensive Schema.org BlogPosting structured data
 * to improve SEO, enable rich snippets in search results, and enhance social
 * media previews.
 *
 * Uses centralized SEO configuration from lib/seo.ts
 * Disabled when ENABLE_BLOG_SEO is false
 */

export function JsonLd({ post }: JsonLdProps) {
  // Return null if blog SEO is disabled
  if (!ENABLE_BLOG_SEO) {
    return null;
  }

  // Use centralized SEO configuration
  const baseUrl = SITE_URL;

  // Construct the full URL to the blog post
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  // Construct the featured image URL if available
  const imageUrl =
    post.feature_image && env.directus.publicUrl
      ? `${env.directus.publicUrl}/assets/${post.feature_image.id}`
      : undefined;

  // Format dates to ISO 8601 format (required by Schema.org)
  const datePublished = new Date(post.publish_date).toISOString();

  // Get author full name
  const authorName = `${post.author.first_name} ${post.author.last_name}`;

  // MANUAL CONFIGURATION: Replace with your actual author profile URL if available
  const authorUrl = `${baseUrl}/about`; // Or specific author page URL

  // Publisher configuration - using Person type for personal blog
  const publisherType = "Person";
  const publisherName = SITE_AUTHOR;
  const publisherUrl = baseUrl;
  const publisherLogo = `${baseUrl}/images/og-default.png`; // Update this path if you have a logo

  // Extract a plain text description from content (first 200 chars)
  // This is a fallback if summary is not descriptive enough
  const getDescription = () => {
    if (post.summary && post.summary.length > 0) {
      return post.summary;
    }
    // Fallback: extract text from HTML content (basic implementation)
    const textContent = post.content
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 200);
    return textContent || post.title;
  };

  // Social media profiles - update these in lib/seo.ts
  // For now, leaving empty but structure is ready
  const authorSocialProfiles: { sameAs?: string[] } = {};
  // Uncomment and update when you have social profiles:
  // authorSocialProfiles.sameAs = [
  //   "https://twitter.com/yourhandle",
  //   "https://github.com/yourusername",
  //   "https://linkedin.com/in/yourprofile",
  // ];

  // Build comprehensive JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",

    // Core content information
    headline: post.title,
    description: getDescription(),
    articleBody: post.content, // Full article content

    // Publication metadata
    datePublished: datePublished,
    dateModified: datePublished, // Update this if you track modification dates
    // MANUAL: If you track last modified dates, use: new Date(post.date_modified).toISOString()

    // Author information
    author: {
      "@type": "Person",
      name: authorName,
      url: authorUrl,
      ...(authorSocialProfiles.sameAs && authorSocialProfiles),
    },

    // Publisher information (can be Person or Organization)
    publisher: {
      "@type": publisherType,
      name: publisherName,
      url: publisherUrl,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo,
        // MANUAL: Add dimensions if known
        // width: 600,
        // height: 60,
      },
    },

    // Main entity (the blog post page itself)
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },

    // Image information
    ...(imageUrl && {
      image: {
        "@type": "ImageObject",
        url: imageUrl,
        // MANUAL: Add dimensions if you know them for better SEO
        // width: 1200,
        // height: 630,
        caption: post.title, // Or a more descriptive caption
      },
    }),

    // Keywords/Tags for SEO
    ...(post.tags &&
      post.tags.length > 0 && {
        keywords: post.tags.join(", "),
      }),

    // Article section/category (if you categorize posts)
    // MANUAL: Uncomment and configure if you have categories
    // articleSection: "Technology", // Or whatever category this post belongs to

    // In-language specification
    inLanguage: "en-US", // MANUAL: Update if your content is in a different language

    // Creative work status
    creativeWorkStatus: post.status === "published" ? "Published" : "Draft",

    // Word count (optional but helpful for SEO)
    // MANUAL: Calculate if you want to include this
    // wordCount: post.content.split(/\s+/).length,

    // Time required to read (optional)
    // MANUAL: Calculate based on average reading speed (200-250 words/min)
    // timeRequired: `PT${Math.ceil(post.content.split(/\s+/).length / 225)}M`,

    // Comments section reference (if you have comments)
    // MANUAL: Uncomment if you have a comments system
    // commentCount: 0, // Or actual comment count
    // comment: [], // Array of comment objects if you have them
  };

  // Remove undefined values to keep JSON clean using modern structuredClone
  const cleanJsonLd = removeUndefinedValues(jsonLd);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: formatJsonLd(cleanJsonLd),
      }}
    />
  );
}

/**
 * Removes undefined values from an object using structuredClone (2025 standard)
 * This is more performant and type-safe than JSON.parse(JSON.stringify())
 */
function removeUndefinedValues<T extends Record<string, unknown>>(obj: T): T {
  const cloned = structuredClone(obj);
  return removeUndefinedRecursive(cloned) as T;
}

/**
 * Recursively removes undefined values from an object
 */
function removeUndefinedRecursive(value: unknown): unknown {
  if (value === undefined) {
    return null; // Convert undefined to null for JSON compatibility
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(removeUndefinedRecursive);
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    const cleaned = removeUndefinedRecursive(val);
    if (cleaned !== undefined) {
      result[key] = cleaned;
    }
  }
  return result;
}

/**
 * Formats JSON-LD for HTML output with proper indentation
 * Uses modern JSON.stringify with proper formatting
 */
function formatJsonLd(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
