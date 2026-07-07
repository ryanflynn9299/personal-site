"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { AuthorContext, Post, ResolvedAuthorProfile } from "@/types";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { BlogTableOfContents } from "@/components/blog/BlogTableOfContents";
import { BlogPostNavigation } from "@/components/blog/BlogPostNavigation";
import { BlogPostBreadcrumbs } from "@/components/blog/BlogPostBreadcrumbs";
import { buildBlogPostBreadcrumbs } from "@/lib/blog/breadcrumbs";
import { evaluateToc } from "@/lib/blog/toc";
import { AuthorDialogProvider } from "@/components/author/AuthorDialogContext";
import { AuthorByline } from "@/components/author/AuthorByline";
import { AuthorPostFooter } from "@/components/author/AuthorPostFooter";

interface BlogPostArticleProps {
  post: Post;
  author: ResolvedAuthorProfile;
  authorContext: AuthorContext;
  prev: Post | null;
  next: Post | null;
  imageUrl: string | null;
  formattedDate: string;
  readingTime: string;
}

export function BlogPostArticle({
  post,
  author,
  authorContext,
  prev,
  next,
  imageUrl,
  formattedDate,
  readingTime,
}: BlogPostArticleProps) {
  const toc = useMemo(
    () => evaluateToc(post.content, post.content_format || "auto"),
    [post.content, post.content_format]
  );
  const breadcrumbs = useMemo(() => buildBlogPostBreadcrumbs(post), [post]);

  return (
    <AuthorDialogProvider author={author} context={authorContext}>
      <article className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="text-left">
          <BlogPostBreadcrumbs items={breadcrumbs} />
          <h1 className="font-heading text-4xl font-bold text-slate-50 md:text-5xl">
            {post.title}
          </h1>
          <AuthorByline
            formattedDate={formattedDate}
            publishDate={post.publish_date}
            readingTime={readingTime}
          />
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

        {toc.show && (
          <BlogTableOfContents
            tree={toc.tree}
            collapseH3ByDefault={toc.collapseH3ByDefault}
            hiddenH3Count={toc.hiddenH3Count}
          />
        )}

        <BlogContentRenderer
          content={post.content}
          format={post.content_format || "auto"}
        />

        <AuthorPostFooter />
        <BlogPostNavigation prev={prev} next={next} />
      </article>
    </AuthorDialogProvider>
  );
}
