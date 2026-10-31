import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/types";
import { imageUrl } from "@/lib/storage";
import { formatPrice, formatSize } from "@/lib/format";
import { StatusTag } from "./StatusTag";

export function ArtCard({ art, sizes = "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw", showPrice = true }: { art: Artwork; sizes?: string; showPrice?: boolean }) {
  const cover = art.images[0];
  const src = imageUrl(cover?.storage_path);
  return (
    <article className="group">
      <Link href={`/art/${art.slug}`} data-cursor="VIEW" className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent rounded-[var(--radius-card)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-white/5">
          {src && (
            <Image src={src} alt={cover.alt} fill sizes={sizes} className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          )}
          {art.is_for_sale && <StatusTag status={art.status} className="absolute top-3 left-3 backdrop-blur" />}
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="display text-2xl">{art.title}</h3>
            <p className="mt-1 text-sm opacity-60">
              {[art.medium, formatSize(art), art.year].filter(Boolean).join(" · ")}
            </p>
          </div>
          {showPrice && art.is_for_sale && (
            <p className={`shrink-0 text-sm ${art.status === "sold" ? "line-through opacity-50" : ""}`}>{formatPrice(art.price, art.currency)}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
