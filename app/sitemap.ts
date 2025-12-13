import { MetadataRoute } from "next";

/**
 * Generates the sitemap.xml file for the website.
 * This function is called at build time by Next.js.
 * @returns {Promise<MetadataRoute.Sitemap>} A promise that resolves to an array of sitemap entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // --- IMPORTANT ---
  // Replace this with your actual, public domain name.
  const siteUrl = "https://www.ryanflynn.org";

  // 1. Generate routes for static pages
  const staticRoutes = [
    "", // Represents the homepage '/'
    "/about",
    "/vitae",
    "/blog",
    "/contact",
  ].map((route) => {
    const cf: "weekly" | "yearly" =
      route === "" || route === "/blog" ? "weekly" : "yearly";
    return {
      url: `${siteUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: cf,
      priority: route === "" ? 1.0 : 0.8,
      alternates: undefined,
    };
  });

  // 2. Generate routes for dynamic blog posts
  // We call the function that fetches posts from the CMS.
  // // This ensures the sitemap is always up-to-date with your content.
  // const posts: Post[] = await getPublishedPosts();
  //
  // const postRoutes = posts.map((post) => ({
  //     url: `${siteUrl}/blog/${post.slug}`,
  //     lastModified: new Date(post.publish_date).toISOString(), // Use the actual publish date
  //     changeFrequency: 'monthly',
  //     priority: 0.7,
  //     alternates: undefined
  // }));

  // 3. Combine all routes and return
  return [...staticRoutes];
}
