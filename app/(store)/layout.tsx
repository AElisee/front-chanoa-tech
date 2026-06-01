export const dynamic = 'force-dynamic'

import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import AuthInitializer from '@/components/AuthInitializer'
import { apiClient } from '@/lib/api/client'
import type { CategoryListResponse, CategoryDto } from '@/lib/api/categories'

async function getMainCategories(): Promise<CategoryDto[]> {
  try {
    const res = await apiClient.get<CategoryListResponse>('/categorie', {
      params: { limit: 100 },
    })
    return (res.data.data ?? [])
      .filter((c) => !c.parent_id && c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
  } catch {
    return []
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getMainCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <AuthInitializer />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
