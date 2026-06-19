-- App data → Supabase: AI damage estimates + the uploaded photos.
-- Run in SQL Editor. Images go in a Storage bucket (not the table); the table
-- keeps the storage PATHS. Owner-scoped RLS throughout.

-- 1) The submitted request + its AI estimate (incl. the full model JSON +
--    versions from services/damage-ai, so a stored quote is reproducible).
create table if not exists public.damage_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  price_low       integer,
  price_high      integer,
  confidence_pct  integer,
  shops_notified  integer,
  estimate_id     text,        -- damage-ai estimate_id
  model_version   text,        -- e.g. yolo11n-seg-cardd-v1 / mock-1
  pricing_version text,        -- e.g. nova-2026.06
  model_json      jsonb,       -- full /estimate response (damages[], etc.)
  status          text not null default 'submitted',
  created_at      timestamptz not null default now()
);

-- Idempotent add for existing installs.
alter table public.damage_requests add column if not exists estimate_id text;
alter table public.damage_requests add column if not exists model_version text;
alter table public.damage_requests add column if not exists pricing_version text;
alter table public.damage_requests add column if not exists model_json jsonb;

alter table public.damage_requests enable row level security;
create policy "damage requests managed by owner"
  on public.damage_requests for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2) One row per damaged part, with the storage paths of its photos.
create table if not exists public.damage_parts (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.damage_requests (id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  part        text,
  damage_type text,
  note        text,
  photo_count integer,
  photo_paths text[],       -- paths in the damage-photos bucket
  created_at  timestamptz not null default now()
);

alter table public.damage_parts enable row level security;
create policy "damage parts managed by owner"
  on public.damage_parts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3) Private Storage bucket for the photos.
insert into storage.buckets (id, name, public)
values ('damage-photos', 'damage-photos', false)
on conflict (id) do nothing;

-- 4) Storage RLS: each user only touches files under a folder named by their uid
--    (paths look like "<uid>/<request_id>/<part>_<n>.jpg").
create policy "damage photos readable by owner"
  on storage.objects for select
  using (bucket_id = 'damage-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "damage photos insertable by owner"
  on storage.objects for insert
  with check (bucket_id = 'damage-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "damage photos deletable by owner"
  on storage.objects for delete
  using (bucket_id = 'damage-photos' and (storage.foldername(name))[1] = auth.uid()::text);
