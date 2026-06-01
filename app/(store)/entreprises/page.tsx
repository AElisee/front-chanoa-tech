import Link from 'next/link'
import {
  Monitor,
  Video,
  Shield,
  Wifi,
  Lock,
  HardDrive,
  ArrowRight,
  CheckCircle,
  Building2,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solutions Entreprises — Chanoa Tech',
  description: 'Équipement IT professionnel pour entreprises en Côte d\'Ivoire : postes de travail, visioconférence, réseau, sécurité.',
}

const solutions = [
  {
    icon: Monitor,
    title: 'Postes de travail',
    desc: 'Ordinateurs fixes et portables professionnels (Dell, HP, Lenovo) adaptés à chaque métier — bureautique, CAO, finance.',
  },
  {
    icon: Video,
    title: 'Visioconférence',
    desc: 'Kits de salle de réunion tout-en-un : barre de son, caméra 4K, écran interactif, compatibles Teams et Zoom.',
  },
  {
    icon: Shield,
    title: 'Sécurité informatique',
    desc: 'Firewalls Fortinet, antivirus entreprise, VPN managé et audits de sécurité pour protéger vos données critiques.',
  },
  {
    icon: Wifi,
    title: 'Réseau entreprise',
    desc: 'Infrastructure WiFi Cisco/Ubiquiti, câblage structuré, VLAN, QoS — pour un réseau fiable sur tous vos sites.',
  },
  {
    icon: Lock,
    title: 'Contrôle d\'accès',
    desc: 'Badges RFID, lecteurs biométriques, gestion centralisée des droits d\'accès pour sécuriser vos locaux.',
  },
  {
    icon: HardDrive,
    title: 'Sauvegarde & Backup',
    desc: 'NAS Synology, solutions de backup cloud et on-premise, plans de reprise d\'activité (PRA) adaptés à votre criticité.',
  },
]

const featuredProducts = [
  {
    name: 'Dell Latitude 5540',
    brand: 'Dell',
    category: 'Ordinateur portable',
    description: 'Processeur Intel Core i5/i7, 16 Go RAM, SSD 512 Go — idéal pour la bureautique intensive.',
  },
  {
    name: 'Dell Precision 3680',
    brand: 'Dell',
    category: 'Workstation',
    description: 'Station de travail haute performance pour CAO, modélisation 3D et traitement vidéo.',
  },
  {
    name: 'MacBook Pro 14"',
    brand: 'Apple',
    category: 'Ordinateur portable',
    description: 'Puce M3 Pro, 18 Go RAM unifiée, autonomie 18h — pour les équipes créatives et techniques.',
  },
  {
    name: 'Samsung Smart TV 75"',
    brand: 'Samsung',
    category: 'Affichage professionnel',
    description: 'Écran 4K UHD, compatible HDMI/USB-C, idéal pour salles de réunion et espaces communs.',
  },
  {
    name: 'Logitech Rally Bar',
    brand: 'Logitech',
    category: 'Visioconférence',
    description: 'Barre tout-en-un certifiée Teams et Zoom, caméra 4K, micro omnidirectionnel 6 m.',
  },
  {
    name: 'Caméra IP Hikvision DS-2CD',
    brand: 'Hikvision',
    category: 'Vidéosurveillance',
    description: 'Caméra dôme 4 MP, vision nocturne, PoE, compatible NVR — pour la sécurité de vos locaux.',
  },
]

const avantages = [
  'Devis personnalisé sous 24 h',
  'Livraison et installation sur site',
  'Garantie et SAV assuré localement',
  'Financement professionnel disponible',
]

export default function EntreprisesPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Building2 className="w-4 h-4" />
            Solutions B2B
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Solutions IT pour entreprises
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Postes de travail, visioconférence, réseau structuré et sécurité — Chanoa Tech équipe
            vos bureaux de A à Z avec du matériel professionnel et un accompagnement local.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/boutique"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
            >
              Voir nos produits
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact-grands-comptes"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Obtenir un devis
            </Link>
          </div>
        </div>
      </section>

      {/* ── Avantages rapides ─────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6">
          {avantages.map((a) => (
            <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              {a}
            </div>
          ))}
        </div>
      </section>

      {/* ── Solutions ────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nos domaines d&apos;expertise</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une offre complète pour couvrir l&apos;ensemble des besoins IT de votre entreprise.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produits recommandés ──────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Produits recommandés</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une sélection de références plébiscitées par nos clients entreprises.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((p) => (
              <Link
                key={p.name}
                href="/boutique"
                className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all block"
              >
                <div className="text-xs font-medium text-primary bg-primary/8 px-2.5 py-1 rounded-full inline-block mb-3">
                  {p.category}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-400 mb-3 font-medium">{p.brand}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{p.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                  Voir en boutique <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA finale ───────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Un projet IT pour votre entreprise&nbsp;?
          </h2>
          <p className="text-gray-500 mb-8">
            Nos experts analysent vos besoins et vous proposent une solution sur-mesure avec
            installation et support local. Réponse garantie sous 24 h ouvrées.
          </p>
          <Link
            href="/contact-grands-comptes"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Parler à un expert
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </main>
  )
}
