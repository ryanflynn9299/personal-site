import type { Metadata } from "next";
import { BlogPageClient } from "@/components/blog/BlogPageClient";
import { generatePageMetadata, ENABLE_BLOG_SEO } from "@/lib/seo";

// Use minimal metadata if blog SEO is disabled
export const metadata: Metadata = ENABLE_BLOG_SEO
  ? generatePageMetadata({
      title: "Blog",
      description:
        "A collection of articles and thoughts on software development, technology, and more. Read insights, tutorials, and reflections from Ryan Flynn.",
      path: "/blog",
    })
  : {
      title: "Blog",
      description: "Blog",
      robots: {
        index: false,
        follow: false,
      },
    };

// Client-side page - no SSR needed
export default function BlogIndexPage() {
  return <BlogPageClient />;
}
