import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = '/Journify-v1';

const nextConfig = {
  output: 'export',
  // basePath and assetPrefix are usually needed for GitHub Pages project sites
  // If deploying to a custom domain, these might need to be removed.
  basePath: isProd ? repoName : undefined,
  assetPrefix: isProd ? repoName : undefined,
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
