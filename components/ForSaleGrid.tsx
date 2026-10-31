"use client";

import { useMemo, useState } from "react";
import type { Artwork } from "@/lib/types";
import { ArtCard } from "./ui/ArtCard";

const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "canvas", label: "Canvas", test: (a: Artwork) => a.category === "canvas" },
  { id: "prints", label: "Prints", test: (a: Artwork) => a.category === "print" },
  { id: "murals", label: "Murals (commission)", test: (a: Artwork) => a.category === "mural" || a.category === "graffiti" },
  { id: "under10k", label: "Under ₹10K", test: (a: Artwork) => a.price != null && a.price < 10000 },
] as const;

const SORTS = {
  newest: { label: "Newest", fn: (a: Artwork, b: Artwork) => b.created_at.localeCompare(a.created_at) },
  low: { label: "Price low → high", fn: (a: Artwork, b: Artwork) => (a.price ?? Infinity) - (b.price ?? Infinity) },
  high: { label: "Price high → low", fn: (a: Artwork, b: Artwork) => (b.price ?? -1) - (a.price ?? -1) },
};

/** All items are server-rendered into the HTML; filtering just narrows the list client-side. */
export function ForSaleGrid({ items }: { items: Artwork[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [sort, setSort] = useState<keyof typeof SORTS>("newest");

  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!;
    return items.filter(f.test).sort(SORTS[sort].fn);
  }, [items, filter, sort]);

  return (
    <>
      <div className="mt-12 flex flex-col gap-5 border-y border-white/10 py-5 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter artworks" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`label rounded-full border px-4 py-2.5 transition-colors ${filter === f.id ? "border-accent bg-accent text-ink" : "border-white/20 hover:border-white/50"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="label flex items-center gap-3">
          <span className="opacity-60">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="rounded-full border border-white/20 bg-ink px-4 py-2.5 normal-case tracking-normal">
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="sr-only" aria-live="polite">{shown.length} artworks shown</p>
      {shown.length ? (
        <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <li key={a.id}><ArtCard art={a} /></li>
          ))}
        </ul>
      ) : (
        <p className="serif-italic mt-16 text-3xl text-text-light/60">Nothing here right now. Check back soon, or ask about a commission.</p>
      )}
    </>
  );
}
