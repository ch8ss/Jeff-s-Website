"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/** Accent dot + trailing ring. Over [data-cursor="VIEW|DRAG|PLAY"] it becomes a filled bubble with the word. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const bubble = useRef(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    document.documentElement.classList.add("has-cursor");

    const xDot = gsap.quickTo(dot.current, "x", { duration: 0.06 });
    const yDot = gsap.quickTo(dot.current, "y", { duration: 0.06 });
    const xRing = gsap.quickTo(ring.current, "x", { duration: 0.22, ease: "power3.out" });
    const yRing = gsap.quickTo(ring.current, "y", { duration: 0.22, ease: "power3.out" });
    let last = { x: -100, y: -100 };

    const labelAt = (x: number, y: number) => {
      const target = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button, [role=button], input, textarea, select, label");
      const next = target ? (target.dataset.cursor ?? "") : null;
      bubble.current = !!next;
      setLabel(next);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setSeen(true);
      last = { x: e.clientX, y: e.clientY };
      xDot(e.clientX);
      yDot(e.clientY);
      // Keep the 84px bubble fully on screen.
      const r = bubble.current ? 42 : 0;
      xRing(Math.min(Math.max(e.clientX, r), window.innerWidth - r));
      yRing(Math.min(Math.max(e.clientY, r), window.innerHeight - r));
      labelAt(e.clientX, e.clientY);
    };
    // Content moves under a still mouse while scrolling, so re-check what's beneath it.
    const scroll = () => last.x >= 0 && labelAt(last.x, last.y);
    const hide = () => {
      bubble.current = false;
      setLabel(null);
      setSeen(false);
    };
    const out = (e: MouseEvent) => !e.relatedTarget && hide();
    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("mouseout", out);
    window.addEventListener("blur", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("mouseout", out);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  const big = !!label;
  const hover = label === "";

  return (
    <div aria-hidden="true" className={`cursor-root pointer-events-none fixed inset-0 z-[100] hidden transition-opacity ${seen ? "opacity-100" : "opacity-0"}`}>
      <div ref={dot} className="absolute top-0 left-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-accent" style={{ opacity: big ? 0 : 1 }} />
      <div ref={ring} className="absolute top-0 left-0">
        <div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[width,height,background-color,border-color] duration-300 ease-out ${
            big ? "h-[84px] w-[84px] border-transparent bg-accent" : hover ? "h-12 w-12 border border-accent bg-accent/10" : "h-8 w-8 border border-current opacity-60 mix-blend-difference text-ink"
          }`}
        >
          {big && <span className="label text-[10px] text-ink">{label}</span>}
        </div>
      </div>
    </div>
  );
}
