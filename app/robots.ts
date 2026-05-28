import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chanoatech.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/compte/', '/checkout', '/commande/', '/auth/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
