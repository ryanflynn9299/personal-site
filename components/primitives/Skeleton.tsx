"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "image" | "card" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
}

/**
 * Base skeleton component with shimmer animation
 * Used for loading states throughout the application
 */
export function Skeleton({
  className,
  variant = "rect",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-slate-700/50 rounded";

  const variantClasses = {
    text: "h-4",
    image: "aspect-video",
    card: "h-full",
    circle: "rounded-full aspect-square",
    rect: "h-full",
  };

  const combinedStyle = {
    ...style,
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && {
      height: typeof height === "number" ? `${height}px` : height,
    }),
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={combinedStyle}
      {...props}
    />
  );
}

/**
 * Shimmer effect wrapper for more advanced skeleton animations
 * Uses the existing shimmer animation from globals.css
 */
export function SkeletonShimmer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-600/20 to-transparent"
        style={{
          animation: "shimmer 2s infinite",
        }}
      />
      {children}
    </div>
  );
}
