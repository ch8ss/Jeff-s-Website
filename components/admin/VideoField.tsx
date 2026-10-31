"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { imageUrl } from "@/lib/storage";
import { slugify } from "@/lib/format";
import { label as labelCls } from "./styles";

const MAX_MB = 50; // Supabase free-plan per-file limit

/** Uploads a video file as-is to the `site` bucket and stores its path in a hidden field. */
export function VideoField({ name, label, defaultPath, allowLink = false }: { name: string; label: string; defaultPath?: string | null; allowLink?: boolean }) {
  const [path, setPath] = useState(defaultPath ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isLink = /^https?:/.test(path) && !/\.(mp4|webm|mov)(\?|$)/i.test(path);
  const src = isLink ? null : imageUrl(path);
  return (
    <div className="space-y-2">
      <span className={labelCls}>{label}{allowLink ? "" : " *"}</span>
      <input type="hidden" name={name} value={path} />
      <div className="flex items-start gap-3">
        {src ? <video src={src} muted playsInline controls className="h-40 w-24 rounded-lg bg-black object-cover" /> : <div className="h-40 w-24 rounded-lg bg-white/5" />}
        <div className="space-y-2 text-sm">
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            aria-label={`Upload ${label}`}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > MAX_MB * 1024 * 1024) return setErr(`That file is over ${MAX_MB} MB. Trim or compress it first.`);
              setBusy(true);
              setErr(null);
              try {
                const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
                const key = `clips/${slugify(file.name.replace(/\.[^.]+$/, "")) || "clip"}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
                const { error } = await browserClient().storage.from("site").upload(key, file, { contentType: file.type || "video/mp4" });
                if (error) throw error;
                setPath(`site/${key}`);
              } catch (er) {
                setErr(er instanceof Error ? er.message : "Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          />
          <p className="text-xs text-white/40">MP4 works everywhere. Up to {MAX_MB} MB. Clips play muted on the site.</p>
          {allowLink && (
            <input
              value={path}
              onChange={(e) => setPath(e.target.value.trim())}
              placeholder="…or paste a YouTube / Instagram link"
              aria-label={`${label} link`}
              className="w-full rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-accent"
            />
          )}
          {busy && <p className="text-xs text-accent">Uploading…</p>}
          {err && <p className="text-xs text-danger">{err}</p>}
        </div>
      </div>
    </div>
  );
}
