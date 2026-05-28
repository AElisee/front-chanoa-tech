import Link from 'next/link'
import {
  Shield,
  Lock,
  Camera,
  FileSearch,
  ArrowRight,
  CheckCircle,
  Building2,
  Landmark,
  Hotel,
  Banknote,
  Wifi,
  Eye,
  KeyRound,
  ScanFace,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cybersécurité & Vidéosurveillance — Chanoa Tech',
  description: 'Solutions de sécurité IT : cybersécurité, vidéosurveillance, contrôle d\'accès.',
}

const piliers = [
  {
    icon: Shield,
    title: 'Cybersécurité',
    color: 'bg-red-50 text-red-600 border-red-100',
    items: [
      'Firewall de nouvelle génération (NGFW)',
      'Antivirus et EDR managés',
      'VPN site-à-site et accès distant sécurisé',
      'Filtrage web et protection e-mail',
      'Supervision des événements de sécurité (SIEM)',
    ],
  },
  {
    icon: Lock,
    title: 'Contrôle d\'accès',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    items: [
      'Lecteurs de badges RFID et NFC',
      'Biométrie (empreinte digitale, reconnaissance faciale)',
      'Gestion centralisée des droits et des plages horaires',
      'Interphones IP et visiophone',
      'Journalisation et export des accès',
    ],
  },
  {
    icon: Camera,
    title: 'Vidéosurveillance',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    items: [
      'Caméras IP dôme et bullet (2 MP à 8 MP)',
      'NVR centralisé avec stockage redondant',
      'Vision nocturne et détection de mouvement IA',
      'Accès à distance via application mobile',
      'Rétention vidéo paramétrable (7 à 90 jours)',
    ],
  },
  {
    icon: FileSearch,
    title: 'Audit sécurité',
    color: 'bg-green-50 text-green-600 border-green-100',
    items: [
      'Diagnostic complet de votre infrastructure IT',
      'Test de vulnérabilité réseau et applicatif',
      'Rapport détaillé avec score de risque',
      'Plan de remédiation priorisé',
      'Accompagnement à la mise en conformité',
    ],
  },
]

const produits = [
  {
    icon: Camera,
    marque: 'Hikvision',
    gamme: 'Caméras dôme & bullet',
    desc: 'Leader mondial de la vidéosurveillance — caméras 4K, IA intégrée, compatible ONVIF.',
  },
  {
    icon: Eye,
    marque: 'Dahua',
    gamme: 'NVR & caméras IP',
    desc: 'Enregistreurs réseau jusqu\'à 64 canaux, stockage RAID, accès cloud sécurisé.',
  },
  {
    icon: ScanFace,
    marque: 'Suprema',
    gamme: 'Contrôle d\'accès biométrique',
    desc: 'Lecteurs biométriques haut de gamme, gestion multi-sites, intégration LDAP/AD.',
  },
  {
    icon: KeyRound,
    marque: 'HID Global',
    gamme: 'Badges & lecteurs RFID',
    desc: 'Technologie de référence pour le contrôle d\'accès physique dans les entreprises.',
  },
  {
    icon: Shield,
    marque: 'Fortinet',
    gamme: 'Firewalls FortiGate',
    desc: 'Pare-feu NGFW avec inspection SSL, filtrage web, IDS/IPS et VPN IPSec/SSL.',
  },
  {
    icon: Wifi,
    marque: 'Cisco Meraki',
    gamme: 'Réseau sécurisé cloud-managed',
    desc: 'Infrastructure réseau managée centralement avec visibilité complète et conformité intégrée.',
  },
]

const casUsage = [
  {
    icon: Building2,
    label: 'Entreprises',
    desc: 'Protection des bureaux, contrôle des entrées, sécurisation du réseau interne et des données sensibles.',
  },
  {
    icon: Banknote,
    label: 'Banques',
    desc: 'Vidéosurveillance haute résolution, contrôle d\'accès aux coffres, conformité réglementaire PCI-DSS.',
  },
  {
    icon: Hotel,
    label: 'Hôtels',
    desc: 'Serrures électroniques, gestion des accès par étage, vidéosurveillance des parties communes.',
  },
  {
    icon: Landmark,
    label: 'Administrations',
    desc: 'Sécurisation des accès aux zones sensibles, contrôle des flux, surveillance périmétrique.',
  },
]

export default function SecuritePage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            Sécurité &amp; Conformité
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Sécurité IT complète pour vos locaux et vos données
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Chanoa Tech protège votre entreprise sur tous les fronts : cybersécurité, contrôle
            d&apos;accès physique, vidéosurveillance et audits de conformité — une approche
            globale et intégrée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact-grands-comptes"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
            >
              Demander un audit gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/boutique"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Voir nos produits
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4 piliers ────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Les 4 piliers de notre offre</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une couverture 360° pour sécuriser vos données, vos systèmes et vos espaces physiques.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {piliers.map(({ icon: Icon, title, color, items }) => (
              <div
                key={title}
                className={`bg-white border rounded-xl p-6 hover:shadow-md transition-all ${color.split(' ')[2]}`}
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${color.split(' ')[0]} ${color.split(' ')[1]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-4 text-lg">{title}</h3>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nos solutions produits ───────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nos solutions et marques</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Nous référençons les meilleures marques du marché pour chaque domaine de la sécurité.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {produits.map(({ icon: Icon, marque, gamme, desc }) => (
              <div
                key={marque}
                className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{marque}</p>
                    <p className="text-xs text-gray-400">{gamme}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cas d'usage ───────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ils nous font confiance</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Nos solutions s&apos;adaptent aux exigences de sécurité de chaque secteur d&apos;activité.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {casUsage.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="bg-white border border-gray-100 rounded-xl p-6 text-center hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA finale ───────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sécurisez votre entreprise dès aujourd&apos;hui
          </h2>
          <p className="text-white/80 mb-8">
            Nos experts réalisent un diagnostic complet de votre niveau de sécurité actuel
            et vous remettent un plan d&apos;action concret et chiffré. Premier audit offert.
          </p>
          <Link
            href="/contact-grands-comptes"
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3.5 rounded-lg hover:bg-white/90 transition-colors"
          >
            Demander mon audit de sécurité
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </main>
  )
}
