'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { updateOrderStatusSchema, updateTrackingSchema, updateOrderNotesSchema } from '@/lib/schemas'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import { deliveriesApi } from '@/lib/api/deliveries'

async function getAdminHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function updateOrderStatus(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const result = updateOrderStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  })
  if (!result.success) return

  const { id, status } = result.data
  const headers = await getAdminHeaders()

  try {
    await apiClient.patch(`/orders/${id}`, { status }, { headers })
  } catch (err) {
    console.error('updateOrderStatus:', err)
  }

  revalidatePath(`/admin/commandes/${id}`)
  revalidatePath('/admin/commandes')
  revalidatePath('/admin')
  redirect('/admin/commandes?updated=1')
}

export async function updateTracking(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const result = updateTrackingSchema.safeParse({
    order_id: formData.get('order_id'),
    carrier: (formData.get('carrier') as string)?.trim() || null,
    tracking_number: (formData.get('tracking_number') as string)?.trim() || null,
  })
  if (!result.success) return

  const { order_id, carrier, tracking_number } = result.data
  const headers = await getAdminHeaders()

  try {
    // Tenter de récupérer la livraison existante pour cette commande
    const existing = await apiClient.get<{ id?: string }[]>(
      `/deliveries/commande/${order_id}`,
      { headers },
    )
    const deliveryId = existing.data?.[0]?.id

    if (deliveryId) {
      // Mise à jour de la livraison existante
      await deliveriesApi.update(deliveryId, { carrier, tracking_number })
    } else {
      // Création d'une nouvelle entrée de livraison
      await deliveriesApi.create({ order_id, carrier, tracking_number })
    }
  } catch (err) {
    console.error('updateTracking:', err)
  }

  revalidatePath(`/admin/commandes/${order_id}`)
}

export async function updateOrderNotes(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const result = updateOrderNotesSchema.safeParse({
    id: formData.get('id'),
    notes: (formData.get('notes') as string)?.trim() || null,
  })
  if (!result.success) return

  const { id, notes } = result.data
  const headers = await getAdminHeaders()

  try {
    await apiClient.patch(`/orders/${id}`, { notes }, { headers })
  } catch (err) {
    console.error('updateOrderNotes:', err)
  }

  revalidatePath(`/admin/commandes/${id}`)
}
