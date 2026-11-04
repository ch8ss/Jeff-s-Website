"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Socials as SocialsT } from "@/lib/types";
import { Logo } from "./Logo";
import { Arrow } from "./Arrow";
import { scrollToId } from "./Motion";
import { NAV_LINKS } from "@/lib/nav";
import { SOCIAL_NAMES, socialEntries } from "@/lib/socials";



export function Nav({ name, socials }: { name: string; socials: SocialsT }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const probe = 36;
      let theme: string | undefined;
      document.querySelectorAll<HTMLElement>("[data-theme]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) theme = el.dataset.theme;
      });
      setDark(theme === "dark");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onHash = (e: React.MouseEvent, href: string) => {
    if (!href.startsWith("/#") || pathname !== "/") return;
    if (scrollToId(href.slice(2))) {
      e.preventDefault();
      setOpen(false);
    }
  };

  const fg = dark ? "text-text-light" : "text-text-dark";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,color] duration-500 ${fg} ${
        scrolled ? (dark ? "bg-ink/40 backdrop-blur-xl" : "bg-fog/50 backdrop-blur-xl") : "bg-transparent"
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${name}, home`}>
          <Logo />
          <span className="display text-2xl tracking-wide">{name}</span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={(e) => onHash(e, l.href)}
                className={`label relative py-1 text-[13px] transition-opacity hover:opacity-100 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:after:scale-x-100 ${
                  pathname.startsWith(l.href) && !l.href.includes("#") ? "opacity-100 text-accent" : "opacity-90"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            onClick={(e) => onHash(e, "/#contact")}
            className="label hidden items-center gap-2 rounded-full bg-accent px-5 py-3 text-ink transition-colors hover:bg-accent-hover sm:inline-flex"
          >
            Commission a wall <Arrow />
          </Link>
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-current/25 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden="true" className={`absolute h-px w-5 bg-current transition-transform ${open ? "rotate-45" : "-translate-y-1"}`} />
            <span aria-hidden="true" className={`absolute h-px w-5 bg-current transition-transform ${open ? "-rotate-45" : "translate-y-1"}`} />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-0 top-16 z-40 flex flex-col justify-between bg-ink px-6 pt-8 pb-10 text-text-light lg:hidden"
      >
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((l, i) => (
            <li key={l.href}>
              <Link href={l.href} onClick={(e) => { onHash(e, l.href); setOpen(false); }} className="display flex items-baseline gap-4 py-1 text-[13vw] leading-none hover:text-accent">
                <span className="label text-muted">{String(i + 1).padStart(2, "0")}</span>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-5">
          {socialEntries(socials).map(([k, u]) => (
            <li key={k}>
              <a href={u} target="_blank" rel="noopener noreferrer me" className="label text-muted hover:text-accent">
                {SOCIAL_NAMES[k] ?? k}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
