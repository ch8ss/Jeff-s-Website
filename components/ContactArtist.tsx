"use client";

import { useState } from "react";
import { Arrow } from "./ui/Arrow";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {}
      }}
      className="label inline-flex min-h-11 items-center rounded-full border border-white/25 px-4 text-[11px] hover:border-accent hover:text-accent"
    >
      <span aria-live="polite">{copied ? "Copied ✓" : label}</span>
    </button>
  );
}

/** Opens the visitor's mail app AND shows a popover with the address, copy, and an "Open in Gmail" fallback. */
export function ContactArtist({ mailto, gmail, email, artworkId, label = "Contact artist", variant = "accent" }: { mailto: string; gmail: string; email: string; artworkId: string; label?: string; variant?: "accent" | "outline" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <a
        href={mailto}
        onClick={() => {
          setOpen(true);
          navigator.sendBeacon?.("/api/contact-click", JSON.stringify({ artwork_id: artworkId }));
        }}
        className={`label inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 transition-colors sm:w-auto ${variant === "accent" ? "bg-accent text-ink hover:bg-accent-hover" : "border border-white/30 hover:border-accent hover:text-accent"}`}
      >
        {label} <Arrow />
      </a>
      {open && (
        <div role="dialog" aria-label="Contact details" className="glass absolute top-full left-0 z-20 mt-3 w-full max-w-sm rounded-2xl p-5 shadow-2xl">
          <p className="text-sm text-text-light/80">No mail app opened? Email Jeff directly:</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="truncate font-medium">{email}</span>
            <CopyButton text={email} />
          </div>
          <a href={gmail} target="_blank" rel="noopener noreferrer" className="label mt-4 inline-flex items-center gap-2 text-accent hover:underline">
            Open in Gmail <Arrow />
          </a>
          <button type="button" onClick={() => setOpen(false)} className="label absolute top-3 right-3 opacity-60 hover:opacity-100" aria-label="Close contact details">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const text = encodeURIComponent(`${title} by Jeff`);
  const u = encodeURIComponent(url);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="label opacity-60">Share</span>
      <a className="label hover:text-accent" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${text}%20${u}`}>WhatsApp</a>
      <a className="label hover:text-accent" target="_blank" rel="noopener noreferrer" href={`https://x.com/intent/post?text=${text}&url=${u}`}>X</a>
      <CopyButton text={url} label="Copy link" />
    </div>
  );
}
