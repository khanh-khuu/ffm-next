import type { NextConfig } from "next";
import path from 'path';
import CopyPlugin from "copy-webpack-plugin";
import PermissionsOutputPlugin from 'webpack-permissions-plugin';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    config.externals = [...config.externals, 'ffmpeg-ffprobe-static']

    config.plugins.push(new CopyPlugin({
      patterns: [
        { from: "./node_modules/ffmpeg-ffprobe-static/ffmpeg.exe", to: "./app/ffmpeg.exe" },
        { from: "./node_modules/ffmpeg-ffprobe-static/ffprobe.exe", to: "./app/ffprobe.exe" },
      ],
    }))
    
    config.plugins.push(new PermissionsOutputPlugin({
      buildFiles: [
        "./.next/server/app/ffmpeg.exe",
        "./.next/server/app/ffprobe.exe",
      ],
    }))

    return config;
  },
  // output: "standalone"
};

export default nextConfig;
