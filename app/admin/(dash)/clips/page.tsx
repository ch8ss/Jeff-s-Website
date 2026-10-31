import { requireAdmin } from "@/lib/admin";
import { ListEditor } from "@/components/admin/ListEditor";

export default async function AdminClips() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("clips").select("*").order("sort_order");
  return (
    <ListEditor
      list="clips"
      title="Process clips"
      rows={data ?? []}
      fields={[
        { name: "video_path", label: "Video", type: "video", required: true },
        { name: "poster_path", label: "Cover image (shown before it plays)", type: "image", noAlt: true },
        { name: "caption", label: "Caption (also read out to screen-reader users)", wide: true },
        { name: "sort_order", label: "Order", type: "number" },
      ]}
    />
  );
}
