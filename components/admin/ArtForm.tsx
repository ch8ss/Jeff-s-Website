"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { Artwork } from "@/lib/types";
import { slugify } from "@/lib/format";
import { deleteArtwork, saveArtwork, type ArtworkInput } from "@/app/admin/actions";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import { btn, btnGhost, card, input, label } from "./styles";

const CATEGORIES = ["mural", "graffiti", "canvas", "print", "sketch", "other"] as const;
const STATUSES = ["available", "reserved", "sold", "not_for_sale"] as const;

function Counter({ value, max }: { value: string; max: number }) {
  return <span className={`text-xs ${value.length > max ? "text-danger" : "text-white/40"}`}>{value.length} / {max}</span>;
}

export function ArtForm({ art }: { art?: Artwork }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // New artworks get their id up front so uploads land in artworks/{id}/...
  const id = useMemo(() => art?.id ?? crypto.randomUUID(), [art?.id]);
  const [slugTouched, setSlugTouched] = useState(!!art);

  const [f, setF] = useState({
    title: art?.title ?? "",
    slug: art?.slug ?? "",
    code: art?.code ?? "",
    description: art?.description ?? "",
    category: art?.category ?? "canvas",
    medium: art?.medium ?? "",
    width_cm: art?.width_cm?.toString() ?? "",
    height_cm: art?.height_cm?.toString() ?? "",
    year: art?.year?.toString() ?? String(new Date().getFullYear()),
    city: art?.city ?? "",
    location_name: art?.location_name ?? "",
    map_url: art?.map_url ?? "",
    is_featured: art?.is_featured ?? false,
    is_for_sale: art?.is_for_sale ?? false,
    price: art?.price?.toString() ?? "",
    currency: art?.currency ?? "INR",
    status: art?.status ?? "available",
    sort_order: art?.sort_order?.toString() ?? "0",
    seo_title: art?.seo_title ?? "",
    seo_description: art?.seo_description ?? "",
    published: art?.published ?? true,
  });
  const [images, setImages] = useState<UploadedImage[]>(art?.images.map(({ storage_path, alt, width, height, is_cover, sort_order }) => ({ storage_path, alt, width, height, is_cover, sort_order })) ?? []);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const altMissing = images.some((i) => i.alt.trim().length < 10);
  const canSave = f.title.trim() && images.length > 0 && !altMissing;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    start(async () => {
      const payload = { ...f, id, images } as unknown as ArtworkInput;
      const res = await saveArtwork(payload);
      setMsg({ ok: res.ok, text: res.message ?? (res.ok ? "Saved" : "Error") });
      if (res.ok && !art) router.replace(`/admin/art/${res.id}`);
      else router.refresh();
    });
  };

  const text = (k: keyof typeof f, lbl: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={k} className={label}>{lbl}</label>
      <input id={k} value={String(f[k])} onChange={(e) => set(k, e.target.value as never)} className={input} {...props} />
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <section className={card}>
          <h2 className="mb-4 font-medium">Images</h2>
          <ImageUploader images={images} onChange={setImages} folder={id} nameHint={f.slug || f.title} />
        </section>

        <section className={`${card} grid gap-4 md:grid-cols-2`}>
          <div className="md:col-span-2">
            <label htmlFor="title" className={label}>Title *</label>
            <input
              id="title"
              required
              value={f.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="slug" className={label}>URL slug</label>
            <input id="slug" value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} className={input} />
            <p className="mt-1 text-xs text-white/40">/art/{f.slug || "…"}</p>
          </div>
          {text("code", "Code", { placeholder: "Auto (JF-001…)" })}
          <div className="md:col-span-2">
            <label htmlFor="description" className={label}>Description / story</label>
            <textarea id="description" rows={5} value={f.description} onChange={(e) => set("description", e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor="category" className={label}>Category</label>
            <select id="category" value={f.category} onChange={(e) => set("category", e.target.value as typeof f.category)} className={input}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {text("medium", "Medium", { placeholder: "Spray paint on brick" })}
          {text("width_cm", "Width (cm)", { inputMode: "decimal" })}
          {text("height_cm", "Height (cm)", { inputMode: "decimal" })}
          {text("year", "Year", { inputMode: "numeric" })}
          {text("city", "City")}
          {text("location_name", "Location name")}
          {text("map_url", "Map link", { type: "url" })}
        </section>
      </div>

      <div className="space-y-6">
        <section className={`${card} space-y-4`}>
          <h2 className="font-medium">Sale & visibility</h2>
          <div className="flex flex-wrap gap-5 text-sm">
            {(["published", "is_featured", "is_for_sale"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2">
                <input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-[#A6FF4D]" />
                {k === "published" ? "Published" : k === "is_featured" ? "Featured on home" : "For sale"}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            {text("price", "Price (blank = on request)", { inputMode: "decimal" })}
            {text("currency", "Currency")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="status" className={label}>Status</label>
              <select id="status" value={f.status} onChange={(e) => set("status", e.target.value as typeof f.status)} className={input}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            {text("sort_order", "Featured order", { inputMode: "numeric" })}
          </div>
        </section>

        <section className={`${card} space-y-4`}>
          <h2 className="font-medium">SEO</h2>
          <div>
            <div className="flex justify-between"><label htmlFor="seo_title" className={label}>SEO title</label><Counter value={f.seo_title} max={60} /></div>
            <input id="seo_title" value={f.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder={f.title} className={input} />
          </div>
          <div>
            <div className="flex justify-between"><label htmlFor="seo_description" className={label}>SEO description</label><Counter value={f.seo_description} max={155} /></div>
            <textarea id="seo_description" rows={3} value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} className={input} />
          </div>
        </section>

        <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#111318]/90 p-4 backdrop-blur">
          <button type="submit" disabled={!canSave || pending} className={btn}>{pending ? "Saving…" : "Save artwork"}</button>
          {art && (
            <>
              <a href={`/art/${art.slug}`} target="_blank" className={btnGhost}>View ↗</a>
              <button
                type="button"
                className="ml-auto text-sm text-white/50 hover:text-danger"
                onClick={() => confirm(`Delete "${art.title}" and its images? This can't be undone.`) && start(() => deleteArtwork(art.id))}
              >
                Delete
              </button>
            </>
          )}
          {!canSave && <p className="w-full text-xs text-white/50">{!images.length ? "Add at least one image." : altMissing ? "Every image needs alt text before you can save." : "Add a title."}</p>}
          {msg && <p role="status" className={`w-full text-sm ${msg.ok ? "text-emerald-300" : "text-danger"}`}>{msg.text}</p>}
        </div>
      </div>
    </form>
  );
}
