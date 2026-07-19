import { POSTS } from './lib/posts-data.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // 301s from the original Squarespace URL paths to the new /blog/<slug> routes.
    return POSTS.filter((p) => p.sourcePath).map((p) => ({
      source: '/' + p.sourcePath,
      destination: '/blog/' + p.slug,
      permanent: true,
    }));
  },
};

export default nextConfig;
