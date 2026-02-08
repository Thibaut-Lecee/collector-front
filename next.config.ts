import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  outputFileTracingRoot: path.join(process.cwd(), '..'),

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Proxy Grafana requests to backend API
  async rewrites() {
    const apiPublicUrl = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    ).trim();
    const apiOrigin = (process.env.INTERNAL_API_URL || '').trim()
      ? (process.env.INTERNAL_API_URL || '').trim()
      : apiPublicUrl.replace(/\/api\/?$/, '');

    return [
      {
        source: '/internal/grafana/:path*',
        destination: `${apiOrigin}/internal/grafana/:path*`,
      },
    ];
  },
};

export default nextConfig;
