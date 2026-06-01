import Link from 'next/link'
import {
  Building2,
  Video,
  Landmark,
  Server,
  ArrowRight,
  CheckCircle,
  Package,
  ChevronDown,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Packs Entreprise Clés-en-main — Chanoa Tech',
  description: 'Packs IT pré-configurés pour PME, salles de réunion, sécurité et datacenter.',
}

const packs = [
  {
    id: 'pme',
    icon: Building2,
    title: 'Pack PME',
    badge: 'Populaire',
    badgeColor: 'bg-orange-500 text-white',
    color: 'border-orange-200',
    accentColor: 'text-orange-500',
    bgColor: 'bg-orange-50',
    subtitle: 'Tout ce qu\'il faut pour démarrer ou moderniser votre infrastructure bureautique.',
    items: [
      '10 postes Dell Latitude Core i5 / 16 Go / SSD 256 Go',
      'Serveur NAS Synology 4 baies (stockage partagé)',
      'Points d\'accès WiFi Ubiquiti (couverture totale des bureaux)',
      'Switch réseau manageable 24 ports',
      'Installation et configuration sur site incluses',
      'Formation utilisateurs (2 h) incluse',
    ],
    prix: 'Sur devis',
    param: 'pme',
  },
  {
    id: 'reunion',
    icon: Video,
    title: 'Pack Salle de Réunion',
    badge: 'Clé-en-main',
    badgeColor: 'bg-indigo-600 text-white',
    color: 'border-indigo-200',
    accentColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    subtitle: 'Transformez votre salle de réunion en espace de collaboration haute définition.',
    items: [
      'Kit Logitech Rally Bar certifié Microsoft Teams & Zoom',
      'Samsung Smart TV 75" 4K (affichage principal)',
      'Caméra conférence 4K grand-angle (120°)',
      'Microphones omnidirectionnels (couverture 6 mètres)',
      'Mini-PC dédié à la salle (Windows 11 Pro)',
      'Installation, câblage et tests inclus',
    ],
    prix: 'Sur devis',
    param: 'reunion',
  },
  {
    id: 'ministere',
    icon: Landmark,
    title: 'Pack Ministère',
    badge: 'Institutionnel',
    badgeColor: 'bg-gray-700 text-white',
    color: 'border-gray-200',
    accentColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    subtitle: 'Infrastructure complète et sécurisée pour administrations, ministères et collectivités.',
    items: [
      'Postes de travail sécurisés (chiffrement disque, BIOS verrouillé)',
      'Réseau structuré avec VLAN et segmentation DMZ',
      'Contrôle d\'accès biométrique et badgeage RFID',
      'Vidéosurveillance IP Hikvision avec NVR centralisé',
      'Firewall Fortinet avec politiques de sécurité administrables',
      'Documentation technique et audit de sécurité initial',
    ],
    prix: 'Sur devis',
    param: 'ministere',
  },
  {
    id: 'datacenter',
    icon: Server,
    title: 'Pack Datacenter',
    badge: 'Sur mesure',
    badgeColor: 'bg-primary text-primary-foreground',
    color: 'border-blue-200',
    accentColor: 'text-primary',
    bgColor: 'bg-blue-50',
    subtitle: 'Architecture datacenter de A à Z : conception, installation, supervision et maintenance.',
    items: [
      'Serveurs Dell PowerEdge (rack ou tour, selon capacité)',
      'Virtualisation VMware vSphere ou Microsoft Hyper-V',
      'Stockage SAN/NAS avec redondance RAID',
      'Backup automatisé Veeam avec réplication hors-site',
      'Onduleurs APC et gestion d\'alimentation redondante',
      'Contrat de maintenance préventive et corrective',
    ],
    prix: 'Sur devis',
    param: 'datacenter',
  },
]

const faqs = [
  {
    q: 'Les prix sont-ils fixes ou négociables ?',
    a: 'Tous nos packs sont proposés sur devis. Le prix final dépend des quantités, des références exactes choisies et de la complexité de l\'installation. Nous établissons un devis détaillé et transparent sous 24 h ouvrées.',
  },
  {
    q: 'Est-il possible de personnaliser un pack ?',
    a: 'Absolument. Les packs sont des bases de départ. Vous pouvez ajouter, retirer ou remplacer n\'importe quel composant. Nos experts vous conseillent pour adapter la solution à votre budget et vos contraintes techniques.',
  },
  {
    q: 'L\'installation et la formation sont-elles incluses ?',
    a: 'Oui, pour les packs PME et Salle de Réunion. Pour les packs Ministère et Datacenter, l\'installation et la formation font l\'objet d\'un volet séparé dans le devis, avec des prestations adaptées à la complexité du projet.',
  },
]

export default function PacksPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Package className="w-4 h-4" />
            4 packs disponibles
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Solutions clés-en-main
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Des packs IT pensés pour chaque besoin : PME, salles de réunion, institutions et
            datacenters. Tout est inclus — matériel, installation et mise en service.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {packs.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="inline-flex items-center gap-1.5 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {p.title}
                <ChevronDown className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packs ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          {packs.map(({ id, icon: Icon, title, badge, badgeColor, color, accentColor, bgColor, subtitle, items, prix, param }) => (
            <div
              key={id}
              id={id}
              className={`bg-white border-2 ${color} rounded-2xl overflow-hidden shadow-sm scroll-mt-24`}
            >
              {/* Header */}
              <div className={`${bgColor} px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-4`}>
                <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${accentColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
              </div>

              {/* Contenu */}
              <div className="px-8 py-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                  Ce qui est inclus
                </h3>
                <ul className="space-y-3 mb-8">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle className={`w-4 h-4 ${accentColor} mt-0.5 shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Prix indicatif</p>
                    <p className="text-2xl font-bold text-gray-900">{prix}</p>
                  </div>
                  <Link
                    href={`/contact-grands-comptes?pack=${param}`}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Demander un devis pour ce pack
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-white border border-gray-100 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-500 mb-4">Vous avez d&apos;autres questions ?</p>
            <Link
              href="/contact-grands-comptes"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contacter notre équipe
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
