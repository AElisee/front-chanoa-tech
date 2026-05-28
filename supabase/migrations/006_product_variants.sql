-- ============================================================
-- Chanoa Tech — Migration 006 : Product Variants
-- ============================================================
-- Adds product_variants table for RAM, storage, config options.
-- Products without variants continue to work via products.price/stock.
-- The CartItem will carry an optional variant_id.
-- Idempotent: safe to re-run.
-- ============================================================

-- 1. PRODUCT VARIANTS TABLE
create table if not exists product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  sku           text unique,
  -- options is a flexible JSONB object: { "ram": "16 Go", "stockage": "512 Go SSD", "couleur": "Gris" }
  options       jsonb not null default '{}',
  price         numeric(10,2) not null check (price >= 0),
  price_eur     numeric(10,2) check (price_eur >= 0),
  compare_price numeric(10,2) check (compare_price >= 0),
  stock         int not null default 0 check (stock >= 0),
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists product_variants_product_idx on product_variants(product_id);
create index if not exists product_variants_sku_idx on product_variants(sku) where sku is not null;
create index if not exists product_variants_active_idx on product_variants(product_id, is_active);

-- 2. AUTO-UPDATE updated_at (drop trigger first to be idempotent)
drop trigger if exists product_variants_updated_at on product_variants;

create or replace function update_product_variants_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger product_variants_updated_at
  before update on product_variants
  for each row execute function update_product_variants_updated_at();

-- 3. RLS
alter table product_variants enable row level security;

drop policy if exists "product_variants_public_read" on product_variants;
drop policy if exists "product_variants_admin_insert" on product_variants;
drop policy if exists "product_variants_admin_update" on product_variants;
drop policy if exists "product_variants_admin_delete" on product_variants;

-- Anyone can read active variants of active products
create policy "product_variants_public_read"
  on product_variants for select
  using (
    is_active = true
    and exists (
      select 1 from products p
      where p.id = product_variants.product_id
        and p.is_active = true
    )
  );

-- Admin only for write (uses existing is_admin() function)
create policy "product_variants_admin_insert"
  on product_variants for insert
  with check (is_admin());

create policy "product_variants_admin_update"
  on product_variants for update
  using (is_admin());

create policy "product_variants_admin_delete"
  on product_variants for delete
  using (is_admin());

-- 4. ADD variant_id to order_items (nullable — simple orders without variants still work)
alter table order_items
  add column if not exists variant_id uuid references product_variants(id) on delete set null;
