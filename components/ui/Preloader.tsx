"use client";

import { useEffect, useState } from "react";

/** First-visit preloader. Skipped on repeat visits in the same session and for reduced motion. */
export function Preloader({ tagline }: { tagline: string }) {
  const [state, setState] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Repeat visits / reduced motion are hidden before paint by the inline script + CSS below.
    if (reduced || sessionStorage.getItem("jeff-preloaded")) return;
    sessionStorage.setItem("jeff-preloaded", "1");
    const a = setTimeout(() => setState("leaving"), 1200);
    const b = setTimeout(() => setState("gone"), 2100);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  if (state === "gone") return null;
  return (
    <>
    {/* Hide before paint on repeat visits / reduced motion so there is no flash. */}
    <script
      dangerouslySetInnerHTML={{
        __html: `try{if(sessionStorage.getItem("jeff-preloaded")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.preloaded="1"}catch(e){}`,
      }}
    />
    <noscript>
      <style>{`.preloader{display:none}`}</style>
    </noscript>
    <div
      aria-hidden="true"
      className={`preloader fixed inset-0 z-[90] flex items-end bg-ink p-8 transition-transform duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)] md:p-14 ${
        state === "leaving" ? "-translate-y-full" : ""
      }`}
    >
      <p className="serif-italic max-w-md text-4xl leading-tight text-accent-2 md:text-6xl">{tagline}</p>
      <span className="label absolute right-8 bottom-8 text-muted md:right-14 md:bottom-14">Jeff — loading the wall</span>
    </div>
    </>
  );
}
