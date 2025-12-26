import {
  getPostBySlug,
  getPublishedPosts,
  isDirectusConfigured,
} from "@/lib/directus";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/common/JsonLd";
import { BlogPostTracker } from "@/components/blog/BlogPostTracker";
import { ServiceUnavailableWithDevMode } from "@/components/common/DevModeIndicator";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { Post } from "@/types";
import { SITE_URL, ENABLE_BLOG_SEO } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Generate dynamic metadata for each post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isDirectusConfigured()) {
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
  const imageUrl = post.feature_image
    ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${post.feature_image.id}`
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
      card: "summary_large_image",
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
  if (!isDirectusConfigured()) {
    return [];
  }

  const postResponse = await getPublishedPosts();
  const posts = postResponse["posts"];
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  // Check if Directus is configured
  if (!isDirectusConfigured()) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <ServiceUnavailableWithDevMode />
      </div>
    );
  }

  const post = await getPostBySlug((await params).slug);

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

  const imageUrl = post.feature_image
    ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${post.feature_image.id}`
    : null;

  return (
    <>
      <JsonLd post={post} />
      <BlogPostTracker slug={post.slug} title={post.title} />
      <article className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="text-left">
          <h1 className="font-heading text-4xl font-bold text-slate-50 md:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 text-slate-400">
            <span>
              By {post.author.first_name} {post.author.last_name}
            </span>
            <span className="mx-2">&bull;</span>
            <time dateTime={post.publish_date}>{formattedDate}</time>
          </div>
        </header>

        {imageUrl && (
          <div className="relative my-8 h-64 w-full overflow-hidden rounded-lg md:h-96">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Note: A sticky TOC component would be added here, likely wrapping the main content */}
        <BlogContentRenderer
          content={post.content}
          format={post.content_format || "auto"}
        />
      </article>
    </>
  );
}
