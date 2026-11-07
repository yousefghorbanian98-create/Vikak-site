import type { NextConfig } from 'next';

// Preview host for this sandbox: https://3000-i53hwstxht0daojc1gpzp.e2b.app
const PREVIEW_HOSTS = ['3000-i53hwstxht0daojc1gpzp.e2b.app', '*.e2b.app'];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // Allows the proxied preview host to load /_next/* assets in dev mode.
  allowedDevOrigins: PREVIEW_HOSTS,
  async headers() {
    return [
      {
        // Preview iframes must be allowed to embed the site.
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://*.e2b.app https://*.arena.ai" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
