"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Artwork } from "@/lib/types";
import { imageUrl } from "@/lib/storage";
import { formatPrice, formatSize } from "@/lib/format";
import { SectionLabel } from "../ui/SectionLabel";
import { StatusTag } from "../ui/StatusTag";
import { Arrow } from "../ui/Arrow";
import { pillClass } from "../ui/PillButton";

const EASE_OUT = "cubic-bezier(.2,.8,.2,1)";

/** Card follows 1:1 up to 60% of its width, then gently resists. */
function rubberBand(offset: number, width: number) {
  const max = width * 0.6;
  const abs = Math.abs(offset);
  return Math.sign(offset) * (abs < max ? abs : max + (abs - max) * 0.35);
}

/** Speed (px/ms) over the last ~100ms before release. A pause before letting go reads as ~0. */
function releaseVelocity(samples: { t: number; x: number }[], releaseAt: number) {
  const recent = samples.filter((p) => releaseAt - p.t <= 100);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const dt = Math.max(16, last.t - first.t);
  return (last.x - first.x) / dt;
}

/**
 * Swipeable card stack. The drag writes transforms straight to the DOM (no React re-render per
 * pointer move), is clamped so the card never covers the info panel, only engages on a mostly
 * horizontal gesture (vertical swipes still scroll the page on touch), and every featured image
 * is mounted up front so swapping cards never flashes.
 */
export function Featured({ featured, others, title, artist }: { featured: Artwork[]; others: Artwork[]; title: string; artist: string }) {
  const [index, setIndexState] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  // Gesture + animation state lives in refs: pointer moves never trigger React renders.
  const g = useRef({
    x: 0, y: 0, base: 0, dx: 0, tracking: false, dragging: false, suppressClick: false, raf: 0,
    samples: [] as { t: number; x: number }[],
    busy: false, goal: 0, timers: [] as number[], pending: null as null | { target: number; dir: 1 | -1 },
    watchdog: 0, detach: null as null | (() => void), travel: 0,
  });
  // Single source of truth for the active card: card, image, info panel and list all read `index`.
  // The ref mirrors it for event handlers and timers that outlive a render.
  const indexRef = useRef(0);
  const setIndex = useCallback((i: number) => {
    indexRef.current = i;
    setIndexState(i);
  }, []);

  const setTransform = (dx: number, transition: string | null, opacity = 1) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = transition ?? "none";
    el.style.transform = `translate3d(${dx}px,0,0) rotate(${dx / 28}deg)`;
    el.style.opacity = String(opacity);
  };

  /** Where the card visually is right now (e.g. halfway through snapping back). */
  const currentOffset = () => {
    const el = cardRef.current;
    return el ? new DOMMatrix(getComputedStyle(el).transform).m41 : 0;
  };

  /**
   * Safety net: shortly after any gesture or animation ends, if nothing is in progress the card
   * must be at rest. If anything (a missed event, a hot reload, a browser quirk) left it offset,
   * glide it home.
   */
  const ensureRestSoon = useCallback(() => {
    const s = g.current;
    window.clearTimeout(s.watchdog);
    s.watchdog = window.setTimeout(() => {
      const el = cardRef.current;
      if (!el || s.tracking || s.busy) return;
      const m = new DOMMatrix(getComputedStyle(el).transform);
      if (Math.abs(m.m41) > 0.5 || Math.abs(m.m42) > 0.5 || Math.abs(m.a - 1) > 0.01 || getComputedStyle(el).opacity !== "1") {
        setTransform(0, `transform .4s ${EASE_OUT}, opacity .3s`);
      }
    }, 750);
  }, []);

  /** Jump any running change animation to its end state, so the card can be grabbed immediately. */
  const finishAnimation = useCallback(() => {
    const s = g.current;
    if (!s.busy) return;
    s.timers.forEach(clearTimeout);
    s.timers = [];
    s.pending = null;
    s.busy = false;
    if (indexRef.current !== s.goal) setIndex(s.goal);
    setTransform(0, null);
  }, [setIndex]);

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      const n = featured.length;
      const s = g.current;
      const run = (rawTarget: number, d: 1 | -1): void => {
        const el = cardRef.current;
        const target = ((rawTarget % n) + n) % n;
        if (!el) return;
        // Changes requested during an animation are queued (latest wins) instead of dropped.
        if (s.busy) return void (s.pending = { target, dir: d });
        if (target === indexRef.current) return setTransform(0, `transform .4s ${EASE_OUT}`);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setIndex(target);
          return setTransform(0, null);
        }
        s.busy = true;
        s.goal = target;
        // 1) throw the current card out
        setTransform(-d * el.offsetWidth * 0.9, `transform .22s cubic-bezier(.4,0,.8,.4), opacity .22s`, 0);
        s.timers = [
          window.setTimeout(() => {
            setIndex(target);
            // 2) bring the next one in from slightly behind
            el.style.transition = "none";
            el.style.transform = "translate3d(0,18px,0) scale(.94)";
            el.style.opacity = "0";
            void el.offsetWidth; // flush so the next transition runs
            el.style.transition = `transform .34s ${EASE_OUT}, opacity .22s ease-out`;
            el.style.transform = "translate3d(0,0,0) scale(1)";
            el.style.opacity = "1";
            s.timers.push(
              window.setTimeout(() => {
                s.busy = false;
                s.timers = [];
                const queued = s.pending;
                s.pending = null;
                if (queued) run(queued.target, queued.dir);
                else ensureRestSoon();
              }, 300),
            );
          }, 220),
        ];
      };
      run(next, dir);
    },
    [featured.length, setIndex, ensureRestSoon],
  );

  // Relative steps read the queued target so rapid clicks accumulate (3 clicks = 3 cards).
  const step = (d: 1 | -1) => goTo((g.current.pending?.target ?? (g.current.busy ? g.current.goal : indexRef.current)) + d, d);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType === "mouse") e.preventDefault(); // no text selection / native image drag
    const s = g.current;
    // Grabbing mid-animation finishes it instantly instead of ignoring the press.
    finishAnimation();
    const base = currentOffset();
    setTransform(base, null); // freeze a snap-back where it is, so the card doesn't jump
    Object.assign(s, { x: e.clientX, y: e.clientY, base, dx: base, tracking: true, dragging: false, suppressClick: false, travel: 0, samples: [{ t: e.timeStamp, x: e.clientX }] });
    // The release can happen anywhere (off the card, outside the window, after capture is lost):
    // catch it at the window too, so a gesture can never be left "held".
    s.detach?.();
    const id = e.pointerId;
    const width = e.currentTarget.offsetWidth;
    const up = (ev: PointerEvent) => ev.pointerId === id && endGesture(ev.clientX, ev.timeStamp, width, ev.type === "pointercancel");
    const blur = () => endGesture(null, performance.now(), width, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    window.addEventListener("blur", blur);
    s.detach = () => {
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
      window.removeEventListener("blur", blur);
      s.detach = null;
    };
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = g.current;
    if (!s.tracking) return;
    if (e.pointerType === "mouse" && e.buttons === 0) return endGesture(null, e.timeStamp, e.currentTarget.offsetWidth, true);
    let dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    s.travel = Math.max(s.travel, Math.hypot(dx, dy));
    if (!s.dragging) {
      const slop = e.pointerType === "mouse" ? 3 : 8;
      // Touch: a mostly vertical swipe is a page scroll, so let go of the card. A mouse can't
      // scroll by dragging, so angled mouse drags keep tracking (only the sideways part moves it).
      if (e.pointerType !== "mouse" && Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) {
        s.tracking = false; // it's a vertical scroll
        s.detach?.();
        if (s.base) setTransform(0, `transform .4s ${EASE_OUT}`);
        return;
      }
      if (Math.abs(dx) < slop) return;
      s.dragging = true;
      // Re-anchor at the slop boundary so the card starts moving smoothly instead of lurching.
      s.x += Math.sign(dx) * slop;
      dx = e.clientX - s.x;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // capture can be refused (e.g. pointer already gone); dragging still works without it
      }
    }
    s.samples.push({ t: e.timeStamp, x: e.clientX });
    if (s.samples.length > 20) s.samples.shift();
    s.dx = rubberBand(s.base + dx, e.currentTarget.offsetWidth);
    // One DOM write per frame, however fast pointer events arrive.
    if (!s.raf)
      s.raf = requestAnimationFrame(() => {
        s.raf = 0;
        if (s.tracking && s.dragging) setTransform(s.dx, null);
      });
  };

  /**
   * Ends the current gesture exactly once, however it ended. `cancelled` (lost pointer, window blur,
   * button already up) never changes the card; it only settles it back.
   */
  function endGesture(clientX: number | null, at: number, width: number, cancelled: boolean) {
    const s = g.current;
    if (!s.tracking) return;
    s.tracking = false;
    s.detach?.();
    if (s.raf) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    }
    if (!s.dragging) {
      // A real tap opens the artwork; a press that wandered more than a few pixels doesn't.
      if (s.travel > 6) {
        s.suppressClick = true;
        window.setTimeout(() => (s.suppressClick = false), 0);
      }
      // If it caught the card mid snap-back, let it finish settling.
      setTransform(0, `transform .4s ${EASE_OUT}`);
      ensureRestSoon();
      return;
    }
    s.dragging = false;
    s.suppressClick = true; // the click that follows a drag must not open the artwork
    window.setTimeout(() => (s.suppressClick = false), 0);
    if (cancelled || clientX === null) {
      setTransform(0, `transform .4s ${EASE_OUT}`);
      ensureRestSoon();
      return;
    }
    // One rule for every gesture: project where the card would land given its current speed
    // (like a phone carousel) and change if that passes ~18% of the card width. Slow drags, gentle
    // flicks and drags that ease to a stop all behave the same way.
    s.samples.push({ t: at, x: clientX });
    const v = releaseVelocity(s.samples, at);
    const projected = s.dx + v * 180;
    const threshold = Math.min(70, width * 0.18);
    if (projected <= -threshold) goTo(indexRef.current + 1, 1);
    else if (projected >= threshold) goTo(indexRef.current - 1, -1);
    else setTransform(0, `transform .4s ${EASE_OUT}`);
    ensureRestSoon();
  }

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => endGesture(e.clientX, e.timeStamp, e.currentTarget.offsetWidth, e.type === "pointercancel");

  // Trackpad: a two-finger sideways swipe moves the card like a drag. Needs a non-passive listener
  // so it can stop the browser's back/forward swipe and keep Lenis from treating it as a scroll.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const w = { offset: 0, locked: false, timer: 0 };
    const settle = () => {
      if (!w.locked && w.offset) setTransform(0, `transform .4s ${EASE_OUT}`);
      w.offset = 0;
      w.locked = false;
      ensureRestSoon();
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical: let the page scroll
      e.preventDefault();
      e.stopPropagation();
      window.clearTimeout(w.timer);
      w.timer = window.setTimeout(settle, 180); // gesture (and its momentum) has ended
      if (w.locked || g.current.busy || g.current.tracking) return; // ignore momentum after a swipe
      w.offset -= e.deltaX;
      setTransform(rubberBand(w.offset, el.offsetWidth), null);
      if (Math.abs(w.offset) > Math.min(90, el.offsetWidth * 0.22)) {
        w.locked = true;
        const dir = w.offset < 0 ? 1 : -1;
        w.offset = 0;
        goTo(indexRef.current + dir, dir);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(w.timer);
    };
  }, [goTo, ensureRestSoon]);

  // Never leave timers or window listeners behind after unmount.
  useEffect(() => {
    const s = g.current;
    return () => {
      s.timers.forEach(clearTimeout);
      window.clearTimeout(s.watchdog);
      s.detach?.();
    };
  }, []);

  const card = featured[index];
  if (!card) return null;
  const cover = card.images[0];
  const back = featured[(index + 1) % featured.length]?.images[0];
  const anyForSale = featured.some((a) => a.is_for_sale);

  return (
    <section id="work" aria-labelledby="work-title" data-bg="#1C1230" data-theme="dark" className="relative overflow-hidden bg-slate px-5 py-24 text-text-light md:px-10 md:py-32 xl:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-12 md:gap-14 lg:grid-cols-2 lg:items-center xl:grid-cols-[1fr_1.05fr_0.9fr]">
        {/* Intro: full width on phone/iPad/small laptop, its own column on wide screens */}
        <div className="lg:col-span-2 xl:col-span-1">
          <SectionLabel n="02">Work</SectionLabel>
          <h2 id="work-title" className="display text-outline-light mt-6 overflow-hidden text-[clamp(3.6rem,14vw,10rem)] lg:text-[clamp(5rem,9vw,8rem)] xl:text-[clamp(4.5rem,8.5vw,9rem)]">
            <span data-reveal="up" className="block">
              {title}
            </span>
          </h2>
          <p className="serif-italic mt-5 max-w-md text-xl text-text-light/85 md:text-2xl">
            {anyForSale ? "Originals and prints, straight from the studio." : "Walls, canvases and custom pieces, straight from the studio."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/for-sale" className={pillClass("accent")}>
              View all <Arrow />
            </Link>
            <Link href="/#contact" className={pillClass("ghost-light")}>
              Commissions
            </Link>
          </div>
        </div>

        {/* Card stack */}
        <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px] md:max-w-[420px] xl:max-w-[440px]">
          <div className="relative">
            {back && (
              <div data-slide-out aria-hidden="true" className="absolute inset-y-6 right-2 left-8 overflow-hidden rounded-[var(--radius-card)] border-4 border-white/85 shadow-2xl sm:inset-y-8">
                {featured.map((a, i) => {
                  const img = a.images[0];
                  if (!img) return null;
                  const on = i === (index + 1) % featured.length;
                  return <Image key={a.id} src={imageUrl(img.storage_path)!} alt="" fill sizes="(min-width:1280px) 440px, (min-width:640px) 420px, 90vw" className={`object-cover transition-opacity duration-500 ${on ? "opacity-80" : "opacity-0"}`} />;
                })}
              </div>
            )}
            <div
              ref={cardRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onLostPointerCapture={(e) => g.current.dragging && endGesture(null, e.timeStamp, e.currentTarget.offsetWidth, true)}
              onDragStart={(e) => e.preventDefault()}
              data-cursor="DRAG"
              className="relative z-10 touch-pan-y select-none rounded-[22px] border border-white/15 bg-[#2a1f40] p-2.5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] will-change-transform [-webkit-touch-callout:none] sm:p-3"
            >
              <Link
                href={`/art/${card.slug}`}
                draggable={false}
                onClick={(e) => g.current.suppressClick && e.preventDefault()}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  step(e.key === "ArrowRight" ? 1 : -1);
                }}
                className="relative block aspect-[4/5] overflow-hidden rounded-[16px] bg-ink"
                aria-label={`${card.title}, view artwork`}
              >
                {/* All featured images stay mounted; only the active one is visible. */}
                {featured.map((a, i) => {
                  const img = a.images[0];
                  if (!img) return null;
                  return (
                    <Image
                      key={a.id}
                      src={imageUrl(img.storage_path)!}
                      alt={i === index ? img.alt : ""}
                      aria-hidden={i === index ? undefined : true}
                      fill
                      sizes="(min-width:1280px) 440px, (min-width:640px) 420px, 90vw"
                      draggable={false}
                      className={`object-cover transition-opacity duration-200 ${i === index ? "opacity-100" : "opacity-0"}`}
                    />
                  );
                })}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70" />
                <span className="label absolute top-4 left-4 text-white">{artist}</span>
                <span className="label absolute top-4 right-4 text-white/80">
                  {String(index + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
                </span>
                <span className="display absolute right-4 bottom-4 left-4 text-[clamp(2.4rem,11vw,3.75rem)] text-white">{card.title}</span>
              </Link>
            </div>
          </div>

          <p className="label mt-6 flex items-center justify-center gap-3 text-text-light/80">
            <span aria-hidden="true" className="block h-px w-8 bg-current opacity-40" />
            <span className="hidden [@media(pointer:fine)]:inline">Drag or click</span>
            <span className="[@media(pointer:fine)]:hidden">Swipe or tap</span>
            <span aria-hidden="true" className="block h-px w-8 bg-current opacity-40" />
          </p>
        </div>

        {/* Info panel + list + other works */}
        <div className="relative z-20 mx-auto w-full max-w-xl lg:max-w-none">
          <div className="glass flex gap-4 rounded-[var(--radius-card)] p-3" aria-live="polite">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl">
              {cover && <Image src={imageUrl(cover.storage_path)!} alt="" fill sizes="80px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="label text-accent">Featured</p>
              <p className="display mt-1 truncate text-2xl">{card.title}</p>
              <p className="truncate text-xs opacity-70">{[card.medium, formatSize(card)].filter(Boolean).join(" · ")}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm">{card.is_for_sale ? (card.status === "sold" ? "Sold" : formatPrice(card.price, card.currency)) : card.category === "mural" || card.category === "graffiti" ? "Commission similar" : "Portfolio piece"}</span>
                <Link href={`/art/${card.slug}`} className="label rounded-full bg-accent px-3 py-1.5 text-[10px] text-ink">
                  View <Arrow />
                </Link>
              </div>
            </div>
          </div>

          <ol className="mt-6">
            {featured.map((a, i) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  aria-current={i === index ? "true" : undefined}
                  className={`flex w-full items-baseline gap-4 border-b border-white/10 py-3 text-left transition-colors ${i === index ? "text-accent" : "text-text-light/75 hover:text-white"}`}
                >
                  <span className="label w-5">{i + 1}</span>
                  <span className="min-w-0 truncate">{a.title}</span>
                  <span aria-hidden="true" className="hidden min-w-4 flex-1 border-b border-dotted border-current opacity-30 sm:block" />
                  <span className="shrink-0 text-right text-sm">
                    <span className="capitalize text-text-light/60">{a.category}</span>
                    <span aria-hidden="true" className="px-1.5 text-text-light/30">·</span>
                    {a.status === "sold" ? <span className="text-danger">Sold</span> : a.is_for_sale ? (a.status === "reserved" ? "Reserved" : formatPrice(a.price, a.currency)) : <span className="text-text-light/60">Portfolio</span>}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          {others.length > 0 && (
            <ul className="mt-8 grid grid-cols-3 gap-3">
              {others.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <Link href={`/art/${a.slug}`} data-cursor="VIEW" className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-xl">
                      <Image src={imageUrl(a.images[0]?.storage_path)!} alt={a.images[0]?.alt ?? a.title} fill sizes="150px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      {a.status === "sold" && <StatusTag status="sold" className="absolute top-1.5 left-1.5 !px-1.5 !py-0.5 text-[8px]" />}
                    </div>
                    <p className="mt-2 truncate text-sm">{a.title}</p>
                    <p className="text-[11px] capitalize opacity-60">{[a.category, a.year].filter(Boolean).join(" · ")}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
