import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-[#1A1A2E] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-3">
              <Image src="/assets/logos/chanotech.jpeg" alt="Chanoa Tech" width={180} height={54} className="h-14 w-auto object-contain" />
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Votre partenaire IT professionnel en Afrique de l&apos;Ouest.
              Matériel, intégration et accompagnement.
            </p>
          </div>

          {/* Boutique — aligned with Header categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Boutique
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/boutique" className="hover:text-white transition-colors">Catalogue</Link></li>
              <li><Link href="/boutique?categorie=ordinateurs-portables" className="hover:text-white transition-colors">Ordinateurs portables</Link></li>
              <li><Link href="/boutique?categorie=ecrans" className="hover:text-white transition-colors">Écrans</Link></li>
              <li><Link href="/boutique?categorie=serveurs" className="hover:text-white transition-colors">Serveurs</Link></li>
              <li><Link href="/boutique?categorie=reseau" className="hover:text-white transition-colors">Réseau</Link></li>
              <li><Link href="/boutique?categorie=accessoires" className="hover:text-white transition-colors">Accessoires</Link></li>
            </ul>
          </div>

          {/* Solutions B2B */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Solutions
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/entreprises" className="hover:text-white transition-colors">Entreprises</Link></li>
              <li><Link href="/ecoles" className="hover:text-white transition-colors">Écoles</Link></li>
              <li><Link href="/etat" className="hover:text-white transition-colors">État & Institutions</Link></li>
              <li><Link href="/datacenter" className="hover:text-white transition-colors">Datacenter</Link></li>
              <li><Link href="/packs" className="hover:text-white transition-colors">Packs entreprise</Link></li>
              <li><Link href="/references" className="hover:text-white transition-colors">Références</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>takiyao@yahoo.fr</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>07 55 77 44 55</span>
              </li>
            </ul>
            <div className="mt-4">
              <Link
                href="/contact-grands-comptes"
                className="inline-block rounded-md bg-[#E94560] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d63d56] transition-colors"
              >
                Demander un devis
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Chanoa Tech — Groupe Chanoa. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
