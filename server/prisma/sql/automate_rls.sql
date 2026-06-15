-- AutoMate consumer app — Row Level Security for the `automate` schema.
--
-- WHEN TO RUN: once, AFTER `prisma migrate deploy` has created the tables
-- (run it in the Supabase SQL editor, or `psql "$DIRECT_URL" -f automate_rls.sql`).
--
-- SECURITY MODEL (important — read before changing):
-- This app uses an Express + Prisma backend with APP-MANAGED auth (passwords +
-- JWTs live in automate.users, NOT Supabase GoTrue). The backend connects with
-- the Supabase `postgres` role, which has BYPASSRLS — so enabling RLS here does
-- NOT block the app; the app enforces per-user scoping in code (every query is
-- filtered by the authenticated userId).
--
-- What RLS buys us is DEFENSE IN DEPTH against Supabase's auto-generated
-- PostgREST/Data API: if the `automate` schema is ever exposed, the public
-- `anon` / `authenticated` roles would otherwise be able to read these tables.
-- Enabling RLS with NO permissive policies = deny-all for those roles.
--
-- ALSO DO THIS (belt and suspenders): keep `automate` OUT of the exposed
-- schemas list — Dashboard → Project Settings → API → "Exposed schemas"
-- should list only `public` (and `graphql_public`), never `automate`.

-- 1) Lock the schema down for the public API roles.
revoke all on schema automate from anon, authenticated;
revoke all on all tables in schema automate from anon, authenticated;
alter default privileges in schema automate revoke all on tables from anon, authenticated;

-- 2) Enable RLS on every consumer table. No policies are added, so the only
--    roles that can touch these tables are BYPASSRLS roles (the backend's
--    `postgres`/service connection). Add per-user policies below ONLY if you
--    later move to direct Supabase-client access with GoTrue auth.
do $$
declare t text;
begin
  foreach t in array array[
    'users',
    'vehicles',
    'damage_requests',
    'quotes',
    'bookings',
    'payments',
    'service_history',
    'insurance_policies',
    'points_ledger',
    'pro_memberships',
    'notifications',
    'community_posts',
    'community_comments'
  ]
  loop
    execute format('alter table automate.%I enable row level security;', t);
  end loop;
end $$;

-- 3) (FUTURE / OPTIONAL) If you ever switch to Supabase GoTrue auth and let the
--    client hit PostgREST directly, the app-managed `automate.users` table is
--    replaced by `auth.users`, and you would add owner-scoped policies like:
--
--    create policy "own vehicles" on automate.vehicles
--      for all to authenticated
--      using (user_id = auth.uid()::text)
--      with check (user_id = auth.uid()::text);
--
--    Repeat per user-owned table. Not needed for the current Express+Prisma
--    architecture (the backend bypasses RLS and scopes by userId in code).
