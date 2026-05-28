'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { guardAdmin } from '@/lib/supabase/server'
import { createCategorySchema, updateCategorySchema } from '@/lib/schemas'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createCategory(formData: FormData) {
  const supabase = await guardAdmin()
  const raw = {
    name: (formData.get('name') as string)?.trim(),
    slug: (formData.get('slug') as string)?.trim() || undefined,
    parent_id: (formData.get('parent_id') as string) || null,
    image_url: (formData.get('image_url') as string)?.trim() || null,
  }
  const result = createCategorySchema.safeParse(raw)
  if (!result.success) {
    redirect(`/admin/categories?error=${encodeURIComponent(result.error.issues[0].message)}`)
  }
  const { name, slug: slugVal, parent_id, image_url } = result.data
  const slug = toSlug(slugVal || name)

  const { error } = await supabase.from('categories').insert({
    name, slug, parent_id: parent_id ?? null, image_url: image_url ?? null, is_active: true,
  })

  if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
  redirect('/admin/categories?created=1')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await guardAdmin()
  const raw = {
    name: (formData.get('name') as string)?.trim(),
    slug: (formData.get('slug') as string)?.trim() || undefined,
    description: (formData.get('description') as string)?.trim() || null,
    parent_id: (formData.get('parent_id') as string) || null,
    image_url: (formData.get('image_url') as string)?.trim() || null,
    sort_order: Number(formData.get('sort_order') ?? 0),
  }
  const result = updateCategorySchema.safeParse(raw)
  if (!result.success) {
    redirect(`/admin/categories/${id}?error=${encodeURIComponent(result.error.issues[0].message)}`)
  }
  const { name, slug: slugVal, description, parent_id, image_url, sort_order } = result.data
  const slug = toSlug(slugVal || name)

  const { error } = await supabase.from('categories').update({
    name, slug, description: description ?? null, parent_id: parent_id ?? null, image_url: image_url ?? null, sort_order,
  }).eq('id', id)

  if (error) redirect(`/admin/categories/${id}?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/admin/categories')
  revalidatePath(`/admin/categories/${id}`)
  revalidatePath('/boutique')
  redirect(`/admin/categories/${id}?success=1`)
}

export async function toggleCategoryActive(id: string, is_active: boolean) {
  const supabase = await guardAdmin()
  await supabase.from('categories').update({ is_active: !is_active }).eq('id', id)
  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
}

export async function deleteCategory(id: string) {
  const supabase = await guardAdmin()
  // Check if category has products
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
  if ((count ?? 0) > 0) redirect(`/admin/categories?error=Cette catégorie contient des produits`)
  await supabase.from('categories').delete().eq('id', id)
  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
  redirect('/admin/categories?deleted=1')
}
