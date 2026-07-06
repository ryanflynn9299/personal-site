import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site/seo";
import { PREVIEW_ONLY_ROUTES } from "@/lib/dev-tooling/preview-routes";

const PREVIEW_DISALLOW = PREVIEW_ONLY_ROUTES.map((route) => `${route}/`);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", ...PREVIEW_DISALLOW],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", ...PREVIEW_DISALLOW],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
