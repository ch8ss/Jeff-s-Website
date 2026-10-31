"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Post } from "@/lib/types";
import { slugify } from "@/lib/format";
import { imageUrl } from "@/lib/storage";
import { deletePost, savePost, type PostInput } from "@/app/admin/actions";
import { uploadImage } from "./ImageUploader";
import { btn, btnGhost, card, input, label } from "./styles";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false, loading: () => <div className="h-[480px] animate-pulse rounded-xl bg-white/5" /> });

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [uploading, setUploading] = useState(false);
  const [f, setF] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content_md: post?.content_md ?? "",
    cover_path: post?.cover_path ?? "",
    cover_alt: post?.cover_alt ?? "",
    tags: (post?.tags ?? []).join(", "),
    seo_title: post?.seo_title ?? "",
    seo_description: post?.seo_description ?? "",
    published: post?.published ?? false,
    published_at: post?.published_at ?? null,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const coverAltMissing = !!f.cover_path && f.cover_alt.trim().length < 10;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const payload: PostInput = { ...f, id: post?.id, tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      const res = await savePost(payload);
      setMsg({ ok: res.ok, text: res.message ?? "" });
      if (res.ok && !post) router.replace(`/admin/blog/${res.id}`);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-5">
        <div>
          <label htmlFor="title" className={label}>Title *</label>
          <input id="title" required value={f.title} onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} className={`${input} text-lg`} />
        </div>
        <div data-color-mode="dark">
          <span className={label}>Content (Markdown) — live preview on the right</span>
          <MDEditor value={f.content_md} onChange={(v) => set("content_md", v ?? "")} height={520} preview="live" />
        </div>
      </div>

      <div className="space-y-5">
        <section className={`${card} space-y-4`}>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#A6FF4D]" />
            Published
          </label>
          <div>
            <label htmlFor="slug" className={label}>URL slug</label>
            <input id="slug" value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} className={input} />
          </div>
          <div>
            <label htmlFor="excerpt" className={label}>Excerpt</label>
            <textarea id="excerpt" rows={3} value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor="tags" className={label}>Tags (comma separated)</label>
            <input id="tags" value={f.tags} onChange={(e) => set("tags", e.target.value)} className={input} />
          </div>
        </section>

        <section className={`${card} space-y-3`}>
          <span className={label}>Cover image</span>
          {f.cover_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl(f.cover_path) ?? ""} alt="" className="aspect-video w-full rounded-xl object-cover" />
          ) : null}
          <input
            type="file"
            accept="image/*"
            aria-label="Upload cover image"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              try {
                const up = await uploadImage(file, "blog", "covers", f.slug || f.title);
                set("cover_path", up.storage_path);
              } catch (err) {
                setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed" });
              } finally {
                setUploading(false);
              }
            }}
            className="text-sm"
          />
          {uploading && <p className="text-xs text-accent">Uploading…</p>}
          {f.cover_path && (
            <div>
              <label htmlFor="cover_alt" className={label}>Cover alt text *</label>
              <input id="cover_alt" value={f.cover_alt} onChange={(e) => set("cover_alt", e.target.value)} placeholder="Describe what's in the image" className={input} aria-invalid={coverAltMissing} />
              {coverAltMissing && <p className="mt-1 text-xs text-danger">Required (10+ characters).</p>}
            </div>
          )}
        </section>

        <section className={`${card} space-y-4`}>
          <div>
            <div className="flex justify-between"><label htmlFor="seo_title" className={label}>SEO title</label><span className="text-xs text-white/40">{f.seo_title.length} / 60</span></div>
            <input id="seo_title" value={f.seo_title} onChange={(e) => set("seo_title", e.target.value)} className={input} />
          </div>
          <div>
            <div className="flex justify-between"><label htmlFor="seo_description" className={label}>SEO description</label><span className="text-xs text-white/40">{f.seo_description.length} / 155</span></div>
            <textarea id="seo_description" rows={3} value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} className={input} />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={pending || coverAltMissing || !f.title} className={btn}>{pending ? "Saving…" : "Save post"}</button>
          {post && <a href={`/blog/${post.slug}`} target="_blank" className={btnGhost}>View ↗</a>}
          {post && (
            <button type="button" className="ml-auto text-sm text-white/50 hover:text-danger" onClick={() => confirm("Delete this post?") && start(() => deletePost(post.id))}>
              Delete
            </button>
          )}
          {msg && <p role="status" className={`w-full text-sm ${msg.ok ? "text-emerald-300" : "text-danger"}`}>{msg.text}</p>}
        </div>
      </div>
    </form>
  );
}
