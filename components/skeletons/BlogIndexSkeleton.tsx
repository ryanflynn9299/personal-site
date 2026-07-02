import { Skeleton, SkeletonLines } from "@/components/primitives/Skeleton";
import { BlogPostCardSkeleton } from "@/components/skeletons/BlogPostCardSkeleton";

export function BlogIndexSkeleton() {
  return (
    <div
      className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading blog"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-nowrap items-center justify-between gap-4">
          <Skeleton height={40} width={120} rounded="md" />
          <Skeleton height={40} width={40} rounded="lg" />
        </div>
        <SkeletonLines
          count={2}
          lineHeight={18}
          gap={10}
          lastLineWidth="65%"
          className="max-w-3xl"
        />
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <BlogPostCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
