import { Skeleton, SkeletonLines } from "@/components/primitives/Skeleton";

export function BlogPostSkeleton() {
  return (
    <article
      className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading article"
    >
      <header>
        <Skeleton className="h-12 w-[90%] md:h-14" rounded="md" />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Skeleton height={16} width={140} rounded="sm" />
          <Skeleton height={16} width={100} rounded="sm" />
          <Skeleton height={16} width={88} rounded="sm" />
        </div>
      </header>

      <Skeleton className="my-8 h-64 w-full md:h-96" rounded="lg" />

      <Skeleton height={20} width={160} rounded="sm" className="mb-4" />
      <SkeletonLines count={4} lineHeight={16} gap={12} className="mb-8" />

      <SkeletonLines count={6} lineHeight={16} gap={12} lastLineWidth="55%" />
    </article>
  );
}
