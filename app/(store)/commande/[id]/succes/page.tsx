import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}

// GeniusPay redirige ici après un paiement réussi.
// On transfère tous les paramètres reçus vers la page de confirmation principale.
export default async function SuccesPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams

  const qs = new URLSearchParams({ ...sp, status: 'success' }).toString()
  redirect(`/commande/${id}?${qs}`)
}
