import { MetadataRoute } from "next";
import { SITE_URL, ENABLE_BLOG_SEO } from "@/lib/seo";
import { getPublishedPosts, isDirectusConfigured } from "@/lib/directus";
import { createLogger } from "@/lib/logger";

const log = createLogger("ALL");

/**
 * Generates the sitemap.xml file for the website.
 * This function is called at build time by Next.js.
 * @returns {Promise<MetadataRoute.Sitemap>} A promise that resolves to an array of sitemap entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Generate routes for static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/vitae`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/quotes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/projects-cabinet`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/policies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // 2. Generate routes for dynamic blog posts
  // Fetch published posts from CMS if configured and blog SEO is enabled
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
