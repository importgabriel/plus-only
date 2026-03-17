import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Surface TypeScript errors during `next build` so CI catches them.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Surface ESLint errors during `next build`.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
