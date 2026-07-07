"use client";

import { AuthorLink } from "@/components/author/AuthorLink";
import { blogSpacing } from "@/lib/blog/spacing";
import { cn } from "@/lib/utils";

interface AuthorBylineProps {
  formattedDate: string;
  publishDate: string;
  readingTime: string;
}

export function AuthorByline({
  formattedDate,
  publishDate,
  readingTime,
}: AuthorBylineProps) {
  return (
    <div
      className={cn(
        blogSpacing.groupTight,
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400"
      )}
    >
      <AuthorLink />
      <span aria-hidden="true">&bull;</span>
      <time dateTime={publishDate}>{formattedDate}</time>
      <span aria-hidden="true">&bull;</span>
      <span>{readingTime}</span>
    </div>
  );
}
