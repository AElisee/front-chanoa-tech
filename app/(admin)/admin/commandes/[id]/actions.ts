'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { guardAdmin } from '@/lib/supabase/server'
import { updateOrderStatusSchema, updateTrackingSchema, updateOrderNotesSchema } from '@/lib/schemas'

export async function updateOrderStatus(formData: FormData) {
  const supabase = await guardAdmin()
  const result = updateOrderStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  })
  if (!result.success) return

  const { id, status } = result.data
  const { error } = await supabase
    .from('orders')
    .update({ status: status as never })
    .eq('id', id)

  if (error) console.error('updateOrderStatus:', error)
  revalidatePath(`/admin/commandes/${id}`)
  revalidatePath('/admin/commandes')
  revalidatePath('/admin')
  // Redirect back to orders list with success flag
  redirect('/admin/commandes?updated=1')
}

export async function updateTracking(formData: FormData) {
  const supabase = await guardAdmin()
  const result = updateTrackingSchema.safeParse({
    order_id: formData.get('order_id'),
    carrier: (formData.get('carrier') as string)?.trim() || null,
    tracking_number: (formData.get('tracking_number') as string)?.trim() || null,
  })
  if (!result.success) return

  const { order_id, carrier, tracking_number } = result.data
  const { error } = await supabase
    .from('deliveries')
    .upsert(
      { order_id, carrier, tracking_number, updated_at: new Date().toISOString() },
      { onConflict: 'order_id' }
    )

  if (error) console.error('updateTracking:', error)
  revalidatePath(`/admin/commandes/${order_id}`)
}

export async function updateOrderNotes(formData: FormData) {
  const supabase = await guardAdmin()
  const result = updateOrderNotesSchema.safeParse({
    id: formData.get('id'),
    notes: (formData.get('notes') as string)?.trim() || null,
  })
  if (!result.success) return

  const { id, notes } = result.data
  await supabase.from('orders').update({ notes }).eq('id', id)
  revalidatePath(`/admin/commandes/${id}`)
}
