/**
 * SVG Security Utilities
 *
 * Provides functions to sanitize and validate SVG content to prevent XSS attacks.
 * SVGs can contain JavaScript in <script> tags, event handlers, and other dangerous content.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/script
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 */

/**
 * Dangerous SVG attributes that can execute JavaScript
 */
const DANGEROUS_ATTRIBUTES = new Set([
  "onload",
  "onerror",
  "onclick",
  "onmouseover",
  "onmouseout",
  "onfocus",
  "onblur",
  "onchange",
  "onsubmit",
  "onreset",
  "onselect",
  "onunload",
  "onabort",
  "onkeydown",
  "onkeypress",
  "onkeyup",
  "onmousedown",
  "onmousemove",
  "onmouseup",
  "href", // Can be used with javascript: protocol
  "xlink:href", // Legacy SVG href
]);

/**
 * Dangerous SVG elements that can execute code
 */
const DANGEROUS_ELEMENTS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "style", // Can contain @import or expression()
]);

/**
 * Allowed SVG attributes (safe subset)
 */
export const ALLOWED_ATTRIBUTES = new Set([
  // Core SVG attributes
  "viewBox",
  "width",
  "height",
  "xmlns",
  "xmlns:xlink",
  "preserveAspectRatio",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "opacity",
  "transform",
  "x",
  "y",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "d", // path data
  "points",
  "x1",
  "y1",
  "x2",
  "y2",
  "id",
  "class",
  "data-*", // Allow all data attributes
  // Presentation attributes
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
  "dominant-baseline",
  "clip-path",
  "mask",
  "filter",
]);

/**
 * Allowed SVG elements (safe subset)
 */
export const ALLOWED_ELEMENTS = new Set([
  "svg",
  "g",
  "path",
  "circle",
  "ellipse",
  "rect",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "defs",
  "use",
  "clipPath",
  "mask",
  "filter",
  "linearGradient",
  "radialGradient",
  "stop",
  "pattern",
  "title", // For accessibility
  "desc", // For accessibility
]);

/**
 * Sanitizes an SVG string by removing dangerous content
 *
 * This is a basic sanitizer. For production use, consider:
 * - Using DOMPurify library (more robust)
 * - Server-side validation before storing SVGs
 * - Content Security Policy headers
 *
 * @param svgString - Raw SVG string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized SVG string, or null if invalid
 *
 * @example
 * ```ts
 * const safeSvg = sanitizeSVG(maliciousSvg);
 * if (safeSvg) {
 *   // Use safeSvg with Next.js Image component
 * }
 * ```
 */
export function sanitizeSVG(
  svgString: string,
  options: {
    /** Remove all event handlers (onclick, onload, etc.) */
    removeEventHandlers?: boolean;
    /** Remove <script> tags */
    removeScripts?: boolean;
    /** Remove <style> tags */
    removeStyles?: boolean;
    /** Remove href attributes (can contain javascript:) */
    removeHrefs?: boolean;
    /** Strict mode: only allow whitelisted attributes/elements */
    _strict?: boolean;
  } = {}
): string | null {
  const {
    removeEventHandlers = true,
    removeScripts = true,
    removeStyles = true,
    removeHrefs = true,
    _strict = false,
  } = options;

  if (!svgString || typeof svgString !== "string") {
    return null;
  }

  let sanitized = svgString.trim();

  // Must start with <svg
  if (!sanitized.match(/^\s*<svg/i)) {
    return null;
  }

  // Remove <script> tags and their content
  if (removeScripts) {
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
  }

  // Remove dangerous elements
  DANGEROUS_ELEMENTS.forEach((tag) => {
    if (tag !== "script" && tag !== "style") {
      const regex = new RegExp(
        `<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`,
        "gi"
      );
      sanitized = sanitized.replace(regex, "");
    }
  });

  // Remove <style> tags and their content
  if (removeStyles) {
    sanitized = sanitized.replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      ""
    );
  }

  // Remove event handlers (onclick="...", onload="...", etc.)
  if (removeEventHandlers) {
    DANGEROUS_ATTRIBUTES.forEach((attr) => {
      if (attr === "href" || attr === "xlink:href") {
        if (removeHrefs) {
          // Remove href attributes that might contain javascript:
          sanitized = sanitized.replace(
            new RegExp(
              `\\s+${attr.replace(":", "\\:")}\\s*=\\s*["']?javascript:`,
              "gi"
            ),
            ""
          );
        }
      } else {
        // Remove event handler attributes
        sanitized = sanitized.replace(
          new RegExp(`\\s+${attr}\\s*=\\s*["'][^"']*["']`, "gi"),
          ""
        );
        sanitized = sanitized.replace(
          new RegExp(`\\s+${attr}\\s*=\\s*[^\\s>]*`, "gi"),
          ""
        );
      }
    });
  }

  // Remove javascript: protocol from any remaining hrefs
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: URLs that might contain scripts (optional, can be too aggressive)
  // sanitized = sanitized.replace(/data:\s*text\/html/gi, '');

  return sanitized;
}

/**
 * Validates that an SVG string appears safe
 *
 * This is a quick check. For thorough validation, use sanitizeSVG().
 *
 * @param svgString - SVG string to validate
 * @returns true if SVG appears safe, false otherwise
 */
export function isValidSVG(svgString: string): boolean {
  if (!svgString || typeof svgString !== "string") {
    return false;
  }

  // Must contain <svg tag
  if (!svgString.match(/<svg/i)) {
    return false;
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(svgString)) {
      return false;
    }
  }

  return true;
}

/**
 * Trust levels for SVG sources
 */
export enum SVGTrustLevel {
  /** Fully trusted - you control the source (e.g., your own public folder) */
  TRUSTED = "trusted",
  /** Partially trusted - from a known source but should be validated */
  VALIDATED = "validated",
  /** Untrusted - from external sources, must be sanitized */
  UNTRUSTED = "untrusted",
}

/**
 * Determines trust level for an SVG source based on its origin
 *
 * @param source - SVG source path or URL
 * @returns Trust level for the source
 */
export function getSVGTrustLevel(source: string): SVGTrustLevel {
  // Local files in public folder are trusted (works in both server and client)
  if (source.startsWith("/") && !source.startsWith("//")) {
    return SVGTrustLevel.TRUSTED;
  }

  // Same origin (your domain) - only check in browser
  if (typeof window !== "undefined") {
    try {
      const url = new URL(source, window.location.origin);
      if (url.origin === window.location.origin) {
        return SVGTrustLevel.TRUSTED;
      }
    } catch {
      // Invalid URL, treat as untrusted
    }
  }

  // Known trusted domains (add your CDN domains here)
  const trustedDomains: string[] = [
    // Add your trusted domains here, e.g.:
    // 'cdn.yourdomain.com',
    // 'assets.yourdomain.com',
  ];

  try {
    const url = new URL(source);
    if (trustedDomains.includes(url.hostname)) {
      return SVGTrustLevel.VALIDATED;
    }
  } catch {
    // Invalid URL
  }

  // External sources are untrusted
  return SVGTrustLevel.UNTRUSTED;
}

/**
 * Sanitizes SVG based on trust level
 *
 * @param svgString - SVG string to sanitize
 * @param trustLevel - Trust level of the source
 * @returns Sanitized SVG string, or original if trusted
 */
export function sanitizeSVGByTrustLevel(
  svgString: string,
  trustLevel: SVGTrustLevel
): string | null {
  switch (trustLevel) {
    case SVGTrustLevel.TRUSTED:
      // Still validate basic structure
      return isValidSVG(svgString) ? svgString : null;

    case SVGTrustLevel.VALIDATED:
      // Sanitize but allow more attributes
      return sanitizeSVG(svgString, {
        removeEventHandlers: true,
        removeScripts: true,
        removeStyles: false, // Allow styles for validated sources
        removeHrefs: true,
        _strict: false,
      });

    case SVGTrustLevel.UNTRUSTED:
      // Full sanitization
      return sanitizeSVG(svgString, {
        removeEventHandlers: true,
        removeScripts: true,
        removeStyles: true,
        removeHrefs: true,
        _strict: true,
      });
  }
}
