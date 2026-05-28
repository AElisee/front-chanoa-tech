/**
 * scripts/import-products.ts
 *
 * Bulk product importer — supports both Excel (.xlsx) and CSV files.
 * Uses Admin JWT token — run locally only, never in production.
 * Upserts on slug → idempotent, safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/import-products.ts --file produits.csv
 *   npx tsx scripts/import-products.ts --file catalogue.xlsx --dry-run
 *   npx tsx scripts/import-products.ts --file produits.csv --limit=50
 *   npx tsx scripts/import-products.ts --file produits.csv --brand=Dell
 *   npx tsx scripts/import-products.ts --file produits.csv --overwrite
 *
 * Variables requises dans .env.local :
 *   NEXT_PUBLIC_API_URL=http://localhost:3001
 *   ADMIN_API_TOKEN=<token JWT admin>
 *
 * Excel columns: ID, SKU, Product Name, Category, Subcategory, Brand, Model,
 *               Description, Price EUR, Stock, Status,
 *               Variant Options (JSON), Variant SKU
 *
 * CSV columns (header required):
 *   name,description,price,compare_price,stock,category_slug,brand,model,sku,image_url,
 *   variant_options,variant_sku
 *
 * Currency: XLSX prices stored as FCFA (Price EUR × 655.957) + price_eur kept as reference
 *           CSV prices already in FCFA
 */

import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// ─── Constants ───────────────────────────────────────────────────────────────

const EUR_TO_FCFA = 655.957

// ─── API client ──────────────────────────────────────────────────────────────

const API_URL     = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN

if (!API_URL) {
  console.error('\n❌ NEXT_PUBLIC_API_URL manquant dans .env.local\n')
  process.exit(1)
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExcelRow {
  'ID'?:               number
  'SKU'?:              string
  'Product Name'?:     string
  'Category'?:         string
  'Subcategory'?:      string
  'Brand'?:            string
  'Model'?:            string
  'Description'?:      string
  'Price EUR'?:        number
  'Stock'?:            number
  'Status'?:           string
  'Variant Options'?:  string
  'Variant SKU'?:      string
  [key: string]:       unknown
}

interface ParsedVariant {
  sku:       string | null
  options:   Record<string, string>
  price:     number
  price_eur: number | null
  stock:     number
}

interface ParsedProduct {
  rowIndex:        number
  sku:             string
  name:            string
  brand:           string | null
  model:           string | null
  categoryName:    string | null
  subcategoryName: string | null
  description:     string | null
  price_eur:       number
  price:           number
  stock:           number
  status:          string
  is_active:       boolean
  variants:        ParsedVariant[]
}

interface ImportResult {
  success: number
  skipped: number
  errors:  Array<{ row: number; name: string; error: string }>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function eurToFcfa(eur: number): number {
  return Math.round(eur * EUR_TO_FCFA)
}

// ─── Category cache ───────────────────────────────────────────────────────────

const categoryCache = new Map<string, string>()

async function getCategoryId(name: string, parentId?: string): Promise<string | null> {
  const cacheKey = parentId ? `${parentId}::${name}` : name
  if (categoryCache.has(cacheKey)) return categoryCache.get(cacheKey)!

  const slug = slugify(name)

  // Chercher par slug
  const searchRes = await fetch(`${API_URL}/categories?slug=${encodeURIComponent(slug)}`, {
    headers: authHeaders(),
  })
  if (searchRes.ok) {
    const body = await searchRes.json() as { data: Array<{ id: string; slug: string }> }
    const found = body.data?.find((c) => c.slug === slug)
    if (found) {
      categoryCache.set(cacheKey, found.id)
      return found.id
    }
  }

  // Créer si inexistante
  const createRes = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, slug, is_active: true, sort_order: 0, parent_id: parentId ?? null }),
  })

  if (!createRes.ok) {
    console.warn(`   ⚠️  Catégorie "${name}" introuvable et non créée`)
    return null
  }

  const created = await createRes.json() as { id: string }
  console.log(`   ✅ Catégorie créée : "${name}"`)
  categoryCache.set(cacheKey, created.id)
  return created.id
}

// ─── Slug uniqueness ──────────────────────────────────────────────────────────

const usedSlugs = new Set<string>()

async function uniqueSlug(name: string, sku: string): Promise<string> {
  const base = slugify(name)
  let candidate = base
  let attempt = 0

  while (true) {
    if (!usedSlugs.has(candidate)) {
      const res = await fetch(`${API_URL}/products?slug=${encodeURIComponent(candidate)}`, {
        headers: authHeaders(),
      })
      if (res.ok) {
        const body = await res.json() as { data: unknown[] }
        if (!body.data || body.data.length === 0) {
          usedSlugs.add(candidate)
          return candidate
        }
      } else {
        // En cas d'erreur API, on utilise le candidat quand même
        usedSlugs.add(candidate)
        return candidate
      }
    }
    attempt++
    candidate = attempt === 1 ? `${base}-${slugify(sku)}` : `${base}-${attempt}`
  }
}

// ─── Parse Excel ─────────────────────────────────────────────────────────────

function parseExcel(filePath: string): ParsedProduct[] {
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: null })

  console.log(`\n📄 Feuille : "${sheetName}" — ${rows.length} ligne(s)`)

  const products: ParsedProduct[] = []
  const parseErrors: string[] = []

  rows.forEach((row, i) => {
    const rowNum = i + 2
    const name     = row['Product Name']?.trim()
    const priceEur = row['Price EUR']
    const sku      = row['SKU']?.trim()

    if (!name) { parseErrors.push(`Ligne ${rowNum}: "Product Name" manquant`); return }
    if (priceEur == null || isNaN(priceEur) || priceEur < 0) {
      parseErrors.push(`Ligne ${rowNum}: "Price EUR" invalide (${priceEur})`); return
    }

    const statusRaw = (row['Status'] ?? 'Active').toString().toLowerCase()
    const is_active = ['active', 'actif', '1', 'true'].includes(statusRaw)

    const variantOptions = parseVariantOptions(row['Variant Options'] as string | null)
    const variantSku     = (row['Variant SKU'] as string | null)?.trim() || null
    const variantRow: ParsedVariant | null = variantOptions ? {
      sku:       variantSku,
      options:   variantOptions,
      price:     eurToFcfa(priceEur),
      price_eur: Math.round(priceEur * 100) / 100,
      stock:     typeof row['Stock'] === 'number' ? Math.max(0, row['Stock']) : 0,
    } : null

    const groupKey = `${name}||${row['Brand']?.trim() ?? ''}||${row['Model']?.trim() ?? ''}`
    const existing = products.find(p => `${p.name}||${p.brand ?? ''}||${p.model ?? ''}` === groupKey)

    if (existing && variantRow) {
      existing.variants.push(variantRow)
    } else {
      products.push({
        rowIndex:        rowNum,
        sku:             sku || `CHT-${String(rowNum).padStart(5, '0')}`,
        name,
        brand:           row['Brand']?.trim() || null,
        model:           row['Model']?.trim() || null,
        categoryName:    row['Category']?.trim() || null,
        subcategoryName: row['Subcategory']?.trim() || null,
        description:     row['Description']?.trim() || null,
        price_eur:       Math.round(priceEur * 100) / 100,
        price:           eurToFcfa(priceEur),
        stock:           typeof row['Stock'] === 'number' ? Math.max(0, row['Stock']) : 0,
        status:          is_active ? 'active' : 'inactive',
        is_active,
        variants:        variantRow ? [variantRow] : [],
      })
    }
  })

  if (parseErrors.length > 0) {
    console.warn(`\n⚠️  ${parseErrors.length} ligne(s) ignorée(s) :`)
    parseErrors.slice(0, 10).forEach(e => console.warn(`   ${e}`))
    if (parseErrors.length > 10) console.warn(`   ... et ${parseErrors.length - 10} autres`)
  }

  return products
}

function parseVariantOptions(raw: string | null | undefined): Record<string, string> | null {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw.trim())
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, string>
    }
  } catch { /* not valid JSON */ }
  return null
}

// ─── Upsert variants ──────────────────────────────────────────────────────────

async function upsertVariants(productId: string, variants: ParsedVariant[]): Promise<void> {
  if (variants.length === 0) return
  for (const v of variants) {
    await fetch(`${API_URL}/products/${productId}/variants`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        sku:       v.sku,
        options:   v.options,
        price:     v.price,
        price_eur: v.price_eur,
        stock:     v.stock,
        is_active: true,
      }),
    })
  }
}

// ─── Import ───────────────────────────────────────────────────────────────────

async function importProducts(products: ParsedProduct[], dryRun: boolean): Promise<ImportResult> {
  const result: ImportResult = { success: 0, skipped: 0, errors: [] }
  const total = products.length

  for (let i = 0; i < products.length; i++) {
    const p        = products[i]
    const progress = `[${i + 1}/${total}]`

    let category_id: string | null = null
    let subcategory_id: string | null = null

    if (p.categoryName)                        category_id    = await getCategoryId(p.categoryName)
    if (p.subcategoryName && category_id)      subcategory_id = await getCategoryId(p.subcategoryName, category_id)

    const final_category_id = subcategory_id ?? category_id

    const slug = dryRun
      ? slugify(p.name) + '-dry'
      : await uniqueSlug(p.name, p.sku)

    const effectivePrice = p.variants.length > 0 ? Math.min(...p.variants.map(v => v.price)) : p.price
    const effectiveStock = p.variants.length > 0 ? 0 : p.stock

    const payload = {
      sku:         p.sku,
      name:        p.name,
      slug,
      brand:       p.brand,
      model:       p.model,
      description: p.description,
      price:       effectivePrice,
      price_eur:   p.price_eur,
      stock:       effectiveStock,
      category_id: final_category_id,
      status:      p.status,
      is_active:   p.is_active,
      images:      [],
    }

    if (dryRun) {
      if (i < 5 || i === total - 1) {
        const variantInfo = p.variants.length > 0 ? ` (${p.variants.length} variantes)` : ''
        console.log(
          `  ${progress} DRY "${p.name}"${variantInfo} | ` +
          `${effectivePrice.toLocaleString()} FCFA | ` +
          `stock: ${effectiveStock} | cat: ${p.categoryName}`
        )
      } else if (i === 5) {
        console.log(`  ... (${total - 6} autres lignes)`)
      }
      result.success++
      continue
    }

    // Upsert via POST /products (l'API NestJS gère le conflit sur slug)
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      process.stdout.write(`  ${progress} ❌ "${p.name}": ${text}\n`)
      result.errors.push({ row: p.rowIndex, name: p.name, error: text })
      continue
    }

    const upserted = await res.json() as { id: string }

    if (p.variants.length > 0) {
      await upsertVariants(upserted.id, p.variants)
    }

    if ((i + 1) % 250 === 0) {
      process.stdout.write(`\n  ✅ ${i + 1}/${total} produits importés\n`)
    } else if ((i + 1) % 50 === 0) {
      process.stdout.write('.')
    }
    result.success++
  }

  return result
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean)
  if (lines.length < 2) return []

  function splitLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim()); current = ''
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((line) => {
    const values = splitLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim() })
    return row
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args       = process.argv.slice(2)
  const flag       = (name: string) => args.find(a => a.startsWith(`--${name}`))?.split('=')[1] ?? null
  const hasFlag    = (name: string) => args.some(a => a === `--${name}`)

  const dryRun      = hasFlag('dry-run')
  const brandFilter = flag('brand')
  const limitArg    = flag('limit')
  const limit       = limitArg ? parseInt(limitArg, 10) : Infinity
  const placeholder = flag('image-placeholder')
  const filePath    = flag('file') ?? args.find(a => !a.startsWith('--'))

  if (!filePath) {
    console.error('\nUsage: npx tsx scripts/import-products.ts --file produits.csv [--dry-run] [--limit=N]\n')
    process.exit(1)
  }

  const resolved = path.resolve(filePath)
  if (!fs.existsSync(resolved)) {
    console.error(`\n❌ Fichier introuvable : ${resolved}\n`)
    process.exit(1)
  }

  console.log('\n🚀 Chanoa Tech — Import catalogue produits')
  console.log(`   Fichier  : ${path.basename(resolved)}`)
  console.log(`   Mode     : ${dryRun ? '🔍 DRY-RUN (aucune écriture)' : '✏️  RÉEL (écriture en base)'}`)
  if (brandFilter) console.log(`   Filtre   : brand = "${brandFilter}"`)
  console.log(`   Limite   : ${isFinite(limit) ? limit : 'aucune'}`)
  if (placeholder) console.log(`   Placeholder : ${placeholder}`)
  console.log(`   Taux     : 1 EUR = ${EUR_TO_FCFA} FCFA\n`)

  const ext = path.extname(resolved).toLowerCase()
  let products: ParsedProduct[]

  if (ext === '.csv') {
    const raw  = fs.readFileSync(resolved, 'utf-8')
    const rows = parseCsv(raw)
    console.log(`📄 CSV — ${rows.length} lignes lues`)

    // Charger les catégories pour le mapping slug→id
    const catRes = await fetch(`${API_URL}/categories?limit=500`, { headers: authHeaders() })
    const catBody = catRes.ok ? await catRes.json() as { data: Array<{ id: string; slug: string }> } : { data: [] }
    const catMap = new Map<string, string>((catBody.data ?? []).map((c) => [c.slug, c.id]))

    products = rows
      .filter((r) => r.name?.trim())
      .map((row, i) => {
        const price          = parseFloat(row.price?.replace(/\s/g, '') ?? '0')
        const imageUrl       = row.image_url?.trim() || (placeholder ?? null)
        const variantOptions = parseVariantOptions(row.variant_options)
        const variantRow: ParsedVariant | null = variantOptions ? {
          sku:       row.variant_sku?.trim() || null,
          options:   variantOptions,
          price:     isNaN(price) ? 0 : price,
          price_eur: null,
          stock:     parseInt(row.stock ?? '0', 10) || 0,
        } : null

        return {
          rowIndex:        i + 2,
          sku:             row.sku?.trim() || `CHT-CSV-${String(i + 1).padStart(5, '0')}`,
          name:            row.name.trim(),
          brand:           row.brand?.trim() || null,
          model:           row.model?.trim() || null,
          categoryName:    row.category_slug ? (catMap.get(row.category_slug) ? row.category_slug : null) : null,
          subcategoryName: null,
          description:     row.description?.trim() || null,
          price_eur:       null as unknown as number,
          price:           isNaN(price) ? 0 : price,
          stock:           parseInt(row.stock ?? '0', 10) || 0,
          status:          'active',
          is_active:       true,
          variants:        variantRow ? [variantRow] : [],
          _imageUrl:       imageUrl,
          _catId:          row.category_slug ? catMap.get(row.category_slug) ?? null : null,
        }
      })
      .filter((p) => p.price > 0)
      .reduce((acc: ParsedProduct[], cur) => {
        const groupKey = `${cur.name}||${cur.brand ?? ''}||${cur.model ?? ''}`
        const existing = acc.find(p => `${p.name}||${p.brand ?? ''}||${p.model ?? ''}` === groupKey)
        const variant  = (cur as unknown as { variants: ParsedVariant[] }).variants[0]
        if (existing && variant) {
          existing.variants.push(variant)
        } else {
          acc.push(cur as unknown as ParsedProduct)
        }
        return acc
      }, []) as ParsedProduct[]
  } else {
    products = parseExcel(resolved)
  }

  if (brandFilter) {
    products = products.filter((p) => p.brand?.toLowerCase() === brandFilter.toLowerCase())
    console.log(`   → ${products.length} après filtre brand="${brandFilter}"`)
  }

  if (isFinite(limit)) {
    products = products.slice(0, limit)
    console.log(`   (limité à ${limit} produits pour ce run)\n`)
  }

  if (products.length === 0) {
    console.error('❌ Aucun produit valide à importer.\n')
    process.exit(1)
  }

  console.log(`📦 ${products.length} produit(s) à traiter\n`)

  const started = Date.now()
  const result  = await importProducts(products, dryRun)
  const elapsed = ((Date.now() - started) / 1000).toFixed(1)

  console.log('\n\n─────────────────────────────────────────')
  console.log(`✅ Importés  : ${result.success}`)
  console.log(`⏭️  Ignorés   : ${result.skipped}`)
  console.log(`❌ Erreurs   : ${result.errors.length}`)
  console.log(`⏱️  Durée     : ${elapsed}s`)

  if (result.errors.length > 0) {
    console.log('\nDétail des erreurs :')
    result.errors.slice(0, 20).forEach(e =>
      console.log(`   Ligne ${e.row} "${e.name}" → ${e.error}`)
    )
  }

  if (dryRun) console.log('\n💡 Dry-run OK. Relancez sans --dry-run pour importer.')
  console.log('')
}

main().catch(err => {
  console.error('\n❌ Erreur fatale :', err.message)
  process.exit(1)
})
