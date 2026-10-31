"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { scrollToId } from "./Motion";

const SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "story", label: "The story" },
  { id: "work", label: "Work" },
  { id: "walls", label: "Walls" },
  { id: "projects", label: "On the wall" },
  { id: "process", label: "Process" },
  { id: "contact", label: "Contact" },
];

export function SectionRail() {
  const pathname = usePathname();
  const [active, setActive] = useState("hero");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const onScroll = () => {
      const mid = window.innerHeight / 2;
      let current = els[0];
      for (const el of els) if (el.getBoundingClientRect().top <= mid) current = el;
      setActive(current.id);
      setDark(current.dataset.theme === "dark");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname !== "/") return null;
  return (
    <nav aria-label="Section navigation" className={`fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 xl:block ${dark ? "text-text-light" : "text-text-dark"}`}>
      <ol className="flex flex-col items-end gap-3">
        {SECTIONS.map((s, i) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`/#${s.id}`}
                onClick={(e) => {
                  if (scrollToId(s.id)) e.preventDefault();
                }}
                aria-current={on ? "true" : undefined}
                aria-label={`${String(i + 1).padStart(2, "0")} ${s.label}`}
                className={`label flex items-center gap-2 transition-colors ${on ? "text-accent" : "opacity-50 hover:opacity-100"}`}
              >
                {String(i + 1).padStart(2, "0")}
                <span className={`block h-px bg-current transition-all duration-500 ${on ? "w-8" : "w-3"}`} />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
