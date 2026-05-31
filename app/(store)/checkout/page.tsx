'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ShieldCheck, Truck, Phone, MapPin, Mail, User, FileText, Loader2, CreditCard, Banknote } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/hooks/useCart'
import { formatFCFA } from '@/lib/utils/format'
import { placeOrder } from './actions'

type PaymentMethod = 'genius_pay' | 'cash_on_delivery'

export default function CheckoutPage() {
  const { items, total, itemCount } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('genius_pay')

  if (!submitted && itemCount === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium">Votre panier est vide.</p>
        <Link href="/boutique" className={buttonVariants()}>
          Retour à la boutique
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitted(true)

    const fd = new FormData(e.currentTarget)
    fd.set('cart', JSON.stringify(
      items.map((i) => ({ id: i.id, variantId: i.variantId, variantLabel: i.variantLabel, name: i.name, price: i.price, quantity: i.quantity, slug: i.slug }))
    ))
    if (!fd.get('address')) fd.set('address', '')

    const result = await placeOrder(fd)

    if (!result.ok) {
      // Erreur : masquer le loader et afficher le message
      setSubmitting(false)
      setSubmitted(false)
      window.location.href = `/checkout?error=${encodeURIComponent(result.error)}`
      return
    }

    // Succès : naviguer vers l'URL de redirection
    // window.location.href fonctionne pour les URLs internes ET externes (GeniusPay)
    window.location.href = result.redirectUrl
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-5 text-lg font-semibold text-foreground">Traitement de votre commande…</p>
        <p className="mt-1 text-sm text-muted-foreground">Veuillez ne pas fermer cette page.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Finaliser la commande</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Aucun compte requis — remplissez vos coordonnées et confirmez.
      </p>

      <form onSubmit={handleSubmit} id="checkout-form">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* ── Contact + livraison ───────────────────────────── */}
          <div className="space-y-6 lg:col-span-3">
            {/* Contact */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Vos coordonnées
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Adresse e-mail <span className="text-destructive">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Votre numéro de commande vous sera envoyé à cette adresse.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Nom complet
                    <span className="ml-1 text-xs text-muted-foreground font-normal">(optionnel)</span>
                  </label>
                  <input
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    placeholder="Prénom Nom"
                    className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Numéro de téléphone <span className="text-destructive">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+225 01 23 45 67 89"
                    className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Lieu de livraison
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Commune de livraison <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="city"
                    required
                    className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                    defaultValue=""
                  >
                    <option value="" disabled>Choisissez votre commune…</option>
                    <option value="Abobo">Abobo</option>
                    <option value="Adjamé">Adjamé</option>
                    <option value="Anyama">Anyama</option>
                    <option value="Attécoubé">Attécoubé</option>
                    <option value="Bingerville">Bingerville</option>
                    <option value="Cocody">Cocody</option>
                    <option value="Koumassi">Koumassi</option>
                    <option value="Marcory">Marcory</option>
                    <option value="Plateau">Plateau</option>
                    <option value="Port-Bouët">Port-Bouët</option>
                    <option value="Songon">Songon</option>
                    <option value="Treichville">Treichville</option>
                    <option value="Yopougon">Yopougon</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Livraison partout à Abidjan — <span className="font-semibold text-foreground">1 500 FCFA</span>
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Précisions de livraison
                    <span className="ml-1 text-xs text-muted-foreground font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Quartier, repère, instructions pour le livreur…"
                    className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Payment method */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Mode de paiement
              </h2>
              <input type="hidden" name="payment_method" value={paymentMethod} />
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    paymentMethod === 'genius_pay'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method_radio"
                    value="genius_pay"
                    checked={paymentMethod === 'genius_pay'}
                    onChange={() => setPaymentMethod('genius_pay')}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Paiement en ligne</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Wave, Orange Money, MTN, Moov, Visa/Mastercard — sécurisé via GeniusPay.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method_radio"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Paiement à la livraison</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Réglez en espèces au livreur à la réception du colis.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* Info banner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
              <p className="font-medium">Comment ça marche ?</p>
              <ol className="mt-2 list-decimal pl-4 space-y-1 text-blue-700">
                <li>Vous confirmez votre demande ci-dessous.</li>
                {paymentMethod === 'genius_pay' ? (
                  <>
                    <li>Vous êtes redirigé vers la page de paiement sécurisée (Wave, Orange Money, MTN, Visa).</li>
                    <li>Livraison organisée dès réception du paiement.</li>
                  </>
                ) : (
                  <>
                    <li>Notre équipe vous appelle sous 24h pour confirmer la commande.</li>
                    <li>Livraison à votre adresse — vous réglez le livreur en espèces.</li>
                  </>
                )}
              </ol>
            </div>
          </div>

          {/* ── Récapitulatif ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-semibold">
                  Récapitulatif ({itemCount} article{itemCount > 1 ? 's' : ''})
                </h2>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground/40" />
                          </div>
                        )}
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFCFA(item.price)} / u</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatFCFA(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totaux */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatFCFA(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison (Abidjan)</span>
                    <span>{formatFCFA(1500)}</span>
                  </div>
                </div>

                <Separator className="my-3" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg text-action">{formatFCFA(total + 1500)}</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-action px-4 py-3 text-sm font-bold text-action-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Traitement…
                    </>
                  ) : paymentMethod === 'genius_pay' ? (
                    'Payer en ligne'
                  ) : (
                    'Commander — paiement à la livraison'
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {paymentMethod === 'genius_pay'
                    ? 'Vous serez redirigé vers la page de paiement sécurisée.'
                    : "Notre équipe vous contactera pour confirmer la commande avant la livraison."}
                </p>
              </div>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-2 rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex flex-col items-center gap-1 text-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Paiement sécurisé</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Livraison Afrique</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Support expert</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
