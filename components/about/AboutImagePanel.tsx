"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutImagePanelProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function AboutImagePanel({
  src,
  alt,
  width = 600,
  height = 400,
  priority = false,
  className,
}: AboutImagePanelProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-slate-800",
        className
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {!isLoaded && (
        <div
          className="absolute inset-0 flex animate-pulse items-center justify-center bg-slate-800"
          aria-hidden="true"
        >
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "h-full w-full rounded-lg object-cover shadow-lg transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
