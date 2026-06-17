-- One profile row per Supabase Auth user, auto-created on signup.
-- Paste into Supabase → SQL Editor → Run. This is the standard pattern: a
-- table in PUBLIC (browsable + extendable in the Table Editor) keyed 1:1 to the
-- auth.users system table, populated by a trigger when someone signs up.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each user can read and edit only their own profile row.
create policy "profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger fn: copy name/phone from the signup's user_metadata into a profile.
-- SECURITY DEFINER lets it write the row regardless of the caller's RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- OPTIONAL: backfill profiles for any users that signed up before this ran.
insert into public.profiles (id, email, full_name, phone)
select u.id, u.email, u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'phone'
from auth.users u
on conflict (id) do nothing;
