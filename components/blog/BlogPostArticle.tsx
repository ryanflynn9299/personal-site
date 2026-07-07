"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { AuthorContext, Post, ResolvedAuthorProfile } from "@/types";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { BlogTableOfContents } from "@/components/blog/BlogTableOfContents";
import { BlogPostNavigation } from "@/components/blog/BlogPostNavigation";
import { BlogPostBreadcrumbs } from "@/components/blog/BlogPostBreadcrumbs";
import { buildBlogPostBreadcrumbs } from "@/lib/blog/breadcrumbs";
import { blogSpacing } from "@/lib/blog/spacing";
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
      <article
        className={cn(
          "container mx-auto max-w-4xl",
          blogSpacing.pagePaddingX,
          blogSpacing.pagePaddingY
        )}
      >
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
          {toc.show && (
            <BlogTableOfContents
              tree={toc.tree}
              collapseH3ByDefault={toc.collapseH3ByDefault}
              hiddenH3Count={toc.hiddenH3Count}
            />
          )}
        </header>

        {imageUrl && (
          <div
            className={cn(
              "relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96",
              !toc.show && blogSpacing.regionContent
            )}
          >
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <BlogContentRenderer
          content={post.content}
          format={post.content_format || "auto"}
          className={
            !toc.show && !imageUrl ? blogSpacing.regionContent : undefined
          }
        />

        <AuthorPostFooter />
        <BlogPostNavigation prev={prev} next={next} />
      </article>
    </AuthorDialogProvider>
  );
}
