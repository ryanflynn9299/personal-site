import type { NextConfig } from "next";

// Bundle Analyzer (optional - install with: pnpm add -D @next/bundle-analyzer)
// Uncomment when @next/bundle-analyzer is installed
// import bundleAnalyzer from "@next/bundle-analyzer";
// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// });

// ---------------------------------------------------------------------------
// Security Headers (see .docs/SECURITY.md)
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV !== "production";

/** Extracts a valid origin from an env URL, ignoring placeholders. */
function envOrigin(value: string | undefined): string | null {
  if (!value || value === "DISABLED" || value.includes("your-")) {
    return null;
  }
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const matomoOrigin = envOrigin(process.env.NEXT_PUBLIC_MATOMO_URL);
const directusOrigin = envOrigin(process.env.NEXT_PUBLIC_DIRECTUS_URL);

/**
 * Content Security Policy.
 *
 * - `unsafe-inline` script/style is required by Next.js App Router inline
 *   bootstrapping and Tailwind/Framer Motion inline styles (no nonce setup).
 * - `unsafe-eval` and `ws:` are dev-only (Turbopack/React Refresh + HMR).
 * - Matomo and Directus origins are added only when configured.
 */
const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${matomoOrigin ? ` ${matomoOrigin}` : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://placehold.co https://images.unsplash.com${directusOrigin ? ` ${directusOrigin}` : ""}${matomoOrigin ? ` ${matomoOrigin}` : ""}`,
  `font-src 'self' data:`,
  `connect-src 'self'${isDev ? " ws:" : ""}${matomoOrigin ? ` ${matomoOrigin}` : ""}${directusOrigin ? ` ${directusOrigin}` : ""}`,
  `worker-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // HSTS is only meaningful over HTTPS; browsers ignore it on plain HTTP.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]),
];

const nextConfig: NextConfig = {
  // 1. This is the fix for your Docker build error
  output: "standalone",

  // Do not advertise the framework in response headers
  poweredByHeader: false,

  // Turbopack Configuration
  // Turbopack is the default bundler in Next.js 16 for development
  // For production builds, use: pnpm run build (which uses --turbopack flag)
  // This configuration works for both development (Turbopack) and production (Turbopack or webpack)

  // Fix for thread-stream worker.js error
  // Mark thread-stream as an external package for server components
  // This prevents Next.js from trying to bundle it, which causes worker thread errors
  // Works with both Turbopack and webpack
  serverExternalPackages: ["thread-stream", "pino"],

  // Explicitly set the project root for Turbopack to resolve multiple lockfiles warning
  // In Next.js 16, this is a top-level property
  turbopack: {
    root: ".",
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  images: {
    // 2. This is the corrected 'remotePatterns' syntax
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8055",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      // 3. This is the NEW rule for container-to-container communication
      {
        protocol: "http",
        hostname: "backend", // The Docker service name
        port: "8055", // The Directus port
        pathname: "/assets/**", // Allow all images from the assets endpoint
      },
    ],
    dangerouslyAllowSVG: false,
  },
};

// Uncomment when @next/bundle-analyzer is installed
// export default withBundleAnalyzer(nextConfig);
export default nextConfig;
