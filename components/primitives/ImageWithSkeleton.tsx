"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image, { ImageProps } from "next/image";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps
  extends Omit<ImageProps, "onLoad" | "onError" | "onLoadingComplete" | "className"> {
  className?: string;
  skeletonClassName?: string;
  showSkeleton?: boolean;
}

/**
 * Image component with skeleton loading state
 * Shows a skeleton placeholder while the image is loading
 * 
 * Robust loading detection handles:
 * - Images that load after mount (via onLoad/onLoadingComplete events)
 * - Cached/fast-loading images (via useEffect check after mount)
 * - Edge cases (safety timeout as last resort)
 */
export function ImageWithSkeleton({
  className,
  skeletonClassName,
  showSkeleton = true,
  ...imageProps
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  const handleLoad = useCallback(() => {
    if (hasLoadedRef.current) return; // Prevent multiple calls
    hasLoadedRef.current = true;
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Check if image is already loaded after mount (handles cached/fast-loading images)
  useEffect(() => {
    // Reset loading state when src changes
    hasLoadedRef.current = false;
    setIsLoading(true);
    
    let imgElement: HTMLImageElement | null = null;
    let imgLoadHandler: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout;
    
    // Small delay to allow Next.js Image to render the underlying img element
    const checkImageLoaded = () => {
      if (!containerRef.current || hasLoadedRef.current) return;
      
      // Find the img element within the Next.js Image wrapper
      // Next.js Image wraps the img in a span, so we need to find it
      imgElement = containerRef.current.querySelector("img") as HTMLImageElement | null;
      if (imgElement) {
        // Check if image is already loaded (cached or fast-loading)
        if (imgElement.complete && imgElement.naturalWidth > 0) {
          handleLoad();
          return;
        }
        
        // Also listen for load event as backup (in case it loads between checks)
        imgLoadHandler = () => {
          handleLoad();
        };
        imgElement.addEventListener("load", imgLoadHandler);
      }
    };

    // Check after a short delay to allow Next.js Image to render
    timeoutId = setTimeout(checkImageLoaded, 100);
    
    return () => {
      clearTimeout(timeoutId);
      // Clean up event listener
      if (imgElement && imgLoadHandler) {
        imgElement.removeEventListener("load", imgLoadHandler);
      }
    };
  }, [imageProps.src, handleLoad]);

  // Safety timeout: ensure image becomes visible even if events fail
  // This is a last resort and should rarely trigger
  useEffect(() => {
    if (isLoading && !hasError) {
      timeoutRef.current = setTimeout(() => {
        if (!hasLoadedRef.current) {
          // Only force visibility if we haven't loaded yet
          // This prevents hiding images that are actually loading
          setIsLoading(false);
        }
      }, 2000); // 2 second safety timeout
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isLoading, hasError]);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-800 text-slate-500",
          className
        )}
      >
        <span className="text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {isLoading && showSkeleton && (
        <Skeleton
          variant="image"
          className={cn("absolute inset-0", skeletonClassName)}
        />
      )}
      <Image
        {...imageProps}
        className={cn(
          isLoading && showSkeleton
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-300",
          className
        )}
        onLoad={handleLoad}
        onLoadingComplete={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
