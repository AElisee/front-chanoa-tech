'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { createCategorySchema, updateCategorySchema } from '@/lib/schemas'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function getAdminHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function createCategory(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

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

  try {
    await apiClient.post('/categories', {
      name,
      slug,
      parent_id: parent_id ?? null,
      image_url: image_url ?? null,
      is_active: true,
    }, { headers })
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la création'
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`)
  }

  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
  redirect('/admin/categories?created=1')
}

export async function updateCategory(id: string, formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

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

  try {
    await apiClient.patch(`/categories/${id}`, {
      name,
      slug,
      description: description ?? null,
      parent_id: parent_id ?? null,
      image_url: image_url ?? null,
      sort_order,
    }, { headers })
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la mise à jour'
    redirect(`/admin/categories/${id}?error=${encodeURIComponent(message)}`)
  }

  revalidatePath('/admin/categories')
  revalidatePath(`/admin/categories/${id}`)
  revalidatePath('/boutique')
  redirect(`/admin/categories/${id}?success=1`)
}

export async function toggleCategoryActive(id: string, is_active: boolean) {
  const user = await getAuthenticatedUser()
  if (!user || user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

  try {
    await apiClient.patch(`/categories/${id}`, { is_active: !is_active }, { headers })
  } catch {
    // silencieux
  }

  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
}

export async function deleteCategory(id: string) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

  try {
    await apiClient.delete(`/categories/${id}`, { headers })
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la suppression'
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`)
  }

  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
  redirect('/admin/categories?deleted=1')
}
