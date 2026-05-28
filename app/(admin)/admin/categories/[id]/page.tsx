import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { guardAdmin } from '@/lib/supabase/server'
import { updateCategory, deleteCategory } from '../actions'

export const metadata: Metadata = { title: 'Modifier catégorie — Admin' }

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function EditCategoryPage({ params, searchParams }: Props) {
  const { id } = await params
  const { success, error } = await searchParams
  const supabase = await guardAdmin()

  const [{ data: category }, { data: parents }] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name').is('parent_id', null).order('name'),
  ])

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-muted-foreground">Catégorie introuvable.</p>
        <Link href="/admin/categories" className="text-sm text-primary hover:underline">← Retour</Link>
      </div>
    )
  }

  const updateWithId = updateCategory.bind(null, id)
  const deleteWithId = deleteCategory.bind(null, id)

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/categories" className="rounded-md border p-1.5 hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Modifier : {category.name}</h1>
      </div>

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          Catégorie mise à jour.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={updateWithId} className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Nom <span className="text-destructive">*</span></label>
          <input
            name="name"
            required
            defaultValue={category.name}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Slug</label>
          <input
            name="slug"
            defaultValue={category.slug}
            className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={category.description ?? ''}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Catégorie parente</label>
          <select
            name="parent_id"
            defaultValue={category.parent_id ?? ''}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">— Catégorie principale —</option>
            {(parents ?? [])
              .filter((p: { id: string }) => p.id !== id)
              .map((p: { id: string; name: string }) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">URL de l'image</label>
          <input
            name="image_url"
            type="url"
            defaultValue={category.image_url ?? ''}
            placeholder="https://…"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Ordre d'affichage</label>
          <input
            name="sort_order"
            type="number"
            min={0}
            defaultValue={category.sort_order ?? 0}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Enregistrer
          </button>
          <Link
            href="/admin/categories"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Annuler
          </Link>
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="mb-1 text-sm font-semibold text-red-800">Zone dangereuse</p>
        <p className="mb-3 text-xs text-red-700">La suppression est irréversible. Déplacez d'abord les produits de cette catégorie.</p>
        <form action={deleteWithId}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-md border border-red-400 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer cette catégorie
          </button>
        </form>
      </div>
    </div>
  )
}
