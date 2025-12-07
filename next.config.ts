/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. This is the fix for your Docker build error
  output: "standalone",

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
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
