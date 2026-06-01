import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Standalone output for VPS deployment (PM2 + Nginx on Hostinger)
  // Build: next build  →  .next/standalone/
  // Start: node .next/standalone/server.js  (or via PM2)
  output: "standalone",

  images: {
    // Allow external image domains used for product images
    remotePatterns: [
      // Uploads servis par NestJS en local (dev — port 3000)
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      // Autoriser l'IP du VPS ou tout domaine pointant vers l'API
      {
        protocol: "http",
        hostname: "**",
        port: "",
        pathname: "/uploads/**",
      },
      // Tout domaine HTTPS (CDN, stockage distant)
      { protocol: "https", hostname: "**" },
    ],
  },

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
