import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { ArtForm } from "@/components/admin/ArtForm";
import type { Artwork } from "@/lib/types";

export default async function EditArt({ params }: PageProps<"/admin/art/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("artworks").select("*, images:artwork_images(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const art = data as Artwork;
  art.images.sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div>
      <h1 className="display mb-6 text-4xl">{art.title}</h1>
      <ArtForm art={art} />
    </div>
  );
}
