-- ============================================================
-- Chanoa Tech — Migration 002 : Extended Product Schema
-- ============================================================
-- Adds: sku, brand, model, price_eur, status
-- Replaces: images text[] → product_images table (max 5)
-- Adds: brands table, subcategory support via existing parent_id
-- Updates: search_vector trigger to include brand + model
-- ============================================================

-- ============================================================
-- 1. EXTEND PRODUCTS TABLE
-- ============================================================

alter table products
  add column if not exists sku         text unique,
  add column if not exists brand       text,
  add column if not exists model       text,
  add column if not exists price_eur   numeric(10,2) check (price_eur >= 0),
  add column if not exists status      text not null default 'active'
    check (status in ('active', 'inactive', 'archived'));

-- Index new filterable columns
create index if not exists products_brand_idx  on products(brand);
create index if not exists products_sku_idx    on products(sku);
create index if not exists products_status_idx on products(status);

-- ============================================================
-- 2. PRODUCT IMAGES TABLE (replaces images text[])
-- ============================================================
-- images text[] kept for backward compat during transition,
-- will be ignored once product_images is populated.

create table if not exists product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  alt         text,
  position    int  not null default 0,  -- 0 = main image
  created_at  timestamptz not null default now(),

  constraint product_images_max_5 check (position between 0 and 4)
);

create index if not exists product_images_product_idx on product_images(product_id);

-- RLS
alter table product_images enable row level security;

create policy "product_images: public read" on product_images
  for select using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
        and products.is_active = true
    )
  );

create policy "product_images: admin all" on product_images
  for all using (is_admin());

-- ============================================================
-- 3. UPDATE SEARCH VECTOR — include brand + model
-- ============================================================

create or replace function products_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('french', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(new.brand, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(new.model, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(new.description, '')), 'C');
  new.updated_at := now();
  return new;
end;
$$;

-- Re-trigger to apply new function to existing columns
drop trigger if exists products_search_vector_trigger on products;
create trigger products_search_vector_trigger
  before insert or update of name, brand, model, description on products
  for each row execute function products_search_vector_update();

-- Rebuild search vectors for existing rows
update products set name = name;

-- ============================================================
-- 4. SUBCATEGORIES — already supported via parent_id
-- Seed the 9 main categories + 9 subcategories from catalog
-- (run only if tables are empty — idempotent via ON CONFLICT)
-- ============================================================

-- Main categories (no parent)
insert into categories (name, slug, is_active, sort_order) values
  ('PC de bureau',        'pc-de-bureau',       true, 1),
  ('Ordinateurs portables','ordinateurs-portables', true, 2),
  ('Écrans',              'ecrans',             true, 3),
  ('Imprimantes',         'imprimantes',        true, 4),
  ('Serveurs',            'serveurs',           true, 5),
  ('Stockage',            'stockage',           true, 6),
  ('Réseau',              'reseau',             true, 7),
  ('Visioconférence',     'visioconference',    true, 8),
  ('Accessoires',         'accessoires',        true, 9)
on conflict (slug) do nothing;

-- Subcategories (children) — linked via parent_id
insert into categories (name, slug, is_active, sort_order, parent_id)
select 'Desktop',      'desktop',      true, 1, id from categories where slug = 'pc-de-bureau'
on conflict (slug) do nothing;

insert into categories (name, slug, is_active, sort_order, parent_id)
select 'Laptop',       'laptop',       true, 1, id from categories where slug = 'ordinateurs-portables'
on conflict (slug) do nothing;

insert into categories (name, slug, is_active, sort_order, parent_id)
select 'Monitor',      'monitor',      true, 1, id from categories where slug = 'ecrans'
on conflict (slug) do nothing;

insert into categories (name, slug, is_active, sort_order, parent_id)
select 'Printer',      'printer',      true, 1, id from categories where slug = 'imprimantes'
on conflict (slug) do nothing;

insert into categories (name, slug, is_active, sort_order, parent_id)
select 'Server',       'server',       true, 1, id from categories where slug = 'serveurs'
on conflict (slug) do nothing;

insert into categories (name, slug, is_active, sort_order, parent_id)
select 'Storage',      'storage',      true, 1, id from categories where slug = 'stockage'
on conflict (slug) do nothing;

insert into categories (name, slug, is_active, sort_order, parent_id)
select 'Network',      'network',      true, 1, id from categories where slug = 'reseau'
on conflict (slug) do nothing;

insert into categories (name, slug, is_active, sort_order, parent_id)
select 'Conference',   'conference',   true, 1, id from categories where slug = 'visioconference'
on conflict (slug) do nothing;

insert into categories (name, slug, is_active, sort_order, parent_id)
select 'Accessory',    'accessory',    true, 1, id from categories where slug = 'accessoires'
on conflict (slug) do nothing;

-- ============================================================
-- 5. ADMIN ACTIVITY LOGS (missing from migration 001)
-- ============================================================

create table if not exists admin_activity_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references auth.users(id) on delete set null,
  action      text not null,
  entity      text not null,  -- 'product' | 'order' | 'category' | ...
  entity_id   uuid,
  payload     jsonb,          -- snapshot of what changed
  created_at  timestamptz not null default now()
);

create index if not exists admin_logs_admin_idx    on admin_activity_logs(admin_id);
create index if not exists admin_logs_entity_idx   on admin_activity_logs(entity, entity_id);
create index if not exists admin_logs_created_idx  on admin_activity_logs(created_at desc);

alter table admin_activity_logs enable row level security;

create policy "admin_logs: admin read" on admin_activity_logs
  for select using (is_admin());

-- Server-only insert — no client policy needed (uses service role)
