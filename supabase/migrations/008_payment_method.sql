-- ============================================================
-- Chanoa Tech — Migration 008 : Payment Method
-- ============================================================
-- Adds a payment_method column to orders so customers can choose
-- between online payment (GeniusPay) and cash on delivery.
-- ============================================================

alter table orders
  add column if not exists payment_method text
    not null default 'genius_pay'
    check (payment_method in ('genius_pay', 'cash_on_delivery'));

create index if not exists orders_payment_method_idx
  on orders(payment_method);
