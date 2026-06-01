import type { NextConfig } from "next";

const securityHeaders = [
<<<<<<< HEAD
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
=======
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e

const nextConfig: NextConfig = {
  // Standalone output for VPS deployment (PM2 + Nginx on Hostinger)
  // Build: next build  →  .next/standalone/
  // Start: node .next/standalone/server.js  (or via PM2) 
  output: 'standalone',


  images: {
    // Allow external image domains used for product images
    remotePatterns: [
      // Uploads servis par NestJS en local (dev — port 3000)
 
      // {
      //   protocol: "http",
      //   hostname: "localhost",
      //   port: "5000",
      //   pathname: "/uploads/**",
      // },
      // Autoriser l'IP du VPS ou tout domaine pointant vers l'API
      // {
      //   protocol: "http",
      //   hostname: "**",
      //   port: "",
      //   pathname: "/uploads/**",
      // },
      // Tout domaine HTTPS (CDN, stockage distant)
//       { protocol: "https", hostname: "**" },
// =======
      { protocol: 'http', hostname: 'localhost', port: '3200', pathname: '/uploads/**' },
      // Uploads servis par NestJS sur le VPS (port 3000 direct)
      { protocol: 'http', hostname: '148.230.112.175', port: '3200', pathname: '/uploads/**' },
      // Tout domaine HTTPS (CDN, stockage distant)
      { protocol: 'https', hostname: '**' },
 
    ],
  },

  async headers() {
<<<<<<< HEAD
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
=======
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
};

export default nextConfig;
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
