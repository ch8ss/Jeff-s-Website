"use client";

import { useEffect, useRef, useState } from "react";
import { imageUrl } from "@/lib/storage";

export const OPEN_VIDEO_EVENT = "jeff:open-process-video";

export function openProcessVideo() {
  window.dispatchEvent(new Event(OPEN_VIDEO_EVENT));
}

/** Uploaded/self-hosted video files play in a <video>; everything else is embedded. */
function isFile(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || !/^https?:/.test(url);
}

/** Converts common YouTube / Instagram links into embeddable URLs. */
function toEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    if (u.hostname.includes("instagram.com")) return `${url.replace(/\/$/, "")}/embed`;
  } catch {}
  return url;
}

/** Single global modal; the iframe is only mounted after a click (keeps LCP + JS light). */
export function VideoModal({ url }: { url: string | null }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_VIDEO_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_VIDEO_EVENT, onOpen);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      window.__lenis?.stop();
    } else if (!open && d.open) d.close();
    if (!open) window.__lenis?.start();
  }, [open]);

  if (!url) return null;
  return (
    <dialog
      ref={dialog}
      onClose={() => setOpen(false)}
      onClick={(e) => e.target === dialog.current && setOpen(false)}
      aria-label="Process video"
      className="m-auto w-[min(1100px,92vw)] bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
    >
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close video"
          className="label rounded-full bg-white/10 px-4 py-2 text-ink hover:bg-accent"
        >
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div className={`relative overflow-hidden rounded-2xl bg-black ${isFile(url) ? "mx-auto aspect-[9/16] max-h-[82vh]" : "aspect-video"}`}>
        {open && isFile(url) ? (
          // Starts muted (clips may carry music); viewers can unmute with the controls.
          <video src={imageUrl(url) ?? url} controls autoPlay muted playsInline className="h-full w-full bg-black object-contain" aria-label="Jeff's process video" />
        ) : open && (
          <iframe
            src={toEmbed(url)}
            title="Jeff — from blank wall to art, process timelapse"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>
    </dialog>
  );
}
