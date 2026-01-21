"use client";

import { Skeleton } from "@/components/primitives/Skeleton";

/**
 * 2x2 grid skeleton matching BlogHighlight4 layout
 * Used while blog posts are loading in the home page highlight section
 */
export function BlogHighlightSkeleton() {
  return (
    <div className="mt-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:max-w-5xl lg:mx-auto">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="relative block overflow-hidden rounded-lg border border-slate-700 bg-slate-800 p-6"
          >
            {/* Date skeleton */}
            <Skeleton variant="text" className="h-3 w-48 mb-4" />

            {/* Title skeleton */}
            <Skeleton variant="text" className="h-6 w-full mb-3" />
            <Skeleton variant="text" className="h-6 w-3/4 mb-3" />

            {/* Summary skeleton */}
            <Skeleton variant="text" className="h-4 w-full mb-2" />
            <Skeleton variant="text" className="h-4 w-5/6 mb-2" />
            <Skeleton variant="text" className="h-4 w-4/6 mb-4" />

            {/* CTA skeleton */}
            <Skeleton variant="text" className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
