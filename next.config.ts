import type { NextConfig } from "next";

// Bundle Analyzer (optional - install with: pnpm add -D @next/bundle-analyzer)
// Uncomment when @next/bundle-analyzer is installed
// import bundleAnalyzer from "@next/bundle-analyzer";
// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// });

const nextConfig: NextConfig = {
  // 1. This is the fix for your Docker build error
  output: "standalone",

  // Turbopack Configuration
  // Turbopack is the default bundler in Next.js 16 for development
  // For production builds, use: pnpm run build (which uses --turbopack flag)
  // This configuration works for both development (Turbopack) and production (Turbopack or webpack)

  // Fix for thread-stream worker.js error
  // Mark thread-stream as an external package for server components
  // This prevents Next.js from trying to bundle it, which causes worker thread errors
  // Works with both Turbopack and webpack
  serverExternalPackages: ["thread-stream", "pino"],

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
    // Image optimization settings
    formats: ["image/avif", "image/webp"], // Prefer modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache optimized images for 60 seconds
  },
};

// Uncomment when @next/bundle-analyzer is installed
// export default withBundleAnalyzer(nextConfig);
export default nextConfig;
