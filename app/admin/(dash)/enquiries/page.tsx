import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { deleteEnquiry } from "../../actions";
import { card } from "@/components/admin/styles";
import type { Enquiry } from "@/lib/types";

export default async function AdminEnquiries() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("enquiries").select("*, artwork:artworks(title, slug)").order("created_at", { ascending: false });
  const rows = (data ?? []) as (Enquiry & { artwork: { title: string; slug: string } | null })[];
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">Enquiries</h1>
      {!rows.length && <p className="text-white/50">No enquiries yet.</p>}
      <ul className="space-y-4">
        {rows.map((e) => (
          <li key={e.id} className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-medium">
                {e.name} <a href={`mailto:${e.email}`} className="ml-2 text-sm text-accent hover:underline">{e.email}</a>
              </p>
              <p className="text-xs text-white/50">{formatDate(e.created_at, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <p className="mt-1 text-xs uppercase tracking-widest text-white/50">
              {[e.topic, e.organisation, e.preferred_date && `Date: ${e.preferred_date}`, e.artwork?.title].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-white/85">{e.message}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: your ${e.topic ?? ""} enquiry`)}`} className="text-accent hover:underline">Reply</a>
              <form action={deleteEnquiry.bind(null, e.id)}><button className="text-white/50 hover:text-danger">Delete</button></form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
