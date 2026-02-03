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
};

export default nextConfig;
