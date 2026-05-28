-- ============================================================
-- Migration 005 — Invoice URL column + Storage bucket
-- ============================================================

-- Add invoice_url to orders (populated by EF-04 generate-invoice)
alter table orders
  add column if not exists invoice_url text;

-- ============================================================
-- STORAGE — invoices bucket (public read, service role write)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invoices', 'invoices', true, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- Public can read invoices (for download links)
create policy "invoices: public read"
  on storage.objects for select
  using (bucket_id = 'invoices');

-- Only service role can upload/delete (Edge Functions use service role key)
create policy "invoices: service role write"
  on storage.objects for insert
  with check (bucket_id = 'invoices' and auth.role() = 'service_role');

create policy "invoices: service role delete"
  on storage.objects for delete
  using (bucket_id = 'invoices' and auth.role() = 'service_role');
