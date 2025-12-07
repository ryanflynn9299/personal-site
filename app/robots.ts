import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const URL = "https://your-domain.com"; // Replace with your actual domain

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/", // Example: disallow crawling of a potential admin panel
    },
    sitemap: `${URL}/sitemap.xml`,
  };
}
