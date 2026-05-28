/**
 * fetch-product-images.ts
 * ───────────────────────────────────────────────────────────────
 * Pour chaque produit sans images dans la base, cherche 2-3 images
 * de bonne qualité via Google Custom Search API et met à jour la DB
 * via l'API NestJS (PATCH /products/:id).
 *
 * Prérequis dans .env.local :
 *   GOOGLE_API_KEY=AIza...
 *   GOOGLE_CSE_ID=xxxxxxxxx:yyyyyy
 *   NEXT_PUBLIC_API_URL=http://localhost:3001
 *   ADMIN_API_TOKEN=<token JWT admin>
 *
 * Usage :
 *   npx tsx scripts/fetch-product-images.ts
 *   npx tsx scripts/fetch-product-images.ts --dry-run
 *   npx tsx scripts/fetch-product-images.ts --limit=50
 *   npx tsx scripts/fetch-product-images.ts --overwrite
 * ───────────────────────────────────────────────────────────────
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

// ── Config ─────────────────────────────────────────────────────

const API_URL        = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const ADMIN_TOKEN    = process.env.ADMIN_API_TOKEN
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CSE_ID  = process.env.GOOGLE_CSE_ID

const IMAGES_PER_PRODUCT = 3
const MIN_WIDTH          = 400
const DELAY_MS           = 500
const BATCH_SIZE         = 10

// ── Parse flags ────────────────────────────────────────────────

const args         = process.argv.slice(2)
const DRY_RUN      = args.includes('--dry-run')
const OVERWRITE    = args.includes('--overwrite')
const LIMIT        = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '100')
const BRAND_FILTER = args.find((a) => a.startsWith('--brand='))?.split('=')[1]

// ── Types ──────────────────────────────────────────────────────

interface ProductRow {
  id:     string
  name:   string
  brand:  string | null
  model:  string | null
  sku:    string | null
  images: string[]
}

interface GoogleImageResult {
  link:  string
  image: { width: number; thumbnailLink: string; contextLink: string }
  mime:  string
}

// ── API helpers ────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
  }
}

async function fetchProducts(): Promise<ProductRow[]> {
  const params = new URLSearchParams({ limit: String(LIMIT * 5), page: '1' })
  if (BRAND_FILTER) params.set('brand', BRAND_FILTER)

  const res = await fetch(`${API_URL}/products?${params}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`GET /products → ${res.status}`)

  const body = await res.json() as { data: ProductRow[] }
  return body.data ?? []
}

async function updateProductImages(id: string, images: string[]): Promise<void> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ images }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PATCH /products/${id} → ${res.status}: ${text}`)
  }
}

// ── Google Image Search ────────────────────────────────────────

async function searchImages(query: string): Promise<string[]> {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    throw new Error('GOOGLE_API_KEY et GOOGLE_CSE_ID sont requis dans .env.local')
  }

  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key', GOOGLE_API_KEY)
  url.searchParams.set('cx', GOOGLE_CSE_ID)
  url.searchParams.set('q', query)
  url.searchParams.set('searchType', 'image')
  url.searchParams.set('imgSize', 'large')
  url.searchParams.set('imgType', 'photo')
  url.searchParams.set('safe', 'active')
  url.searchParams.set('num', String(IMAGES_PER_PRODUCT))

  const res = await fetch(url.toString())
  if (!res.ok) {
    const body = await res.text()
    if (res.status === 429 || body.includes('rateLimitExceeded')) {
      throw new Error(`QUOTA_EXCEEDED: ${body}`)
    }
    throw new Error(`Google API ${res.status}: ${body}`)
  }

  const data = await res.json() as { items?: GoogleImageResult[] }
  if (!data.items || data.items.length === 0) return []

  return data.items
    .filter((item) =>
      item.link.startsWith('https') &&
      item.image.width >= MIN_WIDTH &&
      !item.mime.includes('svg') &&
      !item.link.endsWith('.gif')
    )
    .map((item) => item.link)
    .slice(0, 2)
}

function buildQuery(product: { name: string; brand: string | null; model: string | null }): string {
  const parts: string[] = []
  if (product.brand) parts.push(product.brand)
  if (product.model) parts.push(product.model)
  if (parts.length === 0) parts.push(product.name)
  return `${parts.join(' ')} product photo`
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function log(msg: string) {
  process.stdout.write(msg + '\n')
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  log('\nChanoa Tech — Fetch Product Images')
  log(`   Mode        : ${DRY_RUN ? 'DRY RUN (aucune ecriture)' : 'LIVE'}`)
  log(`   Limit       : ${LIMIT} produits`)
  log(`   Overwrite   : ${OVERWRITE ? 'oui' : 'non (skip si images deja presentes)'}`)
  if (BRAND_FILTER) log(`   Filtre marque: ${BRAND_FILTER}`)
  log('')

  if (!GOOGLE_API_KEY) { log('GOOGLE_API_KEY manquant dans .env.local'); process.exit(1) }
  if (!GOOGLE_CSE_ID)  { log('GOOGLE_CSE_ID manquant dans .env.local');  process.exit(1) }

  const allRows = await fetchProducts()

  const products = OVERWRITE
    ? allRows.slice(0, LIMIT)
    : allRows.filter((p) => !p.images || p.images.length === 0).slice(0, LIMIT)

  if (products.length === 0) {
    log('Tous les produits ont deja des images (ou aucun produit trouve).')
    process.exit(0)
  }

  log(`${products.length} produit(s) a traiter\n`)

  let success = 0
  let skipped = 0
  let errors  = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const query   = buildQuery(product)
    const prefix  = `[${String(i + 1).padStart(4, ' ')}/${products.length}]`

    try {
      const images = await searchImages(query)

      if (images.length === 0) {
        log(`${prefix} 0 image trouvee — ${query}`)
        skipped++
      } else {
        log(`${prefix} ${images.length} image(s) — ${product.brand ?? ''} ${product.model ?? product.name}`)
        if (DRY_RUN) {
          images.forEach((url) => log(`          -> ${url}`))
        } else {
          await updateProductImages(product.id, images)
          success++
        }
      }

      await sleep(DELAY_MS)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)

      if (msg.startsWith('QUOTA_EXCEEDED')) {
        log(`\nQuota Google depasse (100 req/jour en gratuit).`)
        log(`${success} produits traites avec succes.`)
        break
      }

      log(`${prefix} Erreur — ${msg}`)
      errors++
      await sleep(DELAY_MS * 2)
    }

    if ((i + 1) % BATCH_SIZE === 0) {
      log(`\n   Progression : ${i + 1}/${products.length} — ok: ${success}  skip: ${skipped}  err: ${errors}\n`)
    }
  }

  log(`\n${'─'.repeat(60)}`)
  log(`Resultat final`)
  log(`   Mis a jour  : ${success}`)
  log(`   Sans images : ${skipped}`)
  log(`   Erreurs     : ${errors}`)
  if (DRY_RUN) log('   Mode dry-run : aucune ecriture effectuee')
  log('')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
