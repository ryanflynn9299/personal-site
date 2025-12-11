import type { Metadata } from "next";
import { getPublishedPosts, isDirectusConfigured } from "@/lib/directus";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "A collection of articles and thoughts on software development, technology, and more.",
};

// Revalidate the page every hour to fetch new posts
export const revalidate = 3600;

export default async function BlogIndexPage() {
  // Check if Directus is configured before attempting to fetch
  if (!isDirectusConfigured()) {
    return (
      <BlogPageClient posts={[]} status="error" />
    );
  }

  const postsResponse = await getPublishedPosts();

  return (
    <BlogPageClient posts={postsResponse.posts} status={postsResponse.status} />
  );
}
