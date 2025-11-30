import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = '/Journify-v1';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProd ? repoName : '',
  assetPrefix: isProd ? repoName : '',
};

export default nextConfig;
