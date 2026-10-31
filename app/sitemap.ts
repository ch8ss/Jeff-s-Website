import type { MetadataRoute } from "next";
import { getArtworks, getPosts } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [arts, posts] = await Promise.all([getArtworks(), getPosts()]);
  const latest = [...arts.map((a) => a.updated_at), ...posts.map((p) => p.updated_at)].sort().pop();
  const statics = ["", "/for-sale", "/walls", "/blog"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: latest,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...statics,
    ...arts.map((a) => ({ url: `${SITE_URL}/art/${a.slug}`, lastModified: a.updated_at, priority: a.is_for_sale ? 0.8 : 0.6 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updated_at, priority: 0.6 })),
  ];
}
