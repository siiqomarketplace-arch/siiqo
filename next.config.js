/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: process.env.NODE_ENV === "development", // Disable optimization in dev
    remotePatterns: [
      {
        protocol: "https",
        hostname: "server.siiqo.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com", // If you use S3 or similar
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache for immutable images
  },
  compress: true,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  async rewrites() {
    return [
      {
        // When you call "/api/user/profile" in the frontend...
        source: "/api/:path*",
        // ...Next.js sends it to "https://server.siiqo.com/api/user/profile" from the SERVER side.
        destination: "https://server.siiqo.com/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*\.(png|jpg|jpeg|gif|webp|svg|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.siiqo.com",
          },
        ],
        destination: "https://siiqo.com/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
