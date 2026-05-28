import Link from 'next/link'
import {
  Computer, Wifi, Monitor, BookOpen, Video, Printer,
  GraduationCap, CheckCircle, ArrowRight, Users, Globe, Server,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solutions Écoles & Universités — Chanoa Tech',
  description: 'Digitalisation des établissements scolaires : salles informatiques, WiFi, écrans interactifs.',
}

const solutions = [
  {
    icon: Computer,
    title: 'Salles informatiques',
    desc: 'Postes de travail robustes, bornes réseau, tables et chaises adaptées. Tout clé en main.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Wifi,
    title: 'WiFi campus',
    desc: 'Couverture sans fil dense et sécurisée pour salles de cours, bibliothèques et résidences.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Monitor,
    title: 'Écrans interactifs',
    desc: "Tableaux blancs interactifs 65–86 pouces, compatibles Android et Windows, pour une pédagogie engagée.",
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: BookOpen,
    title: 'Plateformes pédagogiques',
    desc: 'Déploiement de Moodle, Google Workspace for Education ou Microsoft 365 A pour enseignants et étudiants.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Video,
    title: 'Visioconférence',
    desc: 'Salles de classe hybrides équipées de caméras, micros et systèmes de conférence professionnels.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Printer,
    title: 'Imprimantes réseau',
    desc: "Multifonctions réseau haute cadence, gestion centralisée des droits d'impression, recharges incluses.",
    color: 'bg-rose-50 text-rose-600',
  },
]

const packs = [
  {
    name: 'Pack Salle informatique',
    price: 'À partir de 8 500 000 FCFA',
    items: [
      '20 postes Dell OptiPlex (Core i5, 8 Go RAM, SSD)',
      '1 serveur de fichiers NAS',
      'Switch 24 ports + câblage RJ45',
      'Onduleurs et multiprises protégées',
      'Installation + formation administrateur',
    ],
    highlight: false,
  },
  {
    name: 'Pack WiFi Campus',
    price: 'Sur devis',
    items: [
      'Bornes Wi-Fi 6 Cisco / UniFi',
      'Contrôleur réseau centralisé',
      'Portail captif avec authentification',
      "Couverture jusqu'à 5 000 m²",
      'Support technique 12 mois inclus',
    ],
    highlight: true,
  },
  {
    name: 'Pack Classe numérique',
    price: 'À partir de 2 800 000 FCFA',
    items: [
      'Écran interactif 75" 4K + stylet',
      'Poste enseignant (PC portable i5)',
      'Système de sonorisation intégré',
      'Logiciel de présentation collaboratif',
      'Formation enseignants (1 journée)',
    ],
    highlight: false,
  },
]

const stats = [
  { value: '50+', label: 'Établissements équipés' },
  { value: '5', label: "Pays d'intervention" },
  { value: '2 000+', label: 'Postes déployés' },
  { value: '98%', label: 'Clients satisfaits' },
]

export default function EcolesPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <GraduationCap className="h-4 w-4" />
            Secteur Éducation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Digitalisez votre établissement
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Salles informatiques, WiFi campus, écrans interactifs, plateformes pédagogiques — Chanoa Tech équipe les écoles et universités d'Afrique de l'Ouest de A à Z.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact-grands-comptes"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Demander un devis gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Voir nos produits
            </Link>
          </div>
        </div>
      </section>

      {/* ── Solutions ────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Nos solutions pour l'éducation</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Un catalogue complet pour répondre aux besoins IT des établissements scolaires et universitaires.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packs école ──────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Nos packs école</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Des offres préconfigurées pour démarrer rapidement, adaptables selon votre capacité et vos besoins.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packs.map((pack) => (
              <div
                key={pack.name}
                className={`rounded-2xl p-7 flex flex-col gap-5 border-2 transition-shadow hover:shadow-lg ${
                  pack.highlight
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-900 border-gray-100'
                }`}
              >
                <div>
                  <h3 className={`text-xl font-bold mb-1 ${pack.highlight ? 'text-white' : 'text-primary'}`}>
                    {pack.name}
                  </h3>
                  <p className={`text-sm font-semibold ${pack.highlight ? 'text-orange-300' : 'text-orange-500'}`}>
                    {pack.price}
                  </p>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {pack.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle
                        className={`h-4 w-4 mt-0.5 shrink-0 ${pack.highlight ? 'text-orange-300' : 'text-green-500'}`}
                      />
                      <span className={pack.highlight ? 'text-white/90' : 'text-gray-600'}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact-grands-comptes"
                  className={`inline-flex items-center justify-center gap-2 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors ${
                    pack.highlight
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-primary hover:bg-primary/90 text-white'
                  }`}
                >
                  Demander un devis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chiffres ─────────────────────────────────────── */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-extrabold text-orange-400 mb-1">{value}</div>
                <div className="text-sm text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-4">Prêt à équiper votre établissement ?</h2>
          <p className="text-gray-500 mb-8">
            Un expert Chanoa Tech vous rappelle sous 24h pour analyser vos besoins et vous proposer un devis sur mesure — sans engagement.
          </p>
          <Link
            href="/contact-grands-comptes"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-base"
          >
            Contacter un expert éducation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </main>
  )
}
