import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function getPages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const delta = 2
  const range: number[] = []
  for (
    let i = Math.max(1, current - delta);
    i <= Math.min(total, current + delta);
    i++
  ) {
    range.push(i)
  }

  const result: (number | 'ellipsis')[] = []

  if (!range.includes(1)) {
    result.push(1)
    if (range[0] > 2) result.push('ellipsis')
  }

  result.push(...range)

  if (!range.includes(total)) {
    if (range[range.length - 1] < total - 1) result.push('ellipsis')
    result.push(total)
  }

  return result
}

interface Props {
  currentPage: number
  totalPages: number
  // Paramètres URL à conserver (ex: { q: 'search', categorie: 'ecrans' })
  searchParams?: Record<string, string | undefined>
  // Chemin de base — si non fourni, utilise "?" (relatif)
  basePath?: string
}

function buildHref(
  page: number,
  basePath: string,
  searchParams: Record<string, string | undefined>,
) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (v !== undefined && v !== '') params.set(k, v)
  }
  params.set('page', String(page))
  return `${basePath}?${params}`
}

export default function Pagination({
  currentPage,
  totalPages,
  searchParams = {},
  basePath = '',
}: Props) {
  if (totalPages <= 1) return null

  const pages = getPages(currentPage, totalPages)
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      {/* Précédent */}
      {hasPrev ? (
        <a
          href={buildHref(currentPage - 1, basePath, searchParams)}
          className="flex h-9 items-center gap-1 rounded-md border bg-white px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </a>
      ) : (
        <span className="flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium text-muted-foreground opacity-40 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </span>
      )}

      {/* Numéros de pages */}
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <a
            key={p}
            href={buildHref(p, basePath, searchParams)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors',
              p === currentPage
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'bg-white text-foreground shadow-sm hover:bg-muted',
            )}
          >
            {p}
          </a>
        ),
      )}

      {/* Suivant */}
      {hasNext ? (
        <a
          href={buildHref(currentPage + 1, basePath, searchParams)}
          className="flex h-9 items-center gap-1 rounded-md border bg-white px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </a>
      ) : (
        <span className="flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium text-muted-foreground opacity-40 cursor-not-allowed">
          Suivant
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
