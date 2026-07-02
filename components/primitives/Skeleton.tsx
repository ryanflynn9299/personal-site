import { cn } from "@/lib/utils";

export type SkeletonRounded = "none" | "sm" | "md" | "lg" | "xl" | "full";

/** Pixel values, percentages, or CSS length strings (e.g. "75%", "12rem"). */
export type SkeletonSize = number | string;

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: SkeletonSize;
  height?: SkeletonSize;
  rounded?: SkeletonRounded;
}

const roundedClasses: Record<SkeletonRounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

function toCssLength(value: SkeletonSize): string {
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Base loading placeholder. Set explicit `width` / `height` (px or CSS lengths)
 * or use `className` for responsive Tailwind sizing — not both for the same axis.
 */
export function Skeleton({
  width,
  height,
  rounded = "md",
  className,
  style,
  ...props
}: SkeletonProps) {
  const dimensionStyle: React.CSSProperties = { ...style };

  if (width !== undefined) {
    dimensionStyle.width = toCssLength(width);
  }
  if (height !== undefined) {
    dimensionStyle.height = toCssLength(height);
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-slate-700/60",
        roundedClasses[rounded],
        className
      )}
      style={dimensionStyle}
      {...props}
    />
  );
}

export interface SkeletonLinesProps {
  count?: number;
  lineHeight?: number;
  gap?: number;
  /** Width of the last line — often shorter than full width. */
  lastLineWidth?: SkeletonSize;
  className?: string;
}

/** Stacked text-line placeholders. */
export function SkeletonLines({
  count = 3,
  lineHeight = 16,
  gap = 12,
  lastLineWidth = "72%",
  className,
}: SkeletonLinesProps) {
  return (
    <div className={cn("flex flex-col", className)} style={{ gap }}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === count - 1 ? lastLineWidth : "100%"}
          rounded="sm"
        />
      ))}
    </div>
  );
}
