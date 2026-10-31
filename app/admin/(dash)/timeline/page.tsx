import { requireAdmin } from "@/lib/admin";
import { ListEditor } from "@/components/admin/ListEditor";

export default async function AdminTimeline() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("timeline").select("*").order("sort_order");
  return (
    <ListEditor
      list="timeline"
      title="Timeline"
      rows={data ?? []}
      fields={[
        { name: "year", label: "Year", type: "number", required: true },
        { name: "sort_order", label: "Order", type: "number" },
        { name: "text", label: "Milestone", required: true, wide: true },
        { name: "image_path", label: "Hover image", type: "image" },
      ]}
    />
  );
}
