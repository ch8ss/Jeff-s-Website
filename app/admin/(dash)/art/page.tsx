import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { imageUrl } from "@/lib/storage";
import { formatPrice, STATUS_LABEL } from "@/lib/format";
import { Toggle } from "@/components/admin/Toggle";
import type { Artwork } from "@/lib/types";

export default async function AdminArt() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("artworks").select("*, images:artwork_images(*)").order("created_at", { ascending: false });
  const arts = (data ?? []) as Artwork[];
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-4xl">Artworks</h1>
        <Link href="/admin/art/new" className="rounded-full bg-accent px-5 py-2.5 text-sm text-ink">+ New artwork</Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-widest text-white/50">
            <tr><th className="p-3">Artwork</th><th className="p-3">Status</th><th className="p-3">Price</th><th className="p-3">Published</th><th className="p-3">Featured</th><th className="p-3">For sale</th></tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {arts.map((a) => {
              const cover = a.images.find((i) => i.is_cover) ?? a.images[0];
              return (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="p-3">
                    <Link href={`/admin/art/${a.id}`} className="flex items-center gap-3 hover:text-accent">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {cover ? <img src={imageUrl(cover.storage_path) ?? ""} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <span className="h-12 w-12 rounded-lg bg-white/5" />}
                      <span><span className="block font-medium">{a.title}</span><span className="text-xs text-white/40">{a.code} · {a.category}</span></span>
                    </Link>
                  </td>
                  <td className="p-3">{STATUS_LABEL[a.status]}</td>
                  <td className="p-3">{a.is_for_sale ? formatPrice(a.price, a.currency) : "—"}</td>
                  <td className="p-3"><Toggle id={a.id} field="published" value={a.published} label={`Published: ${a.title}`} /></td>
                  <td className="p-3"><Toggle id={a.id} field="is_featured" value={a.is_featured} label={`Featured: ${a.title}`} /></td>
                  <td className="p-3"><Toggle id={a.id} field="is_for_sale" value={a.is_for_sale} label={`For sale: ${a.title}`} /></td>
                </tr>
              );
            })}
            {!arts.length && <tr><td colSpan={6} className="p-6 text-center text-white/50">No artworks yet. Add the first one.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
