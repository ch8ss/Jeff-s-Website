import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";

export default async function AdminBlog() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("posts").select("id, title, slug, published, published_at, updated_at").order("updated_at", { ascending: false });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-4xl">Blog</h1>
        <Link href="/admin/blog/new" className="rounded-full bg-accent px-5 py-2.5 text-sm text-ink">+ New post</Link>
      </div>
      <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
        {(data ?? []).map((p) => (
          <li key={p.id}>
            <Link href={`/admin/blog/${p.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.02]">
              <span className="font-medium">{p.title}</span>
              <span className="flex items-center gap-3 text-xs text-white/50">
                <span className={`rounded-full px-2 py-0.5 ${p.published ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10"}`}>{p.published ? "Published" : "Draft"}</span>
                {formatDate(p.updated_at)}
              </span>
            </Link>
          </li>
        ))}
        {!data?.length && <li className="p-6 text-center text-white/50">No posts yet.</li>}
      </ul>
    </div>
  );
}
