import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  // Standalone output for VPS deployment (PM2 + Nginx on Hostinger)
  // Build: next build  →  .next/standalone/
  // Start: node .next/standalone/server.js  (or via PM2)
  output: 'standalone',

  images: {
    // Allow external image domains used for product images
    remotePatterns: [
      // Images servies par NestJS (uploads locaux)
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
      // Domaines HTTPS génériques (CDN externes, Supabase — conservé jusqu'à P9)
      { protocol: 'https', hostname: '**' },
    ],
  },

  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
};

export default nextConfig;
