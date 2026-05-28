'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { guardAdmin } from '@/lib/supabase/server'
import { updateProductSchema } from '@/lib/schemas'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createProduct(formData: FormData) {
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
    redirect(`/admin/produits/nouveau?error=${encodeURIComponent(msg)}`)
  }

  const { name, description, brand, model, sku, price, price_eur, compare_price, stock, category_id, is_active, images: validImages } = result.data
  const slug = toSlug(name)

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
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
    })
    .select('id')
    .single()

  if (error) {
    redirect(`/admin/produits/nouveau?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/produits')
  revalidatePath('/boutique')
  redirect(`/admin/produits/${product.id}?success=1`)
}
