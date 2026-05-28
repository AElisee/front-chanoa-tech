import Link from 'next/link'
import {
  Server,
  Layers,
  HardDrive,
  Shield,
  RotateCcw,
  Network,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  Cpu,
  Wrench,
  HeartHandshake,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Expertise Datacenter — Chanoa Tech',
  description: 'Serveurs, virtualisation, stockage et solutions de backup pour datacenters.',
}

const solutions = [
  {
    icon: Server,
    title: 'Serveurs Dell PowerEdge',
    desc: 'Serveurs rack et tour certifiés entreprise, configurés selon vos workloads : virtualisation, bases de données, ERP.',
  },
  {
    icon: Layers,
    title: 'Virtualisation',
    desc: 'Déploiement VMware vSphere, Microsoft Hyper-V ou Proxmox — consolidation des serveurs, haute disponibilité et migration à chaud.',
  },
  {
    icon: HardDrive,
    title: 'Stockage (NAS / SAN)',
    desc: 'Baies de stockage Synology, Dell et HPE avec RAID, tiering SSD/HDD, snapshots automatiques et réplication synchrone.',
  },
  {
    icon: Shield,
    title: 'Sécurité réseau',
    desc: 'Firewalls Fortinet et Cisco, IDS/IPS, segmentation VLAN, politique Zero Trust et supervision des flux en temps réel.',
  },
  {
    icon: RotateCcw,
    title: 'Backup & Plan de reprise',
    desc: 'Solutions Veeam Backup & Replication, RTO/RPO définis contractuellement, tests de restauration réguliers.',
  },
  {
    icon: Network,
    title: 'Réseau structuré',
    desc: 'Câblage Cat6A/fibre optique, armoires de brassage, commutateurs core Cisco Catalyst — architecture documentée et évolutive.',
  },
]

const etapes = [
  {
    num: '01',
    icon: ClipboardList,
    title: 'Audit',
    desc: 'Analyse de votre infrastructure existante, cartographie des flux, identification des risques et des besoins de montée en charge.',
  },
  {
    num: '02',
    icon: Cpu,
    title: 'Architecture',
    desc: 'Conception du schéma réseau, dimensionnement des serveurs et du stockage, rédaction du cahier des charges technique.',
  },
  {
    num: '03',
    icon: Wrench,
    title: 'Installation',
    desc: 'Déploiement physique et logiciel en site, câblage, configuration des équipements, tests de charge et de basculement.',
  },
  {
    num: '04',
    icon: HeartHandshake,
    title: 'Maintenance',
    desc: 'Contrat de maintenance préventive et corrective, supervision 24/7 disponible, mises à jour firmware et patches de sécurité.',
  },
]

const marques = [
  { name: 'Dell Technologies', desc: 'Serveurs, stockage, networking' },
  { name: 'Cisco', desc: 'Commutateurs, routeurs, firewall' },
  { name: 'VMware', desc: 'Virtualisation, vSphere, NSX' },
  { name: 'HPE', desc: 'ProLiant, Nimble Storage, Aruba' },
  { name: 'Veeam', desc: 'Backup & Replication' },
  { name: 'Fortinet', desc: 'Firewalls FortiGate, SIEM' },
]

export default function DatacenterPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Server className="w-4 h-4" />
            Intégration Datacenter
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Expertise Datacenter&nbsp;&amp;&nbsp;Infrastructure
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            De l&apos;audit initial à la maintenance long terme, Chanoa Tech prend en charge chaque
            étape de votre projet datacenter : architecture, installation, virtualisation,
            stockage et sécurité réseau.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact-grands-comptes"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
            >
              Discuter de mon projet
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/packs#datacenter"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Voir le Pack Datacenter
            </Link>
          </div>
        </div>
      </section>

      {/* ── Solutions ────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nos solutions datacenter</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Un catalogue de compétences couvrant l&apos;ensemble du stack infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {solutions.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition-all flex gap-4"
              >
                <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Étapes d'un projet ───────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Les étapes d&apos;un projet</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une méthodologie éprouvée pour livrer des infrastructures fiables dans les délais.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {etapes.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="bg-white border border-gray-100 rounded-xl p-6 relative">
                <div className="text-5xl font-black text-gray-100 absolute top-4 right-5 select-none leading-none">
                  {num}
                </div>
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

      {/* ── Marques partenaires ───────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nos marques partenaires</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Nous travaillons exclusivement avec des équipements de marques reconnues mondialement.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {marques.map(({ name, desc }) => (
              <div
                key={name}
                className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center hover:bg-gray-100 transition-colors"
              >
                <p className="font-bold text-gray-800 text-sm mb-1">{name}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bénéfices ────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Étude de faisabilité gratuite',
              'Livrables documentés à chaque phase',
              'Tests et recette avant mise en production',
              'Support technique local post-installation',
              'Garantie constructeur gérée par Chanoa Tech',
              'Évolutivité architecturale planifiée',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA finale ───────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à lancer votre projet infrastructure&nbsp;?
          </h2>
          <p className="text-gray-500 mb-8">
            Que vous construisiez votre premier datacenter ou que vous modernisiez une
            infrastructure existante, nos ingénieurs vous accompagnent de la conception
            à la mise en service.
          </p>
          <Link
            href="/contact-grands-comptes"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Demander une étude de faisabilité
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </main>
  )
}
