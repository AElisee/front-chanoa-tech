'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CategoryDto } from '@/lib/api/categories'

export default function CategoryFilter({
  categories,
  current,
}: {
  categories: CategoryDto[]
  current?: string
}) {
  const searchParams = useSearchParams()

  const mainCats = categories.filter((c) => !c.parent_id)
  const subsByParent: Record<string, CategoryDto[]> = {}
  for (const sub of categories.filter((c) => c.parent_id)) {
    const pid = sub.parent_id!
    if (!subsByParent[pid]) subsByParent[pid] = []
    subsByParent[pid].push(sub)
  }

  const currentCat = categories.find((c) => c.slug === current)
  const defaultOpen = currentCat?.parent_id
    ? currentCat.parent_id
    : currentCat && subsByParent[currentCat.id]
      ? currentCat.id
      : null

  const [openId, setOpenId] = useState<string | null>(defaultOpen)

  // <a> au lieu de <Link> : force un rechargement serveur complet,
  // contourne le Router Cache client de Next.js (30s TTL).
  function buildHref(slug?: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('categorie', slug)
    } else {
      params.delete('categorie')
    }
    params.delete('page')
    params.delete('marque')
    return `/boutique?${params}`
  }

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  const totalProducts = mainCats.reduce((sum, c) => {
    const subs = subsByParent[c.id] ?? []
    return sum + (c.product_count ?? 0) + subs.reduce((s, sub) => s + (sub.product_count ?? 0), 0)
  }, 0)

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Catégories
      </h2>
      <ul className="space-y-0.5">
        <li>
          <a
            href={buildHref()}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
              !current ? 'bg-primary/10 font-medium text-primary' : 'text-foreground'
            }`}
          >
            <span>Toutes les catégories</span>
            {totalProducts > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {totalProducts}
              </span>
            )}
          </a>
        </li>

        {mainCats.map((cat) => {
          const subs = subsByParent[cat.id] ?? []
          const hasSubs = subs.length > 0
          const isOpen = openId === cat.id
          const isCurrentOrParent =
            current === cat.slug || subs.some((s) => s.slug === current)

          return (
            <li key={cat.id}>
              {hasSubs ? (
                <>
                  <div
                    className={`flex items-center rounded-md transition-colors ${
                      isCurrentOrParent ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                  >
                    <a
                      href={buildHref(cat.slug)}
                      className={`flex flex-1 items-center justify-between px-3 py-2 text-sm ${
                        isCurrentOrParent ? 'font-medium text-primary' : 'text-foreground'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {(cat.product_count ?? 0) > 0 && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {cat.product_count}
                        </span>
                      )}
                    </a>
                    <button
                      onClick={() => toggle(cat.id)}
                      className="px-2 py-2 text-muted-foreground hover:text-foreground"
                      aria-label={isOpen ? 'Fermer' : 'Ouvrir'}
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {isOpen && (
                    <ul className="ml-3 mt-0.5 space-y-0.5 border-l pl-3">
                      {subs.map((sub) => (
                        <li key={sub.id}>
                          <a
                            href={buildHref(sub.slug)}
                            className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
                              current === sub.slug
                                ? 'font-medium text-primary'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <span>{sub.name}</span>
                            {(sub.product_count ?? 0) > 0 && (
                              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {sub.product_count}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <a
                  href={buildHref(cat.slug)}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
                    current === cat.slug
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-foreground'
                  }`}
                >
                  <span>{cat.name}</span>
                  {(cat.product_count ?? 0) > 0 && (
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {cat.product_count}
                    </span>
                  )}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
