-- App data → Supabase: the points ledger. Run in SQL Editor.
-- Every earn (check-in, booking a service, community post, redeeming, …) appends
-- a row; the running total is balance_after. The app hydrates its points balance
-- from the latest row on login. New accounts therefore start at 0 points.

create table if not exists public.points_ledger (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  delta         integer not null,        -- + earn / − redeem
  reason        text,
  balance_after integer,
  created_at    timestamptz not null default now()
);

alter table public.points_ledger enable row level security;

create policy "points are managed by owner"
  on public.points_ledger for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
