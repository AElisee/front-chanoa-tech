/**
 * scripts/import-products.ts
 *
 * Import en masse depuis Excel (.xlsx) ou CSV vers l'API Chanoa Tech.
 * Utilise un token JWT admin — à exécuter en local uniquement.
 * Idempotent : vérification par slug avant création, safe à relancer.
 *
 * Usage :
 *   npx tsx scripts/import-products.ts --file chanoa_tech_catalogue_2000_produits.xlsx
 *   npx tsx scripts/import-products.ts --file catalogue.xlsx --dry-run
 *   npx tsx scripts/import-products.ts --file catalogue.xlsx --limit=50
 *   npx tsx scripts/import-products.ts --file catalogue.xlsx --brand=Dell
 *   npx tsx scripts/import-products.ts --file catalogue.xlsx --overwrite
 *
 * Variables d'environnement (.env.local ou shell) :
 *   NEXT_PUBLIC_API_URL=http://localhost:3000   (URL backend)
 *   ADMIN_API_TOKEN=eyJ...                      (token JWT admin)
 *   -- OU pour login automatique --
 *   ADMIN_EMAIL=admin@chanoa-tech.com
 *   ADMIN_PASSWORD=Admin@123456
 *
 * Colonnes Excel :
 *   ID, SKU, Product Name, Category, Subcategory, Brand, Model,
 *   Description, Price EUR, Stock, Status, Variant Options (JSON), Variant SKU
 *
 * Colonnes CSV :
 *   name, description, price, compare_price, stock, category_slug,
 *   brand, model, sku, variant_options, variant_sku
 */

import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs   from 'fs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// ─── Constantes ──────────────────────────────────────────────────────────────

const EUR_TO_FCFA = 655.957

// ─── Config API ──────────────────────────────────────────────────────────────

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
let   ADMIN_TOKEN: string | undefined = process.env.ADMIN_API_TOKEN

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExcelRow {
  'ID'?:              number
  'SKU'?:             string
  'Product Name'?:    string
  'Category'?:        string
  'Subcategory'?:     string
  'Brand'?:           string
  'Model'?:           string
  'Description'?:     string
  'Price EUR'?:       number
  'Stock'?:           number
  'Status'?:          string
  'Variant Options'?: string
  'Variant SKU'?:     string
  [key: string]:      unknown
}

interface ParsedVariant {
  sku:       string | null
  options:   Record<string, string>
  price:     number
  price_eur: number
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
  status:          'active' | 'archived' | 'draft'
  is_active:       boolean
  variants:        ParsedVariant[]
}

interface ImportResult {
  success:  number
  skipped:  number
  errors:   Array<{ row: number; name: string; error: string }>
  catCreated: number
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

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
  }
}

function mapStatus(raw: string | undefined | null): 'active' | 'archived' | 'draft' {
  const s = (raw ?? 'active').toString().toLowerCase().trim()
  if (['inactive', 'inactif', 'archived', 'archive', 'archivé'].includes(s)) return 'archived'
  if (['draft', 'brouillon'].includes(s)) return 'draft'
  return 'active'
}

// ─── Login automatique ───────────────────────────────────────────────────────

async function autoLogin(): Promise<void> {
  if (ADMIN_TOKEN) return

  const email    = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('\n❌ Token absent et ADMIN_EMAIL/ADMIN_PASSWORD non fournis.\n')
    console.error('   Ajoutez dans .env.local :')
    console.error('   ADMIN_API_TOKEN=eyJ...')
    console.error('   -- ou --')
    console.error('   ADMIN_EMAIL=admin@chanoa-tech.com')
    console.error('   ADMIN_PASSWORD=votre_mot_de_passe\n')
    process.exit(1)
  }

  process.stdout.write('🔐 Connexion admin... ')
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    console.error(`\n❌ Login échoué (${res.status}) — vérifiez les credentials\n`)
    process.exit(1)
  }

  const body = await res.json() as { access_token: string }
  ADMIN_TOKEN = body.access_token
  console.log('✅')
}

// ─── Cache catégories ────────────────────────────────────────────────────────

// slug → id
const categoryCache = new Map<string, string>()
let   catCacheLoaded = false
let   catCreatedCount = 0

async function loadCategoryCache(): Promise<void> {
  if (catCacheLoaded) return

  const res = await fetch(`${API_URL}/categorie?limit=500`, { headers: authHeaders() })
  if (!res.ok) {
    console.warn('⚠️  Impossible de charger les catégories existantes')
    catCacheLoaded = true
    return
  }

  const body = await res.json() as {
    data: Array<{ id: string; slug: string; name: string; parent?: { id: string } | null }>
  }
  for (const cat of body.data ?? []) {
    // Indexer par slug simple (catégories parentes)
    categoryCache.set(cat.slug, cat.id)
    // Indexer aussi par parentId::slug pour retrouver les sous-catégories
    if (cat.parent?.id) {
      categoryCache.set(`${cat.parent.id}::${cat.slug}`, cat.id)
    }
  }
  catCacheLoaded = true
}

async function getCategoryId(
  name: string,
  parentId?: string | null,
): Promise<string | null> {
  await loadCategoryCache()

  const slug     = slugify(name)
  const cacheKey = parentId ? `${parentId}::${slug}` : slug

  if (categoryCache.has(cacheKey)) return categoryCache.get(cacheKey)!
  if (!parentId && categoryCache.has(slug)) return categoryCache.get(slug)!

  // Créer la catégorie
  const res = await fetch(`${API_URL}/categorie`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name,
      slug,
      is_active:  true,
      sort_order: 0,
      parentId:   parentId ?? undefined,  // camelCase — DTO backend
    }),
  })

  // 409 = déjà existante → chercher l'existante par slug
  if (res.status === 409) {
    const searchRes = await fetch(`${API_URL}/categorie?limit=500`, { headers: authHeaders() })
    if (searchRes.ok) {
      const body = await searchRes.json() as {
        data: Array<{ id: string; slug: string; parent?: { id: string } | null }>
      }
      const found = (body.data ?? []).find((c) => {
        if (c.slug !== slug) return false
        if (parentId) return c.parent?.id === parentId
        return !c.parent
      }) ?? (body.data ?? []).find((c) => c.slug === slug)  // fallback sans filtre parent

      if (found) {
        categoryCache.set(cacheKey, found.id)
        if (!parentId) categoryCache.set(slug, found.id)
        return found.id
      }
    }
    console.warn(`\n   ⚠️  Catégorie "${name}" existante mais introuvable après 409`)
    return null
  }

  if (!res.ok) {
    const txt = await res.text()
    console.warn(`\n   ⚠️  Catégorie "${name}" non créée : ${txt}`)
    return null
  }

  const created = await res.json() as { id: string }
  categoryCache.set(cacheKey, created.id)
  if (!parentId) categoryCache.set(slug, created.id)
  catCreatedCount++
  console.log(`   📁 Catégorie créée : "${name}"`)
  return created.id
}

// ─── Gestion des slugs uniques ───────────────────────────────────────────────

// Slugs déjà réservés dans ce run (évite les requêtes inutiles)
const reservedSlugs = new Set<string>()

async function uniqueSlug(name: string, sku: string): Promise<string> {
  const base = slugify(name)

  const trySlug = async (candidate: string): Promise<boolean> => {
    if (reservedSlugs.has(candidate)) return false
    // Vérifie côté serveur via GET /produits avec search
    const res = await fetch(`${API_URL}/produits?limit=1&search=${encodeURIComponent(candidate)}`, {
      headers: authHeaders(),
    })
    if (!res.ok) return true // en cas d'erreur API, on suppose libre
    const body = await res.json() as { data: Array<{ slug: string }> }
    const exists = (body.data ?? []).some((p) => p.slug === candidate)
    return !exists
  }

  // Tentative 1 : slug brut
  if (await trySlug(base)) { reservedSlugs.add(base); return base }

  // Tentative 2 : slug + sku
  const withSku = `${base}-${slugify(sku)}`
  if (withSku !== base && await trySlug(withSku)) { reservedSlugs.add(withSku); return withSku }

  // Tentative 3+ : slug + incrément
  for (let n = 2; n <= 99; n++) {
    const withN = `${base}-${n}`
    if (await trySlug(withN)) { reservedSlugs.add(withN); return withN }
  }

  // Fallback ultime
  const fallback = `${base}-${Date.now()}`
  reservedSlugs.add(fallback)
  return fallback
}

// ─── Parser Variant Options ───────────────────────────────────────────────────

function parseVariantOptions(raw: string | null | undefined): Record<string, string> | null {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw.trim())
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, string>
    }
  } catch { /* JSON invalide — ignoré */ }
  return null
}

// ─── Parse Excel ─────────────────────────────────────────────────────────────

function parseExcel(filePath: string): ParsedProduct[] {
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet     = workbook.Sheets[sheetName]
  const rows      = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: null })

  console.log(`\n📄 Feuille : "${sheetName}" — ${rows.length} ligne(s)`)

  const products: ParsedProduct[]  = []
  const parseErrors: string[]      = []

  rows.forEach((row, i) => {
    const rowNum  = i + 2
    const name    = row['Product Name']?.toString().trim()
    const priceEur = row['Price EUR']

    if (!name) {
      parseErrors.push(`Ligne ${rowNum} : "Product Name" manquant`)
      return
    }
    if (priceEur == null || isNaN(Number(priceEur)) || Number(priceEur) < 0) {
      parseErrors.push(`Ligne ${rowNum} : "Price EUR" invalide (${priceEur})`)
      return
    }

    const priceEurNum = Math.round(Number(priceEur) * 100) / 100
    const priceFcfa   = eurToFcfa(priceEurNum)
    const status      = mapStatus(row['Status']?.toString())
    const is_active   = status === 'active'
    const stockRaw    = row['Stock']

    const variantOptions = parseVariantOptions(row['Variant Options']?.toString() ?? null)
    const variantSku     = row['Variant SKU']?.toString().trim() || null
    const variantRow: ParsedVariant | null = variantOptions
      ? {
          sku:       variantSku,
          options:   variantOptions,
          price:     priceFcfa,
          price_eur: priceEurNum,
          stock:     typeof stockRaw === 'number' ? Math.max(0, stockRaw) : 0,
        }
      : null

    // Clé de groupement pour les variantes
    const brand    = row['Brand']?.toString().trim() || null
    const model    = row['Model']?.toString().trim() || null
    const groupKey = `${name}||${brand ?? ''}||${model ?? ''}`
    const existing = products.find(
      (p) => `${p.name}||${p.brand ?? ''}||${p.model ?? ''}` === groupKey,
    )

    if (existing && variantRow) {
      existing.variants.push(variantRow)
    } else {
      products.push({
        rowIndex:        rowNum,
        sku:             row['SKU']?.toString().trim() || `CHT-${String(rowNum).padStart(5, '0')}`,
        name,
        brand,
        model,
        categoryName:    row['Category']?.toString().trim()    || null,
        subcategoryName: row['Subcategory']?.toString().trim() || null,
        description:     row['Description']?.toString().trim() || null,
        price_eur:       priceEurNum,
        price:           priceFcfa,
        stock:           typeof stockRaw === 'number' ? Math.max(0, stockRaw) : 0,
        status,
        is_active,
        variants:        variantRow ? [variantRow] : [],
      })
    }
  })

  if (parseErrors.length > 0) {
    console.warn(`\n⚠️  ${parseErrors.length} ligne(s) ignorée(s) à la lecture :`)
    parseErrors.slice(0, 10).forEach((e) => console.warn(`   ${e}`))
    if (parseErrors.length > 10) console.warn(`   ... et ${parseErrors.length - 10} autres`)
  }

  return products
}

// ─── Parse CSV ────────────────────────────────────────────────────────────────

function parseCsv(content: string): ParsedProduct[] {
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
  const rows    = lines.slice(1).map((line) => {
    const values: Record<string, string> = {}
    splitLine(line).forEach((v, i) => { values[headers[i] ?? `col_${i}`] = v })
    return values
  })

  const products: ParsedProduct[] = []

  rows.forEach((row, i) => {
    const name = row.name?.trim()
    if (!name) return

    const price   = parseFloat(row.price?.replace(/\s/g, '') ?? '0')
    if (isNaN(price) || price <= 0) return

    const variantOptions = parseVariantOptions(row.variant_options ?? null)
    const variantRow: ParsedVariant | null = variantOptions
      ? {
          sku:       row.variant_sku?.trim() || null,
          options:   variantOptions,
          price,
          price_eur: 0,
          stock:     parseInt(row.stock ?? '0', 10) || 0,
        }
      : null

    const groupKey = `${name}||${row.brand?.trim() ?? ''}||${row.model?.trim() ?? ''}`
    const existing = products.find(
      (p) => `${p.name}||${p.brand ?? ''}||${p.model ?? ''}` === groupKey,
    )

    if (existing && variantRow) {
      existing.variants.push(variantRow)
    } else {
      products.push({
        rowIndex:        i + 2,
        sku:             row.sku?.trim() || `CHT-CSV-${String(i + 1).padStart(5, '0')}`,
        name,
        brand:           row.brand?.trim() || null,
        model:           row.model?.trim() || null,
        categoryName:    row.category_slug?.trim() || null,
        subcategoryName: null,
        description:     row.description?.trim() || null,
        price_eur:       0,
        price,
        stock:           parseInt(row.stock ?? '0', 10) || 0,
        status:          mapStatus(row.status),
        is_active:       mapStatus(row.status) === 'active',
        variants:        variantRow ? [variantRow] : [],
      })
    }
  })

  return products
}

// ─── Créer les variantes ──────────────────────────────────────────────────────

async function createVariants(productId: string, variants: ParsedVariant[]): Promise<void> {
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i]
    const res = await fetch(`${API_URL}/produits/${productId}/variants`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({
        sku:           v.sku    ?? undefined,
        options:       v.options,
        price:         v.price,
        price_eur:     v.price_eur || undefined,
        compare_price: v.price,
        stock:         v.stock,
        is_active:     true,
        sort_order:    i,
      }),
    })
    if (!res.ok) {
      const txt = await res.text()
      console.warn(`\n      ⚠️  Variante ${i + 1} non créée : ${txt.slice(0, 120)}`)
    }
  }
}

// ─── Import principal ────────────────────────────────────────────────────────

async function importProducts(
  products: ParsedProduct[],
  dryRun:    boolean,
  overwrite: boolean,
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, skipped: 0, errors: [], catCreated: 0 }
  const total = products.length

  for (let i = 0; i < products.length; i++) {
    const p        = products[i]
    const progress = `[${String(i + 1).padStart(String(total).length, ' ')}/${total}]`

    // ── 1. Résoudre les catégories ──────────────────────────────────────────
    let categoryId: string | null = null
    let subcategoryId: string | null = null

    if (p.categoryName) {
      categoryId = await getCategoryId(p.categoryName, null)
    }
    if (p.subcategoryName && categoryId) {
      subcategoryId = await getCategoryId(p.subcategoryName, categoryId)
    }

    const finalCategoryId = subcategoryId ?? categoryId

    // ── 2. Générer le slug unique ───────────────────────────────────────────
    const slug = dryRun
      ? `${slugify(p.name)}-dry-${i}`
      : await uniqueSlug(p.name, p.sku)

    // ── 3. Calculer prix et stock effectifs ─────────────────────────────────
    const effectivePrice = p.variants.length > 0
      ? Math.min(...p.variants.map((v) => v.price))
      : p.price

    const effectiveStock = p.variants.length > 0 ? 0 : p.stock

    // ── 4. Construire le payload ────────────────────────────────────────────
    const payload: Record<string, unknown> = {
      name:          p.name,
      slug,
      sku:           p.sku,
      brand:         p.brand   ?? undefined,
      model:         p.model   ?? undefined,
      description:   p.description ?? undefined,
      price:         effectivePrice,
      compare_price: effectivePrice,      // champ requis dans le DTO
      price_eur:     p.price_eur || undefined,
      stock:         effectiveStock,
      status:        p.status,
      is_active:     p.is_active,
      categoryId:    finalCategoryId ?? undefined,   // camelCase — DTO backend
    }

    // ── 5. Dry-run : afficher sans créer ────────────────────────────────────
    if (dryRun) {
      if (i < 5 || i === total - 1) {
        const varInfo = p.variants.length > 0 ? ` (+${p.variants.length} variantes)` : ''
        console.log(
          `  ${progress} ✓ "${p.name}"${varInfo}` +
          ` | ${effectivePrice.toLocaleString('fr-FR')} FCFA` +
          ` | ${p.price_eur} EUR` +
          ` | cat: ${p.subcategoryName ?? p.categoryName ?? '—'}`,
        )
      } else if (i === 5) {
        console.log(`  ... (${total - 6} autres lignes non affichées)`)
      }
      result.success++
      continue
    }

    // ── 6. Créer le produit ─────────────────────────────────────────────────
    const res = await fetch(`${API_URL}/produits`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(payload),
    })

    // Produit déjà existant (slug en conflit) → gérer selon --overwrite
    if (res.status === 409) {
      if (!overwrite) {
        result.skipped++
        if (i < 10) console.log(`  ${progress} ⏭  "${p.name}" — déjà existant (ignoré)`)
        continue
      }
      // TODO : PATCH si --overwrite (non implémenté dans cette version)
      result.skipped++
      continue
    }

    if (!res.ok) {
      const txt = await res.text()
      let errMsg: string
      try {
        const errBody = JSON.parse(txt) as { message?: string | string[] }
        errMsg = Array.isArray(errBody.message)
          ? errBody.message.join(', ')
          : errBody.message ?? txt
      } catch {
        errMsg = txt.slice(0, 200)
      }
      process.stdout.write(`\n  ${progress} ❌ "${p.name}" → ${errMsg}\n`)
      result.errors.push({ row: p.rowIndex, name: p.name, error: errMsg })
      continue
    }

    const created = await res.json() as { id: string }

    // ── 7. Créer les variantes ──────────────────────────────────────────────
    if (p.variants.length > 0) {
      await createVariants(created.id, p.variants)
    }

    result.success++

    // Progression console
    if ((i + 1) % 100 === 0) {
      process.stdout.write(`\n  ✅ ${i + 1}/${total} produits importés\n`)
    } else if ((i + 1) % 10 === 0) {
      process.stdout.write('.')
    }
  }

  result.catCreated = catCreatedCount
  return result
}

// ─── Point d'entrée ──────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2)
  const flag    = (name: string) => args.find((a) => a.startsWith(`--${name}`))?.split('=')[1] ?? null
  const hasFlag = (name: string) => args.some((a) => a === `--${name}`)

  const dryRun      = hasFlag('dry-run')
  const overwrite   = hasFlag('overwrite')
  const brandFilter = flag('brand')
  const limitArg    = flag('limit')
  const limit       = limitArg ? parseInt(limitArg, 10) : Infinity
  const filePath    = flag('file') ?? args.find((a) => !a.startsWith('--')) ?? null

  // Afficher l'aide
  if (!filePath || hasFlag('help')) {
    console.log(`
Usage :
  npx tsx scripts/import-products.ts --file <fichier.xlsx|csv>

Options :
  --dry-run           Simuler l'import sans écrire en base
  --limit=N           Importer seulement les N premiers produits
  --brand=Dell        Filtrer par marque
  --overwrite         Mettre à jour les produits existants (désactivé par défaut)

Variables d'environnement (.env.local) :
  NEXT_PUBLIC_API_URL   URL du backend  (défaut: http://localhost:3000)
  ADMIN_API_TOKEN       Bearer token JWT admin
  ADMIN_EMAIL           Email admin pour login automatique
  ADMIN_PASSWORD        Mot de passe admin pour login automatique
`)
    process.exit(filePath ? 0 : 1)
  }

  const resolved = path.resolve(filePath)
  if (!fs.existsSync(resolved)) {
    console.error(`\n❌ Fichier introuvable : ${resolved}\n`)
    process.exit(1)
  }

  // Login
  await autoLogin()

  // Entête
  console.log('\n╔══════════════════════════════════════════════════════╗')
  console.log('║     Chanoa Tech — Import catalogue produits          ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log(`  Fichier  : ${path.basename(resolved)}`)
  console.log(`  API      : ${API_URL}`)
  console.log(`  Mode     : ${dryRun ? '🔍 DRY-RUN (aucune écriture)' : '✏️  RÉEL (écriture en base)'}`)
  console.log(`  Taux     : 1 EUR = ${EUR_TO_FCFA} FCFA`)
  if (brandFilter) console.log(`  Filtre   : brand = "${brandFilter}"`)
  if (isFinite(limit)) console.log(`  Limite   : ${limit} produits`)
  console.log('')

  // Parser le fichier
  const ext = path.extname(resolved).toLowerCase()
  let products: ParsedProduct[]

  if (ext === '.csv') {
    const raw = fs.readFileSync(resolved, 'utf-8')
    products  = parseCsv(raw)
    console.log(`📄 CSV — ${products.length} produit(s) après groupement`)
  } else {
    products = parseExcel(resolved)
    console.log(`📦 ${products.length} produit(s) après groupement des variantes`)
  }

  // Filtres
  if (brandFilter) {
    products = products.filter((p) => p.brand?.toLowerCase() === brandFilter.toLowerCase())
    console.log(`   → ${products.length} produit(s) après filtre brand="${brandFilter}"`)
  }
  if (isFinite(limit)) {
    products = products.slice(0, limit)
  }

  if (products.length === 0) {
    console.error('\n❌ Aucun produit valide à importer.\n')
    process.exit(1)
  }

  // Résumé avant import
  const withVariants = products.filter((p) => p.variants.length > 0).length
  const totalVariants = products.reduce((s, p) => s + p.variants.length, 0)
  console.log(`\n  Produits uniques : ${products.length}`)
  console.log(`  Avec variantes   : ${withVariants} produits (${totalVariants} variantes au total)`)
  console.log(`  Sans variantes   : ${products.length - withVariants} produits`)
  console.log('')

  if (!dryRun) {
    console.log('  Chargement des catégories existantes...')
    await loadCategoryCache()
    console.log(`  → ${categoryCache.size} catégorie(s) déjà en base\n`)
  }

  // Import
  const started = Date.now()
  const result  = await importProducts(products, dryRun, overwrite)
  const elapsed = ((Date.now() - started) / 1000).toFixed(1)

  // Rapport
  console.log('\n\n╔══════════════════════════════════════════════════════╗')
  console.log('║                  RAPPORT D\'IMPORT                   ║')
  console.log('╠══════════════════════════════════════════════════════╣')
  console.log(`║  Produits importés  : ${String(result.success).padStart(6, ' ')}                         ║`)
  console.log(`║  Produits ignorés   : ${String(result.skipped).padStart(6, ' ')}  (déjà existants)       ║`)
  console.log(`║  Erreurs            : ${String(result.errors.length).padStart(6, ' ')}                         ║`)
  console.log(`║  Catégories créées  : ${String(result.catCreated).padStart(6, ' ')}                         ║`)
  console.log(`║  Durée              : ${String(elapsed + 's').padStart(6, ' ')}                         ║`)
  console.log('╚══════════════════════════════════════════════════════╝')

  if (result.errors.length > 0) {
    console.log(`\n❌ Détail des erreurs (${Math.min(result.errors.length, 20)} premières) :`)
    result.errors.slice(0, 20).forEach((e) =>
      console.log(`   Ligne ${e.row} "${e.name}" → ${e.error}`)
    )
    if (result.errors.length > 20) {
      console.log(`   ... et ${result.errors.length - 20} autres erreurs`)
    }
  }

  if (dryRun) {
    console.log('\n💡 Dry-run terminé. Relancez sans --dry-run pour écrire en base.')
  } else if (result.success > 0) {
    console.log(`\n🎉 Import terminé ! ${result.success} produit(s) disponible(s) dans /admin/produits`)
  }
  console.log('')
}

main().catch((err: Error) => {
  console.error('\n❌ Erreur fatale :', err.message)
  process.exit(1)
})
