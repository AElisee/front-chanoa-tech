-- ============================================================
-- Chanoa Tech — Migration 007 : Payment Reference
-- ============================================================
-- Adds payment_reference column to orders for GeniusPay tracking.
-- Replaces the old pattern of storing CinetPay transaction IDs in notes.
-- ============================================================

-- 1. ADD payment_reference column
alter table orders
  add column if not exists payment_reference text;

-- 2. INDEX for webhook lookups
create index if not exists orders_payment_reference_idx
  on orders(payment_reference)
  where payment_reference is not null;
