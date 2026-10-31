"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToId(id: string, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (window.__lenis) window.__lenis.scrollTo(el, immediate ? { offset: 0, immediate: true, force: true } : { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? "auto" : "smooth" });
  history.replaceState(null, "", `#${id}`);
  return true;
}

/**
 * One client island that wires up all scroll-driven motion via data attributes, so the
 * sections themselves stay server-rendered:
 *  - data-bg="#hex"          body background tweens to this colour while the section is in view
 *  - data-reveal="up"|"img"  heading slides up from a mask / image scales 1.1 → 1
 *  - data-words              children with .word go from muted to full colour while scrolling
 *  - data-count="40"         number counts up on enter (suffix kept from text)
 *  - data-parallax="0.2"     vertical parallax
 *  - data-hero-out           fades/scales out as the next section arrives
 */
export function Motion() {

  // Lenis (once)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return null;
}

/**
 * Rendered at the end of each page (inside the page segment) so it only runs once that
 * page's DOM has hydrated. Mutating not-yet-hydrated DOM causes hydration mismatches.
 */
export function ScrollEffects() {
  // Per-route scroll effects
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const root = document.documentElement;
    root.dataset.motion = reduced ? "reduced" : "full";

    const cleanups: (() => void)[] = [];
    if (window.location.hash) {
      // Arriving from another page (e.g. "Contact" on /blog): jump to the section, then re-align
      // after fonts, images and ScrollTrigger settle, unless the visitor has started scrolling.
      const id = window.location.hash.slice(1);
      let userScrolled = false;
      const stop = () => (userScrolled = true);
      const realign = () => !userScrolled && scrollToId(id, true);
      ["wheel", "touchstart", "keydown"].forEach((ev) => window.addEventListener(ev, stop, { once: true, passive: true }));
      requestAnimationFrame(realign);
      document.fonts?.ready.then(realign);
      window.addEventListener("load", realign, { once: true });
      const timers = [400, 900, 1600].map((ms) => window.setTimeout(realign, ms));
      cleanups.push(() => {
        timers.forEach(clearTimeout);
        window.removeEventListener("load", realign);
        ["wheel", "touchstart", "keydown"].forEach((ev) => window.removeEventListener(ev, stop));
      });
    } else {
      window.__lenis?.scrollTo(0, { immediate: true });
    }

    const ctx = gsap.context(() => {
      // Background colour shifts
      const bgSections = gsap.utils.toArray<HTMLElement>("[data-bg]");
      if (bgSections.length) {
        root.dataset.bgManaged = "true";
        gsap.set(document.body, { backgroundColor: bgSections[0].dataset.bg });
        bgSections.forEach((sec) => {
          const color = sec.dataset.bg!;
          ScrollTrigger.create({
            trigger: sec,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (self.isActive) gsap.to(document.body, { backgroundColor: color, duration: reduced ? 0 : 0.9, ease: "power2.out", overwrite: "auto" });
            },
          });
        });
      } else {
        delete root.dataset.bgManaged;
        document.body.style.backgroundColor = "";
      }

      // Counters (shown at final value when reduced)
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = parseFloat(el.dataset.count!);
        const suffix = el.dataset.suffix ?? "";
        if (reduced || Number.isNaN(target)) return;
        const obj = { v: 0 };
        el.textContent = `0${suffix}`;
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => (el.textContent = `${Math.round(obj.v)}${suffix}`),
        });
      });

      if (reduced) return;

      gsap.utils.toArray<HTMLElement>('[data-reveal="up"]').forEach((el) => {
        gsap.from(el, {
          yPercent: 110,
          opacity: 0,
          duration: 1.1,
          ease: "power4.out",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
        gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="img"]').forEach((el) => {
        gsap.fromTo(el, { scale: 1.1 }, { scale: 1, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      });

      gsap.utils.toArray<HTMLElement>("[data-words]").forEach((el) => {
        const words = el.querySelectorAll<HTMLElement>(".word");
        gsap.fromTo(
          words,
          { opacity: 0.18 },
          { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amt = parseFloat(el.dataset.parallax || "0.15");
        gsap.to(el, { yPercent: amt * 100, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      });

      gsap.utils.toArray<HTMLElement>("[data-hero-out]").forEach((el) => {
        gsap.to(el, { opacity: 0.2, scale: 0.94, ease: "none", scrollTrigger: { trigger: el, start: "center center", end: "bottom top", scrub: true } });
      });

      gsap.utils.toArray<HTMLElement>("[data-slide-out]").forEach((el) => {
        gsap.fromTo(el, { xPercent: 0 }, { xPercent: 20, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top 80%", end: "center 40%", scrub: true } });
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 600);
    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
      clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return null;
}
