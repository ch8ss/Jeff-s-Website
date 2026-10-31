import Image from "next/image";
import type { Settings, TimelineItem } from "@/lib/types";
import { imageUrl } from "@/lib/storage";
import { SectionLabel } from "../ui/SectionLabel";
import { HoverPreview } from "../ui/HoverPreview";

/**
 * Splits "**bold**" markdown into words, marking bold phrases as accent. Punctuation that directly
 * follows a phrase ("**loud**,") is attached to the last word so no stray space appears before it.
 */
function toWords(md: string) {
  const out: { w: string; accent: boolean; tail?: string }[] = [];
  md.split(/(\*\*[^*]+\*\*)/g).forEach((chunk) => {
    const accent = chunk.startsWith("**");
    let text = chunk.replace(/\*\*/g, "");
    const lead = !accent && text.match(/^[^\s\w]+/)?.[0];
    if (lead && out.length) {
      out[out.length - 1].tail = (out[out.length - 1].tail ?? "") + lead;
      text = text.slice(lead.length);
    }
    text
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => out.push({ w, accent }));
  });
  return out;
}

function parseStat(value: string) {
  const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  return m ? { n: m[1], suffix: m[2] } : null;
}

export function Story({ settings, timeline }: { settings: Settings; timeline: TimelineItem[] }) {
  const src = imageUrl(settings.story_image_path);
  const words = toWords(settings.bio_md ?? "");

  return (
    <section id="story" aria-labelledby="story-title" data-bg="#120D1C" data-theme="dark" className="relative bg-mist px-5 py-24 text-text-light md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-ink lg:aspect-[3/4.4]">
            {src && <Image data-reveal="img" src={src} alt={settings.story_image_alt ?? ""} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />}
          </div>
        </div>

        <div>
          <SectionLabel n="01">The story</SectionLabel>
          <h2 id="story-title" className="sr-only">
            The story of {settings.artist_name}
          </h2>
          <p data-words className="serif-italic mt-8 text-[1.9rem] leading-[1.22] md:text-[2.4rem]">
            {words.map((w, i) => (
              <span key={i} className="word">
                <span className={w.accent ? "text-accent-2" : undefined}>{w.w}</span>
                {w.tail}{" "}
              </span>
            ))}
          </p>

          <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-white/10 pt-10 md:grid-cols-4">
            {settings.stats.map((s) => {
              const p = parseStat(s.value);
              return (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="label mt-2 text-text-light/80">{s.label}</dt>
                  <dd className="display text-6xl md:text-7xl" {...(p ? { "data-count": p.n, "data-suffix": p.suffix } : {})}>
                    {s.value}
                  </dd>
                </div>
              );
            })}
          </dl>

          {timeline.length > 0 && (
            <HoverPreview className="mt-20">
              <h3 className="label mb-4 text-text-light/80">Timeline</h3>
              <ol className="border-t border-white/10">
                {timeline.map((t) => (
                  <li
                    key={t.id}
                    data-preview-src={imageUrl(t.image_path) ?? undefined}
                    data-cursor={t.image_path ? "VIEW" : undefined}
                    className="group grid grid-cols-[6.5rem_1fr] items-center gap-6 border-b border-white/10 px-2 py-5 transition-colors duration-300 hover:bg-white/[0.04] md:grid-cols-[9rem_1fr]"
                  >
                    <span className="display text-4xl transition-colors duration-300 group-hover:text-accent md:text-5xl">{t.year}</span>
                    <span className="text-base md:text-lg">{t.text}</span>
                  </li>
                ))}
              </ol>
            </HoverPreview>
          )}
        </div>
      </div>
    </section>
  );
}
