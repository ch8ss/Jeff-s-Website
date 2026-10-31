import { SUPABASE_URL } from "./site";

/**
 * Resolve a stored image path to a URL. Absolute URLs and local "/..." paths pass through;
 * anything else is treated as "<bucket>/<path>" in Supabase Storage (public buckets).
 */
export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${path}`;
}
