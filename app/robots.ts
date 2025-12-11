import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const URL = "https://ryanflynn.org";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/", // Example: disallow crawling of a potential admin panel
    },
    sitemap: `${URL}/sitemap.xml`,
  };
}
