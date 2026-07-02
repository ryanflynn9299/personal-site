import {
  getPostBySlug,
  getPublishedPosts,
  resolveAdjacentPosts,
  isDirectusConfigured,
} from "@/lib/services/directus";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/common/JsonLd";
import { BlogPostTracker } from "@/components/blog/BlogPostTracker";
import { ServiceUnavailableWithDevMode } from "@/components/common/DevModeIndicator";
import { Post } from "@/types";
import { SITE_URL, ENABLE_BLOG_SEO } from "@/lib/site/seo";
import { config, runtime } from "@/lib/config";
import { isFeatureEnabled } from "@/lib/dev-tooling/features";
import { BlogPostArticle } from "@/components/blog/BlogPostArticle";
import { estimateReadingTimeMinutes, formatReadingTime } from "@/lib/utils";
import { resolveAuthor, buildAuthorContext } from "@/lib/site/authors";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Generate dynamic metadata for each post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isDirectusConfigured() && !isFeatureEnabled("offlineDummyBlogs")) {
    return {
      title: "Service Unavailable",
      description: "Content service is not available",
    };
  }

  const post: Post | null = await getPostBySlug((await params).slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  // If blog SEO is disabled, return minimal metadata with noindex
  if (!ENABLE_BLOG_SEO) {
    return {
      title: post.title,
      description: post.summary || post.title,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const authorName = `${post.author.first_name} ${post.author.last_name}`;
  const imageUrl =
    post.feature_image && config.directus.publicUrl
      ? `${config.directus.publicUrl}/assets/${post.feature_image.id}`
      : undefined;

  return {
    title: post.title,
    description: post.summary || post.title,
    keywords: post.tags && post.tags.length > 0 ? post.tags : undefined,
    authors: [{ name: authorName }],
    openGraph: {
      title: post.title,
      description: post.summary || post.title,
      type: "article",
      url: postUrl,
      publishedTime: post.publish_date,
      authors: [authorName],
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.summary || post.title,
      ...(imageUrl && { images: [imageUrl] }),
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

// Generate static paths for all published posts at build time
export async function generateStaticParams() {
  if (!isDirectusConfigured() && !isFeatureEnabled("offlineDummyBlogs")) {
    return [];
  }

  const postResponse = await getPublishedPosts();
  const posts = postResponse["posts"];
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  // In production/live-dev, Directus must be configured (real error if not)
  // In offline-dev/test, we still check for posts (will return null, then show 404)
  if (
    !isDirectusConfigured() &&
    !isFeatureEnabled("offlineDummyBlogs") &&
    runtime.treatServiceErrorsAsReal
  ) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <ServiceUnavailableWithDevMode />
      </div>
    );
  }

  const slug = (await params).slug;
  const [post, postsResult] = await Promise.all([
    getPostBySlug(slug),
    getPublishedPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.publish_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  const readingTime = formatReadingTime(
    estimateReadingTimeMinutes(post.content)
  );

  const imageUrl =
    post.feature_image && config.directus.publicUrl
      ? `${config.directus.publicUrl}/assets/${post.feature_image.id}`
      : null;

  const { posts: allPosts } = postsResult;
  const { prev, next } = resolveAdjacentPosts(
    allPosts,
    post.publish_date,
    post.id
  );
  const resolvedAuthor = resolveAuthor(post.author);
  const authorContext = buildAuthorContext(allPosts, resolvedAuthor, {
    currentPostId: post.id,
    recentLimit: 3,
  });

  return (
    <>
      <JsonLd post={post} />
      <BlogPostTracker slug={post.slug} title={post.title} />
      <BlogPostArticle
        post={post}
        author={resolvedAuthor}
        authorContext={authorContext}
        prev={prev}
        next={next}
        imageUrl={imageUrl}
        formattedDate={formattedDate}
        readingTime={readingTime}
      />
    </>
  );
}
