"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { TAGS } from "@/lib/queries";
import { serverClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";

export type ActionResult = { ok: boolean; message?: string; id?: string };

// ───────────────────────────── auth
export async function signIn(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { ok: false, message: error.message };
  redirect("/admin");
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ───────────────────────────── artworks
const imageSchema = z.object({
  id: z.string().optional(),
  storage_path: z.string().min(1),
  alt: z.string().trim().min(10, "Every image needs alt text (at least 10 characters)"),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  is_cover: z.boolean(),
  sort_order: z.number().int(),
});

const num = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().nullable());

const artworkSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional(),
  code: z.string().trim().optional(),
  description: z.string().nullable().optional(),
  category: z.enum(["mural", "graffiti", "canvas", "print", "sketch", "other"]),
  medium: z.string().nullable().optional(),
  width_cm: num,
  height_cm: num,
  year: num,
  city: z.string().nullable().optional(),
  location_name: z.string().nullable().optional(),
  map_url: z.string().nullable().optional(),
  is_featured: z.boolean(),
  is_for_sale: z.boolean(),
  price: num,
  currency: z.string().default("INR"),
  status: z.enum(["available", "reserved", "sold", "not_for_sale"]),
  sort_order: num,
  seo_title: z.string().max(70).nullable().optional(),
  seo_description: z.string().max(170).nullable().optional(),
  published: z.boolean(),
  images: z.array(imageSchema).min(1, "Add at least one image"),
});

export type ArtworkInput = z.input<typeof artworkSchema>;

async function nextCode(supabase: Awaited<ReturnType<typeof serverClient>>) {
  const { data } = await supabase.from("artworks").select("code").like("code", "JF-%").order("code", { ascending: false }).limit(1);
  const n = data?.[0]?.code ? parseInt(data[0].code.slice(3), 10) + 1 : 1;
  return `JF-${String(n).padStart(3, "0")}`;
}

const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export async function saveArtwork(input: ArtworkInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = artworkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid data" };
  const { images, id, ...rest } = parsed.data;

  // The form pre-generates the id for new artworks so uploads can go to artworks/{id}/... right away.
  const existing = id ? (await supabase.from("artworks").select("id").eq("id", id).maybeSingle()).data : null;

  const row = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, blank(v)])) as Record<string, unknown>;
  row.slug = slugify(String(rest.slug || rest.title));
  row.code = rest.code || (existing ? undefined : await nextCode(supabase));
  row.sort_order = rest.sort_order ?? 0;
  if (!row.code) delete row.code;

  const { data, error } = existing
    ? await supabase.from("artworks").update(row).eq("id", existing.id).select("id, slug").single()
    : await supabase.from("artworks").insert({ ...row, ...(id ? { id } : {}) }).select("id, slug").single();
  if (error || !data) return { ok: false, message: error?.message ?? "Save failed" };

  // Replace image rows (storage objects are kept; deletes happen in deleteImageObject)
  await supabase.from("artwork_images").delete().eq("artwork_id", data.id);
  const hasCover = images.some((i) => i.is_cover);
  const { error: imgErr } = await supabase.from("artwork_images").insert(
    images.map((img, i) => ({
      artwork_id: data.id,
      storage_path: img.storage_path,
      alt: img.alt,
      width: img.width,
      height: img.height,
      is_cover: hasCover ? img.is_cover : i === 0,
      sort_order: i,
    })),
  );
  if (imgErr) return { ok: false, message: imgErr.message, id: data.id };

  updateTag(TAGS.artworks);
  return { ok: true, id: data.id, message: "Saved" };
}

export async function toggleArtworkField(id: string, field: "is_featured" | "is_for_sale" | "published", value: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("artworks").update({ [field]: value }).eq("id", id);
  updateTag(TAGS.artworks);
}

export async function deleteArtwork(id: string) {
  const { supabase } = await requireAdmin();
  const { data: imgs } = await supabase.from("artwork_images").select("storage_path").eq("artwork_id", id);
  await supabase.from("artworks").delete().eq("id", id);
  const paths = (imgs ?? []).map((i) => i.storage_path).filter((p) => p.startsWith("artworks/")).map((p) => p.slice("artworks/".length));
  if (paths.length) await supabase.storage.from("artworks").remove(paths);
  updateTag(TAGS.artworks);
  redirect("/admin/art");
}

// ───────────────────────────── posts
const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional(),
  excerpt: z.string().nullable().optional(),
  content_md: z.string().min(1, "Write something first"),
  cover_path: z.string().nullable().optional(),
  cover_alt: z.string().nullable().optional(),
  tags: z.array(z.string()),
  seo_title: z.string().max(70).nullable().optional(),
  seo_description: z.string().max(170).nullable().optional(),
  published: z.boolean(),
  published_at: z.string().nullable().optional(),
});
export type PostInput = z.input<typeof postSchema>;

export async function savePost(input: PostInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid data" };
  const { id, ...rest } = parsed.data;
  if (rest.cover_path && (rest.cover_alt ?? "").trim().length < 10) return { ok: false, message: "The cover image needs alt text (at least 10 characters)" };

  const row = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, blank(v)])) as Record<string, unknown>;
  row.slug = slugify(String(rest.slug || rest.title));
  row.tags = rest.tags;
  if (rest.published && !rest.published_at) row.published_at = new Date().toISOString();

  const { data, error } = id
    ? await supabase.from("posts").update(row).eq("id", id).select("id").single()
    : await supabase.from("posts").insert(row).select("id").single();
  if (error || !data) return { ok: false, message: error?.message ?? "Save failed" };
  updateTag(TAGS.posts);
  return { ok: true, id: data.id, message: "Saved" };
}

export async function deletePost(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("posts").delete().eq("id", id);
  updateTag(TAGS.posts);
  redirect("/admin/blog");
}

// ───────────────────────────── simple lists (projects, timeline, testimonials)
const LISTS = {
  projects: { tag: TAGS.projects, fields: ["date", "city", "place", "status", "link_url", "image_path", "image_alt"] },
  timeline: { tag: TAGS.timeline, fields: ["year", "text", "image_path", "image_alt", "sort_order"] },
  testimonials: { tag: TAGS.testimonials, fields: ["quote", "source", "sort_order"] },
  clips: { tag: TAGS.clips, fields: ["video_path", "poster_path", "caption", "sort_order"] },
} as const;
export type ListName = keyof typeof LISTS;

export async function saveListRow(list: ListName, formData: FormData) {
  const { supabase } = await requireAdmin();
  const cfg = LISTS[list];
  if (!cfg) throw new Error("Unknown list");
  const row: Record<string, unknown> = {};
  for (const f of cfg.fields) row[f] = blank(formData.get(f));
  if (list === "projects" && (!row.date || !row.city)) return;
  if (list === "clips" && !row.video_path) return;
  const id = formData.get("id");
  if (id) await supabase.from(list).update(row).eq("id", String(id));
  else await supabase.from(list).insert(row);
  updateTag(cfg.tag);
  refresh();
}

export async function deleteListRow(list: ListName, id: string) {
  const { supabase } = await requireAdmin();
  if (!LISTS[list]) throw new Error("Unknown list");
  await supabase.from(list).delete().eq("id", id);
  updateTag(LISTS[list].tag);
  refresh();
}

// ───────────────────────────── settings
export async function saveSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const g = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const stats = [0, 1, 2, 3]
    .map((i) => ({ value: g(`stat_value_${i}`), label: g(`stat_label_${i}`) }))
    .filter((s) => s.value && s.label);
  const socials = Object.fromEntries(
    ["instagram", "youtube", "behance", "x", "pinterest", "linkedin"].map((k) => [k, g(`social_${k}`)]).filter(([, v]) => v),
  );
  for (const k of ["hero", "story"]) {
    if (g(`${k}_image_path`) && (g(`${k}_image_alt`) ?? "").length < 10) return { ok: false, message: `The ${k} image needs alt text (at least 10 characters)` };
  }
  const row = {
    id: 1,
    artist_name: g("artist_name") ?? "Jeff",
    tagline_words: (g("tagline") ?? "Walls that talk back.").split(/\s+/).slice(0, 4),
    bio_md: g("bio_md"),
    city: g("city"),
    contact_email: g("contact_email"),
    series_name: g("series_name"),
    stats,
    socials,
    hero_image_path: g("hero_image_path"),
    hero_image_alt: g("hero_image_alt"),
    story_image_path: g("story_image_path"),
    story_image_alt: g("story_image_alt"),
    process_video_url: g("process_video_url"),
    process_poster_path: g("process_poster_path"),
  };
  const { error } = await supabase.from("settings").upsert(row);
  if (error) return { ok: false, message: error.message };
  updateTag(TAGS.settings);
  return { ok: true, message: "Settings saved — the live site is updated." };
}

export async function deleteEnquiry(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("enquiries").delete().eq("id", id);
  refresh();
}
