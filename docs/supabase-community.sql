-- App data → Supabase: community feed. Run in SQL Editor.
-- Unlike the per-user tables, posts are SHARED: every signed-in user can read all
-- posts, but can only insert/delete their own. (Comments stay demo-only for now.)

create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author     text,
  car        text,
  category   text,
  body       text not null,
  has_photo  boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Any signed-in user can read the whole feed…
create policy "posts readable by signed-in users"
  on public.posts for select
  using (auth.uid() is not null);

-- …but only write/remove their own posts.
create policy "posts insertable by owner"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "posts deletable by owner"
  on public.posts for delete
  using (auth.uid() = user_id);
