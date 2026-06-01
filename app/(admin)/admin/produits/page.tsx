<<<<<<< HEAD
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button-variants";
import { Plus, Search, Package, Pencil } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { formatFCFA } from "@/lib/utils/format";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api/client";
import Pagination from "@/components/ui/Pagination";
import type { ProductListResponse, ProductDto } from "@/lib/api/products";
import type { CategoryListResponse, CategoryDto } from "@/lib/api/categories";

export const metadata: Metadata = { title: "Produits — Admin" };

interface Props {
  searchParams: Promise<{ q?: string; page?: string; categorie?: string }>;
}

const PAGE_SIZE = 20;

export default async function AdminProduitsPage({ searchParams }: Props) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "admin") redirect("/");

  const params = await searchParams;
  const { q, page = "1", categorie } = params;
  const currentPage = Number(page);

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Charger les catégories pour le filtre
  let categories: CategoryDto[] = [];
  try {
    const res = await apiClient.get<CategoryListResponse>("/categorie", {
      params: { limit: 100 },
      headers,
    });
    categories = res.data.data ?? [];
=======
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus, Search, Package, Pencil } from 'lucide-react'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { formatFCFA } from '@/lib/utils/format'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import Pagination from '@/components/ui/Pagination'
import type { ProductListResponse, ProductDto } from '@/lib/api/products'
import type { CategoryListResponse, CategoryDto } from '@/lib/api/categories'

export const metadata: Metadata = { title: 'Produits — Admin' }

interface Props {
  searchParams: Promise<{ q?: string; page?: string; categorie?: string }>
}

const PAGE_SIZE = 20

export default async function AdminProduitsPage({ searchParams }: Props) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const params = await searchParams
  const { q, page = '1', categorie } = params
  const currentPage = Number(page)

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  // Charger les catégories pour le filtre
  let categories: CategoryDto[] = []
  try {
    const res = await apiClient.get<CategoryListResponse>('/categorie', {
      params: { limit: 100 },
      headers,
    })
    categories = res.data.data ?? []
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
  } catch {
    // silencieux
  }

  // Résoudre le slug de catégorie en categoryId
<<<<<<< HEAD
  let categoryId: string | undefined;
  if (categorie) {
    const matched = categories.find((c) => c.slug === categorie);
    if (matched) categoryId = matched.id;
  }

  // Charger les produits
  let products: ProductDto[] = [];
  let count = 0;
=======
  let categoryId: string | undefined
  if (categorie) {
    const matched = categories.find((c) => c.slug === categorie)
    if (matched) categoryId = matched.id
  }

  // Charger les produits
  let products: ProductDto[] = []
  let count = 0
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
  try {
    const apiParams: Record<string, string | number> = {
      page: currentPage,
      limit: PAGE_SIZE,
<<<<<<< HEAD
    };
    if (q?.trim()) apiParams.search = q.trim();
    if (categoryId) apiParams.categoryId = categoryId;

    const res = await apiClient.get<ProductListResponse>("/produits", {
      params: apiParams,
      headers,
    });
    products = res.data.data ?? [];
    count = res.data.total ?? 0;
=======
    }
    if (q?.trim()) apiParams.search = q.trim()
    if (categoryId) apiParams.categoryId = categoryId

    const res = await apiClient.get<ProductListResponse>('/produits', {
      params: apiParams,
      headers,
    })
    products = res.data.data ?? []
    count = res.data.total ?? 0
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
  } catch {
    // silencieux
  }

<<<<<<< HEAD
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
=======
  const totalPages = Math.ceil(count / PAGE_SIZE)
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
<<<<<<< HEAD
          <p className="mt-0.5 text-sm text-muted-foreground">
            {count} produits
          </p>
=======
          <p className="mt-0.5 text-sm text-muted-foreground">{count} produits</p>
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
        </div>
        <Link href="/admin/produits/nouveau" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau produit
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher nom, marque, SKU…"
            className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          name="categorie"
<<<<<<< HEAD
          defaultValue={categorie ?? ""}
=======
          defaultValue={categorie ?? ''}
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
          className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
<<<<<<< HEAD
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
=======
            <option key={c.id} value={c.slug}>{c.name}</option>
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Filtrer
        </button>
        {(q || categorie) && (
          <Link
            href="/admin/produits"
            className="flex h-9 items-center rounded-md border px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-20 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Package className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <p className="font-medium text-foreground">Aucun produit trouvé</p>
          <p className="mt-1 text-sm text-muted-foreground">
<<<<<<< HEAD
            {q || categorie
              ? "Essayez de modifier vos filtres."
              : "Commencez par créer un produit."}
=======
            {q || categorie ? 'Essayez de modifier vos filtres.' : 'Commencez par créer un produit.'}
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
<<<<<<< HEAD
            const image = p.images?.[0];
            const stockValue = Math.floor(Number(p.stock)); // Appliquer Math.floor ici
            const stockLabel =
              stockValue === 0 ? "Épuisé" : `${stockValue} en stock`;
            const stockClass =
              stockValue === 0
                ? "bg-red-100 text-red-700"
                : stockValue <= 5
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700";
=======
            const image = p.images?.[0]
            const stockLabel = p.stock === 0 ? 'Épuisé' : `${p.stock} en stock`
            const stockClass = p.stock === 0
              ? 'bg-red-100 text-red-700'
              : p.stock <= 5
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
            return (
              <Link
                key={p.id}
                href={`/admin/produits/${p.id}`}
<<<<<<< HEAD
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/30 ${p.is_active ? "" : "opacity-60"}`}
=======
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/30 ${p.is_active ? '' : 'opacity-60'}`}
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt={p.name}
                      fill
                      className="object-contain p-3"
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Stock badge — top left */}
<<<<<<< HEAD
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stockClass}`}
                  >
=======
                  <span className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stockClass}`}>
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
                    {stockLabel}
                  </span>
                  {/* Active status badge — top right */}
                  {!p.is_active && (
                    <span className="absolute right-2 top-2 rounded-full bg-gray-700 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Inactif
                    </span>
                  )}
                  {/* Edit hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-md">
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.brand && (
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {p.brand}
                      </p>
                    )}
<<<<<<< HEAD
                    {(p.categoryId ?? p.category_id) &&
                      categoryMap.get((p.categoryId ?? p.category_id)!) && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {categoryMap.get((p.categoryId ?? p.category_id)!)}
                        </span>
                      )}
=======
                    {(p.categoryId ?? p.category_id) && categoryMap.get((p.categoryId ?? p.category_id)!) && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {categoryMap.get((p.categoryId ?? p.category_id)!)}
                      </span>
                    )}
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">
                    {p.name}
                  </p>
                  {p.sku && (
<<<<<<< HEAD
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {p.sku}
                    </p>
=======
                    <p className="font-mono text-[10px] text-muted-foreground">{p.sku}</p>
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
                  )}
                  <p className="mt-auto pt-2 text-base font-bold text-primary">
                    {formatFCFA(p.price)}
                  </p>
                </div>
              </Link>
<<<<<<< HEAD
            );
=======
            )
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
          })}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/produits"
        searchParams={{
          ...(q ? { q } : {}),
          ...(categorie ? { categorie } : {}),
        }}
      />
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
}
