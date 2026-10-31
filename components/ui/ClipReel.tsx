"use client";

import { useEffect, useRef } from "react";
import type { Clip } from "@/lib/types";
import { imageUrl } from "@/lib/storage";

/**
 * Row of short vertical process clips. Muted, looping, and only playing while on screen
 * (videos load lazily). With reduced motion they don't autoplay; native controls are shown instead.
 */
export function ClipReel({ clips }: { clips: Clip[] }) {
  const root = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const vids = root.current?.querySelectorAll("video") ?? [];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.5 },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <ul ref={root} className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-4 md:scroll-px-10 md:px-10" aria-label="Process clips">
      {clips.map((c) => (
        <li key={c.id} className="w-[58vw] shrink-0 snap-start sm:w-[260px]">
          <figure>
            <div className="relative aspect-[9/16] overflow-hidden rounded-[var(--radius-card)] bg-white/5">
              <video
                src={imageUrl(c.video_path) ?? undefined}
                poster={imageUrl(c.poster_path) ?? undefined}
                muted
                loop
                playsInline
                preload="none"
                aria-label={c.caption ?? "Process clip"}
                className="h-full w-full object-cover motion-reduce:pointer-events-auto"
                controls={false}
                onClick={(e) => {
                  const v = e.currentTarget;
                  if (v.paused) v.play().catch(() => {});
                  else v.pause();
                }}
              />
            </div>
            {c.caption && <figcaption className="label mt-3 text-text-light/70">{c.caption}</figcaption>}
          </figure>
        </li>
      ))}
    </ul>
  );
}
