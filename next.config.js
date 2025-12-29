// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // output: 'export',
//   images: {
//     unoptimized:true,
//   },
//   trailingSlash: false,
//   images: {
//     unoptimized: true,
//   },
//   pageExtensions: ["ts", "tsx", "js", "jsx"],
//   async rewrites() {
//     return process.env.NODE_ENV === "development"
//       ? [
//           {
//             source: "/api/:path*",
//             destination: "https://server.siiqo.com/api/:path*",
//           },
//         ]
//       : [];
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  pageExtensions: ["ts", "tsx", "js", "jsx"],
};

module.exports = nextConfig;

