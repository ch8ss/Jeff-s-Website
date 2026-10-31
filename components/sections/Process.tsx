import Image from "next/image";
import type { Clip, Testimonial } from "@/lib/types";
import { ClipReel } from "../ui/ClipReel";
import { SectionLabel } from "../ui/SectionLabel";
import { Marquee } from "../ui/Marquee";
import { PlayButton } from "../ui/PlayButton";

function Quote({ t }: { t: Testimonial }) {
  return (
    <figure className="mx-2 w-[min(78vw,380px)] shrink-0 rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] p-6">
      <blockquote className="serif-italic text-xl leading-snug text-text-light/90 md:text-2xl">“{t.quote}”</blockquote>
      <figcaption className="label mt-5 text-muted">{t.source}</figcaption>
    </figure>
  );
}

export function Process({ testimonials, poster, clips }: { testimonials: Testimonial[]; poster: string; clips: Clip[] }) {
  const half = Math.ceil(testimonials.length / 2);
  const rowA = testimonials.slice(0, half);
  const rowB = testimonials.slice(half).length ? testimonials.slice(half) : rowA;

  return (
    <section id="process" aria-labelledby="process-title" data-bg="#08070C" data-theme="dark" className="relative bg-ink pb-24 text-text-light md:pb-36">
      <div className="px-3 md:px-6">
        <div className="relative isolate flex min-h-[88svh] items-end overflow-hidden rounded-[24px] p-6 md:p-12" data-cursor="PLAY">
          {poster && <Image src={poster} alt="" aria-hidden="true" fill sizes="100vw" className="-z-10 object-cover" data-reveal="img" />}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <PlayButton variant="badge" />
          </div>
          <div>
            <SectionLabel n="05">Process</SectionLabel>
            <h2 id="process-title" className="display mt-4 max-w-3xl text-[clamp(3rem,7vw,6.5rem)]">
              From blank wall to art
            </h2>
            <p className="label mt-3 opacity-70">Straight from the studio and the street</p>
          </div>
        </div>
      </div>

      {clips.length > 0 && (
        <div className="mt-16">
          <h3 className="label mb-5 px-5 opacity-70 md:px-10">Process clips</h3>
          <ClipReel clips={clips} />
        </div>
      )}

      {testimonials.length > 0 && (
        <div className="mt-16 space-y-4" aria-label="What clients say">
          <h3 className="sr-only">Testimonials</h3>
          <Marquee duration={60} pauseOnHover>
            {rowA.map((t) => (
              <Quote key={t.id} t={t} />
            ))}
          </Marquee>
          <Marquee duration={70} reverse pauseOnHover>
            {rowB.map((t) => (
              <Quote key={t.id} t={t} />
            ))}
          </Marquee>
        </div>
      )}
    </section>
  );
}
