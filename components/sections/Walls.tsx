import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/types";
import { imageUrl } from "@/lib/storage";
import { SectionLabel } from "../ui/SectionLabel";
import { PillLink } from "../ui/PillButton";
import { Masonry } from "../ui/Masonry";

export function Walls({ walls }: { walls: Artwork[] }) {
  const strips = walls.slice(0, 7);
  // The masonry continues where the strips stop (falls back to the start if there are few pieces).
  const grid = walls.length > strips.length + 3 ? walls.slice(strips.length, strips.length + 9) : walls.slice(0, 9);

  return (
    <section id="walls" aria-labelledby="walls-title" data-bg="#08070C" data-theme="dark" className="relative bg-ink px-5 py-24 text-text-light md:px-10 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <SectionLabel n="03">Walls</SectionLabel>
        <h2 id="walls-title" className="mt-6 flex flex-wrap items-baseline gap-x-5 overflow-hidden">
          <span data-reveal="up" className="display block text-[clamp(3.5rem,9vw,8.5rem)]">
            A collection of
          </span>
          <span data-reveal="up" className="serif-italic block text-[clamp(3.5rem,9vw,8.5rem)] leading-none text-accent-2">
            walls
          </span>
        </h2>

        {/* Accordion strips (desktop) / snap carousel (mobile) */}
        <ul className="-mx-5 mt-14 flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto px-5 pb-2 md:-mx-10 md:scroll-px-10 md:px-10 hover-wide:mx-0 hover-wide:h-[72vh] hover-wide:min-h-[520px] hover-wide:overflow-visible hover-wide:px-0 hover-wide:pb-0">
          {strips.map((a) => {
            const img = a.images[0];
            const caption = [a.title, a.city].filter(Boolean).join(" · ");
            return (
              <li
                key={a.id}
                className="group relative aspect-[3/4] w-[72vw] max-w-[420px] shrink-0 snap-start overflow-hidden rounded-[var(--radius-card)] sm:w-[44vw] hover-wide:aspect-auto hover-wide:h-auto hover-wide:w-auto hover-wide:max-w-none hover-wide:flex-1 hover-wide:shrink hover-wide:transition-[flex-grow] hover-wide:duration-700 hover-wide:ease-[cubic-bezier(.6,0,.2,1)] hover-wide:hover:flex-[4.5]"
              >
                <Link href={`/art/${a.slug}`} data-cursor="VIEW" className="absolute inset-0 block">
                  {img && (
                    <Image
                      src={imageUrl(img.storage_path)!}
                      alt={img.alt}
                      fill
                      sizes="(min-width:1024px) 45vw, (min-width:640px) 44vw, 72vw"
                      className="object-cover grayscale-[35%] transition-[filter,transform] duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  )}
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  {/* vertical caption */}
                  <span aria-hidden="true" className="absolute bottom-5 left-4 hidden rotate-180 whitespace-nowrap [writing-mode:vertical-rl] transition-opacity duration-300 hover-wide:block hover-wide:group-hover:opacity-0">
                    <span className="label text-[13px] [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">{caption}</span>
                  </span>
                  {/* horizontal caption */}
                  <span className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 transition-all delay-150 duration-500 hover-wide:translate-y-4 hover-wide:opacity-0 hover-wide:group-hover:translate-y-0 hover-wide:group-hover:opacity-100">
                    <span className="serif-italic text-2xl md:text-3xl">{caption}</span>
                    <span className="label opacity-70">{a.year}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Masonry break-out (balanced columns) */}
        <div className="mt-6 hover-wide:mt-2">
          <Masonry
            layouts={[
              { cols: 2, className: "flex md:hidden" },
              { cols: 3, className: "hidden md:flex" },
            ]}
            items={grid.flatMap((a) => {
              const img = a.images[0];
              if (!img) return [];
              return [{
                key: a.id,
                ratio: (img.height ?? 1200) / (img.width ?? 1000),
                node: (
                  <Link href={`/art/${a.slug}`} data-cursor="VIEW" className="group relative block overflow-hidden rounded-[var(--radius-card)]" data-reveal="fade">
                    <Image src={imageUrl(img.storage_path)!} alt={img.alt} width={img.width ?? 1000} height={img.height ?? 1200} sizes="(min-width:768px) 33vw, 50vw" className="h-auto w-full transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="label">{a.title}</span>
                      <span className="label capitalize opacity-80">{a.city ?? a.category}</span>
                    </span>
                  </Link>
                ),
              }];
            })}
          />
        </div>

        <div className="mt-12 flex justify-center">
          <PillLink href="/walls">See all work</PillLink>
        </div>
      </div>
    </section>
  );
}
