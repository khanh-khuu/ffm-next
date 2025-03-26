import type { NextConfig } from "next";
import path from 'path';
// import CopyPlugin from "copy-webpack-plugin";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    config.externals = [...config.externals, 'ffmpeg-ffprobe-static']

    // config.plugins.push(new CopyPlugin({
    //   patterns: [
    //     { from: "./node_modules/ffprobe-static/bin", to: "./app/api/upload/bin/" },
    //   ],
    // }))

    return config;
  },
  // output: "standalone"
};

export default nextConfig;
