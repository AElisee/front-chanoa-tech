-- ============================================================
-- Chanoa Tech — Initial Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "unaccent";

-- ============================================================
-- ENUMS
-- ============================================================

create type order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

create type user_role as enum ('user', 'admin');

-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  role        user_role not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================

create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  parent_id   uuid references categories(id) on delete set null,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================

create table products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  price         numeric(10,2) not null check (price >= 0),
  compare_price numeric(10,2) check (compare_price >= 0),
  stock         int not null default 0 check (stock >= 0),
  category_id   uuid references categories(id) on delete set null,
  images        text[] not null default '{}',
  is_active     boolean not null default true,
  search_vector tsvector,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Full-text search index
create index products_search_idx on products using gin(search_vector);
create index products_category_idx on products(category_id);
create index products_active_idx on products(is_active);
create index products_slug_idx on products(slug);

-- Auto-update search vector
create or replace function products_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('french', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(new.description, '')), 'B');
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_search_vector_trigger
  before insert or update of name, description on products
  for each row execute function products_search_vector_update();

-- ============================================================
-- CARTS
-- ============================================================

create table carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id         uuid primary key default gen_random_uuid(),
  cart_id    uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity   int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(cart_id, product_id)
);

-- ============================================================
-- ORDERS
-- ============================================================

create table orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete set null,
  status           order_status not null default 'pending',
  total            numeric(10,2) not null check (total >= 0),
  shipping_address jsonb not null,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index orders_user_idx on orders(user_id);
create index orders_status_idx on orders(status);
create index orders_created_idx on orders(created_at desc);

create table order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders(id) on delete cascade,
  product_id       uuid references products(id) on delete set null,
  quantity         int not null check (quantity > 0),
  unit_price       numeric(10,2) not null check (unit_price >= 0),
  product_snapshot jsonb not null,
  created_at       timestamptz not null default now()
);

create index order_items_order_idx on order_items(order_id);

-- ============================================================
-- DELIVERIES
-- ============================================================

create table deliveries (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null unique references orders(id) on delete cascade,
  tracking_number text,
  carrier        text,
  status         text,
  notes          text,
  shipped_at     timestamptz,
  delivered_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- updated_at triggers
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger carts_updated_at before update on carts
  for each row execute function set_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

create trigger deliveries_updated_at before update on deliveries
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles    enable row level security;
alter table categories  enable row level security;
alter table products    enable row level security;
alter table carts       enable row level security;
alter table cart_items  enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;
alter table deliveries  enable row level security;

-- Helper: is current user admin?
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES
create policy "profiles: owner read"   on profiles for select using (auth.uid() = id);
create policy "profiles: owner update" on profiles for update using (auth.uid() = id);
create policy "profiles: admin read"   on profiles for select using (is_admin());

-- CATEGORIES
create policy "categories: public read"  on categories for select using (is_active = true);
create policy "categories: admin all"    on categories for all using (is_admin());

-- PRODUCTS
create policy "products: public read"   on products for select using (is_active = true);
create policy "products: admin all"     on products for all using (is_admin());

-- CARTS
create policy "carts: owner all" on carts for all using (auth.uid() = user_id);

-- CART ITEMS
create policy "cart_items: owner all" on cart_items for all using (
  exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);

-- ORDERS
create policy "orders: owner read"   on orders for select using (auth.uid() = user_id);
create policy "orders: owner insert" on orders for insert with check (auth.uid() = user_id);
create policy "orders: admin all"    on orders for all using (is_admin());

-- ORDER ITEMS
create policy "order_items: owner read" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "order_items: owner insert" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "order_items: admin all" on order_items for all using (is_admin());

-- DELIVERIES
create policy "deliveries: owner read" on deliveries for select using (
  exists (select 1 from orders where orders.id = deliveries.order_id and orders.user_id = auth.uid())
);
create policy "deliveries: admin all" on deliveries for all using (is_admin());
