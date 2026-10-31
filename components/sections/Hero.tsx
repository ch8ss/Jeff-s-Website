import Image from "next/image";
import type { Settings } from "@/lib/types";
import { imageUrl } from "@/lib/storage";
import { PillLink } from "../ui/PillButton";
import { PlayButton } from "../ui/PlayButton";

/**
 * Four rounded panels showing one wide photo sliced across them. The trick: panels are
 * position:static with a clip-path, so each panel's absolutely positioned image is laid out
 * against the whole row and stays perfectly aligned even while the hovered panel widens.
 */
export function Hero({ settings }: { settings: Settings }) {
  const letters = settings.artist_name.toUpperCase().slice(0, 4).split("");
  const words = settings.tagline_words;
  const src = imageUrl(settings.hero_image_path);
  const city = settings.city;

  return (
    <section id="hero" aria-label="Introduction" data-bg="#0C0A12" data-theme="dark" className="relative flex min-h-[100svh] flex-col bg-fog px-4 pt-20 pb-6 md:px-8 md:pt-24 lg:pr-16">
      <h1 className="sr-only">
        {settings.artist_name} — Wall Art &amp; Graffiti Artist{city ? ` in ${city}` : ""}
      </h1>

      <div data-hero-out className="relative grid flex-1 grid-cols-2 gap-2 md:flex md:h-[calc(100svh-12rem)] md:min-h-[440px] md:flex-none md:gap-3">
        {letters.map((letter, i) => (
          <div
            key={i}
            className="group min-h-[36svh] [clip-path:inset(0_round_18px)] md:min-h-0 md:flex-1 md:transition-[flex-grow] md:duration-700 md:ease-[cubic-bezier(.6,0,.2,1)] hover-wide:hover:flex-[2.1]"
            data-cursor="VIEW"
          >
            {/* Absolutely positioned wrapper: sized to the whole row, clipped by this panel's clip-path. */}
            <div className="absolute inset-0">
              {src && (
                <Image
                  src={src}
                  alt={i === 0 ? (settings.hero_image_alt ?? "") : ""}
                  aria-hidden={i === 0 ? undefined : true}
                  fill
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  sizes="100vw"
                  className="object-cover"
                />
              )}
              {/* Scrim so the letters and words stay readable on busy photos */}
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-ink/80 via-ink/35 to-transparent" />
            </div>
            <div aria-hidden="true" className="relative z-10 flex flex-col p-3 md:p-5">
              <span className="display text-text-light [text-shadow:0_4px_30px_rgba(8,7,12,0.55)]" style={{ fontSize: "clamp(5rem, 13vw, 14rem)" }}>
                {letter}
              </span>
              <span className="serif-italic -mt-1 text-2xl text-text-light transition-colors duration-500 [text-shadow:0_2px_14px_rgba(8,7,12,0.9)] group-hover:text-accent md:text-4xl">{words[i] ?? ""}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-5 text-text-light lg:grid lg:grid-cols-3">
        <div className="text-sm">
          <p className="label opacity-70">{["Muralist", "Graffiti artist", city].filter(Boolean).join(" · ")}</p>
          {settings.series_name && (
            <p className="mt-1.5">
              New series <span className="serif-italic text-xl text-accent-2">{settings.series_name}</span> — out now
            </p>
          )}
        </div>
        <div aria-hidden="true" className="hidden flex-col items-center gap-2 lg:flex">
          <span className="label opacity-60">Scroll</span>
          <span className="relative block h-10 w-px overflow-hidden bg-white/15">
            <span className="scroll-line absolute inset-0 bg-accent" style={{ animation: "scroll-line 2s cubic-bezier(.6,0,.2,1) infinite" }} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:justify-end">
          <PlayButton />
          <PillLink href="/for-sale">Shop art</PillLink>
        </div>
      </div>
    </section>
  );
}
