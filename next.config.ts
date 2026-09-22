// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  async headers() {
    return [{
      source: "/formateurs/ressources/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.dronecontrast.com",
      },
    ],
  },
};

module.exports = nextConfig;
