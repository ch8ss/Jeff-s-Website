"use client";

import { openProcessVideo } from "./VideoModal";

export function PlayButton({ label = "Watch the process", variant = "inline" }: { label?: string; variant?: "inline" | "badge" }) {
  if (variant === "badge") {
    return (
      <button
        type="button"
        onClick={openProcessVideo}
        data-cursor="PLAY"
        aria-label="Play process video"
        className="group relative flex h-40 w-40 items-center justify-center rounded-full md:h-48 md:w-48"
      >
        <svg viewBox="0 0 200 200" aria-hidden="true" className="animate-spin-slow absolute inset-0 h-full w-full text-text-light" style={{ animation: "spin-slow 18s linear infinite" }}>
          <defs>
            <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text className="label" fill="currentColor" style={{ fontSize: 13 }}>
            <textPath href="#badge-circle" textLength="486" lengthAdjust="spacing">
              WATCH THE PROCESS • JEFF • WATCH THE PROCESS • JEFF •
            </textPath>
          </text>
        </svg>
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-ink transition-transform duration-500 group-hover:scale-110">
          <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" aria-hidden="true"><path d="M7 4v16l13-8z" fill="currentColor" /></svg>
        </span>
      </button>
    );
  }
  return (
    <button type="button" onClick={openProcessVideo} data-cursor="PLAY" className="group flex items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-ink transition-transform group-hover:scale-110">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" aria-hidden="true"><path d="M7 4v16l13-8z" fill="currentColor" /></svg>
      </span>
      <span className="label">{label}</span>
    </button>
  );
}
