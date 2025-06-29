const nextConfig = {
  /* config options here */
    images: {
        remotePatterns: [
            new URL('https://placehold.co/**'),
            new URL('http://localhost:3000/**'),
            new URL('http://localhost:8055/**'),
            new URL('https://images.unsplash.com/**')
        ]
    }
};

export default nextConfig;
