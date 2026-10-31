import { requireAdmin } from "@/lib/admin";
import { ListEditor } from "@/components/admin/ListEditor";

export default async function AdminTestimonials() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order");
  return (
    <ListEditor
      list="testimonials"
      title="Testimonials"
      rows={data ?? []}
      fields={[
        { name: "quote", label: "Quote", type: "textarea", required: true },
        { name: "source", label: "Source (e.g. Café owner, Hyderabad)", required: true },
        { name: "sort_order", label: "Order", type: "number" },
      ]}
    />
  );
}
