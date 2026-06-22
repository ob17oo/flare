import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nddckxjhithkxupkiopv.supabase.co',
        pathname: '/storage/v1/object/**',
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  }
};

export default nextConfig;
