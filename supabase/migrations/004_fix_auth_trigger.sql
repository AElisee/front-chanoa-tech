-- ============================================================
-- Migration 004 — Make handle_new_user trigger exception-safe
-- ============================================================
-- "database error saving new user" is caused by the trigger
-- throwing an unhandled exception (e.g. duplicate key, constraint).
-- This version:
--   1. Wraps the insert in EXCEPTION WHEN OTHERS → returns new
--      so auth.users creation never fails because of this trigger.
--   2. Adds ON CONFLICT (id) DO UPDATE so re-triggers (edge cases)
--      update the profile email rather than violating the PK.
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '')
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = coalesce(excluded.full_name, profiles.full_name),
        updated_at = now();

  return new;
exception when others then
  -- Profile creation failed (e.g. DB not ready, constraint) but we
  -- must NOT fail the auth.users insert. Log and continue.
  raise warning 'handle_new_user: profile insert skipped for % — %', new.id, sqlerrm;
  return new;
end;
$$;

-- Re-create trigger in case it was never applied (migration 001 not run)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
