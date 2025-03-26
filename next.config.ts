import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    config.externals = [...config.externals, 'ffmpeg-ffprobe-static']
    return config;
  },
  output: "standalone"
};

export default nextConfig;
