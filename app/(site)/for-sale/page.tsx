import type { Metadata } from "next";
import { getForSaleArtworks } from "@/lib/queries";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ForSaleGrid } from "@/components/ForSaleGrid";
import { ScrollEffects } from "@/components/ui/Motion";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";

export const metadata: Metadata = {
  title: "Art for sale — original canvases & prints",
  description: "Buy original canvases, limited prints and sketches by Jeff, or commission a mural. Prices, sizes and availability for every piece.",
  alternates: { canonical: "/for-sale" },
};

export default async function ForSalePage() {
  const items = await getForSaleArtworks();
  return (
    <PageShell>
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "For Sale", path: "/for-sale" }]} />
      <p className="label mt-10 text-accent">For sale</p>
      <h1 className="display text-outline-light mt-4 text-[clamp(4rem,12vw,11rem)]">Art for sale</h1>
      <p className="serif-italic mt-4 max-w-xl text-2xl text-text-light/80">Originals and prints, straight from the studio.</p>
      {items.length ? (
        <ForSaleGrid items={items} />
      ) : (
        <div className="mt-12 grid gap-6 border-t border-white/10 pt-10 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="serif-italic text-3xl text-accent-2 md:text-4xl">New originals and prints are on the way.</p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-light/85">
              Nothing is listed right now, but Jeff paints to order: walls, canvases, car panels, helmets and custom pieces. Tell him what you have in mind, or browse everything he has made so far.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/#contact" className="label inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 text-ink hover:bg-accent-hover">
              Commission a piece <Arrow />
            </Link>
            <Link href="/walls" className="label inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-6 hover:border-accent hover:text-accent">
              See all work
            </Link>
          </div>
        </div>
      )}
      <ScrollEffects />
    </PageShell>
  );
}
