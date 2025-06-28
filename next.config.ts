import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
  }
};

export default nextConfig;
