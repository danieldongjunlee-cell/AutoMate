-- App data → Supabase: bookings (scheduled services + repairs). Run in SQL Editor.
-- The app keeps bookings in its store as the live cache; this table is the
-- per-user source of truth that the store loads on login and writes through to.
-- id is the app's own string id (e.g. bk-1712…), so it stays a text column.

create table if not exists public.bookings (
  id            text primary key,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind          text not null,
  dealer_id     text,
  brand         text,
  icon          text,
  title         text,
  dealer_name   text,
  date_label    text,
  mon           text,
  day           text,
  "time"        text,
  price_label   text,
  status        text not null default 'confirmed',
  proposed_time text,
  reason        text,
  created_at_ms bigint,
  inserted_at   timestamptz not null default now()
);

alter table public.bookings enable row level security;
-- If you ran an earlier version, add the new column:
alter table public.bookings add column if not exists reason text;

create policy "bookings are managed by owner"
  on public.bookings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
