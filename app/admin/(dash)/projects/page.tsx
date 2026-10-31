import { requireAdmin } from "@/lib/admin";
import { ListEditor } from "@/components/admin/ListEditor";

export default async function AdminProjects() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("projects").select("*").order("date", { ascending: false });
  return (
    <ListEditor
      list="projects"
      title="Projects / wall log"
      rows={data ?? []}
      fields={[
        { name: "date", label: "Date", type: "date", required: true },
        { name: "city", label: "City", required: true },
        { name: "place", label: "Place / client" },
        { name: "status", label: "Status", type: "select", options: ["completed", "in_progress", "live_painting", "open_slot"] },
        { name: "link_url", label: "Map / link URL", type: "url", wide: true },
        { name: "image_path", label: "Preview image", type: "image" },
      ]}
    />
  );
}
