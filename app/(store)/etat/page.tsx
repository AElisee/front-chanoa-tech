import Link from 'next/link'
import {
  Landmark, Building2, CreditCard, HeartPulse, GraduationCap, Users,
  Server, Wifi, Camera, Lock, Monitor, BookOpen,
  CheckCircle, ArrowRight, ShieldCheck, Clock, Award, Headphones,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solutions État & Institutions — Chanoa Tech',
  description: 'Intégrateur IT pour ministères, collectivités et administrations publiques.',
}

const cibles = [
  {
    icon: Landmark,
    title: 'Ministères',
    desc: 'Infrastructure IT nationale, postes sécurisés, datacenters souverains.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Building2,
    title: 'Mairies & Collectivités',
    desc: 'Réseaux locaux, imprimantes réseau, systèmes de gestion documentaire.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: CreditCard,
    title: 'Banques & Assurances',
    desc: 'Sécurité périmétrique, PCA/PRA, conformité BCEAO et réglementaire.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: HeartPulse,
    title: 'Hôpitaux',
    desc: 'Informatique médicale, réseau câblé fiable, onduleurs haute disponibilité.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: GraduationCap,
    title: 'Universités publiques',
    desc: 'Salles informatiques massifiées, WiFi campus, plateformes LMS.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Users,
    title: 'Services publics',
    desc: 'Guichets numérisés, imprimantes industrielles, sécurisation des accès.',
    color: 'bg-yellow-50 text-yellow-600',
  },
]

const solutionsProposees = [
  { icon: Server, title: 'Infrastructure réseau', desc: 'LAN/WAN sécurisé, switches managés, routeurs, fibres optiques et raccordements.' },
  { icon: Server, title: 'Datacenter & Serveurs', desc: 'Baies rack, serveurs Dell PowerEdge, stockage NAS/SAN, virtualisation VMware.' },
  { icon: Camera, title: 'Vidéosurveillance', desc: 'Caméras IP 4K intérieur/extérieur, NVR centralisé, accès sécurisé à distance.' },
  { icon: Lock, title: "Contrôle d'accès", desc: 'Badges RFID, lecteurs biométriques, portiques et gestion centralisée des accès.' },
  { icon: Monitor, title: 'Postes de travail sécurisés', desc: 'Stations sécurisées, chiffrement disque, GPO déployées, antivirus entreprise.' },
  { icon: BookOpen, title: 'Formation & support', desc: 'Formation des agents IT, support sur site 8/5, contrat de maintenance annuel.' },
]

const arguments_ = [
  {
    icon: Award,
    title: "Expérience marchés publics",
    desc: "Plus de 10 ans d'expérience sur des appels d'offres publics en Côte d'Ivoire et dans la sous-région CEDEAO.",
  },
  {
    icon: ShieldCheck,
    title: "Matériel certifié",
    desc: "Uniquement des équipements de marques reconnues (Dell, Cisco, HP, Hikvision) avec garanties constructeur.",
  },
  {
    icon: Clock,
    title: "Délais garantis",
    desc: "Planification rigoureuse, équipes dédiées sur site, respect des jalons contractuels sans dépassement.",
  },
  {
    icon: Headphones,
    title: "SAV local",
    desc: "Techniciens basés en Côte d'Ivoire, stock de pièces détachées disponible, intervention sous 48h ouvrées.",
  },
]

export default function EtatPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Landmark className="h-4 w-4" />
            Secteur Public & Institutionnel
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Partenaire IT des institutions publiques
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Ministères, collectivités, administrations, banques — Chanoa Tech vous accompagne dans la transformation numérique de vos structures avec des solutions robustes et conformes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact-grands-comptes"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Demander un audit gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/references"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Voir nos références
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cibles ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Nous intervenons dans tous les secteurs publics</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Notre équipe maîtrise les contraintes spécifiques à chaque type d'institution : sécurité, conformité, continuité de service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cibles.map(({ icon: Icon, title, desc, color }) => (
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

      {/* ── Solutions proposées ──────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Nos solutions pour le secteur public</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              De l'infrastructure réseau au contrôle d'accès, nous couvrons l'intégralité des besoins IT de votre institution.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutionsProposees.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow flex gap-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi Chanoa Tech ─────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Pourquoi Chanoa Tech pour le secteur public ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Quatre raisons pour lesquelles les institutions nous choisissent et nous renouvellent leur confiance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {arguments_.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-5 items-start p-6 rounded-xl border hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-50 text-orange-500 shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="py-20 px-4 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Votre prochain projet IT institutionnel</h2>
          <p className="text-white/80 mb-8">
            Nos experts vous proposent un audit de vos infrastructures existantes et un plan d'équipement adapté à votre budget — gratuitement et sans engagement.
          </p>
          <Link
            href="/contact-grands-comptes"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-base"
          >
            Contacter un expert institutionnel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </main>
  )
}
