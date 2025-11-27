/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination: "https://server.bizengo.com/api/:path*",
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
