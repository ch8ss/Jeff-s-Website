"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { browserClient } from "@/lib/supabase/client";
import { imageUrl } from "@/lib/storage";
import { slugify } from "@/lib/format";
import { input } from "./styles";

export type UploadedImage = {
  storage_path: string;
  alt: string;
  width: number | null;
  height: number | null;
  is_cover: boolean;
  sort_order: number;
};

const ALT_HINT = "Describe what's in the image, e.g. 'Orange tiger mural on a brick wall in Banjara Hills'.";

async function readSize(file: File) {
  const bmp = await createImageBitmap(file);
  const size = { width: bmp.width, height: bmp.height };
  bmp.close();
  return size;
}

/** Compresses to WebP in the browser, uploads straight to Supabase Storage, and requires alt text per image. */
export async function uploadImage(file: File, bucket: string, folder: string, nameHint: string) {
  const compressed = await imageCompression(file, { maxWidthOrHeight: 2400, maxSizeMB: 1.2, fileType: "image/webp", initialQuality: 0.82, useWebWorker: true });
  const { width, height } = await readSize(compressed);
  const name = `${slugify(nameHint || file.name.replace(/\.[^.]+$/, "")) || "image"}-${crypto.randomUUID().slice(0, 8)}.webp`;
  const path = `${folder}/${name}`;
  const { error } = await browserClient().storage.from(bucket).upload(path, compressed, { contentType: "image/webp", upsert: false });
  if (error) throw error;
  return { storage_path: `${bucket}/${path}`, width, height };
}

export function ImageUploader({ images, onChange, folder, nameHint }: { images: UploadedImage[]; onChange: (imgs: UploadedImage[]) => void; folder: string; nameHint: string }) {
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = async (files: FileList | File[]) => {
    setErr(null);
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setBusy((b) => b + list.length);
    const added: UploadedImage[] = [];
    for (const f of list) {
      try {
        const up = await uploadImage(f, "artworks", folder, nameHint);
        added.push({ ...up, alt: "", is_cover: false, sort_order: 0 });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy((b) => b - 1);
      }
    }
    const next = [...images, ...added].map((img, i) => ({ ...img, sort_order: i }));
    if (!next.some((i) => i.is_cover) && next[0]) next[0].is_cover = true;
    onChange(next);
  };

  const update = (i: number, patch: Partial<UploadedImage>) => onChange(images.map((img, j) => (j === i ? { ...img, ...patch } : img)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((img, k) => ({ ...img, sort_order: k })));
  };
  const remove = async (i: number) => {
    const img = images[i];
    const next = images.filter((_, j) => j !== i).map((x, k) => ({ ...x, sort_order: k }));
    if (img.is_cover && next[0]) next[0].is_cover = true;
    onChange(next);
    if (img.storage_path.startsWith("artworks/")) await browserClient().storage.from("artworks").remove([img.storage_path.slice("artworks/".length)]);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center text-sm transition-colors ${over ? "border-accent bg-accent/10" : "border-white/15"}`}
      >
        <p>Drag & drop photos here</p>
        <p className="mt-1 text-white/50">They&apos;re converted to WebP in your browser before upload.</p>
        <button type="button" onClick={() => fileRef.current?.click()} className="mt-4 rounded-full border border-white/20 px-4 py-2 hover:border-white/50">
          Choose files
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && add(e.target.files)} />
        {busy > 0 && <p className="mt-3 text-accent">Uploading {busy}…</p>}
        {err && <p className="mt-3 text-danger">{err}</p>}
      </div>

      {images.length > 0 && (
        <ul className="mt-4 space-y-3">
          {images.map((img, i) => {
            const missing = img.alt.trim().length < 10;
            return (
              <li key={img.storage_path} className="flex gap-4 rounded-2xl border border-white/10 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(img.storage_path) ?? ""} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <label className="text-xs text-white/60" htmlFor={`alt-${i}`}>
                    Alt text <span className="text-danger">*</span>
                  </label>
                  <input
                    id={`alt-${i}`}
                    value={img.alt}
                    onChange={(e) => update(i, { alt: e.target.value })}
                    placeholder={ALT_HINT}
                    aria-invalid={missing}
                    className={`${input} mt-1 ${missing ? "border-danger/60" : ""}`}
                  />
                  {missing && <p className="mt-1 text-xs text-danger">Required (10+ characters). {ALT_HINT}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5">
                      <input type="radio" name="cover" checked={img.is_cover} onChange={() => onChange(images.map((x, j) => ({ ...x, is_cover: j === i })))} className="accent-[#A6FF4D]" />
                      Cover
                    </label>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-white/60 hover:text-white disabled:opacity-30" aria-label="Move image up">↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="text-white/60 hover:text-white disabled:opacity-30" aria-label="Move image down">↓</button>
                    <button type="button" onClick={() => remove(i)} className="text-white/60 hover:text-danger">Remove</button>
                    <span className="text-white/40">{img.width}×{img.height}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
