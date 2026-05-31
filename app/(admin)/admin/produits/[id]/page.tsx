import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ChevronRight, CheckCircle, XCircle, Package } from 'lucide-react'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { formatFCFA, formatEUR } from '@/lib/utils/format'
import { updateProduct, createVariant, updateVariant, deleteVariant } from './actions'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import ImageUploader from '@/components/admin/ImageUploader'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { ProductDto, VariantDto } from '@/lib/api/products'
import type { CategoryListResponse, CategoryDto } from '@/lib/api/categories'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string; error?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  try {
    const res = await apiClient.get<ProductDto>(`/produits/${id}`, { headers })
    return { title: `Modifier — ${res.data.name}` }
  } catch {
    return { title: 'Produit introuvable' }
  }
}

export default async function AdminProduitEditPage({ params, searchParams }: Props) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const { id } = await params
  const sp = await searchParams

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  // Charger le produit via l'API
  let product: ProductDto | null = null
  try {
    const res = await apiClient.get<ProductDto>(`/produits/${id}`, { headers })
    product = res.data
  } catch {
    notFound()
  }
  if (!product) notFound()

  // Variantes via API NestJS
  let variants: VariantDto[] = []
  try {
    const res = await apiClient.get<VariantDto[]>(`/produits/${id}/variants`, { headers })
    variants = res.data ?? []
    variants.sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
  } catch {
    // silencieux — on affiche une liste vide si l'endpoint est inaccessible
  }

  // Catégories via l'API
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

  const updateAction = updateProduct.bind(null, id)

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-primary">Admin</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/admin/produits" className="hover:text-primary">Produits</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      {/* Status banners */}
      {sp.success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Produit mis à jour avec succès.
        </div>
      )}
      {sp.error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          Erreur : {sp.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Main form ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <form action={updateAction} className="space-y-6">
            {/* Identity */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Identité du produit
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Nom *</label>
                  <input
                    name="name"
                    required
                    defaultValue={product.name}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Marque</label>
                    <input
                      name="brand"
                      defaultValue={product.brand ?? ''}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Modèle</label>
                    <input
                      name="model"
                      defaultValue={product.model ?? ''}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">SKU / Référence</label>
                  <input
                    name="sku"
                    defaultValue={product.sku ?? ''}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    rows={5}
                    defaultValue={product.description ?? ''}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-y"
                  />
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
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    required
                    defaultValue={product.price}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Prix (EUR)</label>
                  <input
                    name="price_eur"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product.price_eur ?? ''}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Prix barré (FCFA)</label>
                  <input
                    name="compare_price"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={product.compare_price ?? ''}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Taux fixe : 1 EUR = 655,957 FCFA
              </p>
            </section>

            {/* Inventory */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Inventaire &amp; Catégorie
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Stock *</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    defaultValue={product.stock}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Catégorie</label>
                  <select
                    name="category_id"
                    defaultValue={product.category_id ?? ''}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">— Aucune —</option>
                    {mainCats.map((main) => {
                      const subs = subCats.filter((s) => s.parent_id === main.id)
                      if (subs.length === 0) {
                        return <option key={main.id} value={main.id}>{main.name}</option>
                      }
                      return (
                        <optgroup key={main.id} label={main.name}>
                          <option value={main.id}>{main.name}</option>
                          {subs.map((sub) => (
                            <option key={sub.id} value={sub.id}>↳ {sub.name}</option>
                          ))}
                        </optgroup>
                      )
                    })}
                  </select>
                </div>
              </div>
            </section>

            {/* Images */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Images produit
              </h2>
              <ImageUploader initialImages={product.images ?? []} productId={id} token={token} />
            </section>

            {/* Preserve is_active when saving other fields (visibility is managed via separate form in sidebar) */}
            {product.is_active && <input type="hidden" name="is_active" value="1" />}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Enregistrer
              </button>
              <Link
                href="/admin/produits"
                className="rounded-md border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>

        {/* ── Sidebar ────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Visibility */}
          <form action={updateAction}>
            {/* Hidden fields to keep other data intact when toggling active */}
            <input type="hidden" name="name" value={product.name} />
            <input type="hidden" name="description" value={product.description ?? ''} />
            <input type="hidden" name="brand" value={product.brand ?? ''} />
            <input type="hidden" name="model" value={product.model ?? ''} />
            <input type="hidden" name="sku" value={product.sku ?? ''} />
            <input type="hidden" name="price" value={product.price} />
            <input type="hidden" name="price_eur" value={product.price_eur ?? ''} />
            <input type="hidden" name="compare_price" value={product.compare_price ?? ''} />
            <input type="hidden" name="stock" value={product.stock} />
            <input type="hidden" name="category_id" value={product.category_id ?? ''} />
            <input type="hidden" name="images" value={(product.images ?? []).join('\n')} />

            <section className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Visibilité
              </h2>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  value="1"
                  defaultChecked={product.is_active}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm font-medium">
                  Produit actif (visible en boutique)
                </span>
              </label>
              <button
                type="submit"
                className="mt-3 w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Mettre à jour la visibilité
              </button>
            </section>
          </form>

          {/* Summary */}
          <section className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Résumé
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix FCFA</span>
                <span className="font-semibold text-action">{formatFCFA(product.price)}</span>
              </div>
              {product.price_eur && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix EUR</span>
                  <span className="font-medium">{formatEUR(product.price_eur)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock</span>
                <span className={`font-semibold ${product.stock === 0 ? 'text-destructive' : product.stock <= 5 ? 'text-orange-500' : 'text-green-700'}`}>
                  {product.stock} unité{product.stock > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {product.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
            <div className="border-t pt-3">
              <Link
                href={`/boutique/${product.slug}`}
                target="_blank"
                className="text-xs font-medium text-primary hover:underline"
              >
                Voir la fiche produit →
              </Link>
            </div>
          </section>

          {/* Image preview main */}
          {product.images?.[0] && (
            <section className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Image principale
              </h2>
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-3"
                  sizes="200px"
                />
              </div>
            </section>
          )}
          {!product.images?.[0] && (
            <section className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                <Package className="h-12 w-12 text-muted-foreground/30" />
              </div>
            </section>
          )}

          {/* Delete product */}
          <DeleteProductButton productId={id} />
        </div>
      </div>

      {/* ── Variants section ─────────────────────────────────────── */}
      <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Variantes ({variants.length})
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Options comme RAM, stockage, couleur. Format JSON : {`{"ram":"16 Go","stockage":"512 Go"}`}
        </p>

        {/* Existing variants */}
        {variants.length > 0 && (
          <div className="mb-6 space-y-3">
            {variants.map((v) => {
              const updateAction = updateVariant.bind(null, id, v.id)
              const deleteAction = deleteVariant.bind(null, id, v.id)
              const label = Object.values(v.options).join(' / ') || 'Sans option'
              return (
                <div key={v.id} className={`rounded-lg border p-4 ${v.is_active ? '' : 'opacity-60'}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {v.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <form action={updateAction} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Options (JSON)</label>
                        <input name="options" defaultValue={JSON.stringify(v.options)} className="w-full rounded-md border bg-background px-2 py-1.5 font-mono text-xs" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Prix FCFA</label>
                        <input name="price" type="number" min="0" step="1" defaultValue={v.price} className="w-full rounded-md border bg-background px-2 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Stock</label>
                        <input name="stock" type="number" min="0" step="1" defaultValue={v.stock} className="w-full rounded-md border bg-background px-2 py-1.5 text-xs" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">SKU</label>
                        <input name="sku" defaultValue={v.sku ?? ''} className="w-full rounded-md border bg-background px-2 py-1.5 text-xs" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" name="is_active" value="1" defaultChecked={v.is_active} className="h-3.5 w-3.5 accent-primary" />
                        Active
                      </label>
                      <button type="submit" className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90">
                        Sauver
                      </button>
                      <form action={deleteAction}>
                        <button type="submit" className="rounded-md border border-destructive/30 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10">
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </form>
                </div>
              )
            })}
          </div>
        )}

        {/* Add new variant */}
        <div className="rounded-lg border-2 border-dashed p-4">
          <h3 className="mb-3 text-sm font-medium">Ajouter une variante</h3>
          <form action={createVariant.bind(null, id)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Options (JSON) *</label>
                <input name="options" required placeholder='{"ram":"8 Go","stockage":"256 Go"}' className="w-full rounded-md border bg-background px-2 py-1.5 font-mono text-xs" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Prix FCFA *</label>
                <input name="price" type="number" min="0" step="1" required className="w-full rounded-md border bg-background px-2 py-1.5 text-xs" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Stock *</label>
                <input name="stock" type="number" min="0" step="1" required defaultValue={0} className="w-full rounded-md border bg-background px-2 py-1.5 text-xs" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">SKU</label>
                <input name="sku" placeholder="DEL-XPS-16-512" className="w-full rounded-md border bg-background px-2 py-1.5 text-xs" />
              </div>
            </div>
            <button type="submit" className="rounded-md bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
              + Ajouter la variante
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
