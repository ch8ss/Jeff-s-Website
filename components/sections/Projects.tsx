import Link from "next/link";
import type { Project } from "@/lib/types";
import { imageUrl } from "@/lib/storage";
import { SectionLabel } from "../ui/SectionLabel";
import { Marquee } from "../ui/Marquee";
import { HoverPreview } from "../ui/HoverPreview";
import { StatusTag } from "../ui/StatusTag";
import { Arrow } from "../ui/Arrow";

function dayMonth(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return {
    day: String(d.getUTCDate()).padStart(2, "0"),
    month: d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" }).toUpperCase(),
  };
}

export function Projects({ projects }: { projects: Project[] }) {
  const unique = Array.from(new Set(projects.map((p) => p.city.split(",")[0].trim())));
  // Repeat short lists so the marquee track is always wider than the viewport.
  const cities: string[] = [];
  while (unique.length && cities.length < 8) cities.push(...unique);
  const upcoming = [...projects].sort((a, b) => b.date.localeCompare(a.date));
  const year = upcoming[0]?.date.slice(0, 4) ?? "2026";

  return (
    <section id="projects" aria-labelledby="projects-title" data-bg="#100B1C" data-theme="dark" className="relative overflow-hidden bg-[#100B1C] py-24 text-text-light md:py-36">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <SectionLabel n="04">On the wall</SectionLabel>
        <h2 id="projects-title" className="display mt-6 overflow-hidden text-[clamp(3.5rem,9vw,8.5rem)]">
          <span data-reveal="up" className="block">
            Walls {year}
          </span>
        </h2>
      </div>

      <div aria-hidden="true" className="mt-12 space-y-2">
        <Marquee duration={45}>
          {cities.map((c, i) => (
            <span key={i} className={`display px-6 text-[clamp(4rem,10vw,9rem)] ${i % 2 ? "text-outline-light" : ""}`}>
              {c}
              <span className="px-6 text-accent-2">·</span>
            </span>
          ))}
        </Marquee>
        <Marquee duration={30} reverse>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="serif-italic px-6 text-3xl text-text-light/60 md:text-4xl">
              See you on the wall ·
            </span>
          ))}
        </Marquee>
      </div>

      <HoverPreview className="mx-auto mt-16 max-w-[1600px] px-5 md:px-10">
        <ul className="border-t border-white/10">
          {upcoming.map((p) => {
            const { day, month } = dayMonth(p.date);
            const isOpen = p.status === "open_slot";
            return (
              <li
                key={p.id}
                data-preview-src={imageUrl(p.image_path) ?? undefined}
                className="group grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 border-b border-white/10 px-2 py-6 transition-colors duration-300 hover:bg-glow/[0.08] md:grid-cols-[8rem_1.2fr_1.5fr_10rem_auto] md:px-4"
              >
                <p className="flex items-baseline gap-2">
                  <span className="display text-5xl transition-colors group-hover:text-accent md:text-6xl">{day}</span>
                  <span className="label opacity-60">{month}</span>
                </p>
                <p className="text-lg">{p.city}</p>
                <p className="col-span-2 opacity-70 md:col-span-1">{p.place}</p>
                <div>
                  <StatusTag status={p.status} />
                </div>
                <div className="md:justify-self-end">
                  {isOpen ? (
                    <Link href="/#contact" className="label inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-ink hover:bg-accent-hover">
                      Book this slot<span className="sr-only">: {p.city}, {dayMonth(p.date).day} {dayMonth(p.date).month}</span> <Arrow />
                    </Link>
                  ) : p.link_url ? (
                    <a href={p.link_url} target="_blank" rel="noopener noreferrer" className="label inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 hover:border-accent hover:text-accent">
                      See it<span className="sr-only"> on the map: {p.place}, {p.city}</span> <Arrow />
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </HoverPreview>
    </section>
  );
}
