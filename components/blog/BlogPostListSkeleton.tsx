"use client";

import { BlogPostSkeleton } from "./BlogPostSkeleton";

interface BlogPostListSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Grid/list skeleton for blog post listings
 * Matches the grid layout used in BlogPageClient
 */
export function BlogPostListSkeleton({
  count = 6,
  className,
}: BlogPostListSkeletonProps) {
  return (
    <div
      className={`mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 ${className || ""}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <BlogPostSkeleton key={index} />
      ))}
    </div>
  );
}
