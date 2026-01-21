"use client";

import { Skeleton } from "@/components/primitives/Skeleton";

/**
 * Skeleton component matching the PostCard layout
 * Used while blog posts are loading
 */
export function BlogPostSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
      {/* Image skeleton */}
      <Skeleton variant="image" className="h-48 w-full" />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title skeleton */}
        <Skeleton variant="text" className="h-6 w-3/4 mb-3" />

        {/* Summary skeleton - multiple lines */}
        <Skeleton variant="text" className="h-4 w-full mb-2" />
        <Skeleton variant="text" className="h-4 w-5/6 mb-2" />
        <Skeleton variant="text" className="h-4 w-4/6 mb-4" />

        {/* Date skeleton */}
        <Skeleton variant="text" className="h-4 w-32" />
      </div>
    </div>
  );
}
