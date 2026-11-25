import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-mdx-remote"],
  async redirects() {
    return [
      // the old Vercel address served a full copy of the site
      {
        source: "/:path*",
        has: [{ type: "host", value: "kryptokodes.vercel.app" }],
        destination: "https://www.sehaj.tech/:path*",
        permanent: true,
      },
      { source: "/myavatar.png", destination: "/sehaj-preet.jpg", permanent: true },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ghchart.rshah.org",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
    ],
  },
};

export default nextConfig;
