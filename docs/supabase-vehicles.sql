-- App data → Supabase: the user's cars. Paste into Supabase → SQL Editor → Run.
-- Same owner-scoped RLS pattern as notes/profiles. Columns mirror the app's
-- Vehicle type (src/services/mock/vehiclesService.ts), snake_cased.

create table if not exists public.vehicles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  color_name   text,
  vin          text,
  odometer_mi  integer,
  oil_spec     text,
  last_service text,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.vehicles enable row level security;

-- One policy covering select/insert/update/delete, all scoped to the owner.
create policy "vehicles are managed by owner"
  on public.vehicles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
