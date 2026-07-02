import { MetadataRoute } from "next";
import { SITE_URL, ENABLE_BLOG_SEO } from "@/lib/site/seo";
import {
  getPublishedPosts,
  isDirectusConfigured,
} from "@/lib/services/directus";
import { createLogger } from "@/lib/dev-tooling/logger";

const log = createLogger("ALL");

/** Stable build-time date for static routes (avoids churning `new Date()` every build). */
const STATIC_LAST_MODIFIED = new Date(
  process.env.BUILD_DATE ?? "2026-07-01T00:00:00.000Z"
);

/**
 * Generates the sitemap.xml file for the website.
 * This function is called at build time by Next.js.
 * @returns {Promise<MetadataRoute.Sitemap>} A promise that resolves to an array of sitemap entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/vitae`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/policies`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];

  if (ENABLE_BLOG_SEO && isDirectusConfigured()) {
    try {
      const postsResponse = await getPublishedPosts();
      if (
        postsResponse.status === "success" &&
        postsResponse.posts.length > 0
      ) {
        postRoutes = postsResponse.posts.map((post) => ({
          url: `${SITE_URL}/blog/${post.slug}`,
          lastModified: new Date(post.publish_date),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }));
      }
    } catch (error) {
      // Log error but don't fail sitemap generation
      log.error({ error }, "Error fetching posts for sitemap");
    }
  }

  // 3. Combine all routes and return
  return [...staticRoutes, ...postRoutes];
}
