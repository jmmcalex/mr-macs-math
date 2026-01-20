import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/mr-macs-math',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
