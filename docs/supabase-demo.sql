-- Supabase "direct supabase-js" demo — paste into Supabase → SQL Editor → Run.
-- Backs the Supabase demo screen (More tab → Settings → Developer → Supabase demo).
-- A per-user notes table in the PUBLIC schema (exposed to the Data API), with
-- RLS so each signed-in user only ever sees and edits their own rows.

create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

-- Each policy ties a row to the logged-in user (auth.uid()).
create policy "notes are viewable by owner"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "notes are insertable by owner"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "notes are deletable by owner"
  on public.notes for delete
  using (auth.uid() = user_id);
