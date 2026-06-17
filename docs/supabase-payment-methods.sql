-- App data → Supabase: saved payment cards. Paste into Supabase → SQL Editor → Run.
-- Owner-scoped RLS. NOTE: this stores only display fields (brand, last4, holder,
-- expiry) — never full card numbers. Real charging would use Stripe tokens.

create table if not exists public.payment_methods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  brand      text,
  last4      text,
  holder     text,
  expires    text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.payment_methods enable row level security;

create policy "cards are managed by owner"
  on public.payment_methods for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
