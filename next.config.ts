import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },

  async redirects() {
    return [
      // Redirect bare domain → www (permanent 301)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'ziyakart.com' }],
        destination: 'https://www.ziyakart.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

