import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase } from "./site";
import { publicClient } from "./supabase/public";
import { seedArtworks, seedClips, seedPosts, seedProjects, seedSettings, seedTestimonials, seedTimeline } from "./seed";
import type { Artwork, Clip, Post, Project, Settings, Testimonial, TimelineItem } from "./types";

// All public reads are cached and tagged; admin server actions call updateTag(...) after saves,
// so the live site updates immediately while every page still prerenders into a static shell.

export const TAGS = {
  artworks: "artworks",
  posts: "posts",
  projects: "projects",
  timeline: "timeline",
  testimonials: "testimonials",
  settings: "settings",
  clips: "clips",
} as const;

const ART_SELECT = "*, images:artwork_images(*)";

function sortImages(a: Artwork): Artwork {
  return { ...a, images: [...(a.images ?? [])].sort((x, y) => Number(y.is_cover) - Number(x.is_cover) || x.sort_order - y.sort_order) };
}

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.settings);
  if (!hasSupabase) return seedSettings;
  const { data } = await publicClient().from("settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return seedSettings;
  return {
    ...seedSettings,
    ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null)),
    stats: data.stats ?? [],
    socials: data.socials ?? {},
  } as Settings;
}

export async function getArtworks(): Promise<Artwork[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.artworks);
  if (!hasSupabase) return seedArtworks;
  const { data } = await publicClient()
    .from("artworks")
    .select(ART_SELECT)
    .eq("published", true)
    .order("created_at", { ascending: false });
  return ((data ?? []) as Artwork[]).map(sortImages);
}

export async function getFeaturedArtworks(): Promise<Artwork[]> {
  const all = await getArtworks();
  return all.filter((a) => a.is_featured).sort((a, b) => a.sort_order - b.sort_order);
}

export async function getForSaleArtworks(): Promise<Artwork[]> {
  const all = await getArtworks();
  return all.filter((a) => a.is_for_sale);
}

export async function getWallArtworks(): Promise<Artwork[]> {
  const all = await getArtworks();
  return [...all].sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.created_at.localeCompare(a.created_at));
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  const all = await getArtworks();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getRelatedArtworks(art: Artwork, n = 3): Promise<Artwork[]> {
  const all = await getArtworks();
  const others = all.filter((a) => a.id !== art.id);
  const same = others.filter((a) => a.category === art.category);
  return [...same, ...others.filter((a) => a.category !== art.category)].slice(0, n);
}

export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.posts);
  if (!hasSupabase) return seedPosts;
  const { data } = await publicClient()
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data ?? []) as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.projects);
  if (!hasSupabase) return seedProjects;
  const { data } = await publicClient().from("projects").select("*").order("date", { ascending: false });
  return (data ?? []) as Project[];
}

export async function getTimeline(): Promise<TimelineItem[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.timeline);
  if (!hasSupabase) return seedTimeline;
  const { data } = await publicClient().from("timeline").select("*").order("sort_order");
  return (data ?? []) as TimelineItem[];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.testimonials);
  if (!hasSupabase) return seedTestimonials;
  const { data } = await publicClient().from("testimonials").select("*").order("sort_order");
  return (data ?? []) as Testimonial[];
}

export async function getClips(): Promise<Clip[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.clips);
  if (!hasSupabase) return seedClips;
  const { data } = await publicClient().from("clips").select("*").order("sort_order");
  return (data ?? []) as Clip[];
}

export function readingTime(md: string) {
  return Math.max(1, Math.round(md.split(/\s+/).length / 220));
}
