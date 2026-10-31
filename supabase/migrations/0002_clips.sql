-- Process clips: short videos shown in the Process section reel, managed in /admin/clips.
create table if not exists clips (
  id uuid primary key default gen_random_uuid(),
  video_path text not null,
  poster_path text,
  caption text,
  sort_order int default 0
);
alter table clips enable row level security;
create policy "public read clips" on clips for select using (true);
create policy "admin all clips"   on clips for all using (is_admin()) with check (is_admin());

-- Allow larger uploads in the site bucket (videos). 50 MB is the free-plan maximum.
update storage.buckets set file_size_limit = 52428800 where id = 'site';
