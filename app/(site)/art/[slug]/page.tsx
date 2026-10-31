import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getArtworkBySlug, getArtworks, getRelatedArtworks, getSettings } from "@/lib/queries";
import { imageUrl } from "@/lib/storage";
import { formatPrice, formatSize } from "@/lib/format";
import { artworkJsonLd, truncate } from "@/lib/seo";
import { buildArtEnquiry } from "@/lib/contact";
import { SITE_URL } from "@/lib/site";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { StatusTag } from "@/components/ui/StatusTag";
import { ArtCard } from "@/components/ui/ArtCard";
import { ArtGallery } from "@/components/ArtGallery";
import { ContactArtist, CopyButton, ShareLinks } from "@/components/ContactArtist";
import { ScrollEffects } from "@/components/ui/Motion";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";

export async function generateStaticParams() {
  const all = await getArtworks();
  return all.length ? all.map((a) => ({ slug: a.slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/art/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const art = await getArtworkBySlug(slug);
  if (!art) return { title: "Artwork not found", robots: { index: false } };
  const title = art.seo_title ?? `${art.title}${art.year ? ` (${art.year})` : ""}`;
  const description = art.seo_description ?? truncate(art.description) ?? `${art.title} by Jeff — ${art.medium ?? art.category}.`;
  return {
    title,
    description,
    alternates: { canonical: `/art/${art.slug}` },
    openGraph: { type: "article", title, description, url: `/art/${art.slug}` },
  };
}

async function ArtDetail({ params }: { params: PageProps<"/art/[slug]">["params"] }) {
  const { slug } = await params;
  const [art, settings] = await Promise.all([getArtworkBySlug(slug), getSettings()]);
  if (!art) notFound();
  const related = await getRelatedArtworks(art);
  const email = settings.contact_email ?? undefined;
  const enquiry = buildArtEnquiry(art, email);
  const images = art.images.map((i) => ({ src: imageUrl(i.storage_path)!, alt: i.alt, width: i.width ?? 1200, height: i.height ?? 1500 }));
  const isWall = art.category === "mural" || art.category === "graffiti";
  const edition = art.category === "print" ? "Limited print" : isWall ? "Site-specific wall" : "Original";
  // Only pieces that are actually listed live under "For Sale"; everything else is portfolio work.
  const section = art.is_for_sale ? { name: "For Sale", path: "/for-sale" } : { name: "Walls", path: "/walls" };

  return (
    <>
      <JsonLd data={artworkJsonLd(art, settings.artist_name)} />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, section, { name: art.title, path: `/art/${art.slug}` }]} />

      <article className="mt-10 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <ArtGallery images={images} title={art.title} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="label opacity-60">{art.code}</span>
            <StatusTag status={art.is_for_sale ? art.status : "not_for_sale"} />
          </div>
          <h1 className="display mt-4 text-[clamp(3rem,6vw,5.5rem)]">{art.title}</h1>
          {art.year && <p className="serif-italic text-2xl text-accent-2">{art.year}</p>}

          <dl className="mt-8 grid grid-cols-[8rem_1fr] gap-y-3 border-y border-white/10 py-6 text-sm">
            <dt className="label text-text-light/70">Category</dt><dd className="capitalize">{art.category}</dd>
            {art.medium && (<><dt className="label text-text-light/70">Medium</dt><dd>{art.medium}</dd></>)}
            {formatSize(art) && (<><dt className="label text-text-light/70">Dimensions</dt><dd>{formatSize(art)}</dd></>)}
            <dt className="label text-text-light/70">Edition</dt><dd>{edition}</dd>
            {(art.location_name || art.city) && (
              <>
                <dt className="label text-text-light/70">Location</dt>
                <dd>{art.map_url ? <a href={art.map_url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:text-accent">{[art.location_name, art.city].filter(Boolean).join(", ")}</a> : [art.location_name, art.city].filter(Boolean).join(", ")}</dd>
              </>
            )}
          </dl>

          {art.is_for_sale && <p className={`display mt-6 text-4xl ${art.status === "sold" ? "line-through opacity-50" : ""}`}>{formatPrice(art.price, art.currency)}</p>}

          {art.description && <p className="mt-6 max-w-prose text-lg leading-relaxed text-text-light/80">{art.description}</p>}

          {!art.is_for_sale && (
            <div className="mt-8 rounded-[var(--radius-card)] border border-accent-2/30 bg-glow/10 p-5">
              <p className="serif-italic text-2xl text-accent-2">{isWall ? "Want a wall like this?" : "Like this piece?"}</p>
              <p className="mt-2 text-sm leading-relaxed text-text-light/85">
                {isWall
                  ? "This one lives on a wall, but Jeff paints new murals and graffiti pieces to order: shop fronts, garages, cafés, bedrooms and more."
                  : "This piece isn't listed for sale. Jeff takes commissions for canvases, custom panels, helmets and more, so ask about something similar."}
              </p>
              <Link href="/#contact" className="label mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-ink transition-colors hover:bg-accent-hover">
                {isWall ? "Commission a wall" : "Commission something similar"} <Arrow />
              </Link>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <ContactArtist mailto={enquiry.mailto} gmail={enquiry.gmail} email={enquiry.email} artworkId={art.id} label={art.is_for_sale ? "Contact artist" : "Ask about this piece"} variant={art.is_for_sale ? "accent" : "outline"} />
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-light/80">
              <span>{enquiry.email}</span>
              <CopyButton text={enquiry.email} label="Copy email" />
            </div>
            <ShareLinks url={`${SITE_URL}/art/${art.slug}`} title={art.title} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-28">
          <h2 id="related-title" className="display text-5xl">More from Jeff</h2>
          <ul className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <li key={a.id}><ArtCard art={a} /></li>
            ))}
          </ul>
        </section>
      )}
      <ScrollEffects />
    </>
  );
}

export default function ArtPage({ params }: PageProps<"/art/[slug]">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="h-[70vh] animate-pulse rounded-[var(--radius-card)] bg-white/5" />}>
        <ArtDetail params={params} />
      </Suspense>
    </PageShell>
  );
}
