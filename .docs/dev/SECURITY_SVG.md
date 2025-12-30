# SVG Security Guide

## Overview

SVGs can contain JavaScript and other executable content, making them a potential XSS attack vector. This guide explains how to safely handle SVGs in your Next.js application.

## The Risk

SVGs can execute JavaScript through:

- `<script>` tags
- Event handlers (`onclick`, `onload`, `onerror`, etc.)
- `href` attributes with `javascript:` protocol
- `<style>` tags with `@import` or `expression()`
- External resources loaded via `<use>` or `<image>`

## Security Strategies

### 1. Source Trust Levels

**Trusted Sources** (Your own files)

- Files in `/public` folder
- Files from your own domain
- Files you've manually reviewed
- **Action**: Basic validation only

**Validated Sources** (Known but external)

- Files from your CDN
- Files from trusted third parties
- **Action**: Sanitize event handlers and scripts

**Untrusted Sources** (External/User-generated)

- User-uploaded SVGs
- External URLs
- Third-party content
- **Action**: Full sanitization

### 2. Sanitization

Use the `sanitizeSVG()` function from `lib/svg-security.ts`:

```typescript
import {
  sanitizeSVG,
  getSVGTrustLevel,
  sanitizeSVGByTrustLevel,
} from "@/lib/svg-security";

// Option 1: Auto-detect trust level
const trustLevel = getSVGTrustLevel(svgSource);
const safeSvg = sanitizeSVGByTrustLevel(svgString, trustLevel);

// Option 2: Manual sanitization
const safeSvg = sanitizeSVG(svgString, {
  removeEventHandlers: true,
  removeScripts: true,
  removeStyles: true,
  removeHrefs: true,
  strict: true, // Only allow whitelisted attributes
});
```

### 3. Content Security Policy (CSP)

Add CSP headers to prevent inline scripts and limit resource loading:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval'", // 'unsafe-eval' needed for Next.js
              "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' needed for Tailwind
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              // Block inline event handlers
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
```

**Note**: CSP can break some Next.js features. Test thoroughly and adjust as needed.

### 4. Server-Side Validation

If SVGs come from user input or external APIs, validate on the server:

```typescript
// app/api/upload-svg/route.ts
import { sanitizeSVG } from "@/lib/svg-security";

export async function POST(request: Request) {
  const formData = await request.formData();
  const svgFile = formData.get("svg");

  if (!svgFile || typeof svgFile === "string") {
    return Response.json({ error: "Invalid file" }, { status: 400 });
  }

  const svgContent = await svgFile.text();
  const sanitized = sanitizeSVG(svgContent, { strict: true });

  if (!sanitized) {
    return Response.json({ error: "Invalid or unsafe SVG" }, { status: 400 });
  }

  // Save sanitized SVG
  // ...
}
```

### 5. Using Next.js Image Component

When using `dangerouslyAllowSVG: true` in `next.config.ts`:

```typescript
// Only use with trusted sources
<Image
  src="/trusted-icon.svg" // ✅ Your own file
  alt="Icon"
  width={24}
  height={24}
/>

// For untrusted sources, sanitize first
import { sanitizeSVG, getSVGTrustLevel } from '@/lib/svg-security';

const trustLevel = getSVGTrustLevel(externalSvgUrl);
if (trustLevel === SVGTrustLevel.UNTRUSTED) {
  // Fetch and sanitize before using
  const response = await fetch(externalSvgUrl);
  const svgContent = await response.text();
  const sanitized = sanitizeSVG(svgContent, { strict: true });
  // Convert to data URL or save to public folder
}
```

### 6. Alternative: Use React Components

Instead of using SVGs as images, import them as React components:

```typescript
// This is safer - SVGs are bundled and validated at build time
import { ReactComponent as Icon } from './icon.svg';

function MyComponent() {
  return <Icon className="w-6 h-6" />;
}
```

**Note**: Requires `@svgr/webpack` or similar loader.

## Best Practices

### ✅ DO

- ✅ Sanitize all user-uploaded SVGs
- ✅ Validate SVGs from external sources
- ✅ Use CSP headers to limit script execution
- ✅ Prefer React components for static SVGs
- ✅ Review SVGs in `/public` before committing
- ✅ Use `getSVGTrustLevel()` to determine sanitization level
- ✅ Log SVG validation failures for monitoring

### ❌ DON'T

- ❌ Trust SVGs from external URLs without sanitization
- ❌ Allow user-uploaded SVGs without validation
- ❌ Use `dangerouslySetInnerHTML` with unsanitized SVGs
- ❌ Disable CSP without understanding the risks
- ❌ Assume SVGs in `/public` are safe if they come from external sources

## Implementation Checklist

- [ ] Review all SVGs in `/public` folder
- [ ] Add CSP headers (if not breaking functionality)
- [ ] Implement server-side validation for user uploads
- [ ] Use `sanitizeSVG()` for external SVGs
- [ ] Set up monitoring for SVG validation failures
- [ ] Document trusted SVG sources
- [ ] Consider using DOMPurify for more robust sanitization

## Advanced: Using DOMPurify

For production applications handling untrusted SVGs, consider using [DOMPurify](https://github.com/cure53/DOMPurify):

```bash
pnpm add isomorphic-dompurify
```

```typescript
import DOMPurify from "isomorphic-dompurify";

export function sanitizeSVGWithDOMPurify(svgString: string): string {
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true, svgFilters: true },
    KEEP_CONTENT: true,
    ADD_ATTR: ["viewBox", "preserveAspectRatio"],
  });
}
```

## Monitoring

Set up logging to track SVG validation:

```typescript
import { logger } from "@/lib/logger";

const sanitized = sanitizeSVG(svgString);
if (!sanitized) {
  logger.warn("SVG validation failed", {
    source: svgSource,
    length: svgString.length,
  });
}
```

## References

- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN SVG Security](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/script)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
