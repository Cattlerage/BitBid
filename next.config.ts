import type { NextConfig } from 'next';

const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
let remoteHost: string | null = null;

if (publicBaseUrl) {
  try {
    remoteHost = new URL(publicBaseUrl).hostname;
  } catch {
    remoteHost = null;
  }
}

const nextConfig: NextConfig = {
  devIndicators: false,
  reactCompiler: true,
  allowedDevOrigins: ['192.168.68.105', '192.168.1.21', '192.168.68.0/24'],
  images: {
    remotePatterns: remoteHost
      ? [
          {
            protocol: 'https',
            hostname: remoteHost,
          },
        ]
      : [],
  },
};

export default nextConfig;
