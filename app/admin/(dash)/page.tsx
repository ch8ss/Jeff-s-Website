import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { card } from "@/components/admin/styles";

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const [arts, posts, enq, clicks, enqCount] = await Promise.all([
    supabase.from("artworks").select("id, title, slug, is_for_sale, status"),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("enquiries").select("id, name, topic, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("contact_clicks").select("artwork_id"),
    supabase.from("enquiries").select("id", { count: "exact", head: true }),
  ]);
  const artworks = arts.data ?? [];
  const tally = new Map<string, number>();
  for (const c of clicks.data ?? []) tally.set(c.artwork_id, (tally.get(c.artwork_id) ?? 0) + 1);
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ art: artworks.find((a) => a.id === id), n }));

  const stats = [
    { label: "Artworks", value: artworks.length, href: "/admin/art" },
    { label: "For sale", value: artworks.filter((a) => a.is_for_sale && a.status === "available").length, href: "/admin/art" },
    { label: "Posts", value: posts.count ?? 0, href: "/admin/blog" },
    { label: "Enquiries", value: enqCount.count ?? 0, href: "/admin/enquiries" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display text-4xl">Dashboard</h1>
        <Link href="/admin/art/new" className="rounded-full bg-accent px-5 py-2.5 text-sm text-ink">+ New artwork</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`${card} hover:border-white/25`}>
            <p className="display text-4xl">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-white/50">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-3 font-medium">Latest enquiries</h2>
          <ul className="divide-y divide-white/10 text-sm">
            {(enq.data ?? []).map((e) => (
              <li key={e.id} className="flex justify-between py-2.5">
                <span>{e.name} <span className="text-white/50">· {e.topic}</span></span>
                <span className="text-white/50">{formatDate(e.created_at)}</span>
              </li>
            ))}
            {!enq.data?.length && <li className="py-2.5 text-white/50">No enquiries yet.</li>}
          </ul>
        </section>
        <section className={card}>
          <h2 className="mb-3 font-medium">Most “Contact artist” clicks</h2>
          <ul className="divide-y divide-white/10 text-sm">
            {top.map(({ art, n }) => art && (
              <li key={art.id} className="flex justify-between py-2.5">
                <Link href={`/admin/art/${art.id}`} className="hover:text-accent">{art.title}</Link>
                <span className="text-white/50">{n}</span>
              </li>
            ))}
            {!top.length && <li className="py-2.5 text-white/50">No clicks yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
