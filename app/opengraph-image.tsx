import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/queries";
import { OG_SIZE, OgFrame, toPngDataUrl } from "@/lib/og";

export const alt = "Jeff — Wall Art & Graffiti Artist";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const s = await getSettings();
  const img = await toPngDataUrl(s.hero_image_path);
  return new ImageResponse(<OgFrame img={img} title="Wall art & graffiti" kicker={`Muralist · ${s.city ?? ""}`} />, size);
}
