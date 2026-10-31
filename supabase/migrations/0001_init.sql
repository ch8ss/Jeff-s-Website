-- Jeff portfolio — schema, RLS and storage.
-- Run in the Supabase SQL editor (or `supabase db push`). Safe to run once on a fresh project.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────── helpers
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ─────────────────────────────────────────── artworks
create table if not exists artworks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  code text unique not null,
  title text not null,
  description text,
  category text not null check (category in ('mural','graffiti','canvas','print','sketch','other')),
  medium text,
  width_cm numeric, height_cm numeric,
  year int,
  city text, location_name text, map_url text,
  is_featured boolean default false,
  is_for_sale boolean default false,
  price numeric,
  currency text default 'INR',
  status text default 'available' check (status in ('available','reserved','sold','not_for_sale')),
  sort_order int default 0,
  seo_title text, seo_description text,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger artworks_touch before update on artworks for each row execute function touch_updated_at();

create table if not exists artwork_images (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid references artworks(id) on delete cascade,
  storage_path text not null,
  alt text not null check (length(alt) >= 10),
  width int, height int,
  is_cover boolean default false,
  sort_order int default 0
);
create index if not exists artwork_images_artwork_idx on artwork_images(artwork_id);

-- ─────────────────────────────────────────── blog
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content_md text not null,
  cover_path text,
  cover_alt text,
  tags text[] default '{}',
  seo_title text, seo_description text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint cover_needs_alt check (cover_path is null or length(coalesce(cover_alt, '')) >= 10)
);
create trigger posts_touch before update on posts for each row execute function touch_updated_at();

-- ─────────────────────────────────────────── projects / timeline / testimonials
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  city text not null,
  place text,
  status text check (status in ('completed','in_progress','live_painting','open_slot')),
  link_url text,
  image_path text, image_alt text
);

create table if not exists timeline (
  id uuid primary key default gen_random_uuid(),
  year int, text text, image_path text, image_alt text, sort_order int default 0
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text, source text, sort_order int default 0
);

-- ─────────────────────────────────────────── settings (single row)
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  artist_name text default 'Jeff',
  tagline_words text[] default '{Walls,that,talk,back.}',
  bio_md text,
  city text,
  contact_email text,
  stats jsonb,
  socials jsonb,
  hero_image_path text, hero_image_alt text,
  story_image_path text, story_image_alt text,
  process_video_url text,
  process_poster_path text,  -- addition: poster for the process video block
  series_name text           -- addition: "New series ___ — out now" in the hero
);
insert into settings (id) values (1) on conflict do nothing;

-- ─────────────────────────────────────────── enquiries + click log
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) <= 120),
  email text not null check (length(email) <= 200),
  organisation text,
  topic text, preferred_date date,
  message text check (length(message) <= 600),
  artwork_id uuid references artworks(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists enquiries_email_created_idx on enquiries(email, created_at desc);

create table if not exists contact_clicks (
  id bigint generated always as identity primary key,
  artwork_id uuid references artworks(id) on delete cascade,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────── RLS
alter table admins          enable row level security;
alter table artworks        enable row level security;
alter table artwork_images  enable row level security;
alter table posts           enable row level security;
alter table projects        enable row level security;
alter table timeline        enable row level security;
alter table testimonials    enable row level security;
alter table settings        enable row level security;
alter table enquiries       enable row level security;
alter table contact_clicks  enable row level security;

-- admins: an admin can see the list; nobody can write through the API (add rows in the SQL editor)
create policy "admins read" on admins for select using (is_admin());

-- public read
create policy "public read artworks" on artworks for select using (published = true or is_admin());
create policy "public read images"   on artwork_images for select using (
  exists (select 1 from artworks a where a.id = artwork_id and (a.published or is_admin()))
);
create policy "public read posts"    on posts for select using (published = true or is_admin());
create policy "public read projects" on projects for select using (true);
create policy "public read timeline" on timeline for select using (true);
create policy "public read quotes"   on testimonials for select using (true);
create policy "public read settings" on settings for select using (true);

-- public insert only
create policy "public insert enquiries" on enquiries for insert with check (true);
create policy "public insert clicks"    on contact_clicks for insert with check (true);

-- admin full access
create policy "admin all artworks" on artworks       for all using (is_admin()) with check (is_admin());
create policy "admin all images"   on artwork_images for all using (is_admin()) with check (is_admin());
create policy "admin all posts"    on posts          for all using (is_admin()) with check (is_admin());
create policy "admin all projects" on projects       for all using (is_admin()) with check (is_admin());
create policy "admin all timeline" on timeline       for all using (is_admin()) with check (is_admin());
create policy "admin all quotes"   on testimonials   for all using (is_admin()) with check (is_admin());
create policy "admin all settings" on settings       for all using (is_admin()) with check (is_admin());
create policy "admin read enquiries"   on enquiries      for select using (is_admin());
create policy "admin delete enquiries" on enquiries      for delete using (is_admin());
create policy "admin read clicks"      on contact_clicks for select using (is_admin());

-- ─────────────────────────────────────────── storage
insert into storage.buckets (id, name, public) values ('artworks', 'artworks', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('blog', 'blog', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('site', 'site', true) on conflict (id) do nothing;

create policy "public read site images" on storage.objects for select
  using (bucket_id in ('artworks', 'blog', 'site'));
create policy "admin upload" on storage.objects for insert
  with check (bucket_id in ('artworks', 'blog', 'site') and is_admin());
create policy "admin update" on storage.objects for update
  using (bucket_id in ('artworks', 'blog', 'site') and is_admin());
create policy "admin delete" on storage.objects for delete
  using (bucket_id in ('artworks', 'blog', 'site') and is_admin());

-- ─────────────────────────────────────────── after creating Jeff's auth user:
-- insert into admins (user_id) select id from auth.users where email = 'jeff@gmail.com';
