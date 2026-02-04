import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bktwpay8ectf5bfo.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  turbopack: {},
};

export default nextConfig;
