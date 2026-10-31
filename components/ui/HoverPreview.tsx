"use client";

import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";

/**
 * Wrap a list; any descendant with data-preview-src shows a floating image that follows the cursor.
 * Desktop/fine-pointer only. The image is decorative (the row text already describes it).
 */
export function HoverPreview({ children, className = "" }: { children: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const row = (e.target as HTMLElement).closest<HTMLElement>("[data-preview-src]");
    const next = row?.dataset.previewSrc || null;
    if (next !== src) setSrc(next);
    if (box.current) gsap.to(box.current, { x: e.clientX + 24, y: e.clientY - 90, duration: 0.5, ease: "power3.out" });
  };

  return (
    <div className={className} onPointerMove={onMove} onPointerLeave={() => setSrc(null)}>
      {children}
      <div
        ref={box}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-50 hidden h-44 w-36 overflow-hidden rounded-2xl shadow-2xl transition-opacity duration-300 md:block ${src ? "opacity-100" : "opacity-0"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src && <img src={src} alt="" className="h-full w-full object-cover" />}
      </div>
    </div>
  );
}
