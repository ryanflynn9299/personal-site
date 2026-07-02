import { Skeleton, SkeletonLines } from "@/components/primitives/Skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons/PageHeaderSkeleton";

export function ContentPageSkeleton() {
  return (
    <div
      className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading page"
    >
      <PageHeaderSkeleton titleWidth={320} subtitleLines={2} centered />
      <div className="mx-auto mt-16 max-w-3xl space-y-8">
        <SkeletonLines count={4} lineHeight={16} gap={12} />
        <Skeleton className="h-48 w-full" rounded="lg" />
        <SkeletonLines count={5} lineHeight={16} gap={12} lastLineWidth="50%" />
      </div>
    </div>
  );
}
