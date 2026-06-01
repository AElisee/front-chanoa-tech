'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { updateProductSchema } from '@/lib/schemas'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'

async function getAdminHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function updateProduct(id: string, formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

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
    categoryId: (formData.get('category_id') as string) || null,
    is_active: formData.get('is_active') === '1',
    images,
  }

  const result = updateProductSchema.safeParse(raw)
  if (!result.success) {
    const msg = result.error.issues[0].message
    redirect(`/admin/produits/${id}?error=${encodeURIComponent(msg)}`)
  }

  const { name, description, brand, model, sku, price, price_eur, compare_price, stock, categoryId, is_active, images: validImages } = result.data

  try {
    await apiClient.patch(`/produits/${id}`, {
      name,
      description,
      brand,
      model,
      sku,
      price,
      price_eur,
      compare_price,
      stock,
      categoryId,
      is_active,
      images: validImages,
    }, { headers })
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la mise à jour'
    redirect(`/admin/produits/${id}?error=${encodeURIComponent(message)}`)
  }

  revalidatePath('/admin/produits')
  revalidatePath(`/admin/produits/${id}`)
  revalidatePath('/boutique')

  redirect(`/admin/produits/${id}?success=1`)
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const user = await getAuthenticatedUser()
  if (!user || user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

  try {
    await apiClient.patch(`/produits/${id}`, { is_active: isActive }, { headers })
  } catch {
    // silencieux
  }

  revalidatePath('/admin/produits')
  revalidatePath(`/admin/produits/${id}`)
}

export async function deleteProduct(id: string) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

  try {
    await apiClient.delete(`/produits/${id}`, { headers })
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la suppression'
    redirect(`/admin/produits/${id}?error=${encodeURIComponent(message)}`)
  }

  revalidatePath('/admin/produits')
  revalidatePath('/boutique')
  redirect('/admin/produits?deleted=1')
}

// ── Variant CRUD (via API NestJS) ────────────────────────────────────────────

export async function createVariant(productId: string, formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

  const optionsRaw = (formData.get('options') as string)?.trim() || '{}'
  let options: Record<string, string> = {}
  try { options = JSON.parse(optionsRaw) } catch { /* ignore */ }

  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string, 10)
  const sku = (formData.get('sku') as string)?.trim() || null

  if (isNaN(price) || isNaN(stock)) {
    redirect(`/admin/produits/${productId}?error=Variante invalide`)
  }

  try {
    await apiClient.post(
      `/produits/${productId}/variants`,
      { options, price, stock, sku, is_active: true },
      { headers },
    )
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la création'
    redirect(`/admin/produits/${productId}?error=${encodeURIComponent(message)}`)
  }

  revalidatePath(`/admin/produits/${productId}`)
  redirect(`/admin/produits/${productId}?success=1`)
}

export async function updateVariant(productId: string, variantId: string, formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

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

  try {
    await apiClient.patch(
      `/produits/${productId}/variants/${variantId}`,
      { options, price, stock, sku, is_active },
      { headers },
    )
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la mise à jour'
    redirect(`/admin/produits/${productId}?error=${encodeURIComponent(message)}`)
  }

  revalidatePath(`/admin/produits/${productId}`)
  redirect(`/admin/produits/${productId}?success=1`)
}

export async function deleteVariant(productId: string, variantId: string) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const headers = await getAdminHeaders()

  try {
    await apiClient.delete(`/produits/${productId}/variants/${variantId}`, { headers })
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la suppression'
    redirect(`/admin/produits/${productId}?error=${encodeURIComponent(message)}`)
  }

  revalidatePath(`/admin/produits/${productId}`)
  redirect(`/admin/produits/${productId}?success=1`)
}
