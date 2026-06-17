-- App data → Supabase: insurance policies. Paste into Supabase → SQL Editor → Run.
-- Owner-scoped RLS, columns mirror the app's Policy type (insuranceService).

create table if not exists public.insurance_policies (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  carrier          text,
  coverage         text,
  policy_number    text,
  deductible       integer,
  premium_per_year integer,
  covers           text,
  renewal          text,
  status           text not null default 'Active',
  created_at       timestamptz not null default now()
);

alter table public.insurance_policies enable row level security;

create policy "policies are managed by owner"
  on public.insurance_policies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
