import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { guardAdmin } from '@/lib/supabase/server'
import { createCategory } from '../actions'

export const metadata: Metadata = { title: 'Nouvelle catégorie — Admin' }

interface Props {
  searchParams: Promise<{ parent_id?: string; error?: string }>
}

export default async function NewCategoryPage({ searchParams }: Props) {
  const { parent_id, error } = await searchParams
  const supabase = await guardAdmin()

  const { data: parents } = await supabase
    .from('categories')
    .select('id, name')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/categories" className="rounded-md border p-1.5 hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Nouvelle catégorie</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createCategory} className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Nom <span className="text-destructive">*</span></label>
          <input
            name="name"
            required
            placeholder="Ex : Périphériques"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Slug</label>
          <input
            name="slug"
            placeholder="Généré automatiquement si vide"
            className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">Utilisé dans l'URL : /boutique?categorie=slug</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Catégorie parente</label>
          <select
            name="parent_id"
            defaultValue={parent_id ?? ''}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">— Catégorie principale —</option>
            {(parents ?? []).map((p: { id: string; name: string }) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">URL de l'image</label>
          <input
            name="image_url"
            type="url"
            placeholder="https://…"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Créer la catégorie
          </button>
          <Link
            href="/admin/categories"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
