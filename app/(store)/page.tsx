import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { buttonVariants } from '@/components/ui/button-variants'
import ProductCard from '@/components/store/ProductCard'
import { productsApi } from '@/lib/api/products'

export const metadata: Metadata = {
  title: 'Chanoa Tech — Store IT Professionnel en Afrique de l\'Ouest',
  description: 'Matériel informatique, serveurs, réseau, visioconférence. Livraison 48-72h en Côte d\'Ivoire. +2000 références Dell, HP, Lenovo.',
  openGraph: {
    title: 'Chanoa Tech — Store IT Professionnel',
    description: 'Équipez vos bureaux, projets et équipes avec du matériel IT professionnel. Livraison rapide en Côte d\'Ivoire.',
  },
}
import {
  ArrowRight, Shield, Truck, Headphones, CheckCircle,
  Monitor, Server, Wifi, Laptop, Video, Lock,
  Building2, GraduationCap, Landmark, CreditCard,
  User, Package, Star, Quote, Download, Mail,
  Computer, HardDrive,
} from 'lucide-react'

// ── Segments clients ───────────────────────────────────────────────
const segments = [
  {
    icon: User,
    label: 'Particuliers',
    desc: 'Équipez-vous avec du matériel professionnel sans compromis.',
    href: '/boutique',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: Building2,
    label: 'Entreprises',
    desc: 'Postes de travail, visio, réseau et sécurité pour vos équipes.',
    href: '/entreprises',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    icon: GraduationCap,
    label: 'Écoles',
    desc: 'Salles informatiques, WiFi campus, écrans interactifs.',
    href: '/ecoles',
    color: 'bg-green-50 text-green-600 border-green-100',
  },
  {
    icon: Landmark,
    label: 'État & Institutions',
    desc: 'Datacenter, infrastructure réseau, contrôle d\'accès.',
    href: '/etat',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    icon: CreditCard,
    label: 'Banques',
    desc: 'Sécurité IT, continuité de service, conformité réglementaire.',
    href: '/contact-grands-comptes',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    icon: Shield,
    label: 'Assurances',
    desc: 'Infrastructure fiable et solutions de sauvegarde certifiées.',
    href: '/contact-grands-comptes',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
]

// ── Packs entreprise ───────────────────────────────────────────────
const packs = [
  {
    title: 'Pack PME',
    badge: 'Populaire',
    badgeColor: 'bg-action text-action-foreground',
    icon: Building2,
    items: ['10 postes Dell Latitude', 'Serveur NAS', 'WiFi entreprise', 'Installation incluse'],
    href: '/packs#pme',
    color: 'border-action/30 hover:border-action',
  },
  {
    title: 'Pack Salle Réunion',
    badge: 'Clé-en-main',
    badgeColor: 'bg-indigo-600 text-white',
    icon: Video,
    items: ['Kit Logitech MTR', 'Samsung TV 75"', 'Caméra conférence', 'Installation incluse'],
    href: '/packs#reunion',
    color: 'border-indigo-200 hover:border-indigo-400',
  },
  {
    title: 'Pack Ministère',
    badge: 'Institutionnel',
    badgeColor: 'bg-orange-600 text-white',
    icon: Landmark,
    items: ['Postes de travail sécurisés', 'Réseau structuré', 'Contrôle d\'accès', 'Vidéosurveillance'],
    href: '/packs#ministere',
    color: 'border-orange-200 hover:border-orange-400',
  },
  {
    title: 'Pack Datacenter',
    badge: 'Sur mesure',
    badgeColor: 'bg-gray-700 text-white',
    icon: Server,
    items: ['Serveurs Dell PowerEdge', 'Virtualisation', 'Stockage & backup', 'Maintenance incluse'],
    href: '/packs#datacenter',
    color: 'border-gray-200 hover:border-gray-500',
  },
]

// ── Catégories rapides ─────────────────────────────────────────────
const categoryPills = [
  { label: 'PC de bureau',          slug: 'pc-de-bureau',          icon: Computer },
  { label: 'Ordinateurs portables', slug: 'ordinateurs-portables', icon: Laptop },
  { label: 'Écrans',                slug: 'ecrans',                icon: Monitor },
  { label: 'Serveurs',              slug: 'serveurs',              icon: Server },
  { label: 'Stockage',              slug: 'stockage',              icon: HardDrive },
  { label: 'Réseau',                slug: 'reseau',                icon: Wifi },
  { label: 'Visioconférence',       slug: 'visioconference',       icon: Video },
  { label: 'Sécurité & Accès',      slug: 'accessoires',           icon: Lock },
]

// ── Témoignages ────────────────────────────────────────────────────
const testimonials = [
  {
    text: 'Nous avons équipé toute notre équipe avec du matériel Dell commandé via Chanoa Tech. La livraison a été rapide et l\'installation parfaite. Un vrai partenaire IT.',
    name: 'Kofi Mensah',
    role: 'DSI, Cabinet conseil Abidjan',
  },
  {
    text: 'Chanoa Tech nous a fourni un kit complet de visioconférence pour nos 3 salles de réunion. Qualité professionnelle, service irréprochable.',
    name: 'Fatou Diallo',
    role: 'Directrice Administrative, ONG Dakar',
  },
  {
    text: 'Nous avons confié l\'équipement de notre salle informatique à Chanoa Tech. Délais respectés, matériel certifié d\'origine constructeur. Recommandé.',
    name: 'Jean-Baptiste Koffi',
    role: 'Proviseur, Lycée technique Abidjan',
  },
]

// ── Trust items ────────────────────────────────────────────────────
const trustItems = [
  { icon: Shield,      title: 'Paiement sécurisé',          desc: 'Wave, Orange Money, MTN, Visa.' },
  { icon: Truck,       title: 'Livraison Afrique de l\'Ouest', desc: 'Livraison soignée partout.' },
  { icon: Headphones,  title: 'Support dédié',               desc: 'Experts IT disponibles pour vous.' },
  { icon: CheckCircle, title: 'Matériel certifié',           desc: 'Origine constructeur garantie.' },
]

export default async function HomePage() {
  let products: import('@/lib/api/products').ProductDto[] = []
  try {
    const result = await productsApi.getProducts({ limit: 8 })
    products = result.data.data
  } catch {
    // Silencieux — la section produits ne s'affiche pas si l'API est indisponible
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-24 text-white">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-action" />
          <div className="absolute -bottom-48 -left-24 h-[400px] w-[400px] rounded-full bg-white" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/80">
            Distributeur IT — Afrique de l'Ouest
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Modernisez votre infrastructure IT{' '}
            <span className="text-action">avant qu'elle ne vous ralentisse</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
            Solutions IT complètes pour entreprises, écoles et institutions.
            Dell, Apple, Cisco, Samsung, Logitech — livrés et installés partout en Afrique de l'Ouest.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 rounded-md bg-action px-7 py-3.5 text-sm font-bold text-action-foreground shadow-lg transition-opacity hover:opacity-90"
            >
              Commander maintenant <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact-grands-comptes"
              className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Obtenir un devis en 24h
            </Link>
            <Link
              href="/contact-grands-comptes?sujet=audit"
              className="inline-flex items-center gap-2 rounded-md px-7 py-3.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              Demander un audit gratuit →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Illustration: pourquoi nous ──────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-linear-to-br from-primary/5 to-action/5">
              <Image
                src="/assets/landing/workplace_chanoa.jpg"
                alt="Espace de travail moderne équipé par Chanoa Tech"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority={false}
              />
              {/* Fallback decorative elements if image fails */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center text-muted-foreground">
                <Package className="h-24 w-24 opacity-20" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-action">
                Pourquoi Chanoa Tech
              </p>
              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                Un partenaire IT local avec{' '}
                <span className="text-action">l&apos;expertise globale</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Nous comprenons les défis uniques du marché ivoirien : infrastructures
                électriques fragiles, besoin de proximité support, contraintes douanières.
                C&apos;est pourquoi nous proposons du matériel neuf sous garantie, livré sous 48-72h,
                avec une assistance technique en français.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Stock réel à Abidjan — livraison 48-72h',
                  'Garantie constructeur + SAV local',
                  'Paiement Mobile Money (Wave, Orange, MTN) + Visa',
                  'Équipe technique certifiée Dell & Cisco',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-action" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/references"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Voir nos références clients <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marques partenaires ──────────────────────────────── */}
      <section className="border-y bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Nos marques partenaires
          </p>
          <div className="grid grid-cols-3 items-center justify-items-center gap-6 sm:grid-cols-4 md:grid-cols-8">
            {[
              { src: '/assets/partners/dell.svg',      alt: 'Dell' },
              { src: '/assets/partners/apple.svg',     alt: 'Apple' },
              { src: '/assets/partners/hp.svg',        alt: 'HP' },
              { src: '/assets/partners/lenovo.svg',    alt: 'Lenovo' },
              { src: '/assets/partners/cisco.svg',     alt: 'Cisco' },
              { src: '/assets/partners/samsung.svg',   alt: 'Samsung' },
              { src: '/assets/partners/logitech.svg',  alt: 'Logitech' },
              { src: '/assets/partners/microsoft.svg', alt: 'Microsoft' },
            ].map(({ src, alt }) => (
              <div key={alt} className="flex h-12 w-full items-center justify-center grayscale opacity-50 transition-all hover:grayscale-0 hover:opacity-100">
                <Image
                  src={src}
                  alt={alt}
                  width={100}
                  height={40}
                  className="h-8 w-auto max-w-25 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Segments clients ──────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-action">
              Nos solutions
            </p>
            <h2 className="text-3xl font-extrabold">Nous équipons tous les secteurs</h2>
            <p className="mt-2 text-muted-foreground">
              Particuliers, entreprises, institutions — une offre IT adaptée à chaque besoin.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {segments.map(({ icon: Icon, label, desc, href, color }) => (
              <Link
                key={label}
                href={href}
                className={`group flex flex-col items-center rounded-xl border p-5 text-center transition-all hover:shadow-md ${color}`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="font-semibold text-sm text-foreground group-hover:underline">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed hidden sm:block">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category pills ────────────────────────────────────── */}
      <section className="border-y bg-muted/40 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categoryPills.map(({ label, slug, icon: Icon }) => (
              <Link
                key={slug}
                href={`/boutique?categorie=${slug}`}
                className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produits populaires ───────────────────────────────── */}
      {products && products.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-action">
                  Catalogue
                </p>
                <h2 className="text-2xl font-bold">Produits populaires</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Les références les plus demandées — matériel certifié d'origine constructeur
                </p>
              </div>
              <Link href="/boutique" className={buttonVariants({ variant: 'outline' })}>
                Voir tout <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Packs entreprise ──────────────────────────────────── */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-action">
              Solutions clés-en-main
            </p>
            <h2 className="text-3xl font-extrabold">Packs entreprise</h2>
            <p className="mt-2 text-muted-foreground">
              Des solutions complètes prêtes à déployer — matériel + installation + support.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {packs.map(({ title, badge, badgeColor, icon: Icon, items, href, color }) => (
              <Link
                key={title}
                href={href}
                className={`group flex flex-col rounded-xl border-2 bg-white p-6 shadow-sm transition-all hover:shadow-md ${color}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeColor}`}>
                    {badge}
                  </span>
                </div>
                <h3 className="mb-3 font-bold text-foreground group-hover:text-primary">{title}</h3>
                <ul className="flex-1 space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary">
                  Voir le pack <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/packs" className={buttonVariants({ variant: 'default' })}>
              Voir tous les packs <Package className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lead magnet ───────────────────────────────────────── */}
      <section className="bg-primary py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-action/20">
              <Download className="h-8 w-8 text-action" />
            </div>
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-action">
            Guide gratuit
          </p>
          <h2 className="mb-3 text-3xl font-extrabold">
            Comment moderniser son infrastructure IT
          </h2>
          <p className="mb-8 text-white/75 leading-relaxed">
            Notre guide complet pour les DSI et responsables IT d'Afrique de l'Ouest.
            Audit, architecture, budgétisation, choix des équipements — tout ce qu'il faut savoir.
          </p>
          <form
            action={`mailto:takiyao@yahoo.fr?subject=Demande guide modernisation IT`}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="Votre adresse email professionnelle"
              className="flex-1 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur focus:border-action focus:bg-white/15"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-action px-6 py-3 text-sm font-bold text-action-foreground transition-opacity hover:opacity-90 whitespace-nowrap"
            >
              Recevoir le guide <Mail className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-3 text-xs text-white/50">
            Gratuit, sans engagement. Réponse sous 24h.
          </p>
        </div>
      </section>

      {/* ── Pourquoi Chanoa Tech ──────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-action">
                Notre différence
              </p>
              <h2 className="mb-4 text-3xl font-extrabold leading-tight">
                Votre partenaire IT de confiance en Afrique
              </h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Chanoa Tech n'est pas une marketplace grand public. C'est une plateforme IT B2B
                conçue pour répondre aux besoins réels des entreprises et institutions africaines.
              </p>
              <ul className="space-y-3">
                {[
                  'Matériel certifié d\'origine constructeur — Dell, Apple, Cisco, Samsung, Logitech',
                  'Offre structurée en 9 univers tech — informatique, réseau, sécurité, visio et plus',
                  'Commandes simples — sans compte requis, devis en 24h',
                  'Logistique maîtrisée — livraison dans toute l\'Afrique de l\'Ouest',
                  'Projets IT clés-en-main — audit, architecture, installation, maintenance',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-action" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/boutique"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Découvrir le catalogue
                </Link>
                <Link
                  href="/contact-grands-comptes"
                  className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-2.5 text-sm font-medium hover:border-primary hover:text-primary"
                >
                  Parler à un expert IT
                </Link>
              </div>
            </div>
            {/* Brands */}
            <div className="grid grid-cols-3 gap-3">
              {['Dell', 'Apple', 'Cisco', 'Samsung', 'Logitech', 'HP', 'Microsoft', 'Poly', 'Hikvision'].map((brand) => (
                <Link
                  key={brand}
                  href={`/boutique?marque=${brand}`}
                  className="flex items-center justify-center rounded-xl border bg-card px-4 py-4 text-sm font-bold text-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="border-y bg-muted/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { value: '2 000+', label: 'Références IT disponibles' },
              { value: '29',     label: 'Marques top constructeurs' },
              { value: '9',      label: 'Univers tech couverts' },
              { value: '5 pays', label: 'Afrique de l\'Ouest' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-xl border bg-white p-5 text-center shadow-sm">
                <p className="text-3xl font-extrabold text-action">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ───────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-action">
              Références
            </p>
            <h2 className="text-2xl font-bold">Ce que disent nos clients</h2>
            <div className="mt-2 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-action text-action" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map(({ text, name, role }) => (
              <div key={name} className="relative rounded-xl border bg-card p-6 shadow-sm">
                <Quote className="absolute right-4 top-4 h-8 w-8 text-muted-foreground/10" />
                <p className="text-sm leading-relaxed text-foreground/80">{text}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────── */}
      <section className="border-t bg-muted/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {trustItems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center rounded-xl border bg-white p-5 text-center shadow-sm">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
