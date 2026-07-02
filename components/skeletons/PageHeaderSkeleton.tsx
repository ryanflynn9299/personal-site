import { Skeleton, SkeletonLines } from "@/components/primitives/Skeleton";

interface PageHeaderSkeletonProps {
  titleWidth?: number | string;
  subtitleLines?: number;
  centered?: boolean;
}

export function PageHeaderSkeleton({
  titleWidth = 280,
  subtitleLines = 2,
  centered = false,
}: PageHeaderSkeletonProps) {
  return (
    <div className={centered ? "text-center" : undefined}>
      <Skeleton
        height={40}
        width={titleWidth}
        rounded="md"
        className={centered ? "mx-auto" : undefined}
      />
      <SkeletonLines
        count={subtitleLines}
        lineHeight={18}
        gap={10}
        className={cnCentered(centered, "mt-4 max-w-2xl")}
      />
    </div>
  );
}

function cnCentered(centered: boolean, classes: string): string {
  return centered ? `${classes} mx-auto` : classes;
}
