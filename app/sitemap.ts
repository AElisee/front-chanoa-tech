import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chanoatech.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/boutique`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/entreprises`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/ecoles`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/etat`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/datacenter`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/packs`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/securite`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/references`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact-grands-comptes`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Dynamic product pages
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(2000)

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE}/boutique/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic category pages
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .eq('is_active', true)

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${BASE}/boutique?categorie=${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...categoryPages]
}
