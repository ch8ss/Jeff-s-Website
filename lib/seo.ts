import type { Artwork, Post, Settings } from "./types";
import { imageUrl } from "./storage";
import { SITE_URL } from "./site";

const abs = (p: string | null | undefined) => {
  const u = imageUrl(p);
  return u ? (u.startsWith("/") ? `${SITE_URL}${u}` : u) : undefined;
};

export function personJsonLd(s: Settings) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: s.artist_name,
      jobTitle: "Muralist & Graffiti Artist",
      url: SITE_URL,
      image: abs(s.story_image_path ?? s.hero_image_path),
      address: s.city ? { "@type": "PostalAddress", addressLocality: s.city } : undefined,
      sameAs: Object.values(s.socials ?? {}).filter(Boolean),
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: `${s.artist_name} — Wall Art & Graffiti`, url: SITE_URL },
  ];
}

export function artworkJsonLd(a: Artwork, artist: string) {
  const offer =
    a.is_for_sale && a.price
      ? {
          "@type": "Offer",
          price: a.price,
          priceCurrency: a.currency,
          url: `${SITE_URL}/art/${a.slug}`,
          availability:
            a.status === "available"
              ? "https://schema.org/InStock"
              : a.status === "reserved"
                ? "https://schema.org/LimitedAvailability"
                : "https://schema.org/SoldOut",
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: a.title,
    description: a.description ?? undefined,
    image: a.images.map((i) => abs(i.storage_path)),
    artMedium: a.medium ?? undefined,
    artform: a.category,
    width: a.width_cm ? { "@type": "Distance", name: `${a.width_cm} cm` } : undefined,
    height: a.height_cm ? { "@type": "Distance", name: `${a.height_cm} cm` } : undefined,
    dateCreated: a.year ? String(a.year) : undefined,
    creator: { "@type": "Person", name: artist, url: SITE_URL },
    offers: offer,
  };
}

export function postJsonLd(p: Post, artist: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    image: abs(p.cover_path),
    datePublished: p.published_at ?? p.created_at,
    dateModified: p.updated_at,
    author: { "@type": "Person", name: artist, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${p.slug}`,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function truncate(s: string | null | undefined, n = 155) {
  if (!s) return undefined;
  const clean = s.replace(/[#*_>`\[\]]/g, "").replace(/\s+/g, " ").trim();
  return clean.length > n ? `${clean.slice(0, n - 1).trimEnd()}…` : clean;
}
