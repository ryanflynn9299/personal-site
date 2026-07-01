"use client";

import Image from "next/image";
import type { AuthorContext, Post, ResolvedAuthorProfile } from "@/types";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { BlogPostNavigation } from "@/components/blog/BlogPostNavigation";
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
  return (
    <AuthorDialogProvider author={author} context={authorContext}>
      <article className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="text-left">
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
