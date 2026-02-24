import type { Metadata } from "next";
import { getPublishedPosts, isDirectusConfigured } from "@/lib/directus";
import { isFeatureEnabled } from "@/lib/features";
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

// Revalidate the page every hour to fetch new posts
export const revalidate = 3600;

export default async function BlogIndexPage() {
  // Check if Directus is configured or dummy data is forcefully enabled
  if (!isDirectusConfigured() && !isFeatureEnabled("offlineDummyBlogs")) {
    return <BlogPageClient posts={[]} status="error" />;
  }

  const postsResponse = await getPublishedPosts();

  return (
    <BlogPageClient posts={postsResponse.posts} status={postsResponse.status} />
  );
}
