import Link from 'next/link'
import {
  Building2, GraduationCap, Landmark, CreditCard, Heart, Hotel,
  Star, Quote, ArrowRight, Users,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nos Références — Chanoa Tech',
  description: 'Cas clients, secteurs d\'intervention et témoignages de nos partenaires.',
}

const secteurs = [
  { icon: Building2, label: 'Entreprises', count: '45+', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { icon: GraduationCap, label: 'Écoles & Universités', count: '30+', color: 'bg-green-50 text-green-600 border-green-100' },
  { icon: Landmark, label: 'Administrations', count: '12+', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { icon: CreditCard, label: 'Banques & Assurances', count: '8+', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { icon: Heart, label: 'ONG & Associations', count: '15+', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { icon: Hotel, label: 'Hôtels & Tourisme', count: '6+', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
]

const temoignages = [
  {
    name: 'Kouamé Assi Didier',
    role: 'Directeur des Systèmes d\'Information',
    organisation: 'Groupe scolaire Les Palmiers, Abidjan',
    content:
      "Chanoa Tech a livré notre salle informatique de 25 postes en moins de 3 semaines. L'équipe a assuré l'installation complète du réseau et la formation de nos enseignants. Depuis, zéro panne critique — exactement ce qu'on attendait.",
  },
  {
    name: 'Fatoumata Bamba',
    role: 'Responsable Informatique',
    organisation: 'Coopérative agricole COOPAG-CI, Bouaké',
    content:
      "Nous avions besoin de moderniser nos équipements de bureau sans exploser notre budget. Chanoa Tech nous a proposé une solution complète — ordinateurs, imprimantes réseau et WiFi — avec un suivi après-vente réactif. Je recommande sans hésiter.",
  },
  {
    name: 'Amadou Traoré',
    role: 'Chargé des achats IT',
    organisation: 'Direction régionale du Trésor, Yamoussoukro',
    content:
      "Premier fournisseur avec qui nous avons travaillé en toute sérénité pour un marché public. Facturation conforme, matériel certifié, délais respectés. Le contrat de maintenance annuel est un vrai plus pour notre équipe.",
  },
]

const partenaires = [
  'Dell',
  'Cisco',
  'Apple',
  'Samsung',
  'Logitech',
  'HP',
  'Hikvision',
  'Microsoft',
]

export default function ReferencesPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Users className="h-4 w-4" />
            Références clients
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Ils nous font confiance
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Plus de 100 organisations en Afrique de l'Ouest ont choisi Chanoa Tech pour équiper et sécuriser leurs infrastructures IT. Découvrez leurs témoignages.
          </p>
        </div>
      </section>

      {/* ── Secteurs ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Nos secteurs d'intervention</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une expertise transversale pour accompagner tous types d'organisations dans leur transformation numérique.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {secteurs.map(({ icon: Icon, label, count, color }) => (
              <div
                key={label}
                className={`flex flex-col items-center text-center p-5 rounded-xl border ${color} hover:shadow-md transition-shadow`}
              >
                <Icon className="h-7 w-7 mb-3" />
                <div className="text-2xl font-extrabold mb-1">{count}</div>
                <div className="text-xs font-medium leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Ce que disent nos clients</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Des témoignages authentiques de responsables IT, directeurs et acheteurs qui ont fait confiance à Chanoa Tech.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {temoignages.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border p-7 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <Quote className="h-8 w-8 text-orange-400" />
                <p className="text-gray-600 text-sm leading-relaxed flex-1">"{t.content}"</p>
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                  <div className="text-xs text-primary font-medium mt-0.5">{t.organisation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Logos partenaires ────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary mb-3">Nos partenaires marques</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Nous distribuons et intégrons uniquement des équipements de marques certifiées, avec garanties constructeur officielles.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {partenaires.map((marque) => (
              <div
                key={marque}
                className="flex items-center justify-center h-20 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors"
              >
                <span className="text-gray-400 font-semibold text-lg tracking-wide">{marque}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="py-20 px-4 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Votre projet IT ?</h2>
          <p className="text-white/80 mb-8">
            Rejoignez les 100+ organisations qui font confiance à Chanoa Tech. Décrivez-nous votre projet — un expert vous répond sous 24h.
          </p>
          <Link
            href="/contact-grands-comptes"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-base"
          >
            Parler à un expert
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </main>
  )
}
