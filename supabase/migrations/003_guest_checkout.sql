-- ============================================================
-- Chanoa Tech — Migration 003 : Guest Checkout Support
-- ============================================================
-- Allows placing orders without a user account.
-- Adds guest_email for order tracking via OTP login.
-- Run in Supabase Studio → SQL Editor
-- ============================================================

-- 1. Add guest_email column to orders
alter table orders
  add column if not exists guest_email text;

create index if not exists orders_guest_email_idx on orders(guest_email);

-- 2. Drop old restrictive insert/select policies
drop policy if exists "orders: owner insert" on orders;
drop policy if exists "orders: owner read"   on orders;

-- 3. New read policy: owner OR matched guest email after login
--    (user who logs in with the same email they used at checkout)
create policy "orders: owner read" on orders
  for select using (
    auth.uid() = user_id
    or (
      guest_email is not null
      and guest_email = (
        select email from profiles where id = auth.uid()
      )
    )
  );

-- 4. New insert policy: allow authenticated users OR service role
--    Service role bypasses RLS, so this covers server-action guest checkout.
--    Authenticated users can also insert (for future logged-in checkout).
create policy "orders: insert" on orders
  for insert with check (
    auth.uid() = user_id          -- authenticated checkout
    or user_id is null            -- guest checkout (server action sets this)
  );

-- 5. Same update for order_items: allow owner OR guest email
drop policy if exists "order_items: owner read"   on order_items;
drop policy if exists "order_items: owner insert" on order_items;

create policy "order_items: owner read" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (
          orders.user_id = auth.uid()
          or orders.guest_email = (select email from profiles where id = auth.uid())
        )
    )
  );

-- order_items insert is always done server-side (service role), no client policy needed
create policy "order_items: insert" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
    )
  );
