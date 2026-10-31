"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HoverPreview } from "./ui/HoverPreview";

type Item = { slug: string; title: string; date: string; dateLabel: string; minutes: number; excerpt: string | null; cover: string | null };

const PAGE = 10;

export function BlogList({ posts }: { posts: Item[] }) {
  const [n, setN] = useState(PAGE);
  return (
    <HoverPreview>
      <ul className="mt-14 border-t border-white/10">
        {posts.slice(0, n).map((p) => (
          <li key={p.slug} className="group border-b border-white/10">
            <Link href={`/blog/${p.slug}`} data-cursor="VIEW" className="grid gap-5 px-2 py-8 transition-colors hover:bg-white/[0.03] sm:grid-cols-[11rem_1fr] sm:items-center md:grid-cols-[15rem_1fr_auto] md:gap-8">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-white/5">
                {p.cover && <Image src={p.cover} alt="" fill sizes="(min-width:768px) 240px, (min-width:640px) 176px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
              </div>
              <div>
                <p className="flex flex-wrap gap-x-3 text-sm text-text-light/75">
                  <time dateTime={p.date}>{p.dateLabel}</time>
                  <span aria-hidden="true">·</span>
                  <span>{p.minutes} min read</span>
                </p>
                <h2 className="display mt-2 text-4xl transition-colors group-hover:text-accent md:text-5xl">{p.title}</h2>
                {p.excerpt && <p className="mt-3 max-w-2xl text-text-light/80">{p.excerpt}</p>}
              </div>
              <span aria-hidden="true" className="hidden h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-colors group-hover:border-accent group-hover:text-accent md:flex">↗</span>
            </Link>
          </li>
        ))}
      </ul>
      {n < posts.length && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={() => setN((x) => x + PAGE)} className="label rounded-full border border-white/25 px-6 py-3 hover:border-accent hover:text-accent">
            Load more
          </button>
        </div>
      )}
    </HoverPreview>
  );
}
