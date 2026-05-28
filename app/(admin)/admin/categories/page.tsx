import Link from 'next/link'
import type { Metadata } from 'next'
import { Plus, Pencil, Eye, EyeOff, Tag } from 'lucide-react'
import { guardAdmin } from '@/lib/supabase/server'
import { toggleCategoryActive } from './actions'

export const metadata: Metadata = { title: 'Catégories — Admin' }

interface Props {
  searchParams: Promise<{ created?: string; deleted?: string; error?: string }>
}

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const { created, deleted, error } = await searchParams
  const supabase = await guardAdmin()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, is_active, parent_id, sort_order, image_url')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  const all = (categories ?? []) as Array<{
    id: string; name: string; slug: string; is_active: boolean
    parent_id: string | null; sort_order: number; image_url: string | null
  }>

  const parents = all.filter((c) => !c.parent_id)
  const children = all.filter((c) => c.parent_id)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </Link>
      </div>

      {created && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          Catégorie créée avec succès.
        </div>
      )}
      {deleted && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          Catégorie supprimée.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      {parents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 text-center">
          <Tag className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">Aucune catégorie pour l'instant.</p>
          <Link href="/admin/categories/new" className="mt-4 text-sm text-primary hover:underline">
            Créer la première catégorie
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {parents.map((parent) => {
            const subs = children.filter((c) => c.parent_id === parent.id)
            return (
              <div key={parent.id} className="rounded-xl border bg-white shadow-sm">
                {/* Parent row */}
                <div className="flex items-center gap-4 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{parent.name}</p>
                    <p className="text-xs text-muted-foreground">/{parent.slug}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${parent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {parent.is_active ? 'Actif' : 'Inactif'}
                  </span>
                  <div className="flex items-center gap-2">
                    <form action={toggleCategoryActive.bind(null, parent.id, parent.is_active)}>
                      <button
                        type="submit"
                        title={parent.is_active ? 'Désactiver' : 'Activer'}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {parent.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </form>
                    <Link
                      href={`/admin/categories/${parent.id}`}
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Subcategories */}
                {subs.length > 0 && (
                  <div className="border-t divide-y bg-gray-50/60">
                    {subs.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-4 px-5 py-2.5 pl-14">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">/{sub.slug}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {sub.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        <div className="flex items-center gap-2">
                          <form action={toggleCategoryActive.bind(null, sub.id, sub.is_active)}>
                            <button
                              type="submit"
                              title={sub.is_active ? 'Désactiver' : 'Activer'}
                              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              {sub.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </form>
                          <Link
                            href={`/admin/categories/${sub.id}`}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add subcategory shortcut */}
                <div className="border-t px-5 py-2 pl-14">
                  <Link
                    href={`/admin/categories/new?parent_id=${parent.id}`}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    + Ajouter une sous-catégorie
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
