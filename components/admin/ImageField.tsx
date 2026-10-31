"use client";

import { useState } from "react";
import { imageUrl } from "@/lib/storage";
import { uploadImage } from "./ImageUploader";
import { input, label as labelCls } from "./styles";

/** Single image upload that writes its storage path into a hidden form field, with an alt text input. */
export function ImageField({ name, altName, label, defaultPath, defaultAlt, bucket = "site" }: { name: string; altName?: string; label: string; defaultPath?: string | null; defaultAlt?: string | null; bucket?: string }) {
  const [path, setPath] = useState(defaultPath ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const src = imageUrl(path);
  return (
    <div className="space-y-2">
      <span className={labelCls}>{label}</span>
      <input type="hidden" name={name} value={path} />
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt="" className="h-20 w-28 rounded-lg object-cover" /> : <div className="h-20 w-28 rounded-lg bg-white/5" />}
        <div className="space-y-2 text-sm">
          <input
            type="file"
            accept="image/*"
            aria-label={`Upload ${label}`}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setErr(null);
              try {
                setPath((await uploadImage(file, bucket, name.replace(/_path$/, ""), name)).storage_path);
              } catch (er) {
                setErr(er instanceof Error ? er.message : "Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          />
          {busy && <p className="text-xs text-accent">Uploading…</p>}
          {err && <p className="text-xs text-danger">{err}</p>}
          {path && <button type="button" onClick={() => setPath("")} className="text-xs text-white/50 hover:text-danger">Remove</button>}
        </div>
      </div>
      {altName && (
        <input name={altName} defaultValue={defaultAlt ?? ""} placeholder="Alt text: describe what's in the image (10+ characters)" className={input} aria-label={`${label} alt text`} />
      )}
    </div>
  );
}
