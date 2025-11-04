import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/.prisma/**/*',
      './node_modules/@prisma/client/**/*',
    ],
  },
};

export default nextConfig;
