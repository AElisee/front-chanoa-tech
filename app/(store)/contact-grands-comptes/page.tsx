'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Phone, Mail, MapPin, Clock, CheckCircle, ArrowRight, Send,
  ShieldCheck, Headphones, FileText,
} from 'lucide-react'

const typeOptions = [
  'Entreprise PME',
  'Grande entreprise',
  'École / Université',
  'Ministère / Administration',
  'Banque / Assurance',
  'ONG',
  'Autre',
]

const budgetOptions = [
  '< 1 000 000 FCFA',
  '1M - 5M FCFA',
  '5M - 20M FCFA',
  '> 20M FCFA',
  'Budget à définir',
]

const avantages = [
  { icon: Clock, title: 'Devis en 24h', desc: 'Réponse garantie le jour ouvré suivant votre demande.' },
  { icon: Headphones, title: 'Expert dédié', desc: 'Un interlocuteur unique pour toute la durée de votre projet.' },
  { icon: FileText, title: 'Audit gratuit', desc: 'Analyse de vos besoins et recommandations sans engagement.' },
]

const coordonnees = [
  { icon: Phone, label: 'Téléphone', value: '07 55 77 44 55' },
  { icon: Mail, label: 'Email', value: 'takiyao@yahoo.fr' },
  { icon: MapPin, label: 'Adresse', value: 'Abidjan, Cocody — Côte d\'Ivoire' },
]

interface FormState {
  nom: string
  organisation: string
  email: string
  telephone: string
  typeOrganisation: string
  budget: string
  description: string
}

const initialForm: FormState = {
  nom: '',
  organisation: '',
  email: '',
  telephone: '',
  typeOrganisation: '',
  budget: '',
  description: '',
}

export default function ContactGrandsComptesPage() {
  return (
    <Suspense fallback={null}>
      <ContactGrandsComptesForm />
    </Suspense>
  )
}

function ContactGrandsComptesForm() {
  const searchParams = useSearchParams()
  const [form, setForm] = useState<FormState>(() => {
    const produit = searchParams?.get('produit')
    const ref = searchParams?.get('ref')
    if (!produit) return initialForm
    const refSuffix = ref ? ` (Réf. ${ref})` : ''
    return {
      ...initialForm,
      description: `Je souhaite obtenir un devis pour : ${produit}${refSuffix}.\n\nQuantité souhaitée :\nDélai souhaité :\nAutres précisions :`,
    }
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const body = [
      `Nom complet : ${form.nom}`,
      `Organisation : ${form.organisation}`,
      `Email : ${form.email}`,
      `Téléphone : ${form.telephone || 'Non renseigné'}`,
      `Type d'organisation : ${form.typeOrganisation || 'Non renseigné'}`,
      `Budget estimé : ${form.budget || 'Non renseigné'}`,
      ``,
      `Description du projet :`,
      form.description,
    ].join('\n')

    const subject = encodeURIComponent(`Demande grands comptes — ${form.organisation}`)
    const bodyEncoded = encodeURIComponent(body)
    const mailtoHref = `mailto:takiyao@yahoo.fr?subject=${subject}&body=${bodyEncoded}`

    // Open mailto then mark as submitted
    window.location.href = mailtoHref

    // Small delay to let mailto open before showing confirmation
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Send className="h-4 w-4" />
            Grands Comptes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Parlons de votre projet IT
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Devis personnalisé en 24h · Audit gratuit · Expert dédié du premier contact à la livraison.
          </p>
        </div>
      </section>

      {/* ── Formulaire + infos ───────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Formulaire */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border p-8 shadow-sm">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-5">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-9 w-9 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
                    <p className="text-gray-500 max-w-sm">
                      Votre demande a bien été transmise. Un expert Chanoa Tech vous recontacte sous 24h ouvrées.
                    </p>
                  </div>
                  <button
                    onClick={() => { setForm(initialForm); setSubmitted(false) }}
                    className="mt-2 text-sm text-primary underline underline-offset-2 hover:no-underline"
                  >
                    Soumettre une autre demande
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Décrivez votre projet</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="nom">
                          Nom complet <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="nom"
                          name="nom"
                          type="text"
                          required
                          value={form.nom}
                          onChange={handleChange}
                          placeholder="Jean Kouassi"
                          className="w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="organisation">
                          Entreprise / Organisation <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="organisation"
                          name="organisation"
                          type="text"
                          required
                          value={form.organisation}
                          onChange={handleChange}
                          placeholder="Groupe Scolaire ABC"
                          className="w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                          Email professionnel <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="j.kouassi@monentreprise.ci"
                          className="w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="telephone">
                          Téléphone
                        </label>
                        <input
                          id="telephone"
                          name="telephone"
                          type="tel"
                          value={form.telephone}
                          onChange={handleChange}
                          placeholder="07 55 77 44 55"
                          className="w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="typeOrganisation">
                          Type d'organisation
                        </label>
                        <select
                          id="typeOrganisation"
                          name="typeOrganisation"
                          value={form.typeOrganisation}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        >
                          <option value="">Sélectionner...</option>
                          {typeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="budget">
                          Budget estimé
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          value={form.budget}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        >
                          <option value="">Sélectionner...</option>
                          {budgetOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="description">
                        Description du projet
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Décrivez votre besoin : nombre de postes, type d'infrastructure, délai souhaité, contraintes particulières..."
                        className="w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer ma demande
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      En soumettant ce formulaire, votre client mail s'ouvrira pour envoyer la demande à notre équipe.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Colonne droite */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Coordonnées */}
            <div className="bg-white rounded-2xl border p-7 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-5 text-base">Nos coordonnées</h3>
              <ul className="space-y-4">
                {coordonnees.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                      <div className="text-sm font-medium text-gray-800">{value}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avantages */}
            <div className="bg-primary text-white rounded-2xl p-7 shadow-sm flex flex-col gap-5">
              <h3 className="font-bold text-base">Pourquoi nous contacter ?</h3>
              {avantages.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3 items-start">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-orange-300 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{title}</div>
                    <div className="text-xs text-white/70 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Badge confiance */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex gap-3 items-start">
              <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                <span className="font-semibold">Vos données sont protégées.</span> Nous n'utilisons vos informations que pour répondre à votre demande — jamais revendues à des tiers.
              </p>
            </div>
          </div>

        </div>
      </section>

    </main>
  )
}
