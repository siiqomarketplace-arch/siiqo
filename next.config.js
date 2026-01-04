/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
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
};

module.exports = nextConfig;
