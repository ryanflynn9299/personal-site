import type { Metadata } from "next";
import {
  getPublishedPosts,
  isDirectusConfigured,
} from "@/lib/services/directus";
import { isFeatureEnabled } from "@/lib/dev-tooling/features";
import { BlogPageClient } from "@/components/blog/BlogPageClient";
import { generatePageMetadata, ENABLE_BLOG_SEO } from "@/lib/site/seo";

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

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Check if Directus is configured or dummy data is forcefully enabled
  if (!isDirectusConfigured() && !isFeatureEnabled("offlineDummyBlogs")) {
    return (
      <BlogPageClient
        posts={[]}
        status="error"
        currentPage={1}
        totalPages={0}
        limit={50}
      />
    );
  }

  const params = await searchParams;
  const limit = 50;
  const page = params?.page ? parseInt(params.page as string) : 1;

  const { status, posts, total } = await getPublishedPosts({
    limit,
    page,
  });

  const totalPages = Math.ceil((total || 0) / limit);

  return (
    <BlogPageClient
      posts={posts}
      status={status}
      currentPage={page}
      totalPages={totalPages}
      limit={limit}
    />
  );
}
