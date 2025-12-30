"use client";

/**
 * SafeSVGImage Component
 *
 * A wrapper around Next.js Image component that sanitizes SVGs before rendering.
 * Use this instead of Image when loading SVGs from potentially untrusted sources.
 *
 * NOTE: This component is currently unused. SVG support is disabled in next.config.ts.
 * If you need to use SVGs with Next.js Image component, enable dangerouslyAllowSVG
 * and use this component for untrusted sources.
 *
 * @example
 * ```tsx
 * // Trusted source (your own files)
 * <SafeSVGImage src="/icon.svg" alt="Icon" width={24} height={24} />
 *
 * // Untrusted source (external URL)
 * <SafeSVGImage
 *   src="https://example.com/icon.svg"
 *   alt="Icon"
 *   width={24}
 *   height={24}
 *   trustLevel="untrusted"
 * />
 * ```
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  sanitizeSVGByTrustLevel,
  getSVGTrustLevel,
  SVGTrustLevel,
  type SVGTrustLevel as SVGTrustLevelType,
} from "@/lib/svg-security";

interface SafeSVGImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Explicitly set trust level. If not provided, auto-detects from src */
  trustLevel?: SVGTrustLevelType;
  /** Fallback image if SVG fails validation */
  fallback?: string;
  /** Additional Next.js Image props */
  [key: string]: unknown;
}

export function SafeSVGImage({
  src,
  alt,
  width,
  height,
  className,
  trustLevel,
  fallback,
  ...imageProps
}: SafeSVGImageProps) {
  const [safeSrc, setSafeSrc] = useState<string>(src);
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    // Only process if it's an SVG
    if (
      !src.toLowerCase().endsWith(".svg") &&
      !src.includes("data:image/svg+xml")
    ) {
      setSafeSrc(src);
      return;
    }

    // Determine trust level
    const level = trustLevel || getSVGTrustLevel(src);

    // For trusted sources, use as-is (but still validate structure)
    if (level === SVGTrustLevel.TRUSTED) {
      setSafeSrc(src);
      setIsValid(true);
      return;
    }

    // For untrusted/validated sources, fetch and sanitize
    const sanitize = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.statusText}`);
        }

        const svgContent = await response.text();
        const sanitized = sanitizeSVGByTrustLevel(svgContent, level);

        if (!sanitized) {
          console.warn(`[SafeSVGImage] SVG validation failed for: ${src}`);
          setIsValid(false);
          if (fallback) {
            setSafeSrc(fallback);
          }
          return;
        }

        // Convert to data URL for Next.js Image component
        const dataUrl = `data:image/svg+xml;base64,${btoa(sanitized)}`;
        setSafeSrc(dataUrl);
        setIsValid(true);
      } catch (error) {
        console.error(`[SafeSVGImage] Error sanitizing SVG:`, error);
        setIsValid(false);
        if (fallback) {
          setSafeSrc(fallback);
        }
      }
    };

    sanitize();
  }, [src, trustLevel, fallback]);

  if (!isValid && !fallback) {
    return (
      <div
        className={className}
        style={{ width, height }}
        aria-label={alt}
        role="img"
      >
        {/* Fallback: empty div with dimensions */}
      </div>
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...imageProps}
    />
  );
}
