import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, XCircle } from 'lucide-react'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { createProduct } from './actions'
import ImageUploader from '@/components/admin/ImageUploader'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { CategoryListResponse, CategoryDto } from '@/lib/api/categories'

export const metadata: Metadata = { title: 'Nouveau produit — Admin' }

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminProduitNewPage({ searchParams }: Props) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const { error } = await searchParams

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  let allCategories: CategoryDto[] = []
  try {
    const res = await apiClient.get<CategoryListResponse>('/categorie', {
      params: { limit: 200 },
      headers,
    })
    allCategories = res.data.data ?? []
  } catch {
    // silencieux
  }

  const mainCats = allCategories.filter((c) => !c.parent_id)
  const subCats = allCategories.filter((c) => c.parent_id)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-primary">Admin</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/admin/produits" className="hover:text-primary">Produits</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Nouveau</span>
      </nav>

      <h1 className="mb-6 text-xl font-bold">Créer un produit</h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          Erreur : {error}
        </div>
      )}

      <form action={createProduct} className="space-y-6">
        {/* Identity */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Identité du produit
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nom *</label>
              <input name="name" required className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Marque</label>
                <input name="brand" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Modèle</label>
                <input name="model" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">SKU / Référence</label>
              <input name="sku" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea name="description" rows={5} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-y" />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tarification
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Prix (FCFA) *</label>
              <input name="price" type="number" min="0" step="1" required className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Prix (EUR)</label>
              <input name="price_eur" type="number" min="0" step="0.01" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Prix barré (FCFA)</label>
              <input name="compare_price" type="number" min="0" step="1" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Inventaire & Catégorie
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Stock *</label>
              <input name="stock" type="number" min="0" step="1" required defaultValue={0} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Catégorie</label>
              <select name="category_id" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="">— Aucune —</option>
                {mainCats.map((main) => (
                  <optgroup key={main.id} label={main.name}>
                    {subCats.filter((s) => s.parent_id === main.id).map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Images produit
          </h2>
          <ImageUploader initialImages={[]} token={token} />
        </section>

        {/* Visibility */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" name="is_active" value="1" defaultChecked className="h-4 w-4 accent-primary" />
            <span className="text-sm font-medium">Publier immédiatement (visible en boutique)</span>
          </label>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
            Créer le produit
          </button>
          <Link href="/admin/produits" className="rounded-md border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
