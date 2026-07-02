import { Skeleton, SkeletonLines } from "@/components/primitives/Skeleton";

export function BlogPostCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border border-slate-700/80 bg-slate-800/40"
      aria-hidden="true"
    >
      <Skeleton className="h-48 w-full" rounded="none" />
      <div className="flex flex-1 flex-col p-6">
        <Skeleton height={24} width="85%" rounded="sm" />
        <SkeletonLines
          count={2}
          lineHeight={14}
          gap={8}
          lastLineWidth="60%"
          className="mt-3"
        />
        <div className="mt-6 flex items-center gap-4">
          <Skeleton height={14} width={100} rounded="sm" />
          <Skeleton height={14} width={72} rounded="sm" />
        </div>
      </div>
    </div>
  );
}
