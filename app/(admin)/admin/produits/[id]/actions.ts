'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { guardAdmin } from '@/lib/supabase/server'
import { updateProductSchema } from '@/lib/schemas'

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await guardAdmin()

  const imagesRaw = (formData.get('images') as string) ?? ''
  const images = imagesRaw.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 5)

  const raw = {
    name: (formData.get('name') as string)?.trim(),
    description: (formData.get('description') as string)?.trim() || null,
    brand: (formData.get('brand') as string)?.trim() || null,
    model: (formData.get('model') as string)?.trim() || null,
    sku: (formData.get('sku') as string)?.trim() || null,
    price: parseFloat(formData.get('price') as string),
    price_eur: (formData.get('price_eur') as string) ? parseFloat(formData.get('price_eur') as string) : null,
    compare_price: (formData.get('compare_price') as string) ? parseFloat(formData.get('compare_price') as string) : null,
    stock: parseInt(formData.get('stock') as string, 10),
    category_id: (formData.get('category_id') as string) || null,
    is_active: formData.get('is_active') === '1',
    images,
  }

  const result = updateProductSchema.safeParse(raw)
  if (!result.success) {
    const msg = result.error.issues[0].message
    redirect(`/admin/produits/${id}?error=${encodeURIComponent(msg)}`)
  }

  const { name, description, brand, model, sku, price, price_eur, compare_price, stock, category_id, is_active, images: validImages } = result.data

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description,
      brand,
      model,
      sku,
      price,
      price_eur,
      compare_price,
      stock,
      category_id,
      is_active,
      images: validImages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    redirect(`/admin/produits/${id}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/produits')
  revalidatePath(`/admin/produits/${id}`)
  revalidatePath('/boutique')

  redirect(`/admin/produits/${id}?success=1`)
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = await guardAdmin()

  await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/produits')
  revalidatePath(`/admin/produits/${id}`)
}

export async function deleteProduct(id: string) {
  const supabase = await guardAdmin()

  // Check if product has order_items referencing it
  const { count } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)

  if ((count ?? 0) > 0) {
    redirect(`/admin/produits/${id}?error=${encodeURIComponent('Ce produit a des commandes associées. Désactivez-le plutôt que de le supprimer.')}`)
  }

  // Delete variants first (cascade should handle it, but be explicit)
  await supabase.from('product_variants').delete().eq('product_id', id)
  await supabase.from('products').delete().eq('id', id)

  revalidatePath('/admin/produits')
  revalidatePath('/boutique')
  redirect('/admin/produits?deleted=1')
}

// ── Variant CRUD ──────────────────────────────────────────────

export async function createVariant(productId: string, formData: FormData) {
  const supabase = await guardAdmin()

  const optionsRaw = (formData.get('options') as string)?.trim() || '{}'
  let options: Record<string, string> = {}
  try { options = JSON.parse(optionsRaw) } catch { /* ignore */ }

  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string, 10)
  const sku = (formData.get('sku') as string)?.trim() || null

  if (isNaN(price) || isNaN(stock)) {
    redirect(`/admin/produits/${productId}?error=Variante invalide`)
  }

  const { error } = await supabase.from('product_variants').insert({
    product_id: productId,
    options,
    price,
    stock,
    sku,
    is_active: true,
  })

  if (error) redirect(`/admin/produits/${productId}?error=${encodeURIComponent(error.message)}`)
  revalidatePath(`/admin/produits/${productId}`)
  redirect(`/admin/produits/${productId}?success=1`)
}

export async function updateVariant(productId: string, variantId: string, formData: FormData) {
  const supabase = await guardAdmin()

  const optionsRaw = (formData.get('options') as string)?.trim() || '{}'
  let options: Record<string, string> = {}
  try { options = JSON.parse(optionsRaw) } catch { /* ignore */ }

  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string, 10)
  const sku = (formData.get('sku') as string)?.trim() || null
  const is_active = formData.get('is_active') === '1'

  if (isNaN(price) || isNaN(stock)) {
    redirect(`/admin/produits/${productId}?error=Variante invalide`)
  }

  await supabase.from('product_variants').update({ options, price, stock, sku, is_active }).eq('id', variantId)
  revalidatePath(`/admin/produits/${productId}`)
  redirect(`/admin/produits/${productId}?success=1`)
}

export async function deleteVariant(productId: string, variantId: string) {
  const supabase = await guardAdmin()
  await supabase.from('product_variants').delete().eq('id', variantId)
  revalidatePath(`/admin/produits/${productId}`)
  redirect(`/admin/produits/${productId}?success=1`)
}
