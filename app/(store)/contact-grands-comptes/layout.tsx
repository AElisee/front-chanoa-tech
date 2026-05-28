import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Grands Comptes — Chanoa Tech',
  description: "Formulaire de demande de devis pour projets IT d'envergure.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
