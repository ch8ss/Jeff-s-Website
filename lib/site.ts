export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const ARTIST_EMAIL = process.env.NEXT_PUBLIC_ARTIST_EMAIL ?? "jeff@example.com";
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when Supabase is configured. Without it the site renders demo content from lib/seed.ts. */
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const SITE_TITLE = "Jeff — Wall Art & Graffiti";
export const SITE_DESCRIPTION =
  "Jeff is a muralist and graffiti artist. Commission a wall, buy original canvases and prints, and follow new work from the street.";
