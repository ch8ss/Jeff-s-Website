// One-time import of the starter content (Jeff's photos in public/work, clips in public/video)
// into Supabase, so the admin starts with his existing work instead of an empty site.
//
//   node scripts/import-to-supabase.mjs
//
// Also fills the story text, stats, timeline, projects, testimonials and blog posts from lib/seed.ts.
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, and both SQL
// migrations already run. Safe to re-run: artworks/clips that already exist are skipped.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "..");
if (existsSync(path.join(root, ".env.local"))) {
  for (const line of readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*)"?/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const manifest = JSON.parse(readFileSync(path.join(root, "lib/work-manifest.json"), "utf8"));
// The starter text (story, stats, timeline, projects, testimonials, posts) lives in lib/seed.ts.
const { createJiti } = createRequire(import.meta.url)("jiti");
const seed = await createJiti(import.meta.url).import(path.join(root, "lib/seed.ts"));

const CLIPS = [
  ["neon-face", "Neon face mural"],
  ["car-body-figure", "Airbrushing a figure on a car body"],
  ["wildstyle-letters", "Wildstyle letters"],
  ["veiled-portrait", "Veiled portrait"],
  ["uv-heart", "UV heart wall"],
  ["airbrushed-snake", "Airbrushed snake"],
  ["soldier-portrait", "Soldier portrait in spray paint"],
  ["abandoned-walls", "Walls in an abandoned building"],
];

async function upload(bucket, key, localPublicPath, contentType) {
  const body = readFileSync(path.join(root, "public", localPublicPath));
  const { error } = await db.storage.from(bucket).upload(key, body, { contentType, upsert: true });
  if (error) throw new Error(`${localPublicPath}: ${error.message}`);
  return `${bucket}/${key}`;
}

let made = 0;
for (const [i, a] of manifest.artworks.entries()) {
  const { data: exists } = await db.from("artworks").select("id").eq("slug", a.slug).maybeSingle();
  if (exists) continue;
  const { data: art, error } = await db
    .from("artworks")
    .insert({
      slug: a.slug,
      code: `JF-${String(i + 1).padStart(3, "0")}`,
      title: a.title,
      category: a.category,
      medium: a.medium,
      is_featured: a.featured > 0,
      is_for_sale: false,
      status: "not_for_sale",
      currency: "USD",
      sort_order: a.featured || 100 + i,
      created_at: new Date(Date.UTC(2026, 9, 1) - i * 86_400_000).toISOString(),
    })
    .select("id")
    .single();
  if (error) throw new Error(`${a.slug}: ${error.message}`);
  const rows = [];
  for (const [k, img] of a.images.entries()) {
    const storage_path = await upload("artworks", `${art.id}/${path.basename(img.path)}`, img.path, "image/webp");
    rows.push({ artwork_id: art.id, storage_path, alt: img.alt, width: img.width, height: img.height, is_cover: k === 0, sort_order: k });
  }
  const { error: imgErr } = await db.from("artwork_images").insert(rows);
  if (imgErr) throw new Error(`${a.slug} images: ${imgErr.message}`);
  made++;
  console.log(`✓ ${a.title} (${rows.length} image${rows.length > 1 ? "s" : ""})`);
}

const { count: clipCount } = await db.from("clips").select("id", { count: "exact", head: true });
if (!clipCount) {
  for (const [k, [name, caption]] of CLIPS.entries()) {
    const video_path = await upload("site", `clips/${name}.mp4`, `/video/${name}.mp4`, "video/mp4");
    const poster_path = await upload("site", `clips/${name}.webp`, `/video/${name}.webp`, "image/webp");
    await db.from("clips").insert({ video_path, poster_path, caption, sort_order: k });
    console.log(`✓ clip: ${caption}`);
  }
}

// Timeline, projects, testimonials, posts: only when the table is still empty. Seed ids are
// placeholders ("t1", "b2"…), so they're dropped and the DB assigns uuids.
const lists = { timeline: seed.seedTimeline, projects: seed.seedProjects, testimonials: seed.seedTestimonials, posts: seed.seedPosts };
const filled = [];
for (const [table, rows] of Object.entries(lists)) {
  const { count, error: countErr } = await db.from(table).select("id", { count: "exact", head: true });
  if (countErr) throw new Error(`${table}: ${countErr.message}`);
  if (count) continue;
  const { error } = await db.from(table).insert(rows.map(({ id, ...row }) => row));
  if (error) throw new Error(`${table}: ${error.message}`);
  filled.push(table);
  console.log(`✓ ${table} (${rows.length})`);
}

// Settings: only fill text, images and video that are still empty, never overwrite Jeff's edits.
const { data: s } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
const patch = {};
if (!s?.hero_image_path) {
  patch.hero_image_path = await upload("site", "hero.webp", manifest.singles.hero.path, "image/webp");
  patch.hero_image_alt = "Pink, purple and silver galaxy graffiti piece by Jeff painted along the side of a freight train car";
}
if (!s?.story_image_path) {
  patch.story_image_path = await upload("site", "portrait.webp", manifest.singles.portrait.path, "image/webp");
  patch.story_image_alt = "Jeff sitting on a stool in front of one of his colourful indoor murals";
}
if (!s?.process_poster_path) patch.process_poster_path = await upload("site", "process.webp", manifest.singles.process.path, "image/webp");
if (!s?.process_video_url) patch.process_video_url = "site/clips/abandoned-walls.mp4";
const ss = seed.seedSettings;
if (!s?.bio_md) patch.bio_md = ss.bio_md;
if (!s?.stats) patch.stats = ss.stats;
if (!s?.socials) patch.socials = ss.socials;
if (!s?.series_name) patch.series_name = ss.series_name;
if (!s?.contact_email && process.env.NEXT_PUBLIC_ARTIST_EMAIL) patch.contact_email = process.env.NEXT_PUBLIC_ARTIST_EMAIL;
if (Object.keys(patch).length) await db.from("settings").upsert({ id: 1, ...patch });

console.log(`\nDone: ${made} new artworks${clipCount ? "" : `, ${CLIPS.length} clips`}${filled.length ? `, ${filled.join(", ")}` : ""}${Object.keys(patch).length ? ", settings" : ""}.`);
