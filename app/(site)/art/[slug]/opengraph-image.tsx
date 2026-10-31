import { ImageResponse } from "next/og";
import { getArtworkBySlug, getArtworks } from "@/lib/queries";
import { OG_SIZE, OgFrame, toPngDataUrl } from "@/lib/og";

export const alt = "Artwork by Jeff";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const all = await getArtworks();
  return all.length ? all.map((a) => ({ slug: a.slug })) : [{ slug: "__placeholder__" }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const art = await getArtworkBySlug(slug);
  const img = await toPngDataUrl(art?.images[0]?.storage_path);
  return new ImageResponse(<OgFrame img={img} title={art?.title ?? "Artwork"} kicker={[art?.medium, art?.year].filter(Boolean).join(" · ") || "Artwork"} />, size);
}
