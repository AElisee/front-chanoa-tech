import type { MetadataRoute } from 'next'
import { productsApi } from '@/lib/api/products'
import { categoriesApi } from '@/lib/api/categories'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chanoatech.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
  let productPages: MetadataRoute.Sitemap = []
  try {
    const result = await productsApi.getProducts({ limit: 2000 })
    productPages = result.data.data.map((p) => ({
      url: `${BASE}/boutique/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // Si l'API est indisponible au moment du build, on génère le sitemap sans les produits
  }

  // Dynamic category pages
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const result = await categoriesApi.getCategories({ limit: 500 })
    categoryPages = result.data.data.map((c) => ({
      url: `${BASE}/boutique?categorie=${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // Silencieux
  }

  return [...staticPages, ...productPages, ...categoryPages]
}
