"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

type Img = { src: string; alt: string; width: number; height: number };

export function ArtGallery({ images, title }: { images: Img[]; title: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const main = images[active];
  if (!main) return null;

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} data-cursor="VIEW" aria-label={`Open full-screen view of ${title}`} className="relative block w-full overflow-hidden rounded-[var(--radius-card)] bg-white/5">
        <span aria-hidden="true" className="label absolute right-3 bottom-3 z-10 rounded-full bg-ink/75 px-3 py-2 text-text-light backdrop-blur">⤢ Enlarge</span>
        <Image src={main.src} alt={main.alt} width={main.width} height={main.height} loading="eager" fetchPriority="high" sizes="(min-width:1024px) 55vw, 100vw" className="h-auto max-h-[80vh] w-full object-contain" />
      </button>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3">
          {images.map((img, i) => (
            <li key={img.src}>
              <button type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-current={i === active} className={`relative block h-20 w-20 overflow-hidden rounded-xl border-2 ${i === active ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"}`}>
                <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Lightbox open={open} close={() => setOpen(false)} index={active} slides={images.map((i) => ({ src: i.src, alt: i.alt, width: i.width, height: i.height }))} plugins={[Zoom]} />
    </div>
  );
}
