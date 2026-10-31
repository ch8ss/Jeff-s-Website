import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { imageUrl } from "./storage";

export const OG_SIZE = { width: 1200, height: 630 };

/** Satori can't decode WebP, so fetch/read the image and convert to a PNG data URL. */
export async function toPngDataUrl(storagePath: string | null | undefined, width = 800) {
  const url = imageUrl(storagePath);
  if (!url) return null;
  try {
    const buf = url.startsWith("/")
      ? await readFile(path.join(process.cwd(), "public", url))
      : Buffer.from(await (await fetch(url)).arrayBuffer());
    const png = await sharp(buf).resize({ width }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export function OgFrame({ img, title, kicker }: { img: string | null; title: string; kicker: string }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#08070C", color: "#F1EEFA", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, flex: 1 }}>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#A6FF4D" }}>{kicker.toUpperCase()}</div>
        <div style={{ display: "flex", fontSize: title.length > 24 ? 72 : 96, fontWeight: 800, lineHeight: 0.95, textTransform: "uppercase" }}>{title}</div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 900, letterSpacing: -2, backgroundImage: "linear-gradient(90deg,#7B2FFF,#B57CFF,#A6FF4D)", backgroundClip: "text", color: "transparent" }}>JEFF</div>
      </div>
      {img && (
        <div style={{ display: "flex", width: 470, padding: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={img} width={406} height={566} style={{ objectFit: "cover", borderRadius: 24, width: 406, height: 566 }} />
        </div>
      )}
    </div>
  );
}
