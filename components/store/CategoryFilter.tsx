'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

export default function CategoryFilter({
  categories,
  current,
}: {
  categories: Category[]
  current?: string
}) {
  const searchParams = useSearchParams()

  function buildHref(slug?: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('categorie', slug)
    } else {
      params.delete('categorie')
    }
    params.delete('page')
    return `?${params}`
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Catégories
      </h2>
      <ul className="space-y-1">
        <li>
          <Link
            href={buildHref()}
            className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
              !current ? 'bg-primary/10 font-medium text-primary' : 'text-foreground'
            }`}
          >
            Toutes les catégories
          </Link>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              href={buildHref(cat.slug)}
              className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
                current === cat.slug
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-foreground'
              }`}
            >
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
