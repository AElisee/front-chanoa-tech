# CLAUDE.md — Chanoa Tech

## RÈGLE ABSOLUE — Mise à jour de ce fichier

**Ce fichier DOIT être mis à jour à chaque session, à chaque évolution significative du projet.**

Claude Code doit mettre à jour CLAUDE.md :

- Après toute modification du schéma base de données
- Après tout ajout de fonctionnalité importante
- Après toute décision d'architecture
- Après chaque push GitHub important
- Après chaque découverte de contrainte technique ou métier
- Dès qu'un état "En cours / Manquant" change de statut

Ne jamais laisser CLAUDE.md décrire un état périmé du projet.
Ne jamais terminer une session sans vérifier si une mise à jour est nécessaire.

---

## Project Overview

**Chanoa Tech** est une plateforme e-commerce et institutionnelle pour le matériel IT et audiovisuel, destinée à l'Afrique de l'Ouest francophone. Trois niveaux d'expérience :

- `/` → vitrine & store client (`app/(store)/`)
- `/admin` → panneau d'administration (`app/(admin)/`)
- Pages institutionnelles B2B/B2G : `/entreprises`, `/ecoles`, `/etat`, `/datacenter`, `/packs`, `/securite`, `/references`, `/contact-grands-comptes`

**Cibles** : B2C (particuliers), B2B (entreprises), Éducation, État/administrations, Banques & assurances.

Language: French UI. Prices in FCFA. Target market: Côte d'Ivoire and neighboring countries.

---

## Tech Stack

| Layer          | Technology                                                                   |
| -------------- | ---------------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, `output: 'standalone'`)                              |
| Language       | TypeScript 5 (strict mode)                                                   |
| Database       | Supabase (PostgreSQL + Auth + Storage)                                       |
| Edge Functions | Supabase Edge Functions (Deno runtime)                                       |
| UI             | shadcn/ui + Tailwind CSS 4                                                   |
| Fonts          | Poppins (body) + Montserrat (h1-h6) via `next/font/google`                   |
| Icons          | Lucide React                                                                 |
| State          | Zustand 5 (cart, persisted to localStorage)                                  |
| Toasts         | Sonner                                                                       |
| Email          | Resend API                                                                   |
| Payments       | GeniusPay Merchant API (Wave, Orange Money, MTN Money, Visa)                 |
| PDF            | pdf-lib (via esm.sh, Deno-compatible)                                        |
| Deployment     | **Vercel** (preview client, MVP) → VPS Hostinger PM2+Nginx (prod long terme) |

---

## Project Structure

```
app/
  (admin)/
    layout.tsx
    admin/
      page.tsx                  # Dashboard (KPIs, revenue chart, recent orders)
      produits/page.tsx         # Product list + toggle active
      produits/[id]/page.tsx    # Edit product
      commandes/page.tsx        # Orders list (filter by status + search)
      commandes/[id]/page.tsx   # Order detail (timeline, items, status actions, tracking, notes)
      commandes/[id]/actions.ts # Server actions: updateOrderStatus, updateTracking, updateOrderNotes
      categories/page.tsx       # Hierarchical category list
      categories/new/page.tsx   # Create category
      categories/[id]/page.tsx  # Edit/delete category
      categories/actions.ts     # Server actions: create, update, toggleActive, delete
      clients/page.tsx          # Clients list with stats
      clients/[id]/page.tsx     # Client detail + order history
      parametres/page.tsx       # Admin profile, password change, sign out, system info
  (store)/
    layout.tsx
    page.tsx                    # Home — hero agressif, segments clients, produits populaires, packs entreprise, lead magnet
    auth/
      login/page.tsx + LoginForm.tsx   # Includes admin quick-access panel
      signup/page.tsx
      reset-password/page.tsx
    boutique/
      page.tsx                  # Catalog (search + category filter + product grid)
      [slug]/page.tsx           # Product detail
    panier/page.tsx             # Cart
    checkout/
      page.tsx                  # Checkout form (guest allowed, no login required)
      actions.ts                # placeOrder Server Action
    commande/[id]/
      page.tsx                  # Order confirmation
      ClearCartOnMount.tsx      # Clears Zustand cart on mount (after redirect)
    compte/
      page.tsx                  # Account overview (profile + stats + recent orders)
      commandes/page.tsx        # Orders history
    # ── Pages institutionnelles (en cours de création) ──
    entreprises/page.tsx        # Solutions B2B : postes de travail, visio, réseau, sécurité
    ecoles/page.tsx             # Digitalisation écoles/universités
    etat/page.tsx               # Intégrateur institutionnel : ministères, collectivités
    datacenter/page.tsx         # Expertise datacenter : serveurs, virtualisation, backup
    packs/page.tsx              # Packs clés-en-main : PME, salle réunion, sécurité, datacenter
    securite/page.tsx           # Cybersécurité, vidéosurveillance, contrôle accès
    references/page.tsx         # Cas clients, secteurs, témoignages
    contact-grands-comptes/page.tsx  # Formulaire avec budget estimé et type d'organisation
  layout.tsx                    # Root layout (Geist font, Sonner, lang="fr")
  globals.css

components/
  ui/                           # shadcn components — do not modify manually
  admin/
    AdminSidebar.tsx            # Nav: Dashboard, Produits, Commandes, Catégories, Clients, Paramètres
  store/
    Header.tsx                  # Logo, search, cart badge, auth links
    Footer.tsx
    ProductCard.tsx
    CategoryFilter.tsx
    # ... other store components

lib/
  hooks/
    useCart.ts                  # Zustand cart store, persisted to localStorage
  supabase/
    client.ts                   # Browser Supabase client
    server.ts                   # Server Supabase client (Server Components + Server Actions)
    types.ts                    # Generated DB types (Database interface)
    query-types.ts
  mock-data.ts                  # Dev scaffolding only — NEVER use in production paths

types/                          # Custom TypeScript contracts

supabase/
  migrations/
    001_initial_schema.sql
    002_products_extension.sql
    003_guest_checkout.sql      # guest_email column on orders (fallback, may be unused)
    004_fix_auth_trigger.sql    # Exception-safe handle_new_user() trigger
    005_invoice_storage.sql     # invoice_url column + invoices storage bucket
    006_product_variants.sql    # product_variants table (RAM, stockage…)
    007_payment_reference.sql   # GeniusPay payment_reference column
    008_payment_method.sql      # orders.payment_method (genius_pay | cash_on_delivery)
  seed.sql
  functions/
    _shared/
      cors.ts                   # corsHeaders + handleCors()
      resend.ts                 # sendEmail() via Resend API
      supabase.ts               # createServiceClient() for Deno
      email-templates.ts        # baseLayout, orderConfirmationEmail, statusUpdateEmail
    send-order-email/index.ts   # EF-01: DB webhook on INSERT orders
    send-status-email/index.ts  # EF-02: DB webhook on UPDATE orders.status
    payment-initiate/index.ts   # EF-03a: HTTP — initiate CinetPay payment
    payment-webhook/index.ts    # EF-03b: HTTP — CinetPay notify_url
    generate-invoice/index.ts   # EF-04: DB webhook on UPDATE orders (status→confirmed)

scripts/
  import-products.ts            # CSV/XLSX product import with upsert-on-slug

proxy.ts                        # Auth protection (active at project root — Next.js 16 uses proxy.ts instead of middleware.ts)
proxy.ts                        # Old middleware draft — superseded by middleware.ts
next.config.ts                  # output: 'standalone', image remotePatterns
tsconfig.json                   # Excludes supabase/functions (Deno types conflict)
```

---

## Authentication & Authorization

Handled in [proxy.ts](proxy.ts) (Next.js 16 renamed middleware.ts → proxy.ts):

- `/compte/*` → requires authenticated user
- `/admin/*` → requires `profiles.role = 'admin'`
- Unauthenticated users redirected to `/auth/login?redirect=...`

**CRITICAL**: Middleware is a first filter only. Every Server Action and Route Handler for admin must also re-verify the `admin` role server-side using `guardAdmin()` (see `app/(admin)/admin/commandes/[id]/actions.ts`). Never rely on middleware alone.

Use `lib/supabase/server.ts` in Server Components and Server Actions. Use `lib/supabase/client.ts` in Client Components.

User roles: `user` | `admin`

### Admin Quick-Access (Dev Only)

When `NEXT_PUBLIC_ADMIN_EMAIL` env var is set, the login page shows a pre-fill button for fast admin access. This is a convenience for development — not a security bypass.

---

## Database Schema

Tables: `profiles`, `categories`, `products`, `carts`, `cart_items`, `orders`, `order_items`, `deliveries`

- RLS enabled on all tables
- Full-text search on products (French language config)
- Order statuses: `pending | confirmed | processing | shipped | delivered | cancelled`
- User roles: `user | admin`
- `order_items` stores `product_snapshot` (name at order time)
- `orders.shipping_address` is JSONB — contains `{full_name, email, phone, address, city}`
- Guest orders: `user_id = null`, email stored in `shipping_address.email`
- `orders.invoice_url` — public URL to PDF in Supabase Storage `invoices` bucket
- `orders.notes` — freeform text; CinetPay stores `cinetpay_transaction:{tx_id}` here
- `orders.payment_method` — `genius_pay` (default) | `cash_on_delivery` (CHECK constraint)

Types in [lib/supabase/types.ts](lib/supabase/types.ts).

---

## Guest Checkout Flow

Checkout does NOT require login:

1. User fills form: email (required), nom (optional), téléphone, adresse, ville
2. Server Action `placeOrder()` uses **service role** to bypass RLS
3. Order created with `user_id = null`, email saved in `shipping_address.email`
4. Redirect to `/commande/{order_id}` (no email in URL)
5. Confirmation page reads email from `order.shipping_address.email`
6. `ClearCartOnMount` client component clears Zustand cart on confirmation page mount

### Empty Cart Flash Prevention

Checkout form uses a `submitted` state:

- When `submitted = true`: fullscreen loader shown instead of empty-cart guard
- `clearCart()` is never called before redirect — only called on confirmation page mount
- This prevents the cart from appearing empty during the redirect animation

---

## Edge Functions

All functions are in `supabase/functions/`. They run on Deno.

### EF-01 — send-order-email

- **Trigger**: DB Webhook → INSERT on `orders`
- **Action**: Sends order confirmation email to customer via Resend
- **Shared**: uses `_shared/email-templates.ts` → `orderConfirmationEmail()`

### EF-02 — send-status-email

- **Trigger**: DB Webhook → UPDATE on `orders` (column: `status`)
- **Action**: Sends status update email for `confirmed | shipped | delivered | cancelled`
- **Skips**: `pending`, `processing` (silent transitions)

### EF-03a — payment-initiate

- **Trigger**: HTTP POST `{ order_id, amount, customer_email, customer_phone, customer_name }`
- **Action**: Calls CinetPay `/v2/payment`, returns `{ payment_url, transaction_id }`
- **Stores**: `cinetpay_transaction:{tx_id}` in `orders.notes`

### EF-03b — payment-webhook

- **Trigger**: HTTP POST from CinetPay (configure as `notify_url` in CinetPay dashboard)
- **Action**: Verifies payment via CinetPay `/v2/payment/check`, updates order status
  - `ACCEPTED` → `confirmed`
  - `REFUSED | CANCELLED | EXPIRED` → `cancelled`
- **Always returns 200** to prevent CinetPay retries

### EF-04 — generate-invoice

- **Trigger**: DB Webhook → UPDATE on `orders` (column: `status`)
- **Fires when**: status transitions TO `confirmed` (guards against double-fire)
- **Actions**:
  1. Builds A4 PDF with pdf-lib (header band #0F3460, client info, items table, totals, footer)
  2. Uploads to Supabase Storage `invoices/{order_id}.pdf`
  3. Updates `orders.invoice_url`
  4. Sends PDF as email attachment via Resend
- **Invoice number format**: `CT-{YEAR}-{SHORT_ORDER_ID}`

### Shared Utilities (`_shared/`)

- `cors.ts` — `corsHeaders` constant + `handleCors(req)` preflight handler
- `resend.ts` — `sendEmail({ to, subject, html, from?, attachments? })`
- `supabase.ts` — `createServiceClient()` using `Deno.env.get`
- `email-templates.ts` — `baseLayout()`, `orderConfirmationEmail()`, `statusUpdateEmail()`

### Edge Function Env Vars (set in Supabase Dashboard → Edge Functions → Secrets)

```
RESEND_API_KEY
FROM_EMAIL          # e.g. noreply@chanoatech.com
CINETPAY_API_KEY
CINETPAY_SITE_ID
APP_URL             # e.g. https://chanoatech.com
SUPABASE_URL        # auto-set by Supabase
SUPABASE_SERVICE_ROLE_KEY
```

### DB Webhook Configuration (Supabase Dashboard → Database → Webhooks)

| Function          | Table  | Events | Column Filter |
| ----------------- | ------ | ------ | ------------- |
| send-order-email  | orders | INSERT | —             |
| send-status-email | orders | UPDATE | status        |
| generate-invoice  | orders | UPDATE | status        |

### Deploy

```bash
supabase functions deploy send-order-email
supabase functions deploy send-status-email
supabase functions deploy payment-initiate
supabase functions deploy payment-webhook
supabase functions deploy generate-invoice
```

---

## Environment Variables

`.env.local` (never commit):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=        # optional — enables dev quick-access on login page
```

Rules:

- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never expose to client
- Only `NEXT_PUBLIC_` vars reach the browser

---

## Development

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build → .next/standalone/
npm run lint     # ESLint
npx tsc --noEmit # TypeScript check
```

---

## Product Import Script

```bash
# From CSV (upsert on slug — idempotent)
npx tsx scripts/import-products.ts --file produits.csv --brand "Dell" --image-placeholder "https://..."

# From XLSX
npx tsx scripts/import-products.ts --file catalogue.xlsx

# With overwrite (re-processes even existing slugs)
npx tsx scripts/import-products.ts --file produits.csv --overwrite

# Dry run (no DB writes)
npx tsx scripts/import-products.ts --file produits.csv --dry-run
```

CSV format: `id, sku, name, category, subcategory, brand, model, description, price_eur, stock, status`
Slug is auto-generated from name. Upserts on `slug` conflict — safe to re-run.

---

## VPS Deployment (Hostinger — PM2 + Nginx)

```bash
# Build
npm run build
# Output: .next/standalone/

# On server — start with PM2
pm2 start .next/standalone/server.js --name chanoa-tech

# Nginx reverse proxy to port 3000
```

`next.config.ts` has `output: 'standalone'` and `images.remotePatterns: [{ protocol: 'https', hostname: '**' }]`.

---

## Business Rules (Réponses CDC — 2026-03-20)

### Vente & Paiement

- **B2C** : achat direct sur le site — deux modes au choix au checkout :
  - **Paiement en ligne** via GeniusPay (Wave, Orange Money, MTN, Moov, Visa/Mastercard)
  - **Paiement à la livraison** (espèces au livreur) — l'équipe rappelle sous 24h pour confirmer
- **B2B/Devis** : virement bancaire disponible sur devis uniquement
- **Prix** : affichés publiquement pour tous les visiteurs
- **Livraison** : stock réel — délai promis 48 à 72h

### Catalogue & Produits

- **Volume lancement** : ~2 000 produits (Dell, MacBook, accessoires)
- **Variantes** : obligatoires — RAM, stockage, options de configuration
  - Impact : migration DB pour `product_variants` + sélecteur sur page produit
- **Stock** : stock réel géré en admin — pas de catalogue fournisseur pur

### Flux Devis B2B

1. Entreprise ajoute produits au panier
2. Choisit "Générer un devis" au lieu de "Payer"
3. Système génère automatiquement un PDF devis (numéroté `DEV-YEAR-ID`)
4. Après validation interne + paiement → facture PDF auto-générée (`CT-YEAR-ID`)

- Impact : nouveau bouton checkout B2B, Edge Function `generate-quote`, table `quotes`

## Key Conventions

- **Path alias**: `@/*` maps to the project root
- **Server vs Client**: Default to Server Components; `"use client"` only for interactivity, hooks, browser APIs
- **Supabase clients**: `lib/supabase/server.ts` in Server Components/actions; `lib/supabase/client.ts` in Client Components
- **Cart**: Zustand (`lib/hooks/useCart.ts`), persisted to localStorage
- **UI components**: Use existing shadcn from `components/ui/` before creating new ones
- **No `app/page.tsx`**: Deleted — store home is `app/(store)/page.tsx`
- **No mock data in production**: `lib/mock-data.ts` is scaffolding only — all pages use real Supabase
- **TypeScript**: `supabase/functions/` excluded from `tsconfig.json` to avoid Deno type conflicts

---

## Architecture Rules (MANDATORY)

### Security Rules (Non-Negotiable)

- Never trust client-sent prices, roles, stock levels, or IDs
- Always reload data from DB before any critical operation
- Server Actions or Route Handlers for all sensitive operations
- No secret keys exposed to browser
- Admin route checks repeated inside handlers — middleware alone is never enough
- Protect against: BOLA, broken auth, security misconfiguration, excessive data exposure, privilege escalation

### Database Rules

- Foreign keys on all relations, `NOT NULL` where meaningful
- `CHECK` constraints on statuses, amounts, quantities
- Unique constraints on slugs
- Timestamps on all tables (`created_at`, `updated_at`)
- Index: `user_id`, `order_id`, `product_id`, `category_id`, `slug`, `status`, `created_at`

### Performance Rules

- Server Components by default
- Paginate all lists
- Never load all products at once client-side
- Minimal column selection in queries

---

## Git Discipline (MANDATORY)

Commit format:

```
feat: add secure customer authentication flow
fix: prevent client-side price tampering at checkout
refactor: split order service from route handlers
security: enforce admin role checks on protected routes
perf: optimize product queries with indexed filters
chore: configure environment variable validation
docs: document Supabase RLS policies
```

Forbidden: `update`, `final`, `changes`, `work`, `bug fix`, `misc`, `temp`, `wip`

Branch strategy: `main` (production) | `feature/...` | `fix/...` | `refactor/...` | `security/...`

---

## Current Implementation State (updated 2026-04-24)

### Done ✅

**Sécurité (Phase 1)**

- Server-side price validation in `placeOrder()` — reloads prices from DB
- `guardAdmin()` centralized in `lib/supabase/server.ts` — used by all 10 admin pages
- Admin pages use service-role client (bypasses RLS after admin identity verified)
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- `NEXT_PUBLIC_ADMIN_PASSWORD` removed — only email pre-fill remains
- Zod validation on ALL Server Actions (`lib/schemas/index.ts`)

**Paiement — GeniusPay (Phase 2)**

- `payment-initiate/index.ts` — POST to `pay.genius.ci/api/v1/merchant/payments`, returns `checkout_url` (hosted checkout page)
- Auth : headers `X-API-Key` (pk_sandbox_xxx / pk_live_xxx) + `X-API-Secret` (sk_sandbox_xxx / sk_live_xxx)
- Body inclut `amount, currency=XOF, customer{name,email,phone,country=CI}, success_url, error_url, metadata{order_id, customer_email}` — **sans `payment_method`** pour que GeniusPay affiche sa page de choix (meilleure conversion)
- `payment-webhook/index.ts` — vérification HMAC-SHA256 au format `HMAC(timestamp + "." + body, secret)`, headers `X-Webhook-Signature`, `X-Webhook-Timestamp`, `X-Webhook-Event`, `X-Webhook-Environment`
- Replay protection : fenêtre 5 minutes sur le timestamp
- Events gérés : `payment.success`, `payment.failed`, `payment.cancelled`, `payment.expired`, `payment.refunded`
- Migration 007 : `payment_reference` column on orders (stocke la GeniusPay reference `MTX-xxx`)
- Lookup order : via `metadata.order_id` en priorité, fallback sur `payment_reference`
- Idempotent : n'update le statut que si `status = 'pending'`
- Moyens de paiement dispos via GeniusPay : Wave, Orange Money (CI, SN, ML, BF), MTN Mobile Money (CI, BF), Visa/Mastercard, PawaPay (12 pays africains)

**Store (customer-facing)**

- Home page: hero conversion, segments clients (6 cibles), produits populaires, packs, lead magnet
- Boutique: product grid, search, category filter, pagination, sorting, FCFA prices
- Product detail: variants selector, stock check, quantity, add to cart, buy now
- Product detail: 4 payment logos (Wave, Orange Money, MTN, Visa), 8 related products
- Product detail: bouton "Demander un devis" → lien vers `/contact-grands-comptes?produit=…&ref=…` (formulaire pré-rempli via `useSearchParams` + initialiseur `useState`)
- Cart (Zustand, persisted, variant support, badge in header)
- Checkout: communes Abidjan dropdown, livraison 1 500 FCFA fixe, guest + logged-in
- Checkout: detects logged-in user → sets `user_id` (not always null anymore)
- Checkout: sélecteur de mode de paiement (radio) — `genius_pay` (en ligne) ou `cash_on_delivery` (espèces à la livraison) ; le COD saute l'appel `payment-initiate` et redirige direct vers `/commande/{id}`
- Order confirmation: ClearCartOnMount, reads email from shipping_address
- Auth: login (admin → /admin, client → /compte), signup, reset-password
- Compte: admin banner + link if admin role, overview, orders history

**Pages institutionnelles**

- `/entreprises`, `/ecoles`, `/etat`, `/datacenter`, `/packs`, `/securite`, `/references`, `/contact-grands-comptes`
- All with SEO metadata (title + description)
- Header: Solutions dropdown (7 links + "Parler à un expert")
- Footer: 4 columns (Brand, Boutique, Solutions B2B, Contact + devis CTA)

**Admin panel**

- Dashboard: 5 KPIs + revenue bar chart + recent orders
- Commandes: card-based list, status filter tabs (clickable), search, phone display
- Commandes detail: timeline, items, client info (phone+email), status change, tracking, notes
- Produits: list, search, pagination, create (`/nouveau`), edit, delete (with confirmation)
- Produits: image upload via Supabase Storage (`ImageUploader` component), variant CRUD
- Catégories: hierarchical list, create/edit/delete, toggle active
- Clients: list with stats, detail page with order history
- Paramètres: admin profile, password change, sign out
- Sidebar: sign out button
- Header: "Admin" badge visible for admin users (desktop + mobile)
- Order status badges: colored with dot indicator (amber/blue/purple/indigo/green/red)

**SEO & Qualité (Phase 6)**

- Dynamic OG meta tags on product pages (title, description, image)
- `sitemap.xml` dynamic (products + categories + static pages)
- `robots.txt` (disallows /admin, /compte, /checkout, /auth)

**Design & UX (Phase 7 — en cours)**

- Polices : Poppins (body) + Montserrat (titres h1-h6) via `next/font/google`
  - Configuré dans `app/layout.tsx` + `app/globals.css` (`--font-sans`, `--font-display`)
- Sidebar admin : gradient `#0F3460 → #081B3C`, logo rouge avec Sparkles, barre latérale rouge sur item actif
- Dashboard admin : KPI cards avec icônes colorées + gradients (emerald, blue, amber, purple, rose), ArrowUpRight au hover
- Chart revenus : barres gradient emerald + tooltip au hover
- Recent orders + Stock faible : cartes arrondies 2xl, icônes dans cercles, badges pill
- Composant `ImageUploader` : auto-rognage **carré 800×800 WebP 90%** via Canvas API
  - Prend les images portrait/paysage/mobile et les crop centrées en 1:1
  - Output WebP pour optimiser le poids
- Landing page : section "Pourquoi nous" avec illustration image + liste de bullet points (CheckCircle)
  - Dossier `public/assets/landing/` pour ajouter images (ex: `why-us.jpg`)

**Assets (Phase 7 — suite)**

- `public/assets/payments/` — 6 logos officiels (wave, orange-money, mtn-momo, moov-money, visa, mastercard)
- `public/assets/partners/` — 8 logos de marques (Dell, Apple, HP, Lenovo, Cisco, Samsung, Logitech, Microsoft) via SimpleIcons CDN (monochrome, grayscale par défaut, couleur au hover sur landing)
- Logos paiement sur page produit : grille 3 colonnes mobile / 6 desktop, hauteur `h-12`/`h-14`, ring léger
- Section "Nos marques partenaires" sur landing entre "Pourquoi nous" et "Segments clients"

**Corrections récentes**

- Bug `redirect()` dans try/catch : extraction du `redirect(checkout_url)` hors try-catch (redirect lance `NEXT_REDIRECT`)
- Bug JOIN PostgREST avec service role : charger les relations séparément (orders + order_items + profiles) puis joindre côté JS
- Bug clients admin : compter aussi les commandes guest (match email `guest_email` + `shipping_address.email`)
- Bug status update : `redirect('/admin/commandes?updated=1')` après `updateOrderStatus` + banner vert
- Bug `is_active` perdu au save produit : hidden input conditionnel dans le formulaire principal
- Boutons mobile : `h-12`, `inline-flex items-center justify-center`, `w-full` sur mobile puis `flex-1` desktop

**Admin panel — nouvelle version cartes**

- Page commandes : cartes modernes (au lieu de tableau), tabs cliquables pour filtres, affichage téléphone client
- Page produits : grille de cartes 1-4 colonnes avec image en aspect-square, badge stock (vert/orange/rouge), overlay "Modifier" au hover, cohérent avec boutique publique
- Page clients : grille 3 colonnes, avatar initiale, stats commandes + CA, date dernière commande
- Sidebar admin : déconnexion, gradient moderne, indicateur rouge sur item actif

**Infrastructure**

- Supabase schema: 8 migrations (001-008) toutes appliquées ✅ (historique synchronisé via `migration repair` + `db push` le 2026-04-25)
- Edge Functions : `payment-initiate` + `payment-webhook` déployées ✅ (via `npx supabase functions deploy`)
- Secrets GeniusPay configurés (sandbox) : `GENIUSPAY_API_KEY`, `GENIUSPAY_API_SECRET`, `APP_URL` ✅
- Bucket `product-images` créé avec policies ✅
- Intégration GeniusPay testée en e2e via Playwright ✅
- `output: 'standalone'` for VPS deployment
- Product import script: CSV + XLSX, upsert-on-slug, variant support

### 🚀 Étape immédiate — Premier déploiement Vercel (preview client)

Objectif : envoyer un lien fonctionnel au client pour validation visuelle/UX avant de finaliser les intégrations.

**Branche à déployer** : `main` (cd8d641 mergé via 65f1b81 — toute l'évolution est ici, plus sur `feature/supabase-live-data`)

#### 1. Importer le projet sur Vercel

- vercel.com/new → importer le repo `astephbi/chanoa-tech`
- Branch de production : `main`
- Framework auto-détecté : Next.js → ne rien changer

#### 2. ⚠️ Comprendre la séparation des secrets (point qui revient souvent)

Il y a **deux endroits** où des secrets vivent :

| Plateforme                                    | Pour qui ?                                                          | Secrets concernés                                           |
| --------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Vercel** (Settings → Environment Variables) | Le **site Next.js** (Server Components, Server Actions, API routes) | URL + clés Supabase (sans elles, le site plante au runtime) |
| **Supabase** (Edge Functions → Secrets)       | Les **Edge Functions Deno** (paiement, emails, factures)            | Clés GeniusPay, Resend, FROM_EMAIL, APP_URL                 |

Les secrets Supabase **ne sont pas accessibles** depuis le site Next.js, et inversement. **Il faut configurer les deux côtés** (Vercel pour le site, Supabase pour les Edge Functions).

#### 3. Variables à coller dans Vercel (obligatoire pour que le site démarre)

| Variable                        | Valeur source                    | Sensibilité                                              |
| ------------------------------- | -------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `.env.local` (publique)          | publique                                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` (publique)          | publique                                                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | `.env.local` (server-only)       | 🔒 **server-only** — ne jamais cocher "expose to client" |
| `NEXT_PUBLIC_ADMIN_EMAIL`       | `astephbi@gmail.com` (optionnel) | publique                                                 |

À cocher pour chaque variable : **Production**, **Preview**, **Development**.

Retrouver les clés : `.env.local` (déjà ouvert dans VS Code) ou supabase.com/dashboard/project/wawdbrjpibevxlvsdyqz/settings/api

#### 4. Redéployer

Deployments → dernier deployment → **⋯ Redeploy** (sans cache si possible).

#### 5. Récupérer l'URL preview → l'envoyer au client.

#### Ce qui marche déjà sur la preview ✅

- Catalogue, panier, checkout (paiement en ligne **et** paiement à la livraison)
- Création de commande (insertion DB) + redirection GeniusPay sandbox
- Espace client, panneau admin, gestion produits/catégories/commandes/clients
- Pages institutionnelles (B2B/B2G/Écoles/Datacenter…) + formulaire grands comptes pré-rempli depuis fiche produit

#### Ce qui ne marche **pas encore** (à expliquer au client) ⚠️

- **Emails transactionnels** (confirmation commande, changement de statut, facture PDF) — Resend pas configuré, Edge Functions email pas déployées
- **Webhook GeniusPay** (validation finale du paiement côté serveur) — secret pas encore défini, donc une commande payée en sandbox restera en `pending`
- **Catalogue produits réel** — la base est vide en prod ; à importer via le script CSV/XLSX

### Pending — À faire avant le go-live commercial ⏳

**Emails & facturation**

- Créer compte Resend → obtenir API key → secrets Supabase : `RESEND_API_KEY` + `FROM_EMAIL`
- Déployer les 3 Edge Functions email : `send-order-email`, `send-status-email`, `generate-invoice`
- Configurer 3 DB Webhooks (orders INSERT → send-order-email, orders UPDATE status → send-status-email + generate-invoice)

**Paiement en production**

- Configurer le webhook GeniusPay dans le dashboard merchant
  - URL : `https://wawdbrjpibevxlvsdyqz.supabase.co/functions/v1/payment-webhook`
  - Events : `payment.success`, `payment.failed`, `payment.cancelled`, `payment.expired`, `payment.refunded`
- Récupérer le webhook secret → secret Supabase `GENIUSPAY_WEBHOOK_SECRET`
- Basculer sur clés `pk_live_` / `sk_live_` (sandbox → production)

**Catalogue**

- Importer ~2 000 produits (CSV/XLSX) via `npx tsx scripts/import-products.ts`

**Légal & confiance (recommandé avant lancement public)**

- CGV / Mentions légales / Politique de confidentialité
- Compléter les images des sections landing (`public/assets/landing/` ne contient que `workplace_chanoa.jpg`)

### Next Phases 🔜

- **Phase 7bis — Migration vers VPS Hostinger** (post-MVP) : Nginx reverse proxy, PM2, SSL, DNS chanoatech.com
- **Phase 8 — B2B** : module devis automatique (PDF `DEV-YEAR-ID`, table `quotes`, workflow)
- **Phase 9 — Analytics** : conversions, abandon panier, codes promo
