import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');

    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb'
    }
  }
  // output: "standalone"
};

export default nextConfig;
