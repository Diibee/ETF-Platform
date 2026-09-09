import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root: without this Turbopack walks up and finds an
  // unrelated package-lock.json in the user's home directory.
  turbopack: { root: import.meta.dirname },
  poweredByHeader: false,
  images: {
    // Everything the landing page renders is inline SVG or local, so no remote
    // patterns are needed. Modern formats first for the raster assets that remain.
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
