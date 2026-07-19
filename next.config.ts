import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Listing + agent photos are served from Unsplash for the demo; route them
    // through the Next image optimizer (resizing, WebP, caching) instead of hot-linking.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
