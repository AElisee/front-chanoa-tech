/**
 * fetch-product-images.ts
 * ───────────────────────────────────────────────────────────────
 * Pour chaque produit sans images dans Supabase, cherche 2-3 images
 * de bonne qualité via Google Custom Search API et met à jour la DB.
 *
 * Prérequis dans .env.local :
 *   GOOGLE_API_KEY=AIza...          (Google Cloud Console → Custom Search API)
 *   GOOGLE_CSE_ID=xxxxxxxxx:yyyyyy  (programmablesearchengine.google.com)
 *
 * Usage :
 *   node --env-file=.env.local ./node_modules/.bin/tsx scripts/fetch-product-images.ts
 *   node --env-file=.env.local ./node_modules/.bin/tsx scripts/fetch-product-images.ts --dry-run
 *   node --env-file=.env.local ./node_modules/.bin/tsx scripts/fetch-product-images.ts --limit=50
 *   node --env-file=.env.local ./node_modules/.bin/tsx scripts/fetch-product-images.ts --overwrite
 *
 * Flags :
 *   --dry-run       Affiche ce qui serait fait sans écrire dans la DB
 *   --limit=N       Traite au maximum N produits (défaut : 100)
 *   --overwrite     Réécrit même les produits qui ont déjà des images
 *   --brand=BRAND   Filtre sur une marque spécifique (ex: --brand=Dell)
 * ───────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase/types'

// ── Config ─────────────────────────────────────────────────────

const SUPABASE_URL       = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GOOGLE_API_KEY     = process.env.GOOGLE_API_KEY
const GOOGLE_CSE_ID      = process.env.GOOGLE_CSE_ID

const IMAGES_PER_PRODUCT = 3   // on demande 3, on garde les 2+ qui passent le filtre
const MIN_WIDTH          = 400 // px minimum (filtré par Google imgSize)
const DELAY_MS           = 500 // pause entre chaque requête Google (évite 429)
const BATCH_SIZE         = 10  // log de progression tous les N produits

// ── Parse flags ────────────────────────────────────────────────

const args = process.argv.slice(2)
const DRY_RUN   = args.includes('--dry-run')
const OVERWRITE = args.includes('--overwrite')
const LIMIT     = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '100')
const BRAND_FILTER = args.find((a) => a.startsWith('--brand='))?.split('=')[1]

// ── Supabase client ────────────────────────────────────────────

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Google Image Search ────────────────────────────────────────

interface GoogleImageResult {
  link: string
  image: {
    width: number
    height: number
    thumbnailLink: string
    contextLink: string
  }
  mime: string
}

async function searchImages(query: string): Promise<string[]> {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    throw new Error('GOOGLE_API_KEY et GOOGLE_CSE_ID sont requis dans .env.local')
  }

  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key', GOOGLE_API_KEY)
  url.searchParams.set('cx', GOOGLE_CSE_ID)
  url.searchParams.set('q', query)
  url.searchParams.set('searchType', 'image')
  url.searchParams.set('imgSize', 'large')          // au moins ~500px
  url.searchParams.set('imgType', 'photo')          // photos, pas clipart
  url.searchParams.set('safe', 'active')
  url.searchParams.set('num', String(IMAGES_PER_PRODUCT))

  const res = await fetch(url.toString())

  if (!res.ok) {
    const body = await res.text()
    // Quota dépassé → on arrête proprement
    if (res.status === 429 || body.includes('rateLimitExceeded')) {
      throw new Error(`QUOTA_EXCEEDED: ${body}`)
    }
    throw new Error(`Google API ${res.status}: ${body}`)
  }

  const data = await res.json() as { items?: GoogleImageResult[] }

  if (!data.items || data.items.length === 0) return []

  return data.items
    .filter((item) => {
      // Garder uniquement HTTPS, images assez grandes, pas de SVG/GIF
      return (
        item.link.startsWith('https') &&
        item.image.width >= MIN_WIDTH &&
        !item.mime.includes('svg') &&
        !item.link.endsWith('.gif')
      )
    })
    .map((item) => item.link)
    .slice(0, 2)  // max 2 images finales
}

// ── Build search query ─────────────────────────────────────────

function buildQuery(product: {
  name: string
  brand: string | null
  model: string | null
}): string {
  // Priorité : brand + model si disponibles, sinon name seul
  const parts: string[] = []
  if (product.brand) parts.push(product.brand)
  if (product.model) parts.push(product.model)
  if (parts.length === 0) parts.push(product.name)

  // Ajouter "product photo white background" pour meilleure qualité
  return `${parts.join(' ')} product photo`
}

// ── Sleep helper ───────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ── Progress logger ────────────────────────────────────────────

function log(msg: string) {
  process.stdout.write(msg + '\n')
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  log(`\n🔍 Chanoa Tech — Fetch Product Images`)
  log(`   Mode        : ${DRY_RUN ? '🔸 DRY RUN (aucune écriture)' : '🟢 LIVE'}`)
  log(`   Limit       : ${LIMIT} produits`)
  log(`   Overwrite   : ${OVERWRITE ? 'oui' : 'non (skip si images déjà présentes)'}`)
  if (BRAND_FILTER) log(`   Filtre marque: ${BRAND_FILTER}`)
  log('')

  if (!GOOGLE_API_KEY) {
    log('❌ GOOGLE_API_KEY manquant dans .env.local')
    log('   → Créer une clé sur https://console.cloud.google.com')
    log('   → Activer "Custom Search API"')
    process.exit(1)
  }
  if (!GOOGLE_CSE_ID) {
    log('❌ GOOGLE_CSE_ID manquant dans .env.local')
    log('   → Créer un moteur sur https://programmablesearchengine.google.com')
    process.exit(1)
  }

  // ── Charger les produits ─────────────────────────────────────
  type ProductRow = {
    id: string
    name: string
    brand: string | null
    model: string | null
    sku: string | null
    images: string[]
  }

  // Fetch up to LIMIT*5 to have enough after in-memory filtering
  let dbQuery = supabase
    .from('products')
    .select('id, name, brand, model, sku, images')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(OVERWRITE ? LIMIT : LIMIT * 5)

  if (BRAND_FILTER) {
    dbQuery = dbQuery.ilike('brand', BRAND_FILTER) as typeof dbQuery
  }

  const { data: allProducts, error } = await dbQuery
  const rows = (allProducts ?? []) as unknown as ProductRow[]

  // Filter out products that already have images (unless --overwrite)
  const products = OVERWRITE
    ? rows.slice(0, LIMIT)
    : rows
        .filter((p) => !p.images || p.images.length === 0)
        .slice(0, LIMIT)

  if (error) {
    log(`❌ Erreur Supabase : ${error.message}`)
    process.exit(1)
  }

  if (!products || products.length === 0) {
    log('✅ Tous les produits ont déjà des images (ou aucun produit trouvé).')
    log('   Utilise --overwrite pour forcer la mise à jour.')
    process.exit(0)
  }

  log(`📦 ${products.length} produit(s) à traiter\n`)

  // ── Traitement produit par produit ───────────────────────────
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
        log(`${prefix} ⚠️  0 image trouvée — ${query}`)
        skipped++
      } else {
        log(`${prefix} ✅ ${images.length} image(s) — ${product.brand ?? ''} ${product.model ?? product.name}`)
        if (DRY_RUN) {
          images.forEach((url) => log(`          → ${url}`))
        } else {
          // Cast to any — script context, types from generated client can conflict
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sb = supabase as any
          const { error: updateErr } = await sb
            .from('products')
            .update({ images, updated_at: new Date().toISOString() })
            .eq('id', product.id)

          if (updateErr) {
            log(`          ❌ Erreur update: ${updateErr.message}`)
            errors++
          } else {
            success++
          }
        }
      }

      // Pause pour respecter les rate limits Google
      await sleep(DELAY_MS)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)

      if (msg.startsWith('QUOTA_EXCEEDED')) {
        log(`\n🛑 Quota Google dépassé (100 req/jour en gratuit).`)
        log(`   ${success} produits traités avec succès.`)
        log(`   Relance le script demain ou active la facturation Google Cloud.`)
        break
      }

      log(`${prefix} ❌ Erreur — ${msg}`)
      errors++
      await sleep(DELAY_MS * 2)
    }

    // Log de progression tous les BATCH_SIZE produits
    if ((i + 1) % BATCH_SIZE === 0) {
      log(`\n   ── Progression : ${i + 1}/${products.length} — ✅ ${success}  ⚠️  ${skipped}  ❌ ${errors}\n`)
    }
  }

  log(`\n${'─'.repeat(60)}`)
  log(`📊 Résultat final`)
  log(`   ✅ Mis à jour  : ${success}`)
  log(`   ⚠️  Sans images : ${skipped}`)
  log(`   ❌ Erreurs     : ${errors}`)
  if (DRY_RUN) log(`   ℹ️  Mode dry-run : aucune écriture effectuée`)
  log('')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
