import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getWallArtworks } from "@/lib/queries";
import { imageUrl } from "@/lib/storage";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ScrollEffects } from "@/components/ui/Motion";
import { Masonry } from "@/components/ui/Masonry";

export const metadata: Metadata = {
  title: "Walls — murals, graffiti & studio work",
  description: "The full archive of Jeff's murals, graffiti walls, canvases and prints, with locations and years.",
  alternates: { canonical: "/walls" },
};

export default async function WallsPage() {
  const all = await getWallArtworks();
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Walls", path: "/walls" }]} />
      <h1 className="mt-10 flex flex-wrap items-baseline gap-x-5">
        <span className="display text-[clamp(3.5rem,10vw,9rem)]">All the</span>
        <span className="serif-italic text-[clamp(3.5rem,10vw,9rem)] leading-none text-accent">walls</span>
      </h1>
      <div className="mt-14">
        <Masonry
          gap="gap-5"
          extraRatio={0.16}
          layouts={[
            { cols: 1, className: "flex sm:hidden" },
            { cols: 2, className: "hidden sm:flex lg:hidden" },
            { cols: 3, className: "hidden lg:flex" },
          ]}
          items={all.flatMap((a) => {
            const img = a.images[0];
            if (!img) return [];
            return [{
              key: a.id,
              ratio: (img.height ?? 1200) / (img.width ?? 1000),
              node: (
                <Link href={`/art/${a.slug}`} data-cursor="VIEW" className="group block" data-reveal="fade">
                  <div className="overflow-hidden rounded-[var(--radius-card)]">
                    <Image src={imageUrl(img.storage_path)!} alt={img.alt} width={img.width ?? 1000} height={img.height ?? 1200} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="h-auto w-full transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-4">
                    <h2 className="display text-2xl">{a.title}</h2>
                    <p className="label capitalize text-text-light/70">{[a.city, a.year].filter(Boolean).join(" · ") || a.category}</p>
                  </div>
                </Link>
              ),
            }];
          })}
        />
      </div>
      <ScrollEffects />
    </PageShell>
  );
}
