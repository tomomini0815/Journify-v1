import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = '/Journify-v1';

const nextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: isProd ? repoName : '',
  assetPrefix: isProd ? repoName : '',
};

export default nextConfig;
