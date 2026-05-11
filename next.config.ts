import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    '192.168.68.105', // your phone IP shown in log
    '192.168.68.0/24', // optional: allow whole subnet
  ],
};

export default nextConfig;
